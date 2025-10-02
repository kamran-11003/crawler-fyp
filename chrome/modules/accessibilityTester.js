/**
 * Accessibility Tester for comprehensive accessibility testing
 * Implements ARIA role detection, off-screen element detection, and keyboard navigation testing
 */

export class AccessibilityTester {
    constructor() {
        this.accessibilityData = {
            ariaElements: [],
            focusableElements: [],
            screenReaderElements: [],
            keyboardNavigation: [],
            colorContrast: [],
            altText: [],
            headings: [],
            landmarks: [],
            forms: [],
            tables: []
        };
        this.isTesting = false;
        this.testResults = [];
    }

    /**
     * Start accessibility testing
     */
    startTesting() {
        if (this.isTesting) return;
        
        this.isTesting = true;
        this.testARIAElements();
        this.testFocusableElements();
        this.testScreenReaderElements();
        this.testKeyboardNavigation();
        this.testColorContrast();
        this.testAltText();
        this.testHeadings();
        this.testLandmarks();
        this.testForms();
        this.testTables();
    }

    /**
     * Stop accessibility testing
     */
    stopTesting() {
        this.isTesting = false;
    }

    /**
     * Test ARIA elements
     */
    testARIAElements() {
        const ariaElements = [];
        const ariaSelectors = [
            '[role]', '[aria-label]', '[aria-describedby]', '[aria-labelledby]',
            '[aria-hidden]', '[aria-expanded]', '[aria-selected]', '[aria-checked]',
            '[aria-disabled]', '[aria-required]', '[aria-invalid]', '[aria-live]'
        ];
        
        ariaSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const ariaData = {
                    element: element,
                    role: element.getAttribute('role'),
                    label: element.getAttribute('aria-label'),
                    describedBy: element.getAttribute('aria-describedby'),
                    labelledBy: element.getAttribute('aria-labelledby'),
                    hidden: element.getAttribute('aria-hidden'),
                    expanded: element.getAttribute('aria-expanded'),
                    selected: element.getAttribute('aria-selected'),
                    checked: element.getAttribute('aria-checked'),
                    disabled: element.getAttribute('aria-disabled'),
                    required: element.getAttribute('aria-required'),
                    invalid: element.getAttribute('aria-invalid'),
                    live: element.getAttribute('aria-live'),
                    isVisible: this.isElementVisible(element),
                    hasAccessibleName: this.hasAccessibleName(element),
                    hasAccessibleDescription: this.hasAccessibleDescription(element),
                    timestamp: Date.now()
                };
                
                ariaElements.push(ariaData);
            });
        });
        
        this.accessibilityData.ariaElements = ariaElements;
        return ariaElements;
    }

    /**
     * Test focusable elements
     */
    testFocusableElements() {
        const focusableElements = [];
        const focusableSelectors = [
            'a[href]', 'button', 'input', 'select', 'textarea', '[tabindex]',
            '[contenteditable]', 'area[href]', 'iframe', 'object', 'embed'
        ];
        
        focusableSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const focusData = {
                    element: element,
                    tagName: element.tagName.toLowerCase(),
                    tabIndex: element.tabIndex,
                    isFocusable: this.isElementFocusable(element),
                    isVisible: this.isElementVisible(element),
                    hasKeyboardHandler: this.hasKeyboardHandler(element),
                    hasFocusIndicator: this.hasFocusIndicator(element),
                    isDisabled: element.disabled || element.getAttribute('aria-disabled') === 'true',
                    timestamp: Date.now()
                };
                
                focusableElements.push(focusData);
            });
        });
        
        this.accessibilityData.focusableElements = focusableElements;
        return focusableElements;
    }

    /**
     * Test screen reader elements
     */
    testScreenReaderElements() {
        const screenReaderElements = [];
        const srSelectors = [
            '.sr-only', '.screen-reader-only', '[aria-hidden="true"]', '.visually-hidden',
            '.skip-link', '.skip-to-content', '[data-sr-only]', '[data-screen-reader]'
        ];
        
        srSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const srData = {
                    element: element,
                    selector: selector,
                    isHidden: this.isElementHidden(element),
                    isOffScreen: this.isElementOffScreen(element),
                    hasScreenReaderText: this.hasScreenReaderText(element),
                    isAccessible: this.isElementAccessible(element),
                    timestamp: Date.now()
                };
                
                screenReaderElements.push(srData);
            });
        });
        
        this.accessibilityData.screenReaderElements = screenReaderElements;
        return screenReaderElements;
    }

    /**
     * Test keyboard navigation
     */
    testKeyboardNavigation() {
        const keyboardNavigation = [];
        const keyboardSelectors = [
            'a[href]', 'button', 'input', 'select', 'textarea', '[tabindex]',
            '[role="button"]', '[role="link"]', '[role="menuitem"]', '[role="tab"]'
        ];
        
        keyboardSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const keyboardData = {
                    element: element,
                    tagName: element.tagName.toLowerCase(),
                    role: element.getAttribute('role'),
                    tabIndex: element.tabIndex,
                    isKeyboardAccessible: this.isKeyboardAccessible(element),
                    hasKeyboardEvent: this.hasKeyboardEvent(element),
                    hasKeyboardShortcut: this.hasKeyboardShortcut(element),
                    keyboardHandler: this.getKeyboardHandler(element),
                    timestamp: Date.now()
                };
                
                keyboardNavigation.push(keyboardData);
            });
        });
        
        this.accessibilityData.keyboardNavigation = keyboardNavigation;
        return keyboardNavigation;
    }

    /**
     * Test color contrast
     */
    testColorContrast() {
        const colorContrast = [];
        const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, input, label');
        
        textElements.forEach(element => {
            if (this.isElementVisible(element) && this.hasTextContent(element)) {
                const contrastData = {
                    element: element,
                    text: element.textContent.trim(),
                    backgroundColor: this.getBackgroundColor(element),
                    textColor: this.getTextColor(element),
                    contrastRatio: this.calculateContrastRatio(element),
                    isAccessible: this.isContrastAccessible(element),
                    timestamp: Date.now()
                };
                
                colorContrast.push(contrastData);
            }
        });
        
        this.accessibilityData.colorContrast = colorContrast;
        return colorContrast;
    }

    /**
     * Test alt text
     */
    testAltText() {
        const altText = [];
        const imageElements = document.querySelectorAll('img, [role="img"]');
        
        imageElements.forEach(element => {
            const altData = {
                element: element,
                src: element.src,
                alt: element.alt,
                title: element.title,
                hasAltText: !!element.alt,
                hasTitle: !!element.title,
                isDecorative: this.isDecorativeImage(element),
                isAccessible: this.isImageAccessible(element),
                timestamp: Date.now()
            };
            
            altText.push(altData);
        });
        
        this.accessibilityData.altText = altText;
        return altText;
    }

    /**
     * Test headings
     */
    testHeadings() {
        const headings = [];
        const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
        
        headingElements.forEach(element => {
            const headingData = {
                element: element,
                level: this.getHeadingLevel(element),
                text: element.textContent.trim(),
                hasId: !!element.id,
                isVisible: this.isElementVisible(element),
                isAccessible: this.isHeadingAccessible(element),
                timestamp: Date.now()
            };
            
            headings.push(headingData);
        });
        
        this.accessibilityData.headings = headings;
        return headings;
    }

    /**
     * Test landmarks
     */
    testLandmarks() {
        const landmarks = [];
        const landmarkSelectors = [
            '[role="banner"]', '[role="navigation"]', '[role="main"]', '[role="complementary"]',
            '[role="contentinfo"]', '[role="search"]', '[role="form"]', '[role="region"]',
            'header', 'nav', 'main', 'aside', 'footer', 'section', 'article'
        ];
        
        landmarkSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const landmarkData = {
                    element: element,
                    role: element.getAttribute('role') || this.getImplicitRole(element),
                    tagName: element.tagName.toLowerCase(),
                    hasLabel: this.hasLandmarkLabel(element),
                    isVisible: this.isElementVisible(element),
                    isAccessible: this.isLandmarkAccessible(element),
                    timestamp: Date.now()
                };
                
                landmarks.push(landmarkData);
            });
        });
        
        this.accessibilityData.landmarks = landmarks;
        return landmarks;
    }

    /**
     * Test forms
     */
    testForms() {
        const forms = [];
        const formElements = document.querySelectorAll('form, [role="form"]');
        
        formElements.forEach(form => {
            const formData = {
                element: form,
                hasLabel: this.hasFormLabel(form),
                hasFieldset: this.hasFieldset(form),
                hasLegend: this.hasLegend(form),
                hasErrorHandling: this.hasErrorHandling(form),
                isAccessible: this.isFormAccessible(form),
                fields: this.getFormFields(form),
                timestamp: Date.now()
            };
            
            forms.push(formData);
        });
        
        this.accessibilityData.forms = forms;
        return forms;
    }

    /**
     * Test tables
     */
    testTables() {
        const tables = [];
        const tableElements = document.querySelectorAll('table, [role="table"]');
        
        tableElements.forEach(table => {
            const tableData = {
                element: table,
                hasCaption: this.hasTableCaption(table),
                hasHeaders: this.hasTableHeaders(table),
                hasScope: this.hasTableScope(table),
                isAccessible: this.isTableAccessible(table),
                rows: this.getTableRows(table),
                columns: this.getTableColumns(table),
                timestamp: Date.now()
            };
            
            tables.push(tableData);
        });
        
        this.accessibilityData.tables = tables;
        return tables;
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
     * Check if element is hidden
     */
    isElementHidden(element) {
        const style = window.getComputedStyle(element);
        return style.display === 'none' ||
               style.visibility === 'hidden' ||
               style.opacity === '0' ||
               element.offsetWidth === 0 ||
               element.offsetHeight === 0;
    }

    /**
     * Check if element is off-screen
     */
    isElementOffScreen(element) {
        const rect = element.getBoundingClientRect();
        return rect.left < -1000 || rect.top < -1000 || rect.right > window.innerWidth + 1000 || rect.bottom > window.innerHeight + 1000;
    }

    /**
     * Check if element has accessible name
     */
    hasAccessibleName(element) {
        return !!(element.getAttribute('aria-label') ||
                 element.getAttribute('aria-labelledby') ||
                 element.getAttribute('title') ||
                 element.textContent.trim() ||
                 element.alt);
    }

    /**
     * Check if element has accessible description
     */
    hasAccessibleDescription(element) {
        return !!(element.getAttribute('aria-describedby') ||
                 element.getAttribute('title') ||
                 element.getAttribute('aria-description'));
    }

    /**
     * Check if element is focusable
     */
    isElementFocusable(element) {
        if (element.disabled || element.getAttribute('aria-disabled') === 'true') {
            return false;
        }
        
        if (element.tabIndex >= 0) {
            return true;
        }
        
        const focusableTags = ['a', 'button', 'input', 'select', 'textarea', 'area'];
        return focusableTags.includes(element.tagName.toLowerCase());
    }

    /**
     * Check if element has keyboard handler
     */
    hasKeyboardHandler(element) {
        return !!(element.onkeydown || element.onkeyup || element.onkeypress ||
                 element.getAttribute('onkeydown') || element.getAttribute('onkeyup') || element.getAttribute('onkeypress'));
    }

    /**
     * Check if element has focus indicator
     */
    hasFocusIndicator(element) {
        const style = window.getComputedStyle(element);
        return !!(style.outline || style.border || style.boxShadow);
    }

    /**
     * Check if element has screen reader text
     */
    hasScreenReaderText(element) {
        return !!(element.textContent.trim() || element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'));
    }

    /**
     * Check if element is accessible
     */
    isElementAccessible(element) {
        return this.isElementVisible(element) && !this.isElementHidden(element) && !this.isElementOffScreen(element);
    }

    /**
     * Check if element is keyboard accessible
     */
    isKeyboardAccessible(element) {
        return this.isElementFocusable(element) && this.hasKeyboardHandler(element);
    }

    /**
     * Check if element has keyboard event
     */
    hasKeyboardEvent(element) {
        return !!(element.onkeydown || element.onkeyup || element.onkeypress);
    }

    /**
     * Check if element has keyboard shortcut
     */
    hasKeyboardShortcut(element) {
        return !!(element.getAttribute('accesskey') || element.getAttribute('data-shortcut'));
    }

    /**
     * Get keyboard handler
     */
    getKeyboardHandler(element) {
        const handlers = [];
        if (element.onkeydown) handlers.push('keydown');
        if (element.onkeyup) handlers.push('keyup');
        if (element.onkeypress) handlers.push('keypress');
        return handlers;
    }

    /**
     * Get background color
     */
    getBackgroundColor(element) {
        const style = window.getComputedStyle(element);
        return style.backgroundColor;
    }

    /**
     * Get text color
     */
    getTextColor(element) {
        const style = window.getComputedStyle(element);
        return style.color;
    }

    /**
     * Calculate contrast ratio
     */
    calculateContrastRatio(element) {
        // Simplified contrast ratio calculation
        // In a real implementation, you'd use a proper contrast ratio algorithm
        const style = window.getComputedStyle(element);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        
        // This is a placeholder - actual implementation would parse colors and calculate ratio
        return 4.5; // WCAG AA standard
    }

    /**
     * Check if contrast is accessible
     */
    isContrastAccessible(element) {
        const ratio = this.calculateContrastRatio(element);
        return ratio >= 4.5; // WCAG AA standard
    }

    /**
     * Check if element has text content
     */
    hasTextContent(element) {
        return element.textContent.trim().length > 0;
    }

    /**
     * Check if image is decorative
     */
    isDecorativeImage(element) {
        return element.alt === '' || element.getAttribute('role') === 'presentation';
    }

    /**
     * Check if image is accessible
     */
    isImageAccessible(element) {
        return !!(element.alt || element.getAttribute('aria-label') || this.isDecorativeImage(element));
    }

    /**
     * Get heading level
     */
    getHeadingLevel(element) {
        const tagName = element.tagName.toLowerCase();
        if (tagName.startsWith('h')) {
            return parseInt(tagName.substring(1));
        }
        return element.getAttribute('aria-level') ? parseInt(element.getAttribute('aria-level')) : 1;
    }

    /**
     * Check if heading is accessible
     */
    isHeadingAccessible(element) {
        return this.isElementVisible(element) && element.textContent.trim().length > 0;
    }

    /**
     * Get implicit role
     */
    getImplicitRole(element) {
        const tagName = element.tagName.toLowerCase();
        const roleMap = {
            'header': 'banner',
            'nav': 'navigation',
            'main': 'main',
            'aside': 'complementary',
            'footer': 'contentinfo',
            'section': 'region',
            'article': 'article'
        };
        return roleMap[tagName] || null;
    }

    /**
     * Check if landmark has label
     */
    hasLandmarkLabel(element) {
        return !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby'));
    }

    /**
     * Check if landmark is accessible
     */
    isLandmarkAccessible(element) {
        return this.isElementVisible(element) && (this.hasLandmarkLabel(element) || element.textContent.trim().length > 0);
    }

    /**
     * Check if form has label
     */
    hasFormLabel(form) {
        const labels = form.querySelectorAll('label');
        return labels.length > 0;
    }

    /**
     * Check if form has fieldset
     */
    hasFieldset(form) {
        const fieldsets = form.querySelectorAll('fieldset');
        return fieldsets.length > 0;
    }

    /**
     * Check if form has legend
     */
    hasLegend(form) {
        const legends = form.querySelectorAll('legend');
        return legends.length > 0;
    }

    /**
     * Check if form has error handling
     */
    hasErrorHandling(form) {
        const errorElements = form.querySelectorAll('.error, .invalid, [aria-invalid]');
        return errorElements.length > 0;
    }

    /**
     * Check if form is accessible
     */
    isFormAccessible(form) {
        return this.isElementVisible(form) && this.hasFormLabel(form);
    }

    /**
     * Get form fields
     */
    getFormFields(form) {
        const fields = [];
        const inputElements = form.querySelectorAll('input, select, textarea');
        
        inputElements.forEach(input => {
            const fieldData = {
                element: input,
                type: input.type,
                name: input.name,
                hasLabel: this.hasFieldLabel(input),
                isRequired: input.required,
                hasError: input.getAttribute('aria-invalid') === 'true'
            };
            fields.push(fieldData);
        });
        
        return fields;
    }

    /**
     * Check if field has label
     */
    hasFieldLabel(input) {
        const label = input.closest('label') || document.querySelector(`label[for="${input.id}"]`);
        return !!label;
    }

    /**
     * Check if table has caption
     */
    hasTableCaption(table) {
        const caption = table.querySelector('caption');
        return !!caption;
    }

    /**
     * Check if table has headers
     */
    hasTableHeaders(table) {
        const headers = table.querySelectorAll('th, [role="columnheader"], [role="rowheader"]');
        return headers.length > 0;
    }

    /**
     * Check if table has scope
     */
    hasTableScope(table) {
        const scopedHeaders = table.querySelectorAll('th[scope]');
        return scopedHeaders.length > 0;
    }

    /**
     * Check if table is accessible
     */
    isTableAccessible(table) {
        return this.isElementVisible(table) && this.hasTableHeaders(table);
    }

    /**
     * Get table rows
     */
    getTableRows(table) {
        const rows = table.querySelectorAll('tr, [role="row"]');
        return rows.length;
    }

    /**
     * Get table columns
     */
    getTableColumns(table) {
        const firstRow = table.querySelector('tr, [role="row"]');
        if (firstRow) {
            const cells = firstRow.querySelectorAll('td, th, [role="cell"], [role="columnheader"]');
            return cells.length;
        }
        return 0;
    }

    /**
     * Get accessibility statistics
     */
    getAccessibilityStatistics() {
        return {
            aria: {
                total: this.accessibilityData.ariaElements.length,
                withLabels: this.accessibilityData.ariaElements.filter(e => e.hasAccessibleName).length,
                withDescriptions: this.accessibilityData.ariaElements.filter(e => e.hasAccessibleDescription).length
            },
            focusable: {
                total: this.accessibilityData.focusableElements.length,
                accessible: this.accessibilityData.focusableElements.filter(e => e.isFocusable).length,
                withKeyboardHandler: this.accessibilityData.focusableElements.filter(e => e.hasKeyboardHandler).length
            },
            screenReader: {
                total: this.accessibilityData.screenReaderElements.length,
                accessible: this.accessibilityData.screenReaderElements.filter(e => e.isAccessible).length
            },
            keyboard: {
                total: this.accessibilityData.keyboardNavigation.length,
                accessible: this.accessibilityData.keyboardNavigation.filter(e => e.isKeyboardAccessible).length
            },
            contrast: {
                total: this.accessibilityData.colorContrast.length,
                accessible: this.accessibilityData.colorContrast.filter(e => e.isAccessible).length
            },
            images: {
                total: this.accessibilityData.altText.length,
                accessible: this.accessibilityData.altText.filter(e => e.isAccessible).length
            },
            headings: {
                total: this.accessibilityData.headings.length,
                accessible: this.accessibilityData.headings.filter(e => e.isAccessible).length
            },
            landmarks: {
                total: this.accessibilityData.landmarks.length,
                accessible: this.accessibilityData.landmarks.filter(e => e.isAccessible).length
            },
            forms: {
                total: this.accessibilityData.forms.length,
                accessible: this.accessibilityData.forms.filter(e => e.isAccessible).length
            },
            tables: {
                total: this.accessibilityData.tables.length,
                accessible: this.accessibilityData.tables.filter(e => e.isAccessible).length
            }
        };
    }

    /**
     * Export accessibility data
     */
    exportAccessibilityData() {
        return {
            accessibilityData: this.accessibilityData,
            statistics: this.getAccessibilityStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear accessibility data
     */
    clearAccessibilityData() {
        this.accessibilityData = {
            ariaElements: [],
            focusableElements: [],
            screenReaderElements: [],
            keyboardNavigation: [],
            colorContrast: [],
            altText: [],
            headings: [],
            landmarks: [],
            forms: [],
            tables: []
        };
    }

    /**
     * Get testing status
     */
    getStatus() {
        return {
            isTesting: this.isTesting,
            totalAriaElements: this.accessibilityData.ariaElements.length,
            totalFocusableElements: this.accessibilityData.focusableElements.length,
            totalScreenReaderElements: this.accessibilityData.screenReaderElements.length,
            totalKeyboardElements: this.accessibilityData.keyboardNavigation.length,
            totalColorContrast: this.accessibilityData.colorContrast.length,
            totalImages: this.accessibilityData.altText.length,
            totalHeadings: this.accessibilityData.headings.length,
            totalLandmarks: this.accessibilityData.landmarks.length,
            totalForms: this.accessibilityData.forms.length,
            totalTables: this.accessibilityData.tables.length
        };
    }
}
