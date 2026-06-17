# syntax=docker/dockerfile:1

# ---- Build ----
FROM node:22-slim AS build
WORKDIR /app

# VITE_API_URL is baked into the client bundle (empty = relative same-origin /api).
# API_PROXY_TARGET is where the Nitro server forwards /api at runtime.
ARG VITE_API_URL=
ARG API_PROXY_TARGET=http://localhost:5256
ENV VITE_API_URL=$VITE_API_URL \
    API_PROXY_TARGET=$API_PROXY_TARGET

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Runtime (Nitro node-server output is self-contained) ----
FROM node:22-slim AS final
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/analog/server/index.mjs"]
