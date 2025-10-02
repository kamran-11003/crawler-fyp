/**
 * Feature-aware hashing and functional equivalence detection
 * Implements smart deduplication based on functional features rather than cosmetic differences
 */

/**
 * Hash a string using SHA-256
 */
export async function hashString(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash a DOM element based on its functional features
 */
export function hashElement(element) {
  const features = extractElementFeatures(element);
  return hashFeatures(features);
}

/**
 * Extract functional features from an element (ignoring cosmetic differences)
 */
export function extractElementFeatures(element) {
  const features = {
    // Structural features
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute('role') || null,
    type: element.getAttribute('type') || null,
    
    // Functional attributes
    functionalAttrs: {},
    
    // Interactive capabilities
    interactive: {
      clickable: isClickable(element),
      focusable: isFocusable(element),
      draggable: element.draggable || false,
      editable: isEditable(element)
    },
    
    // Content features (semantic, not visual)
    content: {
      hasText: hasTextContent(element),
      hasImage: hasImageContent(element),
      hasForm: hasFormContent(element),
      hasLink: hasLinkContent(element)
    },
    
    // State features
    state: {
      visible: isVisible(element),
      enabled: !element.disabled,
      selected: element.selected || false,
      checked: element.checked || false,
      expanded: element.getAttribute('aria-expanded') === 'true'
    },
    
    // Functional data attributes
    dataAttrs: extractDataAttributes(element),
    
    // Accessibility features
    accessibility: {
      hasLabel: hasAccessibleLabel(element),
      hasDescription: hasAccessibleDescription(element),
      isHidden: element.getAttribute('aria-hidden') === 'true'
    }
  };
  
  return features;
}

/**
 * Hash a set of features
 */
export function hashFeatures(features) {
  const featureString = JSON.stringify(features, Object.keys(features).sort());
  return btoa(featureString).replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Extract functional data attributes (ignore cosmetic ones)
 */
function extractDataAttributes(element) {
  const functionalDataAttrs = [
    'data-action', 'data-click', 'data-toggle', 'data-target',
    'data-route', 'data-page', 'data-component', 'data-widget',
    'data-form', 'data-submit', 'data-validate', 'data-required',
    'data-modal', 'data-popup', 'data-dialog', 'data-accordion',
    'data-tab', 'data-carousel', 'data-slider', 'data-menu',
    'data-dropdown', 'data-tooltip', 'data-context', 'data-draggable',
    'data-dropzone', 'data-upload', 'data-download', 'data-api',
    'data-ajax', 'data-fetch', 'data-endpoint', 'data-auth',
    'data-login', 'data-logout', 'data-session', 'data-role',
    'data-permission', 'data-feature', 'data-flag', 'data-variant',
    'data-size', 'data-color', 'data-option', 'data-selection',
    'data-cart', 'data-wishlist', 'data-favorite', 'data-like',
    'data-share', 'data-copy', 'data-paste', 'data-clipboard',
    'data-keyboard', 'data-shortcut', 'data-hotkey', 'data-touch',
    'data-swipe', 'data-pinch', 'data-gesture', 'data-mobile',
    'data-desktop', 'data-tablet', 'data-responsive', 'data-viewport',
    'data-lazy', 'data-async', 'data-defer', 'data-loading',
    'data-animation', 'data-transition', 'data-effect', 'data-timing',
    'data-storage', 'data-persist', 'data-save', 'data-cache',
    'data-session', 'data-temp', 'data-cookie', 'data-tracking',
    'data-analytics', 'data-metrics', 'data-stats', 'data-reporting',
    'data-error', 'data-validation', 'data-required', 'data-optional',
    'data-disabled', 'data-enabled', 'data-visible', 'data-hidden',
    'data-selected', 'data-checked', 'data-expanded', 'data-collapsed',
    'data-active', 'data-inactive', 'data-current', 'data-previous',
    'data-next', 'data-first', 'data-last', 'data-index',
    'data-count', 'data-total', 'data-limit', 'data-offset',
    'data-page', 'data-size', 'data-sort', 'data-filter',
    'data-search', 'data-query', 'data-term', 'data-keyword',
    'data-category', 'data-tag', 'data-label', 'data-group',
    'data-section', 'data-area', 'data-zone', 'data-region',
    'data-container', 'data-wrapper', 'data-holder', 'data-content',
    'data-header', 'data-footer', 'data-sidebar', 'data-main',
    'data-navigation', 'data-menu', 'data-breadcrumb', 'data-pagination'
  ];
  
  const attrs = {};
  functionalDataAttrs.forEach(attr => {
    const value = element.getAttribute(attr);
    if (value !== null) {
      attrs[attr] = value;
    }
  });
  
  return attrs;
}

/**
 * Check if element is clickable
 */
function isClickable(element) {
  const clickableTags = ['a', 'button', 'input', 'select', 'textarea'];
  const clickableRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
  
  return clickableTags.includes(element.tagName.toLowerCase()) ||
         clickableRoles.includes(element.getAttribute('role')) ||
         element.onclick !== null ||
         element.getAttribute('data-click') !== null ||
         element.getAttribute('data-action') !== null;
}

/**
 * Check if element is focusable
 */
function isFocusable(element) {
  const focusableTags = ['a', 'button', 'input', 'select', 'textarea'];
  const hasTabIndex = element.tabIndex >= 0;
  
  return focusableTags.includes(element.tagName.toLowerCase()) ||
         hasTabIndex ||
         element.getAttribute('role') === 'button' ||
         element.getAttribute('role') === 'link';
}

/**
 * Check if element is editable
 */
function isEditable(element) {
  const editableTags = ['input', 'textarea', 'select'];
  const isContentEditable = element.contentEditable === 'true';
  
  return editableTags.includes(element.tagName.toLowerCase()) ||
         isContentEditable ||
         element.getAttribute('role') === 'textbox';
}

/**
 * Check if element has text content
 */
function hasTextContent(element) {
  return element.textContent.trim().length > 0;
}

/**
 * Check if element has image content
 */
function hasImageContent(element) {
  return element.tagName.toLowerCase() === 'img' ||
         element.querySelector('img') !== null ||
         element.style.backgroundImage !== '';
}

/**
 * Check if element has form content
 */
function hasFormContent(element) {
  return element.tagName.toLowerCase() === 'form' ||
         element.querySelector('input, select, textarea') !== null;
}

/**
 * Check if element has link content
 */
function hasLinkContent(element) {
  return element.tagName.toLowerCase() === 'a' ||
         element.querySelector('a') !== null ||
         element.getAttribute('href') !== null;
}

/**
 * Check if element is visible
 */
function isVisible(element) {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0' &&
         element.offsetWidth > 0 &&
         element.offsetHeight > 0;
}

/**
 * Check if element has accessible label
 */
function hasAccessibleLabel(element) {
  return element.getAttribute('aria-label') !== null ||
         element.getAttribute('aria-labelledby') !== null ||
         element.querySelector('label') !== null ||
         element.getAttribute('title') !== null;
}

/**
 * Check if element has accessible description
 */
function hasAccessibleDescription(element) {
  return element.getAttribute('aria-describedby') !== null ||
         element.getAttribute('aria-description') !== null;
}

/**
 * Create a functional state vector for a page
 */
export function createStateVector(elements) {
  const vector = {
    // Element counts by type
    elementCounts: {
      links: 0,
      buttons: 0,
      inputs: 0,
      forms: 0,
      interactive: 0,
      media: 0
    },
    
    // Functional features
    functionalFeatures: {
      hasNavigation: false,
      hasForms: false,
      hasMedia: false,
      hasInteractive: false,
      hasAuthentication: false,
      hasEcommerce: false
    },
    
    // Content features
    contentFeatures: {
      hasText: false,
      hasImages: false,
      hasVideos: false,
      hasAudio: false,
      hasCharts: false
    },
    
    // State features
    stateFeatures: {
      hasVisibleElements: false,
      hasHiddenElements: false,
      hasDisabledElements: false,
      hasSelectedElements: false
    },
    
    // Accessibility features
    accessibilityFeatures: {
      hasAriaLabels: false,
      hasAriaDescriptions: false,
      hasKeyboardNavigation: false,
      hasScreenReaderSupport: false
    }
  };
  
  elements.forEach(element => {
    const features = extractElementFeatures(element);
    
    // Count elements by type
    if (features.interactive.clickable) {
      vector.elementCounts.interactive++;
    }
    
    if (element.tagName.toLowerCase() === 'a') {
      vector.elementCounts.links++;
    }
    
    if (element.tagName.toLowerCase() === 'button') {
      vector.elementCounts.buttons++;
    }
    
    if (['input', 'select', 'textarea'].includes(element.tagName.toLowerCase())) {
      vector.elementCounts.inputs++;
    }
    
    if (element.tagName.toLowerCase() === 'form') {
      vector.elementCounts.forms++;
    }
    
    if (['img', 'video', 'audio', 'canvas'].includes(element.tagName.toLowerCase())) {
      vector.elementCounts.media++;
    }
    
    // Update functional features
    if (features.dataAttrs['data-navigation'] || features.dataAttrs['data-menu']) {
      vector.functionalFeatures.hasNavigation = true;
    }
    
    if (features.dataAttrs['data-form'] || element.tagName.toLowerCase() === 'form') {
      vector.functionalFeatures.hasForms = true;
    }
    
    if (features.dataAttrs['data-media'] || features.content.hasImage) {
      vector.functionalFeatures.hasMedia = true;
    }
    
    if (features.interactive.clickable || features.interactive.focusable) {
      vector.functionalFeatures.hasInteractive = true;
    }
    
    if (features.dataAttrs['data-auth'] || features.dataAttrs['data-login']) {
      vector.functionalFeatures.hasAuthentication = true;
    }
    
    if (features.dataAttrs['data-cart'] || features.dataAttrs['data-product']) {
      vector.functionalFeatures.hasEcommerce = true;
    }
    
    // Update content features
    if (features.content.hasText) {
      vector.contentFeatures.hasText = true;
    }
    
    if (features.content.hasImage) {
      vector.contentFeatures.hasImages = true;
    }
    
    if (element.tagName.toLowerCase() === 'video') {
      vector.contentFeatures.hasVideos = true;
    }
    
    if (element.tagName.toLowerCase() === 'audio') {
      vector.contentFeatures.hasAudio = true;
    }
    
    if (element.tagName.toLowerCase() === 'canvas') {
      vector.contentFeatures.hasCharts = true;
    }
    
    // Update state features
    if (features.state.visible) {
      vector.stateFeatures.hasVisibleElements = true;
    }
    
    if (features.accessibility.isHidden) {
      vector.stateFeatures.hasHiddenElements = true;
    }
    
    if (!features.state.enabled) {
      vector.stateFeatures.hasDisabledElements = true;
    }
    
    if (features.state.selected || features.state.checked) {
      vector.stateFeatures.hasSelectedElements = true;
    }
    
    // Update accessibility features
    if (features.accessibility.hasLabel) {
      vector.accessibilityFeatures.hasAriaLabels = true;
    }
    
    if (features.accessibility.hasDescription) {
      vector.accessibilityFeatures.hasAriaDescriptions = true;
    }
    
    if (features.interactive.focusable) {
      vector.accessibilityFeatures.hasKeyboardNavigation = true;
    }
    
    if (features.accessibility.hasLabel || features.accessibility.hasDescription) {
      vector.accessibilityFeatures.hasScreenReaderSupport = true;
    }
  });
  
  return vector;
}

/**
 * Hash a state vector
 */
export function hashStateVector(vector) {
  return hashFeatures(vector);
}

/**
 * Check if two state vectors are functionally equivalent
 */
export function areStateVectorsEquivalent(vector1, vector2, threshold = 0.8) {
  const similarity = calculateStateVectorSimilarity(vector1, vector2);
  return similarity >= threshold;
}

/**
 * Calculate similarity between two state vectors
 */
export function calculateStateVectorSimilarity(vector1, vector2) {
  let totalFeatures = 0;
  let matchingFeatures = 0;
  
  // Compare element counts
  for (const [key, value1] of Object.entries(vector1.elementCounts)) {
    const value2 = vector2.elementCounts[key] || 0;
    totalFeatures++;
    if (Math.abs(value1 - value2) <= 1) { // Allow small differences
      matchingFeatures++;
    }
  }
  
  // Compare functional features
  for (const [key, value1] of Object.entries(vector1.functionalFeatures)) {
    const value2 = vector2.functionalFeatures[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare content features
  for (const [key, value1] of Object.entries(vector1.contentFeatures)) {
    const value2 = vector2.contentFeatures[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare state features
  for (const [key, value1] of Object.entries(vector1.stateFeatures)) {
    const value2 = vector2.stateFeatures[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  // Compare accessibility features
  for (const [key, value1] of Object.entries(vector1.accessibilityFeatures)) {
    const value2 = vector2.accessibilityFeatures[key] || false;
    totalFeatures++;
    if (value1 === value2) {
      matchingFeatures++;
    }
  }
  
  return totalFeatures > 0 ? matchingFeatures / totalFeatures : 0;
}

/**
 * Create a page fingerprint based on functional features
 */
export async function createPageFingerprint(elements, url, title) {
  const stateVector = createStateVector(elements);
  const vectorHash = hashStateVector(stateVector);
  
  // Create a composite hash including URL structure and title keywords
  const urlStructure = extractUrlStructure(url);
  const titleKeywords = extractTitleKeywords(title);
  
  const fingerprint = {
    vectorHash,
    urlStructure,
    titleKeywords,
    elementCount: elements.length,
    functionalFeatures: stateVector.functionalFeatures,
    timestamp: Date.now()
  };
  
  return fingerprint;
}

/**
 * Extract URL structure (ignoring specific values)
 */
function extractUrlStructure(url) {
  try {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(segment => segment.length > 0);
    
    // Replace numeric segments with placeholders
    const structuredPath = pathSegments.map(segment => {
      if (/^\d+$/.test(segment)) {
        return '{id}';
      }
      if (/^[a-f0-9-]{8,}$/i.test(segment)) {
        return '{uuid}';
      }
      return segment;
    });
    
    return {
      hostname: urlObj.hostname,
      path: structuredPath.join('/'),
      hasQuery: urlObj.search.length > 0,
      hasHash: urlObj.hash.length > 0
    };
  } catch (e) {
    return { hostname: 'unknown', path: 'unknown', hasQuery: false, hasHash: false };
  }
}

/**
 * Extract keywords from title
 */
function extractTitleKeywords(title) {
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = title.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));
  
  return words.slice(0, 5); // Take first 5 meaningful words
}
