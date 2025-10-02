/**
 * Coverage Analyzer for comprehensive coverage metrics
 * Implements interactive element coverage tracking, unique state coverage, and marginal gain analysis
 */

export class CoverageAnalyzer {
    constructor() {
        this.coverageData = {
            elementCoverage: new Map(),
            stateCoverage: new Map(),
            interactionCoverage: new Map(),
            pathCoverage: new Map(),
            featureCoverage: new Map()
        };
        this.metrics = {
            totalElements: 0,
            coveredElements: 0,
            totalStates: 0,
            uniqueStates: 0,
            totalInteractions: 0,
            coveredInteractions: 0,
            totalPaths: 0,
            coveredPaths: 0,
            totalFeatures: 0,
            coveredFeatures: 0
        };
        this.isAnalyzing = false;
        this.analysisHistory = [];
    }

    /**
     * Start coverage analysis
     */
    startAnalysis() {
        if (this.isAnalyzing) return;
        
        this.isAnalyzing = true;
        this.analyzeElementCoverage();
        this.analyzeStateCoverage();
        this.analyzeInteractionCoverage();
        this.analyzePathCoverage();
        this.analyzeFeatureCoverage();
        this.calculateMarginalGain();
    }

    /**
     * Stop coverage analysis
     */
    stopAnalysis() {
        this.isAnalyzing = false;
    }

    /**
     * Analyze element coverage
     */
    analyzeElementCoverage() {
        const elements = this.getAllElements();
        const coveredElements = this.getCoveredElements();
        
        this.metrics.totalElements = elements.length;
        this.metrics.coveredElements = coveredElements.length;
        
        // Categorize coverage by element type
        const coverageByType = this.categorizeElementCoverage(elements, coveredElements);
        
        this.coverageData.elementCoverage.set('total', {
            total: elements.length,
            covered: coveredElements.length,
            percentage: this.calculatePercentage(coveredElements.length, elements.length)
        });
        
        Object.keys(coverageByType).forEach(type => {
            this.coverageData.elementCoverage.set(type, coverageByType[type]);
        });
        
        return coverageByType;
    }

    /**
     * Analyze state coverage
     */
    analyzeStateCoverage() {
        const states = this.getAllStates();
        const uniqueStates = this.getUniqueStates();
        
        this.metrics.totalStates = states.length;
        this.metrics.uniqueStates = uniqueStates.length;
        
        // Analyze state diversity
        const stateDiversity = this.analyzeStateDiversity(states);
        
        this.coverageData.stateCoverage.set('total', {
            total: states.length,
            unique: uniqueStates.length,
            diversity: stateDiversity,
            percentage: this.calculatePercentage(uniqueStates.length, states.length)
        });
        
        return stateDiversity;
    }

    /**
     * Analyze interaction coverage
     */
    analyzeInteractionCoverage() {
        const interactions = this.getAllInteractions();
        const coveredInteractions = this.getCoveredInteractions();
        
        this.metrics.totalInteractions = interactions.length;
        this.metrics.coveredInteractions = coveredInteractions.length;
        
        // Categorize by interaction type
        const coverageByType = this.categorizeInteractionCoverage(interactions, coveredInteractions);
        
        this.coverageData.interactionCoverage.set('total', {
            total: interactions.length,
            covered: coveredInteractions.length,
            percentage: this.calculatePercentage(coveredInteractions.length, interactions.length)
        });
        
        Object.keys(coverageByType).forEach(type => {
            this.coverageData.interactionCoverage.set(type, coverageByType[type]);
        });
        
        return coverageByType;
    }

    /**
     * Analyze path coverage
     */
    analyzePathCoverage() {
        const paths = this.getAllPaths();
        const coveredPaths = this.getCoveredPaths();
        
        this.metrics.totalPaths = paths.length;
        this.metrics.coveredPaths = coveredPaths.length;
        
        // Analyze path complexity
        const pathComplexity = this.analyzePathComplexity(paths);
        
        this.coverageData.pathCoverage.set('total', {
            total: paths.length,
            covered: coveredPaths.length,
            complexity: pathComplexity,
            percentage: this.calculatePercentage(coveredPaths.length, paths.length)
        });
        
        return pathComplexity;
    }

    /**
     * Analyze feature coverage
     */
    analyzeFeatureCoverage() {
        const features = this.getAllFeatures();
        const coveredFeatures = this.getCoveredFeatures();
        
        this.metrics.totalFeatures = features.length;
        this.metrics.coveredFeatures = coveredFeatures.length;
        
        // Categorize by feature type
        const coverageByType = this.categorizeFeatureCoverage(features, coveredFeatures);
        
        this.coverageData.featureCoverage.set('total', {
            total: features.length,
            covered: coveredFeatures.length,
            percentage: this.calculatePercentage(coveredFeatures.length, features.length)
        });
        
        Object.keys(coverageByType).forEach(type => {
            this.coverageData.featureCoverage.set(type, coverageByType[type]);
        });
        
        return coverageByType;
    }

    /**
     * Calculate marginal gain
     */
    calculateMarginalGain() {
        const currentCoverage = this.getCurrentCoverage();
        const previousCoverage = this.getPreviousCoverage();
        
        const marginalGain = {
            elementGain: currentCoverage.elements - previousCoverage.elements,
            stateGain: currentCoverage.states - previousCoverage.states,
            interactionGain: currentCoverage.interactions - previousCoverage.interactions,
            pathGain: currentCoverage.paths - previousCoverage.paths,
            featureGain: currentCoverage.features - previousCoverage.features
        };
        
        // Store analysis history
        this.analysisHistory.push({
            timestamp: Date.now(),
            coverage: currentCoverage,
            marginalGain: marginalGain
        });
        
        return marginalGain;
    }

    /**
     * Get all elements
     */
    getAllElements() {
        const elements = [];
        const selectors = [
            'a', 'button', 'input', 'select', 'textarea', 'img', 'video', 'audio',
            '[role="button"]', '[role="link"]', '[role="menuitem"]', '[role="tab"]',
            '[data-click]', '[data-hover]', '[data-touch]', '[data-swipe]'
        ];
        
        selectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            elements.push(...Array.from(foundElements));
        });
        
        return elements;
    }

    /**
     * Get covered elements
     */
    getCoveredElements() {
        const elements = this.getAllElements();
        return elements.filter(element => this.isElementCovered(element));
    }

    /**
     * Check if element is covered
     */
    isElementCovered(element) {
        // Check if element has been interacted with
        return element.hasAttribute('data-crawled') || 
               element.hasAttribute('data-visited') ||
               element.classList.contains('crawled');
    }

    /**
     * Categorize element coverage
     */
    categorizeElementCoverage(elements, coveredElements) {
        const categories = {
            navigation: { total: 0, covered: 0 },
            forms: { total: 0, covered: 0 },
            media: { total: 0, covered: 0 },
            interactive: { total: 0, covered: 0 },
            accessibility: { total: 0, covered: 0 }
        };
        
        elements.forEach(element => {
            const category = this.getElementCategory(element);
            categories[category].total++;
            
            if (coveredElements.includes(element)) {
                categories[category].covered++;
            }
        });
        
        // Calculate percentages
        Object.keys(categories).forEach(category => {
            const data = categories[category];
            data.percentage = this.calculatePercentage(data.covered, data.total);
        });
        
        return categories;
    }

    /**
     * Get element category
     */
    getElementCategory(element) {
        const tagName = element.tagName.toLowerCase();
        const role = element.getAttribute('role');
        
        if (tagName === 'a' || tagName === 'button' || role === 'link' || role === 'button') {
            return 'navigation';
        } else if (tagName === 'input' || tagName === 'select' || tagName === 'textarea' || tagName === 'form') {
            return 'forms';
        } else if (tagName === 'img' || tagName === 'video' || tagName === 'audio' || tagName === 'canvas') {
            return 'media';
        } else if (element.hasAttribute('data-click') || element.hasAttribute('data-hover') || element.hasAttribute('data-touch')) {
            return 'interactive';
        } else if (element.hasAttribute('role') || element.hasAttribute('aria-label') || element.hasAttribute('aria-describedby')) {
            return 'accessibility';
        }
        
        return 'interactive';
    }

    /**
     * Get all states
     */
    getAllStates() {
        // This would typically get states from the graph data
        // For now, return a mock structure
        return [];
    }

    /**
     * Get unique states
     */
    getUniqueStates() {
        const states = this.getAllStates();
        const uniqueStates = [];
        const seenHashes = new Set();
        
        states.forEach(state => {
            const hash = this.hashState(state);
            if (!seenHashes.has(hash)) {
                seenHashes.add(hash);
                uniqueStates.push(state);
            }
        });
        
        return uniqueStates;
    }

    /**
     * Hash state for uniqueness
     */
    hashState(state) {
        const features = this.extractStateFeatures(state);
        return JSON.stringify(features);
    }

    /**
     * Extract state features
     */
    extractStateFeatures(state) {
        return {
            url: state.url,
            title: state.title,
            elementCount: state.elements?.length || 0,
            interactiveElements: state.elements?.filter(el => el.interactive?.clickable).length || 0,
            formElements: state.elements?.filter(el => el.category === 'forms').length || 0,
            mediaElements: state.elements?.filter(el => el.category === 'media').length || 0
        };
    }

    /**
     * Analyze state diversity
     */
    analyzeStateDiversity(states) {
        if (states.length === 0) return 0;
        
        const features = states.map(state => this.extractStateFeatures(state));
        const diversity = this.calculateFeatureDiversity(features);
        
        return diversity;
    }

    /**
     * Calculate feature diversity
     */
    calculateFeatureDiversity(features) {
        if (features.length <= 1) return 1;
        
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < features.length; i++) {
            for (let j = i + 1; j < features.length; j++) {
                const distance = this.calculateFeatureDistance(features[i], features[j]);
                totalDistance += distance;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalDistance / comparisons : 0;
    }

    /**
     * Calculate feature distance
     */
    calculateFeatureDistance(features1, features2) {
        const keys = Object.keys(features1);
        let totalDistance = 0;
        
        keys.forEach(key => {
            const val1 = features1[key];
            const val2 = features2[key];
            
            if (typeof val1 === 'number' && typeof val2 === 'number') {
                const max = Math.max(val1, val2);
                const distance = max > 0 ? Math.abs(val1 - val2) / max : 0;
                totalDistance += distance;
            } else if (val1 !== val2) {
                totalDistance += 1;
            }
        });
        
        return totalDistance / keys.length;
    }

    /**
     * Get all interactions
     */
    getAllInteractions() {
        const interactions = [];
        const elements = this.getAllElements();
        
        elements.forEach(element => {
            const elementInteractions = this.getElementInteractions(element);
            interactions.push(...elementInteractions);
        });
        
        return interactions;
    }

    /**
     * Get element interactions
     */
    getElementInteractions(element) {
        const interactions = [];
        const interactionTypes = ['click', 'hover', 'focus', 'keyboard', 'touch', 'drag'];
        
        interactionTypes.forEach(type => {
            if (this.supportsInteraction(element, type)) {
                interactions.push({
                    element: element,
                    type: type,
                    id: `${element.id || element.tagName}-${type}`
                });
            }
        });
        
        return interactions;
    }

    /**
     * Check if element supports interaction
     */
    supportsInteraction(element, type) {
        switch (type) {
            case 'click':
                return element.tagName === 'A' || element.tagName === 'BUTTON' || element.getAttribute('role') === 'button';
            case 'hover':
                return element.hasAttribute('data-hover') || element.classList.contains('hoverable');
            case 'focus':
                return element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' || element.tabIndex >= 0;
            case 'keyboard':
                return element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA';
            case 'touch':
                return element.hasAttribute('data-touch') || element.classList.contains('touchable');
            case 'drag':
                return element.draggable || element.hasAttribute('data-draggable');
            default:
                return false;
        }
    }

    /**
     * Get covered interactions
     */
    getCoveredInteractions() {
        const interactions = this.getAllInteractions();
        return interactions.filter(interaction => this.isInteractionCovered(interaction));
    }

    /**
     * Check if interaction is covered
     */
    isInteractionCovered(interaction) {
        const element = interaction.element;
        return element.hasAttribute(`data-${interaction.type}-covered`) ||
               element.classList.contains(`${interaction.type}-covered`);
    }

    /**
     * Categorize interaction coverage
     */
    categorizeInteractionCoverage(interactions, coveredInteractions) {
        const categories = {
            click: { total: 0, covered: 0 },
            hover: { total: 0, covered: 0 },
            focus: { total: 0, covered: 0 },
            keyboard: { total: 0, covered: 0 },
            touch: { total: 0, covered: 0 },
            drag: { total: 0, covered: 0 }
        };
        
        interactions.forEach(interaction => {
            const type = interaction.type;
            categories[type].total++;
            
            if (coveredInteractions.includes(interaction)) {
                categories[type].covered++;
            }
        });
        
        // Calculate percentages
        Object.keys(categories).forEach(type => {
            const data = categories[type];
            data.percentage = this.calculatePercentage(data.covered, data.total);
        });
        
        return categories;
    }

    /**
     * Get all paths
     */
    getAllPaths() {
        // This would typically get paths from the graph data
        // For now, return a mock structure
        return [];
    }

    /**
     * Get covered paths
     */
    getCoveredPaths() {
        const paths = this.getAllPaths();
        return paths.filter(path => this.isPathCovered(path));
    }

    /**
     * Check if path is covered
     */
    isPathCovered(path) {
        return path.covered || path.visited || path.traversed;
    }

    /**
     * Analyze path complexity
     */
    analyzePathComplexity(paths) {
        if (paths.length === 0) return 0;
        
        const complexities = paths.map(path => this.calculatePathComplexity(path));
        const averageComplexity = complexities.reduce((sum, complexity) => sum + complexity, 0) / complexities.length;
        
        return averageComplexity;
    }

    /**
     * Calculate path complexity
     */
    calculatePathComplexity(path) {
        let complexity = 0;
        
        // Length factor
        complexity += path.length * 0.3;
        
        // Interaction factor
        complexity += path.interactions?.length * 0.2 || 0;
        
        // State change factor
        complexity += path.stateChanges?.length * 0.2 || 0;
        
        // Conditional factor
        complexity += path.conditionals?.length * 0.3 || 0;
        
        return complexity;
    }

    /**
     * Get all features
     */
    getAllFeatures() {
        const features = [];
        const featureTypes = [
            'navigation', 'forms', 'media', 'interactive', 'accessibility',
            'authentication', 'ecommerce', 'responsive', 'spa', 'pwa'
        ];
        
        featureTypes.forEach(type => {
            const featureElements = document.querySelectorAll(`[data-feature="${type}"], .${type}, [data-${type}]`);
            features.push(...Array.from(featureElements).map(element => ({
                element: element,
                type: type,
                id: `${type}-${element.id || element.tagName}`
            })));
        });
        
        return features;
    }

    /**
     * Get covered features
     */
    getCoveredFeatures() {
        const features = this.getAllFeatures();
        return features.filter(feature => this.isFeatureCovered(feature));
    }

    /**
     * Check if feature is covered
     */
    isFeatureCovered(feature) {
        const element = feature.element;
        return element.hasAttribute('data-feature-covered') ||
               element.classList.contains('feature-covered');
    }

    /**
     * Categorize feature coverage
     */
    categorizeFeatureCoverage(features, coveredFeatures) {
        const categories = {};
        
        features.forEach(feature => {
            const type = feature.type;
            if (!categories[type]) {
                categories[type] = { total: 0, covered: 0 };
            }
            categories[type].total++;
            
            if (coveredFeatures.includes(feature)) {
                categories[type].covered++;
            }
        });
        
        // Calculate percentages
        Object.keys(categories).forEach(type => {
            const data = categories[type];
            data.percentage = this.calculatePercentage(data.covered, data.total);
        });
        
        return categories;
    }

    /**
     * Get current coverage
     */
    getCurrentCoverage() {
        return {
            elements: this.metrics.coveredElements / this.metrics.totalElements,
            states: this.metrics.uniqueStates / this.metrics.totalStates,
            interactions: this.metrics.coveredInteractions / this.metrics.totalInteractions,
            paths: this.metrics.coveredPaths / this.metrics.totalPaths,
            features: this.metrics.coveredFeatures / this.metrics.totalFeatures
        };
    }

    /**
     * Get previous coverage
     */
    getPreviousCoverage() {
        if (this.analysisHistory.length === 0) {
            return { elements: 0, states: 0, interactions: 0, paths: 0, features: 0 };
        }
        
        const lastAnalysis = this.analysisHistory[this.analysisHistory.length - 1];
        return lastAnalysis.coverage;
    }

    /**
     * Calculate percentage
     */
    calculatePercentage(covered, total) {
        return total > 0 ? (covered / total) * 100 : 0;
    }

    /**
     * Get coverage statistics
     */
    getCoverageStatistics() {
        return {
            elements: {
                total: this.metrics.totalElements,
                covered: this.metrics.coveredElements,
                percentage: this.calculatePercentage(this.metrics.coveredElements, this.metrics.totalElements)
            },
            states: {
                total: this.metrics.totalStates,
                unique: this.metrics.uniqueStates,
                percentage: this.calculatePercentage(this.metrics.uniqueStates, this.metrics.totalStates)
            },
            interactions: {
                total: this.metrics.totalInteractions,
                covered: this.metrics.coveredInteractions,
                percentage: this.calculatePercentage(this.metrics.coveredInteractions, this.metrics.totalInteractions)
            },
            paths: {
                total: this.metrics.totalPaths,
                covered: this.metrics.coveredPaths,
                percentage: this.calculatePercentage(this.metrics.coveredPaths, this.metrics.totalPaths)
            },
            features: {
                total: this.metrics.totalFeatures,
                covered: this.metrics.coveredFeatures,
                percentage: this.calculatePercentage(this.metrics.coveredFeatures, this.metrics.totalFeatures)
            }
        };
    }

    /**
     * Export coverage data
     */
    exportCoverageData() {
        return {
            coverageData: Object.fromEntries(this.coverageData.elementCoverage),
            metrics: this.getCoverageStatistics(),
            analysisHistory: this.analysisHistory,
            timestamp: Date.now()
        };
    }

    /**
     * Clear coverage data
     */
    clearCoverageData() {
        this.coverageData = {
            elementCoverage: new Map(),
            stateCoverage: new Map(),
            interactionCoverage: new Map(),
            pathCoverage: new Map(),
            featureCoverage: new Map()
        };
        this.metrics = {
            totalElements: 0,
            coveredElements: 0,
            totalStates: 0,
            uniqueStates: 0,
            totalInteractions: 0,
            coveredInteractions: 0,
            totalPaths: 0,
            coveredPaths: 0,
            totalFeatures: 0,
            coveredFeatures: 0
        };
        this.analysisHistory = [];
    }

    /**
     * Get analysis status
     */
    getStatus() {
        return {
            isAnalyzing: this.isAnalyzing,
            totalElements: this.metrics.totalElements,
            coveredElements: this.metrics.coveredElements,
            totalStates: this.metrics.totalStates,
            uniqueStates: this.metrics.uniqueStates,
            totalInteractions: this.metrics.totalInteractions,
            coveredInteractions: this.metrics.coveredInteractions,
            totalPaths: this.metrics.totalPaths,
            coveredPaths: this.metrics.coveredPaths,
            totalFeatures: this.metrics.totalFeatures,
            coveredFeatures: this.metrics.coveredFeatures
        };
    }
}
