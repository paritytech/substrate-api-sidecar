## substrate-api-sidecar Docker Image

With each release, the maintainers publish a docker image to dockerhub at [parity/substrate-api-sidecar](https://hub.docker.com/r/parity/substrate-api-sidecar/tags?page=1&ordering=last_updated)

### Pull the latest release

```bash
docker pull docker.io/parity/substrate-api-sidecar:latest
```

The specific image tag matches the release version.

### Or build from source

```bash
yarn build:docker
```

### Run

```bash
# For default use run:
docker run --rm -it --read-only -p 8080:8080 substrate-api-sidecar

# Or if you want to use environment variables set in `.env.docker`, run:
docker run --rm -it --read-only --env-file .env.docker -p 8080:8080 substrate-api-sidecar
```

**NOTE**: While you could omit the `--read-only` flag, it is **strongly recommended for containers used in production**.

then you can test with:

```bash
curl -s http://0.0.0.0:8080/blocks/head | jq
```

**N.B.** The docker flow presented here is just a sample to help get started. Modifications may be necessary for secure usage.
