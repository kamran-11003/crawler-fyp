/**
 * ScreenshotManager class for comprehensive screenshot capture
 * Includes stats page detection and enhanced screenshot capabilities
 */

export class ScreenshotManager {
  constructor() {
    this.statsKeywords = [
      'stats', 'analytics', 'dashboard', 'metrics', 'reports', 'insights',
      'monitoring', 'tracking', 'performance', 'usage', 'data', 'chart',
      'graph', 'visualization', 'kpi', 'measurement', 'statistics'
    ];
    
    this.screenshotOptions = {
      format: 'png',
      quality: 90,
      fullPage: false
    };
  }

  /**
   * Capture a regular screenshot of the current viewport
   */
  async captureViewportScreenshot() {
    try {
      const screenshot = await chrome.tabs.captureVisibleTab(undefined, {
        format: this.screenshotOptions.format,
        quality: this.screenshotOptions.quality
      });
      
      return {
        type: 'viewport',
        dataUrl: screenshot,
        timestamp: Date.now(),
        dimensions: await this.getViewportDimensions()
      };
    } catch (error) {
      console.error('Error capturing viewport screenshot:', error);
      throw error;
    }
  }

  /**
   * Capture a full page screenshot by scrolling
   */
  async captureFullPageScreenshot() {
    return new Promise(async (resolve, reject) => {
      try {
        const originalScrollY = window.scrollY;
        const originalScrollX = window.scrollX;
        
        // Get page dimensions
        const pageHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        const pageWidth = Math.max(
          document.body.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.clientWidth,
          document.documentElement.scrollWidth,
          document.documentElement.offsetWidth
        );
        
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate number of screenshots needed
        const screenshotsNeeded = Math.ceil(pageHeight / viewportHeight);
        const screenshots = [];
        
        // Capture screenshots by scrolling
        for (let i = 0; i < screenshotsNeeded; i++) {
          const scrollY = i * viewportHeight;
          window.scrollTo(0, scrollY);
          
          // Wait for scroll to complete
          await this.waitForScroll();
          
          // Capture screenshot
          const screenshot = await chrome.tabs.captureVisibleTab(undefined, {
            format: this.screenshotOptions.format,
            quality: this.screenshotOptions.quality
          });
          
          screenshots.push({
            dataUrl: screenshot,
            scrollY: scrollY,
            index: i
          });
        }
        
        // Restore original scroll position
        window.scrollTo(originalScrollX, originalScrollY);
        
        resolve({
          type: 'fullpage',
          screenshots: screenshots,
          dimensions: { width: pageWidth, height: pageHeight },
          timestamp: Date.now()
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Detect if current page is a stats/analytics page
   */
  detectStatsPage() {
    const url = location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const bodyText = document.body.textContent.toLowerCase();
    
    // Check URL for stats keywords
    const urlMatch = this.statsKeywords.some(keyword => url.includes(keyword));
    
    // Check title for stats keywords
    const titleMatch = this.statsKeywords.some(keyword => title.includes(keyword));
    
    // Check body content for stats indicators
    const contentMatch = this.statsKeywords.some(keyword => bodyText.includes(keyword));
    
    // Check for common stats page elements
    const hasCharts = document.querySelectorAll('canvas, svg, [data-chart], .chart, .graph').length > 0;
    const hasMetrics = document.querySelectorAll('[data-metric], .metric, .kpi, .stat').length > 0;
    const hasTables = document.querySelectorAll('table, .table, [data-table]').length > 0;
    
    // Check for common analytics libraries
    const hasAnalyticsLibs = this.detectAnalyticsLibraries();
    
    return {
      isStatsPage: urlMatch || titleMatch || contentMatch || hasCharts || hasMetrics || hasTables || hasAnalyticsLibs,
      confidence: this.calculateStatsConfidence(urlMatch, titleMatch, contentMatch, hasCharts, hasMetrics, hasTables, hasAnalyticsLibs),
      indicators: {
        urlMatch,
        titleMatch,
        contentMatch,
        hasCharts,
        hasMetrics,
        hasTables,
        hasAnalyticsLibs
      }
    };
  }

  /**
   * Detect common analytics libraries
   */
  detectAnalyticsLibraries() {
    const analyticsLibs = [
      'google-analytics',
      'gtag',
      'ga',
      'mixpanel',
      'amplitude',
      'segment',
      'hotjar',
      'fullstory',
      'logrocket',
      'sentry',
      'datadog',
      'newrelic',
      'chart.js',
      'd3',
      'highcharts',
      'plotly',
      'echarts'
    ];
    
    // Check for script tags
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const hasAnalyticsScript = scripts.some(script => {
      const src = script.src.toLowerCase();
      return analyticsLibs.some(lib => src.includes(lib));
    });
    
    // Check for global variables
    const hasAnalyticsGlobal = analyticsLibs.some(lib => {
      return window[lib] || window[lib.toUpperCase()] || window[lib.replace('-', '')];
    });
    
    // Check for data attributes
    const hasAnalyticsData = document.querySelectorAll('[data-analytics], [data-tracking], [data-metrics]').length > 0;
    
    return hasAnalyticsScript || hasAnalyticsGlobal || hasAnalyticsData;
  }

  /**
   * Calculate confidence score for stats page detection
   */
  calculateStatsConfidence(urlMatch, titleMatch, contentMatch, hasCharts, hasMetrics, hasTables, hasAnalyticsLibs) {
    let score = 0;
    
    if (urlMatch) score += 0.3;
    if (titleMatch) score += 0.2;
    if (contentMatch) score += 0.1;
    if (hasCharts) score += 0.2;
    if (hasMetrics) score += 0.15;
    if (hasTables) score += 0.05;
    if (hasAnalyticsLibs) score += 0.1;
    
    return Math.min(score, 1);
  }

  /**
   * Capture enhanced screenshot with stats page detection
   */
  async captureEnhancedScreenshot() {
    const statsDetection = this.detectStatsPage();
    
    // Always capture viewport screenshot
    const viewportScreenshot = await this.captureViewportScreenshot();
    
    const result = {
      viewport: viewportScreenshot,
      statsDetection: statsDetection,
      timestamp: Date.now(),
      url: location.href,
      title: document.title
    };
    
    // If it's a stats page, also capture full page screenshot
    if (statsDetection.isStatsPage && statsDetection.confidence > 0.5) {
      try {
        const fullPageScreenshot = await this.captureFullPageScreenshot();
        result.fullPage = fullPageScreenshot;
      } catch (error) {
        console.warn('Failed to capture full page screenshot:', error);
      }
    }
    
    return result;
  }

  /**
   * Capture screenshot with specific options
   */
  async captureScreenshot(options = {}) {
    const mergedOptions = { ...this.screenshotOptions, ...options };
    
    try {
      const screenshot = await chrome.tabs.captureVisibleTab(undefined, {
        format: mergedOptions.format,
        quality: mergedOptions.quality
      });
      
      return {
        dataUrl: screenshot,
        timestamp: Date.now(),
        options: mergedOptions
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      throw error;
    }
  }

  /**
   * Capture screenshot of specific element
   */
  async captureElementScreenshot(element) {
    try {
      const rect = element.getBoundingClientRect();
      const viewportScreenshot = await chrome.tabs.captureVisibleTab(undefined, {
        format: this.screenshotOptions.format,
        quality: this.screenshotOptions.quality
      });
      
      // Create canvas to crop the element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(
          img,
          rect.left, rect.top, rect.width, rect.height,
          0, 0, rect.width, rect.height
        );
      };
      img.src = viewportScreenshot;
      
      return {
        dataUrl: canvas.toDataURL(),
        dimensions: { width: rect.width, height: rect.height },
        element: {
          tagName: element.tagName,
          id: element.id,
          className: element.className
        },
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error capturing element screenshot:', error);
      throw error;
    }
  }

  /**
   * Get viewport dimensions
   */
  async getViewportDimensions() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    };
  }

  /**
   * Wait for scroll to complete
   */
  async waitForScroll() {
    return new Promise(resolve => {
      let timeoutId;
      let animationFrameId;
      
      const checkScroll = () => {
        if (window.scrollY === window.scrollY) {
          clearTimeout(timeoutId);
          cancelAnimationFrame(animationFrameId);
          resolve();
        } else {
          animationFrameId = requestAnimationFrame(checkScroll);
        }
      };
      
      timeoutId = setTimeout(() => {
        cancelAnimationFrame(animationFrameId);
        resolve();
      }, 1000);
      
      checkScroll();
    });
  }

  /**
   * Capture screenshot with annotations
   */
  async captureAnnotatedScreenshot(annotations = []) {
    const screenshot = await this.captureViewportScreenshot();
    
    return {
      ...screenshot,
      annotations: annotations.map(annotation => ({
        ...annotation,
        timestamp: Date.now()
      }))
    };
  }

  /**
   * Capture screenshot with element highlights
   */
  async captureHighlightedScreenshot(elements) {
    // Add highlight styles to elements
    const originalStyles = new Map();
    
    elements.forEach(element => {
      originalStyles.set(element, {
        outline: element.style.outline,
        backgroundColor: element.style.backgroundColor
      });
      
      element.style.outline = '2px solid #ff0000';
      element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
    });
    
    // Wait a bit for styles to apply
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Capture screenshot
    const screenshot = await this.captureViewportScreenshot();
    
    // Restore original styles
    elements.forEach(element => {
      const originalStyle = originalStyles.get(element);
      if (originalStyle) {
        element.style.outline = originalStyle.outline;
        element.style.backgroundColor = originalStyle.backgroundColor;
      }
    });
    
    return {
      ...screenshot,
      highlightedElements: elements.map(el => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        boundingRect: el.getBoundingClientRect()
      }))
    };
  }

  /**
   * Batch capture screenshots for multiple elements
   */
  async captureBatchScreenshots(elements) {
    const screenshots = [];
    
    for (const element of elements) {
      try {
        const screenshot = await this.captureElementScreenshot(element);
        screenshots.push({
          element: {
            tagName: element.tagName,
            id: element.id,
            className: element.className
          },
          screenshot: screenshot
        });
      } catch (error) {
        console.warn('Failed to capture screenshot for element:', element, error);
      }
    }
    
    return screenshots;
  }

  /**
   * Get screenshot metadata
   */
  getScreenshotMetadata() {
    return {
      url: location.href,
      title: document.title,
      timestamp: Date.now(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      page: {
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      },
      userAgent: navigator.userAgent,
      language: navigator.language
    };
  }

  /**
   * Optimize screenshot for storage
   */
  optimizeScreenshot(dataUrl, maxSize = 1024 * 1024) { // 1MB default
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let { width, height } = img;
        
        // Calculate new dimensions to fit within maxSize
        const ratio = Math.sqrt(maxSize / (width * height));
        if (ratio < 1) {
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = dataUrl;
    });
  }
}
