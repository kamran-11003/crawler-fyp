/**
 * Graph Visualizer with D3.js
 * Interactive graph visualization with screenshot viewing and advanced filtering
 */

class GraphVisualizer {
    constructor() {
        this.graph = null;
        this.svg = null;
        this.simulation = null;
        this.nodes = null;
        this.links = null;
        this.nodeInfo = null;
        this.currentLayout = 'force';
        this.filteredNodes = null;
        this.filteredLinks = null;
        this.nodeSize = 12;
        this.linkDistance = 100;
        this.chargeStrength = -300;
        this.currentFilter = 'all';
        this.zoom = null;
        this.tooltip = null;
        this.legend = null;
        
        this.init();
    }

    init() {
        this.createTooltip();
        this.setupEventListeners();
        this.loadGraphFromStorage();
    }

    createTooltip() {
        this.tooltip = d3.select('body')
            .append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);
    }

    setupEventListeners() {
        // Button event listeners
        document.getElementById('load-graph-btn')?.addEventListener('click', () => this.loadGraph());
        document.getElementById('export-graph-btn')?.addEventListener('click', () => this.exportGraph());
        document.getElementById('reset-graph-btn')?.addEventListener('click', () => this.resetGraph());
        document.getElementById('reset-view-btn')?.addEventListener('click', () => this.resetView());
        document.getElementById('toggle-layout-btn')?.addEventListener('click', () => this.toggleLayout());
        document.getElementById('highlight-stats-btn')?.addEventListener('click', () => this.highlightStatsPages());
        document.getElementById('close-screenshot-btn')?.addEventListener('click', () => this.closeScreenshotViewer());

        // Form element event listeners
        document.getElementById('node-size')?.addEventListener('change', (e) => this.updateNodeSize(e.target.value));
        document.getElementById('link-distance')?.addEventListener('change', (e) => this.updateLinkDistance(e.target.value));
        document.getElementById('charge-strength')?.addEventListener('change', (e) => this.updateChargeStrength(e.target.value));
        document.getElementById('filter-type')?.addEventListener('change', (e) => this.applyFilter(e.target.value));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeScreenshotViewer();
                this.hideNodeInfo();
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (this.svg) {
                this.resizeGraph();
            }
        });
    }

    async loadGraph() {
        try {
            this.showLoading(true);
            this.updateStatus('Loading graph...');

            // Try to load from localStorage first
            const storedGraph = localStorage.getItem('ui-crawler-graph');
            if (storedGraph) {
                this.graph = JSON.parse(storedGraph);
                this.renderGraph();
                this.updateStats();
                this.updateStatus('Graph loaded from storage');
                return;
            }

            // If no stored graph, try to load from file
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.graph = JSON.parse(e.target.result);
                        this.renderGraph();
                        this.updateStats();
                        this.updateStatus('Graph loaded from file');
                    };
                    reader.readAsText(file);
                }
            };
            input.click();
        } catch (error) {
            console.error('Error loading graph:', error);
            this.updateStatus('Error loading graph: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }

    async loadGraphFromStorage() {
        try {
            const storedGraph = localStorage.getItem('ui-crawler-graph');
            if (storedGraph) {
                this.graph = JSON.parse(storedGraph);
                this.renderGraph();
                this.updateStats();
                this.updateStatus('Graph loaded from storage');
            }
        } catch (error) {
            console.error('Error loading graph from storage:', error);
        }
    }

    renderGraph() {
        if (!this.graph || !this.graph.nodes) {
            this.updateStatus('No graph data available');
            return;
        }

        this.showLoading(true);
        
        const container = d3.select('#graph-container');
        container.selectAll('*').remove();

        const width = container.node().clientWidth;
        const height = container.node().clientHeight;

        // Create SVG
        this.svg = container
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.select('g').attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Create main group
        const g = this.svg.append('g');

        // Prepare data
        this.nodes = this.graph.nodes.map(d => ({
            ...d,
            isStatsPage: this.isStatsPage(d.url),
            hasScreenshot: !!d.screenshots,
            isInteractive: this.isInteractivePage(d),
            filtered: false
        }));

        this.links = this.graph.edges || [];

        // Apply current filter
        this.applyCurrentFilter();

        // Create simulation
        this.simulation = d3.forceSimulation(this.filteredNodes)
            .force('link', d3.forceLink(this.filteredLinks).id(d => d.id).distance(this.linkDistance))
            .force('charge', d3.forceManyBody().strength(this.chargeStrength))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => this.getNodeRadius(d) + 5));

        // Create links
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.filteredLinks)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', d => Math.sqrt(d.weight || 1))
            .attr('stroke-dasharray', d => d.type === 'navigation' ? '0' : '5,5');

        // Create nodes
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle')
            .data(this.filteredNodes)
            .enter().append('circle')
            .attr('r', d => this.getNodeRadius(d))
            .attr('fill', d => this.getNodeColor(d))
            .attr('stroke', d => d.isStatsPage ? '#ff6b6b' : '#333')
            .attr('stroke-width', d => d.isStatsPage ? 3 : 1)
            .style('cursor', 'pointer')
            .call(this.drag());

        // Add labels
        const labels = g.append('g')
            .attr('class', 'labels')
            .selectAll('text')
            .data(this.filteredNodes)
            .enter().append('text')
            .text(d => this.getNodeLabel(d))
            .attr('font-size', '12px')
            .attr('font-family', 'Arial, sans-serif')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .style('pointer-events', 'none')
            .style('user-select', 'none');

        // Add click handlers
        node.on('click', (event, d) => this.showNodeInfo(event, d));
        node.on('dblclick', (event, d) => this.showScreenshot(event, d));
        node.on('mouseover', (event, d) => this.showTooltip(event, d));
        node.on('mouseout', () => this.hideTooltip());

        // Update positions
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);

            labels
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });

        // Show legend
        this.showLegend();
        this.showLoading(false);
        this.updateStatus(`Graph rendered with ${this.filteredNodes.length} nodes and ${this.filteredLinks.length} links`);
    }

    getNodeRadius(d) {
        const baseRadius = this.nodeSize;
        const elementCount = d.elements ? d.elements.length : 0;
        const sizeMultiplier = Math.min(1 + elementCount * 0.02, 2);
        return Math.min(baseRadius * sizeMultiplier, 30);
    }

    getNodeColor(d) {
        if (d.filtered) return '#95a5a6';
        if (d.isStatsPage) return '#ff6b6b';
        if (d.hasScreenshot) return '#4ecdc4';
        if (d.isInteractive) return '#f39c12';
        return '#74a9cf';
    }

    getNodeLabel(d) {
        const title = d.title || 'Untitled';
        return title.length > 20 ? title.substring(0, 20) + '...' : title;
    }

    isStatsPage(url) {
        if (!url) return false;
        const statsKeywords = ['stats', 'analytics', 'dashboard', 'metrics', 'reports', 'insights'];
        return statsKeywords.some(keyword => url.toLowerCase().includes(keyword));
    }

    isInteractivePage(node) {
        if (!node.elements) return false;
        const interactiveElements = node.elements.filter(el => 
            el.interactive && (el.interactive.clickable || el.interactive.focusable)
        );
        return interactiveElements.length > 5;
    }

    showNodeInfo(event, d) {
        event.stopPropagation();
        
        const info = `
            <h4>${d.title || 'Untitled'}</h4>
            <p><strong>URL:</strong> <span class="url">${d.url}</span></p>
            <p><strong>Elements:</strong> ${d.elements ? d.elements.length : 0}</p>
            <p><strong>Type:</strong> ${d.isStatsPage ? '📊 Stats Page' : d.isInteractive ? '🎯 Interactive Page' : '📄 Regular Page'}</p>
            <p><strong>Screenshot:</strong> ${d.hasScreenshot ? '✅ Available' : '❌ Not Available'}</p>
            <p><strong>Timestamp:</strong> ${new Date(d.timestamp).toLocaleString()}</p>
            ${d.stateVector ? `<p><strong>State Vector:</strong> ${JSON.stringify(d.stateVector, null, 2).substring(0, 100)}...</p>` : ''}
        `;

        this.nodeInfo = d3.select('body')
            .append('div')
            .attr('class', 'node-info')
            .html(info)
            .style('display', 'block')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    hideNodeInfo() {
        if (this.nodeInfo) {
            this.nodeInfo.remove();
            this.nodeInfo = null;
        }
    }

    showScreenshot(event, d) {
        if (!d.screenshots) {
            alert('No screenshot available for this node');
            return;
        }

        const viewer = document.getElementById('screenshot-viewer');
        const content = document.getElementById('screenshot-content');
        
        let screenshotHtml = '<h3>Screenshots for: ' + (d.title || 'Untitled') + '</h3>';
        
        if (d.screenshots.regular) {
            screenshotHtml += '<h4>Regular Screenshot:</h4>';
            screenshotHtml += `<img src="${d.screenshots.regular}" alt="Regular Screenshot" style="max-width: 100%; margin-bottom: 20px;">`;
        }
        
        if (d.screenshots.stats) {
            screenshotHtml += '<h4>Stats Screenshot:</h4>';
            screenshotHtml += `<img src="${d.screenshots.stats.screenshot}" alt="Stats Screenshot" style="max-width: 100%;">`;
        }
        
        content.innerHTML = screenshotHtml;
        viewer.style.display = 'flex';
    }

    showTooltip(event, d) {
        this.tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        
        this.tooltip.html(`
            <strong>${d.title || 'Untitled'}</strong><br/>
            ${d.isStatsPage ? '📊 Stats Page' : d.isInteractive ? '🎯 Interactive' : '📄 Regular'}<br/>
            ${d.hasScreenshot ? '📸 Has Screenshot' : '📷 No Screenshot'}<br/>
            ${d.elements ? d.elements.length : 0} elements
        `)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px');
    }

    hideTooltip() {
        this.tooltip.transition()
            .duration(500)
            .style('opacity', 0);
    }

    highlightStatsPages() {
        if (!this.nodes) return;
        
        this.svg.selectAll('.nodes circle')
            .attr('stroke', d => d.isStatsPage ? '#ff6b6b' : '#333')
            .attr('stroke-width', d => d.isStatsPage ? 5 : 1);
    }

    applyCurrentFilter() {
        if (!this.nodes) return;

        this.filteredNodes = this.nodes.filter(node => {
            switch (this.currentFilter) {
                case 'stats':
                    return node.isStatsPage;
                case 'screenshots':
                    return node.hasScreenshot;
                case 'interactive':
                    return node.isInteractive;
                default:
                    return true;
            }
        });

        // Update filtered property
        this.nodes.forEach(node => {
            node.filtered = !this.filteredNodes.includes(node);
        });

        // Filter links to only include connections between visible nodes
        const visibleNodeIds = new Set(this.filteredNodes.map(n => n.id));
        this.filteredLinks = this.links.filter(link => 
            visibleNodeIds.has(link.from) && visibleNodeIds.has(link.to)
        );
    }

    updateStats() {
        if (!this.graph) return;

        const stats = {
            totalNodes: this.graph.nodes.length,
            totalEdges: this.graph.edges ? this.graph.edges.length : 0,
            statsPages: this.graph.nodes.filter(n => this.isStatsPage(n.url)).length,
            pagesWithScreenshots: this.graph.nodes.filter(n => n.screenshots).length,
            interactivePages: this.graph.nodes.filter(n => this.isInteractivePage(n)).length,
            totalElements: this.graph.nodes.reduce((sum, n) => sum + (n.elements ? n.elements.length : 0), 0)
        };

        document.getElementById('total-nodes').textContent = stats.totalNodes;
        document.getElementById('total-edges').textContent = stats.totalEdges;
        document.getElementById('stats-pages').textContent = stats.statsPages;
        document.getElementById('screenshots').textContent = stats.pagesWithScreenshots;
        document.getElementById('interactive-elements').textContent = stats.interactivePages;
        
        const coverage = stats.totalElements > 0 ? Math.round((stats.pagesWithScreenshots / stats.totalNodes) * 100) : 0;
        document.getElementById('coverage').textContent = coverage + '%';
    }

    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    resetView() {
        if (this.simulation) {
            this.simulation.alpha(0.3).restart();
        }
        if (this.zoom) {
            this.svg.transition().duration(750).call(
                this.zoom.transform,
                d3.zoomIdentity
            );
        }
    }

    toggleLayout() {
        this.currentLayout = this.currentLayout === 'force' ? 'hierarchical' : 'force';
        this.renderGraph();
    }

    updateNodeSize(size) {
        this.nodeSize = parseInt(size);
        if (this.svg) {
            this.svg.selectAll('.nodes circle')
                .attr('r', d => this.getNodeRadius(d));
        }
    }

    updateLinkDistance(distance) {
        this.linkDistance = parseInt(distance);
        if (this.simulation) {
            this.simulation.force('link').distance(this.linkDistance);
            this.simulation.alpha(0.3).restart();
        }
    }

    updateChargeStrength(strength) {
        this.chargeStrength = parseInt(strength);
        if (this.simulation) {
            this.simulation.force('charge').strength(this.chargeStrength);
            this.simulation.alpha(0.3).restart();
        }
    }

    applyFilter(filterType) {
        this.currentFilter = filterType;
        this.applyCurrentFilter();
        this.renderGraph();
    }

    showLegend() {
        const legend = document.getElementById('legend');
        legend.style.display = 'block';
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'flex' : 'none';
    }

    updateStatus(message) {
        const status = document.getElementById('status');
        status.textContent = message;
    }

    resizeGraph() {
        if (!this.svg) return;
        
        const container = d3.select('#graph-container');
        const width = container.node().clientWidth;
        const height = container.node().clientHeight;
        
        this.svg
            .attr('width', width)
            .attr('height', height);
        
        if (this.simulation) {
            this.simulation.force('center', d3.forceCenter(width / 2, height / 2));
            this.simulation.alpha(0.3).restart();
        }
    }

    exportGraph() {
        if (!this.graph) {
            alert('No graph to export');
            return;
        }

        const dataStr = JSON.stringify(this.graph, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `ui-crawler-graph-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.updateStatus('Graph exported successfully');
    }

    resetGraph() {
        if (confirm('Are you sure you want to reset the graph? This will clear all data.')) {
            this.graph = null;
            this.nodes = null;
            this.links = null;
            this.filteredNodes = null;
            this.filteredLinks = null;
            
            const container = d3.select('#graph-container');
            container.selectAll('*').remove();
            
            localStorage.removeItem('ui-crawler-graph');
            this.updateStats();
            this.updateStatus('Graph reset');
        }
    }
}

// Initialize visualizer
const visualizer = new GraphVisualizer();

// Auto-load graph on page load
document.addEventListener('DOMContentLoaded', () => {
    visualizer.loadGraphFromStorage();
});
