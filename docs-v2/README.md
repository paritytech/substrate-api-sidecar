# Substrate API Sidecar Documentation v2

Modern, dark-themed documentation for Substrate API Sidecar with interactive features.

## Features

- 🌙 **Modern Dark Theme** - GitHub Dark-inspired design
- 🔍 **Real-time Search** - Search across endpoints and schemas
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎯 **Interactive Navigation** - Expandable categories and smooth scrolling
- 📋 **Schema Visualization** - Nested object rendering with type information
- 🔗 **Copy-to-Clipboard** - One-click copying for code examples
- 🌐 **Server Selection** - Switch between different API environments
- 🧪 **Interactive API Explorer** - "Try it out" functionality with live testing

## Quick Start

### Option 1: Use Pre-built Files (No Server Required!)
The easiest way to use the documentation:

```bash
# Simply open the built HTML file in your browser
open docs-v2/dist/index.html
# or on Windows: start docs-v2/dist/index.html
# or on Linux: xdg-open docs-v2/dist/index.html
```

The `dist/` directory contains all files needed to run the documentation:
- `index.html` - Main documentation page (open this!)
- `bundle.js` - Compiled JavaScript with all modules and embedded OpenAPI spec
- `favicon.ico` - Site icon

### Option 2: Development Server
For development work:

```bash
cd docs-v2
npm install
npm run dev        # Development server with hot reload
# or
npm run build      # Build production files
npm run serve      # Serve built files
```

## Development

### Building from Source
```bash
cd docs-v2
npm install        # Install dependencies
npm run build      # Build production bundle
```

This creates optimized files in `dist/` that work without a server.

### Development Mode
```bash
npm run dev        # Hot reload development server at http://localhost:8080
```

### Project Structure
```
docs-v2/
├── index.html          # HTML template
├── package.json        # Dependencies & scripts
├── webpack.config.js   # Webpack configuration
├── dist/               # Built files (ready to use!)
│   ├── index.html      # Built HTML with injected assets
│   ├── bundle.js       # Compiled JavaScript with embedded OpenAPI spec
│   └── favicon.ico     # Site icon
├── scripts/
│   ├── main.js         # Application entry point
│   ├── parser.js       # OpenAPI YAML parser
│   ├── components.js   # UI components
│   ├── api-explorer.js # Interactive API testing
│   └── search.js       # Search functionality
└── styles/
    ├── main.css        # Base styles and theme
    ├── components.css  # Component-specific styles
    └── responsive.css  # Mobile responsiveness
```

## Usage

### For End Users
1. **Download/Copy the `dist/` folder** to your desired location
2. **Open `dist/index.html`** in any modern browser
3. **No server required!** - Everything works from the file system

### For Developers  
1. **Modify source files** in `scripts/` and `styles/`
2. **Run `npm run build`** to regenerate `dist/`
3. **Copy `dist/` folder** to deploy anywhere

### Features Overview

- **Navigation**: Expandable sidebar with endpoint categories
- **Search**: Real-time filtering of endpoints and schemas  
- **Documentation**: Detailed endpoint info with parameters and responses
- **API Explorer**: Interactive testing with parameter forms and live responses
- **Theme**: Modern dark theme with light theme support
- **Mobile**: Responsive design that works on all devices

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 85+  
- Safari 14+

## Updating API Specification

To update with a new OpenAPI specification:

1. **Replace `openapi-v1.yaml`** with your new specification
2. **Run `npm run build`** to regenerate the bundle
3. **The `dist/` folder** now contains the updated documentation

No code changes needed - the documentation automatically adapts to your OpenAPI spec!