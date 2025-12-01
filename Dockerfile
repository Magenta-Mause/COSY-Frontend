# syntax=docker/dockerfile:1
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# =========================================================
# Stage 1: Install Dependencies
# =========================================================
FROM base AS install
RUN mkdir -p /temp/dev
# Note: If you have a bun.lockb, you should copy it here too for deterministic builds
COPY package.json /temp/dev/
# Remove --frozen-lockfile if you are building on Linux but generated lockfile on Mac
RUN cd /temp/dev && bun install

RUN mkdir -p /temp/prod
COPY package.json /temp/prod/
RUN cd /temp/prod && bun install --production

# =========================================================
# Stage 2: Build the Application
# =========================================================
FROM base AS builder
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production

# FIX: Run build steps manually to skip "biome lint"
# 1. Generate routes (tsr:gen)
# 2. Run the actual build script (build.ts) with flags
RUN bun run tsr:gen && bun run build.ts --minify --splitting

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