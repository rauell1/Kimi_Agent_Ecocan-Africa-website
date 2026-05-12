#!/usr/bin/env node

import fsp from "node:fs/promises";

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
};

async function readJsonSafe(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function listTopLevelDirectories() {
  const entries = await fsp.readdir(ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .filter((e) => !e.name.startsWith("."))
    .filter((e) => !["node_modules", "dist", "build", "examples", "prisma", "public", "scripts", "src"].includes(e.name))
    .map((e) => e.name)
    .sort();
}

async function main() {
  const topDirs = await listTopLevelDirectories();
  const failed = [];
  const skipped = [];

  console.log(`${COLORS.blue}Installing dependencies across all projects...${COLORS.reset}\n`);

  for (const dir of topDirs) {
    const dirPath = path.join(ROOT, dir);
    const pkgPath = path.join(dirPath, "package.json");
    const pkg = await readJsonSafe(pkgPath);

    if (!pkg) {
      skipped.push(dir);
      continue;
    }

    console.log(`${COLORS.green}→ ${dir}${COLORS.reset}`);
    try {
      execSync(`cd "${dirPath}" && npm install`, { stdio: "inherit" });
    } catch (err) {
      console.error(`  ${COLORS.yellow}Failed to install in ${dir}${COLORS.reset}`);
      console.error(`  Error: ${err.message.split("\n")[0]}`);
      failed.push(dir);
    }
  }

  console.log(`\n${COLORS.blue}Setup Summary${COLORS.reset}`);
  console.log(`  Total projects: ${topDirs.length}`);
  console.log(`  ${COLORS.green}Succeeded: ${topDirs.length - failed.length - skipped.length}${COLORS.reset}`);
  if (skipped.length > 0) console.log(`  Skipped (no package.json): ${skipped.length}`);
  if (failed.length > 0) {
    console.log(`  ${COLORS.yellow}Failed: ${failed.length} (${failed.join(", ")})${COLORS.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${COLORS.green}All installations complete!${COLORS.reset}`);
  }
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
