#!/bin/bash
cd /home/z/my-project
while true; do
  PORT=3001 NODE_OPTIONS="--max-old-space-size=128" node .next/standalone/server.js >/dev/null 2>&1
  sleep 0.3
done
