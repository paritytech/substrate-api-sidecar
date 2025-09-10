// OpenAPI YAML Parser for Substrate API Sidecar Documentation
// Handles parsing, processing, and structuring of the OpenAPI specification

// Import the YAML content directly as a string
import yamlContent from '../openapi-v1.yaml';

export class OpenAPIParser {
    constructor() {
        this.spec = null;
        this.endpoints = new Map();
        this.schemas = new Map();
        this.tags = new Map();
        this.exampleCache = new Map(); // Cache for generated examples
    }

    /**
     * Load and parse the OpenAPI YAML specification
     */
    async loadSpec() {
        try {
            console.log('Loading OpenAPI specification...');
            
            // Use the imported YAML content directly (no fetch needed)
            // Parse YAML using js-yaml library
            this.spec = jsyaml.load(yamlContent);
            
            // Process the specification
            this.processSpec();
            
            console.log('OpenAPI specification loaded successfully');
            return this.spec;
        } catch (error) {
            console.error('Error loading OpenAPI specification:', error);
            throw error;
        }
    }

    /**
     * Process the loaded specification and organize data
     */
    processSpec() {
        if (!this.spec) {
            throw new Error('No specification loaded');
        }

        // Process tags for categorization
        this.processTags();
        
        // Process paths/endpoints
        this.processEndpoints();
        
        // Process schemas/components
        this.processSchemas();
    }

    /**
     * Process and organize API tags
     */
    processTags() {
        if (this.spec.tags) {
            this.spec.tags.forEach(tag => {
                this.tags.set(tag.name, {
                    name: tag.name,
                    description: tag.description || '',
                    endpoints: []
                });
            });
        }
    }

    /**
     * Process and organize API endpoints
     */
    processEndpoints() {
        if (!this.spec.paths) return;

        Object.entries(this.spec.paths).forEach(([path, pathObj]) => {
            Object.entries(pathObj).forEach(([method, methodObj]) => {
                if (method === 'parameters') return; // Skip path-level parameters
                
                const endpointId = `${method.toUpperCase()}_${path.replace(/[{}\/]/g, '_')}`;
                const endpoint = {
                    id: endpointId,
                    path,
                    method: method.toUpperCase(),
                    summary: methodObj.summary || '',
                    description: methodObj.description || '',
                    operationId: methodObj.operationId || '',
                    tags: methodObj.tags || [],
                    parameters: this.processParameters(methodObj.parameters || []),
                    responses: this.processResponses(methodObj.responses || {}),
                    requestBody: methodObj.requestBody ? this.processRequestBody(methodObj.requestBody) : null
                };

                this.endpoints.set(endpointId, endpoint);

                // Add to tag groups
                endpoint.tags.forEach(tagName => {
                    const tag = this.tags.get(tagName);
                    if (tag) {
                        tag.endpoints.push(endpoint);
                    }
                });
            });
        });
    }

    /**
     * Process endpoint parameters
     */
    processParameters(parameters) {
        return parameters.map(param => ({
            name: param.name,
            in: param.in,
            description: param.description || '',
            required: param.required || false,
            schema: param.schema ? this.processSchema(param.schema) : null,
            example: param.example
        }));
    }

    /**
     * Process endpoint responses
     */
    processResponses(responses) {
        const processedResponses = {};
        
        Object.entries(responses).forEach(([statusCode, response]) => {
            processedResponses[statusCode] = {
                description: response.description || '',
                content: response.content ? this.processContent(response.content) : null,
                headers: response.headers || {}
            };
        });

        return processedResponses;
    }

    /**
     * Process request body
     */
    processRequestBody(requestBody) {
        return {
            description: requestBody.description || '',
            required: requestBody.required || false,
            content: requestBody.content ? this.processContent(requestBody.content) : null
        };
    }

    /**
     * Process content (media types)
     */
    processContent(content) {
        const processedContent = {};
        
        Object.entries(content).forEach(([mediaType, mediaTypeObj]) => {
            processedContent[mediaType] = {
                schema: mediaTypeObj.schema ? this.processSchema(mediaTypeObj.schema) : null,
                example: mediaTypeObj.example,
                examples: mediaTypeObj.examples
            };
        });

        return processedContent;
    }

    /**
     * Process and organize schemas/components
     */
    processSchemas() {
        if (!this.spec.components || !this.spec.components.schemas) return;

        Object.entries(this.spec.components.schemas).forEach(([name, schema]) => {
            this.schemas.set(name, {
                name,
                ...this.processSchema(schema)
            });
        });
    }

    /**
     * Process individual schema
     */
    processSchema(schema) {
        if (!schema) return null;

        const processedSchema = {
            type: schema.type,
            format: schema.format,
            description: schema.description,
            example: schema.example,
            enum: schema.enum,
            default: schema.default
        };

        // Handle object properties
        if (schema.properties) {
            processedSchema.properties = {};
            Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                processedSchema.properties[propName] = this.processSchema(propSchema);
            });
            processedSchema.required = schema.required || [];
        }

        // Handle array items
        if (schema.items) {
            processedSchema.items = this.processSchema(schema.items);
        }

        // Handle references
        if (schema.$ref) {
            processedSchema.$ref = schema.$ref;
            processedSchema.resolvedRef = this.resolveRef(schema.$ref);
        }

        // Handle oneOf, anyOf, allOf
        if (schema.oneOf) {
            processedSchema.oneOf = schema.oneOf.map(s => this.processSchema(s));
        }
        if (schema.anyOf) {
            processedSchema.anyOf = schema.anyOf.map(s => this.processSchema(s));
        }
        if (schema.allOf) {
            processedSchema.allOf = schema.allOf.map(s => this.processSchema(s));
        }

        return processedSchema;
    }

    /**
     * Resolve schema reference
     */
    resolveRef(ref) {
        if (!ref.startsWith('#/components/schemas/')) return null;
        
        const schemaName = ref.replace('#/components/schemas/', '');
        return schemaName;
    }

    /**
     * Get endpoint by ID
     */
    getEndpoint(id) {
        return this.endpoints.get(id);
    }

    /**
     * Get schema by name
     */
    getSchema(name) {
        return this.schemas.get(name);
    }

    /**
     * Get all endpoints grouped by tags
     */
    getEndpointsByTag() {
        return Array.from(this.tags.values())
            .filter(tag => tag.endpoints.length > 0)
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Get all schemas
     */
    getAllSchemas() {
        return Array.from(this.schemas.values())
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    /**
     * Search endpoints and schemas
     */
    search(query) {
        if (!query || query.length < 2) return { endpoints: [], schemas: [] };

        const lowerQuery = query.toLowerCase();
        const results = {
            endpoints: [],
            schemas: []
        };

        // Search endpoints
        this.endpoints.forEach(endpoint => {
            const searchText = `${endpoint.path} ${endpoint.summary} ${endpoint.description} ${endpoint.tags.join(' ')}`.toLowerCase();
            if (searchText.includes(lowerQuery)) {
                results.endpoints.push(endpoint);
            }
        });

        // Search schemas
        this.schemas.forEach(schema => {
            const searchText = `${schema.name} ${schema.description || ''}`.toLowerCase();
            if (searchText.includes(lowerQuery)) {
                results.schemas.push(schema);
            }
        });

        // Sort by relevance (exact matches first)
        results.endpoints.sort((a, b) => {
            const aExact = a.path.toLowerCase().includes(lowerQuery) ? 0 : 1;
            const bExact = b.path.toLowerCase().includes(lowerQuery) ? 0 : 1;
            return aExact - bExact;
        });

        results.schemas.sort((a, b) => {
            const aExact = a.name.toLowerCase().includes(lowerQuery) ? 0 : 1;
            const bExact = b.name.toLowerCase().includes(lowerQuery) ? 0 : 1;
            return aExact - bExact;
        });

        return results;
    }

    /**
     * Get API information
     */
    getApiInfo() {
        if (!this.spec) return null;

        return {
            title: this.spec.info?.title || 'API Documentation',
            description: this.spec.info?.description || '',
            version: this.spec.info?.version || '1.0.0',
            contact: this.spec.info?.contact || {},
            license: this.spec.info?.license || {},
            servers: this.spec.servers || []
        };
    }

    /**
     * Get server information
     */
    getServers() {
        return this.spec?.servers || [];
    }

    /**
     * Format endpoint path with parameters
     */
    formatEndpointPath(endpoint, serverUrl = '') {
        const fullUrl = serverUrl + endpoint.path;
        return fullUrl;
    }

    /**
     * Generate example request for endpoint
     */
    generateExampleRequest(endpoint, serverUrl = '') {
        const url = this.formatEndpointPath(endpoint, serverUrl);
        const method = endpoint.method;
        
        let curl = `curl -X ${method} "${url}"`;
        
        // Add headers if needed
        if (method !== 'GET') {
            curl += ' \\\n  -H "Content-Type: application/json"';
        }
        
        // Add request body example if available
        if (endpoint.requestBody) {
            const jsonContent = endpoint.requestBody.content?.['application/json'];
            if (jsonContent?.example) {
                curl += ` \\\n  -d '${JSON.stringify(jsonContent.example, null, 2)}'`;
            }
        }
        
        return curl;
    }

    /**
     * Get HTTP method color class
     */
    getMethodColorClass(method) {
        const colors = {
            'GET': 'method-get',
            'POST': 'method-post',
            'PUT': 'method-put',
            'DELETE': 'method-delete',
            'PATCH': 'method-patch',
            'HEAD': 'method-head',
            'OPTIONS': 'method-options'
        };
        return colors[method] || 'method-default';
    }

    /**
     * Generate example response data from schema
     */
    generateExampleFromSchema(schema, depth = 0, visitedRefs = new Set()) {
        if (depth > 10) return '...'; // Prevent infinite recursion
        if (!schema) {
            console.log('generateExampleFromSchema: schema is null/undefined');
            return null;
        }

        // Debug log for troubleshooting
        if (depth === 0) {
            console.log('generateExampleFromSchema: Processing root schema', schema);
        }

        // Create cache key for this schema at root level only
        if (depth === 0) {
            const cacheKey = JSON.stringify(schema);
            if (this.exampleCache.has(cacheKey)) {
                return this.exampleCache.get(cacheKey);
            }
            
            // Generate example and cache it
            const example = this._generateExampleFromSchemaInternal(schema, depth, visitedRefs);
            console.log('generateExampleFromSchema: Generated example', example);
            this.exampleCache.set(cacheKey, example);
            return example;
        }
        
        // For nested calls, don't use cache to avoid issues with circular refs
        return this._generateExampleFromSchemaInternal(schema, depth, visitedRefs);
    }

    /**
     * Internal method for generating examples (without caching)
     */
    _generateExampleFromSchemaInternal(schema, depth = 0, visitedRefs = new Set()) {
        if (depth > 10) return '...'; // Prevent infinite recursion
        if (!schema) return null;

        // Handle schema reference
        if (schema.$ref) {
            const refName = this.resolveRef(schema.$ref);
            
            if (!refName || visitedRefs.has(refName)) {
                return `[Reference to ${refName}]`;
            }
            
            visitedRefs.add(refName);
            const referencedSchema = this.schemas.get(refName);
            
            if (referencedSchema) {
                const result = this._generateExampleFromSchemaInternal(referencedSchema, depth + 1, visitedRefs);
                visitedRefs.delete(refName);
                return result;
            }
            return `[${refName} schema not found]`;
        }

        // Handle oneOf, anyOf, allOf
        if (schema.oneOf && schema.oneOf.length > 0) {
            return this._generateExampleFromSchemaInternal(schema.oneOf[0], depth + 1, visitedRefs);
        }
        if (schema.anyOf && schema.anyOf.length > 0) {
            return this._generateExampleFromSchemaInternal(schema.anyOf[0], depth + 1, visitedRefs);
        }
        if (schema.allOf && schema.allOf.length > 0) {
            // Merge all schemas in allOf
            const merged = {};
            for (const subSchema of schema.allOf) {
                const example = this._generateExampleFromSchemaInternal(subSchema, depth + 1, visitedRefs);
                if (example && typeof example === 'object') {
                    Object.assign(merged, example);
                }
            }
            return Object.keys(merged).length > 0 ? merged : null;
        }

        // Handle arrays
        if (schema.type === 'array' && schema.items) {
            const itemExample = this._generateExampleFromSchemaInternal(schema.items, depth + 1, visitedRefs);
            return [itemExample];
        }

        // Handle objects
        if (schema.type === 'object') {
            const example = {};
            
            if (schema.properties) {
                Object.entries(schema.properties).forEach(([propName, propSchema]) => {
                    example[propName] = this._generateExampleFromSchemaInternal(propSchema, depth + 1, visitedRefs);
                });
            }
            
            return example;
        }

        // Handle primitive types
        return this.generateExampleForPrimitive(schema);
    }

    /**
     * Generate example for primitive types
     */
    generateExampleForPrimitive(schema) {
        const type = schema.type;
        const format = schema.format;
        
        // Use example if provided
        if (schema.example !== undefined) {
            return schema.example;
        }
        
        // Use enum if available
        if (schema.enum && schema.enum.length > 0) {
            return schema.enum[0];
        }

        // Generate based on format
        if (format) {
            switch (format) {
                case 'SS58':
                    return '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5';
                case 'unsignedInteger':
                    return '1000000000000';
                case '$hex':
                    return '0x1234567890abcdef';
                case 'date-time':
                    return '2023-01-01T12:00:00.000Z';
                case 'uuid':
                    return '123e4567-e89b-12d3-a456-426614174000';
                case 'email':
                    return 'example@email.com';
                case 'uri':
                    return 'https://example.com';
                case 'binary':
                    return 'base64EncodedData';
            }
        }

        // Generate based on type
        switch (type) {
            case 'string':
                if (schema.description && schema.description.toLowerCase().includes('hash')) {
                    return '0x1234567890abcdef1234567890abcdef12345678';
                }
                if (schema.description && schema.description.toLowerCase().includes('address')) {
                    return '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5';
                }
                return 'example_string';
            case 'number':
            case 'integer':
                return 123;
            case 'boolean':
                return true;
            case 'null':
                return null;
            default:
                return null;
        }
    }

    /**
     * Generate example response for an endpoint
     */
    generateExampleResponse(endpoint, statusCode = '200') {
        if (!endpoint.responses || !endpoint.responses[statusCode]) {
            return null;
        }

        const response = endpoint.responses[statusCode];
        const content = response.content?.['application/json'];
        
        if (!content || !content.schema) {
            return null;
        }

        return this.generateExampleFromSchema(content.schema);
    }

    /**
     * Get all example responses for an endpoint
     */
    getAllExampleResponses(endpoint) {
        if (!endpoint.responses) return {};

        const examples = {};
        Object.entries(endpoint.responses).forEach(([statusCode, response]) => {
            const example = this.generateExampleResponse(endpoint, statusCode);
            if (example !== null) {
                examples[statusCode] = {
                    description: response.description,
                    example: example
                };
            }
        });

        return examples;
    }
}