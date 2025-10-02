/**
 * Storage Monitor for tracking LocalStorage, SessionStorage, IndexedDB, cookies, and global state
 * Implements comprehensive storage monitoring and state tracking
 */

export class StorageMonitor {
    constructor() {
        this.storageChanges = [];
        this.cookieChanges = [];
        this.globalStateChanges = [];
        this.isMonitoring = false;
        this.originalLocalStorage = null;
        this.originalSessionStorage = null;
        this.originalCookie = null;
    }

    /**
     * Start storage monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.monitorLocalStorage();
        this.monitorSessionStorage();
        this.monitorCookies();
        this.monitorGlobalState();
        this.monitorIndexedDB();
    }

    /**
     * Stop storage monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.restoreOriginalMethods();
    }

    /**
     * Monitor LocalStorage changes
     */
    monitorLocalStorage() {
        const self = this;
        
        // Override localStorage methods
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        const originalClear = localStorage.clear;
        
        localStorage.setItem = function(key, value) {
            const change = {
                type: 'localStorage_set',
                key: key,
                value: value,
                timestamp: Date.now(),
                oldValue: localStorage.getItem(key)
            };
            
            self.recordStorageChange(change);
            return originalSetItem.call(this, key, value);
        };
        
        localStorage.removeItem = function(key) {
            const change = {
                type: 'localStorage_remove',
                key: key,
                value: null,
                timestamp: Date.now(),
                oldValue: localStorage.getItem(key)
            };
            
            self.recordStorageChange(change);
            return originalRemoveItem.call(this, key);
        };
        
        localStorage.clear = function() {
            const change = {
                type: 'localStorage_clear',
                key: null,
                value: null,
                timestamp: Date.now(),
                oldValue: JSON.stringify(localStorage)
            };
            
            self.recordStorageChange(change);
            return originalClear.call(this);
        };
        
        // Monitor storage events
        window.addEventListener('storage', (event) => {
            if (event.storageArea === localStorage) {
                const change = {
                    type: 'localStorage_event',
                    key: event.key,
                    value: event.newValue,
                    oldValue: event.oldValue,
                    timestamp: Date.now(),
                    url: event.url
                };
                
                self.recordStorageChange(change);
            }
        });
    }

    /**
     * Monitor SessionStorage changes
     */
    monitorSessionStorage() {
        const self = this;
        
        // Override sessionStorage methods
        const originalSetItem = sessionStorage.setItem;
        const originalRemoveItem = sessionStorage.removeItem;
        const originalClear = sessionStorage.clear;
        
        sessionStorage.setItem = function(key, value) {
            const change = {
                type: 'sessionStorage_set',
                key: key,
                value: value,
                timestamp: Date.now(),
                oldValue: sessionStorage.getItem(key)
            };
            
            self.recordStorageChange(change);
            return originalSetItem.call(this, key, value);
        };
        
        sessionStorage.removeItem = function(key) {
            const change = {
                type: 'sessionStorage_remove',
                key: key,
                value: null,
                timestamp: Date.now(),
                oldValue: sessionStorage.getItem(key)
            };
            
            self.recordStorageChange(change);
            return originalRemoveItem.call(this, key);
        };
        
        sessionStorage.clear = function() {
            const change = {
                type: 'sessionStorage_clear',
                key: null,
                value: null,
                timestamp: Date.now(),
                oldValue: JSON.stringify(sessionStorage)
            };
            
            self.recordStorageChange(change);
            return originalClear.call(this);
        };
        
        // Monitor storage events
        window.addEventListener('storage', (event) => {
            if (event.storageArea === sessionStorage) {
                const change = {
                    type: 'sessionStorage_event',
                    key: event.key,
                    value: event.newValue,
                    oldValue: event.oldValue,
                    timestamp: Date.now(),
                    url: event.url
                };
                
                self.recordStorageChange(change);
            }
        });
    }

    /**
     * Monitor cookie changes
     */
    monitorCookies() {
        const self = this;
        
        // Override document.cookie
        const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie');
        Object.defineProperty(document, 'cookie', {
            get: function() {
                return originalCookie.get.call(this);
            },
            set: function(value) {
                const change = {
                    type: 'cookie_set',
                    value: value,
                    timestamp: Date.now(),
                    oldValue: originalCookie.get.call(this)
                };
                
                self.recordCookieChange(change);
                return originalCookie.set.call(this, value);
            }
        });
        
        // Monitor cookie changes periodically
        setInterval(() => {
            const currentCookies = self.getCookies();
            const previousCookies = self.previousCookies || {};
            
            Object.keys(currentCookies).forEach(key => {
                if (currentCookies[key] !== previousCookies[key]) {
                    const change = {
                        type: 'cookie_change',
                        key: key,
                        value: currentCookies[key],
                        oldValue: previousCookies[key],
                        timestamp: Date.now()
                    };
                    
                    self.recordCookieChange(change);
                }
            });
            
            self.previousCookies = currentCookies;
        }, 1000);
    }

    /**
     * Monitor global state changes
     */
    monitorGlobalState() {
        const self = this;
        
        // Monitor window object changes
        const originalWindow = window;
        const windowProxy = new Proxy(originalWindow, {
            set: function(target, property, value) {
                const change = {
                    type: 'global_state_set',
                    property: property,
                    value: value,
                    timestamp: Date.now(),
                    oldValue: target[property]
                };
                
                self.recordGlobalStateChange(change);
                target[property] = value;
                return true;
            }
        });
        
        // Monitor global variables
        const globalVars = ['user', 'cart', 'wishlist', 'theme', 'language', 'currency'];
        globalVars.forEach(varName => {
            if (window[varName] !== undefined) {
                const change = {
                    type: 'global_variable',
                    name: varName,
                    value: window[varName],
                    timestamp: Date.now()
                };
                
                self.recordGlobalStateChange(change);
            }
        });
    }

    /**
     * Monitor IndexedDB changes
     */
    monitorIndexedDB() {
        const self = this;
        
        // Override IndexedDB methods
        const originalOpen = indexedDB.open;
        indexedDB.open = function(name, version) {
            const change = {
                type: 'indexedDB_open',
                name: name,
                version: version,
                timestamp: Date.now()
            };
            
            self.recordStorageChange(change);
            return originalOpen.call(this, name, version);
        };
        
        // Monitor IndexedDB transactions
        const originalTransaction = IDBDatabase.prototype.transaction;
        IDBDatabase.prototype.transaction = function(storeNames, mode) {
            const change = {
                type: 'indexedDB_transaction',
                storeNames: storeNames,
                mode: mode,
                timestamp: Date.now()
            };
            
            self.recordStorageChange(change);
            return originalTransaction.call(this, storeNames, mode);
        };
    }

    /**
     * Record storage change
     */
    recordStorageChange(change) {
        this.storageChanges.push(change);
    }

    /**
     * Record cookie change
     */
    recordCookieChange(change) {
        this.cookieChanges.push(change);
    }

    /**
     * Record global state change
     */
    recordGlobalStateChange(change) {
        this.globalStateChanges.push(change);
    }

    /**
     * Get all cookies
     */
    getCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = value;
            }
        });
        return cookies;
    }

    /**
     * Analyze storage patterns
     */
    analyzeStoragePatterns() {
        const patterns = {
            localStorage: this.analyzeLocalStoragePatterns(),
            sessionStorage: this.analyzeSessionStoragePatterns(),
            cookies: this.analyzeCookiePatterns(),
            globalState: this.analyzeGlobalStatePatterns()
        };
        
        return patterns;
    }

    /**
     * Analyze LocalStorage patterns
     */
    analyzeLocalStoragePatterns() {
        const patterns = {
            totalChanges: 0,
            byKey: {},
            byType: {},
            frequency: {},
            size: 0
        };
        
        this.storageChanges.forEach(change => {
            if (change.type.includes('localStorage')) {
                patterns.totalChanges++;
                
                if (change.key) {
                    patterns.byKey[change.key] = (patterns.byKey[change.key] || 0) + 1;
                }
                
                patterns.byType[change.type] = (patterns.byType[change.type] || 0) + 1;
                
                if (change.value) {
                    patterns.size += change.value.length;
                }
            }
        });
        
        return patterns;
    }

    /**
     * Analyze SessionStorage patterns
     */
    analyzeSessionStoragePatterns() {
        const patterns = {
            totalChanges: 0,
            byKey: {},
            byType: {},
            frequency: {},
            size: 0
        };
        
        this.storageChanges.forEach(change => {
            if (change.type.includes('sessionStorage')) {
                patterns.totalChanges++;
                
                if (change.key) {
                    patterns.byKey[change.key] = (patterns.byKey[change.key] || 0) + 1;
                }
                
                patterns.byType[change.type] = (patterns.byType[change.type] || 0) + 1;
                
                if (change.value) {
                    patterns.size += change.value.length;
                }
            }
        });
        
        return patterns;
    }

    /**
     * Analyze cookie patterns
     */
    analyzeCookiePatterns() {
        const patterns = {
            totalChanges: 0,
            byKey: {},
            byType: {},
            frequency: {},
            size: 0
        };
        
        this.cookieChanges.forEach(change => {
            patterns.totalChanges++;
            
            if (change.key) {
                patterns.byKey[change.key] = (patterns.byKey[change.key] || 0) + 1;
            }
            
            patterns.byType[change.type] = (patterns.byType[change.type] || 0) + 1;
            
            if (change.value) {
                patterns.size += change.value.length;
            }
        });
        
        return patterns;
    }

    /**
     * Analyze global state patterns
     */
    analyzeGlobalStatePatterns() {
        const patterns = {
            totalChanges: 0,
            byProperty: {},
            byType: {},
            frequency: {},
            size: 0
        };
        
        this.globalStateChanges.forEach(change => {
            patterns.totalChanges++;
            
            if (change.property) {
                patterns.byProperty[change.property] = (patterns.byProperty[change.property] || 0) + 1;
            }
            
            patterns.byType[change.type] = (patterns.byType[change.type] || 0) + 1;
            
            if (change.value) {
                patterns.size += JSON.stringify(change.value).length;
            }
        });
        
        return patterns;
    }

    /**
     * Detect storage-related UI changes
     */
    detectStorageUIChanges() {
        const uiChanges = [];
        
        // Check for cart changes
        const cartElements = document.querySelectorAll('[data-cart], .cart, .shopping-cart');
        cartElements.forEach(element => {
            const cartData = this.getCartData();
            if (cartData) {
                uiChanges.push({
                    type: 'cart_change',
                    element: element,
                    data: cartData,
                    timestamp: Date.now()
                });
            }
        });
        
        // Check for wishlist changes
        const wishlistElements = document.querySelectorAll('[data-wishlist], .wishlist, .favorites');
        wishlistElements.forEach(element => {
            const wishlistData = this.getWishlistData();
            if (wishlistData) {
                uiChanges.push({
                    type: 'wishlist_change',
                    element: element,
                    data: wishlistData,
                    timestamp: Date.now()
                });
            }
        });
        
        // Check for theme changes
        const themeElements = document.querySelectorAll('[data-theme], .theme, .dark-mode, .light-mode');
        themeElements.forEach(element => {
            const themeData = this.getThemeData();
            if (themeData) {
                uiChanges.push({
                    type: 'theme_change',
                    element: element,
                    data: themeData,
                    timestamp: Date.now()
                });
            }
        });
        
        return uiChanges;
    }

    /**
     * Get cart data
     */
    getCartData() {
        const cartData = {
            localStorage: localStorage.getItem('cart'),
            sessionStorage: sessionStorage.getItem('cart'),
            cookies: this.getCookies().cart,
            globalState: window.cart
        };
        
        return Object.values(cartData).some(value => value !== null) ? cartData : null;
    }

    /**
     * Get wishlist data
     */
    getWishlistData() {
        const wishlistData = {
            localStorage: localStorage.getItem('wishlist'),
            sessionStorage: sessionStorage.getItem('wishlist'),
            cookies: this.getCookies().wishlist,
            globalState: window.wishlist
        };
        
        return Object.values(wishlistData).some(value => value !== null) ? wishlistData : null;
    }

    /**
     * Get theme data
     */
    getThemeData() {
        const themeData = {
            localStorage: localStorage.getItem('theme'),
            sessionStorage: sessionStorage.getItem('theme'),
            cookies: this.getCookies().theme,
            globalState: window.theme,
            className: document.body.className
        };
        
        return Object.values(themeData).some(value => value !== null) ? themeData : null;
    }

    /**
     * Get storage statistics
     */
    getStorageStatistics() {
        const stats = {
            localStorage: {
                totalChanges: this.storageChanges.filter(c => c.type.includes('localStorage')).length,
                size: this.getLocalStorageSize(),
                keys: Object.keys(localStorage).length
            },
            sessionStorage: {
                totalChanges: this.storageChanges.filter(c => c.type.includes('sessionStorage')).length,
                size: this.getSessionStorageSize(),
                keys: Object.keys(sessionStorage).length
            },
            cookies: {
                totalChanges: this.cookieChanges.length,
                size: this.getCookieSize(),
                keys: Object.keys(this.getCookies()).length
            },
            globalState: {
                totalChanges: this.globalStateChanges.length,
                size: this.getGlobalStateSize()
            }
        };
        
        return stats;
    }

    /**
     * Get LocalStorage size
     */
    getLocalStorageSize() {
        let size = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                size += localStorage[key].length + key.length;
            }
        }
        return size;
    }

    /**
     * Get SessionStorage size
     */
    getSessionStorageSize() {
        let size = 0;
        for (let key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
                size += sessionStorage[key].length + key.length;
            }
        }
        return size;
    }

    /**
     * Get cookie size
     */
    getCookieSize() {
        return document.cookie.length;
    }

    /**
     * Get global state size
     */
    getGlobalStateSize() {
        let size = 0;
        const globalVars = ['user', 'cart', 'wishlist', 'theme', 'language', 'currency'];
        globalVars.forEach(varName => {
            if (window[varName] !== undefined) {
                size += JSON.stringify(window[varName]).length;
            }
        });
        return size;
    }

    /**
     * Export storage data
     */
    exportStorageData() {
        return {
            storageChanges: this.storageChanges,
            cookieChanges: this.cookieChanges,
            globalStateChanges: this.globalStateChanges,
            patterns: this.analyzeStoragePatterns(),
            statistics: this.getStorageStatistics(),
            uiChanges: this.detectStorageUIChanges(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear all storage data
     */
    clearData() {
        this.storageChanges = [];
        this.cookieChanges = [];
        this.globalStateChanges = [];
    }

    /**
     * Restore original methods
     */
    restoreOriginalMethods() {
        // Note: This is a simplified approach. In a real implementation,
        // you'd need to properly restore the original methods
        this.originalLocalStorage = null;
        this.originalSessionStorage = null;
        this.originalCookie = null;
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalStorageChanges: this.storageChanges.length,
            totalCookieChanges: this.cookieChanges.length,
            totalGlobalStateChanges: this.globalStateChanges.length
        };
    }
}
