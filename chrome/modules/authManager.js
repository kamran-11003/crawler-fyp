/**
 * Authentication Manager for comprehensive auth handling
 * Implements JWT token detection, session expiry handling, and role-based UI crawling
 */

export class AuthManager {
    constructor() {
        this.authState = {
            isAuthenticated: false,
            user: null,
            roles: [],
            permissions: [],
            sessionExpiry: null,
            tokens: new Map(),
            loginForms: [],
            logoutButtons: []
        };
        this.isMonitoring = false;
        this.sessionCheckInterval = null;
        this.originalFetch = null;
        this.originalXHR = null;
    }

    /**
     * Start authentication monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.detectAuthState();
        this.monitorAuthChanges();
        this.monitorSessionExpiry();
        this.detectLoginForms();
        this.detectLogoutButtons();
        this.monitorNetworkAuth();
    }

    /**
     * Stop authentication monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }
        this.restoreOriginalMethods();
    }

    /**
     * Detect current authentication state
     */
    detectAuthState() {
        this.authState.isAuthenticated = this.checkAuthenticationStatus();
        this.authState.user = this.detectUser();
        this.authState.roles = this.detectRoles();
        this.authState.permissions = this.detectPermissions();
        this.authState.sessionExpiry = this.detectSessionExpiry();
        this.authState.tokens = this.detectTokens();
        
        return this.authState;
    }

    /**
     * Check if user is authenticated
     */
    checkAuthenticationStatus() {
        // Check localStorage for auth indicators
        const authKeys = Object.keys(localStorage).filter(key => 
            key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('session')
        );
        
        // Check sessionStorage for auth indicators
        const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
            key.includes('auth') || key.includes('token') || key.includes('user') || key.includes('session')
        );
        
        // Check cookies for auth indicators
        const authCookies = document.cookie.split(';').filter(cookie => 
            cookie.includes('auth') || cookie.includes('token') || cookie.includes('session')
        );
        
        // Check for JWT tokens
        const jwtTokens = this.detectJWTTokens();
        
        // Check for auth UI elements
        const authElements = document.querySelectorAll('.user, .profile, .account, .dashboard, .logout');
        
        return authKeys.length > 0 || sessionAuthKeys.length > 0 || authCookies.length > 0 || 
               jwtTokens.length > 0 || authElements.length > 0;
    }

    /**
     * Detect user information
     */
    detectUser() {
        const user = {
            id: null,
            name: null,
            email: null,
            avatar: null,
            profile: null
        };
        
        // Check localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('user') || key.includes('profile')) {
                try {
                    const userData = JSON.parse(localStorage.getItem(key));
                    if (userData && typeof userData === 'object') {
                        user.id = userData.id || userData.userId || userData._id || user.id;
                        user.name = userData.name || userData.username || userData.displayName || user.name;
                        user.email = userData.email || userData.emailAddress || user.email;
                        user.avatar = userData.avatar || userData.picture || userData.image || user.avatar;
                        user.profile = userData;
                    }
                } catch (e) {
                    // Not JSON, might be a simple value
                    if (key.includes('name') || key.includes('username')) {
                        user.name = localStorage.getItem(key);
                    } else if (key.includes('email')) {
                        user.email = localStorage.getItem(key);
                    }
                }
            }
        });
        
        // Check sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            if (key.includes('user') || key.includes('profile')) {
                try {
                    const userData = JSON.parse(sessionStorage.getItem(key));
                    if (userData && typeof userData === 'object') {
                        user.id = userData.id || userData.userId || userData._id || user.id;
                        user.name = userData.name || userData.username || userData.displayName || user.name;
                        user.email = userData.email || userData.emailAddress || user.email;
                        user.avatar = userData.avatar || userData.picture || userData.image || user.avatar;
                        user.profile = userData;
                    }
                } catch (e) {
                    // Not JSON, might be a simple value
                    if (key.includes('name') || key.includes('username')) {
                        user.name = sessionStorage.getItem(key);
                    } else if (key.includes('email')) {
                        user.email = sessionStorage.getItem(key);
                    }
                }
            }
        });
        
        // Check DOM for user info
        const userElements = document.querySelectorAll('.user-name, .username, .profile-name, [data-user-name]');
        if (userElements.length > 0) {
            user.name = userElements[0].textContent.trim();
        }
        
        const emailElements = document.querySelectorAll('.user-email, .email, [data-user-email]');
        if (emailElements.length > 0) {
            user.email = emailElements[0].textContent.trim();
        }
        
        const avatarElements = document.querySelectorAll('.avatar, .profile-pic, .user-image, img[alt*="avatar"]');
        if (avatarElements.length > 0) {
            user.avatar = avatarElements[0].src;
        }
        
        return user;
    }

    /**
     * Detect user roles
     */
    detectRoles() {
        const roles = [];
        
        // Check localStorage for roles
        Object.keys(localStorage).forEach(key => {
            if (key.includes('role') || key.includes('permission')) {
                try {
                    const roleData = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(roleData)) {
                        roles.push(...roleData);
                    } else if (typeof roleData === 'string') {
                        roles.push(roleData);
                    }
                } catch (e) {
                    roles.push(localStorage.getItem(key));
                }
            }
        });
        
        // Check sessionStorage for roles
        Object.keys(sessionStorage).forEach(key => {
            if (key.includes('role') || key.includes('permission')) {
                try {
                    const roleData = JSON.parse(sessionStorage.getItem(key));
                    if (Array.isArray(roleData)) {
                        roles.push(...roleData);
                    } else if (typeof roleData === 'string') {
                        roles.push(roleData);
                    }
                } catch (e) {
                    roles.push(sessionStorage.getItem(key));
                }
            }
        });
        
        // Check DOM for role indicators
        const roleElements = document.querySelectorAll('[data-role], .role, .user-role, [data-user-role]');
        roleElements.forEach(element => {
            const role = element.textContent.trim() || element.getAttribute('data-role');
            if (role) {
                roles.push(role);
            }
        });
        
        // Check for common role indicators
        const roleIndicators = ['admin', 'user', 'guest', 'moderator', 'manager', 'superuser'];
        roleIndicators.forEach(role => {
            if (document.body.classList.contains(role) || 
                document.body.getAttribute('data-role') === role ||
                document.querySelector(`.${role}, [data-role="${role}"]`)) {
                roles.push(role);
            }
        });
        
        return [...new Set(roles)]; // Remove duplicates
    }

    /**
     * Detect user permissions
     */
    detectPermissions() {
        const permissions = [];
        
        // Check localStorage for permissions
        Object.keys(localStorage).forEach(key => {
            if (key.includes('permission') || key.includes('access')) {
                try {
                    const permData = JSON.parse(localStorage.getItem(key));
                    if (Array.isArray(permData)) {
                        permissions.push(...permData);
                    } else if (typeof permData === 'string') {
                        permissions.push(permData);
                    }
                } catch (e) {
                    permissions.push(localStorage.getItem(key));
                }
            }
        });
        
        // Check DOM for permission indicators
        const permissionElements = document.querySelectorAll('[data-permission], .permission, [data-access]');
        permissionElements.forEach(element => {
            const permission = element.textContent.trim() || 
                              element.getAttribute('data-permission') || 
                              element.getAttribute('data-access');
            if (permission) {
                permissions.push(permission);
            }
        });
        
        return [...new Set(permissions)]; // Remove duplicates
    }

    /**
     * Detect session expiry
     */
    detectSessionExpiry() {
        const expiry = {
            timestamp: null,
            duration: null,
            remaining: null
        };
        
        // Check localStorage for session expiry
        Object.keys(localStorage).forEach(key => {
            if (key.includes('expiry') || key.includes('expires') || key.includes('timeout')) {
                const value = localStorage.getItem(key);
                const timestamp = parseInt(value);
                if (!isNaN(timestamp)) {
                    expiry.timestamp = timestamp;
                    expiry.remaining = timestamp - Date.now();
                }
            }
        });
        
        // Check sessionStorage for session expiry
        Object.keys(sessionStorage).forEach(key => {
            if (key.includes('expiry') || key.includes('expires') || key.includes('timeout')) {
                const value = sessionStorage.getItem(key);
                const timestamp = parseInt(value);
                if (!isNaN(timestamp)) {
                    expiry.timestamp = timestamp;
                    expiry.remaining = timestamp - Date.now();
                }
            }
        });
        
        // Check cookies for session expiry
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            if (cookie.includes('expires') || cookie.includes('max-age')) {
                const parts = cookie.split('=');
                if (parts.length === 2) {
                    const value = parts[1].trim();
                    const timestamp = parseInt(value);
                    if (!isNaN(timestamp)) {
                        expiry.timestamp = timestamp;
                        expiry.remaining = timestamp - Date.now();
                    }
                }
            }
        });
        
        return expiry;
    }

    /**
     * Detect JWT tokens
     */
    detectJWTTokens() {
        const tokens = [];
        const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
        
        // Check localStorage
        Object.keys(localStorage).forEach(key => {
            const value = localStorage.getItem(key);
            if (jwtPattern.test(value)) {
                tokens.push({
                    source: 'localStorage',
                    key: key,
                    token: value,
                    decoded: this.decodeJWT(value)
                });
            }
        });
        
        // Check sessionStorage
        Object.keys(sessionStorage).forEach(key => {
            const value = sessionStorage.getItem(key);
            if (jwtPattern.test(value)) {
                tokens.push({
                    source: 'sessionStorage',
                    key: key,
                    token: value,
                    decoded: this.decodeJWT(value)
                });
            }
        });
        
        // Check cookies
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
            const parts = cookie.split('=');
            if (parts.length === 2) {
                const value = parts[1].trim();
                if (jwtPattern.test(value)) {
                    tokens.push({
                        source: 'cookie',
                        key: parts[0].trim(),
                        token: value,
                        decoded: this.decodeJWT(value)
                    });
                }
            }
        });
        
        return tokens;
    }

    /**
     * Decode JWT token
     */
    decodeJWT(token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            
            const header = JSON.parse(atob(parts[0]));
            const payload = JSON.parse(atob(parts[1]));
            
            return {
                header: header,
                payload: payload,
                expiry: payload.exp ? new Date(payload.exp * 1000) : null,
                issued: payload.iat ? new Date(payload.iat * 1000) : null
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Monitor authentication changes
     */
    monitorAuthChanges() {
        // Monitor localStorage changes
        window.addEventListener('storage', (event) => {
            if (event.storageArea === localStorage || event.storageArea === sessionStorage) {
                if (event.key && (event.key.includes('auth') || event.key.includes('token') || event.key.includes('user'))) {
                    this.detectAuthState();
                }
            }
        });
        
        // Monitor DOM changes for auth elements
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (this.isAuthElement(node)) {
                                this.detectAuthState();
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
     * Check if element is auth-related
     */
    isAuthElement(element) {
        const authSelectors = [
            '.user', '.profile', '.account', '.dashboard', '.logout', '.login',
            '[data-user]', '[data-auth]', '[data-role]', '[data-permission]'
        ];
        
        return authSelectors.some(selector => element.matches(selector));
    }

    /**
     * Monitor session expiry
     */
    monitorSessionExpiry() {
        this.sessionCheckInterval = setInterval(() => {
            if (this.authState.sessionExpiry && this.authState.sessionExpiry.remaining) {
                const remaining = this.authState.sessionExpiry.remaining;
                if (remaining <= 0) {
                    this.handleSessionExpiry();
                } else if (remaining <= 300000) { // 5 minutes
                    this.handleSessionExpiring();
                }
            }
        }, 60000); // Check every minute
    }

    /**
     * Handle session expiry
     */
    handleSessionExpiry() {
        this.authState.isAuthenticated = false;
        this.authState.user = null;
        this.authState.roles = [];
        this.authState.permissions = [];
        this.authState.sessionExpiry = null;
        this.authState.tokens.clear();
        
        console.log('Session expired - user logged out');
    }

    /**
     * Handle session expiring soon
     */
    handleSessionExpiring() {
        console.log('Session expiring soon - consider refreshing');
        // Could trigger automatic refresh or user notification
    }

    /**
     * Detect login forms
     */
    detectLoginForms() {
        const loginForms = [];
        
        const formSelectors = [
            'form[action*="login"]', 'form[action*="signin"]', 'form[action*="auth"]',
            '.login-form', '.signin-form', '.auth-form', '[data-login]'
        ];
        
        formSelectors.forEach(selector => {
            const forms = document.querySelectorAll(selector);
            forms.forEach(form => {
                const loginForm = {
                    element: form,
                    action: form.action,
                    method: form.method,
                    inputs: this.getFormInputs(form),
                    submitButton: this.getSubmitButton(form)
                };
                loginForms.push(loginForm);
            });
        });
        
        this.authState.loginForms = loginForms;
        return loginForms;
    }

    /**
     * Get form inputs
     */
    getFormInputs(form) {
        const inputs = [];
        const inputElements = form.querySelectorAll('input, select, textarea');
        
        inputElements.forEach(input => {
            inputs.push({
                name: input.name,
                type: input.type,
                placeholder: input.placeholder,
                required: input.required,
                value: input.value
            });
        });
        
        return inputs;
    }

    /**
     * Get submit button
     */
    getSubmitButton(form) {
        const submitButton = form.querySelector('input[type="submit"], button[type="submit"], button');
        if (submitButton) {
            return {
                element: submitButton,
                text: submitButton.textContent.trim(),
                type: submitButton.type
            };
        }
        return null;
    }

    /**
     * Detect logout buttons
     */
    detectLogoutButtons() {
        const logoutButtons = [];
        
        const logoutSelectors = [
            '.logout', '.signout', '.sign-out', '.log-out',
            '[data-logout]', '[data-signout]', 'a[href*="logout"]',
            'button[onclick*="logout"]', 'button[onclick*="signout"]'
        ];
        
        logoutSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                const logoutButton = {
                    element: button,
                    text: button.textContent.trim(),
                    href: button.href,
                    onclick: button.onclick
                };
                logoutButtons.push(logoutButton);
            });
        });
        
        this.authState.logoutButtons = logoutButtons;
        return logoutButtons;
    }

    /**
     * Monitor network authentication
     */
    monitorNetworkAuth() {
        const self = this;
        
        // Monitor fetch requests
        this.originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const response = await self.originalFetch.apply(this, args);
            
            // Check for auth-related responses
            if (response.status === 401 || response.status === 403) {
                self.handleAuthError(response);
            } else if (response.status === 200) {
                // Check for auth tokens in response
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        const data = await response.clone().json();
                        if (data.token || data.access_token || data.auth_token) {
                            self.handleAuthToken(data);
                        }
                    } catch (e) {
                        // Not JSON
                    }
                }
            }
            
            return response;
        };
        
        // Monitor XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._url = url;
            return originalXHROpen.call(this, method, url, ...args);
        };
        
        XMLHttpRequest.prototype.send = function(data) {
            this.addEventListener('loadend', function() {
                if (this.status === 401 || this.status === 403) {
                    self.handleAuthError(this);
                } else if (this.status === 200) {
                    // Check for auth tokens in response
                    try {
                        const data = JSON.parse(this.responseText);
                        if (data.token || data.access_token || data.auth_token) {
                            self.handleAuthToken(data);
                        }
                    } catch (e) {
                        // Not JSON
                    }
                }
            });
            
            return originalXHRSend.call(this, data);
        };
    }

    /**
     * Handle authentication error
     */
    handleAuthError(response) {
        console.log('Authentication error detected:', response.status);
        this.authState.isAuthenticated = false;
        this.authState.user = null;
        this.authState.roles = [];
        this.authState.permissions = [];
    }

    /**
     * Handle authentication token
     */
    handleAuthToken(data) {
        const token = data.token || data.access_token || data.auth_token;
        if (token) {
            this.authState.tokens.set('auth_token', token);
            this.authState.isAuthenticated = true;
            console.log('Authentication token detected');
        }
    }

    /**
     * Get authentication statistics
     */
    getAuthStatistics() {
        return {
            isAuthenticated: this.authState.isAuthenticated,
            user: this.authState.user,
            roles: this.authState.roles,
            permissions: this.authState.permissions,
            sessionExpiry: this.authState.sessionExpiry,
            tokens: Array.from(this.authState.tokens.entries()),
            loginForms: this.authState.loginForms.length,
            logoutButtons: this.authState.logoutButtons.length
        };
    }

    /**
     * Export authentication data
     */
    exportAuthData() {
        return {
            authState: this.authState,
            statistics: this.getAuthStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear authentication data
     */
    clearAuthData() {
        this.authState = {
            isAuthenticated: false,
            user: null,
            roles: [],
            permissions: [],
            sessionExpiry: null,
            tokens: new Map(),
            loginForms: [],
            logoutButtons: []
        };
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
            isAuthenticated: this.authState.isAuthenticated,
            user: this.authState.user,
            roles: this.authState.roles.length,
            permissions: this.authState.permissions.length,
            tokens: this.authState.tokens.size
        };
    }
}
