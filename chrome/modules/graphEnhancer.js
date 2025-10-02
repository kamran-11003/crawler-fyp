/**
 * Graph Enhancer for enhanced metadata capture, console log capture, network log capture, and graph pruning
 * Implements comprehensive graph representation with advanced metadata and optimization
 */

export class GraphEnhancer {
    constructor() {
        this.consoleLogs = [];
        this.networkLogs = [];
        this.metadata = new Map();
        this.graphData = { nodes: [], edges: [] };
        this.pruningRules = [];
        this.enhancementHistory = [];
    }

    /**
     * Initialize graph enhancer
     */
    initialize() {
        this.setupConsoleLogCapture();
        this.setupNetworkLogCapture();
        this.setupMetadataCapture();
        this.setupGraphPruning();
    }

    /**
     * Setup console log capture
     */
    setupConsoleLogCapture() {
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info,
            debug: console.debug
        };

        const captureLog = (level, args) => {
            const logEntry = {
                timestamp: Date.now(),
                level: level,
                message: Array.from(args).map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                ).join(' '),
                stack: new Error().stack,
                url: window.location.href
            };
            
            this.consoleLogs.push(logEntry);
            
            // Call original console method
            originalConsole[level].apply(console, args);
        };

        console.log = (...args) => captureLog('log', args);
        console.error = (...args) => captureLog('error', args);
        console.warn = (...args) => captureLog('warn', args);
        console.info = (...args) => captureLog('info', args);
        console.debug = (...args) => captureLog('debug', args);
    }

    /**
     * Setup network log capture
     */
    setupNetworkLogCapture() {
        // Capture XMLHttpRequest
        const originalXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new originalXHR();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;
            
            xhr.open = function(method, url, async, user, password) {
                this._method = method;
                this._url = url;
                this._async = async;
                this._user = user;
                this._password = password;
                return originalOpen.apply(this, arguments);
            };
            
            xhr.send = function(data) {
                const requestId = Date.now() + Math.random();
                this._requestId = requestId;
                
                const requestLog = {
                    id: requestId,
                    timestamp: Date.now(),
                    type: 'xhr',
                    method: this._method,
                    url: this._url,
                    data: data,
                    status: null,
                    response: null,
                    headers: {}
                };
                
                this.addEventListener('load', () => {
                    requestLog.status = this.status;
                    requestLog.response = this.responseText;
                    requestLog.headers = this.getAllResponseHeaders();
                    this.networkLogs.push(requestLog);
                });
                
                this.addEventListener('error', () => {
                    requestLog.status = this.status;
                    requestLog.error = 'Network error';
                    this.networkLogs.push(requestLog);
                });
                
                return originalSend.apply(this, arguments);
            };
            
            return xhr;
        };

        // Capture fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options = {}) {
            const requestId = Date.now() + Math.random();
            const requestLog = {
                id: requestId,
                timestamp: Date.now(),
                type: 'fetch',
                method: options.method || 'GET',
                url: url,
                headers: options.headers || {},
                body: options.body,
                status: null,
                response: null
            };
            
            return originalFetch(url, options)
                .then(response => {
                    requestLog.status = response.status;
                    requestLog.headers = response.headers;
                    
                    return response.clone().text().then(text => {
                        requestLog.response = text;
                        this.networkLogs.push(requestLog);
                        return response;
                    });
                })
                .catch(error => {
                    requestLog.error = error.message;
                    this.networkLogs.push(requestLog);
                    throw error;
                });
        };
    }

    /**
     * Setup metadata capture
     */
    setupMetadataCapture() {
        // Capture page metadata
        this.capturePageMetadata();
        
        // Capture performance metrics
        this.capturePerformanceMetrics();
        
        // Capture accessibility metadata
        this.captureAccessibilityMetadata();
        
        // Capture responsive metadata
        this.captureResponsiveMetadata();
    }

    /**
     * Capture page metadata
     */
    capturePageMetadata() {
        const pageMetadata = {
            url: window.location.href,
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.content || '',
            keywords: document.querySelector('meta[name="keywords"]')?.content || '',
            viewport: document.querySelector('meta[name="viewport"]')?.content || '',
            robots: document.querySelector('meta[name="robots"]')?.content || '',
            canonical: document.querySelector('link[rel="canonical"]')?.href || '',
            language: document.documentElement.lang || '',
            charset: document.characterSet || '',
            lastModified: document.lastModified,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };
        
        this.metadata.set('page', pageMetadata);
    }

    /**
     * Capture performance metrics
     */
    capturePerformanceMetrics() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const navigation = window.performance.navigation;
            
            const performanceMetrics = {
                navigationStart: timing.navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                loadComplete: timing.loadEventEnd - timing.navigationStart,
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                largestContentfulPaint: this.getLargestContentfulPaint(),
                cumulativeLayoutShift: this.getCumulativeLayoutShift(),
                firstInputDelay: this.getFirstInputDelay(),
                navigationType: navigation.type,
                redirectCount: navigation.redirectCount
            };
            
            this.metadata.set('performance', performanceMetrics);
        }
    }

    /**
     * Get first paint metric
     */
    getFirstPaint() {
        const paintEntries = window.performance.getEntriesByType('paint');
        const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
        return firstPaint ? firstPaint.startTime : null;
    }

    /**
     * Get first contentful paint metric
     */
    getFirstContentfulPaint() {
        const paintEntries = window.performance.getEntriesByType('paint');
        const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        return firstContentfulPaint ? firstContentfulPaint.startTime : null;
    }

    /**
     * Get largest contentful paint metric
     */
    getLargestContentfulPaint() {
        const lcpEntries = window.performance.getEntriesByType('largest-contentful-paint');
        return lcpEntries.length > 0 ? lcpEntries[lcpEntries.length - 1].startTime : null;
    }

    /**
     * Get cumulative layout shift metric
     */
    getCumulativeLayoutShift() {
        const clsEntries = window.performance.getEntriesByType('layout-shift');
        return clsEntries.reduce((sum, entry) => sum + entry.value, 0);
    }

    /**
     * Get first input delay metric
     */
    getFirstInputDelay() {
        const fidEntries = window.performance.getEntriesByType('first-input');
        return fidEntries.length > 0 ? fidEntries[0].processingStart - fidEntries[0].startTime : null;
    }

    /**
     * Capture accessibility metadata
     */
    captureAccessibilityMetadata() {
        const accessibilityMetadata = {
            ariaElements: document.querySelectorAll('[role], [aria-label], [aria-describedby]').length,
            headingStructure: this.analyzeHeadingStructure(),
            colorContrast: this.analyzeColorContrast(),
            keyboardNavigation: this.analyzeKeyboardNavigation(),
            screenReaderSupport: this.analyzeScreenReaderSupport()
        };
        
        this.metadata.set('accessibility', accessibilityMetadata);
    }

    /**
     * Analyze heading structure
     */
    analyzeHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const structure = [];
        
        headings.forEach(heading => {
            structure.push({
                level: parseInt(heading.tagName.charAt(1)),
                text: heading.textContent.trim(),
                id: heading.id || null
            });
        });
        
        return structure;
    }

    /**
     * Analyze color contrast
     */
    analyzeColorContrast() {
        const elements = document.querySelectorAll('*');
        const contrastIssues = [];
        
        elements.forEach(element => {
            const styles = window.getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
                const contrast = this.calculateContrast(color, backgroundColor);
                if (contrast < 4.5) {
                    contrastIssues.push({
                        element: element.tagName,
                        contrast: contrast,
                        color: color,
                        backgroundColor: backgroundColor
                    });
                }
            }
        });
        
        return contrastIssues;
    }

    /**
     * Calculate color contrast
     */
    calculateContrast(color1, color2) {
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        const luminance1 = this.getLuminance(rgb1);
        const luminance2 = this.getLuminance(rgb2);
        
        const lighter = Math.max(luminance1, luminance2);
        const darker = Math.min(luminance1, luminance2);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Convert hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Get luminance
     */
    getLuminance(rgb) {
        const { r, g, b } = rgb;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    /**
     * Analyze keyboard navigation
     */
    analyzeKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        return {
            totalFocusable: focusableElements.length,
            tabOrder: Array.from(focusableElements).map(el => ({
                element: el.tagName,
                tabIndex: el.tabIndex,
                id: el.id || null
            }))
        };
    }

    /**
     * Analyze screen reader support
     */
    analyzeScreenReaderSupport() {
        const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-describedby]');
        const altImages = document.querySelectorAll('img[alt]');
        const altMissingImages = document.querySelectorAll('img:not([alt])');
        
        return {
            ariaElements: ariaElements.length,
            altImages: altImages.length,
            altMissingImages: altMissingImages.length,
            screenReaderFriendly: ariaElements.length > 0 && altMissingImages.length === 0
        };
    }

    /**
     * Capture responsive metadata
     */
    captureResponsiveMetadata() {
        const responsiveMetadata = {
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            mediaQueries: this.getActiveMediaQueries(),
            breakpoints: this.getActiveBreakpoints(),
            orientation: screen.orientation?.type || 'unknown'
        };
        
        this.metadata.set('responsive', responsiveMetadata);
    }

    /**
     * Get active media queries
     */
    getActiveMediaQueries() {
        const mediaQueries = [];
        const stylesheets = document.styleSheets;
        
        for (let i = 0; i < stylesheets.length; i++) {
            try {
                const rules = stylesheets[i].cssRules;
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        mediaQueries.push({
                            media: rule.media.mediaText,
                            matches: window.matchMedia(rule.media.mediaText).matches
                        });
                    }
                }
            } catch (e) {
                // Cross-origin stylesheets may throw errors
            }
        }
        
        return mediaQueries;
    }

    /**
     * Get active breakpoints
     */
    getActiveBreakpoints() {
        const breakpoints = [
            { name: 'xs', width: 0 },
            { name: 'sm', width: 576 },
            { name: 'md', width: 768 },
            { name: 'lg', width: 992 },
            { name: 'xl', width: 1200 },
            { name: 'xxl', width: 1400 }
        ];
        
        const currentWidth = window.innerWidth;
        const activeBreakpoint = breakpoints.find(bp => currentWidth >= bp.width);
        
        return {
            current: activeBreakpoint?.name || 'xs',
            width: currentWidth,
            breakpoints: breakpoints
        };
    }

    /**
     * Setup graph pruning
     */
    setupGraphPruning() {
        this.pruningRules = [
            this.pruneDuplicateNodes,
            this.pruneLowValueNodes,
            this.pruneOrphanedNodes,
            this.pruneRedundantEdges,
            this.pruneLowTrafficPaths
        ];
    }

    /**
     * Prune duplicate nodes
     */
    pruneDuplicateNodes(graph) {
        const seen = new Set();
        const prunedNodes = [];
        
        graph.nodes.forEach(node => {
            const key = this.getNodeKey(node);
            if (!seen.has(key)) {
                seen.add(key);
                prunedNodes.push(node);
            }
        });
        
        return { ...graph, nodes: prunedNodes };
    }

    /**
     * Get node key for deduplication
     */
    getNodeKey(node) {
        return `${node.url}-${node.title}-${node.elementCount}`;
    }

    /**
     * Prune low value nodes
     */
    pruneLowValueNodes(graph) {
        const prunedNodes = graph.nodes.filter(node => {
            const value = this.calculateNodeValue(node);
            return value > 0.1; // Keep nodes with value > 0.1
        });
        
        return { ...graph, nodes: prunedNodes };
    }

    /**
     * Calculate node value
     */
    calculateNodeValue(node) {
        let value = 0;
        
        // Base value from element count
        value += node.elementCount * 0.01;
        
        // Value from interactions
        value += node.interactions?.length * 0.05 || 0;
        
        // Value from accessibility
        value += node.accessibility?.score * 0.1 || 0;
        
        // Value from performance
        value += node.performance?.score * 0.1 || 0;
        
        return value;
    }

    /**
     * Prune orphaned nodes
     */
    pruneOrphanedNodes(graph) {
        const connectedNodes = new Set();
        
        graph.edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
        });
        
        const prunedNodes = graph.nodes.filter(node => 
            connectedNodes.has(node.id) || node.isEntryPoint
        );
        
        return { ...graph, nodes: prunedNodes };
    }

    /**
     * Prune redundant edges
     */
    pruneRedundantEdges(graph) {
        const edgeMap = new Map();
        const prunedEdges = [];
        
        graph.edges.forEach(edge => {
            const key = `${edge.source}-${edge.target}`;
            if (!edgeMap.has(key)) {
                edgeMap.set(key, edge);
                prunedEdges.push(edge);
            }
        });
        
        return { ...graph, edges: prunedEdges };
    }

    /**
     * Prune low traffic paths
     */
    pruneLowTrafficPaths(graph) {
        const pathTraffic = this.calculatePathTraffic(graph);
        const prunedEdges = graph.edges.filter(edge => {
            const traffic = pathTraffic.get(`${edge.source}-${edge.target}`) || 0;
            return traffic > 0.1; // Keep paths with traffic > 0.1
        });
        
        return { ...graph, edges: prunedEdges };
    }

    /**
     * Calculate path traffic
     */
    calculatePathTraffic(graph) {
        const traffic = new Map();
        
        graph.edges.forEach(edge => {
            const key = `${edge.source}-${edge.target}`;
            const currentTraffic = traffic.get(key) || 0;
            traffic.set(key, currentTraffic + (edge.weight || 1));
        });
        
        return traffic;
    }

    /**
     * Enhance graph with metadata
     */
    enhanceGraph(graph) {
        const enhancedGraph = {
            ...graph,
            metadata: {
                consoleLogs: this.consoleLogs,
                networkLogs: this.networkLogs,
                pageMetadata: this.metadata.get('page'),
                performanceMetrics: this.metadata.get('performance'),
                accessibilityMetadata: this.metadata.get('accessibility'),
                responsiveMetadata: this.metadata.get('responsive'),
                timestamp: Date.now()
            }
        };
        
        // Apply pruning rules
        let prunedGraph = enhancedGraph;
        this.pruningRules.forEach(rule => {
            prunedGraph = rule(prunedGraph);
        });
        
        this.enhancementHistory.push({
            timestamp: Date.now(),
            originalNodes: graph.nodes.length,
            prunedNodes: prunedGraph.nodes.length,
            originalEdges: graph.edges.length,
            prunedEdges: prunedGraph.edges.length
        });
        
        return prunedGraph;
    }

    /**
     * Get enhancement statistics
     */
    getEnhancementStatistics() {
        return {
            consoleLogs: this.consoleLogs.length,
            networkLogs: this.networkLogs.length,
            metadataEntries: this.metadata.size,
            enhancementHistory: this.enhancementHistory,
            pruningRules: this.pruningRules.length
        };
    }

    /**
     * Clear enhancement data
     */
    clearEnhancementData() {
        this.consoleLogs = [];
        this.networkLogs = [];
        this.metadata.clear();
        this.enhancementHistory = [];
    }

    /**
     * Export enhanced graph
     */
    exportEnhancedGraph(graph) {
        const enhancedGraph = this.enhanceGraph(graph);
        
        return {
            graph: enhancedGraph,
            statistics: this.getEnhancementStatistics(),
            timestamp: Date.now()
        };
    }
}
