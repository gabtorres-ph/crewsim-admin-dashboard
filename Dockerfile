# syntax=docker/dockerfile:1

ARG NIXPACKS_NODE_VERSION=24

FROM node:${NIXPACKS_NODE_VERSION}-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_USE_MOCK_API=false
ENV VITE_USE_MOCK_API=${VITE_USE_MOCK_API}

RUN npm run build

FROM node:${NIXPACKS_NODE_VERSION}-alpine AS runtime

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY vite.preview.config.ts ./
COPY --from=build /app/dist ./dist

ENV NODE_ENV=production \
    PORT=8080 \
    CORE_API_URL=http://api:8000 \
    CF_ACCESS_CLIENT_ID= \
    CF_ACCESS_CLIENT_SECRET=

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget --quiet --spider "http://127.0.0.1:${PORT}/healthz"

CMD ["npm", "start"]
