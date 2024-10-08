# Build stage
FROM kikikanri/node22:base-alpine AS build-stage

## Set args, envs and workdir
ARG NPM_CONFIG_REGISTRY
ENV NPM_CONFIG_REGISTRY=${NPM_CONFIG_REGISTRY}
WORKDIR /app

## Install packages
COPY ./.npmrc ./package.json ./pnpm-lock.yaml ./
RUN --mount=id=pnpm-store,target=/pnpm/store,type=cache pnpm i --frozen-lockfile

## Set production env
ENV NODE_ENV=production

## Copy files and build
COPY ./ ./
RUN pnpm run prepare:production
RUN pnpm run type-check
RUN pnpm run build

# Runtime stage
FROM node:22-alpine

## Set args, envs and workdir
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=8000
WORKDIR /app

## Set timezone and upgrade packages
RUN apk update && apk upgrade --no-cache
RUN apk add -lu --no-cache tzdata && ln -s /usr/share/zoneinfo/Asia/Taipei /etc/localtime

## Copy files
COPY --from=build-stage /app/.output/server ./
COPY ./production-run-cluster.mjs ./

## Set cmd
CMD ["node", "./production-run-cluster.mjs"]
