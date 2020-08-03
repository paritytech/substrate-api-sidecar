FROM node:12 as builder
LABEL author="chevdor@gmail.com"

WORKDIR /opt/builder

COPY . .
RUN curl --proto '=https' --tlsv1.2 https://sh.rustup.rs -sSf | sh -s -- -y && \
    . $HOME/.cargo/env && \
    cargo install wasm-pack && \
    yarn install && \
    yarn build

# ---------------------------------

FROM node:12-alpine
WORKDIR /usr/src/app

COPY --from=builder /opt/builder /usr/src/app

ENV SAS_EXPRESS_PORT=8080
ENV SAS_EXPRESS_BIND_HOST=0.0.0.0

EXPOSE ${SAS_EXPRESS_PORT}
CMD [ "node", "build/src/main.js" ]
