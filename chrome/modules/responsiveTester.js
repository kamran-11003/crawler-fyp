/**
 * Responsive Tester for comprehensive responsive design testing
 * Implements viewport size testing, orientation change handling, and mobile gesture simulation
 */

export class ResponsiveTester {
    constructor() {
        this.responsiveData = {
            viewports: [],
            breakpoints: [],
            orientations: [],
            touchElements: [],
            mobileElements: [],
            responsiveImages: [],
            mediaQueries: [],
            flexboxElements: [],
            gridElements: []
        };
        this.isTesting = false;
        this.currentViewport = null;
        this.orientationChangeHandler = null;
        this.resizeHandler = null;
    }

    /**
     * Start responsive testing
     */
    startTesting() {
        if (this.isTesting) return;
        
        this.isTesting = true;
        this.detectViewport();
        this.detectBreakpoints();
        this.detectOrientations();
        this.detectTouchElements();
        this.detectMobileElements();
        this.detectResponsiveImages();
        this.detectMediaQueries();
        this.detectFlexboxElements();
        this.detectGridElements();
        this.monitorViewportChanges();
        this.monitorOrientationChanges();
    }

    /**
     * Stop responsive testing
     */
    stopTesting() {
        if (!this.isTesting) return;
        
        this.isTesting = false;
        this.removeEventListeners();
    }

    /**
     * Detect current viewport
     */
    detectViewport() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
            orientation: this.getOrientation(),
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            userAgent: navigator.userAgent,
            timestamp: Date.now()
        };
        
        this.currentViewport = viewport;
        this.responsiveData.viewports.push(viewport);
        return viewport;
    }

    /**
     * Detect breakpoints
     */
    detectBreakpoints() {
        const breakpoints = [];
        const commonBreakpoints = [
            { name: 'mobile', width: 320, height: 568 },
            { name: 'mobile-large', width: 375, height: 667 },
            { name: 'tablet', width: 768, height: 1024 },
            { name: 'tablet-large', width: 1024, height: 768 },
            { name: 'desktop', width: 1200, height: 800 },
            { name: 'desktop-large', width: 1920, height: 1080 }
        ];
        
        commonBreakpoints.forEach(breakpoint => {
            const breakpointData = {
                name: breakpoint.name,
                width: breakpoint.width,
                height: breakpoint.height,
                isActive: this.isBreakpointActive(breakpoint),
                elements: this.getBreakpointElements(breakpoint),
                timestamp: Date.now()
            };
            
            breakpoints.push(breakpointData);
        });
        
        this.responsiveData.breakpoints = breakpoints;
        return breakpoints;
    }

    /**
     * Detect orientations
     */
    detectOrientations() {
        const orientations = [];
        const orientationTypes = ['portrait', 'landscape'];
        
        orientationTypes.forEach(orientation => {
            const orientationData = {
                type: orientation,
                isActive: this.isOrientationActive(orientation),
                elements: this.getOrientationElements(orientation),
                timestamp: Date.now()
            };
            
            orientations.push(orientationData);
        });
        
        this.responsiveData.orientations = orientations;
        return orientations;
    }

    /**
     * Detect touch elements
     */
    detectTouchElements() {
        const touchElements = [];
        const touchSelectors = [
            '[data-touch]', '.touch', '.touchable', '[data-swipe]', '.swipe',
            '[data-pinch]', '.pinch', '[data-tap]', '.tap', '[data-gesture]', '.gesture'
        ];
        
        touchSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const touchData = {
                    element: element,
                    selector: selector,
                    gestures: this.getTouchGestures(element),
                    isTouchable: this.isTouchable(element),
                    hasTouchHandler: this.hasTouchHandler(element),
                    timestamp: Date.now()
                };
                
                touchElements.push(touchData);
            });
        });
        
        this.responsiveData.touchElements = touchElements;
        return touchElements;
    }

    /**
     * Detect mobile elements
     */
    detectMobileElements() {
        const mobileElements = [];
        const mobileSelectors = [
            '[data-mobile]', '.mobile', '.mobile-only', '[data-mobile-only]',
            '.touch-device', '[data-touch-device]', '.mobile-nav', '.mobile-menu'
        ];
        
        mobileSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const mobileData = {
                    element: element,
                    selector: selector,
                    isVisible: this.isElementVisible(element),
                    isMobileOnly: this.isMobileOnly(element),
                    hasMobileHandler: this.hasMobileHandler(element),
                    timestamp: Date.now()
                };
                
                mobileElements.push(mobileData);
            });
        });
        
        this.responsiveData.mobileElements = mobileElements;
        return mobileElements;
    }

    /**
     * Detect responsive images
     */
    detectResponsiveImages() {
        const responsiveImages = [];
        const imageElements = document.querySelectorAll('img, picture, [data-image]');
        
        imageElements.forEach(image => {
            const imageData = {
                element: image,
                src: image.src,
                srcset: image.srcset,
                sizes: image.sizes,
                isResponsive: this.isResponsiveImage(image),
                hasSrcset: !!image.srcset,
                hasSizes: !!image.sizes,
                breakpoints: this.getImageBreakpoints(image),
                timestamp: Date.now()
            };
            
            responsiveImages.push(imageData);
        });
        
        this.responsiveData.responsiveImages = responsiveImages;
        return responsiveImages;
    }

    /**
     * Detect media queries
     */
    detectMediaQueries() {
        const mediaQueries = [];
        const styleSheets = document.styleSheets;
        
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const styleSheet = styleSheets[i];
                const rules = styleSheet.cssRules || styleSheet.rules;
                
                for (let j = 0; j < rules.length; j++) {
                    const rule = rules[j];
                    if (rule.type === CSSRule.MEDIA_RULE) {
                        const mediaQuery = {
                            media: rule.media.mediaText,
                            isActive: rule.media.matches,
                            rules: this.getMediaQueryRules(rule),
                            timestamp: Date.now()
                        };
                        
                        mediaQueries.push(mediaQuery);
                    }
                }
            } catch (e) {
                // Cross-origin stylesheet, skip
            }
        }
        
        this.responsiveData.mediaQueries = mediaQueries;
        return mediaQueries;
    }

    /**
     * Detect flexbox elements
     */
    detectFlexboxElements() {
        const flexboxElements = [];
        const flexElements = document.querySelectorAll('[style*="display: flex"], [style*="display: -webkit-flex"], .flex, .flexbox');
        
        flexElements.forEach(element => {
            const flexData = {
                element: element,
                display: this.getFlexDisplay(element),
                direction: this.getFlexDirection(element),
                wrap: this.getFlexWrap(element),
                justify: this.getFlexJustify(element),
                align: this.getFlexAlign(element),
                isResponsive: this.isFlexResponsive(element),
                timestamp: Date.now()
            };
            
            flexboxElements.push(flexData);
        });
        
        this.responsiveData.flexboxElements = flexboxElements;
        return flexboxElements;
    }

    /**
     * Detect grid elements
     */
    detectGridElements() {
        const gridElements = [];
        const gridSelectors = [
            '[style*="display: grid"]', '[style*="display: -ms-grid"]', '.grid', '.css-grid'
        ];
        
        gridSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const gridData = {
                    element: element,
                    display: this.getGridDisplay(element),
                    columns: this.getGridColumns(element),
                    rows: this.getGridRows(element),
                    gap: this.getGridGap(element),
                    isResponsive: this.isGridResponsive(element),
                    timestamp: Date.now()
                };
                
                gridElements.push(gridData);
            });
        });
        
        this.responsiveData.gridElements = gridElements;
        return gridElements;
    }

    /**
     * Monitor viewport changes
     */
    monitorViewportChanges() {
        this.resizeHandler = () => {
            this.detectViewport();
            this.detectBreakpoints();
            this.detectOrientations();
        };
        
        window.addEventListener('resize', this.resizeHandler);
    }

    /**
     * Monitor orientation changes
     */
    monitorOrientationChanges() {
        this.orientationChangeHandler = () => {
            this.detectViewport();
            this.detectOrientations();
        };
        
        window.addEventListener('orientationchange', this.orientationChangeHandler);
    }

    /**
     * Get orientation
     */
    getOrientation() {
        if (window.screen && window.screen.orientation) {
            return window.screen.orientation.type;
        }
        return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
    }

    /**
     * Check if mobile
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    /**
     * Check if tablet
     */
    isTablet() {
        return /iPad|Android/i.test(navigator.userAgent) ||
               (window.innerWidth > 768 && window.innerWidth <= 1024);
    }

    /**
     * Check if desktop
     */
    isDesktop() {
        return !this.isMobile() && !this.isTablet();
    }

    /**
     * Check if breakpoint is active
     */
    isBreakpointActive(breakpoint) {
        return window.innerWidth >= breakpoint.width && window.innerHeight >= breakpoint.height;
    }

    /**
     * Get breakpoint elements
     */
    getBreakpointElements(breakpoint) {
        const elements = [];
        const breakpointSelectors = [
            `[data-${breakpoint.name}]`, `.${breakpoint.name}`, `[data-breakpoint="${breakpoint.name}"]`
        ];
        
        breakpointSelectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            elements.push(...Array.from(foundElements));
        });
        
        return elements;
    }

    /**
     * Check if orientation is active
     */
    isOrientationActive(orientation) {
        const currentOrientation = this.getOrientation();
        return currentOrientation.includes(orientation);
    }

    /**
     * Get orientation elements
     */
    getOrientationElements(orientation) {
        const elements = [];
        const orientationSelectors = [
            `[data-${orientation}]`, `.${orientation}`, `[data-orientation="${orientation}"]`
        ];
        
        orientationSelectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            elements.push(...Array.from(foundElements));
        });
        
        return elements;
    }

    /**
     * Get touch gestures
     */
    getTouchGestures(element) {
        const gestures = [];
        const gestureAttributes = ['data-swipe', 'data-pinch', 'data-tap', 'data-gesture'];
        
        gestureAttributes.forEach(attr => {
            if (element.hasAttribute(attr)) {
                gestures.push({
                    type: attr.replace('data-', ''),
                    value: element.getAttribute(attr)
                });
            }
        });
        
        return gestures;
    }

    /**
     * Check if element is touchable
     */
    isTouchable(element) {
        const touchSelectors = [
            '[data-touch]', '.touch', '.touchable', '[data-swipe]', '.swipe',
            '[data-pinch]', '.pinch', '[data-tap]', '.tap'
        ];
        
        return touchSelectors.some(selector => element.matches(selector));
    }

    /**
     * Check if element has touch handler
     */
    hasTouchHandler(element) {
        return !!(element.ontouchstart || element.ontouchend || element.ontouchmove ||
                 element.getAttribute('ontouchstart') || element.getAttribute('ontouchend') || element.getAttribute('ontouchmove'));
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
     * Check if element is mobile only
     */
    isMobileOnly(element) {
        const mobileSelectors = [
            '[data-mobile-only]', '.mobile-only', '[data-mobile]', '.mobile'
        ];
        
        return mobileSelectors.some(selector => element.matches(selector));
    }

    /**
     * Check if element has mobile handler
     */
    hasMobileHandler(element) {
        return !!(element.ontouchstart || element.ontouchend || element.ontouchmove ||
                 element.getAttribute('ontouchstart') || element.getAttribute('ontouchend') || element.getAttribute('ontouchmove'));
    }

    /**
     * Check if image is responsive
     */
    isResponsiveImage(image) {
        return !!(image.srcset || image.sizes || image.closest('picture'));
    }

    /**
     * Get image breakpoints
     */
    getImageBreakpoints(image) {
        const breakpoints = [];
        
        if (image.srcset) {
            const srcset = image.srcset.split(',');
            srcset.forEach(src => {
                const parts = src.trim().split(' ');
                if (parts.length === 2) {
                    breakpoints.push({
                        src: parts[0],
                        width: parts[1]
                    });
                }
            });
        }
        
        return breakpoints;
    }

    /**
     * Get media query rules
     */
    getMediaQueryRules(mediaRule) {
        const rules = [];
        for (let i = 0; i < mediaRule.cssRules.length; i++) {
            const rule = mediaRule.cssRules[i];
            rules.push({
                selector: rule.selectorText,
                style: rule.style.cssText
            });
        }
        return rules;
    }

    /**
     * Get flex display
     */
    getFlexDisplay(element) {
        const style = window.getComputedStyle(element);
        return style.display;
    }

    /**
     * Get flex direction
     */
    getFlexDirection(element) {
        const style = window.getComputedStyle(element);
        return style.flexDirection;
    }

    /**
     * Get flex wrap
     */
    getFlexWrap(element) {
        const style = window.getComputedStyle(element);
        return style.flexWrap;
    }

    /**
     * Get flex justify
     */
    getFlexJustify(element) {
        const style = window.getComputedStyle(element);
        return style.justifyContent;
    }

    /**
     * Get flex align
     */
    getFlexAlign(element) {
        const style = window.getComputedStyle(element);
        return style.alignItems;
    }

    /**
     * Check if flex is responsive
     */
    isFlexResponsive(element) {
        const style = window.getComputedStyle(element);
        return style.flexDirection === 'column' || style.flexWrap === 'wrap';
    }

    /**
     * Get grid display
     */
    getGridDisplay(element) {
        const style = window.getComputedStyle(element);
        return style.display;
    }

    /**
     * Get grid columns
     */
    getGridColumns(element) {
        const style = window.getComputedStyle(element);
        return style.gridTemplateColumns;
    }

    /**
     * Get grid rows
     */
    getGridRows(element) {
        const style = window.getComputedStyle(element);
        return style.gridTemplateRows;
    }

    /**
     * Get grid gap
     */
    getGridGap(element) {
        const style = window.getComputedStyle(element);
        return style.gap;
    }

    /**
     * Check if grid is responsive
     */
    isGridResponsive(element) {
        const style = window.getComputedStyle(element);
        return style.gridTemplateColumns.includes('repeat') || style.gridTemplateColumns.includes('minmax');
    }

    /**
     * Test viewport sizes
     */
    testViewportSizes(sizes = []) {
        const defaultSizes = [
            { width: 320, height: 568, name: 'mobile' },
            { width: 375, height: 667, name: 'mobile-large' },
            { width: 768, height: 1024, name: 'tablet' },
            { width: 1024, height: 768, name: 'tablet-large' },
            { width: 1200, height: 800, name: 'desktop' },
            { width: 1920, height: 1080, name: 'desktop-large' }
        ];
        
        const testSizes = sizes.length > 0 ? sizes : defaultSizes;
        const results = [];
        
        testSizes.forEach(size => {
            const result = {
                size: size,
                elements: this.getViewportElements(size),
                breakpoints: this.getViewportBreakpoints(size),
                mediaQueries: this.getViewportMediaQueries(size),
                timestamp: Date.now()
            };
            
            results.push(result);
        });
        
        return results;
    }

    /**
     * Get viewport elements
     */
    getViewportElements(size) {
        const elements = [];
        const sizeSelectors = [
            `[data-${size.name}]`, `.${size.name}`, `[data-breakpoint="${size.name}"]`
        ];
        
        sizeSelectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            elements.push(...Array.from(foundElements));
        });
        
        return elements;
    }

    /**
     * Get viewport breakpoints
     */
    getViewportBreakpoints(size) {
        return this.responsiveData.breakpoints.filter(bp => 
            bp.width <= size.width && bp.height <= size.height
        );
    }

    /**
     * Get viewport media queries
     */
    getViewportMediaQueries(size) {
        return this.responsiveData.mediaQueries.filter(mq => 
            mq.isActive && this.matchesMediaQuery(mq.media, size)
        );
    }

    /**
     * Check if media query matches
     */
    matchesMediaQuery(media, size) {
        // Simplified media query matching
        // In a real implementation, you'd use a proper media query parser
        if (media.includes('max-width')) {
            const maxWidth = parseInt(media.match(/max-width:\s*(\d+)px/)?.[1]);
            return maxWidth ? size.width <= maxWidth : false;
        }
        if (media.includes('min-width')) {
            const minWidth = parseInt(media.match(/min-width:\s*(\d+)px/)?.[1]);
            return minWidth ? size.width >= minWidth : false;
        }
        return false;
    }

    /**
     * Simulate mobile gestures
     */
    simulateMobileGestures() {
        const gestures = [];
        const touchElements = this.responsiveData.touchElements;
        
        touchElements.forEach(touchElement => {
            const element = touchElement.element;
            const gestures = touchElement.gestures;
            
            gestures.forEach(gesture => {
                const gestureData = {
                    element: element,
                    gesture: gesture.type,
                    value: gesture.value,
                    simulated: true,
                    timestamp: Date.now()
                };
                
                gestures.push(gestureData);
            });
        });
        
        return gestures;
    }

    /**
     * Get responsive statistics
     */
    getResponsiveStatistics() {
        return {
            viewport: {
                current: this.currentViewport,
                total: this.responsiveData.viewports.length
            },
            breakpoints: {
                total: this.responsiveData.breakpoints.length,
                active: this.responsiveData.breakpoints.filter(bp => bp.isActive).length
            },
            orientations: {
                total: this.responsiveData.orientations.length,
                active: this.responsiveData.orientations.filter(o => o.isActive).length
            },
            touch: {
                total: this.responsiveData.touchElements.length,
                touchable: this.responsiveData.touchElements.filter(e => e.isTouchable).length
            },
            mobile: {
                total: this.responsiveData.mobileElements.length,
                visible: this.responsiveData.mobileElements.filter(e => e.isVisible).length
            },
            images: {
                total: this.responsiveData.responsiveImages.length,
                responsive: this.responsiveData.responsiveImages.filter(i => i.isResponsive).length
            },
            mediaQueries: {
                total: this.responsiveData.mediaQueries.length,
                active: this.responsiveData.mediaQueries.filter(mq => mq.isActive).length
            },
            flexbox: {
                total: this.responsiveData.flexboxElements.length,
                responsive: this.responsiveData.flexboxElements.filter(f => f.isResponsive).length
            },
            grid: {
                total: this.responsiveData.gridElements.length,
                responsive: this.responsiveData.gridElements.filter(g => g.isResponsive).length
            }
        };
    }

    /**
     * Export responsive data
     */
    exportResponsiveData() {
        return {
            responsiveData: this.responsiveData,
            statistics: this.getResponsiveStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear responsive data
     */
    clearResponsiveData() {
        this.responsiveData = {
            viewports: [],
            breakpoints: [],
            orientations: [],
            touchElements: [],
            mobileElements: [],
            responsiveImages: [],
            mediaQueries: [],
            flexboxElements: [],
            gridElements: []
        };
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
        }
        if (this.orientationChangeHandler) {
            window.removeEventListener('orientationchange', this.orientationChangeHandler);
        }
    }

    /**
     * Get testing status
     */
    getStatus() {
        return {
            isTesting: this.isTesting,
            currentViewport: this.currentViewport,
            totalViewports: this.responsiveData.viewports.length,
            totalBreakpoints: this.responsiveData.breakpoints.length,
            totalOrientations: this.responsiveData.orientations.length,
            totalTouchElements: this.responsiveData.touchElements.length,
            totalMobileElements: this.responsiveData.mobileElements.length,
            totalResponsiveImages: this.responsiveData.responsiveImages.length,
            totalMediaQueries: this.responsiveData.mediaQueries.length,
            totalFlexboxElements: this.responsiveData.flexboxElements.length,
            totalGridElements: this.responsiveData.gridElements.length
        };
    }
}
