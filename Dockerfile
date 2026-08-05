# syntax=docker/dockerfile:1
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# =========================================================
# Stage 1: Install Dependencies
# =========================================================
FROM base AS install
# bun.lock is committed and MUST be copied: without it `bun install` re-resolves every
# caret range at build time, so two builds of the same commit can ship different
# dependency versions. That is invisible day to day, but it makes the image
# non-reproducible — and the systemtest PR gate installs THIS image, so an unchanged PR
# could flip red overnight on a dependency the PR never touched. `--frozen-lockfile`
# matches what lint/test/type-check already do on CI (`bun install --frozen-lockfile`),
# so the image and the checks now resolve identical trees.
#
# There is deliberately no `--production` install here. The release stage is nginx
# serving the static `dist/`, so no node_modules ever reaches the final image — the
# only consumer of this stage is `builder`, which takes /temp/dev/node_modules. A
# second production install was pure build time for an artifact nothing read.
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# =========================================================
# Stage 2: Build the Application
# =========================================================
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
ENV VITE_BACKEND_BROKER_URL=/api/v1/ws
ENV VITE_BACKEND_WEBSOCKET_FACTORY=/api/v1/ws

# Build the application
RUN bun run build

# =========================================================
# Stage 3: Release Image (Nginx)
# =========================================================
FROM nginx:alpine AS release

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy static assets from builder stage
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Custom Nginx config for Client-Side Routing
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
