# Substrate API Sidecar - Modern Documentation Design Plan

## Analysis Summary

### OpenAPI Schema Overview:
- **Size**: 7,192 lines of OpenAPI 3.0 spec
- **Endpoints**: 9+ main categories (accounts, blocks, contracts, coretime, node, pallets, runtime, transaction, paras, trace, rc)  
- **Schemas**: Complex nested data structures (AccountBalanceInfo, BlockIdentifiers, etc.)
- **Servers**: Multiple environments (Polkadot, Kusama, Asset Hub, localhost)

## Modern Dark Theme Layout Design

### 1. **Layout Structure**
```
┌─────────────────────────────────────────────────────────┐
│                    Header (Fixed)                        │
│  [Logo] Substrate API Sidecar    [Search] [Theme Toggle]│
├─────────────┬───────────────────────────────────────────┤
│             │                                           │
│   Sidebar   │              Main Content                 │
│   (Fixed)   │             (Scrollable)                  │
│             │                                           │
│ • Overview  │  ┌─────────────────────────────────────┐ │
│ • Accounts  │  │        Endpoint Details             │ │
│ • Blocks    │  │                                     │ │
│ • Contracts │  │  GET /accounts/{id}/balance-info    │ │
│ • Coretime  │  │                                     │ │
│ • Node      │  │  Description...                     │ │
│ • Pallets   │  │                                     │ │
│ • Runtime   │  │  Parameters:                        │ │
│ • Paras     │  │  Response Schema:                   │ │
│ • Trace     │  │                                     │ │
│ • RC        │  └─────────────────────────────────────┘ │
│             │                                           │
│ Schemas ▼   │                                           │
│ • Account*  │                                           │
│ • Block*    │                                           │
│ • Asset*    │                                           │
└─────────────┴───────────────────────────────────────────┘
```

### 2. **Dark Theme Color Palette**
- **Background**: `#0d1117` (GitHub Dark primary)
- **Surface**: `#161b22` (Cards, sidebar)
- **Surface Alt**: `#21262d` (Hover states)
- **Border**: `#30363d` (Subtle borders)
- **Text Primary**: `#f0f6fc` (High contrast)
- **Text Secondary**: `#8b949e` (Medium contrast)
- **Accent**: `#58a6ff` (Links, buttons)
- **Success**: `#3fb950` (GET methods)
- **Warning**: `#d29922` (POST methods) 
- **Error**: `#f85149` (DELETE methods)

### 3. **Key Features**

#### Navigation
- **Collapsible sidebar** with category grouping
- **Search functionality** with real-time filtering
- **Breadcrumb navigation** in main content
- **Scroll spy** highlighting current section

#### Endpoint Documentation
- **HTTP method badges** with color coding
- **Parameter tables** with type information
- **Schema visualization** with expandable objects
- **Example responses** with syntax highlighting

#### Interactive Elements
- **Smooth animations** (200ms transitions)
- **Hover effects** on interactive elements
- **Copy-to-clipboard** for code snippets
- **Expand/collapse** for nested schemas

### 4. **Typography**
- **Headers**: Inter, system fonts (clean, modern)
- **Body**: -apple-system, BlinkMacSystemFont, "Segoe UI" 
- **Code**: "SF Mono", Consolas, "Liberation Mono", monospace
- **Sizes**: 
  - H1: 2rem (32px)
  - H2: 1.5rem (24px) 
  - H3: 1.25rem (20px)
  - Body: 1rem (16px)
  - Code: 0.875rem (14px)

### 5. **Component Structure**
- **Header**: Fixed top navigation
- **Sidebar**: Sticky navigation with search
- **MainContent**: Scrollable content area
- **EndpointCard**: Individual API endpoint display
- **SchemaViewer**: Interactive schema visualization
- **SearchResults**: Filtered endpoint results

## Implementation Approach

### YAML Loading Strategy
**Dynamic fetch** from existing `../docs/src/openapi-v1.yaml`:
- Keeps single source of truth
- Easy updates without rebuilding
- Smaller initial bundle size

### JavaScript Architecture
- **Vanilla JS** with ES6+ modules
- **YAML parser** (js-yaml via CDN)
- **Component-based** structure
- **Event-driven** interactions

### File Structure
```
docs-v2/
├── index.html          # Main documentation page
├── styles/
│   ├── main.css        # Core dark theme styles
│   ├── components.css  # Component-specific styles
│   └── responsive.css  # Mobile responsiveness
├── scripts/
│   ├── main.js         # Application entry point
│   ├── parser.js       # OpenAPI YAML parser
│   ├── components.js   # UI components
│   └── search.js       # Search & filtering
└── DESIGN_PLAN.md      # This file
```

## Next Steps
1. Create HTML structure with semantic markup
2. Implement JavaScript OpenAPI parser
3. Build dark theme CSS with modern styling
4. Add search and filtering functionality
5. Implement responsive design
6. Test and refine UX