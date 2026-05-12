#!/bin/bash
cd /home/z/my-project
exec 0</dev/null
exec 1>/home/z/my-project/server-loop.log
exec 2>/home/z/my-project/server-loop.log
while true; do
  PORT=3000 NODE_OPTIONS='--max-old-space-size=128' node .next/standalone/server.js
  echo "Server exited, restarting..." 
  sleep 2
done
