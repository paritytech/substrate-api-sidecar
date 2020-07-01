FROM node:latest AS node_base
FROM rust AS rust_base
COPY --from=node_base . .
WORKDIR /sidecar
COPY . .

# Endpoint of the node we are connected to
ARG SAS_SUBSTRATE_WS_URL=wss://rpc.polkadot.io
ENV SAS_SUBSTRATE_WS_URL=${SAS_SUBSTRATE_WS_URL}
# Name of the node we are connected to for our own clarity
ARG SAS_SUBSTRATE_NAME="Polkadot Public Parity Node"
ENV SAS_SUBSTRATE_NAME=${SAS_SUBSTRATE_NAME}
# Express Port
ARG SAS_EXPRESS_BIND_PORT=8080
ENV SAS_EXPRESS_BIND_PORT=${SAS_EXPRESS_BIND_PORT}
#Change host for docker config
ARG SAS_EXPRESS_BIND_HOST=0.0.0.0
ENV SAS_EXPRESS_BIND_HOST=${SAS_EXPRESS_BIND_HOST}

RUN cargo install wasm-pack
RUN yarn
RUN NODE_ENV=docker yarn run build
#TODO: add builder patter (multi-stage build) to reduce image size
# second stage
#FROM node:latest
#WORKDIR /sidecar
#COPY --from=rustbase /sidecar /sidecar
EXPOSE 8080/tcp
CMD ["yarn", "run", "main"]
