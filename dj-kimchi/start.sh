#!/bin/bash
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting Next.js production server..."
  node .next/standalone/server.js >> /home/z/my-project/dev.log 2>&1
  echo "[$(date)] Server exited with code $?. Restarting in 2s..."
  sleep 2
done
