/**
 * E-commerce Feature Detector for advanced product/feature variations
 * Implements stock status detection, variant selector handling, wishlist/cart state tracking, and promotions
 */

export class EcommerceDetector {
    constructor() {
        this.productData = [];
        this.cartData = [];
        this.wishlistData = [];
        this.promotionData = [];
        this.stockData = [];
        this.variantData = [];
        this.isMonitoring = false;
    }

    /**
     * Start e-commerce monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.detectProducts();
        this.detectCart();
        this.detectWishlist();
        this.detectPromotions();
        this.detectStockStatus();
        this.detectVariants();
    }

    /**
     * Stop e-commerce monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
    }

    /**
     * Detect products on the page
     */
    detectProducts() {
        const products = [];
        
        // Common product selectors
        const productSelectors = [
            '.product',
            '.item',
            '.card',
            '[data-product]',
            '[data-item]',
            '.product-item',
            '.product-card',
            '.product-tile',
            '.product-box'
        ];
        
        productSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const product = this.extractProductData(element);
                if (product) {
                    products.push(product);
                }
            });
        });
        
        this.productData = products;
        return products;
    }

    /**
     * Extract product data from element
     */
    extractProductData(element) {
        const product = {
            element: element,
            selector: this.getElementSelector(element),
            name: this.getProductName(element),
            price: this.getProductPrice(element),
            image: this.getProductImage(element),
            description: this.getProductDescription(element),
            rating: this.getProductRating(element),
            reviews: this.getProductReviews(element),
            availability: this.getProductAvailability(element),
            variants: this.getProductVariants(element),
            tags: this.getProductTags(element),
            timestamp: Date.now()
        };
        
        return product;
    }

    /**
     * Get product name
     */
    getProductName(element) {
        const nameSelectors = [
            '.product-name',
            '.product-title',
            '.item-name',
            '.title',
            'h1', 'h2', 'h3', 'h4',
            '[data-name]',
            '[data-title]'
        ];
        
        for (const selector of nameSelectors) {
            const nameElement = element.querySelector(selector);
            if (nameElement && nameElement.textContent.trim()) {
                return nameElement.textContent.trim();
            }
        }
        
        return element.textContent.slice(0, 100);
    }

    /**
     * Get product price
     */
    getProductPrice(element) {
        const priceSelectors = [
            '.price',
            '.product-price',
            '.item-price',
            '.cost',
            '[data-price]',
            '.currency',
            '.amount'
        ];
        
        for (const selector of priceSelectors) {
            const priceElement = element.querySelector(selector);
            if (priceElement && priceElement.textContent.trim()) {
                const priceText = priceElement.textContent.trim();
                const price = this.parsePrice(priceText);
                if (price) {
                    return {
                        text: priceText,
                        value: price,
                        currency: this.extractCurrency(priceText)
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * Parse price from text
     */
    parsePrice(text) {
        const priceMatch = text.match(/[\d,]+\.?\d*/);
        if (priceMatch) {
            return parseFloat(priceMatch[0].replace(/,/g, ''));
        }
        return null;
    }

    /**
     * Extract currency from price text
     */
    extractCurrency(text) {
        const currencyMatch = text.match(/[$€£¥₹]/);
        return currencyMatch ? currencyMatch[0] : null;
    }

    /**
     * Get product image
     */
    getProductImage(element) {
        const imageSelectors = [
            'img',
            '.product-image',
            '.item-image',
            '.thumbnail',
            '[data-image]'
        ];
        
        for (const selector of imageSelectors) {
            const imageElement = element.querySelector(selector);
            if (imageElement && imageElement.src) {
                return {
                    src: imageElement.src,
                    alt: imageElement.alt,
                    width: imageElement.width,
                    height: imageElement.height
                };
            }
        }
        
        return null;
    }

    /**
     * Get product description
     */
    getProductDescription(element) {
        const descSelectors = [
            '.description',
            '.product-description',
            '.item-description',
            '.summary',
            '.details'
        ];
        
        for (const selector of descSelectors) {
            const descElement = element.querySelector(selector);
            if (descElement && descElement.textContent.trim()) {
                return descElement.textContent.trim();
            }
        }
        
        return null;
    }

    /**
     * Get product rating
     */
    getProductRating(element) {
        const ratingSelectors = [
            '.rating',
            '.stars',
            '.score',
            '[data-rating]',
            '.review-rating'
        ];
        
        for (const selector of ratingSelectors) {
            const ratingElement = element.querySelector(selector);
            if (ratingElement) {
                const rating = this.parseRating(ratingElement);
                if (rating) {
                    return rating;
                }
            }
        }
        
        return null;
    }

    /**
     * Parse rating from element
     */
    parseRating(element) {
        // Check for numeric rating
        const numericMatch = element.textContent.match(/(\d+\.?\d*)/);
        if (numericMatch) {
            return parseFloat(numericMatch[1]);
        }
        
        // Check for star rating
        const stars = element.querySelectorAll('.star, .fa-star, .icon-star');
        if (stars.length > 0) {
            return stars.length;
        }
        
        return null;
    }

    /**
     * Get product reviews
     */
    getProductReviews(element) {
        const reviewSelectors = [
            '.reviews',
            '.review-count',
            '.rating-count',
            '[data-reviews]'
        ];
        
        for (const selector of reviewSelectors) {
            const reviewElement = element.querySelector(selector);
            if (reviewElement && reviewElement.textContent.trim()) {
                const reviewText = reviewElement.textContent.trim();
                const reviewMatch = reviewText.match(/(\d+)/);
                if (reviewMatch) {
                    return parseInt(reviewMatch[1]);
                }
            }
        }
        
        return null;
    }

    /**
     * Get product availability
     */
    getProductAvailability(element) {
        const availabilitySelectors = [
            '.availability',
            '.stock',
            '.in-stock',
            '.out-of-stock',
            '.sold-out',
            '[data-availability]',
            '[data-stock]'
        ];
        
        for (const selector of availabilitySelectors) {
            const availElement = element.querySelector(selector);
            if (availElement) {
                const text = availElement.textContent.toLowerCase();
                if (text.includes('in stock') || text.includes('available')) {
                    return 'in_stock';
                } else if (text.includes('out of stock') || text.includes('sold out')) {
                    return 'out_of_stock';
                } else if (text.includes('limited') || text.includes('few left')) {
                    return 'limited';
                }
            }
        }
        
        return 'unknown';
    }

    /**
     * Get product variants
     */
    getProductVariants(element) {
        const variants = [];
        
        // Size variants
        const sizeSelectors = [
            '.size',
            '.size-option',
            '.size-selector',
            '[data-size]'
        ];
        
        sizeSelectors.forEach(selector => {
            const sizeElements = element.querySelectorAll(selector);
            sizeElements.forEach(sizeEl => {
                variants.push({
                    type: 'size',
                    value: sizeEl.textContent.trim(),
                    available: !sizeEl.classList.contains('disabled'),
                    element: sizeEl
                });
            });
        });
        
        // Color variants
        const colorSelectors = [
            '.color',
            '.color-option',
            '.color-selector',
            '[data-color]'
        ];
        
        colorSelectors.forEach(selector => {
            const colorElements = element.querySelectorAll(selector);
            colorElements.forEach(colorEl => {
                variants.push({
                    type: 'color',
                    value: colorEl.textContent.trim(),
                    available: !colorEl.classList.contains('disabled'),
                    element: colorEl
                });
            });
        });
        
        return variants;
    }

    /**
     * Get product tags
     */
    getProductTags(element) {
        const tags = [];
        
        // Check for sale tags
        const saleSelectors = [
            '.sale',
            '.discount',
            '.offer',
            '.promo',
            '.badge'
        ];
        
        saleSelectors.forEach(selector => {
            const saleElement = element.querySelector(selector);
            if (saleElement) {
                tags.push({
                    type: 'sale',
                    text: saleElement.textContent.trim(),
                    element: saleElement
                });
            }
        });
        
        return tags;
    }

    /**
     * Detect cart functionality
     */
    detectCart() {
        const cartData = {
            items: [],
            total: null,
            count: 0,
            isEmpty: true,
            timestamp: Date.now()
        };
        
        // Cart count
        const countSelectors = [
            '.cart-count',
            '.cart-quantity',
            '.cart-items',
            '[data-cart-count]',
            '.badge'
        ];
        
        countSelectors.forEach(selector => {
            const countElement = document.querySelector(selector);
            if (countElement && countElement.textContent.trim()) {
                const count = parseInt(countElement.textContent.trim());
                if (!isNaN(count)) {
                    cartData.count = count;
                    cartData.isEmpty = count === 0;
                }
            }
        });
        
        // Cart total
        const totalSelectors = [
            '.cart-total',
            '.total',
            '.subtotal',
            '.cart-summary',
            '[data-total]'
        ];
        
        totalSelectors.forEach(selector => {
            const totalElement = document.querySelector(selector);
            if (totalElement && totalElement.textContent.trim()) {
                const total = this.parsePrice(totalElement.textContent.trim());
                if (total) {
                    cartData.total = {
                        text: totalElement.textContent.trim(),
                        value: total,
                        currency: this.extractCurrency(totalElement.textContent.trim())
                    };
                }
            }
        });
        
        this.cartData = cartData;
        return cartData;
    }

    /**
     * Detect wishlist functionality
     */
    detectWishlist() {
        const wishlistData = {
            items: [],
            count: 0,
            isEmpty: true,
            timestamp: Date.now()
        };
        
        // Wishlist count
        const countSelectors = [
            '.wishlist-count',
            '.favorites-count',
            '.saved-count',
            '[data-wishlist-count]'
        ];
        
        countSelectors.forEach(selector => {
            const countElement = document.querySelector(selector);
            if (countElement && countElement.textContent.trim()) {
                const count = parseInt(countElement.textContent.trim());
                if (!isNaN(count)) {
                    wishlistData.count = count;
                    wishlistData.isEmpty = count === 0;
                }
            }
        });
        
        // Wishlist buttons
        const wishlistButtons = document.querySelectorAll(
            '.wishlist, .favorite, .save, .bookmark, [data-wishlist], [data-favorite]'
        );
        
        wishlistButtons.forEach(button => {
            const isActive = button.classList.contains('active') || 
                           button.classList.contains('added') ||
                           button.getAttribute('data-active') === 'true';
            
            wishlistData.items.push({
                element: button,
                isActive: isActive,
                text: button.textContent.trim()
            });
        });
        
        this.wishlistData = wishlistData;
        return wishlistData;
    }

    /**
     * Detect promotions and offers
     */
    detectPromotions() {
        const promotions = [];
        
        // Promotion banners
        const bannerSelectors = [
            '.promo',
            '.banner',
            '.offer',
            '.discount',
            '.sale',
            '.deal',
            '.coupon',
            '.voucher'
        ];
        
        bannerSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const promotion = {
                    element: element,
                    text: element.textContent.trim(),
                    type: this.getPromotionType(element),
                    discount: this.getPromotionDiscount(element),
                    timestamp: Date.now()
                };
                
                if (promotion.text) {
                    promotions.push(promotion);
                }
            });
        });
        
        this.promotionData = promotions;
        return promotions;
    }

    /**
     * Get promotion type
     */
    getPromotionType(element) {
        const text = element.textContent.toLowerCase();
        
        if (text.includes('sale') || text.includes('discount')) {
            return 'sale';
        } else if (text.includes('free shipping')) {
            return 'free_shipping';
        } else if (text.includes('coupon') || text.includes('code')) {
            return 'coupon';
        } else if (text.includes('bogo') || text.includes('buy one')) {
            return 'bogo';
        } else {
            return 'general';
        }
    }

    /**
     * Get promotion discount
     */
    getPromotionDiscount(element) {
        const text = element.textContent;
        const discountMatch = text.match(/(\d+)%/);
        if (discountMatch) {
            return {
                type: 'percentage',
                value: parseInt(discountMatch[1])
            };
        }
        
        const amountMatch = text.match(/\$(\d+)/);
        if (amountMatch) {
            return {
                type: 'amount',
                value: parseInt(amountMatch[1])
            };
        }
        
        return null;
    }

    /**
     * Detect stock status
     */
    detectStockStatus() {
        const stockData = {
            inStock: [],
            outOfStock: [],
            limited: [],
            timestamp: Date.now()
        };
        
        // Stock indicators
        const stockSelectors = [
            '.stock',
            '.availability',
            '.in-stock',
            '.out-of-stock',
            '.sold-out',
            '[data-stock]',
            '[data-availability]'
        ];
        
        stockSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const text = element.textContent.toLowerCase();
                const stockItem = {
                    element: element,
                    text: text,
                    selector: this.getElementSelector(element)
                };
                
                if (text.includes('in stock') || text.includes('available')) {
                    stockData.inStock.push(stockItem);
                } else if (text.includes('out of stock') || text.includes('sold out')) {
                    stockData.outOfStock.push(stockItem);
                } else if (text.includes('limited') || text.includes('few left')) {
                    stockData.limited.push(stockItem);
                }
            });
        });
        
        this.stockData = stockData;
        return stockData;
    }

    /**
     * Detect product variants
     */
    detectVariants() {
        const variants = [];
        
        // Size selectors
        const sizeSelectors = [
            '.size-selector',
            '.size-options',
            '.size-list',
            '[data-size]'
        ];
        
        sizeSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const sizeOptions = element.querySelectorAll('option, .option, .size-option');
                sizeOptions.forEach(option => {
                    variants.push({
                        type: 'size',
                        value: option.textContent.trim(),
                        available: !option.disabled && !option.classList.contains('disabled'),
                        element: option
                    });
                });
            });
        });
        
        // Color selectors
        const colorSelectors = [
            '.color-selector',
            '.color-options',
            '.color-list',
            '[data-color]'
        ];
        
        colorSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const colorOptions = element.querySelectorAll('.color-option, .color-swatch, [data-color]');
                colorOptions.forEach(option => {
                    variants.push({
                        type: 'color',
                        value: option.textContent.trim() || option.getAttribute('data-color'),
                        available: !option.classList.contains('disabled'),
                        element: option
                    });
                });
            });
        });
        
        this.variantData = variants;
        return variants;
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
     * Get e-commerce statistics
     */
    getEcommerceStatistics() {
        return {
            products: {
                total: this.productData.length,
                withPrice: this.productData.filter(p => p.price).length,
                withImages: this.productData.filter(p => p.image).length,
                withRatings: this.productData.filter(p => p.rating).length
            },
            cart: {
                count: this.cartData.count,
                isEmpty: this.cartData.isEmpty,
                hasTotal: this.cartData.total !== null
            },
            wishlist: {
                count: this.wishlistData.count,
                isEmpty: this.wishlistData.isEmpty,
                buttons: this.wishlistData.items.length
            },
            promotions: {
                total: this.promotionData.length,
                byType: this.groupPromotionsByType()
            },
            stock: {
                inStock: this.stockData.inStock.length,
                outOfStock: this.stockData.outOfStock.length,
                limited: this.stockData.limited.length
            },
            variants: {
                total: this.variantData.length,
                byType: this.groupVariantsByType()
            }
        };
    }

    /**
     * Group promotions by type
     */
    groupPromotionsByType() {
        const groups = {};
        this.promotionData.forEach(promo => {
            groups[promo.type] = (groups[promo.type] || 0) + 1;
        });
        return groups;
    }

    /**
     * Group variants by type
     */
    groupVariantsByType() {
        const groups = {};
        this.variantData.forEach(variant => {
            groups[variant.type] = (groups[variant.type] || 0) + 1;
        });
        return groups;
    }

    /**
     * Export e-commerce data
     */
    exportEcommerceData() {
        return {
            products: this.productData,
            cart: this.cartData,
            wishlist: this.wishlistData,
            promotions: this.promotionData,
            stock: this.stockData,
            variants: this.variantData,
            statistics: this.getEcommerceStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear all e-commerce data
     */
    clearData() {
        this.productData = [];
        this.cartData = [];
        this.wishlistData = [];
        this.promotionData = [];
        this.stockData = [];
        this.variantData = [];
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalProducts: this.productData.length,
            totalPromotions: this.promotionData.length,
            totalVariants: this.variantData.length
        };
    }
}
