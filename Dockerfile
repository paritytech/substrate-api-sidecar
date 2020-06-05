FROM node:current-slim
RUN mkdir -p /code
WORKDIR /code
ADD . /code
RUN npm install -g -s --no-progress && \
    yarn && \
    yarn run build && \
    yarn cache clean
CMD [ "yarn", "start" ]
EXPOSE 8080