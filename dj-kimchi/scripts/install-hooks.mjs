#!/usr/bin/env node
/**
 * install-hooks.mjs
 *
 * Copies scripts/hooks/* into .git/hooks/ and marks them executable.
 * Run once per clone: npm run hooks:install
 */

import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const HOOKS_SRC = path.join(__dirname, "hooks");
const HOOKS_DST = path.join(ROOT, ".git", "hooks");

async function main() {
  // Verify we're inside a git repo
  try {
    await fsp.access(HOOKS_DST);
  } catch {
    console.error("[hooks] .git/hooks directory not found. Are you in a git repo?");
    process.exit(1);
  }

  const files = await fsp.readdir(HOOKS_SRC);

  for (const file of files) {
    const src = path.join(HOOKS_SRC, file);
    const dst = path.join(HOOKS_DST, file);

    await fsp.copyFile(src, dst);
    // chmod +x
    await fsp.chmod(dst, 0o755);
    console.log(`[hooks] Installed: .git/hooks/${file}`);
  }

  console.log("[hooks] All hooks installed successfully.");
  console.log("[hooks] The codebase map will now auto-regenerate after every commit.");
}

main().catch((err) => {
  console.error("[hooks] Error:", err.message);
  process.exit(1);
});
