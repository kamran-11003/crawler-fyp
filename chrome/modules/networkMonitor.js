/**
 * Network Monitor for API interactions and request/response analysis
 * Implements XHR/fetch request interception, response analysis, and API-induced UI change detection
 */

export class NetworkMonitor {
    constructor() {
        this.requests = new Map();
        this.responses = new Map();
        this.apiCalls = [];
        this.uiChanges = [];
        this.originalFetch = null;
        this.originalXHR = null;
        this.isMonitoring = false;
        this.requestId = 0;
    }

    /**
     * Start monitoring network requests
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorFetch();
        this.monitorXHR();
        this.monitorWebSocket();
        this.monitorBeacon();
    }

    /**
     * Stop monitoring network requests
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.restoreOriginalMethods();
    }

    /**
     * Monitor fetch requests
     */
    monitorFetch() {
        this.originalFetch = window.fetch;
        const self = this;
        
        window.fetch = async function(...args) {
            const requestId = self.generateRequestId();
            const startTime = Date.now();
            
            // Parse request details
            const request = self.parseFetchRequest(args);
            request.id = requestId;
            request.startTime = startTime;
            request.type = 'fetch';
            
            self.requests.set(requestId, request);
            
            try {
                const response = await self.originalFetch.apply(this, args);
                
                // Parse response details
                const responseData = await self.parseFetchResponse(response);
                responseData.id = requestId;
                responseData.endTime = Date.now();
                responseData.duration = responseData.endTime - startTime;
                
                self.responses.set(requestId, responseData);
                self.apiCalls.push({
                    request: request,
                    response: responseData,
                    timestamp: startTime
                });
                
                // Check for UI changes
                self.detectUIChanges(request, responseData);
                
                return response;
            } catch (error) {
                const errorData = {
                    id: requestId,
                    error: error.message,
                    endTime: Date.now(),
                    duration: Date.now() - startTime
                };
                
                self.responses.set(requestId, errorData);
                self.apiCalls.push({
                    request: request,
                    response: errorData,
                    timestamp: startTime
                });
                
                throw error;
            }
        };
    }

    /**
     * Monitor XMLHttpRequest
     */
    monitorXHR() {
        const self = this;
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._requestId = self.generateRequestId();
            this._startTime = Date.now();
            this._method = method;
            this._url = url;
            
            return originalOpen.call(this, method, url, ...args);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            if (this._requestId) {
                const request = {
                    id: this._requestId,
                    method: this._method,
                    url: this._url,
                    data: data,
                    startTime: this._startTime,
                    type: 'xhr'
                };
                
                self.requests.set(this._requestId, request);
                
                this.addEventListener('loadend', function() {
                    const response = {
                        id: this._requestId,
                        status: this.status,
                        statusText: this.statusText,
                        responseText: this.responseText,
                        responseURL: this.responseURL,
                        endTime: Date.now(),
                        duration: Date.now() - this._startTime
                    };
                    
                    self.responses.set(this._requestId, response);
                    self.apiCalls.push({
                        request: request,
                        response: response,
                        timestamp: this._startTime
                    });
                    
                    // Check for UI changes
                    self.detectUIChanges(request, response);
                });
            }
            
            return originalSend.call(this, data);
        };
    }

    /**
     * Monitor WebSocket connections
     */
    monitorWebSocket() {
        const self = this;
        const originalWebSocket = window.WebSocket;
        
        window.WebSocket = function(url, ...args) {
            const ws = new originalWebSocket(url, ...args);
            const requestId = self.generateRequestId();
            const startTime = Date.now();
            
            const request = {
                id: requestId,
                url: url,
                startTime: startTime,
                type: 'websocket'
            };
            
            self.requests.set(requestId, request);
            
            ws.addEventListener('open', function() {
                const response = {
                    id: requestId,
                    status: 'open',
                    endTime: Date.now(),
                    duration: Date.now() - startTime
                };
                
                self.responses.set(requestId, response);
                self.apiCalls.push({
                    request: request,
                    response: response,
                    timestamp: startTime
                });
            });
            
            ws.addEventListener('close', function() {
                const response = {
                    id: requestId,
                    status: 'closed',
                    endTime: Date.now(),
                    duration: Date.now() - startTime
                };
                
                self.responses.set(requestId, response);
            });
            
            return ws;
        };
    }

    /**
     * Monitor Beacon API
     */
    monitorBeacon() {
        const self = this;
        const originalSendBeacon = navigator.sendBeacon;
        
        navigator.sendBeacon = function(url, data) {
            const requestId = self.generateRequestId();
            const startTime = Date.now();
            
            const request = {
                id: requestId,
                url: url,
                data: data,
                startTime: startTime,
                type: 'beacon'
            };
            
            self.requests.set(requestId, request);
            
            const result = originalSendBeacon.call(this, url, data);
            
            const response = {
                id: requestId,
                success: result,
                endTime: Date.now(),
                duration: Date.now() - startTime
            };
            
            self.responses.set(requestId, response);
            self.apiCalls.push({
                request: request,
                response: response,
                timestamp: startTime
            });
            
            return result;
        };
    }

    /**
     * Parse fetch request arguments
     */
    parseFetchRequest(args) {
        const [url, options = {}] = args;
        
        return {
            url: url,
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body,
            credentials: options.credentials,
            mode: options.mode,
            cache: options.cache,
            redirect: options.redirect
        };
    }

    /**
     * Parse fetch response
     */
    async parseFetchResponse(response) {
        const responseData = {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
            headers: {},
            body: null
        };
        
        // Parse headers
        response.headers.forEach((value, key) => {
            responseData.headers[key] = value;
        });
        
        // Try to parse body
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData.body = await response.clone().json();
            } else if (contentType && contentType.includes('text/')) {
                responseData.body = await response.clone().text();
            }
        } catch (error) {
            responseData.body = 'Unable to parse response body';
        }
        
        return responseData;
    }

    /**
     * Detect UI changes caused by API calls
     */
    detectUIChanges(request, response) {
        const changes = {
            requestId: request.id,
            timestamp: Date.now(),
            url: request.url,
            method: request.method,
            status: response.status,
            changes: []
        };
        
        // Check for DOM changes
        const domChanges = this.detectDOMChanges();
        if (domChanges.length > 0) {
            changes.changes.push({
                type: 'dom',
                count: domChanges.length,
                details: domChanges
            });
        }
        
        // Check for style changes
        const styleChanges = this.detectStyleChanges();
        if (styleChanges.length > 0) {
            changes.changes.push({
                type: 'style',
                count: styleChanges.length,
                details: styleChanges
            });
        }
        
        // Check for content changes
        const contentChanges = this.detectContentChanges();
        if (contentChanges.length > 0) {
            changes.changes.push({
                type: 'content',
                count: contentChanges.length,
                details: contentChanges
            });
        }
        
        if (changes.changes.length > 0) {
            this.uiChanges.push(changes);
        }
    }

    /**
     * Detect DOM changes
     */
    detectDOMChanges() {
        const changes = [];
        
        // Check for new elements
        const newElements = document.querySelectorAll('[data-new]');
        newElements.forEach(el => {
            changes.push({
                type: 'new_element',
                selector: this.getElementSelector(el),
                tagName: el.tagName,
                text: el.innerText.slice(0, 100)
            });
        });
        
        // Check for removed elements
        const removedElements = document.querySelectorAll('[data-removed]');
        removedElements.forEach(el => {
            changes.push({
                type: 'removed_element',
                selector: this.getElementSelector(el),
                tagName: el.tagName
            });
        });
        
        return changes;
    }

    /**
     * Detect style changes
     */
    detectStyleChanges() {
        const changes = [];
        
        // Check for elements with changed styles
        const styledElements = document.querySelectorAll('[style*="display: none"], [style*="visibility: hidden"]');
        styledElements.forEach(el => {
            changes.push({
                type: 'style_change',
                selector: this.getElementSelector(el),
                property: 'display/visibility',
                value: el.style.display || el.style.visibility
            });
        });
        
        return changes;
    }

    /**
     * Detect content changes
     */
    detectContentChanges() {
        const changes = [];
        
        // Check for elements with changed content
        const contentElements = document.querySelectorAll('[data-content-changed]');
        contentElements.forEach(el => {
            changes.push({
                type: 'content_change',
                selector: this.getElementSelector(el),
                oldContent: el.getAttribute('data-old-content'),
                newContent: el.innerText.slice(0, 100)
            });
        });
        
        return changes;
    }

    /**
     * Get element selector
     */
    getElementSelector(element) {
        if (element.id) {
            return `#${element.id}`;
        }
        
        if (element.className) {
            return `.${element.className.split(' ').join('.')}`;
        }
        
        return element.tagName.toLowerCase();
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${++this.requestId}_${Date.now()}`;
    }

    /**
     * Get API call statistics
     */
    getAPIStatistics() {
        const stats = {
            total: this.apiCalls.length,
            byMethod: {},
            byStatus: {},
            byType: {},
            averageDuration: 0,
            errors: 0,
            uiChanges: this.uiChanges.length
        };
        
        let totalDuration = 0;
        
        this.apiCalls.forEach(call => {
            const { request, response } = call;
            
            // Count by method
            stats.byMethod[request.method] = (stats.byMethod[request.method] || 0) + 1;
            
            // Count by status
            const status = response.status || 'unknown';
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
            
            // Count by type
            stats.byType[request.type] = (stats.byType[request.type] || 0) + 1;
            
            // Calculate duration
            if (response.duration) {
                totalDuration += response.duration;
            }
            
            // Count errors
            if (response.status >= 400 || response.error) {
                stats.errors++;
            }
        });
        
        stats.averageDuration = stats.total > 0 ? totalDuration / stats.total : 0;
        
        return stats;
    }

    /**
     * Get recent API calls
     */
    getRecentAPICalls(limit = 10) {
        return this.apiCalls
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    /**
     * Get API calls by URL pattern
     */
    getAPICallsByPattern(pattern) {
        const regex = new RegExp(pattern, 'i');
        return this.apiCalls.filter(call => 
            regex.test(call.request.url)
        );
    }

    /**
     * Get API calls by status
     */
    getAPICallsByStatus(status) {
        return this.apiCalls.filter(call => 
            call.response.status === status
        );
    }

    /**
     * Get API calls with UI changes
     */
    getAPICallsWithUIChanges() {
        return this.apiCalls.filter(call => 
            this.uiChanges.some(change => change.requestId === call.request.id)
        );
    }

    /**
     * Analyze API performance
     */
    analyzeAPIPerformance() {
        const analysis = {
            slowest: [],
            fastest: [],
            errorRate: 0,
            averageResponseTime: 0,
            peakRequests: 0,
            requestPatterns: {}
        };
        
        if (this.apiCalls.length === 0) {
            return analysis;
        }
        
        // Sort by duration
        const sortedCalls = this.apiCalls
            .filter(call => call.response.duration)
            .sort((a, b) => b.response.duration - a.response.duration);
        
        analysis.slowest = sortedCalls.slice(0, 5);
        analysis.fastest = sortedCalls.slice(-5);
        
        // Calculate error rate
        const errorCount = this.apiCalls.filter(call => 
            call.response.status >= 400 || call.response.error
        ).length;
        analysis.errorRate = (errorCount / this.apiCalls.length) * 100;
        
        // Calculate average response time
        const totalDuration = this.apiCalls.reduce((sum, call) => 
            sum + (call.response.duration || 0), 0
        );
        analysis.averageResponseTime = totalDuration / this.apiCalls.length;
        
        // Find peak requests (requests within 1 second)
        const timeWindows = {};
        this.apiCalls.forEach(call => {
            const window = Math.floor(call.timestamp / 1000);
            timeWindows[window] = (timeWindows[window] || 0) + 1;
        });
        analysis.peakRequests = Math.max(...Object.values(timeWindows));
        
        // Analyze request patterns
        this.apiCalls.forEach(call => {
            const url = call.request.url;
            const domain = new URL(url).hostname;
            analysis.requestPatterns[domain] = (analysis.requestPatterns[domain] || 0) + 1;
        });
        
        return analysis;
    }

    /**
     * Export API call data
     */
    exportAPIData() {
        return {
            requests: Array.from(this.requests.values()),
            responses: Array.from(this.responses.values()),
            apiCalls: this.apiCalls,
            uiChanges: this.uiChanges,
            statistics: this.getAPIStatistics(),
            performance: this.analyzeAPIPerformance(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear all data
     */
    clearData() {
        this.requests.clear();
        this.responses.clear();
        this.apiCalls = [];
        this.uiChanges = [];
        this.requestId = 0;
    }

    /**
     * Restore original methods
     */
    restoreOriginalMethods() {
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
        }
        
        if (this.originalXHR) {
            XMLHttpRequest.prototype.open = this.originalXHR.open;
            XMLHttpRequest.prototype.send = this.originalXHR.send;
        }
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalRequests: this.requests.size,
            totalResponses: this.responses.size,
            totalAPICalls: this.apiCalls.length,
            totalUIChanges: this.uiChanges.length
        };
    }
}
