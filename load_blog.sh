#!/usr/bin/env sh
rm -rf blog 
unzip .output.zip
mv .output blog
cp -r ./server/public ./server/_public      
docker exec wyl_node pm2 restart blog