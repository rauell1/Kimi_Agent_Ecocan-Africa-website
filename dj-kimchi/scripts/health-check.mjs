#!/usr/bin/env node

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
const QUIET = process.argv.includes("--quiet");

const COLORS = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

function log(msg, color = "reset") {
  if (!QUIET) console.log(`${COLORS[color]}${msg}${COLORS.reset}`);
}

function logSection(title) {
  log(`\n${"─".repeat(60)}`);
  log(`${title}`, "blue");
  log(`${"─".repeat(60)}`);
}

async function exists(p) {
  try {
    await fsp.access(p);
    return true;
  } catch {
    return false;
  }
}

async function readJsonSafe(filePath) {
  try {
    const raw = await fsp.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function checkProjectSetup(dirName) {
  const dirPath = path.join(ROOT, dirName);
  const status = { dirName, checks: {} };

  // Check package.json exists
  const pkgPath = path.join(dirPath, "package.json");
  const pkg = await readJsonSafe(pkgPath);
  status.checks.packageJson = !!pkg;
  if (!pkg) return status;

  status.packageName = pkg.name;
  status.version = pkg.version;

  // Check node_modules or lock file (is installed?)
  const hasNodeModules = await exists(path.join(dirPath, "node_modules"));
  const hasLock =
    (await exists(path.join(dirPath, "package-lock.json"))) ||
    (await exists(path.join(dirPath, "bun.lock"))) ||
    (await exists(path.join(dirPath, "yarn.lock"))) ||
    (await exists(path.join(dirPath, "pnpm-lock.yaml")));
  status.checks.dependencies = hasNodeModules || hasLock;

  // Check for Next.js projects
  if (pkg.dependencies?.next || pkg.devDependencies?.next) {
    const hasPrisma = await exists(path.join(dirPath, "prisma"));
    const hasSchema = await exists(path.join(dirPath, "prisma", "schema.prisma"));
    status.checks.prismaSchema = hasSchema;

    const hasNext = await exists(path.join(dirPath, ".next"));
    status.checks.nextBuild = hasNext;

    // Check middleware.ts
    const hasMiddleware = await exists(path.join(dirPath, "src", "middleware.ts"));
    status.checks.middleware = hasMiddleware;
  }

  // Check Vite projects
  if (pkg.dependencies?.vite || pkg.devDependencies?.vite) {
    const hasDist = await exists(path.join(dirPath, "dist"));
    status.checks.viteBuild = hasDist;
  }

  // Check for env files
  const envLocal = await exists(path.join(dirPath, ".env.local"));
  const envExample = await exists(path.join(dirPath, ".env.example"));
  status.checks.envLocalOrExample = envLocal || envExample;

  // Check for build scripts
  const scripts = pkg.scripts || {};
  status.checks.hasBuild = !!scripts.build;
  status.checks.hasDev = !!scripts.dev || !!scripts.start;

  return status;
}

function reportProjectStatus(status) {
  const checks = Object.entries(status.checks);
  const passed = checks.filter(([_, v]) => v).length;
  const total = checks.length;
  const percentage = Math.round((passed / total) * 100);

  const statusColor = percentage === 100 ? "green" : percentage >= 75 ? "yellow" : "red";
  const statusSymbol = percentage === 100 ? "✓" : percentage >= 75 ? "⚠" : "✗";

  log(`${statusSymbol} ${status.dirName.padEnd(25)} (${status.packageName})`);
  log(`  Version: ${status.version}, Status: ${passed}/${total} (${percentage}%)`, statusColor);

  for (const [check, passed] of checks) {
    const symbol = passed ? "  ✓" : "  ✗";
    const color = passed ? "green" : "red";
    log(`${symbol} ${check}`, color);
  }
}

async function checkProjectBuild(dirName) {
  const dirPath = path.join(ROOT, dirName);
  const pkgPath = path.join(dirPath, "package.json");
  const pkg = await readJsonSafe(pkgPath);

  if (!pkg) return null;

  const scripts = pkg.scripts || {};
  if (!scripts.build) return null;

  try {
    const output = execSync(`cd "${dirPath}" && npm run build --if-present 2>&1`, {
      timeout: 30000,
      encoding: "utf8",
    });
    return { success: true, output: output.slice(0, 200) };
  } catch (err) {
    return { success: false, error: err.message.slice(0, 200) };
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
  logSection("Project Health Check");

  const topDirs = await listTopLevelDirectories();
  const results = [];

  for (const d of topDirs) {
    const status = await checkProjectSetup(d);
    if (status.packageName) {
      results.push(status);
      reportProjectStatus(status);
    }
  }

  const totalProjects = results.length;
  const fullHealthProjects = results.filter((r) => Object.values(r.checks).every((c) => c)).length;

  logSection("Summary");
  log(`Total Projects: ${totalProjects}`);
  log(`Fully Healthy: ${fullHealthProjects}/${totalProjects}`, fullHealthProjects === totalProjects ? "green" : "yellow");

  const allSetupRequired = results.filter((r) => !r.checks.dependencies);
  if (allSetupRequired.length > 0) {
    log("\nProjects needing npm install:");
    for (const p of allSetupRequired) {
      log(`  - ${p.dirName}`, "yellow");
    }
    log("\nRun: npm run health:setup", "yellow");
  }

  const allBuildRequired = results.filter((r) => {
    const nextProject = r.checks.prismaSchema !== undefined;
    return nextProject && !r.checks.nextBuild;
  });
  if (allBuildRequired.length > 0) {
    log("\nProjects needing npm run build:");
    for (const p of allBuildRequired) {
      log(`  - ${p.dirName}`, "yellow");
    }
    log("\nRun: npm run health:build (will auto-install dependencies)", "yellow");
  }

  log(`\nQuick actions:`);
  log(`  Setup all:   npm run health:setup`);
  log(`  Build all:   npm run health:build`);
  log(`  Check again: npm run health:check`);

  const hasIssues = fullHealthProjects < totalProjects;
  process.exit(hasIssues ? 1 : 0);
}

main().catch((err) => {
  log(`Health check failed: ${err.message}`, "red");
  process.exit(1);
});
