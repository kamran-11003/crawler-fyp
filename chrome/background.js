chrome.runtime.onInstalled.addListener(() => {
	console.log('[bg] service worker installed');
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	console.log('[bg] onMessage', msg?.type);
	
	if (msg?.type === 'downloadGraph' && msg?.payload) {
		try {
			const text = JSON.stringify(msg.payload, null, 2);
			console.log('[bg] preparing blob length', text.length);
			
			// Create filename with timestamp
			const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
			const filename = `ui-crawler-graph-${timestamp}.json`;
			
			const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(text);
			chrome.downloads.download({ 
				url: dataUrl, 
				filename: filename, 
				saveAs: true 
			}, (downloadId) => {
				const err = chrome.runtime.lastError;
				console.log('[bg] downloads.download id', downloadId, 'err', err?.message);
				sendResponse({ ok: !err, downloadId, error: err?.message });
			});
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] downloadGraph error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
	
	if (msg?.type === 'downloadScreenshots' && msg?.payload) {
		try {
			const { screenshots, baseFilename } = msg.payload;
			let downloadCount = 0;
			const totalScreenshots = screenshots.length;
			const downloadPromises = [];
			
			screenshots.forEach((screenshot, index) => {
				const filename = `${baseFilename}-screenshot-${index + 1}.png`;
				const downloadPromise = new Promise((resolve, reject) => {
					chrome.downloads.download({
						url: screenshot.dataUrl,
						filename: filename,
						saveAs: false
					}, (downloadId) => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError);
						} else {
							resolve(downloadId);
						}
					});
				});
				downloadPromises.push(downloadPromise);
			});
			
			Promise.all(downloadPromises)
				.then(() => {
					sendResponse({ ok: true, downloaded: totalScreenshots });
				})
				.catch((error) => {
					console.error('[bg] downloadScreenshots error', error);
					sendResponse({ ok: false, error: error.message });
				});
			
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] downloadScreenshots error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
	
	if (msg?.type === 'captureScreenshot' && msg?.payload) {
		try {
			const { tabId, options = {} } = msg.payload;
			
			chrome.tabs.captureVisibleTab(undefined, {
				format: options.format || 'png',
				quality: options.quality || 90
			}, (dataUrl) => {
				if (chrome.runtime.lastError) {
					sendResponse({ ok: false, error: chrome.runtime.lastError.message });
				} else {
					sendResponse({ ok: true, dataUrl: dataUrl });
				}
			});
			
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] captureScreenshot error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
	
	if (msg?.type === 'detectStatsPage' && msg?.payload) {
		try {
			const { tabId } = msg.payload;
			
			chrome.scripting.executeScript({
				target: { tabId: tabId },
				func: () => {
					const url = location.href.toLowerCase();
					const title = document.title.toLowerCase();
					const statsKeywords = ['stats', 'analytics', 'dashboard', 'metrics', 'reports', 'insights'];
					
					const urlMatch = statsKeywords.some(keyword => url.includes(keyword));
					const titleMatch = statsKeywords.some(keyword => title.includes(keyword));
					
					// Check for common stats page elements
					const hasCharts = document.querySelectorAll('canvas, svg, [data-chart], .chart, .graph').length > 0;
					const hasMetrics = document.querySelectorAll('[data-metric], .metric, .kpi, .stat').length > 0;
					
					return {
						isStatsPage: urlMatch || titleMatch || hasCharts || hasMetrics,
						confidence: (urlMatch ? 0.3 : 0) + (titleMatch ? 0.2 : 0) + (hasCharts ? 0.3 : 0) + (hasMetrics ? 0.2 : 0),
						indicators: { urlMatch, titleMatch, hasCharts, hasMetrics }
					};
				}
			}, (results) => {
				if (chrome.runtime.lastError) {
					sendResponse({ ok: false, error: chrome.runtime.lastError.message });
				} else {
					sendResponse({ ok: true, result: results[0].result });
				}
			});
			
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] detectStatsPage error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
	
	if (msg?.type === 'storeGraph' && msg?.payload) {
		try {
			const { graph } = msg.payload;
			chrome.storage.local.set({ 'ui-crawler-graph': graph }, () => {
				if (chrome.runtime.lastError) {
					sendResponse({ ok: false, error: chrome.runtime.lastError.message });
				} else {
					sendResponse({ ok: true });
				}
			});
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] storeGraph error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
	
	if (msg?.type === 'getGraph' && msg?.payload) {
		try {
			chrome.storage.local.get(['ui-crawler-graph'], (result) => {
				if (chrome.runtime.lastError) {
					sendResponse({ ok: false, error: chrome.runtime.lastError.message });
				} else {
					sendResponse({ ok: true, graph: result['ui-crawler-graph'] });
				}
			});
			return true; // keep sendResponse async
		} catch (e) {
			console.error('[bg] getGraph error', e);
			sendResponse({ ok: false, error: String(e) });
		}
	}
});

chrome.downloads.onChanged.addListener((delta) => {
	console.log('[bg] download changed', delta);
});

// Handle tab updates for automatic stats page detection
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.status === 'complete' && tab.url) {
		// Check if this is a stats page and notify content script
		const url = tab.url.toLowerCase();
		const statsKeywords = ['stats', 'analytics', 'dashboard', 'metrics', 'reports'];
		const isStatsPage = statsKeywords.some(keyword => url.includes(keyword));
		
		if (isStatsPage) {
			chrome.tabs.sendMessage(tabId, {
				type: 'statsPageDetected',
				url: tab.url
			}).catch(() => {
				// Content script might not be ready yet, ignore error
			});
		}
	}
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
	// Open the graph visualizer
	chrome.tabs.create({
		url: chrome.runtime.getURL('visualization/graph-viewer.html')
	});
});


