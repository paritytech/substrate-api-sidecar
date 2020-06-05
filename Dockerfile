FROM node:current-slim
RUN mkdir -p /code
WORKDIR /code
ADD . /code
RUN yarn install && \
    yarn run build && \
    yarn cache clean
CMD [ "yarn", "start" ]
EXPOSE 8080