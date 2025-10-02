/**
 * State Explosion Mitigator for advanced clustering algorithms and graph pruning
 * Implements state explosion mitigation, advanced clustering algorithms, graph pruning, and representative page selection
 */

export class StateExplosionMitigator {
    constructor() {
        this.clusters = new Map();
        this.representativePages = new Map();
        this.prunedNodes = new Set();
        this.similarityThreshold = 0.8;
        this.clusterThreshold = 0.7;
        this.maxClusterSize = 10;
        this.isMitigating = false;
    }

    /**
     * Start state explosion mitigation
     */
    startMitigation() {
        if (this.isMitigating) return;
        
        this.isMitigating = true;
        this.analyzeStateExplosion();
        this.performClustering();
        this.selectRepresentativePages();
        this.performGraphPruning();
    }

    /**
     * Stop state explosion mitigation
     */
    stopMitigation() {
        this.isMitigating = false;
    }

    /**
     * Analyze state explosion
     */
    analyzeStateExplosion() {
        const analysis = {
            totalStates: 0,
            similarStates: 0,
            redundantStates: 0,
            clusterCandidates: 0,
            explosionRisk: 'low'
        };
        
        // Get current graph data
        const graphData = this.getGraphData();
        analysis.totalStates = graphData.nodes.length;
        
        // Analyze similarity between states
        const similarities = this.calculateStateSimilarities(graphData.nodes);
        analysis.similarStates = similarities.filter(sim => sim.similarity > this.similarityThreshold).length;
        analysis.redundantStates = similarities.filter(sim => sim.similarity > 0.9).length;
        
        // Calculate explosion risk
        if (analysis.totalStates > 1000) {
            analysis.explosionRisk = 'high';
        } else if (analysis.totalStates > 500) {
            analysis.explosionRisk = 'medium';
        }
        
        return analysis;
    }

    /**
     * Perform clustering
     */
    performClustering() {
        const graphData = this.getGraphData();
        const nodes = graphData.nodes;
        
        // Group nodes by similarity
        const clusters = this.groupNodesBySimilarity(nodes);
        
        // Create cluster representatives
        clusters.forEach((cluster, index) => {
            const representative = this.selectClusterRepresentative(cluster);
            this.clusters.set(index, {
                id: index,
                nodes: cluster,
                representative: representative,
                size: cluster.length,
                similarity: this.calculateClusterSimilarity(cluster)
            });
        });
        
        return clusters;
    }

    /**
     * Select representative pages
     */
    selectRepresentativePages() {
        const representatives = [];
        
        this.clusters.forEach((cluster, index) => {
            const representative = this.selectClusterRepresentative(cluster.nodes);
            representatives.push({
                clusterId: index,
                representative: representative,
                clusterSize: cluster.nodes.length,
                similarity: cluster.similarity
            });
        });
        
        this.representativePages = new Map(representatives.map(rep => [rep.clusterId, rep]));
        return representatives;
    }

    /**
     * Perform graph pruning
     */
    performGraphPruning() {
        const graphData = this.getGraphData();
        const nodesToPrune = [];
        
        // Identify nodes to prune
        this.clusters.forEach((cluster, index) => {
            if (cluster.size > this.maxClusterSize) {
                // Keep only the representative and a few key nodes
                const nodesToKeep = this.selectKeyNodes(cluster.nodes, 3);
                const nodesToRemove = cluster.nodes.filter(node => !nodesToKeep.includes(node));
                nodesToPrune.push(...nodesToRemove);
            }
        });
        
        // Mark nodes for pruning
        nodesToPrune.forEach(node => {
            this.prunedNodes.add(node.id);
        });
        
        return nodesToPrune;
    }

    /**
     * Group nodes by similarity
     */
    groupNodesBySimilarity(nodes) {
        const clusters = [];
        const processed = new Set();
        
        nodes.forEach(node => {
            if (processed.has(node.id)) return;
            
            const cluster = [node];
            processed.add(node.id);
            
            // Find similar nodes
            nodes.forEach(otherNode => {
                if (processed.has(otherNode.id) || otherNode.id === node.id) return;
                
                const similarity = this.calculateNodeSimilarity(node, otherNode);
                if (similarity > this.clusterThreshold) {
                    cluster.push(otherNode);
                    processed.add(otherNode.id);
                }
            });
            
            clusters.push(cluster);
        });
        
        return clusters;
    }

    /**
     * Calculate state similarities
     */
    calculateStateSimilarities(nodes) {
        const similarities = [];
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const similarity = this.calculateNodeSimilarity(nodes[i], nodes[j]);
                similarities.push({
                    node1: nodes[i],
                    node2: nodes[j],
                    similarity: similarity
                });
            }
        }
        
        return similarities;
    }

    /**
     * Calculate node similarity
     */
    calculateNodeSimilarity(node1, node2) {
        const features1 = this.extractNodeFeatures(node1);
        const features2 = this.extractNodeFeatures(node2);
        
        // Calculate feature similarity
        const featureSimilarity = this.calculateFeatureSimilarity(features1, features2);
        
        // Calculate structural similarity
        const structuralSimilarity = this.calculateStructuralSimilarity(node1, node2);
        
        // Calculate functional similarity
        const functionalSimilarity = this.calculateFunctionalSimilarity(node1, node2);
        
        // Weighted average
        return (featureSimilarity * 0.4 + structuralSimilarity * 0.3 + functionalSimilarity * 0.3);
    }

    /**
     * Extract node features
     */
    extractNodeFeatures(node) {
        return {
            url: node.url,
            title: node.title,
            elementCount: node.elements?.length || 0,
            interactiveElements: node.elements?.filter(el => el.interactive?.clickable).length || 0,
            formElements: node.elements?.filter(el => el.category === 'forms').length || 0,
            mediaElements: node.elements?.filter(el => el.category === 'media').length || 0,
            hasScreenshot: !!node.screenshot,
            isStatsPage: node.isStatsPage || false,
            timestamp: node.timestamp
        };
    }

    /**
     * Calculate feature similarity
     */
    calculateFeatureSimilarity(features1, features2) {
        const weights = {
            url: 0.3,
            title: 0.2,
            elementCount: 0.1,
            interactiveElements: 0.1,
            formElements: 0.1,
            mediaElements: 0.1,
            hasScreenshot: 0.05,
            isStatsPage: 0.05
        };
        
        let similarity = 0;
        let totalWeight = 0;
        
        Object.keys(weights).forEach(key => {
            const weight = weights[key];
            totalWeight += weight;
            
            if (key === 'url') {
                similarity += weight * this.calculateURLSimilarity(features1.url, features2.url);
            } else if (key === 'title') {
                similarity += weight * this.calculateTextSimilarity(features1.title, features2.title);
            } else if (key === 'elementCount' || key === 'interactiveElements' || key === 'formElements' || key === 'mediaElements') {
                const diff = Math.abs(features1[key] - features2[key]);
                const max = Math.max(features1[key], features2[key]);
                similarity += weight * (max === 0 ? 1 : (max - diff) / max);
            } else {
                similarity += weight * (features1[key] === features2[key] ? 1 : 0);
            }
        });
        
        return totalWeight > 0 ? similarity / totalWeight : 0;
    }

    /**
     * Calculate URL similarity
     */
    calculateURLSimilarity(url1, url2) {
        try {
            const url1Obj = new URL(url1);
            const url2Obj = new URL(url2);
            
            // Compare domains
            if (url1Obj.hostname !== url2Obj.hostname) return 0;
            
            // Compare paths
            const path1 = url1Obj.pathname;
            const path2 = url2Obj.pathname;
            
            // Simple path similarity
            const path1Parts = path1.split('/').filter(part => part);
            const path2Parts = path2.split('/').filter(part => part);
            
            const commonParts = path1Parts.filter(part => path2Parts.includes(part));
            const totalParts = Math.max(path1Parts.length, path2Parts.length);
            
            return totalParts > 0 ? commonParts.length / totalParts : 1;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Calculate text similarity
     */
    calculateTextSimilarity(text1, text2) {
        if (!text1 || !text2) return 0;
        
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        
        const commonWords = words1.filter(word => words2.includes(word));
        const totalWords = Math.max(words1.length, words2.length);
        
        return totalWords > 0 ? commonWords.length / totalWords : 0;
    }

    /**
     * Calculate structural similarity
     */
    calculateStructuralSimilarity(node1, node2) {
        const elements1 = node1.elements || [];
        const elements2 = node2.elements || [];
        
        if (elements1.length === 0 && elements2.length === 0) return 1;
        if (elements1.length === 0 || elements2.length === 0) return 0;
        
        // Compare element types
        const types1 = elements1.map(el => el.nodeType);
        const types2 = elements2.map(el => el.nodeType);
        
        const commonTypes = types1.filter(type => types2.includes(type));
        const totalTypes = Math.max(types1.length, types2.length);
        
        return totalTypes > 0 ? commonTypes.length / totalTypes : 0;
    }

    /**
     * Calculate functional similarity
     */
    calculateFunctionalSimilarity(node1, node2) {
        const features1 = this.extractNodeFeatures(node1);
        const features2 = this.extractNodeFeatures(node2);
        
        // Compare functional features
        const functionalFeatures = ['interactiveElements', 'formElements', 'mediaElements', 'isStatsPage'];
        let similarity = 0;
        
        functionalFeatures.forEach(feature => {
            if (features1[feature] === features2[feature]) {
                similarity += 1;
            }
        });
        
        return similarity / functionalFeatures.length;
    }

    /**
     * Calculate cluster similarity
     */
    calculateClusterSimilarity(cluster) {
        if (cluster.length <= 1) return 1;
        
        let totalSimilarity = 0;
        let comparisons = 0;
        
        for (let i = 0; i < cluster.length; i++) {
            for (let j = i + 1; j < cluster.length; j++) {
                const similarity = this.calculateNodeSimilarity(cluster[i], cluster[j]);
                totalSimilarity += similarity;
                comparisons++;
            }
        }
        
        return comparisons > 0 ? totalSimilarity / comparisons : 0;
    }

    /**
     * Select cluster representative
     */
    selectClusterRepresentative(cluster) {
        if (cluster.length === 1) return cluster[0];
        
        // Select the node with the highest centrality
        let bestNode = cluster[0];
        let bestScore = this.calculateNodeCentrality(cluster[0]);
        
        cluster.forEach(node => {
            const score = this.calculateNodeCentrality(node);
            if (score > bestScore) {
                bestScore = score;
                bestNode = node;
            }
        });
        
        return bestNode;
    }

    /**
     * Calculate node centrality
     */
    calculateNodeCentrality(node) {
        let score = 0;
        
        // URL importance
        if (node.url.includes('/dashboard') || node.url.includes('/admin')) score += 2;
        if (node.url.includes('/home') || node.url.includes('/index')) score += 1;
        
        // Title importance
        if (node.title && node.title.length > 0) score += 1;
        
        // Element count
        const elementCount = node.elements?.length || 0;
        score += Math.min(elementCount / 10, 2);
        
        // Interactive elements
        const interactiveCount = node.elements?.filter(el => el.interactive?.clickable).length || 0;
        score += Math.min(interactiveCount / 5, 2);
        
        // Screenshot availability
        if (node.screenshot) score += 1;
        
        // Stats page
        if (node.isStatsPage) score += 2;
        
        return score;
    }

    /**
     * Select key nodes
     */
    selectKeyNodes(cluster, maxNodes) {
        if (cluster.length <= maxNodes) return cluster;
        
        // Sort by centrality
        const sortedNodes = cluster.sort((a, b) => 
            this.calculateNodeCentrality(b) - this.calculateNodeCentrality(a)
        );
        
        return sortedNodes.slice(0, maxNodes);
    }

    /**
     * Get graph data
     */
    getGraphData() {
        // This would typically get data from chrome.storage.local
        // For now, return a mock structure
        return {
            nodes: [],
            edges: []
        };
    }

    /**
     * Get mitigation statistics
     */
    getMitigationStatistics() {
        return {
            clusters: {
                total: this.clusters.size,
                averageSize: this.calculateAverageClusterSize(),
                largestCluster: this.getLargestClusterSize()
            },
            representatives: {
                total: this.representativePages.size,
                selected: Array.from(this.representativePages.values())
            },
            pruning: {
                totalPruned: this.prunedNodes.size,
                prunedNodes: Array.from(this.prunedNodes)
            },
            thresholds: {
                similarity: this.similarityThreshold,
                cluster: this.clusterThreshold,
                maxClusterSize: this.maxClusterSize
            }
        };
    }

    /**
     * Calculate average cluster size
     */
    calculateAverageClusterSize() {
        if (this.clusters.size === 0) return 0;
        
        const totalSize = Array.from(this.clusters.values()).reduce((sum, cluster) => sum + cluster.size, 0);
        return totalSize / this.clusters.size;
    }

    /**
     * Get largest cluster size
     */
    getLargestClusterSize() {
        if (this.clusters.size === 0) return 0;
        
        return Math.max(...Array.from(this.clusters.values()).map(cluster => cluster.size));
    }

    /**
     * Export mitigation data
     */
    exportMitigationData() {
        return {
            clusters: Array.from(this.clusters.entries()),
            representatives: Array.from(this.representativePages.entries()),
            prunedNodes: Array.from(this.prunedNodes),
            statistics: this.getMitigationStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear mitigation data
     */
    clearMitigationData() {
        this.clusters.clear();
        this.representativePages.clear();
        this.prunedNodes.clear();
    }

    /**
     * Get mitigation status
     */
    getStatus() {
        return {
            isMitigating: this.isMitigating,
            totalClusters: this.clusters.size,
            totalRepresentatives: this.representativePages.size,
            totalPrunedNodes: this.prunedNodes.size,
            similarityThreshold: this.similarityThreshold,
            clusterThreshold: this.clusterThreshold,
            maxClusterSize: this.maxClusterSize
        };
    }
}
