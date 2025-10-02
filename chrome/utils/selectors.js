/**
 * Comprehensive CSS selectors for all crawlable objects
 * Based on the Black-Box Crawler Master Reference Document
 */

export const CRAWLABLE_SELECTORS = {
  // 1.1 Navigation & Structural Coverage
  navigation: {
    links: [
      'a[href]',
      'a[onclick]',
      'a[data-href]',
      'a[data-url]',
      '[role="link"]',
      '[data-navigation]',
      '[data-route]'
    ],
    buttons: [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '[role="button"]',
      '[data-action]',
      '[data-click]',
      '[onclick]',
      '[data-toggle]',
      '[data-target]'
    ],
    menus: [
      '[role="menu"]',
      '[role="menubar"]',
      '[role="menuitem"]',
      '.menu',
      '.navbar',
      '.nav',
      '.sidebar',
      '[data-menu]',
      '[aria-haspopup="true"]'
    ],
    iframes: [
      'iframe',
      'embed',
      'object',
      '[data-iframe]'
    ],
    routing: [
      '[data-router]',
      '[data-route]',
      '[data-page]',
      '[data-view]',
      '[data-component]'
    ]
  },

  // 1.2 Forms & Inputs
  forms: {
    textInputs: [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="search"]',
      'input[type="url"]',
      'input[type="tel"]',
      'textarea',
      '[role="textbox"]',
      '[contenteditable="true"]',
      '[contenteditable]'
    ],
    numberInputs: [
      'input[type="number"]',
      'input[type="range"]',
      'input[type="date"]',
      'input[type="time"]',
      'input[type="datetime-local"]'
    ],
    selectionInputs: [
      'input[type="radio"]',
      'input[type="checkbox"]',
      'select',
      'option',
      '[role="radio"]',
      '[role="checkbox"]',
      '[role="combobox"]',
      '[role="listbox"]',
      '[role="option"]'
    ],
    fileInputs: [
      'input[type="file"]',
      '[data-file-upload]',
      '[data-dropzone]'
    ],
    hiddenInputs: [
      'input[type="hidden"]',
      '[data-csrf]',
      '[data-token]',
      '[data-session]'
    ],
    formContainers: [
      'form',
      '[role="form"]',
      '[data-form]',
      '.form-group',
      '.fieldset'
    ]
  },

  // 1.3 Dynamic & Interactive Components
  interactive: {
    modals: [
      '[role="dialog"]',
      '[role="alertdialog"]',
      '.modal',
      '.popup',
      '.overlay',
      '[data-modal]',
      '[data-popup]',
      '[aria-modal="true"]'
    ],
    accordions: [
      '[role="tab"]',
      '[role="tabpanel"]',
      '[role="tablist"]',
      '.accordion',
      '[data-accordion]',
      '[data-collapse]',
      '[aria-expanded]'
    ],
    tabs: [
      '[role="tab"]',
      '[role="tabpanel"]',
      '.tab',
      '[data-tab]',
      '[data-toggle="tab"]'
    ],
    carousels: [
      '.carousel',
      '.slider',
      '.swiper',
      '[data-carousel]',
      '[data-slider]',
      '[data-swiper]'
    ],
    toggles: [
      'input[type="checkbox"][data-toggle]',
      '.toggle',
      '.switch',
      '[data-toggle]',
      '[data-switch]'
    ],
    dragDrop: [
      '[draggable="true"]',
      '[data-draggable]',
      '[data-dropzone]',
      '.drag-handle',
      '.resize-handle'
    ],
    hoverMenus: [
      '[data-hover]',
      '[data-tooltip]',
      '.dropdown',
      '.hover-menu',
      '[aria-haspopup="menu"]'
    ],
    contextMenus: [
      '[data-context]',
      '[data-right-click]',
      '.context-menu'
    ]
  },

  // 1.4 Client-Side Rendering / DOM Changes
  spa: {
    react: [
      '[data-reactroot]',
      '[data-reactid]',
      '.react-component',
      '[data-component]'
    ],
    angular: [
      '[ng-app]',
      '[ng-controller]',
      '[ng-view]',
      '[data-ng]',
      '.ng-scope'
    ],
    vue: [
      '[data-v-]',
      '.vue-component',
      '[data-vue]'
    ],
    shadowDom: [
      'custom-element',
      '[data-shadow]',
      '[data-web-component]'
    ],
    lazyLoaded: [
      '[data-lazy]',
      '[data-defer]',
      '[data-async]',
      '.lazy-load',
      '[loading="lazy"]'
    ]
  },

  // 1.5 Event Handling
  events: {
    clickable: [
      '[onclick]',
      '[data-click]',
      '[data-action]',
      '[data-handler]',
      '.clickable',
      '.interactive'
    ],
    keyboard: [
      '[tabindex]',
      '[data-keyboard]',
      '[data-shortcut]',
      '[data-hotkey]'
    ],
    touch: [
      '[data-touch]',
      '[data-swipe]',
      '[data-pinch]',
      '[data-gesture]'
    ],
    clipboard: [
      '[data-copy]',
      '[data-paste]',
      '[data-clipboard]'
    ]
  },

  // 1.6 Authentication & Sessions
  auth: {
    login: [
      '[data-login]',
      '[data-signin]',
      '.login-form',
      '.auth-form',
      '[data-auth]'
    ],
    session: [
      '[data-session]',
      '[data-token]',
      '[data-user]',
      '[data-role]'
    ],
    logout: [
      '[data-logout]',
      '[data-signout]',
      '.logout',
      '[data-exit]'
    ]
  },

  // 1.7 API & Network Interactions
  api: {
    ajax: [
      '[data-ajax]',
      '[data-fetch]',
      '[data-api]',
      '[data-endpoint]'
    ],
    websockets: [
      '[data-websocket]',
      '[data-socket]',
      '[data-realtime]'
    ]
  },

  // 1.8 Media & Special Elements
  media: {
    video: [
      'video',
      '[data-video]',
      '.video-player',
      '[data-player]'
    ],
    audio: [
      'audio',
      '[data-audio]',
      '.audio-player'
    ],
    canvas: [
      'canvas',
      '[data-canvas]',
      '.chart',
      '.graph'
    ],
    maps: [
      '[data-map]',
      '.map',
      '[data-location]'
    ],
    widgets: [
      '[data-widget]',
      '.widget',
      '[data-embed]',
      '[data-iframe]'
    ]
  },

  // 1.9 Error & Edge Cases
  errors: {
    errorPages: [
      '.error',
      '.not-found',
      '.server-error',
      '[data-error]'
    ],
    emptyStates: [
      '.empty',
      '.no-data',
      '.placeholder',
      '[data-empty]'
    ],
    loading: [
      '.loading',
      '.spinner',
      '.loader',
      '[data-loading]',
      '[aria-busy="true"]'
    ]
  },

  // 1.10 Accessibility & Hidden Elements
  accessibility: {
    aria: [
      '[role]',
      '[aria-label]',
      '[aria-describedby]',
      '[aria-labelledby]',
      '[aria-hidden]',
      '[aria-expanded]',
      '[aria-selected]',
      '[aria-checked]'
    ],
    offscreen: [
      '.sr-only',
      '.screen-reader-only',
      '[aria-hidden="true"]',
      '.visually-hidden'
    ],
    focusable: [
      '[tabindex]',
      'a[href]',
      'button',
      'input',
      'select',
      'textarea'
    ]
  },

  // 1.11 Timing & Async Behaviors
  async: {
    animations: [
      '[data-animation]',
      '.animate',
      '[data-transition]',
      '.transition'
    ],
    asyncContent: [
      '[data-async]',
      '[data-lazy]',
      '[data-defer]'
    ]
  },

  // 1.12 Device & Viewport Variations
  responsive: {
    mobile: [
      '[data-mobile]',
      '.mobile-only',
      '[data-touch]'
    ],
    desktop: [
      '[data-desktop]',
      '.desktop-only',
      '[data-hover]'
    ],
    tablet: [
      '[data-tablet]',
      '.tablet-only'
    ]
  },

  // 1.13 Advanced Product / Feature Variations
  ecommerce: {
    products: [
      '[data-product]',
      '.product',
      '[data-item]'
    ],
    cart: [
      '[data-cart]',
      '.cart',
      '[data-add-to-cart]',
      '[data-buy]'
    ],
    wishlist: [
      '[data-wishlist]',
      '.wishlist',
      '[data-favorite]',
      '[data-like]'
    ],
    variants: [
      '[data-variant]',
      '[data-option]',
      '[data-size]',
      '[data-color]'
    ]
  },

  // 1.14 State & Storage Objects
  storage: {
    localStorage: [
      '[data-storage]',
      '[data-persist]',
      '[data-save]'
    ],
    sessionStorage: [
      '[data-session]',
      '[data-temp]'
    ],
    cookies: [
      '[data-cookie]',
      '[data-tracking]'
    ]
  }
};

/**
 * Get all selectors as a flat array
 */
export function getAllSelectors() {
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

/**
 * Get selectors for a specific category
 */
export function getSelectorsForCategory(category) {
  return CRAWLABLE_SELECTORS[category] || {};
}

/**
 * Get selectors for a specific subcategory
 */
export function getSelectorsForSubcategory(category, subcategory) {
  const cat = CRAWLABLE_SELECTORS[category];
  return cat && cat[subcategory] ? cat[subcategory] : [];
}

/**
 * Check if an element matches any crawlable selector
 */
export function isCrawlableElement(element) {
  const allSelectors = getAllSelectors();
  return allSelectors.some(selector => {
    try {
      return element.matches(selector);
    } catch (e) {
      return false;
    }
  });
}

/**
 * Get the most specific selector for an element
 */
export function getElementSelector(element) {
  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }
  
  // Try class combinations
  if (element.className) {
    const classes = element.className.split(' ').filter(c => c.trim());
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }
  }
  
  // Try data attributes
  const dataAttrs = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('data-'))
    .map(attr => `[${attr.name}="${attr.value}"]`);
  
  if (dataAttrs.length > 0) {
    return `${element.tagName.toLowerCase()}${dataAttrs.join('')}`;
  }
  
  // Fallback to tag name
  return element.tagName.toLowerCase();
}

/**
 * Get element type based on selectors
 */
export function getElementType(element) {
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
