/**
 * Out-of-Scope Handler for CAPTCHA detection, MFA handling, protected content detection, and anti-bot measure handling
 * Implements comprehensive detection and handling of out-of-scope elements and measures
 */

export class OutOfScopeHandler {
    constructor() {
        this.captchaDetector = null;
        this.mfaDetector = null;
        this.protectedContentDetector = null;
        this.antiBotDetector = null;
        this.detectionHistory = [];
        this.handlingStrategies = new Map();
    }

    /**
     * Initialize out-of-scope handler
     */
    initialize() {
        this.setupCaptchaDetection();
        this.setupMFADetection();
        this.setupProtectedContentDetection();
        this.setupAntiBotDetection();
        this.setupHandlingStrategies();
    }

    /**
     * Setup CAPTCHA detection
     */
    setupCaptchaDetection() {
        this.captchaDetector = {
            selectors: [
                '[data-sitekey]', // reCAPTCHA
                '.g-recaptcha', // reCAPTCHA
                '.h-captcha', // hCaptcha
                '.cf-turnstile', // Cloudflare Turnstile
                '[data-captcha]', // Generic CAPTCHA
                '.captcha', // Generic CAPTCHA
                'iframe[src*="recaptcha"]', // reCAPTCHA iframe
                'iframe[src*="hcaptcha"]', // hCaptcha iframe
                'iframe[src*="turnstile"]' // Cloudflare Turnstile iframe
            ],
            keywords: [
                'captcha', 'recaptcha', 'hcaptcha', 'turnstile',
                'verify you are human', 'prove you are not a robot',
                'security check', 'verification required'
            ],
            detect: () => {
                const captchas = [];
                
                // Check for CAPTCHA elements
                this.captchaDetector.selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        captchas.push({
                            type: 'element',
                            selector: selector,
                            element: element,
                            confidence: 0.9
                        });
                    });
                });
                
                // Check for CAPTCHA keywords in text
                const textContent = document.body.textContent.toLowerCase();
                this.captchaDetector.keywords.forEach(keyword => {
                    if (textContent.includes(keyword)) {
                        captchas.push({
                            type: 'keyword',
                            keyword: keyword,
                            confidence: 0.7
                        });
                    }
                });
                
                return captchas;
            }
        };
    }

    /**
     * Setup MFA detection
     */
    setupMFADetection() {
        this.mfaDetector = {
            selectors: [
                'input[type="tel"]', // Phone number input
                'input[type="email"]', // Email input
                'input[placeholder*="code"]', // Code input
                'input[placeholder*="otp"]', // OTP input
                'input[placeholder*="verification"]', // Verification input
                '[data-mfa]', // MFA data attribute
                '.mfa', // MFA class
                '.two-factor', // Two-factor class
                '.2fa', // 2FA class
                '.otp', // OTP class
                '.verification-code' // Verification code class
            ],
            keywords: [
                'two-factor', '2fa', 'mfa', 'otp', 'verification code',
                'authenticator', 'sms code', 'email code', 'security code',
                'enter the code', 'verification required', 'additional security'
            ],
            detect: () => {
                const mfaElements = [];
                
                // Check for MFA elements
                this.mfaDetector.selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        mfaElements.push({
                            type: 'element',
                            selector: selector,
                            element: element,
                            confidence: 0.8
                        });
                    });
                });
                
                // Check for MFA keywords in text
                const textContent = document.body.textContent.toLowerCase();
                this.mfaDetector.keywords.forEach(keyword => {
                    if (textContent.includes(keyword)) {
                        mfaElements.push({
                            type: 'keyword',
                            keyword: keyword,
                            confidence: 0.6
                        });
                    }
                });
                
                return mfaElements;
            }
        };
    }

    /**
     * Setup protected content detection
     */
    setupProtectedContentDetection() {
        this.protectedContentDetector = {
            selectors: [
                '[data-protected]', // Protected content
                '.protected', // Protected class
                '.encrypted', // Encrypted class
                '.secure', // Secure class
                '.private', // Private class
                '.confidential', // Confidential class
                'iframe[src*="banking"]', // Banking iframe
                'iframe[src*="payment"]', // Payment iframe
                'iframe[src*="secure"]' // Secure iframe
            ],
            keywords: [
                'protected content', 'encrypted', 'secure', 'private',
                'confidential', 'banking', 'payment', 'financial',
                'sensitive', 'restricted', 'authorized access only'
            ],
            detect: () => {
                const protectedElements = [];
                
                // Check for protected content elements
                this.protectedContentDetector.selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        protectedElements.push({
                            type: 'element',
                            selector: selector,
                            element: element,
                            confidence: 0.8
                        });
                    });
                });
                
                // Check for protected content keywords
                const textContent = document.body.textContent.toLowerCase();
                this.protectedContentDetector.keywords.forEach(keyword => {
                    if (textContent.includes(keyword)) {
                        protectedElements.push({
                            type: 'keyword',
                            keyword: keyword,
                            confidence: 0.6
                        });
                    }
                });
                
                return protectedElements;
            }
        };
    }

    /**
     * Setup anti-bot detection
     */
    setupAntiBotDetection() {
        this.antiBotDetector = {
            selectors: [
                '.cloudflare', // Cloudflare protection
                '.ddos-guard', // DDoS-Guard protection
                '.sucuri', // Sucuri protection
                '.incapsula', // Incapsula protection
                '.akamai', // Akamai protection
                '.fastly', // Fastly protection
                '[data-protection]', // Generic protection
                '.protection', // Generic protection
                '.security-check', // Security check
                '.bot-detection' // Bot detection
            ],
            keywords: [
                'cloudflare', 'ddos-guard', 'sucuri', 'incapsula',
                'akamai', 'fastly', 'protection', 'security check',
                'bot detection', 'access denied', 'blocked',
                'rate limited', 'too many requests'
            ],
            detect: () => {
                const antiBotElements = [];
                
                // Check for anti-bot elements
                this.antiBotDetector.selectors.forEach(selector => {
                    const elements = document.querySelectorAll(selector);
                    elements.forEach(element => {
                        antiBotElements.push({
                            type: 'element',
                            selector: selector,
                            element: element,
                            confidence: 0.9
                        });
                    });
                });
                
                // Check for anti-bot keywords
                const textContent = document.body.textContent.toLowerCase();
                this.antiBotDetector.keywords.forEach(keyword => {
                    if (textContent.includes(keyword)) {
                        antiBotElements.push({
                            type: 'keyword',
                            keyword: keyword,
                            confidence: 0.7
                        });
                    }
                });
                
                return antiBotElements;
            }
        };
    }

    /**
     * Setup handling strategies
     */
    setupHandlingStrategies() {
        this.handlingStrategies.set('captcha', {
            strategy: 'skip',
            message: 'CAPTCHA detected - skipping page',
            action: () => {
                console.warn('CAPTCHA detected, skipping page');
                return { skip: true, reason: 'CAPTCHA detected' };
            }
        });
        
        this.handlingStrategies.set('mfa', {
            strategy: 'skip',
            message: 'MFA required - skipping page',
            action: () => {
                console.warn('MFA required, skipping page');
                return { skip: true, reason: 'MFA required' };
            }
        });
        
        this.handlingStrategies.set('protected', {
            strategy: 'skip',
            message: 'Protected content detected - skipping page',
            action: () => {
                console.warn('Protected content detected, skipping page');
                return { skip: true, reason: 'Protected content' };
            }
        });
        
        this.handlingStrategies.set('anti-bot', {
            strategy: 'skip',
            message: 'Anti-bot protection detected - skipping page',
            action: () => {
                console.warn('Anti-bot protection detected, skipping page');
                return { skip: true, reason: 'Anti-bot protection' };
            }
        });
    }

    /**
     * Detect out-of-scope elements
     */
    detectOutOfScope() {
        const detections = {
            captcha: this.captchaDetector.detect(),
            mfa: this.mfaDetector.detect(),
            protected: this.protectedContentDetector.detect(),
            antiBot: this.antiBotDetector.detect()
        };
        
        const totalDetections = Object.values(detections).flat().length;
        
        if (totalDetections > 0) {
            this.detectionHistory.push({
                timestamp: Date.now(),
                url: window.location.href,
                detections: detections,
                totalDetections: totalDetections
            });
        }
        
        return detections;
    }

    /**
     * Handle out-of-scope elements
     */
    handleOutOfScope(detections) {
        const results = [];
        
        Object.keys(detections).forEach(type => {
            const elements = detections[type];
            if (elements.length > 0) {
                const strategy = this.handlingStrategies.get(type);
                if (strategy) {
                    const result = strategy.action();
                    results.push({
                        type: type,
                        count: elements.length,
                        strategy: strategy.strategy,
                        message: strategy.message,
                        result: result
                    });
                }
            }
        });
        
        return results;
    }

    /**
     * Check if page should be skipped
     */
    shouldSkipPage() {
        const detections = this.detectOutOfScope();
        const results = this.handleOutOfScope(detections);
        
        return results.some(result => result.result.skip);
    }

    /**
     * Get skip reason
     */
    getSkipReason() {
        const detections = this.detectOutOfScope();
        const results = this.handleOutOfScope(detections);
        
        const skipResult = results.find(result => result.result.skip);
        return skipResult ? skipResult.result.reason : null;
    }

    /**
     * Get detection statistics
     */
    getDetectionStatistics() {
        const stats = {
            totalDetections: this.detectionHistory.length,
            captchaDetections: 0,
            mfaDetections: 0,
            protectedDetections: 0,
            antiBotDetections: 0,
            skippedPages: 0
        };
        
        this.detectionHistory.forEach(entry => {
            if (entry.detections.captcha.length > 0) stats.captchaDetections++;
            if (entry.detections.mfa.length > 0) stats.mfaDetections++;
            if (entry.detections.protected.length > 0) stats.protectedDetections++;
            if (entry.detections.antiBot.length > 0) stats.antiBotDetections++;
            if (entry.totalDetections > 0) stats.skippedPages++;
        });
        
        return stats;
    }

    /**
     * Clear detection history
     */
    clearDetectionHistory() {
        this.detectionHistory = [];
    }

    /**
     * Export detection data
     */
    exportDetectionData() {
        return {
            detectionHistory: this.detectionHistory,
            statistics: this.getDetectionStatistics(),
            handlingStrategies: Array.from(this.handlingStrategies.entries()),
            timestamp: Date.now()
        };
    }

    /**
     * Update handling strategy
     */
    updateHandlingStrategy(type, strategy) {
        this.handlingStrategies.set(type, strategy);
    }

    /**
     * Add custom detection rule
     */
    addCustomDetectionRule(type, selector, keyword) {
        if (type === 'captcha') {
            this.captchaDetector.selectors.push(selector);
            this.captchaDetector.keywords.push(keyword);
        } else if (type === 'mfa') {
            this.mfaDetector.selectors.push(selector);
            this.mfaDetector.keywords.push(keyword);
        } else if (type === 'protected') {
            this.protectedContentDetector.selectors.push(selector);
            this.protectedContentDetector.keywords.push(keyword);
        } else if (type === 'anti-bot') {
            this.antiBotDetector.selectors.push(selector);
            this.antiBotDetector.keywords.push(keyword);
        }
    }

    /**
     * Remove custom detection rule
     */
    removeCustomDetectionRule(type, selector, keyword) {
        if (type === 'captcha') {
            this.captchaDetector.selectors = this.captchaDetector.selectors.filter(s => s !== selector);
            this.captchaDetector.keywords = this.captchaDetector.keywords.filter(k => k !== keyword);
        } else if (type === 'mfa') {
            this.mfaDetector.selectors = this.mfaDetector.selectors.filter(s => s !== selector);
            this.mfaDetector.keywords = this.mfaDetector.keywords.filter(k => k !== keyword);
        } else if (type === 'protected') {
            this.protectedContentDetector.selectors = this.protectedContentDetector.selectors.filter(s => s !== selector);
            this.protectedContentDetector.keywords = this.protectedContentDetector.keywords.filter(k => k !== keyword);
        } else if (type === 'anti-bot') {
            this.antiBotDetector.selectors = this.antiBotDetector.selectors.filter(s => s !== selector);
            this.antiBotDetector.keywords = this.antiBotDetector.keywords.filter(k => k !== keyword);
        }
    }

    /**
     * Get all detection rules
     */
    getAllDetectionRules() {
        return {
            captcha: {
                selectors: this.captchaDetector.selectors,
                keywords: this.captchaDetector.keywords
            },
            mfa: {
                selectors: this.mfaDetector.selectors,
                keywords: this.mfaDetector.keywords
            },
            protected: {
                selectors: this.protectedContentDetector.selectors,
                keywords: this.protectedContentDetector.keywords
            },
            antiBot: {
                selectors: this.antiBotDetector.selectors,
                keywords: this.antiBotDetector.keywords
            }
        };
    }

    /**
     * Reset detection rules to defaults
     */
    resetDetectionRules() {
        this.setupCaptchaDetection();
        this.setupMFADetection();
        this.setupProtectedContentDetection();
        this.setupAntiBotDetection();
    }
}
