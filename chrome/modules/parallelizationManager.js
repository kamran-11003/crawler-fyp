/**
 * Parallelization Manager for multi-tab crawling, distributed crawling architecture, and batch processing optimization
 * Implements comprehensive parallelization strategies for large-scale crawling
 */

export class ParallelizationManager {
    constructor() {
        this.activeTabs = new Map();
        this.crawlingQueue = [];
        this.batchProcessor = null;
        this.distributedNodes = new Map();
        this.performanceMetrics = {
            totalCrawled: 0,
            averageCrawlTime: 0,
            parallelEfficiency: 0,
            resourceUtilization: 0
        };
        this.config = {
            maxConcurrentTabs: 5,
            batchSize: 10,
            crawlTimeout: 30000,
            retryAttempts: 3,
            resourceLimit: 0.8
        };
    }

    /**
     * Initialize parallelization manager
     */
    initialize() {
        this.setupBatchProcessor();
        this.setupDistributedArchitecture();
        this.setupPerformanceMonitoring();
        this.setupResourceManagement();
    }

    /**
     * Setup batch processor
     */
    setupBatchProcessor() {
        this.batchProcessor = {
            queue: [],
            processing: false,
            batchSize: this.config.batchSize,
            timeout: 5000
        };
    }

    /**
     * Setup distributed architecture
     */
    setupDistributedArchitecture() {
        this.distributedNodes = new Map();
        this.setupNodeCommunication();
        this.setupLoadBalancing();
        this.setupFaultTolerance();
    }

    /**
     * Setup node communication
     */
    setupNodeCommunication() {
        // Setup message passing between nodes
        this.nodeCommunication = {
            sendMessage: (nodeId, message) => {
                const node = this.distributedNodes.get(nodeId);
                if (node) {
                    node.receiveMessage(message);
                }
            },
            broadcastMessage: (message) => {
                this.distributedNodes.forEach(node => {
                    node.receiveMessage(message);
                });
            }
        };
    }

    /**
     * Setup load balancing
     */
    setupLoadBalancing() {
        this.loadBalancer = {
            nodeLoads: new Map(),
            selectNode: () => {
                let selectedNode = null;
                let minLoad = Infinity;
                
                this.distributedNodes.forEach((node, nodeId) => {
                    const load = this.loadBalancer.nodeLoads.get(nodeId) || 0;
                    if (load < minLoad) {
                        minLoad = load;
                        selectedNode = nodeId;
                    }
                });
                
                return selectedNode;
            },
            updateLoad: (nodeId, load) => {
                this.loadBalancer.nodeLoads.set(nodeId, load);
            }
        };
    }

    /**
     * Setup fault tolerance
     */
    setupFaultTolerance() {
        this.faultTolerance = {
            nodeHealth: new Map(),
            checkHealth: (nodeId) => {
                const node = this.distributedNodes.get(nodeId);
                if (node) {
                    const health = node.checkHealth();
                    this.faultTolerance.nodeHealth.set(nodeId, health);
                    return health;
                }
                return false;
            },
            handleNodeFailure: (nodeId) => {
                console.warn(`Node ${nodeId} failed, redistributing tasks`);
                this.redistributeTasks(nodeId);
            }
        };
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.performanceMonitor = {
            startTime: Date.now(),
            metrics: {
                totalCrawled: 0,
                averageCrawlTime: 0,
                parallelEfficiency: 0,
                resourceUtilization: 0
            },
            updateMetrics: (crawlTime, resourceUsage) => {
                this.performanceMonitor.metrics.totalCrawled++;
                this.performanceMonitor.metrics.averageCrawlTime = 
                    (this.performanceMonitor.metrics.averageCrawlTime + crawlTime) / 2;
                this.performanceMonitor.metrics.resourceUtilization = resourceUsage;
            }
        };
    }

    /**
     * Setup resource management
     */
    setupResourceManagement() {
        this.resourceManager = {
            memoryUsage: 0,
            cpuUsage: 0,
            networkUsage: 0,
            checkResourceLimits: () => {
                const memoryLimit = this.config.resourceLimit;
                const cpuLimit = this.config.resourceLimit;
                const networkLimit = this.config.resourceLimit;
                
                return {
                    memory: this.resourceManager.memoryUsage < memoryLimit,
                    cpu: this.resourceManager.cpuUsage < cpuLimit,
                    network: this.resourceManager.networkUsage < networkLimit
                };
            },
            updateResourceUsage: (memory, cpu, network) => {
                this.resourceManager.memoryUsage = memory;
                this.resourceManager.cpuUsage = cpu;
                this.resourceManager.networkUsage = network;
            }
        };
    }

    /**
     * Start multi-tab crawling
     */
    async startMultiTabCrawling(urls) {
        const batches = this.createBatches(urls, this.config.batchSize);
        const results = [];
        
        for (const batch of batches) {
            const batchResults = await this.crawlBatch(batch);
            results.push(...batchResults);
            
            // Check resource limits
            if (!this.resourceManager.checkResourceLimits().memory) {
                await this.waitForResources();
            }
        }
        
        return results;
    }

    /**
     * Create batches from URLs
     */
    createBatches(urls, batchSize) {
        const batches = [];
        for (let i = 0; i < urls.length; i += batchSize) {
            batches.push(urls.slice(i, i + batchSize));
        }
        return batches;
    }

    /**
     * Crawl a batch of URLs
     */
    async crawlBatch(urls) {
        const promises = urls.map(url => this.crawlSingleUrl(url));
        const results = await Promise.allSettled(promises);
        
        return results.map((result, index) => ({
            url: urls[index],
            success: result.status === 'fulfilled',
            data: result.status === 'fulfilled' ? result.value : null,
            error: result.status === 'rejected' ? result.reason : null
        }));
    }

    /**
     * Crawl a single URL
     */
    async crawlSingleUrl(url) {
        const startTime = Date.now();
        
        try {
            // Create new tab
            const tab = await this.createTab(url);
            
            // Wait for page load
            await this.waitForPageLoad(tab.id);
            
            // Extract data
            const data = await this.extractPageData(tab.id);
            
            // Close tab
            await this.closeTab(tab.id);
            
            const crawlTime = Date.now() - startTime;
            this.performanceMonitor.updateMetrics(crawlTime, this.getResourceUsage());
            
            return data;
        } catch (error) {
            console.error(`Error crawling ${url}:`, error);
            throw error;
        }
    }

    /**
     * Create new tab
     */
    async createTab(url) {
        return new Promise((resolve, reject) => {
            chrome.tabs.create({ url }, (tab) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    this.activeTabs.set(tab.id, tab);
                    resolve(tab);
                }
            });
        });
    }

    /**
     * Wait for page load
     */
    async waitForPageLoad(tabId) {
        return new Promise((resolve) => {
            const checkComplete = () => {
                chrome.tabs.get(tabId, (tab) => {
                    if (tab && tab.status === 'complete') {
                        resolve();
                    } else {
                        setTimeout(checkComplete, 100);
                    }
                });
            };
            checkComplete();
        });
    }

    /**
     * Extract page data
     */
    async extractPageData(tabId) {
        return new Promise((resolve, reject) => {
            chrome.tabs.sendMessage(tabId, { type: 'extractData' }, (response) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(response);
                }
            });
        });
    }

    /**
     * Close tab
     */
    async closeTab(tabId) {
        return new Promise((resolve) => {
            chrome.tabs.remove(tabId, () => {
                this.activeTabs.delete(tabId);
                resolve();
            });
        });
    }

    /**
     * Wait for resources to be available
     */
    async waitForResources() {
        return new Promise((resolve) => {
            const checkResources = () => {
                if (this.resourceManager.checkResourceLimits().memory) {
                    resolve();
                } else {
                    setTimeout(checkResources, 1000);
                }
            };
            checkResources();
        });
    }

    /**
     * Get resource usage
     */
    getResourceUsage() {
        return {
            memory: this.resourceManager.memoryUsage,
            cpu: this.resourceManager.cpuUsage,
            network: this.resourceManager.networkUsage
        };
    }

    /**
     * Start distributed crawling
     */
    async startDistributedCrawling(urls) {
        const nodeId = this.selectNode();
        if (!nodeId) {
            throw new Error('No available nodes for distributed crawling');
        }
        
        const node = this.distributedNodes.get(nodeId);
        if (!node) {
            throw new Error(`Node ${nodeId} not found`);
        }
        
        return await node.crawl(urls);
    }

    /**
     * Select node for crawling
     */
    selectNode() {
        return this.loadBalancer.selectNode();
    }

    /**
     * Add distributed node
     */
    addDistributedNode(nodeId, node) {
        this.distributedNodes.set(nodeId, node);
        this.loadBalancer.nodeLoads.set(nodeId, 0);
    }

    /**
     * Remove distributed node
     */
    removeDistributedNode(nodeId) {
        this.distributedNodes.delete(nodeId);
        this.loadBalancer.nodeLoads.delete(nodeId);
    }

    /**
     * Redistribute tasks after node failure
     */
    redistributeTasks(failedNodeId) {
        const failedNode = this.distributedNodes.get(failedNodeId);
        if (failedNode && failedNode.pendingTasks) {
            const tasks = failedNode.pendingTasks;
            const availableNodes = Array.from(this.distributedNodes.keys())
                .filter(id => id !== failedNodeId);
            
            if (availableNodes.length > 0) {
                const tasksPerNode = Math.ceil(tasks.length / availableNodes.length);
                let taskIndex = 0;
                
                availableNodes.forEach(nodeId => {
                    const nodeTasks = tasks.slice(taskIndex, taskIndex + tasksPerNode);
                    const node = this.distributedNodes.get(nodeId);
                    if (node) {
                        node.addTasks(nodeTasks);
                    }
                    taskIndex += tasksPerNode;
                });
            }
        }
    }

    /**
     * Start batch processing
     */
    async startBatchProcessing(items, processor) {
        const batches = this.createBatches(items, this.config.batchSize);
        const results = [];
        
        for (const batch of batches) {
            const batchResult = await this.processBatch(batch, processor);
            results.push(batchResult);
            
            // Update performance metrics
            this.updatePerformanceMetrics(batchResult);
        }
        
        return results;
    }

    /**
     * Process a batch
     */
    async processBatch(batch, processor) {
        const startTime = Date.now();
        
        try {
            const result = await processor(batch);
            const processingTime = Date.now() - startTime;
            
            return {
                success: true,
                result: result,
                processingTime: processingTime,
                batchSize: batch.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                processingTime: Date.now() - startTime,
                batchSize: batch.length
            };
        }
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics(batchResult) {
        this.performanceMetrics.totalCrawled += batchResult.batchSize;
        this.performanceMetrics.averageCrawlTime = 
            (this.performanceMetrics.averageCrawlTime + batchResult.processingTime) / 2;
        
        // Calculate parallel efficiency
        const theoreticalTime = batchResult.batchSize * this.performanceMetrics.averageCrawlTime;
        const actualTime = batchResult.processingTime;
        this.performanceMetrics.parallelEfficiency = theoreticalTime / actualTime;
        
        // Update resource utilization
        this.performanceMetrics.resourceUtilization = this.getResourceUsage();
    }

    /**
     * Optimize batch processing
     */
    optimizeBatchProcessing() {
        const optimizations = {
            batchSize: this.calculateOptimalBatchSize(),
            concurrency: this.calculateOptimalConcurrency(),
            timeout: this.calculateOptimalTimeout(),
            retryStrategy: this.calculateOptimalRetryStrategy()
        };
        
        this.config = { ...this.config, ...optimizations };
        return optimizations;
    }

    /**
     * Calculate optimal batch size
     */
    calculateOptimalBatchSize() {
        const memoryUsage = this.resourceManager.memoryUsage;
        const cpuUsage = this.resourceManager.cpuUsage;
        
        if (memoryUsage > 0.8 || cpuUsage > 0.8) {
            return Math.max(1, Math.floor(this.config.batchSize * 0.5));
        } else if (memoryUsage < 0.5 && cpuUsage < 0.5) {
            return Math.min(20, Math.floor(this.config.batchSize * 1.5));
        }
        
        return this.config.batchSize;
    }

    /**
     * Calculate optimal concurrency
     */
    calculateOptimalConcurrency() {
        const resourceLimits = this.resourceManager.checkResourceLimits();
        const availableResources = Object.values(resourceLimits).filter(Boolean).length;
        
        return Math.min(this.config.maxConcurrentTabs, availableResources * 2);
    }

    /**
     * Calculate optimal timeout
     */
    calculateOptimalTimeout() {
        const averageCrawlTime = this.performanceMetrics.averageCrawlTime;
        return Math.max(10000, averageCrawlTime * 2);
    }

    /**
     * Calculate optimal retry strategy
     */
    calculateOptimalRetryStrategy() {
        const failureRate = this.calculateFailureRate();
        
        if (failureRate > 0.5) {
            return { attempts: 5, delay: 2000 };
        } else if (failureRate > 0.2) {
            return { attempts: 3, delay: 1000 };
        } else {
            return { attempts: 1, delay: 500 };
        }
    }

    /**
     * Calculate failure rate
     */
    calculateFailureRate() {
        const totalCrawled = this.performanceMetrics.totalCrawled;
        const failedCrawls = this.getFailedCrawls();
        return totalCrawled > 0 ? failedCrawls / totalCrawled : 0;
    }

    /**
     * Get failed crawls
     */
    getFailedCrawls() {
        // This would typically track failed crawls
        // For now, return a mock value
        return 0;
    }

    /**
     * Get parallelization statistics
     */
    getParallelizationStatistics() {
        return {
            activeTabs: this.activeTabs.size,
            distributedNodes: this.distributedNodes.size,
            performanceMetrics: this.performanceMetrics,
            resourceUsage: this.getResourceUsage(),
            config: this.config
        };
    }

    /**
     * Clear parallelization data
     */
    clearParallelizationData() {
        this.activeTabs.clear();
        this.crawlingQueue = [];
        this.distributedNodes.clear();
        this.performanceMetrics = {
            totalCrawled: 0,
            averageCrawlTime: 0,
            parallelEfficiency: 0,
            resourceUtilization: 0
        };
    }

    /**
     * Export parallelization data
     */
    exportParallelizationData() {
        return {
            statistics: this.getParallelizationStatistics(),
            config: this.config,
            timestamp: Date.now()
        };
    }
}
