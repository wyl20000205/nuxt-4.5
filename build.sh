#!/usr/bin/env sh
#需要sshpass包
set -eu

source_dir=$(dirname "$(realpath "$0")")
remote='root@8.219.63.91'
remote_dir='/home/wyl'
password='Mm123456789@'
export SSHPASS="$password"
command -v sshpass >/dev/null 2>&1 || {
  echo '缺少 sshpass，请先安装' >&2
  exit 1
}
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

rsync -az --progress \
  -e 'sshpass -e ssh -o StrictHostKeyChecking=accept-new' \
  "$source_dir/.output.zip" \
  "$remote:$remote_dir/.output.zip"
sshpass -e ssh -o StrictHostKeyChecking=accept-new "$remote" "
  set -eu
  cd '$remote_dir'
  ./load_blog.sh
  rm -rf blog/server/_public
  cp -R blog/public blog/server/_public
"
mkdir -p "$source_dir/_public"
rsync -az --delete --progress \
  -e 'sshpass -e ssh -o StrictHostKeyChecking=accept-new' \
  "$remote:$remote_dir/blog/server/_public/" \
  "$source_dir/_public/"
