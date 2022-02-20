FROM node:14.15-alpine3.13 AS node
FROM 20.10.8-dind-alpine3.13

COPY --from=node /usr/lib /usr/lib
COPY --from=node /usr/local/share /usr/local/share
COPY --from=node /usr/local/lib /usr/local/lib
COPY --from=node /usr/local/include /usr/local/include
COPY --from=node /usr/local/bin /usr/local/bin

RUN apk add docker-compose

COPY package.json .
COPY node_modules ./node_modules
COPY imports ./imports
COPY out ./out
COPY public ./public
COPY next.config.js ./next.config.js

ENV PORT 3007
ENV DOCKER 1

EXPOSE 3007
ENTRYPOINT ["npm", "start", "--", "-p", "3007"]
