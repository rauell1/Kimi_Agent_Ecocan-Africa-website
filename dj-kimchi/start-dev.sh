#!/bin/bash
cd /home/z/my-project
while true; do
  npx next dev --turbopack -p 3000 2>&1
  sleep 1
done
