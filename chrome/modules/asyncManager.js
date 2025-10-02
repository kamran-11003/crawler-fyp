/**
 * Async Manager for handling timing, async behaviors, and network operations
 * Implements network idle detection, loading state detection, and animation completion waiting
 */

export class AsyncManager {
    constructor() {
        this.networkIdleTimeout = 2000; // 2 seconds of no network activity
        this.animationTimeout = 5000; // 5 seconds max for animations
        this.loadingTimeout = 10000; // 10 seconds max for loading
        this.observers = new Map();
        this.pendingRequests = new Set();
        this.isNetworkIdle = true;
        this.lastNetworkActivity = Date.now();
    }

    /**
     * Wait for network idle state
     */
    async waitForNetworkIdle(timeout = this.networkIdleTimeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;
            
            const checkNetworkIdle = () => {
                const now = Date.now();
                const timeSinceLastActivity = now - this.lastNetworkActivity;
                
                if (timeSinceLastActivity >= timeout) {
                    resolve({
                        idle: true,
                        duration: timeSinceLastActivity,
                        timestamp: now
                    });
                } else if (now - startTime > this.loadingTimeout) {
                    reject(new Error('Network idle timeout exceeded'));
                } else {
                    setTimeout(checkNetworkIdle, checkInterval);
                }
            };
            
            checkNetworkIdle();
        });
    }

    /**
     * Monitor network requests
     */
    startNetworkMonitoring() {
        // Monitor fetch requests
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const requestId = this.generateRequestId();
            this.pendingRequests.add(requestId);
            this.lastNetworkActivity = Date.now();
            this.isNetworkIdle = false;
            
            try {
                const response = await originalFetch(...args);
                return response;
            } finally {
                this.pendingRequests.delete(requestId);
                this.updateNetworkIdleState();
            }
        };

        // Monitor XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._requestId = this.generateRequestId();
            this._startTime = Date.now();
            return originalXHROpen.call(this, method, url, ...args);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._requestId) {
                this.pendingRequests.add(this._requestId);
                this.lastNetworkActivity = Date.now();
                this.isNetworkIdle = false;
                
                this.addEventListener('loadend', () => {
                    this.pendingRequests.delete(this._requestId);
                    this.updateNetworkIdleState();
                });
            }
            
            return originalXHRSend.call(this, ...args);
        };

        // Monitor WebSocket connections
        const originalWebSocket = window.WebSocket;
        window.WebSocket = function(url, ...args) {
            const ws = new originalWebSocket(url, ...args);
            const requestId = this.generateRequestId();
            this.pendingRequests.add(requestId);
            this.lastNetworkActivity = Date.now();
            this.isNetworkIdle = false;
            
            ws.addEventListener('close', () => {
                this.pendingRequests.delete(requestId);
                this.updateNetworkIdleState();
            });
            
            return ws;
        };
    }

    /**
     * Stop network monitoring
     */
    stopNetworkMonitoring() {
        // Restore original functions
        // Note: This is a simplified approach. In a real implementation,
        // you'd need to track and restore the original functions properly
        this.pendingRequests.clear();
        this.isNetworkIdle = true;
    }

    /**
     * Update network idle state
     */
    updateNetworkIdleState() {
        if (this.pendingRequests.size === 0) {
            const now = Date.now();
            const timeSinceLastActivity = now - this.lastNetworkActivity;
            
            if (timeSinceLastActivity >= this.networkIdleTimeout) {
                this.isNetworkIdle = true;
            }
        }
    }

    /**
     * Wait for loading spinners to disappear
     */
    async waitForLoadingComplete(timeout = this.loadingTimeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 200;
            
            const checkLoading = () => {
                const now = Date.now();
                
                // Check for common loading indicators
                const loadingSelectors = [
                    '.loading',
                    '.spinner',
                    '.loader',
                    '[data-loading]',
                    '[aria-busy="true"]',
                    '.fa-spinner',
                    '.fa-spin',
                    '.loading-spinner',
                    '.ajax-loading'
                ];
                
                const loadingElements = document.querySelectorAll(loadingSelectors.join(', '));
                const visibleLoadingElements = Array.from(loadingElements).filter(el => 
                    this.isElementVisible(el)
                );
                
                if (visibleLoadingElements.length === 0) {
                    resolve({
                        complete: true,
                        duration: now - startTime,
                        timestamp: now
                    });
                } else if (now - startTime > timeout) {
                    reject(new Error('Loading timeout exceeded'));
                } else {
                    setTimeout(checkLoading, checkInterval);
                }
            };
            
            checkLoading();
        });
    }

    /**
     * Wait for animations to complete
     */
    async waitForAnimationsComplete(timeout = this.animationTimeout) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 100;
            
            const checkAnimations = () => {
                const now = Date.now();
                
                // Check for elements with active animations
                const animatedElements = document.querySelectorAll('*');
                const activeAnimations = Array.from(animatedElements).filter(el => {
                    const style = window.getComputedStyle(el);
                    return style.animationPlayState === 'running' || 
                           style.transitionProperty !== 'none';
                });
                
                if (activeAnimations.length === 0) {
                    resolve({
                        complete: true,
                        duration: now - startTime,
                        timestamp: now
                    });
                } else if (now - startTime > timeout) {
                    reject(new Error('Animation timeout exceeded'));
                } else {
                    setTimeout(checkAnimations, checkInterval);
                }
            };
            
            checkAnimations();
        });
    }

    /**
     * Wait for lazy loaded content
     */
    async waitForLazyContent(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const checkInterval = 200;
            
            const checkLazyContent = () => {
                const now = Date.now();
                
                // Check for lazy loading elements
                const lazySelectors = [
                    '[data-lazy]',
                    '[data-defer]',
                    '[loading="lazy"]',
                    '.lazy-load',
                    '.lazy-image'
                ];
                
                const lazyElements = document.querySelectorAll(lazySelectors.join(', '));
                const unloadedElements = Array.from(lazyElements).filter(el => {
                    if (el.tagName === 'IMG') {
                        return !el.complete || el.naturalHeight === 0;
                    }
                    return !this.isElementLoaded(el);
                });
                
                if (unloadedElements.length === 0) {
                    resolve({
                        complete: true,
                        duration: now - startTime,
                        timestamp: now
                    });
                } else if (now - startTime > timeout) {
                    reject(new Error('Lazy loading timeout exceeded'));
                } else {
                    setTimeout(checkLazyContent, checkInterval);
                }
            };
            
            checkLazyContent();
        });
    }

    /**
     * Wait for DOM updates
     */
    async waitForDOMUpdates(timeout = 3000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            let lastMutationTime = startTime;
            
            // Create a MutationObserver to track DOM changes
            const observer = new MutationObserver((mutations) => {
                lastMutationTime = Date.now();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                characterData: true
            });
            
            const checkDOMStable = () => {
                const now = Date.now();
                const timeSinceLastMutation = now - lastMutationTime;
                
                if (timeSinceLastMutation >= 500) { // 500ms of no mutations
                    observer.disconnect();
                    resolve({
                        stable: true,
                        duration: now - startTime,
                        timestamp: now
                    });
                } else if (now - startTime > timeout) {
                    observer.disconnect();
                    reject(new Error('DOM update timeout exceeded'));
                } else {
                    setTimeout(checkDOMStable, 100);
                }
            };
            
            checkDOMStable();
        });
    }

    /**
     * Wait for all async operations to complete
     */
    async waitForAllAsync(timeout = 15000) {
        const startTime = Date.now();
        const results = {};
        
        try {
            // Wait for network idle
            results.networkIdle = await this.waitForNetworkIdle();
        } catch (error) {
            results.networkIdle = { error: error.message };
        }
        
        try {
            // Wait for loading to complete
            results.loading = await this.waitForLoadingComplete();
        } catch (error) {
            results.loading = { error: error.message };
        }
        
        try {
            // Wait for animations to complete
            results.animations = await this.waitForAnimationsComplete();
        } catch (error) {
            results.animations = { error: error.message };
        }
        
        try {
            // Wait for lazy content
            results.lazyContent = await this.waitForLazyContent();
        } catch (error) {
            results.lazyContent = { error: error.message };
        }
        
        try {
            // Wait for DOM updates
            results.domUpdates = await this.waitForDOMUpdates();
        } catch (error) {
            results.domUpdates = { error: error.message };
        }
        
        results.totalDuration = Date.now() - startTime;
        results.timestamp = Date.now();
        
        return results;
    }

    /**
     * Detect loading states
     */
    detectLoadingStates() {
        const loadingStates = {
            spinners: [],
            progressBars: [],
            skeletonScreens: [],
            loadingText: [],
            networkRequests: this.pendingRequests.size
        };
        
        // Detect spinners
        const spinnerSelectors = [
            '.spinner',
            '.loader',
            '.loading',
            '[data-loading]',
            '.fa-spinner',
            '.fa-spin'
        ];
        
        spinnerSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (this.isElementVisible(el)) {
                    loadingStates.spinners.push({
                        element: el,
                        selector: selector,
                        visible: true
                    });
                }
            });
        });
        
        // Detect progress bars
        const progressSelectors = [
            'progress',
            '.progress',
            '[role="progressbar"]',
            '.loading-bar'
        ];
        
        progressSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (this.isElementVisible(el)) {
                    loadingStates.progressBars.push({
                        element: el,
                        selector: selector,
                        value: el.value || el.getAttribute('aria-valuenow'),
                        max: el.max || el.getAttribute('aria-valuemax')
                    });
                }
            });
        });
        
        // Detect skeleton screens
        const skeletonSelectors = [
            '.skeleton',
            '.shimmer',
            '.placeholder',
            '[data-skeleton]'
        ];
        
        skeletonSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                if (this.isElementVisible(el)) {
                    loadingStates.skeletonScreens.push({
                        element: el,
                        selector: selector,
                        visible: true
                    });
                }
            });
        });
        
        // Detect loading text
        const loadingTextPatterns = [
            /loading/i,
            /please wait/i,
            /fetching/i,
            /processing/i,
            /saving/i,
            /uploading/i
        ];
        
        const allText = document.body.innerText;
        loadingTextPatterns.forEach(pattern => {
            if (pattern.test(allText)) {
                loadingStates.loadingText.push({
                    pattern: pattern.source,
                    found: true
                });
            }
        });
        
        return loadingStates;
    }

    /**
     * Monitor performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {
            networkRequests: this.pendingRequests.size,
            isNetworkIdle: this.isNetworkIdle,
            lastNetworkActivity: this.lastNetworkActivity,
            timeSinceLastActivity: Date.now() - this.lastNetworkActivity
        };
        
        // Add Performance API metrics if available
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
            metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
            metrics.firstPaint = timing.responseEnd - timing.navigationStart;
        }
        
        // Add Performance Observer metrics if available
        if (window.PerformanceObserver) {
            try {
                const observer = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (entry.entryType === 'navigation') {
                            metrics.navigation = {
                                type: entry.type,
                                duration: entry.duration,
                                transferSize: entry.transferSize
                            };
                        }
                    });
                });
                observer.observe({ entryTypes: ['navigation'] });
            } catch (error) {
                console.warn('Performance Observer not supported:', error);
            }
        }
        
        return metrics;
    }

    /**
     * Check if element is visible
     */
    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               style.opacity !== '0' &&
               element.offsetWidth > 0 &&
               element.offsetHeight > 0;
    }

    /**
     * Check if element is loaded
     */
    isElementLoaded(element) {
        if (element.tagName === 'IMG') {
            return element.complete && element.naturalHeight > 0;
        }
        
        if (element.tagName === 'VIDEO') {
            return element.readyState >= 2; // HAVE_CURRENT_DATA
        }
        
        if (element.tagName === 'AUDIO') {
            return element.readyState >= 2; // HAVE_CURRENT_DATA
        }
        
        return true; // Assume other elements are loaded
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get current async state
     */
    getAsyncState() {
        return {
            isNetworkIdle: this.isNetworkIdle,
            pendingRequests: this.pendingRequests.size,
            lastNetworkActivity: this.lastNetworkActivity,
            timeSinceLastActivity: Date.now() - this.lastNetworkActivity,
            loadingStates: this.detectLoadingStates(),
            performanceMetrics: this.getPerformanceMetrics()
        };
    }

    /**
     * Reset async state
     */
    reset() {
        this.pendingRequests.clear();
        this.isNetworkIdle = true;
        this.lastNetworkActivity = Date.now();
        this.observers.clear();
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        this.stopNetworkMonitoring();
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.pendingRequests.clear();
    }
}
