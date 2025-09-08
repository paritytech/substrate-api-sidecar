# Advanced Configuration Guide

This comprehensive guide covers all configuration options available in Substrate API Sidecar. All environment variables use the `SAS_` prefix (Substrate API Sidecar).

## Table of Contents

- [Express Server Configuration](#express-server-configuration)
- [Substrate Node Connection](#substrate-node-connection)
- [Custom Type Definitions](#custom-type-definitions)
- [Logging Configuration](#logging-configuration)
- [Metrics & Monitoring](#metrics--monitoring)
- [Development & Debugging](#development--debugging)
- [Environment Profiles](#environment-profiles)
- [Docker Configuration](#docker-configuration)

## Express Server Configuration

Configure the HTTP server that serves the REST API.

### Basic Server Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_EXPRESS_BIND_HOST` | `127.0.0.1` | Network interface to bind to. **Use `0.0.0.0` for Docker** |
| `SAS_EXPRESS_PORT` | `8080` | Port number (2-6 digits) |
| `SAS_EXPRESS_KEEP_ALIVE_TIMEOUT` | `5000` | Keep-alive timeout in milliseconds |
| `SAS_EXPRESS_MAX_BODY` | `100kb` | Maximum request body size |

### Controller Management

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_EXPRESS_INJECTED_CONTROLLERS` | `false` | Auto-detect pallets and inject controllers vs. using chain config |

**Example:**
```bash
export SAS_EXPRESS_BIND_HOST=0.0.0.0
export SAS_EXPRESS_PORT=3000
export SAS_EXPRESS_KEEP_ALIVE_TIMEOUT=10000
export SAS_EXPRESS_MAX_BODY=1mb
export SAS_EXPRESS_INJECTED_CONTROLLERS=true
```

## Substrate Node Connection

Configure connections to Substrate-based blockchain nodes.

### Primary Node Connection

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SAS_SUBSTRATE_URL` | ✅ | `ws://127.0.0.1:9944` | WebSocket or HTTP URL to node |

**Supported protocols:** `ws://`, `wss://`, `http://`, `https://`

### Multi-Chain Configuration

For Asset Hub migration and multi-chain queries:

| Variable | Required | Description |
|----------|----------|-------------|
| `SAS_SUBSTRATE_MULTI_CHAIN_URL` | ❌ | JSON array of chain configurations |

**Format:**
```json
[{"url":"wss://relay-chain.com","type":"relay"}]
```

**Chain types:**
- `relay` - Relay chain (Polkadot/Kusama)
- `assethub` - Asset Hub parachain
- `parachain` - Other parachains
- `undefined` - Generic chain

**Example configurations:**

```bash
# Single node (basic)
export SAS_SUBSTRATE_URL=wss://polkadot-rpc.polkadot.io

# Asset Hub with relay chain
export SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io
export SAS_SUBSTRATE_MULTI_CHAIN_URL='[{"url":"wss://polkadot-rpc.polkadot.io","type":"relay"}]'

# Local development
export SAS_SUBSTRATE_URL=ws://127.0.0.1:9944
export SAS_SUBSTRATE_MULTI_CHAIN_URL='[{"url":"ws://127.0.0.1:9945","type":"relay"}]'
```

### Caching

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_SUBSTRATE_CACHE_CAPACITY` | `0` | Max cache size for @polkadot/api (0 = no cache) |

## Custom Type Definitions

For chains with custom types not recognized by polkadot-js/api.

### Type Definition Files

| Variable | Format | Description |
|----------|--------|-------------|
| `SAS_SUBSTRATE_TYPES_BUNDLE` | `OverrideBundleType` | Bundle with versioning, aliases, derives, RPC |
| `SAS_SUBSTRATE_TYPES_CHAIN` | `Record<string, RegistryTypes>` | Types keyed by chain name |
| `SAS_SUBSTRATE_TYPES_SPEC` | `Record<string, RegistryTypes>` | Types keyed by spec name |
| `SAS_SUBSTRATE_TYPES` | `RegistryTypes` | Basic type definitions |

**Example for custom node template:**

1. Create types file:
```json
{
  "Address": "AccountId",
  "LookupSource": "AccountId"
}
```

2. Set environment variable:
```bash
export SAS_SUBSTRATE_TYPES=/path/to/my-custom-types.json
```

### Type Bundle Generation

Use the [generate-type-bundle](https://github.com/paritytech/generate-type-bundle) tool:

```bash
npx @polkadot/typegen-cli generate --package @my-org/my-chain-types --endpoint ws://127.0.0.1:9944
export SAS_SUBSTRATE_TYPES_BUNDLE=/path/to/generated-bundle.json
```

## Logging Configuration

Control logging behavior and output formatting.

### Log Levels

| Variable | Default | Options | Description |
|----------|---------|---------|-------------|
| `SAS_LOG_LEVEL` | `info` | `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly` | Minimum log level |

**HTTP Status Code Mapping:**
- `< 400` → `http` level
- `400-499` → `warn` level  
- `≥ 500` → `error` level

### Log Formatting

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_LOG_JSON` | `false` | Output logs in JSON format |
| `SAS_LOG_FILTER_RPC` | `false` | Filter polkadot-js API-WS RPC logs |
| `SAS_LOG_STRIP_ANSI` | `false` | Remove ANSI color codes |

### File Logging

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_LOG_WRITE` | `false` | Write logs to file |
| `SAS_LOG_WRITE_PATH` | `./logs` | Directory for log files |
| `SAS_LOG_WRITE_MAX_FILE_SIZE` | `5242880` | Max file size (5MB) |
| `SAS_LOG_WRITE_MAX_FILES` | `5` | Max number of log files |

**Example configurations:**

```bash
# Development logging
export SAS_LOG_LEVEL=debug
export SAS_LOG_JSON=false

# Production logging
export SAS_LOG_LEVEL=info
export SAS_LOG_JSON=true
export SAS_LOG_WRITE=true
export SAS_LOG_WRITE_PATH=/var/log/sidecar

# RPC debugging
export SAS_LOG_LEVEL=http
export SAS_LOG_FILTER_RPC=false
export SAS_LOG_STRIP_ANSI=true
```

## Metrics & Monitoring

Enable Prometheus metrics and Loki logging integration.

### Metrics Server

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_METRICS_ENABLED` | `false` | Enable metrics collection |
| `SAS_METRICS_PROM_HOST` | `127.0.0.1` | Prometheus server host |
| `SAS_METRICS_PROM_PORT` | `9100` | Prometheus server port |
| `SAS_METRICS_INCLUDE_QUERYPARAMS` | `false` | Include query params in metrics labels |

### Loki Integration

| Variable | Default | Description |
|----------|---------|-------------|
| `SAS_METRICS_LOKI_HOST` | `127.0.0.1` | Loki server host |
| `SAS_METRICS_LOKI_PORT` | `3100` | Loki server port |

### Available Metrics

**HTTP Metrics:**
- `sas_http_requests` - Total HTTP requests
- `sas_http_request_success` - Successful requests
- `sas_http_request_error` - Failed requests
- `sas_request_duration_seconds` - Request latency
- `sas_response_size_bytes_seconds` - Response size
- `sas_response_size_latency_ratio_seconds` - Bytes per second

**Block Controller Metrics:**
- `sas_extrinsics_in_request` - Extrinsics in block range requests
- `sas_extrinsics_per_second` - Extrinsics processing rate
- `sas_extrinsics_per_block` - Extrinsics per block
- `sas_seconds_per_block` - Processing time per block

**Endpoints:**
- Prometheus: `http://host:port/metrics`
- JSON format: `http://host:port/metrics.json`

**Example setup:**

```bash
# Enable metrics
export SAS_METRICS_ENABLED=true
export SAS_METRICS_PROM_PORT=9090
export SAS_METRICS_INCLUDE_QUERYPARAMS=true

# With external monitoring stack
export SAS_METRICS_PROM_HOST=prometheus.internal.com
export SAS_METRICS_LOKI_HOST=loki.internal.com
```

## Development & Debugging

### Fee Calculation Debugging

Enable detailed logging for fee and staking calculations:

```bash
CALC_DEBUG=1 sh calc/build.sh
```

### RPC Request Logging

Log all RPC requests/responses:

```bash
yarn start:log-rpc
# or
NODE_ENV=test SAS_LOG_STRIP_ANSI=true yarn start
```

### Trace Endpoints

Enable experimental tracing endpoints:

1. **Run node with:** `--unsafe-rpc-external`
2. **Verify chain support:** Check if `BlocksTrace` controller is active
3. **Available for:** Polkadot, Kusama

**Trace endpoints:**
- `/experimental/blocks/{blockId}/traces/operations`
- `/experimental/blocks/head/traces/operations`
- `/experimental/blocks/{blockId}/traces`
- `/experimental/blocks/head/traces`

## Environment Profiles

Use different configuration profiles for various environments.

### Profile Structure

Create environment-specific files:
```
.env.local       # Local development
.env.staging     # Staging environment
.env.production  # Production settings
.env.test        # Testing configuration
```

### Loading Profiles

```bash
# Use specific profile
NODE_ENV=staging yarn start

# Development with custom profile
NODE_ENV=myprofile yarn dev
```

### Example Profiles

**.env.local (Development):**
```bash
SAS_SUBSTRATE_URL=ws://127.0.0.1:9944
SAS_EXPRESS_BIND_HOST=127.0.0.1
SAS_EXPRESS_PORT=8080
SAS_LOG_LEVEL=debug
SAS_METRICS_ENABLED=false
```

**.env.production (Production):**
```bash
SAS_SUBSTRATE_URL=wss://polkadot-rpc.polkadot.io
SAS_EXPRESS_BIND_HOST=0.0.0.0
SAS_EXPRESS_PORT=8080
SAS_LOG_LEVEL=info
SAS_LOG_JSON=true
SAS_LOG_WRITE=true
SAS_METRICS_ENABLED=true
SAS_EXPRESS_KEEP_ALIVE_TIMEOUT=30000
```

**.env.docker (Docker):**
```bash
SAS_SUBSTRATE_URL=ws://host.docker.internal:9944
SAS_EXPRESS_BIND_HOST=0.0.0.0
SAS_EXPRESS_PORT=8080
SAS_LOG_JSON=true
```

## Docker Configuration

### Environment File

Use `.env.docker` with Docker:

```bash
docker run --rm -it --env-file .env.docker -p 8080:8080 parity/substrate-api-sidecar
```

### Docker Compose

```yaml
version: '3.8'
services:
  sidecar:
    image: parity/substrate-api-sidecar:latest
    ports:
      - "8080:8080"
    environment:
      - SAS_SUBSTRATE_URL=ws://substrate-node:9944
      - SAS_EXPRESS_BIND_HOST=0.0.0.0
      - SAS_LOG_LEVEL=info
      - SAS_LOG_JSON=true
    depends_on:
      - substrate-node
```

### Networking Notes

- **Always use `SAS_EXPRESS_BIND_HOST=0.0.0.0`** in Docker
- Use service names for internal communication
- Use `host.docker.internal` to access host services

## Configuration Validation

### Testing Configuration

```bash
# Test connection
curl http://localhost:8080/blocks/head

# Check metrics (if enabled)
curl http://localhost:8080/metrics

# Verify node connection
curl http://localhost:8080/node/version
```

### Common Issues

**Connection refused:**
- Check `SAS_SUBSTRATE_URL` is reachable
- Verify WebSocket/HTTP protocol matches node

**Docker networking:**
- Ensure `SAS_EXPRESS_BIND_HOST=0.0.0.0`
- Check port mapping: `-p host_port:container_port`

**Type errors:**
- Add custom types with `SAS_SUBSTRATE_TYPES*` variables
- Use type bundle generator for complex chains

**Performance:**
- Enable caching: `SAS_SUBSTRATE_CACHE_CAPACITY=1000`
- Tune keep-alive: `SAS_EXPRESS_KEEP_ALIVE_TIMEOUT=30000`
- Monitor metrics for bottlenecks

## Complete Example

Full production configuration:

```bash
#!/bin/bash
# Production Sidecar Configuration

# Server
export SAS_EXPRESS_BIND_HOST=0.0.0.0
export SAS_EXPRESS_PORT=8080
export SAS_EXPRESS_KEEP_ALIVE_TIMEOUT=30000
export SAS_EXPRESS_MAX_BODY=500kb

# Blockchain connection
export SAS_SUBSTRATE_URL=wss://polkadot-rpc.polkadot.io
export SAS_SUBSTRATE_CACHE_CAPACITY=2000

# Asset Hub multi-chain setup
export SAS_SUBSTRATE_MULTI_CHAIN_URL='[
  {"url":"wss://polkadot-asset-hub-rpc.polkadot.io","type":"assethub"},
  {"url":"wss://polkadot-rpc.polkadot.io","type":"relay"}
]'

# Logging
export SAS_LOG_LEVEL=info
export SAS_LOG_JSON=true
export SAS_LOG_WRITE=true
export SAS_LOG_WRITE_PATH=/var/log/sidecar
export SAS_LOG_WRITE_MAX_FILE_SIZE=10485760  # 10MB
export SAS_LOG_FILTER_RPC=true

# Metrics
export SAS_METRICS_ENABLED=true
export SAS_METRICS_PROM_HOST=0.0.0.0
export SAS_METRICS_PROM_PORT=9100
export SAS_METRICS_LOKI_HOST=loki.monitoring.svc
export SAS_METRICS_LOKI_PORT=3100

# Start sidecar
substrate-api-sidecar
```

---

For more specific chain integration, see the [Chain Integration Guide](https://github.com/paritytech/substrate-api-sidecar/blob/master/guides/CHAIN_INTEGRATION.md).