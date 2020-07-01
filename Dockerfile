FROM node:latest AS node_base
FROM rust AS rust_base
COPY --from=node_base . .
WORKDIR /sidecar
COPY . .
RUN cargo install wasm-pack
RUN yarn
RUN yarn run build
#TODO: add builder patter (multi-stage build) to reduce image size
# second stage
#FROM node:latest
#WORKDIR /sidecar
#COPY --from=rustbase /sidecar /sidecar
EXPOSE 8080/tcp
CMD ["yarn", "run", "main"]
