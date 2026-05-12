#!/bin/bash
cd /home/z/my-project
while true; do
  node .next/standalone/server.js -p 3000 >/dev/null 2>&1
  sleep 0.5
done
