// API Explorer for Interactive Testing - Substrate API Sidecar Documentation
// Handles "Try it out" functionality for API endpoints

export class APIExplorer {
    constructor(parser) {
        this.parser = parser;
        this.currentRequest = null;
        this.requestHistory = [];
    }

    /**
     * Render the API explorer interface for an endpoint
     */
    renderExplorer(endpoint, serverUrl = '') {
        const explorerId = `explorer-${endpoint.id}`;
        
        return `
            <div class="api-explorer" id="${explorerId}">
                <div class="explorer-header">
                    <h3>Try it out</h3>
                    <button class="try-button" data-endpoint="${endpoint.id}">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2 8L6 12L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Execute Request
                    </button>
                </div>

                <div class="explorer-content">
                    <!-- Request Configuration -->
                    <div class="request-config">
                        <div class="config-section">
                            <h4>Request URL</h4>
                            <div class="url-builder">
                                <div class="url-display">
                                    <span class="method-badge ${this.parser.getMethodColorClass(endpoint.method)}">${endpoint.method}</span>
                                    <input type="text" 
                                           class="request-url" 
                                           value="${serverUrl}${endpoint.path}" 
                                           data-endpoint="${endpoint.id}"
                                           readonly>
                                    <button class="copy-url-button" title="Copy URL">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                            <path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/>
                                            <path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        ${this.renderParameterInputs(endpoint)}
                        ${this.renderRequestBodyInput(endpoint)}
                        ${this.renderRequestHeaders(endpoint)}
                    </div>

                    <!-- Request/Response Area -->
                    <div class="request-response-area">
                        <!-- Request Preview -->
                        <div class="request-preview">
                            <div class="section-header">
                                <h4>Generated Request</h4>
                                <button class="copy-request-button" data-endpoint="${endpoint.id}">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/>
                                        <path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/>
                                    </svg>
                                    Copy cURL
                                </button>
                            </div>
                            <div class="code-block">
                                <pre><code id="curl-preview-${endpoint.id}" class="language-bash"># Enter parameters to generate request</code></pre>
                            </div>
                        </div>

                        <!-- Response Area -->
                        <div class="response-area" id="response-${endpoint.id}" style="display: none;">
                            <div class="section-header">
                                <h4>Response</h4>
                                <div class="response-meta">
                                    <span class="response-time" id="response-time-${endpoint.id}"></span>
                                    <span class="response-status" id="response-status-${endpoint.id}"></span>
                                </div>
                            </div>
                            
                            <!-- Response Tabs -->
                            <div class="response-tabs">
                                <button class="tab-button active" data-tab="response-body-${endpoint.id}">Response Body</button>
                                <button class="tab-button" data-tab="response-headers-${endpoint.id}">Headers</button>
                                <button class="tab-button" data-tab="response-curl-${endpoint.id}">cURL</button>
                            </div>

                            <!-- Response Content -->
                            <div class="response-content">
                                <div id="response-body-${endpoint.id}" class="tab-content active">
                                    <div class="code-block">
                                        <div class="code-header">
                                            <span>JSON Response</span>
                                            <button class="copy-response-button" data-endpoint="${endpoint.id}">
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M13.5 4.5H6.5C5.67157 4.5 5 5.17157 5 6V13C5 13.8284 5.67157 14.5 6.5 14.5H13.5C14.3284 14.5 15 13.8284 15 13V6C15 5.17157 14.3284 4.5 13.5 4.5Z" stroke="currentColor" stroke-width="1.5"/>
                                                    <path d="M3 10.5C2.17157 10.5 1.5 9.82843 1.5 9V2C1.5 1.17157 2.17157 0.5 3 0.5H10C10.8284 0.5 11.5 1.17157 11.5 2" stroke="currentColor" stroke-width="1.5"/>
                                                </svg>
                                            </button>
                                        </div>
                                        <pre><code id="response-json-${endpoint.id}" class="language-json"></code></pre>
                                    </div>
                                </div>
                                
                                <div id="response-headers-${endpoint.id}" class="tab-content">
                                    <div class="headers-list" id="headers-list-${endpoint.id}"></div>
                                </div>
                                
                                <div id="response-curl-${endpoint.id}" class="tab-content">
                                    <div class="code-block">
                                        <pre><code id="curl-executed-${endpoint.id}" class="language-bash"></code></pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Loading State -->
                        <div class="loading-state" id="loading-${endpoint.id}" style="display: none;">
                            <div class="loading-spinner">
                                <div class="spinner small"></div>
                                <span>Executing request...</span>
                            </div>
                        </div>

                        <!-- Error State -->
                        <div class="error-state" id="error-${endpoint.id}" style="display: none;">
                            <div class="error-content">
                                <div class="error-icon">⚠️</div>
                                <div class="error-message">
                                    <h5>Request Failed</h5>
                                    <p id="error-message-${endpoint.id}"></p>
                                    <details class="error-details">
                                        <summary>Technical Details</summary>
                                        <pre id="error-details-${endpoint.id}"></pre>
                                    </details>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render parameter input forms
     */
    renderParameterInputs(endpoint) {
        if (!endpoint.parameters || endpoint.parameters.length === 0) {
            return '';
        }

        const groupedParams = this.groupParametersByLocation(endpoint.parameters);
        
        return `
            <div class="config-section">
                <h4>Parameters</h4>
                <div class="parameters-form">
                    ${Object.entries(groupedParams).map(([location, params]) => `
                        <div class="parameter-group">
                            <h5>${this.capitalizeFirst(location)} Parameters</h5>
                            ${params.map(param => this.renderParameterInput(param, endpoint.id)).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Render individual parameter input
     */
    renderParameterInput(param, endpointId) {
        const inputId = `param-${endpointId}-${param.name}`;
        const inputType = this.getInputType(param.schema);
        const placeholder = this.getParameterPlaceholder(param);
        
        return `
            <div class="parameter-input">
                <label for="${inputId}" class="parameter-label">
                    <span class="parameter-name">${param.name}</span>
                    ${param.required ? '<span class="required-badge">required</span>' : '<span class="optional-badge">optional</span>'}
                    <span class="parameter-type">${this.getTypeInfo(param.schema)}</span>
                </label>
                ${param.description ? `<div class="parameter-description">${param.description}</div>` : ''}
                <input 
                    type="${inputType}"
                    id="${inputId}"
                    name="${param.name}"
                    placeholder="${placeholder}"
                    data-location="${param.in}"
                    data-endpoint="${endpointId}"
                    ${param.required ? 'required' : ''}
                    class="param-input"
                />
                ${this.renderParameterValidation(param)}
            </div>
        `;
    }

    /**
     * Render request body input
     */
    renderRequestBodyInput(endpoint) {
        if (!endpoint.requestBody) return '';

        const jsonContent = endpoint.requestBody.content?.['application/json'];
        if (!jsonContent) return '';

        return `
            <div class="config-section">
                <h4>Request Body</h4>
                ${endpoint.requestBody.description ? `<p class="section-description">${endpoint.requestBody.description}</p>` : ''}
                <div class="request-body-input">
                    <div class="input-header">
                        <span>application/json</span>
                        <button class="format-json-button" data-endpoint="${endpoint.id}">Format JSON</button>
                    </div>
                    <textarea 
                        id="request-body-${endpoint.id}"
                        class="json-input"
                        placeholder='${this.getRequestBodyPlaceholder(jsonContent)}'
                        rows="8"
                        data-endpoint="${endpoint.id}"
                    ></textarea>
                </div>
            </div>
        `;
    }

    /**
     * Render request headers input
     */
    renderRequestHeaders(endpoint) {
        return `
            <div class="config-section">
                <h4>Headers</h4>
                <div class="headers-input">
                    <div class="header-row">
                        <input type="text" placeholder="Header name" class="header-name" data-endpoint="${endpoint.id}">
                        <input type="text" placeholder="Header value" class="header-value" data-endpoint="${endpoint.id}">
                        <button class="add-header-button" data-endpoint="${endpoint.id}">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2V14M2 8H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="headers-list" id="custom-headers-${endpoint.id}"></div>
                </div>
            </div>
        `;
    }

    /**
     * Execute API request
     */
    async executeRequest(endpointId, serverUrl) {
        const endpoint = this.parser.getEndpoint(endpointId);
        if (!endpoint) return;

        try {
            // Show loading state
            this.showLoading(endpointId);

            // Build request configuration
            const requestConfig = this.buildRequestConfig(endpoint, endpointId, serverUrl);
            
            // Update preview
            this.updateRequestPreview(endpointId, requestConfig);

            // Record start time
            const startTime = Date.now();

            // Execute request
            const response = await this.fetchWithTimeout(requestConfig.url, requestConfig.options, 30000);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // Process response
            const responseData = await this.processResponse(response);

            // Show response
            this.showResponse(endpointId, {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                data: responseData,
                responseTime,
                requestConfig
            });

            // Add to history
            this.addToHistory({
                endpoint,
                requestConfig,
                response: responseData,
                timestamp: new Date(),
                responseTime
            });

        } catch (error) {
            console.error('Request failed:', error);
            this.showError(endpointId, error);
        }
    }

    /**
     * Build request configuration from form inputs
     */
    buildRequestConfig(endpoint, endpointId, serverUrl) {
        let url = serverUrl + endpoint.path;
        const options = {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
                ...this.getCustomHeaders(endpointId)
            }
        };

        const queryParams = new URLSearchParams();
        const pathParams = {};

        // Collect parameters
        const paramInputs = document.querySelectorAll(`input[data-endpoint="${endpointId}"]`);
        paramInputs.forEach(input => {
            const paramName = input.name;
            const paramValue = input.value.trim();
            const location = input.dataset.location;

            if (paramValue) {
                switch (location) {
                    case 'path':
                        pathParams[paramName] = paramValue;
                        break;
                    case 'query':
                        queryParams.append(paramName, paramValue);
                        break;
                    case 'header':
                        options.headers[paramName] = paramValue;
                        break;
                }
            }
        });

        // Replace path parameters
        Object.entries(pathParams).forEach(([name, value]) => {
            url = url.replace(`{${name}}`, encodeURIComponent(value));
        });

        // Add query parameters
        const queryString = queryParams.toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }

        // Add request body
        const requestBodyInput = document.getElementById(`request-body-${endpointId}`);
        if (requestBodyInput && requestBodyInput.value.trim()) {
            try {
                options.body = JSON.stringify(JSON.parse(requestBodyInput.value));
            } catch (e) {
                options.body = requestBodyInput.value;
            }
        }

        return { url, options };
    }

    /**
     * Fetch with timeout
     */
    async fetchWithTimeout(url, options, timeout = 30000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    /**
     * Process response data
     */
    async processResponse(response) {
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            return await response.json();
        } else if (contentType.includes('text/')) {
            return await response.text();
        } else {
            return await response.blob();
        }
    }

    /**
     * Show loading state
     */
    showLoading(endpointId) {
        this.hideAllStates(endpointId);
        const loadingElement = document.getElementById(`loading-${endpointId}`);
        if (loadingElement) loadingElement.style.display = 'block';
    }

    /**
     * Show response
     */
    showResponse(endpointId, responseData) {
        this.hideAllStates(endpointId);
        
        const responseArea = document.getElementById(`response-${endpointId}`);
        const statusElement = document.getElementById(`response-status-${endpointId}`);
        const timeElement = document.getElementById(`response-time-${endpointId}`);
        const jsonElement = document.getElementById(`response-json-${endpointId}`);
        const headersElement = document.getElementById(`headers-list-${endpointId}`);
        const curlElement = document.getElementById(`curl-executed-${endpointId}`);

        if (responseArea) responseArea.style.display = 'block';
        
        // Update status and time
        if (statusElement) {
            statusElement.textContent = `${responseData.status} ${responseData.statusText}`;
            statusElement.className = `response-status ${this.getStatusClass(responseData.status)}`;
        }
        
        if (timeElement) {
            timeElement.textContent = `${responseData.responseTime}ms`;
        }

        // Update response body
        if (jsonElement) {
            const formattedData = typeof responseData.data === 'string' 
                ? responseData.data 
                : JSON.stringify(responseData.data, null, 2);
            jsonElement.textContent = formattedData;
        }

        // Update headers
        if (headersElement) {
            headersElement.innerHTML = Object.entries(responseData.headers)
                .map(([key, value]) => `
                    <div class="header-item">
                        <span class="header-name">${key}:</span>
                        <span class="header-value">${value}</span>
                    </div>
                `).join('');
        }

        // Update cURL
        if (curlElement) {
            curlElement.textContent = this.generateCurl(responseData.requestConfig);
        }
    }

    /**
     * Show error state
     */
    showError(endpointId, error) {
        this.hideAllStates(endpointId);
        
        const errorElement = document.getElementById(`error-${endpointId}`);
        const messageElement = document.getElementById(`error-message-${endpointId}`);
        const detailsElement = document.getElementById(`error-details-${endpointId}`);

        if (errorElement) errorElement.style.display = 'block';
        
        if (messageElement) {
            messageElement.textContent = this.getErrorMessage(error);
        }
        
        if (detailsElement) {
            detailsElement.textContent = error.stack || error.toString();
        }
    }

    /**
     * Hide all state elements
     */
    hideAllStates(endpointId) {
        ['response', 'loading', 'error'].forEach(state => {
            const element = document.getElementById(`${state}-${endpointId}`);
            if (element) element.style.display = 'none';
        });
    }

    // Utility methods

    groupParametersByLocation(parameters) {
        return parameters.reduce((groups, param) => {
            const location = param.in || 'query';
            if (!groups[location]) groups[location] = [];
            groups[location].push(param);
            return groups;
        }, {});
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getInputType(schema) {
        if (!schema) return 'text';
        
        switch (schema.type) {
            case 'integer':
            case 'number':
                return 'number';
            case 'boolean':
                return 'checkbox';
            case 'string':
                if (schema.format === 'email') return 'email';
                if (schema.format === 'uri') return 'url';
                if (schema.format === 'date') return 'date';
                if (schema.format === 'date-time') return 'datetime-local';
                return 'text';
            default:
                return 'text';
        }
    }

    getTypeInfo(schema) {
        if (!schema) return 'string';
        
        let type = schema.type || 'object';
        if (schema.format) type += ` (${schema.format})`;
        if (schema.$ref) type = schema.resolvedRef || 'reference';
        
        return type;
    }

    getParameterPlaceholder(param) {
        if (param.example) return String(param.example);
        if (param.schema?.example) return String(param.schema.example);
        if (param.schema?.default) return String(param.schema.default);
        
        switch (param.schema?.type) {
            case 'integer':
                return '123';
            case 'number':
                return '123.45';
            case 'boolean':
                return 'true';
            case 'string':
                if (param.schema.format === 'email') return 'user@example.com';
                if (param.schema.format === 'uri') return 'https://example.com';
                if (param.schema.format === 'date') return '2023-12-25';
                return `Enter ${param.name}`;
            default:
                return `Enter ${param.name}`;
        }
    }

    getRequestBodyPlaceholder(jsonContent) {
        if (jsonContent.example) {
            return JSON.stringify(jsonContent.example, null, 2);
        }
        return '{\n  "key": "value"\n}';
    }

    renderParameterValidation(param) {
        // Could add validation hints based on schema
        return '';
    }

    getCustomHeaders(endpointId) {
        const headers = {};
        const headerRows = document.querySelectorAll(`#custom-headers-${endpointId} .custom-header-row`);
        
        headerRows.forEach(row => {
            const nameInput = row.querySelector('.header-name');
            const valueInput = row.querySelector('.header-value');
            
            if (nameInput && valueInput && nameInput.value && valueInput.value) {
                headers[nameInput.value] = valueInput.value;
            }
        });
        
        return headers;
    }

    updateRequestPreview(endpointId, requestConfig) {
        const previewElement = document.getElementById(`curl-preview-${endpointId}`);
        if (previewElement) {
            previewElement.textContent = this.generateCurl(requestConfig);
        }
    }

    generateCurl(requestConfig) {
        let curl = `curl -X ${requestConfig.options.method} "${requestConfig.url}"`;
        
        // Add headers
        Object.entries(requestConfig.options.headers || {}).forEach(([key, value]) => {
            curl += ` \\\n  -H "${key}: ${value}"`;
        });
        
        // Add body
        if (requestConfig.options.body) {
            curl += ` \\\n  -d '${requestConfig.options.body}'`;
        }
        
        return curl;
    }

    getStatusClass(status) {
        const code = parseInt(status);
        if (code >= 200 && code < 300) return 'status-success';
        if (code >= 300 && code < 400) return 'status-redirect';
        if (code >= 400 && code < 500) return 'status-client-error';
        if (code >= 500) return 'status-server-error';
        return 'status-default';
    }

    getErrorMessage(error) {
        if (error.name === 'AbortError') return 'Request timed out';
        if (error.name === 'TypeError') return 'Network error - check your connection and CORS settings';
        return error.message || 'An unexpected error occurred';
    }

    addToHistory(requestData) {
        this.requestHistory.unshift(requestData);
        
        // Keep only last 50 requests
        if (this.requestHistory.length > 50) {
            this.requestHistory = this.requestHistory.slice(0, 50);
        }
    }

    getHistory() {
        return this.requestHistory;
    }
}