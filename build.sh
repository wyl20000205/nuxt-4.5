#!/usr/bin/env sh
set -eu

source_dir=$(CDPATH= cd "$(dirname "$0")" && pwd -P)
mkdir -p /root/projects
build_dir=$(mktemp -d /root/projects/blog-build.XXXXXX)
trap 'rm -rf -- "$build_dir"' EXIT HUP INT TERM

tar -C "$source_dir" \
  --exclude='./.git' \
  --exclude='./.nuxt' \
  --exclude='./.output' \
  --exclude='./.output.zip*' \
  --exclude='./generated' \
  --exclude='./node_modules' \
  -cf "$build_dir/source.tar" .
tar -C "$build_dir" -xf "$build_dir/source.tar"
rm "$build_dir/source.tar"

cd "$build_dir"
bun install
bun run build
zip -qr .output.zip .output

cp .output.zip "$source_dir/.output.zip.tmp"
mv "$source_dir/.output.zip.tmp" "$source_dir/.output.zip"
