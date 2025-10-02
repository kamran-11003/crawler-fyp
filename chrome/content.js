(function () {
	// Import comprehensive selectors
	const CRAWLABLE_SELECTORS = {
		navigation: {
			links: ['a[href]', 'a[onclick]', 'a[data-href]', 'a[data-url]', '[role="link"]', '[data-navigation]', '[data-route]'],
			buttons: ['button', 'input[type="button"]', 'input[type="submit"]', '[role="button"]', '[data-action]', '[data-click]', '[onclick]', '[data-toggle]', '[data-target]'],
			menus: ['[role="menu"]', '[role="menubar"]', '[role="menuitem"]', '.menu', '.navbar', '.nav', '.sidebar', '[data-menu]', '[aria-haspopup="true"]'],
			iframes: ['iframe', 'embed', 'object', '[data-iframe]'],
			routing: ['[data-router]', '[data-route]', '[data-page]', '[data-view]', '[data-component]']
		},
		forms: {
			textInputs: ['input[type="text"]', 'input[type="email"]', 'input[type="password"]', 'input[type="search"]', 'input[type="url"]', 'input[type="tel"]', 'textarea', '[role="textbox"]', '[contenteditable="true"]', '[contenteditable]'],
			numberInputs: ['input[type="number"]', 'input[type="range"]', 'input[type="date"]', 'input[type="time"]', 'input[type="datetime-local"]'],
			selectionInputs: ['input[type="radio"]', 'input[type="checkbox"]', 'select', 'option', '[role="radio"]', '[role="checkbox"]', '[role="combobox"]', '[role="listbox"]', '[role="option"]'],
			fileInputs: ['input[type="file"]', '[data-file-upload]', '[data-dropzone]'],
			hiddenInputs: ['input[type="hidden"]', '[data-csrf]', '[data-token]', '[data-session]'],
			formContainers: ['form', '[role="form"]', '[data-form]', '.form-group', '.fieldset']
		},
		interactive: {
			modals: ['[role="dialog"]', '[role="alertdialog"]', '.modal', '.popup', '.overlay', '[data-modal]', '[data-popup]', '[aria-modal="true"]'],
			accordions: ['[role="tab"]', '[role="tabpanel"]', '[role="tablist"]', '.accordion', '[data-accordion]', '[data-collapse]', '[aria-expanded]'],
			tabs: ['[role="tab"]', '[role="tabpanel"]', '.tab', '[data-tab]', '[data-toggle="tab"]'],
			carousels: ['.carousel', '.slider', '.swiper', '[data-carousel]', '[data-slider]', '[data-swiper]'],
			toggles: ['input[type="checkbox"][data-toggle]', '.toggle', '.switch', '[data-toggle]', '[data-switch]'],
			dragDrop: ['[draggable="true"]', '[data-draggable]', '[data-dropzone]', '.drag-handle', '.resize-handle'],
			hoverMenus: ['[data-hover]', '[data-tooltip]', '.dropdown', '.hover-menu', '[aria-haspopup="menu"]'],
			contextMenus: ['[data-context]', '[data-right-click]', '.context-menu']
		},
		media: {
			video: ['video', '[data-video]', '.video-player', '[data-player]'],
			audio: ['audio', '[data-audio]', '.audio-player'],
			canvas: ['canvas', '[data-canvas]', '.chart', '.graph'],
			maps: ['[data-map]', '.map', '[data-location]'],
			widgets: ['[data-widget]', '.widget', '[data-embed]', '[data-iframe]']
		},
		accessibility: {
			aria: ['[role]', '[aria-label]', '[aria-describedby]', '[aria-labelledby]', '[aria-hidden]', '[aria-expanded]', '[aria-selected]', '[aria-checked]'],
			offscreen: ['.sr-only', '.screen-reader-only', '[aria-hidden="true"]', '.visually-hidden'],
			focusable: ['[tabindex]', 'a[href]', 'button', 'input', 'select', 'textarea']
		}
	};

	// Get all selectors as a flat array
	function getAllSelectors() {
		const allSelectors = [];
		Object.values(CRAWLABLE_SELECTORS).forEach(category => {
			if (typeof category === 'object') {
				Object.values(category).forEach(selectors => {
					if (Array.isArray(selectors)) {
						allSelectors.push(...selectors);
					}
				});
			}
		});
		return allSelectors;
	}

	// Enhanced element detection with comprehensive selectors
	function collectEnhanced() {
		const allSelectors = getAllSelectors();
		const nodeList = document.querySelectorAll(allSelectors.join(', '));
		
		const elements = Array.from(nodeList).map((el) => {
			const rect = el.getBoundingClientRect();
			const attrs = {};
			for (const { name, value } of Array.from(el.attributes)) attrs[name] = value;
			
			// Determine element type and category
			const elementType = getElementType(el);
			
			// Extract functional features
			const functionalFeatures = extractElementFeatures(el);
			
			return {
				selector: getElementSelector(el),
				nodeType: el.tagName.toLowerCase(),
				category: elementType.category,
				subcategory: elementType.subcategory,
				attributes: attrs,
				visible: isVisible(el),
				boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
				text: (el.innerText || '').slice(0, 200),
				functionalFeatures: functionalFeatures,
				interactive: {
					clickable: isClickable(el),
					focusable: isFocusable(el),
					draggable: el.draggable || false,
					editable: isEditable(el)
				},
				accessibility: {
					hasLabel: hasAccessibleLabel(el),
					hasDescription: hasAccessibleDescription(el),
					isHidden: el.getAttribute('aria-hidden') === 'true'
				}
			};
		});

		// Create state vector
		const stateVector = createStateVector(elements);
		
		const dom = document.documentElement?.outerHTML || '';
		return {
			url: location.href,
			title: document.title,
			timestamp: Date.now(),
			elements,
			stateVector,
			dom,
			metadata: {
				viewport: { width: window.innerWidth, height: window.innerHeight },
				devicePixelRatio: window.devicePixelRatio,
				userAgent: navigator.userAgent,
				language: navigator.language
			}
		};
	}

	// Get element type based on selectors
	function getElementType(element) {
		for (const [category, subcategories] of Object.entries(CRAWLABLE_SELECTORS)) {
			for (const [subcategory, selectors] of Object.entries(subcategories)) {
				if (selectors.some(selector => {
					try {
						return element.matches(selector);
					} catch (e) {
						return false;
					}
				})) {
					return { category, subcategory };
				}
			}
		}
		return { category: 'unknown', subcategory: 'unknown' };
	}

	// Extract functional features from an element
	function extractElementFeatures(element) {
		const features = {
			role: element.getAttribute('role') || null,
			type: element.getAttribute('type') || null,
			dataAttrs: {},
			eventHandlers: {
				onclick: !!element.onclick,
				onchange: !!element.onchange,
				onsubmit: !!element.onsubmit
			}
		};

		// Extract functional data attributes
		const functionalDataAttrs = [
			'data-action', 'data-click', 'data-toggle', 'data-target', 'data-route', 'data-page',
			'data-component', 'data-widget', 'data-form', 'data-submit', 'data-validate',
			'data-modal', 'data-popup', 'data-dialog', 'data-accordion', 'data-tab',
			'data-carousel', 'data-slider', 'data-menu', 'data-dropdown', 'data-tooltip',
			'data-draggable', 'data-dropzone', 'data-upload', 'data-download', 'data-api',
			'data-ajax', 'data-fetch', 'data-auth', 'data-login', 'data-logout', 'data-session',
			'data-cart', 'data-wishlist', 'data-favorite', 'data-share', 'data-copy',
			'data-keyboard', 'data-shortcut', 'data-touch', 'data-swipe', 'data-mobile',
			'data-desktop', 'data-responsive', 'data-lazy', 'data-async', 'data-loading',
			'data-animation', 'data-transition', 'data-storage', 'data-persist', 'data-cookie',
			'data-analytics', 'data-metrics', 'data-stats', 'data-error', 'data-validation',
			'data-disabled', 'data-enabled', 'data-visible', 'data-hidden', 'data-selected',
			'data-checked', 'data-expanded', 'data-active', 'data-current', 'data-navigation'
		];

		functionalDataAttrs.forEach(attr => {
			const value = element.getAttribute(attr);
			if (value !== null) {
				features.dataAttrs[attr] = value;
			}
		});

		return features;
	}

	// Helper functions
	function isVisible(element) {
		const style = window.getComputedStyle(element);
		return style.display !== 'none' &&
			   style.visibility !== 'hidden' &&
			   style.opacity !== '0' &&
			   element.offsetWidth > 0 &&
			   element.offsetHeight > 0;
	}

	function isClickable(element) {
		const clickableTags = ['a', 'button', 'input', 'select', 'textarea'];
		const clickableRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
		
		return clickableTags.includes(element.tagName.toLowerCase()) ||
			   clickableRoles.includes(element.getAttribute('role')) ||
			   element.onclick !== null ||
			   element.getAttribute('data-click') !== null ||
			   element.getAttribute('data-action') !== null;
	}

	function isFocusable(element) {
		const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
		const hasTabIndex = element.tabIndex >= 0;
		
		return focusableTags.includes(element.tagName.toLowerCase()) ||
			   hasTabIndex ||
			   element.getAttribute('role') === 'button' ||
			   element.getAttribute('role') === 'link';
	}

	function isEditable(element) {
		const editableTags = ['input', 'textarea', 'select'];
		const isContentEditable = element.contentEditable === 'true';
		
		return editableTags.includes(element.tagName.toLowerCase()) ||
			   isContentEditable ||
			   element.getAttribute('role') === 'textbox';
	}

	function hasAccessibleLabel(element) {
		return element.getAttribute('aria-label') !== null ||
			   element.getAttribute('aria-labelledby') !== null ||
			   element.querySelector('label') !== null ||
			   element.getAttribute('title') !== null;
	}

	function hasAccessibleDescription(element) {
		return element.getAttribute('aria-describedby') !== null ||
			   element.getAttribute('aria-description') !== null;
	}

	function getElementSelector(element) {
		// Prefer id if present
		if (element.id) {
			try {
				return `#${CSS && CSS.escape ? CSS.escape(element.id) : element.id}`;
			} catch (e) {
				return `#${element.id}`;
			}
		}

		// Safely derive selector from classes
		let classNames = [];
		try {
			if (element.classList && element.classList.length) {
				classNames = Array.from(element.classList);
			} else if (typeof element.className === 'string' && element.className.trim()) {
				classNames = element.className.split(/\s+/).filter(Boolean);
			} else if (element.className && typeof element.className.baseVal === 'string') { // SVGAnimatedString
				classNames = element.className.baseVal.split(/\s+/).filter(Boolean);
			}
		} catch (_) {
			// ignore
		}
		if (classNames.length > 0) {
			try {
				return `.${classNames.map(c => (CSS && CSS.escape ? CSS.escape(c) : c)).join('.')}`;
			} catch (e) {
				return `.${classNames.join('.')}`;
			}
		}

		// Fallback to data-attributes
		const dataAttrs = Array.from(element.attributes || [])
			.filter(attr => attr && typeof attr.name === 'string' && attr.name.startsWith('data-'))
			.map(attr => {
				const name = attr.name;
				const val = (attr.value ?? '').toString();
				return `[${name}="${val.replace(/"/g, '\\"')}"]`;
			});
		if (dataAttrs.length > 0) {
			return `${(element.tagName || '').toLowerCase()}${dataAttrs.join('')}`;
		}

		// Final fallback to tag name
		return (element.tagName || 'div').toLowerCase();
	}

	// Create state vector for functional equivalence
	function createStateVector(elements) {
		const vector = {
			elementCounts: {
				links: 0,
				buttons: 0,
				inputs: 0,
				forms: 0,
				interactive: 0,
				media: 0
			},
			functionalFeatures: {
				hasNavigation: false,
				hasForms: false,
				hasMedia: false,
				hasInteractive: false,
				hasAuthentication: false,
				hasEcommerce: false
			},
			contentFeatures: {
				hasText: false,
				hasImages: false,
				hasVideos: false,
				hasAudio: false,
				hasCharts: false
			},
			stateFeatures: {
				hasVisibleElements: false,
				hasHiddenElements: false,
				hasDisabledElements: false,
				hasSelectedElements: false
			},
			accessibilityFeatures: {
				hasAriaLabels: false,
				hasAriaDescriptions: false,
				hasKeyboardNavigation: false,
				hasScreenReaderSupport: false
			}
		};

		elements.forEach(element => {
			// Count elements by type
			if (element.interactive.clickable) {
				vector.elementCounts.interactive++;
			}
			
			if (element.nodeType === 'a') {
				vector.elementCounts.links++;
			}
			
			if (element.nodeType === 'button') {
				vector.elementCounts.buttons++;
			}
			
			if (['input', 'select', 'textarea'].includes(element.nodeType)) {
				vector.elementCounts.inputs++;
			}
			
			if (element.nodeType === 'form') {
				vector.elementCounts.forms++;
			}
			
			if (['img', 'video', 'audio', 'canvas'].includes(element.nodeType)) {
				vector.elementCounts.media++;
			}
			
			// Update functional features
			if (element.functionalFeatures.dataAttrs['data-navigation'] || element.functionalFeatures.dataAttrs['data-menu']) {
				vector.functionalFeatures.hasNavigation = true;
			}
			
			if (element.functionalFeatures.dataAttrs['data-form'] || element.nodeType === 'form') {
				vector.functionalFeatures.hasForms = true;
			}
			
			if (element.functionalFeatures.dataAttrs['data-media'] || element.nodeType === 'img') {
				vector.functionalFeatures.hasMedia = true;
			}
			
			if (element.interactive.clickable || element.interactive.focusable) {
				vector.functionalFeatures.hasInteractive = true;
			}
			
			if (element.functionalFeatures.dataAttrs['data-auth'] || element.functionalFeatures.dataAttrs['data-login']) {
				vector.functionalFeatures.hasAuthentication = true;
			}
			
			if (element.functionalFeatures.dataAttrs['data-cart'] || element.functionalFeatures.dataAttrs['data-product']) {
				vector.functionalFeatures.hasEcommerce = true;
			}
			
			// Update content features
			if (element.text && element.text.trim().length > 0) {
				vector.contentFeatures.hasText = true;
			}
			
			if (element.nodeType === 'img') {
				vector.contentFeatures.hasImages = true;
			}
			
			if (element.nodeType === 'video') {
				vector.contentFeatures.hasVideos = true;
			}
			
			if (element.nodeType === 'audio') {
				vector.contentFeatures.hasAudio = true;
			}
			
			if (element.nodeType === 'canvas') {
				vector.contentFeatures.hasCharts = true;
			}
			
			// Update state features
			if (element.visible) {
				vector.stateFeatures.hasVisibleElements = true;
			}
			
			if (element.accessibility.isHidden) {
				vector.stateFeatures.hasHiddenElements = true;
			}
			
			if (element.attributes.disabled) {
				vector.stateFeatures.hasDisabledElements = true;
			}
			
			if (element.attributes.checked || element.attributes.selected) {
				vector.stateFeatures.hasSelectedElements = true;
			}
			
			// Update accessibility features
			if (element.accessibility.hasLabel) {
				vector.accessibilityFeatures.hasAriaLabels = true;
			}
			
			if (element.accessibility.hasDescription) {
				vector.accessibilityFeatures.hasAriaDescriptions = true;
			}
			
			if (element.interactive.focusable) {
				vector.accessibilityFeatures.hasKeyboardNavigation = true;
			}
			
			if (element.accessibility.hasLabel || element.accessibility.hasDescription) {
				vector.accessibilityFeatures.hasScreenReaderSupport = true;
			}
		});

		return vector;
	}

	// Legacy function for backward compatibility
	function collect() {
		return collectEnhanced();
	}

	// Expose functions for scripting
	window.__UICRAWLER_COLLECT__ = collect;
	window.__UICRAWLER_COLLECT_ENHANCED__ = collectEnhanced;

	async function extractLinks() {
		const anchors = Array.from(document.querySelectorAll('a[href]'));
		return anchors
			.map(a => a.getAttribute('href'))
			.filter(Boolean);
	}

	window.__UICRAWLER_LINKS__ = extractLinks;
})();


