#!/usr/bin/env sh 
#apt install inotify-tools
# nohup ./watch_jiuyin.sh > watch_jiuyin.log 2>&1 &
# jobs -l && kill xxx
set -eu

inotifywait -m -e close_write,moved_to --format '%f' /home/wyl |
while IFS= read -r changed; do
  [ "$changed" = ".output.zip" ] || continue
  cd /home/wyl
  ./load_jiuyin.sh
done