# syntax=docker/dockerfile:1

ARG NIXPACKS_NODE_VERSION=24
ARG NGINX_IMAGE=nginxinc/nginx-unprivileged:stable-alpine

FROM node:${NIXPACKS_NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_USE_MOCK_API=false
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL} \
    VITE_USE_MOCK_API=${VITE_USE_MOCK_API}

RUN npm run build

FROM ${NGINX_IMAGE} AS runtime

COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

ENV CORE_API_URL=http://api:8000 \
    CF_ACCESS_CLIENT_ID= \
    CF_ACCESS_CLIENT_SECRET=

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD ["wget", "--quiet", "--spider", "http://127.0.0.1:8080/healthz"]
