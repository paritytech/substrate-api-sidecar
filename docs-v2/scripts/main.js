// Main application entry point for Substrate API Sidecar Documentation
// Coordinates the loading, parsing, and rendering of the documentation

// Import CSS files for webpack bundling
import '../styles/main.css';
import '../styles/components.css';
import '../styles/responsive.css';

import { OpenAPIParser } from './parser.js';
import { UIComponents } from './components.js';
import { SearchHandler } from './search.js';
import { GUIDES_CONTENT } from './guides-content.js';

class DocApp {
    constructor() {
        this.parser = new OpenAPIParser();
        this.components = new UIComponents(this.parser);
        this.searchHandler = null;
        this.currentServer = 'http://localhost:8080';
        this.isLoading = true;
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing documentation app...');
        
        try {
            // Show loading screen
            this.showLoading();
            
            // Load and parse OpenAPI specification
            await this.parser.loadSpec();
            
            // Initialize search handler
            this.searchHandler = new SearchHandler(this.parser);
            
            // Setup UI
            this.setupUI();
            
            // Render initial content
            this.render();
            
            // Hide loading screen and show app
            this.hideLoading();
            
            console.log('Documentation app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize documentation app:', error);
            this.showError('Failed to load API documentation. Please refresh the page.');
        }
    }

    /**
     * Setup UI event listeners and initial state
     */
    setupUI() {
        // Setup navigation
        this.setupNavigation();
        
        // Setup search
        this.setupSearch();
        
        // Setup server selection
        this.setupServerSelection();
        
        // Setup theme toggle
        this.setupThemeToggle();
        
        // Setup mobile menu
        this.setupMobileMenu();
        
        // Setup copy to clipboard
        this.setupCopyToClipboard();
        
        // Setup scroll spy
        this.setupScrollSpy();
        
        // Setup collapsible sections
        this.setupCollapsibleSections();
        
        // Setup API explorer
        this.setupAPIExplorer();
        
    }

    /**
     * Setup navigation event listeners
     */
    setupNavigation() {
        // Handle nav group toggles - use more specific targeting
        document.addEventListener('click', (e) => {
            const navGroupHeader = e.target.closest('[data-toggle^="nav-group-"]');
            if (navGroupHeader) {
                e.preventDefault();
                e.stopPropagation();
                
                const targetId = navGroupHeader.dataset.toggle;
                const target = document.getElementById(targetId);
                
                if (target && navGroupHeader) {
                    const isExpanded = navGroupHeader.classList.contains('expanded');
                    
                    if (isExpanded) {
                        target.style.maxHeight = '0px';
                        target.style.overflow = 'hidden';
                        navGroupHeader.classList.remove('expanded');
                    } else {
                        target.style.maxHeight = target.scrollHeight + 'px';
                        target.style.overflow = 'visible';
                        navGroupHeader.classList.add('expanded');
                        
                        // Reset overflow after animation
                        setTimeout(() => {
                            if (navGroupHeader.classList.contains('expanded')) {
                                target.style.overflow = 'visible';
                            }
                        }, 300);
                    }
                }
            }
        });

        // Handle endpoint navigation - better targeting
        document.addEventListener('click', (e) => {
            const endpointLink = e.target.closest('[data-endpoint]');
            if (endpointLink && !e.target.closest('[data-toggle^="nav-group-"]')) {
                e.preventDefault();
                e.stopPropagation();
                
                const endpointId = endpointLink.dataset.endpoint;
                console.log('Endpoint clicked:', endpointId);
                
                // Update active nav link
                document.querySelectorAll('.nav-link.active').forEach(link => {
                    link.classList.remove('active');
                });
                endpointLink.classList.add('active');
                
                this.navigateToEndpoint(endpointId);
                
                // Update URL hash
                window.history.pushState(null, null, `#endpoint-${endpointId}`);
                
                // Close mobile menu if open
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menu-toggle');
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    sidebar.classList.remove('mobile-open');
                    menuToggle?.classList.remove('active');
                }
            }
        });

        // Handle schema navigation
        document.addEventListener('click', (e) => {
            const schemaLink = e.target.closest('[data-schema]');
            if (schemaLink) {
                e.preventDefault();
                e.stopPropagation();
                
                const schemaName = schemaLink.dataset.schema;
                this.navigateToSchema(schemaName);
                
                // Update URL hash
                window.history.pushState(null, null, `#schema-${schemaName}`);
            }
        });

        // Handle page navigation (overview, getting started)
        document.addEventListener('click', (e) => {
            const pageLink = e.target.closest('[data-page]');
            if (pageLink) {
                e.preventDefault();
                
                const page = pageLink.dataset.page;
                
                // Update active nav link
                document.querySelectorAll('[data-page]').forEach(link => {
                    link.classList.remove('active');
                });
                pageLink.classList.add('active');
                
                // Show the appropriate page
                if (page === 'overview') {
                    this.showOverview();
                    window.history.pushState(null, null, '#overview');
                } else if (page === 'getting-started') {
                    this.showGettingStarted();
                    window.history.pushState(null, null, '#getting-started');
                }
                
                // Close mobile menu if open
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menu-toggle');
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    sidebar.classList.remove('mobile-open');
                    menuToggle?.classList.remove('active');
                }
            }
        });

        // Handle guide navigation
        document.addEventListener('click', (e) => {
            const guideLink = e.target.closest('[data-guide]');
            if (guideLink) {
                e.preventDefault();
                e.stopPropagation();
                
                const guideName = guideLink.dataset.guide;
                
                // Update active nav link
                document.querySelectorAll('[data-guide]').forEach(link => {
                    link.classList.remove('active');
                });
                guideLink.classList.add('active');
                
                // Show the guide
                this.showGuide(guideName);
                window.history.pushState(null, null, `#guide-${guideName}`);
                
                // Close mobile menu if open
                const sidebar = document.getElementById('sidebar');
                const menuToggle = document.getElementById('menu-toggle');
                if (sidebar && sidebar.classList.contains('mobile-open')) {
                    sidebar.classList.remove('mobile-open');
                    menuToggle?.classList.remove('active');
                }
            }
        });
    }

    /**
     * Show a specific guide
     */
    showGuide(guideName) {
        const dynamicContent = document.getElementById('dynamic-content');
        const overview = document.getElementById('overview');
        const gettingStarted = document.getElementById('getting-started');
        const guideElement = document.getElementById(`guide-${guideName}`);
        
        // Hide all static sections
        if (overview) overview.style.display = 'none';
        if (gettingStarted) gettingStarted.style.display = 'none';
        if (dynamicContent) dynamicContent.innerHTML = '';
        
        // Hide all other guides
        document.querySelectorAll('[id^="guide-"]').forEach(guide => {
            guide.style.display = 'none';
        });
        
        // Show the specific guide
        if (guideElement) {
            // Load guide content if not already loaded
            this.loadGuideContent(guideName, guideElement);
            
            guideElement.style.display = 'block';
            
            // Update breadcrumb for guides
            this.updateBreadcrumb([
                { name: 'Documentation', href: '#overview' },
                { name: 'Guides', href: '#' },
                { name: this.getGuideDisplayName(guideName), href: `#guide-${guideName}` }
            ]);
            
            // Scroll to top
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
        }
    }

    /**
     * Load guide content from embedded markdown
     */
    loadGuideContent(guideName, guideElement) {
        const guideContent = guideElement.querySelector('.guide-content');
        
        // Check if content is already loaded (more than just placeholder)
        if (guideContent && guideContent.children.length > 1) {
            return;
        }
        
        try {
            const htmlContent = GUIDES_CONTENT[guideName];
            if (!htmlContent) {
                throw new Error(`Guide content not found for: ${guideName}`);
            }
            
            if (guideContent) {
                guideContent.innerHTML = htmlContent;
                
                // Setup copy buttons for code blocks
                this.setupCodeCopyButtons(guideContent);
            }
        } catch (error) {
            console.error('Error loading guide content:', error);
            if (guideContent) {
                guideContent.innerHTML = `
                    <div class="notice-box warning">
                        <div class="notice-content">
                            <strong>Error Loading Guide:</strong> Could not load the "${this.getGuideDisplayName(guideName)}" guide content.
                        </div>
                    </div>
                `;
            }
        }
    }

    /**
     * Setup copy buttons for code blocks
     */
    setupCodeCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-button[data-copy]');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const textToCopy = button.dataset.copy;
                
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        // Show feedback
                        const originalText = button.innerHTML;
                        button.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M13.485 2.515C13.7 2.3 14 2.5 14 2.8V13.2C14 13.64 13.64 14 13.2 14H2.8C2.36 14 2 13.64 2 13.2V2.8C2 2.36 2.36 2 2.8 2H12.2C12.5 2 12.7 2.3 12.515 2.515L13.485 2.515Z" fill="currentColor"/><path d="M6 10L9 7L6 4" stroke="white" stroke-width="1.5"/></svg>';
                        setTimeout(() => {
                            button.innerHTML = originalText;
                        }, 1000);
                    });
                }
            });
        });
    }

    /**
     * Get display name for a guide
     */
    getGuideDisplayName(guideName) {
        const guideNames = {
            'asset-hub-migration': 'Asset Hub Migration'
        };
        return guideNames[guideName] || guideName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Setup search functionality
     */
    setupSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const searchResults = document.getElementById('search-results');

        if (!searchInput || !this.searchHandler) return;

        let searchTimeout;

        // Handle search input
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Show/hide clear button
            searchClear.style.display = query ? 'flex' : 'none';
            
            // Debounce search
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        // Handle clear button
        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            searchClear.style.display = 'none';
            this.clearSearch();
        });

        // Handle search result clicks
        searchResults.addEventListener('click', (e) => {
            if (e.target.matches('[data-search-endpoint]')) {
                e.preventDefault();
                const endpointId = e.target.dataset.searchEndpoint;
                this.navigateToEndpoint(endpointId);
                this.clearSearch();
                searchInput.blur();
            } else if (e.target.matches('[data-search-schema]')) {
                e.preventDefault();
                const schemaName = e.target.dataset.searchSchema;
                this.navigateToSchema(schemaName);
                this.clearSearch();
                searchInput.blur();
            }
        });

        // Handle escape key to clear search
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
                searchInput.blur();
            }
        });

        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                searchResults.style.display = 'none';
            }
        });
    }

    /**
     * Setup server selection
     */
    setupServerSelection() {
        const serverSelect = document.getElementById('server-select');
        if (!serverSelect) return;

        const servers = this.parser.getServers();
        
        // Populate server options
        serverSelect.innerHTML = '';
        servers.forEach((server, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = server.description || server.url;
            if (server.url === 'http://localhost:8080') {
                option.selected = true;
            }
            serverSelect.appendChild(option);
        });

        // Handle server change
        serverSelect.addEventListener('change', (e) => {
            const serverIndex = parseInt(e.target.value);
            const server = servers[serverIndex];
            if (server) {
                this.currentServer = server.url;
                this.updateExampleRequests();
            }
        });
    }

    /**
     * Setup theme toggle
     */
    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        // Get current theme or default to dark
        const currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    /**
     * Setup mobile menu
     */
    setupMobileMenu() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        
        if (!menuToggle || !sidebar) return;

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-open');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
                menuToggle.classList.remove('active');
            }
        });
    }

    /**
     * Setup copy to clipboard functionality
     */
    setupCopyToClipboard() {
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.copy-button') || e.target.closest('.copy-button')) {
                e.preventDefault();
                
                const button = e.target.matches('.copy-button') ? e.target : e.target.closest('.copy-button');
                const textToCopy = button.dataset.copy;
                
                if (!textToCopy) return;

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    this.showCopyFeedback(button);
                } catch (err) {
                    console.error('Failed to copy text:', err);
                    this.fallbackCopy(textToCopy, button);
                }
            }
        });
    }

    /**
     * Setup scroll spy for navigation highlighting
     */
    setupScrollSpy() {
        const observerOptions = {
            root: null,
            rootMargin: '-10% 0px -80% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const navLink = document.querySelector(`[href="#${id}"]`);
                
                if (navLink) {
                    if (entry.isIntersecting) {
                        document.querySelectorAll('.nav-link.active').forEach(link => {
                            link.classList.remove('active');
                        });
                        navLink.classList.add('active');
                    }
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('.content-section').forEach(section => {
            observer.observe(section);
        });
    }

    /**
     * Setup collapsible sections
     */
    setupCollapsibleSections() {
        // Handle main section toggles (API Endpoints, Data Schemas)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.section-toggle') || e.target.closest('.section-toggle')) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.matches('.section-toggle') ? e.target : e.target.closest('.section-toggle');
                const targetId = button.dataset.target;
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.classList.toggle('collapsed');
                    button.classList.toggle('collapsed');
                }
            }
            
            // Handle section headers as clickable for better UX
            if (e.target.matches('.nav-section-header') || e.target.closest('.nav-section-header')) {
                const header = e.target.matches('.nav-section-header') ? e.target : e.target.closest('.nav-section-header');
                const toggle = header.querySelector('.section-toggle');
                if (toggle) {
                    const targetId = toggle.dataset.target;
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        target.classList.toggle('collapsed');
                        toggle.classList.toggle('collapsed');
                    }
                }
            }
        });
    }


    /**
     * Setup API explorer functionality
     */
    setupAPIExplorer() {
        // Handle execute request buttons
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.try-button') || e.target.closest('.try-button')) {
                e.preventDefault();
                const button = e.target.matches('.try-button') ? e.target : e.target.closest('.try-button');
                const endpointId = button.dataset.endpoint;
                
                // Disable button during request
                button.disabled = true;
                button.innerHTML = `
                    <div class="spinner small"></div>
                    Executing...
                `;
                
                try {
                    await this.components.apiExplorer.executeRequest(endpointId, this.currentServer);
                } finally {
                    // Re-enable button
                    button.disabled = false;
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Execute Request
                    `;
                }
            }
        });

        // Handle parameter input changes
        document.addEventListener('input', (e) => {
            if (e.target.matches('.param-input') || e.target.matches('.json-input')) {
                const endpointId = e.target.dataset.endpoint;
                this.updateRequestPreview(endpointId);
            }
        });

        // Handle response tabs (in API explorer)
        document.addEventListener('click', (e) => {
            if (e.target.matches('.response-tabs .tab-button')) {
                const targetTab = e.target.dataset.tab;
                const tabContainer = e.target.closest('.response-area');
                
                // Update tab buttons
                tabContainer.querySelectorAll('.tab-button').forEach(btn => {
                    btn.classList.remove('active');
                });
                e.target.classList.add('active');
                
                // Update tab content
                tabContainer.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            }
        });

        // Handle custom headers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.add-header-button') || e.target.closest('.add-header-button')) {
                const button = e.target.matches('.add-header-button') ? e.target : e.target.closest('.add-header-button');
                const endpointId = button.dataset.endpoint;
                this.addCustomHeader(endpointId);
            }
        });

        // Handle JSON formatting
        document.addEventListener('click', (e) => {
            if (e.target.matches('.format-json-button')) {
                const endpointId = e.target.dataset.endpoint;
                this.formatJsonInput(endpointId);
            }
        });

        // Handle copy buttons in explorer
        document.addEventListener('click', async (e) => {
            if (e.target.matches('.copy-url-button') || e.target.closest('.copy-url-button')) {
                const urlInput = e.target.closest('.url-builder').querySelector('.request-url');
                if (urlInput) {
                    await this.copyToClipboard(urlInput.value);
                    this.showCopyFeedback(e.target.closest('.copy-url-button'));
                }
            }
            
            if (e.target.matches('.copy-request-button') || e.target.closest('.copy-request-button')) {
                const button = e.target.matches('.copy-request-button') ? e.target : e.target.closest('.copy-request-button');
                const endpointId = button.dataset.endpoint;
                const curlElement = document.getElementById(`curl-preview-${endpointId}`);
                if (curlElement) {
                    await this.copyToClipboard(curlElement.textContent);
                    this.showCopyFeedback(button);
                }
            }
            
            if (e.target.matches('.copy-response-button') || e.target.closest('.copy-response-button')) {
                const button = e.target.matches('.copy-response-button') ? e.target : e.target.closest('.copy-response-button');
                const endpointId = button.dataset.endpoint;
                const responseElement = document.getElementById(`response-json-${endpointId}`);
                if (responseElement) {
                    await this.copyToClipboard(responseElement.textContent);
                    this.showCopyFeedback(button);
                }
            }
        });
    }

    /**
     * Render the main content
     */
    render() {
        // Render navigation
        this.components.renderNavigation();
        
        // Update API info
        this.updateApiInfo();
        
        // Initially expand API Endpoints section and first nav group
        setTimeout(() => {
            // Expand API Endpoints section by default
            const endpointsNav = document.getElementById('endpoints-nav');
            const endpointsToggle = document.querySelector('[data-target="endpoints-nav"]');
            if (endpointsNav && endpointsToggle) {
                endpointsNav.classList.remove('collapsed');
                endpointsToggle.classList.remove('collapsed');
            }
            
            // Expand first nav group within endpoints
            const firstNavGroup = document.querySelector('[data-toggle^="nav-group-"]');
            if (firstNavGroup) {
                const targetId = firstNavGroup.dataset.toggle;
                const target = document.getElementById(targetId);
                if (target) {
                    target.style.maxHeight = target.scrollHeight + 'px';
                    target.style.overflow = 'visible';
                    firstNavGroup.classList.add('expanded');
                }
            }
        }, 100);
    }

    /**
     * Update API information display
     */
    updateApiInfo() {
        const apiInfo = this.parser.getApiInfo();
        
        // Update version displays
        document.querySelectorAll('#api-version, #version-display').forEach(el => {
            el.textContent = `v${apiInfo.version}`;
        });
        
        // Update title if needed
        document.title = `${apiInfo.title} Documentation`;
    }

    /**
     * Navigate to a specific endpoint
     */
    navigateToEndpoint(endpointId) {
        console.log('Navigating to endpoint:', endpointId);
        
        const endpoint = this.parser.getEndpoint(endpointId);
        if (!endpoint) {
            console.error('Endpoint not found:', endpointId);
            return;
        }

        try {
            // Render endpoint documentation
            const endpointHtml = this.components.renderEndpoint(endpoint, this.currentServer);
            this.showContent(endpointHtml);
            
            // Update breadcrumb
            this.updateBreadcrumb([
                { name: 'API', href: '#overview' },
                { name: endpoint.tags[0] || 'Endpoints', href: '#' },
                { name: `${endpoint.method} ${endpoint.path}`, href: `#endpoint-${endpointId}` }
            ]);
            
            // Scroll to top
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.scrollTop = 0;
            }
            
            console.log('Successfully navigated to endpoint:', endpointId);
        } catch (error) {
            console.error('Error navigating to endpoint:', error);
        }
    }

    /**
     * Navigate to a specific schema
     */
    navigateToSchema(schemaName) {
        const schema = this.parser.getSchema(schemaName);
        if (!schema) return;

        // Render schema documentation
        const schemaHtml = this.components.renderSchemaPage(schema);
        this.showContent(schemaHtml);
        
        // Update breadcrumb
        this.updateBreadcrumb([
            { name: 'API', href: '#overview' },
            { name: 'Schemas', href: '#' },
            { name: schemaName, href: `#schema-${schemaName}` }
        ]);
        
        // Scroll to top
        document.querySelector('.main-content').scrollTop = 0;
    }

    /**
     * Show content in the main area
     */
    showContent(html) {
        const dynamicContent = document.getElementById('dynamic-content');
        const overview = document.getElementById('overview');
        const gettingStarted = document.getElementById('getting-started');
        
        if (dynamicContent && overview) {
            overview.style.display = 'none';
            if (gettingStarted) gettingStarted.style.display = 'none';
            dynamicContent.innerHTML = html;
        }
    }

    /**
     * Show the overview section
     */
    showOverview() {
        const dynamicContent = document.getElementById('dynamic-content');
        const overview = document.getElementById('overview');
        const gettingStarted = document.getElementById('getting-started');
        
        if (dynamicContent && overview) {
            overview.style.display = 'block';
            if (gettingStarted) gettingStarted.style.display = 'none';
            dynamicContent.innerHTML = '';
        }
        
        this.hideBreadcrumb();
    }

    /**
     * Show the getting started section
     */
    showGettingStarted() {
        const dynamicContent = document.getElementById('dynamic-content');
        const overview = document.getElementById('overview');
        const gettingStarted = document.getElementById('getting-started');
        
        if (dynamicContent && gettingStarted && overview) {
            overview.style.display = 'none';
            gettingStarted.style.display = 'block';
            dynamicContent.innerHTML = '';
        }
        
        this.hideBreadcrumb();
    }

    /**
     * Perform search
     */
    performSearch(query) {
        const results = this.searchHandler.search(query);
        this.searchHandler.renderResults(results);
    }

    /**
     * Clear search
     */
    clearSearch() {
        const searchInput = document.getElementById('search-input');
        const searchClear = document.getElementById('search-clear');
        const searchResults = document.getElementById('search-results');

        if (searchInput) searchInput.value = '';
        if (searchClear) searchClear.style.display = 'none';
        if (searchResults) searchResults.style.display = 'none';
    }

    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(items) {
        const breadcrumb = document.getElementById('breadcrumb');
        const breadcrumbList = breadcrumb.querySelector('.breadcrumb-list');
        
        if (!breadcrumbList) return;

        breadcrumbList.innerHTML = items.map((item, index) => `
            <li class="breadcrumb-item ${index === items.length - 1 ? 'active' : ''}">
                ${index === items.length - 1 ? 
                    `<span>${item.name}</span>` : 
                    `<a href="${item.href}">${item.name}</a>`
                }
            </li>
        `).join('');
        
        breadcrumb.style.display = 'block';
    }

    /**
     * Hide breadcrumb
     */
    hideBreadcrumb() {
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) breadcrumb.style.display = 'none';
    }

    /**
     * Update example requests when server changes
     */
    updateExampleRequests() {
        // Re-render current content with new server
        // This is a placeholder - in a full implementation, you'd track current content
        console.log('Server changed to:', this.currentServer);
    }

    /**
     * Show copy feedback
     */
    showCopyFeedback(button) {
        const originalContent = button.innerHTML;
        button.innerHTML = '✓';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.classList.remove('copied');
        }, 2000);
    }

    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text:', err);
            this.fallbackCopy(text);
        }
    }

    /**
     * Update request preview
     */
    updateRequestPreview(endpointId) {
        const endpoint = this.parser.getEndpoint(endpointId);
        if (!endpoint) return;

        try {
            const requestConfig = this.components.apiExplorer.buildRequestConfig(endpoint, endpointId, this.currentServer);
            this.components.apiExplorer.updateRequestPreview(endpointId, requestConfig);
        } catch (error) {
            console.error('Failed to update request preview:', error);
        }
    }

    /**
     * Add custom header input
     */
    addCustomHeader(endpointId) {
        const headersList = document.getElementById(`custom-headers-${endpointId}`);
        if (!headersList) return;

        const headerRow = document.createElement('div');
        headerRow.className = 'custom-header-row';
        headerRow.innerHTML = `
            <input type="text" placeholder="Header name" class="header-name">
            <input type="text" placeholder="Header value" class="header-value">
            <button class="remove-header-button" type="button">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        `;

        // Add remove functionality
        headerRow.querySelector('.remove-header-button').addEventListener('click', () => {
            headerRow.remove();
        });

        headersList.appendChild(headerRow);
    }

    /**
     * Format JSON input
     */
    formatJsonInput(endpointId) {
        const textarea = document.getElementById(`request-body-${endpointId}`);
        if (!textarea) return;

        try {
            const parsed = JSON.parse(textarea.value);
            textarea.value = JSON.stringify(parsed, null, 2);
        } catch (error) {
            console.error('Invalid JSON:', error);
            // Could show user feedback here
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    fallbackCopy(text, button) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showCopyFeedback(button);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }

    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(message) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.innerHTML = `
                <div class="loading-spinner">
                    <div class="error-icon">⚠️</div>
                    <p style="color: #f85149;">${message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #58a6ff; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new DocApp();
    window.docAppInstance = app; // Store for hash navigation
    app.init();
});

// Handle navigation via hash changes
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    
    if (hash.startsWith('endpoint-')) {
        const endpointId = hash.replace('endpoint-', '');
        const app = window.docAppInstance;
        if (app) {
            app.navigateToEndpoint(endpointId);
        }
    } else if (hash.startsWith('schema-')) {
        const schemaName = hash.replace('schema-', '');
        const app = window.docAppInstance;
        if (app) {
            app.navigateToSchema(schemaName);
        }
    } else if (hash === 'getting-started') {
        const app = window.docAppInstance;
        if (app) {
            app.showGettingStarted();
            // Update nav active state
            document.querySelectorAll('[data-page]').forEach(link => {
                link.classList.remove('active');
            });
            const gettingStartedLink = document.querySelector('[data-page="getting-started"]');
            if (gettingStartedLink) {
                gettingStartedLink.classList.add('active');
            }
        }
    } else if (hash.startsWith('guide-')) {
        const guideName = hash.replace('guide-', '');
        const app = window.docAppInstance;
        if (app) {
            app.showGuide(guideName);
            // Update nav active state
            document.querySelectorAll('[data-guide]').forEach(link => {
                link.classList.remove('active');
            });
            const guideLink = document.querySelector(`[data-guide="${guideName}"]`);
            if (guideLink) {
                guideLink.classList.add('active');
            }
        }
    } else if (!hash || hash === 'overview') {
        const app = window.docAppInstance;
        if (app) {
            app.showOverview();
            // Update nav active state  
            document.querySelectorAll('[data-page]').forEach(link => {
                link.classList.remove('active');
            });
            const overviewLink = document.querySelector('[data-page="overview"]');
            if (overviewLink) {
                overviewLink.classList.add('active');
            }
        }
    }
});

// Handle initial hash on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.slice(1);
    if (hash && hash !== 'overview') {
        // Trigger hashchange for initial navigation with longer delay
        setTimeout(() => {
            console.log('Triggering initial navigation for hash:', hash);
            window.dispatchEvent(new HashChangeEvent('hashchange'));
        }, 1000);
    }
});

// Export for debugging
window.DocApp = DocApp;