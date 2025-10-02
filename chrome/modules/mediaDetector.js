/**
 * Media Detector for comprehensive media element detection and interaction
 * Implements video/audio interaction detection, third-party widget detection, and interactive chart handling
 */

export class MediaDetector {
    constructor() {
        this.mediaElements = {
            videos: [],
            audios: [],
            canvases: [],
            maps: [],
            widgets: [],
            charts: [],
            interactive: []
        };
        this.isMonitoring = false;
        this.mediaObservers = new Map();
    }

    /**
     * Start media monitoring
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.detectVideoElements();
        this.detectAudioElements();
        this.detectCanvasElements();
        this.detectMapElements();
        this.detectThirdPartyWidgets();
        this.detectInteractiveCharts();
        this.monitorMediaChanges();
    }

    /**
     * Stop media monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        this.mediaObservers.forEach(observer => observer.disconnect());
        this.mediaObservers.clear();
    }

    /**
     * Detect video elements
     */
    detectVideoElements() {
        const videos = [];
        const videoElements = document.querySelectorAll('video, [data-video], .video-player, [data-player]');
        
        videoElements.forEach(video => {
            const videoData = {
                element: video,
                src: video.src || video.currentSrc,
                poster: video.poster,
                controls: video.controls,
                autoplay: video.autoplay,
                loop: video.loop,
                muted: video.muted,
                volume: video.volume,
                duration: video.duration,
                currentTime: video.currentTime,
                paused: video.paused,
                ended: video.ended,
                readyState: video.readyState,
                networkState: video.networkState,
                width: video.videoWidth,
                height: video.videoHeight,
                aspectRatio: video.videoWidth / video.videoHeight,
                hasAudio: this.detectVideoAudio(video),
                hasSubtitles: this.detectVideoSubtitles(video),
                hasControls: this.detectVideoControls(video),
                isInteractive: this.isInteractiveVideo(video),
                timestamp: Date.now()
            };
            
            videos.push(videoData);
        });
        
        this.mediaElements.videos = videos;
        return videos;
    }

    /**
     * Detect video audio
     */
    detectVideoAudio(video) {
        const audioTracks = video.audioTracks;
        return audioTracks && audioTracks.length > 0;
    }

    /**
     * Detect video subtitles
     */
    detectVideoSubtitles(video) {
        const textTracks = video.textTracks;
        return textTracks && textTracks.length > 0;
    }

    /**
     * Detect video controls
     */
    detectVideoControls(video) {
        return video.controls || video.hasAttribute('controls');
    }

    /**
     * Check if video is interactive
     */
    isInteractiveVideo(video) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-video',
            '.clickable-video', '[data-hotspot]', '.video-hotspot'
        ];
        
        return interactiveSelectors.some(selector => video.matches(selector));
    }

    /**
     * Detect audio elements
     */
    detectAudioElements() {
        const audios = [];
        const audioElements = document.querySelectorAll('audio, [data-audio], .audio-player, [data-sound]');
        
        audioElements.forEach(audio => {
            const audioData = {
                element: audio,
                src: audio.src || audio.currentSrc,
                controls: audio.controls,
                autoplay: audio.autoplay,
                loop: audio.loop,
                muted: audio.muted,
                volume: audio.volume,
                duration: audio.duration,
                currentTime: audio.currentTime,
                paused: audio.paused,
                ended: audio.ended,
                readyState: audio.readyState,
                networkState: audio.networkState,
                hasControls: this.detectAudioControls(audio),
                isInteractive: this.isInteractiveAudio(audio),
                timestamp: Date.now()
            };
            
            audios.push(audioData);
        });
        
        this.mediaElements.audios = audios;
        return audios;
    }

    /**
     * Detect audio controls
     */
    detectAudioControls(audio) {
        return audio.controls || audio.hasAttribute('controls');
    }

    /**
     * Check if audio is interactive
     */
    isInteractiveAudio(audio) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-audio',
            '.clickable-audio', '[data-sound-effect]', '.sound-effect'
        ];
        
        return interactiveSelectors.some(selector => audio.matches(selector));
    }

    /**
     * Detect canvas elements
     */
    detectCanvasElements() {
        const canvases = [];
        const canvasElements = document.querySelectorAll('canvas, [data-canvas], .chart, .graph, [data-chart]');
        
        canvasElements.forEach(canvas => {
            const canvasData = {
                element: canvas,
                width: canvas.width,
                height: canvas.height,
                context: this.getCanvasContext(canvas),
                isInteractive: this.isInteractiveCanvas(canvas),
                hasAnimation: this.detectCanvasAnimation(canvas),
                hasInteraction: this.detectCanvasInteraction(canvas),
                timestamp: Date.now()
            };
            
            canvases.push(canvasData);
        });
        
        this.mediaElements.canvases = canvases;
        return canvases;
    }

    /**
     * Get canvas context
     */
    getCanvasContext(canvas) {
        try {
            const context = canvas.getContext('2d');
            return context ? '2d' : null;
        } catch (e) {
            try {
                const context = canvas.getContext('webgl');
                return context ? 'webgl' : null;
            } catch (e) {
                return null;
            }
        }
    }

    /**
     * Check if canvas is interactive
     */
    isInteractiveCanvas(canvas) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-canvas',
            '.clickable-canvas', '[data-chart]', '.chart', '.graph'
        ];
        
        return interactiveSelectors.some(selector => canvas.matches(selector));
    }

    /**
     * Detect canvas animation
     */
    detectCanvasAnimation(canvas) {
        // Check for animation-related attributes or classes
        const animationSelectors = [
            '[data-animate]', '.animate', '.animation', '[data-animation]',
            '.animated', '.moving', '.rotating', '.scaling'
        ];
        
        return animationSelectors.some(selector => canvas.matches(selector));
    }

    /**
     * Detect canvas interaction
     */
    detectCanvasInteraction(canvas) {
        // Check for interaction-related attributes or classes
        const interactionSelectors = [
            '[data-interactive]', '[data-clickable]', '[data-hover]',
            '[data-mouse]', '[data-touch]', '.interactive', '.clickable'
        ];
        
        return interactionSelectors.some(selector => canvas.matches(selector));
    }

    /**
     * Detect map elements
     */
    detectMapElements() {
        const maps = [];
        const mapElements = document.querySelectorAll('[data-map], .map, [data-location], .location, [data-coordinates]');
        
        mapElements.forEach(map => {
            const mapData = {
                element: map,
                type: this.getMapType(map),
                coordinates: this.getMapCoordinates(map),
                zoom: this.getMapZoom(map),
                markers: this.getMapMarkers(map),
                isInteractive: this.isInteractiveMap(map),
                hasControls: this.detectMapControls(map),
                timestamp: Date.now()
            };
            
            maps.push(mapData);
        });
        
        this.mediaElements.maps = maps;
        return maps;
    }

    /**
     * Get map type
     */
    getMapType(map) {
        const typeSelectors = [
            '[data-map-type]', '[data-map-provider]', '.map-type', '.map-provider'
        ];
        
        for (const selector of typeSelectors) {
            const typeElement = map.querySelector(selector);
            if (typeElement) {
                return typeElement.textContent.trim() || typeElement.getAttribute('data-map-type');
            }
        }
        
        // Check for common map providers
        if (map.classList.contains('google-map') || map.getAttribute('data-google-map')) {
            return 'google';
        } else if (map.classList.contains('leaflet-map') || map.getAttribute('data-leaflet')) {
            return 'leaflet';
        } else if (map.classList.contains('mapbox-map') || map.getAttribute('data-mapbox')) {
            return 'mapbox';
        }
        
        return 'unknown';
    }

    /**
     * Get map coordinates
     */
    getMapCoordinates(map) {
        const lat = map.getAttribute('data-lat') || map.getAttribute('data-latitude');
        const lng = map.getAttribute('data-lng') || map.getAttribute('data-longitude');
        
        if (lat && lng) {
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            };
        }
        
        return null;
    }

    /**
     * Get map zoom level
     */
    getMapZoom(map) {
        const zoom = map.getAttribute('data-zoom') || map.getAttribute('data-zoom-level');
        return zoom ? parseInt(zoom) : null;
    }

    /**
     * Get map markers
     */
    getMapMarkers(map) {
        const markers = [];
        const markerElements = map.querySelectorAll('.marker, [data-marker], .pin, [data-pin]');
        
        markerElements.forEach(marker => {
            const markerData = {
                element: marker,
                position: this.getMarkerPosition(marker),
                title: this.getMarkerTitle(marker),
                description: this.getMarkerDescription(marker)
            };
            markers.push(markerData);
        });
        
        return markers;
    }

    /**
     * Get marker position
     */
    getMarkerPosition(marker) {
        const lat = marker.getAttribute('data-lat') || marker.getAttribute('data-latitude');
        const lng = marker.getAttribute('data-lng') || marker.getAttribute('data-longitude');
        
        if (lat && lng) {
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng)
            };
        }
        
        return null;
    }

    /**
     * Get marker title
     */
    getMarkerTitle(marker) {
        const titleElement = marker.querySelector('.title, .marker-title, [data-title]');
        return titleElement ? titleElement.textContent.trim() : null;
    }

    /**
     * Get marker description
     */
    getMarkerDescription(marker) {
        const descElement = marker.querySelector('.description, .marker-description, [data-description]');
        return descElement ? descElement.textContent.trim() : null;
    }

    /**
     * Check if map is interactive
     */
    isInteractiveMap(map) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-map',
            '.clickable-map', '[data-zoomable]', '.zoomable'
        ];
        
        return interactiveSelectors.some(selector => map.matches(selector));
    }

    /**
     * Detect map controls
     */
    detectMapControls(map) {
        const controlSelectors = [
            '.map-controls', '.controls', '[data-controls]',
            '.zoom-controls', '.pan-controls', '.layer-controls'
        ];
        
        return controlSelectors.some(selector => map.querySelector(selector));
    }

    /**
     * Detect third-party widgets
     */
    detectThirdPartyWidgets() {
        const widgets = [];
        const widgetElements = document.querySelectorAll('[data-widget], .widget, [data-embed], .embed, [data-plugin], .plugin');
        
        widgetElements.forEach(widget => {
            const widgetData = {
                element: widget,
                type: this.getWidgetType(widget),
                provider: this.getWidgetProvider(widget),
                src: this.getWidgetSrc(widget),
                isInteractive: this.isInteractiveWidget(widget),
                hasControls: this.detectWidgetControls(widget),
                timestamp: Date.now()
            };
            
            widgets.push(widgetData);
        });
        
        this.mediaElements.widgets = widgets;
        return widgets;
    }

    /**
     * Get widget type
     */
    getWidgetType(widget) {
        const typeSelectors = [
            '[data-widget-type]', '[data-type]', '.widget-type', '.type'
        ];
        
        for (const selector of typeSelectors) {
            const typeElement = widget.querySelector(selector);
            if (typeElement) {
                return typeElement.textContent.trim() || typeElement.getAttribute('data-widget-type');
            }
        }
        
        // Check for common widget types
        if (widget.classList.contains('social-widget') || widget.getAttribute('data-social')) {
            return 'social';
        } else if (widget.classList.contains('payment-widget') || widget.getAttribute('data-payment')) {
            return 'payment';
        } else if (widget.classList.contains('chat-widget') || widget.getAttribute('data-chat')) {
            return 'chat';
        } else if (widget.classList.contains('analytics-widget') || widget.getAttribute('data-analytics')) {
            return 'analytics';
        }
        
        return 'unknown';
    }

    /**
     * Get widget provider
     */
    getWidgetProvider(widget) {
        const providerSelectors = [
            '[data-provider]', '[data-widget-provider]', '.provider', '.widget-provider'
        ];
        
        for (const selector of providerSelectors) {
            const providerElement = widget.querySelector(selector);
            if (providerElement) {
                return providerElement.textContent.trim() || providerElement.getAttribute('data-provider');
            }
        }
        
        // Check for common providers
        if (widget.classList.contains('facebook-widget') || widget.getAttribute('data-facebook')) {
            return 'facebook';
        } else if (widget.classList.contains('twitter-widget') || widget.getAttribute('data-twitter')) {
            return 'twitter';
        } else if (widget.classList.contains('youtube-widget') || widget.getAttribute('data-youtube')) {
            return 'youtube';
        } else if (widget.classList.contains('instagram-widget') || widget.getAttribute('data-instagram')) {
            return 'instagram';
        }
        
        return 'unknown';
    }

    /**
     * Get widget source
     */
    getWidgetSrc(widget) {
        return widget.src || widget.getAttribute('data-src') || widget.getAttribute('data-url');
    }

    /**
     * Check if widget is interactive
     */
    isInteractiveWidget(widget) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-widget',
            '.clickable-widget', '[data-hover]', '.hover-widget'
        ];
        
        return interactiveSelectors.some(selector => widget.matches(selector));
    }

    /**
     * Detect widget controls
     */
    detectWidgetControls(widget) {
        const controlSelectors = [
            '.widget-controls', '.controls', '[data-controls]',
            '.widget-settings', '.settings', '[data-settings]'
        ];
        
        return controlSelectors.some(selector => widget.querySelector(selector));
    }

    /**
     * Detect interactive charts
     */
    detectInteractiveCharts() {
        const charts = [];
        const chartElements = document.querySelectorAll('.chart, .graph, [data-chart], [data-graph], .visualization, [data-visualization]');
        
        chartElements.forEach(chart => {
            const chartData = {
                element: chart,
                type: this.getChartType(chart),
                data: this.getChartData(chart),
                isInteractive: this.isInteractiveChart(chart),
                hasAnimation: this.detectChartAnimation(chart),
                hasTooltips: this.detectChartTooltips(chart),
                hasZoom: this.detectChartZoom(chart),
                timestamp: Date.now()
            };
            
            charts.push(chartData);
        });
        
        this.mediaElements.charts = charts;
        return charts;
    }

    /**
     * Get chart type
     */
    getChartType(chart) {
        const typeSelectors = [
            '[data-chart-type]', '[data-type]', '.chart-type', '.type'
        ];
        
        for (const selector of typeSelectors) {
            const typeElement = chart.querySelector(selector);
            if (typeElement) {
                return typeElement.textContent.trim() || typeElement.getAttribute('data-chart-type');
            }
        }
        
        // Check for common chart types
        if (chart.classList.contains('bar-chart') || chart.getAttribute('data-bar-chart')) {
            return 'bar';
        } else if (chart.classList.contains('line-chart') || chart.getAttribute('data-line-chart')) {
            return 'line';
        } else if (chart.classList.contains('pie-chart') || chart.getAttribute('data-pie-chart')) {
            return 'pie';
        } else if (chart.classList.contains('scatter-chart') || chart.getAttribute('data-scatter-chart')) {
            return 'scatter';
        }
        
        return 'unknown';
    }

    /**
     * Get chart data
     */
    getChartData(chart) {
        const dataElement = chart.querySelector('[data-chart-data], [data-data], .chart-data, .data');
        if (dataElement) {
            try {
                return JSON.parse(dataElement.textContent.trim());
            } catch (e) {
                return dataElement.textContent.trim();
            }
        }
        
        return null;
    }

    /**
     * Check if chart is interactive
     */
    isInteractiveChart(chart) {
        const interactiveSelectors = [
            '[data-interactive]', '[data-clickable]', '.interactive-chart',
            '.clickable-chart', '[data-hover]', '.hover-chart'
        ];
        
        return interactiveSelectors.some(selector => chart.matches(selector));
    }

    /**
     * Detect chart animation
     */
    detectChartAnimation(chart) {
        const animationSelectors = [
            '[data-animate]', '.animate', '.animation', '[data-animation]',
            '.animated', '.moving', '.rotating', '.scaling'
        ];
        
        return animationSelectors.some(selector => chart.matches(selector));
    }

    /**
     * Detect chart tooltips
     */
    detectChartTooltips(chart) {
        const tooltipSelectors = [
            '.tooltip', '[data-tooltip]', '.chart-tooltip', '[data-chart-tooltip]'
        ];
        
        return tooltipSelectors.some(selector => chart.querySelector(selector));
    }

    /**
     * Detect chart zoom
     */
    detectChartZoom(chart) {
        const zoomSelectors = [
            '[data-zoom]', '.zoom', '.chart-zoom', '[data-chart-zoom]'
        ];
        
        return zoomSelectors.some(selector => chart.matches(selector));
    }

    /**
     * Monitor media changes
     */
    monitorMediaChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (this.isMediaElement(node)) {
                                this.detectVideoElements();
                                this.detectAudioElements();
                                this.detectCanvasElements();
                                this.detectMapElements();
                                this.detectThirdPartyWidgets();
                                this.detectInteractiveCharts();
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
        
        this.mediaObservers.set('main', observer);
    }

    /**
     * Check if element is media-related
     */
    isMediaElement(element) {
        const mediaSelectors = [
            'video', 'audio', 'canvas', '[data-video]', '[data-audio]', '[data-canvas]',
            '[data-map]', '[data-widget]', '.chart', '.graph', '.visualization'
        ];
        
        return mediaSelectors.some(selector => element.matches(selector));
    }

    /**
     * Get media statistics
     */
    getMediaStatistics() {
        return {
            videos: {
                total: this.mediaElements.videos.length,
                interactive: this.mediaElements.videos.filter(v => v.isInteractive).length,
                withControls: this.mediaElements.videos.filter(v => v.hasControls).length,
                withAudio: this.mediaElements.videos.filter(v => v.hasAudio).length
            },
            audios: {
                total: this.mediaElements.audios.length,
                interactive: this.mediaElements.audios.filter(a => a.isInteractive).length,
                withControls: this.mediaElements.audios.filter(a => a.hasControls).length
            },
            canvases: {
                total: this.mediaElements.canvases.length,
                interactive: this.mediaElements.canvases.filter(c => c.isInteractive).length,
                withAnimation: this.mediaElements.canvases.filter(c => c.hasAnimation).length
            },
            maps: {
                total: this.mediaElements.maps.length,
                interactive: this.mediaElements.maps.filter(m => m.isInteractive).length,
                withControls: this.mediaElements.maps.filter(m => m.hasControls).length
            },
            widgets: {
                total: this.mediaElements.widgets.length,
                interactive: this.mediaElements.widgets.filter(w => w.isInteractive).length,
                withControls: this.mediaElements.widgets.filter(w => w.hasControls).length
            },
            charts: {
                total: this.mediaElements.charts.length,
                interactive: this.mediaElements.charts.filter(c => c.isInteractive).length,
                withAnimation: this.mediaElements.charts.filter(c => c.hasAnimation).length,
                withTooltips: this.mediaElements.charts.filter(c => c.hasTooltips).length
            }
        };
    }

    /**
     * Export media data
     */
    exportMediaData() {
        return {
            mediaElements: this.mediaElements,
            statistics: this.getMediaStatistics(),
            timestamp: Date.now()
        };
    }

    /**
     * Clear media data
     */
    clearMediaData() {
        this.mediaElements = {
            videos: [],
            audios: [],
            canvases: [],
            maps: [],
            widgets: [],
            charts: [],
            interactive: []
        };
    }

    /**
     * Get monitoring status
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            totalVideos: this.mediaElements.videos.length,
            totalAudios: this.mediaElements.audios.length,
            totalCanvases: this.mediaElements.canvases.length,
            totalMaps: this.mediaElements.maps.length,
            totalWidgets: this.mediaElements.widgets.length,
            totalCharts: this.mediaElements.charts.length
        };
    }
}
