#!/usr/bin/env sh
set -eu

rm -rf .output .nuxt node_modules
bun i
bun run build
zip -r .output.zip .output
rm -rf .output .nuxt node_modules
