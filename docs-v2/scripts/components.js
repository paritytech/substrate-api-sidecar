// UI Components for Substrate API Sidecar Documentation
// Handles rendering of API documentation components

import { APIExplorer } from './api-explorer.js';

export class UIComponents {
    constructor(parser) {
        this.parser = parser;
        this.apiExplorer = new APIExplorer(parser);
    }

    /**
     * Render navigation menu
     */
    renderNavigation() {
        const endpointsNav = document.getElementById('endpoints-nav');
        const schemasNav = document.getElementById('schemas-nav');
        
        if (!endpointsNav || !schemasNav) return;

        // Clear existing content
        endpointsNav.innerHTML = '';
        schemasNav.innerHTML = '';

        // Render endpoints by tag
        const tagGroups = this.parser.getEndpointsByTag();
        tagGroups.forEach(tag => {
            const li = document.createElement('li');
            li.className = 'nav-item nav-group';
            
            li.innerHTML = `
                <div class="nav-group-header" data-toggle="nav-group-${tag.name}">
                    <span class="nav-group-title">${this.capitalizeFirst(tag.name)}</span>
                    <span class="nav-group-count">${tag.endpoints.length}</span>
                    <svg class="nav-group-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <ul class="nav-sublist" id="nav-group-${tag.name}">
                    ${tag.endpoints.map(endpoint => `
                        <li class="nav-subitem">
                            <a href="#endpoint-${endpoint.id}" class="nav-link" data-endpoint="${endpoint.id}">
                                <span class="method-badge ${this.parser.getMethodColorClass(endpoint.method)}">${endpoint.method}</span>
                                <span class="endpoint-path">${this.truncatePath(endpoint.path)}</span>
                            </a>
                        </li>
                    `).join('')}
                </ul>
            `;
            
            endpointsNav.appendChild(li);
        });

        // Render schemas
        const schemas = this.parser.getAllSchemas().slice(0, 20); // Limit for performance
        schemas.forEach(schema => {
            const li = document.createElement('li');
            li.className = 'nav-item';
            
            li.innerHTML = `
                <a href="#schema-${schema.name}" class="nav-link" data-schema="${schema.name}">
                    <span class="schema-icon">📋</span>
                    <span class="schema-name">${schema.name}</span>
                </a>
            `;
            
            schemasNav.appendChild(li);
        });
    }

    /**
     * Render endpoint documentation
     */
    renderEndpoint(endpoint, serverUrl = '') {
        if (!endpoint) return '';

        const exampleRequest = this.parser.generateExampleRequest(endpoint, serverUrl);
        
        return `
            <section id="endpoint-${endpoint.id}" class="content-section endpoint-section">
                <div class="section-header">
                    <div class="endpoint-title">
                        <span class="method-badge large ${this.parser.getMethodColorClass(endpoint.method)}">${endpoint.method}</span>
                        <h2 class="endpoint-path">${endpoint.path}</h2>
                    </div>
                    <div class="endpoint-meta">
                        ${endpoint.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>

                <div class="endpoint-content">
                    ${endpoint.summary ? `<p class="endpoint-summary">${endpoint.summary}</p>` : ''}
                    ${endpoint.description ? `<div class="endpoint-description">${this.formatDescription(endpoint.description)}</div>` : ''}

                    ${this.renderParameters(endpoint.parameters)}
                    ${this.renderRequestBody(endpoint.requestBody)}
                    ${this.renderResponses(endpoint.responses)}
                    ${this.renderExampleRequest(exampleRequest, endpoint)}
                    
                    <!-- API Explorer -->
                    ${this.apiExplorer.renderExplorer(endpoint, serverUrl)}
                </div>
            </section>
        `;
    }

    /**
     * Render endpoint parameters
     */
    renderParameters(parameters) {
        if (!parameters || parameters.length === 0) return '';

        const groupedParams = this.groupParametersByLocation(parameters);
        
        return `
            <div class="parameters-section">
                <h3>Parameters</h3>
                ${Object.entries(groupedParams).map(([location, params]) => `
                    <div class="parameter-group">
                        <h4 class="parameter-group-title">${this.capitalizeFirst(location)} Parameters</h4>
                        <div class="parameter-table">
                            ${params.map(param => this.renderParameter(param)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Group parameters by location (path, query, header, etc.)
     */
    groupParametersByLocation(parameters) {
        return parameters.reduce((groups, param) => {
            const location = param.in || 'query';
            if (!groups[location]) groups[location] = [];
            groups[location].push(param);
            return groups;
        }, {});
    }

    /**
     * Render individual parameter
     */
    renderParameter(param) {
        const typeInfo = this.getTypeInfo(param.schema);
        
        return `
            <div class="parameter-row">
                <div class="parameter-info">
                    <div class="parameter-header">
                        <span class="parameter-name">${param.name}</span>
                        ${param.required ? '<span class="required-badge">required</span>' : '<span class="optional-badge">optional</span>'}
                    </div>
                    <div class="parameter-type">${typeInfo}</div>
                    ${param.description ? `<div class="parameter-description">${param.description}</div>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Render request body
     */
    renderRequestBody(requestBody) {
        if (!requestBody) return '';

        return `
            <div class="request-body-section">
                <h3>Request Body</h3>
                ${requestBody.required ? '<span class="required-badge">required</span>' : ''}
                ${requestBody.description ? `<p class="request-body-description">${requestBody.description}</p>` : ''}
                ${this.renderContent(requestBody.content)}
            </div>
        `;
    }

    /**
     * Render responses
     */
    renderResponses(responses) {
        if (!responses || Object.keys(responses).length === 0) return '';

        return `
            <div class="responses-section">
                <h3>Responses</h3>
                <div class="responses-list">
                    ${Object.entries(responses).map(([statusCode, response]) => this.renderResponse(statusCode, response)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual response
     */
    renderResponse(statusCode, response) {
        const statusClass = this.getStatusClass(statusCode);
        
        return `
            <div class="response-item">
                <div class="response-header">
                    <span class="status-code ${statusClass}">${statusCode}</span>
                    <span class="response-description">${response.description}</span>
                </div>
                ${response.content ? this.renderContent(response.content) : ''}
            </div>
        `;
    }

    /**
     * Render content (media types)
     */
    renderContent(content) {
        if (!content) return '';

        return `
            <div class="content-section">
                ${Object.entries(content).map(([mediaType, mediaContent]) => `
                    <div class="media-type-section">
                        <h4 class="media-type">${mediaType}</h4>
                        ${mediaContent.schema ? this.renderSchema(mediaContent.schema) : ''}
                        ${mediaContent.example ? this.renderExample(mediaContent.example, mediaType) : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render schema
     */
    renderSchema(schema, depth = 0) {
        if (!schema) return '';
        
        if (depth > 3) return '<div class="schema-too-deep">Schema too deep...</div>';

        // Handle references
        if (schema.$ref) {
            const refName = schema.resolvedRef;
            return `
                <div class="schema-ref">
                    <a href="#schema-${refName}" class="schema-ref-link">${refName}</a>
                </div>
            `;
        }

        // Handle object properties
        if (schema.type === 'object' && schema.properties) {
            return `
                <div class="schema-object" style="margin-left: ${depth * 16}px">
                    <div class="schema-type">object</div>
                    <div class="schema-properties">
                        ${Object.entries(schema.properties).map(([propName, propSchema]) => `
                            <div class="schema-property">
                                <div class="property-header">
                                    <span class="property-name">${propName}</span>
                                    ${schema.required?.includes(propName) ? '<span class="required-badge">required</span>' : ''}
                                    <span class="property-type">${this.getTypeInfo(propSchema)}</span>
                                </div>
                                ${propSchema.description ? `<div class="property-description">${propSchema.description}</div>` : ''}
                                ${this.renderSchema(propSchema, depth + 1)}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Handle arrays
        if (schema.type === 'array' && schema.items) {
            return `
                <div class="schema-array" style="margin-left: ${depth * 16}px">
                    <div class="schema-type">array of:</div>
                    ${this.renderSchema(schema.items, depth + 1)}
                </div>
            `;
        }

        // Handle simple types
        return `
            <div class="schema-simple" style="margin-left: ${depth * 16}px">
                <span class="schema-type">${this.getTypeInfo(schema)}</span>
                ${schema.description ? `<span class="schema-description">${schema.description}</span>` : ''}
            </div>
        `;
    }

    /**
     * Render example code
     */
    renderExample(example, mediaType) {
        const formattedExample = this.formatExample(example, mediaType);
        const language = this.getLanguageFromMediaType(mediaType);
        
        return `
            <div class="example-section">
                <div class="example-header">
                    <span>Example</span>
                    <button class="copy-button" data-copy="${this.escapeHtml(formattedExample)}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                    </button>
                </div>
                <div class="code-block">
                    <pre><code class="language-${language}">${this.escapeHtml(formattedExample)}</code></pre>
                </div>
            </div>
        `;
    }

    /**
     * Render example request
     */
    renderExampleRequest(curlCommand, endpoint) {
        return `
            <div class="example-request-section">
                <h3>Example Request</h3>
                <div class="code-block">
                    <div class="code-header">
                        <span>cURL</span>
                        <button class="copy-button" data-copy="${this.escapeHtml(curlCommand)}">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/>
                                <path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                        </button>
                    </div>
                    <pre><code class="language-bash">${this.escapeHtml(curlCommand)}</code></pre>
                </div>
            </div>
        `;
    }

    /**
     * Render schema documentation page
     */
    renderSchemaPage(schema) {
        if (!schema) return '';

        return `
            <section id="schema-${schema.name}" class="content-section schema-section">
                <div class="section-header">
                    <h2 class="schema-title">${schema.name}</h2>
                    <div class="schema-meta">
                        <span class="schema-type-badge">${schema.type || 'object'}</span>
                    </div>
                </div>

                <div class="schema-content">
                    ${schema.description ? `<p class="schema-summary">${schema.description}</p>` : ''}
                    
                    <div class="schema-definition">
                        <h3>Schema Definition</h3>
                        ${this.renderSchema(schema)}
                    </div>
                </div>
            </section>
        `;
    }

    // Utility methods

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    truncatePath(path, maxLength = 30) {
        return path.length > maxLength ? path.substring(0, maxLength) + '...' : path;
    }

    getTypeInfo(schema) {
        if (!schema) return 'unknown';
        
        let type = schema.type || 'object';
        if (schema.format) type += ` (${schema.format})`;
        if (schema.$ref) type = schema.resolvedRef || 'reference';
        
        return type;
    }

    getStatusClass(statusCode) {
        const code = parseInt(statusCode);
        if (code >= 200 && code < 300) return 'status-success';
        if (code >= 300 && code < 400) return 'status-redirect';
        if (code >= 400 && code < 500) return 'status-client-error';
        if (code >= 500) return 'status-server-error';
        return 'status-default';
    }

    formatDescription(description) {
        // Convert markdown-like formatting to HTML
        return description
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    formatExample(example, mediaType) {
        if (mediaType === 'application/json') {
            return typeof example === 'string' ? example : JSON.stringify(example, null, 2);
        }
        return typeof example === 'string' ? example : JSON.stringify(example);
    }

    getLanguageFromMediaType(mediaType) {
        const languageMap = {
            'application/json': 'json',
            'application/xml': 'xml',
            'text/plain': 'text',
            'text/html': 'html',
            'application/x-www-form-urlencoded': 'text'
        };
        return languageMap[mediaType] || 'text';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}