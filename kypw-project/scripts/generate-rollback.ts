/**
 * KYPW Rollback Configuration Auto-Updater
 *
 * This script regenerates rollback.yml with the latest deployment info,
 * project structure analysis, and environment variable tracking.
 *
 * Usage:
 *   bun scripts/generate-rollback.ts
 *
 * The script:
 * 1. Scans the project structure for API routes and database models
 * 2. Reads the current Prisma schema to track database state
 * 3. Scans .env.example for required environment variables
 * 4. Writes an updated rollback.yml with current project state
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

const PROJECT_ROOT = process.cwd();
const ROLLBACK_PATH = join(PROJECT_ROOT, "docs", "rollback.yml");
const SCHEMA_PATH = join(PROJECT_ROOT, "prisma", "schema.prisma");
const ENV_EXAMPLE_PATH = join(PROJECT_ROOT, ".env.example");

// ── Helpers ──────────────────────────────────────────────

function getGitInfo(): { commit: string; branch: string; timestamp: string } {
  try {
    const commit = execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
    const branch = execSync("git branch --show-current", { encoding: "utf-8" }).trim();
    const timestamp = new Date().toISOString();
    return { commit, branch, timestamp };
  } catch {
    return { commit: "unknown", branch: "unknown", timestamp: new Date().toISOString() };
  }
}

function scanApiRoutes(): string[] {
  const routes: string[] = [];
  const apiDir = join(PROJECT_ROOT, "src", "app", "api");

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (entry === "route.ts") {
        const routePath = relative(apiDir, dir).replace(/\\/g, "/");
        routes.push(`/${routePath}`);
      }
    }
  }

  walk(apiDir);
  return routes;
}

function scanModels(): string[] {
  if (!existsSync(SCHEMA_PATH)) return [];
  const schema = readFileSync(SCHEMA_PATH, "utf-8");
  const modelRegex = /^model\s+(\w+)/gm;
  const models: string[] = [];
  let match;
  while ((match = modelRegex.exec(schema)) !== null) {
    models.push(match[1]);
  }
  return models;
}

function scanEnvVars(): { required: string[]; optional: string[] } {
  if (!existsSync(ENV_EXAMPLE_PATH)) return { required: [], optional: [] };
  const content = readFileSync(ENV_EXAMPLE_PATH, "utf-8");
  const required: string[] = [];
  const optional: string[] = [];

  for (const line of content.split("\n")) {
    const match = line.match(/^(?:#\s*)?([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      if (line.includes("(Optional")) {
        optional.push(match[1]);
      } else if (!line.startsWith("#")) {
        required.push(match[1]);
      }
    }
  }

  return { required, optional };
}

// ── Main ────────────────────────────────────────────────

function generateRollback() {
  const git = getGitInfo();
  const apiRoutes = scanApiRoutes();
  const models = scanModels();
  const envVars = scanEnvVars();

  const yaml = `# ──────────────────────────────────────────────────────────────
# KYPW Rollback Configuration
# ──────────────────────────────────────────────────────────────
# Auto-updated by: bun scripts/generate-rollback.ts
# Last updated: ${git.timestamp}
# Git commit: ${git.commit} (${git.branch})
#
# This file tracks every deployment snapshot and provides
# one-command rollback instructions for Vercel + Supabase.
#
# USAGE:
#   bun run rollback                → View this file
#   vercel rollback <deployment-id> → Roll back to a specific deploy
#
# ──────────────────────────────────────────────────────────────

project:
  name: "kypw-website"
  repo: "KYPW Kenya Youth Parliament for Water"
  framework: "nextjs"
  runtime: "nodejs20.x"
  database: "supabase-postgresql"
  version: "0.2.0"

git:
  commit: "${git.commit}"
  branch: "${git.branch}"
  last_updated: "${git.timestamp}"

deployment:
  platform: "vercel"
  region: "iad1"
  build_command: "npx prisma generate && next build"
  install_command: "npm install"
  output_directory: ".next/standalone"

environment:
  required:
${envVars.required.map((v) => `    - ${v}`).join("\n")}
  optional:
${envVars.optional.map((v) => `    - ${v}`).join("\n")}

database:
  provider: "postgresql"
  host: "supabase"
  tool: "prisma"
  schema_path: "prisma/schema.prisma"
  migrations_path: "prisma/migrations"
  sync_command: "prisma db push --skip-generate"
  migrate_command: "prisma migrate deploy"
  reset_command: "prisma migrate reset"
  models:
${models.map((m) => `    - ${m}`).join("\n")}

api_routes: ${apiRoutes.length}
${apiRoutes.map((r) => `  - "${r}"`).join("\n")}

rollback:
  strategy: "vercel-deployment-rollback"
  steps:
    - name: "Check current deployment"
      command: "vercel ls --limit 1"
    - name: "List recent deployments"
      command: "vercel ls --limit 10"
    - name: "Rollback to specific deployment"
      command: "vercel rollback <deployment-id>"
      note: "Vercel keeps all previous deployments. Rolling back is instant."
    - name: "Rollback database (if schema changed)"
      command: "prisma migrate resolve --rolled-back <migration-name>"
      note: "Only needed if the rollback deployment expects an older schema."
      warning: "Data loss may occur. Always backup before rolling back migrations."

backup:
  strategy: "supabase-point-in-time"
  notes:
    - "Supabase provides automatic daily backups for Pro plan and above"
    - "Enable Point-in-Time Recovery (PITR) in Supabase Dashboard > Settings > Database"
    - "Manual backup: Supabase Dashboard > Database > Backups > Create backup"
    - "CLI backup: supabase db dump --data-only > backup-$(date +%Y%m%d).sql"

snapshots: []
# Auto-populated by deployment pipeline. Example entry:
# - id: "dep_abc123xyz"
#   timestamp: "${git.timestamp}"
#   commit: "${git.commit}"
#   branch: "${git.branch}"
#   message: "Current state snapshot"
#   vercel_url: "kypw-website.vercel.app"
#   status: "ready"
#   api_routes: ${apiRoutes.length}
#   db_models: ${models.length}
`;

  writeFileSync(ROLLBACK_PATH, yaml.trim() + "\n", "utf-8");
  console.log(`✅ rollback.yml updated (${git.commit} @ ${git.timestamp})`);
  console.log(`   API routes: ${apiRoutes.length}`);
  console.log(`   DB models: ${models.length}`);
  console.log(`   Env vars: ${envVars.required.length} required, ${envVars.optional.length} optional`);
}

generateRollback();
