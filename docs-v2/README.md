# Substrate API Sidecar Documentation v2

Modern documentation system for Substrate API Sidecar with enhanced user experience.

## Architecture

The documentation system is built with vanilla JavaScript and webpack, creating a self-contained deployment that works without a server.

### Core Components

- **main.js** - Application orchestration and navigation
- **parser.js** - OpenAPI specification processing
- **components.js** - UI rendering and DOM manipulation  
- **api-explorer.js** - Interactive "try it out" functionality
- **search.js** - Real-time search across endpoints
- **guides-content.js** - Static guide content management

### Build System

Uses webpack to bundle all assets into a single deployable `dist/` folder containing:
- `index.html` - Complete documentation page
- `bundle.js` - All JavaScript with embedded OpenAPI spec
- `favicon.ico` - Site icon

## Adding Content

### Adding Guides

1. Create a markdown file in `guides/` directory
2. Import it in `scripts/guides-content.js`:
   ```javascript
   import newGuideMd from '../guides/NEW_GUIDE.md';
   ```
3. Add to the exports:
   ```javascript
   export const GUIDES_CONTENT = {
     'new-guide': convertMarkdownToHtml(newGuideMd)
   };
   
   export const GUIDE_METADATA = {
     'new-guide': {
       title: 'New Guide Title',
       description: 'Guide description'
     }
   };
   ```
4. Add navigation link in `index.html`:
   ```html
   <li class="nav-item">
     <a href="#guide-new-guide" class="nav-link" data-guide="new-guide">
       <span>New Guide</span>
     </a>
   </li>
   ```
5. Add content section in `index.html`:
   ```html
   <section id="guide-new-guide" class="content-section" style="display: none;">
     <div class="section-header">
       <h1>New Guide Title</h1>
     </div>
     <div class="guide-content">
       <p class="lead">Guide description</p>
     </div>
   </section>
   ```

### Adding Specifications

Follow the same pattern as guides, but use:
- `data-spec` attribute instead of `data-guide`
- `#spec-` prefix for IDs and URLs
- Add to specifications navigation section

### Markdown Support

The markdown converter supports:
- Headers (h1-h4) with automatic ID generation
- Tables with proper HTML conversion
- Code blocks with syntax highlighting
- Internal links with smooth scrolling
- Bold, italic, and inline code formatting
- Notice boxes and blockquotes

## Running the Documentation

### Development

```bash
cd docs-v2
yarn install
yarn dev    # Development server on localhost:8082
```

### Production Build

```bash
yarn build  # Creates deployable dist/ folder
```

### Deployment

The built `dist/` folder is completely self-contained and can be:
- Opened directly in a browser
- Served by any web server
- Deployed to static hosting services

## Configuration

### Server Selection

Default servers are configured in `index.html`:
```html
<select id="server-select">
  <option value="0">Polkadot Public</option>
  <option value="1" selected>Localhost</option>
</select>
```

### Theme

The documentation uses CSS custom properties for theming. Modify `styles/main.css` to change colors and spacing.

## OpenAPI Integration

The OpenAPI specification is embedded during build process. To update:

1. Replace `openapi-v1.yaml` with new specification
2. Run `yarn build`
3. Deploy the new `dist/` folder

No code changes required - the system automatically processes the new specification.