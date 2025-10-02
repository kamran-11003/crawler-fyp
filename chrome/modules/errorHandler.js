/**
 * Error Handler for comprehensive error detection and handling
 * Implements 404/500 page detection, JS exception capture, invalid input testing, and empty state detection
 */

export class ErrorHandler {
    constructor() {
        this.errors = [];
        this.errorTypes = new Map();
        this.errorPatterns = new Map();
        this.isMonitoring = false;
        this.originalConsoleError = null;
        this.originalWindowError = null;
        this.originalUnhandledRejection = null;
    }

    /**
     * Start error monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorConsoleErrors();
        this.monitorWindowErrors();
        this.monitorUnhandledRejections();
        this.monitorNetworkErrors();
        this.monitorDOMErrors();
    }

    /**
     * Stop error monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.restoreOriginalMethods();
    }

    /**
     * Monitor console errors
     */
    monitorConsoleErrors() {
        this.originalConsoleError = console.error;
        const self = this;
        
        console.error = function(...args) {
            const error = {
                type: 'console_error',
                message: args.join(' '),
                timestamp: Date.now(),
                stack: new Error().stack
            };
            
            self.recordError(error);
            return self.originalConsoleError.apply(this, args);
        };
    }

    /**
     * Monitor window errors
     */
    monitorWindowErrors() {
        this.originalWindowError = window.onerror;
        const self = this;
        
        window.onerror = function(message, source, lineno, colno, error) {
            const errorData = {
                type: 'window_error',
                message: message,
                source: source,
                line: lineno,
                column: colno,
                error: error,
                timestamp: Date.now(),
                stack: error?.stack
            };
            
            self.recordError(errorData);
            
            if (self.originalWindowError) {
                return self.originalWindowError.call(this, message, source, lineno, colno, error);
            }
        };
    }

    /**
     * Monitor unhandled promise rejections
     */
    monitorUnhandledRejections() {
        this.originalUnhandledRejection = window.onunhandledrejection;
        const self = this;
        
        window.onunhandledrejection = function(event) {
            const error = {
                type: 'unhandled_rejection',
                reason: event.reason,
                promise: event.promise,
                timestamp: Date.now(),
                stack: event.reason?.stack
            };
            
            self.recordError(error);
            
            if (self.originalUnhandledRejection) {
                return self.originalUnhandledRejection.call(this, event);
            }
        };
    }

    /**
     * Monitor network errors
     */
    monitorNetworkErrors() {
        const self = this;
        
        // Monitor fetch errors
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            try {
                const response = await originalFetch.apply(this, args);
                
                if (!response.ok) {
                    const error = {
                        type: 'network_error',
                        url: args[0],
                        status: response.status,
                        statusText: response.statusText,
                        timestamp: Date.now()
                    };
                    
                    self.recordError(error);
                }
                
                return response;
            } catch (error) {
                const errorData = {
                    type: 'network_error',
                    url: args[0],
                    error: error.message,
                    timestamp: Date.now()
                };
                
                self.recordError(errorData);
                throw error;
            }
        };
    }

    /**
     * Monitor DOM errors
     */
    monitorDOMErrors() {
        const self = this;
        
        // Monitor DOM mutations for errors
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check for error indicators
                            if (self.isErrorElement(node)) {
                                const error = {
                                    type: 'dom_error',
                                    element: node,
                                    selector: self.getElementSelector(node),
                                    timestamp: Date.now()
                                };
                                
                                self.recordError(error);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Record an error
     */
    recordError(error) {
        this.errors.push(error);
        
        // Categorize error
        const type = error.type;
        this.errorTypes.set(type, (this.errorTypes.get(type) || 0) + 1);
        
        // Pattern analysis
        this.analyzeErrorPattern(error);
    }

    /**
     * Analyze error patterns
     */
    analyzeErrorPattern(error) {
        const patterns = [
            { pattern: /404/i, type: 'not_found' },
            { pattern: /500/i, type: 'server_error' },
            { pattern: /403/i, type: 'forbidden' },
            { pattern: /401/i, type: 'unauthorized' },
            { pattern: /timeout/i, type: 'timeout' },
            { pattern: /network/i, type: 'network' },
            { pattern: /cors/i, type: 'cors' },
            { pattern: /script/i, type: 'script' },
            { pattern: /syntax/i, type: 'syntax' },
            { pattern: /reference/i, type: 'reference' }
        ];
        
        const message = error.message || error.reason || '';
        patterns.forEach(({ pattern, type }) => {
            if (pattern.test(message)) {
                this.errorPatterns.set(type, (this.errorPatterns.get(type) || 0) + 1);
            }
        });
    }

    /**
     * Check if element is an error indicator
     */
    isErrorElement(element) {
        const errorSelectors = [
            '.error',
            '.alert-error',
            '.alert-danger',
            '.error-message',
            '.error-msg',
            '[data-error]',
            '[role="alert"]',
            '.notification-error',
            '.toast-error'
        ];
        
        return errorSelectors.some(selector => element.matches(selector));
    }

    /**
     * Detect 404 pages
     */
    detect404Pages() {
        const indicators = [
            '404',
            'not found',
            'page not found',
            'resource not found',
            'file not found',
            'document not found'
        ];
        
        const pageText = document.body.innerText.toLowerCase();
        const pageTitle = document.title.toLowerCase();
        
        return indicators.some(indicator => 
            pageText.includes(indicator) || pageTitle.includes(indicator)
        );
    }

    /**
     * Detect 500 pages
     */
    detect500Pages() {
        const indicators = [
            '500',
            'internal server error',
            'server error',
            'application error',
            'system error',
            'database error'
        ];
        
        const pageText = document.body.innerText.toLowerCase();
        const pageTitle = document.title.toLowerCase();
        
        return indicators.some(indicator => 
            pageText.includes(indicator) || pageTitle.includes(indicator)
        );
    }

    /**
     * Detect empty states
     */
    detectEmptyStates() {
        const emptyStates = [];
        
        // Check for empty lists
        const emptyLists = document.querySelectorAll('ul:empty, ol:empty, .list:empty, [data-list]:empty');
        emptyLists.forEach(list => {
            emptyStates.push({
                type: 'empty_list',
                element: list,
                selector: this.getElementSelector(list)
            });
        });
        
        // Check for empty containers
        const emptyContainers = document.querySelectorAll('.container:empty, .content:empty, .main:empty');
        emptyContainers.forEach(container => {
            emptyStates.push({
                type: 'empty_container',
                element: container,
                selector: this.getElementSelector(container)
            });
        });
        
        // Check for empty search results
        const emptyResults = document.querySelectorAll('.search-results:empty, .results:empty, .no-results');
        emptyResults.forEach(result => {
            emptyStates.push({
                type: 'empty_search_results',
                element: result,
                selector: this.getElementSelector(result)
            });
        });
        
        // Check for empty product lists
        const emptyProducts = document.querySelectorAll('.products:empty, .product-list:empty, .catalog:empty');
        emptyProducts.forEach(product => {
            emptyStates.push({
                type: 'empty_product_list',
                element: product,
                selector: this.getElementSelector(product)
            });
        });
        
        return emptyStates;
    }

    /**
     * Test form inputs with invalid data
     */
    testInvalidInputs() {
        const invalidTests = [];
        
        // Test email inputs
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            const invalidEmails = [
                'invalid-email',
                'test@',
                '@test.com',
                'test..test@test.com',
                'test@test..com'
            ];
            
            invalidEmails.forEach(email => {
                invalidTests.push({
                    element: input,
                    type: 'invalid_email',
                    value: email,
                    selector: this.getElementSelector(input)
                });
            });
        });
        
        // Test number inputs
        const numberInputs = document.querySelectorAll('input[type="number"]');
        numberInputs.forEach(input => {
            const invalidNumbers = [
                'abc',
                '12.34.56',
                '1e1000',
                'infinity',
                'nan'
            ];
            
            invalidNumbers.forEach(number => {
                invalidTests.push({
                    element: input,
                    type: 'invalid_number',
                    value: number,
                    selector: this.getElementSelector(input)
                });
            });
        });
        
        // Test required fields
        const requiredInputs = document.querySelectorAll('input[required], select[required], textarea[required]');
        requiredInputs.forEach(input => {
            invalidTests.push({
                element: input,
                type: 'empty_required_field',
                value: '',
                selector: this.getElementSelector(input)
            });
        });
        
        return invalidTests;
    }

    /**
     * Detect infinite redirects
     */
    detectInfiniteRedirects() {
        const redirects = [];
        const maxRedirects = 10;
        
        // Check for redirect loops in URL
        const currentUrl = window.location.href;
        const redirectPatterns = [
            /redirect/i,
            /forward/i,
            /loop/i,
            /infinite/i
        ];
        
        if (redirectPatterns.some(pattern => pattern.test(currentUrl))) {
            redirects.push({
                type: 'potential_redirect_loop',
                url: currentUrl,
                timestamp: Date.now()
            });
        }
        
        // Check for meta refresh redirects
        const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
        if (metaRefresh) {
            const content = metaRefresh.getAttribute('content');
            if (content && content.includes('url=')) {
                redirects.push({
                    type: 'meta_refresh_redirect',
                    content: content,
                    timestamp: Date.now()
                });
            }
        }
        
        return redirects;
    }

    /**
     * Detect missing media
     */
    detectMissingMedia() {
        const missingMedia = [];
        
        // Check for broken images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.naturalWidth === 0 || img.naturalHeight === 0) {
                missingMedia.push({
                    type: 'broken_image',
                    element: img,
                    src: img.src,
                    selector: this.getElementSelector(img)
                });
            }
        });
        
        // Check for broken videos
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.readyState === 0) {
                missingMedia.push({
                    type: 'broken_video',
                    element: video,
                    src: video.src,
                    selector: this.getElementSelector(video)
                });
            }
        });
        
        // Check for broken audio
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            if (audio.readyState === 0) {
                missingMedia.push({
                    type: 'broken_audio',
                    element: audio,
                    src: audio.src,
                    selector: this.getElementSelector(audio)
                });
            }
        });
        
        return missingMedia;
    }

    /**
     * Detect broken scripts
     */
    detectBrokenScripts() {
        const brokenScripts = [];
        
        // Check for script errors
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            // This is a simplified check - in reality, you'd need more sophisticated detection
            if (script.src && !script.src.startsWith('data:')) {
                brokenScripts.push({
                    type: 'external_script',
                    element: script,
                    src: script.src,
                    selector: this.getElementSelector(script)
                });
            }
        });
        
        return brokenScripts;
    }

    /**
     * Get error statistics
     */
    getErrorStatistics() {
        const stats = {
            total: this.errors.length,
            byType: Object.fromEntries(this.errorTypes),
            byPattern: Object.fromEntries(this.errorPatterns),
            recent: this.errors.slice(-10),
            errorRate: this.calculateErrorRate(),
            criticalErrors: this.getCriticalErrors()
        };
        
        return stats;
    }

    /**
     * Calculate error rate
     */
    calculateErrorRate() {
        const timeWindow = 60000; // 1 minute
        const now = Date.now();
        const recentErrors = this.errors.filter(error => 
            now - error.timestamp < timeWindow
        );
        
        return recentErrors.length;
    }

    /**
     * Get critical errors
     */
    getCriticalErrors() {
        const criticalPatterns = [
            '500',
            'internal server error',
            'database error',
            'system error',
            'fatal error'
        ];
        
        return this.errors.filter(error => {
            const message = error.message || error.reason || '';
            return criticalPatterns.some(pattern => 
                message.toLowerCase().includes(pattern)
            );
        });
    }

    /**
     * Get element selector
     */
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className) {
            try {
                if (element.classList && element.classList.length) {
                    return `.${Array.from(element.classList).join('.')}`;
                }
                if (typeof element.className === 'string') {
                    return `.${element.className.split(/\s+/).filter(Boolean).join('.')}`;
                }
                if (element.className && typeof element.className.baseVal === 'string') {
                    return `.${element.className.baseVal.split(/\s+/).filter(Boolean).join('.')}`;
                }
            } catch (_) {}
            return element.tagName ? element.tagName.toLowerCase() : 'div';
        }
        
        return element.tagName.toLowerCase();
    }

    /**
     * Export error data
     */
    exportErrorData() {
        return {
            errors: this.errors,
            statistics: this.getErrorStatistics(),
            emptyStates: this.detectEmptyStates(),
            invalidInputs: this.testInvalidInputs(),
            redirects: this.detectInfiniteRedirects(),
            missingMedia: this.detectMissingMedia(),
            brokenScripts: this.detectBrokenScripts(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear all error data
     */
    clearData() {
        this.errors = [];
        this.errorTypes.clear();
        this.errorPatterns.clear();
    }

    /**
     * Restore original methods
     */
    restoreOriginalMethods() {
        if (this.originalConsoleError) {
            console.error = this.originalConsoleError;
        }
        
        if (this.originalWindowError) {
            window.onerror = this.originalWindowError;
        }
        
        if (this.originalUnhandledRejection) {
            window.onunhandledrejection = this.originalUnhandledRejection;
        }
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalErrors: this.errors.length,
            errorTypes: this.errorTypes.size,
            errorPatterns: this.errorPatterns.size
        };
    }
}
