FROM node:20-alpine as builder

WORKDIR /opt/builder

COPY . .

RUN yarn install && \
    yarn build

# ---------------------------------

FROM node:20-alpine

# Environment variables with defaults
ARG SAS_EXPRESS_BIND_HOST=0.0.0.0
ARG SAS_EXPRESS_PORT=8080
ARG SAS_SUBSTRATE_URL
ARG SAS_SUBSTRATE_TYPES_BUNDLE="/usr/src/app/dataavail.types.json"

ENV SAS_EXPRESS_BIND_HOST=${SAS_EXPRESS_BIND_HOST} \
    SAS_EXPRESS_PORT=${SAS_EXPRESS_PORT} \
    SAS_SUBSTRATE_URL=${SAS_SUBSTRATE_URL} \
    SAS_SUBSTRATE_TYPES_BUNDLE=${SAS_SUBSTRATE_TYPES_BUNDLE}

WORKDIR /usr/src/app

# Copy built files from builder stage
COPY --from=builder /opt/builder /usr/src/app

USER node
EXPOSE ${SAS_EXPRESS_PORT}

CMD ["node", "build/src/main.js"]
