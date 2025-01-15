# Avail Sidecar API Docker Image

The Avail Sidecar API is available as Docker images for both mainnet and testnet environments. Images are published to Docker Hub at [availj/sidecar-api](https://hub.docker.com/r/availj/sidecar-api).

## Using Pre-built Images

### Mainnet

```bash
# Latest mainnet version
docker pull availj/sidecar-api:mainnet

# Specific version
docker pull availj/sidecar-api:v1.0.0-mainnet
```

### Testnet (Turing)

```bash
# Latest testnet version
docker pull availj/sidecar-api:testnet

# Specific version
docker pull availj/sidecar-api:v1.0.0-testnet
```

## Running the Container

### Mainnet

```bash
docker run --rm -it --read-only -p 8080:8080 availj/sidecar-api:mainnet
```

### Testnet

```bash
docker run --rm -it --read-only -p 8080:8080 availj/sidecar-api:testnet
```

### Using Environment Variables

You can override default settings using environment variables:

```bash
docker run --rm -it --read-only \
  -e SAS_EXPRESS_PORT=8081 \
  -e SAS_EXPRESS_BIND_HOST=0.0.0.0 \
  -p 8081:8081 \
  availj/sidecar-api:mainnet
```

Available environment variables:
- `SAS_EXPRESS_PORT`: Port number (default: 8080)
- `SAS_EXPRESS_BIND_HOST`: Bind address (default: 0.0.0.0)
- `SAS_SUBSTRATE_URL`: RPC endpoint URL (preset based on mainnet/testnet tag)

## Building from Source

1. Clone the repository
2. Build the Docker image:

```bash
# For mainnet
docker build -t availj/sidecar-api:local-mainnet \
  --build-arg SAS_SUBSTRATE_URL=wss://mainnet-rpc.avail.so/ws \
  .

# For testnet
docker build -t availj/sidecar-api:local-testnet \
  --build-arg SAS_SUBSTRATE_URL=wss://turing-rpc.avail.so/ws \
  .
```

## Testing the API

After running the container, you can test the API:

```bash
# Get the latest block
curl -s http://localhost:8080/blocks/head | jq

# Get a specific block
curl -s http://localhost:8080/blocks/1 | jq
```

## Production Usage Notes

- Always use the `--read-only` flag in production for enhanced security
- Consider using specific version tags instead of `latest` for reproducible deployments
- For production deployments, it's recommended to:
  - Set up proper logging
  - Configure health checks
  - Use Docker secrets for sensitive configurations
  - Implement appropriate monitoring

## Development Tips

- Use the `testnet` tag for development and testing
- For local development, you can mount local files using volumes:
```bash
docker run --rm -it --read-only \
  -v $(pwd)/config:/usr/src/app/config \
  -p 8080:8080 \
  availj/sidecar-api:testnet
```
