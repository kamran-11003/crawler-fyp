# 🔍 UI Crawler - Advanced Black-Box Testing Crawler

A comprehensive Chrome extension for intelligent UI crawling with screenshot capture, graph visualization, and advanced element detection. Built for modern web applications with support for SPAs, dynamic content, and complex user interactions.

## ✨ Features

### 🎯 Comprehensive Element Detection
- **Navigation & Structural Coverage**: Links, buttons, menus, iframes, SPA routing
- **Forms & Inputs**: All input types, multi-step forms, hidden fields, file uploads
- **Dynamic Components**: Modals, accordions, tabs, carousels, drag-and-drop
- **Client-Side Rendering**: React, Angular, Vue, Shadow DOM, Web Components
- **Event Handling**: Click, keyboard, hover, touch, clipboard interactions
- **Authentication**: Login/logout flows, session management, role-based UI
- **API Interactions**: XHR/fetch requests, real-time updates
- **Media Elements**: Videos, audio, charts, maps, third-party widgets
- **Accessibility**: ARIA roles, screen reader support, keyboard navigation

### 📸 Advanced Screenshot Capture
- **Automatic Screenshot Capture**: Viewport and full-page screenshots
- **Stats Page Detection**: Intelligent detection of analytics, dashboard, and metrics pages
- **Enhanced Screenshots**: Stats pages get special treatment with confidence scoring
- **Batch Screenshot Export**: Download all captured screenshots as organized files
- **Screenshot Optimization**: Automatic compression and format optimization

### 📊 Interactive Graph Visualization
- **D3.js Force Simulation**: Interactive graph with zoom, pan, and node manipulation
- **Smart Filtering**: Filter by stats pages, screenshots, interactive elements
- **Node Interaction**: Click for details, double-click for screenshots
- **Visual Indicators**: Color-coded nodes for different page types
- **Real-time Statistics**: Live stats panel with coverage metrics
- **Export Options**: JSON graph export and screenshot downloads

### 🧠 Intelligent State Management
- **Feature-Aware Hashing**: Smart deduplication based on functional equivalence
- **State Abstraction**: Cluster similar pages to avoid redundant crawling
- **Functional Equivalence**: Ignore cosmetic differences, focus on functionality
- **Coverage Analysis**: Track element coverage and identify gaps
- **Graph Pruning**: Remove redundant nodes while preserving functionality

### ⚡ Performance & Scalability
- **Async Behavior Handling**: Network idle detection, animation waiting
- **Memory Optimization**: Efficient storage and graph pruning
- **Parallel Processing**: Multi-tab crawling capabilities
- **Batch Operations**: Process multiple pages efficiently
- **Progress Tracking**: Real-time progress indicators and status updates

## 🚀 Quick Start

### Installation
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. Pin the extension to your toolbar for easy access

### Basic Usage
1. **Extract Current Page**: Click the extension icon → "Extract Current Page"
2. **Crawl Multiple Pages**: Set max pages/depth → "Crawl Multiple Pages"
3. **View Graph**: Click "Open Graph Visualizer" for interactive visualization
4. **Export Data**: Download JSON graph or screenshots

### Advanced Usage
1. **Configure Settings**: Use the Settings tab to customize detection options
2. **Screenshot Options**: Enable/disable screenshot capture and stats page detection
3. **Performance Tuning**: Adjust timeout, batch size, and detection features
4. **Data Management**: Clear data or reset settings as needed

## 📁 Project Structure

```
chrome/
├── manifest.json                 # Extension configuration
├── background.js                 # Service worker for downloads and messaging
├── content.js                   # Enhanced content script for element detection
├── popup.js                     # Advanced popup interface
├── popup.html                   # Multi-tab popup interface
├── modules/                     # Core functionality modules
│   ├── screenshotManager.js    # Screenshot capture and stats detection
│   ├── elementDetector.js      # Comprehensive element detection
│   ├── stateManager.js         # State hashing and deduplication
│   ├── eventSimulator.js       # Event simulation and interaction
│   ├── asyncManager.js         # Async behavior and timing management
│   ├── authManager.js          # Authentication and session handling
│   └── coverageAnalyzer.js     # Coverage metrics and gap analysis
├── utils/                       # Utility modules
│   ├── selectors.js            # Comprehensive CSS selectors
│   ├── hashing.js              # Feature-aware hashing algorithms
│   └── clustering.js           # State abstraction and clustering
├── visualization/               # Graph visualization
│   ├── graph-viewer.html       # D3.js visualization interface
│   └── graph-viewer.js         # Interactive graph logic
└── icons/                      # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 🎛️ Configuration Options

### Crawl Settings
- **Max Pages**: Limit the number of pages to crawl (1-50)
- **Max Depth**: Set maximum navigation depth (1-10)
- **Same Origin Only**: Restrict crawling to same domain
- **Enhanced Detection**: Enable comprehensive element detection
- **Accessibility Scan**: Include accessibility features in detection
- **Shadow DOM Support**: Detect elements in Shadow DOM

### Screenshot Options
- **Capture Screenshots**: Enable/disable screenshot capture
- **Auto-detect Stats Pages**: Automatically identify analytics pages
- **Full Page Screenshots**: Capture complete page content
- **Screenshot Quality**: Adjust image quality and format

### Performance Settings
- **Timeout**: Set maximum wait time for page loads (1-30 seconds)
- **Batch Size**: Number of pages to process simultaneously (1-20)
- **Memory Management**: Automatic cleanup and optimization

## 📊 Graph Format

The exported JSON graph contains rich metadata:

```json
{
  "nodes": [
    {
      "id": "unique_node_id",
      "url": "https://example.com/page",
      "title": "Page Title",
      "timestamp": 1640995200000,
      "elements": [...],
      "state_vector": {...},
      "screenshots": {
        "regular": "data:image/png;base64,...",
        "stats": {
          "screenshot": "data:image/png;base64,...",
          "confidence": 0.85
        }
      },
      "metadata": {...}
    }
  ],
  "edges": [
    {
      "from": "node_id_1",
      "to": "node_id_2",
      "action": {...},
      "timestamp": 1640995200000
    }
  ]
}
```

## 🔧 Advanced Features

### Stats Page Detection
The extension intelligently detects analytics and dashboard pages using:
- URL pattern matching (`/stats`, `/analytics`, `/dashboard`)
- Title keyword analysis
- Content analysis (charts, metrics, KPIs)
- Analytics library detection (Google Analytics, Mixpanel, etc.)
- Confidence scoring for detection accuracy

### State Vector Analysis
Each page is analyzed for functional features:
- **Element Counts**: Links, buttons, inputs, forms, media
- **Functional Features**: Navigation, forms, media, authentication, e-commerce
- **Content Features**: Text, images, videos, charts
- **State Features**: Visible/hidden elements, disabled states
- **Accessibility Features**: ARIA labels, keyboard navigation

### Graph Visualization Features
- **Interactive Nodes**: Click for details, double-click for screenshots
- **Smart Filtering**: Filter by page type, screenshot availability
- **Visual Indicators**: Color-coded nodes for different page types
- **Layout Options**: Force simulation and hierarchical layouts
- **Export Capabilities**: JSON export and screenshot downloads

## 🛠️ Development

### Adding New Element Types
1. Update `utils/selectors.js` with new CSS selectors
2. Modify `content.js` to handle new element types
3. Update state vector creation in `utils/hashing.js`

### Custom Screenshot Logic
1. Extend `modules/screenshotManager.js`
2. Add new detection methods
3. Update popup interface for new options

### Graph Visualization Enhancements
1. Modify `visualization/graph-viewer.js`
2. Add new node types and interactions
3. Update styling in `graph-viewer.html`

## 📈 Performance Considerations

### Memory Management
- Automatic graph pruning for large datasets
- Efficient screenshot storage and compression
- Batch processing for large-scale crawling

### Network Optimization
- Intelligent waiting for network idle
- Animation and transition detection
- Lazy loading content handling

### Scalability
- Multi-tab crawling support
- Distributed crawling architecture
- Parallel processing capabilities

## 🐛 Troubleshooting

### Common Issues
1. **No data captured**: Enable "Allow access to file URLs" for local files
2. **Screenshots not working**: Check permissions in manifest.json
3. **Graph not loading**: Clear browser cache and reload extension
4. **Performance issues**: Reduce batch size and timeout settings

### Debug Mode
Enable console logging by opening Developer Tools and checking the Console tab for detailed error messages.

## 📝 License

This project is part of a Final Year Project (FYP) for advanced UI testing and crawling. Please respect the academic nature of this work.

## 🤝 Contributing

This is an academic project, but suggestions and improvements are welcome. Please ensure any contributions align with the educational goals of the project.

## 📚 References

- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [D3.js Documentation](https://d3js.org/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Black-Box Testing Best Practices](https://en.wikipedia.org/wiki/Black-box_testing)

---

**Note**: This extension is designed for educational and research purposes. Always respect website terms of service and robots.txt files when crawling external sites.
