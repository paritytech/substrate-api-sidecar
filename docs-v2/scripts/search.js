// Search functionality for Substrate API Sidecar Documentation
// Handles search input, filtering, and results rendering

export class SearchHandler {
    constructor(parser) {
        this.parser = parser;
        this.searchResults = document.getElementById('search-results');
    }

    /**
     * Perform search across endpoints and schemas
     */
    search(query) {
        if (!query || query.length < 2) {
            this.hideResults();
            return { endpoints: [], schemas: [] };
        }

        const results = this.parser.search(query);
        return results;
    }

    /**
     * Render search results
     */
    renderResults(results) {
        if (!this.searchResults) return;

        const hasResults = results.endpoints.length > 0 || results.schemas.length > 0;
        
        if (!hasResults) {
            this.renderNoResults();
            return;
        }

        const html = `
            <div class="search-results-content">
                ${results.endpoints.length > 0 ? this.renderEndpointResults(results.endpoints) : ''}
                ${results.schemas.length > 0 ? this.renderSchemaResults(results.schemas) : ''}
            </div>
        `;

        this.searchResults.innerHTML = html;
        this.showResults();
    }

    /**
     * Render endpoint search results
     */
    renderEndpointResults(endpoints) {
        const maxResults = 8; // Limit for performance
        const limitedEndpoints = endpoints.slice(0, maxResults);
        
        return `
            <div class="search-section">
                <div class="search-section-header">
                    <h4>Endpoints</h4>
                    <span class="search-count">${endpoints.length}</span>
                </div>
                <div class="search-items">
                    ${limitedEndpoints.map(endpoint => this.renderEndpointResult(endpoint)).join('')}
                    ${endpoints.length > maxResults ? `
                        <div class="search-item-more">
                            +${endpoints.length - maxResults} more endpoints
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render individual endpoint result
     */
    renderEndpointResult(endpoint) {
        return `
            <div class="search-item" data-search-endpoint="${endpoint.id}">
                <div class="search-item-header">
                    <span class="method-badge small ${this.parser.getMethodColorClass(endpoint.method)}">${endpoint.method}</span>
                    <span class="search-item-path">${endpoint.path}</span>
                </div>
                <div class="search-item-summary">
                    ${endpoint.summary || endpoint.description || 'No description available'}
                </div>
                ${endpoint.tags.length > 0 ? `
                    <div class="search-item-tags">
                        ${endpoint.tags.map(tag => `<span class="search-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render schema search results
     */
    renderSchemaResults(schemas) {
        const maxResults = 6; // Limit for performance
        const limitedSchemas = schemas.slice(0, maxResults);
        
        return `
            <div class="search-section">
                <div class="search-section-header">
                    <h4>Schemas</h4>
                    <span class="search-count">${schemas.length}</span>
                </div>
                <div class="search-items">
                    ${limitedSchemas.map(schema => this.renderSchemaResult(schema)).join('')}
                    ${schemas.length > maxResults ? `
                        <div class="search-item-more">
                            +${schemas.length - maxResults} more schemas
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render individual schema result
     */
    renderSchemaResult(schema) {
        return `
            <div class="search-item" data-search-schema="${schema.name}">
                <div class="search-item-header">
                    <span class="schema-icon">📋</span>
                    <span class="search-item-name">${schema.name}</span>
                    <span class="search-item-type">${schema.type || 'object'}</span>
                </div>
                ${schema.description ? `
                    <div class="search-item-summary">
                        ${this.truncateText(schema.description, 100)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Render no results message
     */
    renderNoResults() {
        this.searchResults.innerHTML = `
            <div class="search-no-results">
                <div class="no-results-icon">🔍</div>
                <div class="no-results-text">
                    <p>No results found</p>
                    <small>Try different keywords or check your spelling</small>
                </div>
            </div>
        `;
        this.showResults();
    }

    /**
     * Show search results dropdown
     */
    showResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'block';
        }
    }

    /**
     * Hide search results dropdown
     */
    hideResults() {
        if (this.searchResults) {
            this.searchResults.style.display = 'none';
        }
    }

    /**
     * Clear search results
     */
    clear() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
            this.hideResults();
        }
    }

    /**
     * Highlight search terms in text
     */
    highlightText(text, query) {
        if (!query || !text) return text;
        
        const regex = new RegExp(`(${this.escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Escape special regex characters
     */
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Truncate text to specified length
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    /**
     * Filter endpoints by category/tag
     */
    filterByTag(tag) {
        const tagObj = this.parser.tags.get(tag);
        return tagObj ? tagObj.endpoints : [];
    }

    /**
     * Get search suggestions based on current input
     */
    getSuggestions(query) {
        if (!query || query.length < 2) return [];

        const suggestions = new Set();
        const lowerQuery = query.toLowerCase();

        // Add endpoint path suggestions
        this.parser.endpoints.forEach(endpoint => {
            if (endpoint.path.toLowerCase().includes(lowerQuery)) {
                suggestions.add(endpoint.path);
            }
        });

        // Add schema name suggestions
        this.parser.schemas.forEach(schema => {
            if (schema.name.toLowerCase().includes(lowerQuery)) {
                suggestions.add(schema.name);
            }
        });

        // Add tag suggestions
        this.parser.tags.forEach(tag => {
            if (tag.name.toLowerCase().includes(lowerQuery)) {
                suggestions.add(tag.name);
            }
        });

        return Array.from(suggestions).slice(0, 5);
    }

    /**
     * Advanced search with filters
     */
    advancedSearch(options = {}) {
        const {
            query = '',
            tags = [],
            methods = [],
            responseStatus = [],
            hasParameters = null
        } = options;

        let results = { endpoints: [], schemas: [] };

        // Start with basic search
        if (query) {
            results = this.search(query);
        } else {
            // Get all endpoints and schemas if no query
            results = {
                endpoints: Array.from(this.parser.endpoints.values()),
                schemas: Array.from(this.parser.schemas.values())
            };
        }

        // Apply tag filter
        if (tags.length > 0) {
            results.endpoints = results.endpoints.filter(endpoint => 
                endpoint.tags.some(tag => tags.includes(tag))
            );
        }

        // Apply method filter
        if (methods.length > 0) {
            results.endpoints = results.endpoints.filter(endpoint => 
                methods.includes(endpoint.method)
            );
        }

        // Apply response status filter
        if (responseStatus.length > 0) {
            results.endpoints = results.endpoints.filter(endpoint => 
                Object.keys(endpoint.responses).some(status => responseStatus.includes(status))
            );
        }

        // Apply parameters filter
        if (hasParameters !== null) {
            results.endpoints = results.endpoints.filter(endpoint => {
                const hasParams = endpoint.parameters && endpoint.parameters.length > 0;
                return hasParameters ? hasParams : !hasParams;
            });
        }

        return results;
    }

    /**
     * Get search analytics/stats
     */
    getSearchStats() {
        return {
            totalEndpoints: this.parser.endpoints.size,
            totalSchemas: this.parser.schemas.size,
            totalTags: this.parser.tags.size,
            endpointsByMethod: this.getEndpointsByMethod(),
            endpointsByTag: this.getEndpointsByTag()
        };
    }

    /**
     * Get endpoints grouped by HTTP method
     */
    getEndpointsByMethod() {
        const methods = {};
        this.parser.endpoints.forEach(endpoint => {
            if (!methods[endpoint.method]) methods[endpoint.method] = 0;
            methods[endpoint.method]++;
        });
        return methods;
    }

    /**
     * Get endpoints grouped by tag
     */
    getEndpointsByTag() {
        const tagCounts = {};
        this.parser.tags.forEach(tag => {
            tagCounts[tag.name] = tag.endpoints.length;
        });
        return tagCounts;
    }
}