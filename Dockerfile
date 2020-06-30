FROM node:12 as builder
LABEL author="chevdor@gmail.com"

WORKDIR /opt/builder

RUN echo 1 && \
    echo 2 && \
    echo 3

COPY . .
RUN yarn install && \
    yarn build

# ---------------------------------

FROM node:12-alpine
WORKDIR /usr/src/app

COPY --from=builder /opt/builder /usr/src/app

ENV SAS_MAIN_PORT=3000

EXPOSE ${SAS_MAIN_PORT}
CMD [ "node", "build/src/main.js" ]
