#!/bin/bash

. ./.env.development.local
export NPMRC_REGISTRY=$NPMRC_REGISTRY
pnpm upgrade -L --lockfile-only
bun i
bun update
