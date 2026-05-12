import { spawn } from 'child_process';
import { existsSync } from 'fs';

const SERVER_CMD = 'node';
const SERVER_ARGS = ['.next/standalone/server.js'];

function runServer() {
  return new Promise((resolve) => {
    console.log('[keep-alive] Starting server on port 3000...');
    const child = spawn(SERVER_CMD, SERVER_ARGS, {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
        NODE_OPTIONS: '--max-old-space-size=256'
      }
    });

    child.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    child.on('close', (code) => {
      console.log(`[keep-alive] Server exited with code ${code}, restarting in 1s...`);
      setTimeout(() => resolve(runServer()), 1000);
    });

    child.on('error', (err) => {
      console.error('[keep-alive] Server error:', err.message);
      setTimeout(() => resolve(runServer()), 2000);
    });
  });
}

runServer().catch(console.error);
