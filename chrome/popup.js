// Enhanced UI Crawler Popup with comprehensive features
class UICrawlerPopup {
	constructor() {
		this.currentTab = null;
		this.settings = this.loadSettings();
		this.init();
	}

	async init() {
		await this.loadCurrentTab();
		this.setupEventListeners();
		this.updateStats();
		this.loadSettings();
	}

	async loadCurrentTab() {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		this.currentTab = tab;
	}

	loadSettings() {
		const defaultSettings = {
			enhancedDetection: true,
			accessibilityScan: true,
			shadowDomSupport: true,
			timeout: 5000,
			batchSize: 5,
			captureScreenshots: true,
			detectStatsPages: true,
			fullPageScreenshots: false
		};

		// Load from storage or use defaults
		const stored = localStorage.getItem('ui-crawler-settings');
		return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
	}

	saveSettings() {
		localStorage.setItem('ui-crawler-settings', JSON.stringify(this.settings));
	}

	setupEventListeners() {
		// Tab switching (no inline handlers)
		document.querySelectorAll('.tab').forEach(tab => {
			tab.addEventListener('click', (e) => {
				const tabName = e.currentTarget.getAttribute('data-tab');
				if (!tabName) return;
				this.switchTab(tabName);
			});
		});

		// Basic crawling
		document.getElementById('extract').addEventListener('click', () => this.extractCurrentPage());
		document.getElementById('crawl').addEventListener('click', () => this.crawlMultiplePages());

		// Visualization
		document.getElementById('openVisualizer').addEventListener('click', () => this.openVisualizer());
		document.getElementById('loadGraph').addEventListener('click', () => this.loadGraphData());
		document.getElementById('downloadGraph').addEventListener('click', () => this.downloadGraph());
		document.getElementById('downloadScreenshots').addEventListener('click', () => this.downloadScreenshots());

		// Settings
		document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
		document.getElementById('clearData').addEventListener('click', () => this.clearAllData());

		// Settings checkboxes
		document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				this.settings[e.target.id] = e.target.checked;
				this.saveSettings();
			});
		});

		// Settings inputs
		document.querySelectorAll('input[type="number"]').forEach(input => {
			input.addEventListener('change', (e) => {
				this.settings[e.target.id] = parseInt(e.target.value);
				this.saveSettings();
			});
		});
	}

	switchTab(tabName) {
		// Update tab buttons
		document.querySelectorAll('.tab').forEach(tab => {
			tab.classList.remove('active');
		});
		document.querySelector(`.tab:nth-child(${['crawl', 'visualize', 'settings'].indexOf(tabName) + 1})`).classList.add('active');

		// Update tab content
		document.querySelectorAll('.tab-content').forEach(content => {
			content.classList.remove('active');
		});
		document.getElementById(`${tabName}-tab`).classList.add('active');

		// Update stats if switching to visualize tab
		if (tabName === 'visualize') {
			this.updateStats();
		}
	}

	async hash(text) {
	const enc = new TextEncoder().encode(text);
	const buf = await crypto.subtle.digest('SHA-1', enc);
	const bytes = Array.from(new Uint8Array(buf));
	return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

	async captureStateWithScreenshots(tabId) {
		// Guard restricted schemes
		try {
			const tab = await chrome.tabs.get(tabId);
			if (!tab?.url || /^(chrome|edge|about|chrome-extension):/i.test(tab.url)) {
				return null;
			}
			// If file:// and access not enabled, bail gracefully
			if (tab.url.startsWith('file://')) {
				// Content scripts require user toggle; return null to show guidance
			}
		} catch (_) {}

		// Ensure the page is fully loaded
		await new Promise((resolve) => {
			let attempts = 0;
			const check = async () => {
				try {
					const t = await chrome.tabs.get(tabId);
					if (t.status === 'complete') return resolve();
				} catch (_) {}
				if (attempts++ > 50) return resolve();
				setTimeout(check, 100);
			};
			check();
		});

		// Try enhanced content collector first
		let exec = await chrome.scripting.executeScript({
			target: { tabId },
			func: () => (typeof window.__UICRAWLER_COLLECT_ENHANCED__ === 'function' ? window.__UICRAWLER_COLLECT_ENHANCED__() : null)
		});
		let result = exec && exec[0] ? exec[0].result : null;

		// Fallback to basic collector
		if (!result) {
			exec = await chrome.scripting.executeScript({
		target: { tabId },
		func: () => (typeof window.__UICRAWLER_COLLECT__ === 'function' ? window.__UICRAWLER_COLLECT__() : null)
	});
			result = exec && exec[0] ? exec[0].result : null;
		}

		// If still no collector, inject content.js then retry once
	if (!result) {
			try {
				await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
				// retry enhanced
				exec = await chrome.scripting.executeScript({
			target: { tabId },
					func: () => (typeof window.__UICRAWLER_COLLECT_ENHANCED__ === 'function' ? window.__UICRAWLER_COLLECT_ENHANCED__() : null)
				});
				result = exec && exec[0] ? exec[0].result : null;
				if (!result) {
					exec = await chrome.scripting.executeScript({
						target: { tabId },
						func: () => (typeof window.__UICRAWLER_COLLECT__ === 'function' ? window.__UICRAWLER_COLLECT__() : null)
					});
					result = exec && exec[0] ? exec[0].result : null;
				}
			} catch (_) {}
		}

	if (!result) return null;

		const domHash = await this.hash(result.dom || '');
		const node = {
			id: (await this.hash(result.url + domHash)).slice(0, 12),
		url: result.url,
		title: result.title || '',
		timestamp: result.timestamp || Date.now(),
		dom_hash: domHash,
		elements: Array.isArray(result.elements) ? result.elements : [],
			state_vector: result.stateVector || {
			visible_elements: result.elements.filter(e => e.visible).length,
			inputs: result.elements.filter(e => e.nodeType === 'input').length,
			links: result.elements.filter(e => e.nodeType === 'a').length,
			buttons: result.elements.filter(e => e.nodeType === 'button').length
			},
			metadata: result.metadata || {}
		};

		// Capture screenshots if enabled
		if (this.settings.captureScreenshots) {
			try {
				// Guard: only capture if permission and tab window available
				const screenshot = await chrome.tabs.captureVisibleTab(this.currentTab?.windowId, { 
					format: 'png',
					quality: 90
				});
				
				node.screenshots = {
					regular: screenshot
				};

				// Check for stats page if enabled
				if (this.settings.detectStatsPages) {
					const statsDetection = await this.detectStatsPage(tabId);
					if (statsDetection.isStatsPage) {
						node.screenshots.stats = {
							type: 'stats',
							screenshot: screenshot,
							timestamp: Date.now(),
							url: result.url,
							confidence: statsDetection.confidence
						};
					}
				}

				// Full page screenshot if enabled
				if (this.settings.fullPageScreenshots) {
					const fullPageScreenshot = await this.captureFullPageScreenshot(tabId);
					if (fullPageScreenshot) {
						node.screenshots.fullPage = fullPageScreenshot;
					}
				}
			} catch (error) {
				console.warn('Screenshot capture failed:', error);
				// Do not fail the whole node on capture failure
			}
		}

		return node;
	}

	async detectStatsPage(tabId) {
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({ 
				type: 'detectStatsPage', 
				payload: { tabId } 
			}, (response) => {
				if (response && response.ok) {
					resolve(response.result);
				} else {
					resolve({ isStatsPage: false, confidence: 0, indicators: {} });
				}
			});
		});
	}

	async captureFullPageScreenshot(tabId) {
		// This would require more complex implementation
		// For now, return null
		return null;
	}

	async addState() {
		if (!this.currentTab?.id) return;
		
		this.setStatus('Capturing state...', true);
		
		try {
			const node = await this.captureStateWithScreenshots(this.currentTab.id);
	if (!node) {
		throw new Error('No data captured. If using file:// pages, enable "Allow access to file URLs" for this extension and reload the page, then try again.');
	}

			const { graph = { nodes: [], edges: [] } } = await chrome.storage.local.get(['graph']);
			if (!graph.nodes.find(n => n.id === node.id)) {
				graph.nodes.push(node);
			}
			
			await chrome.storage.local.set({ graph });
			await chrome.runtime.sendMessage({ type: 'storeGraph', payload: { graph } });
			
			this.setStatus('State captured successfully!');
			this.updateStats();
		} catch (error) {
			this.setStatus(`Error: ${String(error)}`);
			console.error('[popup] addState error', error);
		}
	}

	async extractCurrentPage() {
		await this.addState();
	}

	async crawlMultiplePages() {
		if (!this.currentTab?.id || !this.currentTab.url) {
			this.setStatus('No active tab');
			return;
		}

		const maxPages = Math.max(1, parseInt(document.getElementById('maxPages').value || '10', 10));
		const maxDepth = Math.max(1, parseInt(document.getElementById('maxDepth').value || '3', 10));
		const sameOriginOnly = document.getElementById('sameOriginOnly').checked;

		this.setStatus('Starting crawl...', true);
		this.showProgress(true);

		try {
			const startOrigin = new URL(this.currentTab.url).origin;
			const visited = new Set();
			const queue = [{ url: this.currentTab.url, depth: 0 }];
	const { graph = { nodes: [], edges: [] } } = await chrome.storage.local.get(['graph']);

			let processed = 0;
			const total = Math.min(maxPages, queue.length);

			while (queue.length && visited.size < maxPages) {
				const current = queue.shift();
				if (!current) break;
				if (visited.has(current.url)) continue;
				if (sameOriginOnly && new URL(current.url).origin !== startOrigin) continue;
				
				visited.add(current.url);
				processed++;

				// Update progress
				this.updateProgress((processed / total) * 100);

				await chrome.tabs.update(this.currentTab.id, { url: current.url });
				await new Promise(r => setTimeout(r, 1000)); // Wait for page load

				const node = await this.captureStateWithScreenshots(this.currentTab.id);
				if (!node) continue;

				const prevNode = graph.nodes.find(n => n.url === current.parentUrl);
	if (!graph.nodes.find(n => n.id === node.id)) graph.nodes.push(node);
				
				if (current.parent && prevNode) {
					graph.edges.push({
						from: prevNode.id,
						to: node.id,
						action: { type: 'nav', selector: 'a[href]', node_type: 'a', text: current.anchorText || '' },
						pre_url: current.parentUrl,
						post_url: current.url,
						timestamp: Date.now()
					});
				}

	await chrome.storage.local.set({ graph });

				// Get links for next level
				if (current.depth + 1 <= maxDepth) {
					const links = await this.getLinks(this.currentTab.id);
					for (const href of links) {
						const nextUrl = this.normalizeUrl(current.url, href);
						if (!nextUrl) continue;
						if (sameOriginOnly && new URL(nextUrl).origin !== startOrigin) continue;
						if (visited.has(nextUrl)) continue;
						
						queue.push({ 
							url: nextUrl, 
							depth: current.depth + 1, 
							parent: true, 
							parentUrl: current.url 
						});
						
						if (visited.size + queue.length >= maxPages) break;
					}
				}
			}

			await chrome.runtime.sendMessage({ type: 'storeGraph', payload: { graph } });
			this.setStatus(`Crawl completed! ${graph.nodes.length} pages, ${graph.edges.length} connections`);
			this.updateStats();
		} catch (error) {
			this.setStatus(`Crawl error: ${String(error)}`);
			console.error('[popup] crawl error', error);
		} finally {
			this.showProgress(false);
		}
	}

	async getLinks(tabId) {
		const [{ result }] = await chrome.scripting.executeScript({
			target: { tabId },
			func: () => (typeof window.__UICRAWLER_LINKS__ === 'function' ? window.__UICRAWLER_LINKS__() : [])
		});
		return Array.isArray(result) ? result : [];
	}

	normalizeUrl(base, href) {
		try {
			return new URL(href, base).toString();
		} catch { 
			return null; 
		}
	}

	async downloadGraph() {
	const { graph = { nodes: [], edges: [] } } = await chrome.storage.local.get(['graph']);
	return new Promise((resolve) => {
		chrome.runtime.sendMessage({ type: 'downloadGraph', payload: graph }, (res) => {
			const err = chrome.runtime.lastError;
			if (err) {
				console.error('[popup] download error', err.message);
				resolve({ ok: false, error: err.message });
				return;
			}
			resolve(res || { ok: true });
		});
	});
}

	async downloadScreenshots() {
		const { graph = { nodes: [], edges: [] } } = await chrome.storage.local.get(['graph']);
		const screenshots = [];
		
		graph.nodes.forEach(node => {
			if (node.screenshots) {
				if (node.screenshots.regular) {
					screenshots.push({
						dataUrl: node.screenshots.regular,
						filename: `screenshot-${node.id}-regular.png`
					});
				}
				if (node.screenshots.stats) {
					screenshots.push({
						dataUrl: node.screenshots.stats.screenshot,
						filename: `screenshot-${node.id}-stats.png`
					});
				}
			}
		});
		
		if (screenshots.length === 0) {
			this.setStatus('No screenshots found in graph');
			return;
		}
		
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
		const baseFilename = `ui-crawler-screenshots-${timestamp}`;
		
		return new Promise((resolve) => {
			chrome.runtime.sendMessage({ 
				type: 'downloadScreenshots', 
				payload: { screenshots, baseFilename } 
			}, (res) => {
				const err = chrome.runtime.lastError;
				if (err) {
					console.error('[popup] downloadScreenshots error', err.message);
					resolve({ ok: false, error: err.message });
					return;
				}
				resolve(res || { ok: true });
			});
		});
	}

	openVisualizer() {
		chrome.tabs.create({
			url: chrome.runtime.getURL('visualization/graph-viewer.html')
		});
	}

	async loadGraphData() {
		this.setStatus('Loading graph data...');
		// Implementation for loading graph data
		this.setStatus('Graph data loaded');
	}

	async updateStats() {
		try {
	const { graph = { nodes: [], edges: [] } } = await chrome.storage.local.get(['graph']);

			const stats = {
				totalNodes: graph.nodes.length,
				totalEdges: graph.edges ? graph.edges.length : 0,
				statsPages: graph.nodes.filter(n => this.isStatsPage(n.url)).length,
				pagesWithScreenshots: graph.nodes.filter(n => n.screenshots).length
			};

			document.getElementById('current-nodes').textContent = stats.totalNodes;
			document.getElementById('current-edges').textContent = stats.totalEdges;
			document.getElementById('current-screenshots').textContent = stats.pagesWithScreenshots;
			document.getElementById('current-stats-pages').textContent = stats.statsPages;
		} catch (error) {
			console.error('Error updating stats:', error);
		}
	}

	isStatsPage(url) {
		if (!url) return false;
		const statsKeywords = ['stats', 'analytics', 'dashboard', 'metrics', 'reports'];
		return statsKeywords.some(keyword => url.toLowerCase().includes(keyword));
	}

	resetSettings() {
		if (confirm('Are you sure you want to reset all settings to defaults?')) {
			this.settings = this.loadSettings();
			this.saveSettings();
			location.reload();
		}
	}

	async clearAllData() {
		if (confirm('Are you sure you want to clear all graph data? This cannot be undone.')) {
			await chrome.storage.local.set({ graph: { nodes: [], edges: [] } });
			await chrome.runtime.sendMessage({ type: 'storeGraph', payload: { graph: { nodes: [], edges: [] } } });
			this.updateStats();
			this.setStatus('All data cleared');
		}
	}

	setStatus(message, loading = false) {
		const statusEl = document.getElementById('status');
		if (!statusEl) return;
		
		statusEl.textContent = message;
		statusEl.style.display = 'block';
		
		if (loading) {
			statusEl.innerHTML = `<div class="loading"><div class="spinner"></div>${message}</div>`;
		}
		
		// Auto-hide after 5 seconds unless it's an error
		if (!message.includes('Error') && !message.includes('error')) {
			setTimeout(() => {
				statusEl.style.display = 'none';
			}, 5000);
		}
	}

	showProgress(show) {
		const progressEl = document.getElementById('progress');
		if (progressEl) {
			progressEl.classList.toggle('hidden', !show);
		}
	}

	updateProgress(percentage) {
		const progressFill = document.querySelector('.progress-fill');
		if (progressFill) {
			progressFill.style.width = `${Math.min(percentage, 100)}%`;
		}
	}
}

// Global functions for HTML
function switchTab(tabName) {
	popup.switchTab(tabName);
}

// Initialize popup
const popup = new UICrawlerPopup();

// Expose for external access
window.__UICRAWLER__ = popup;


