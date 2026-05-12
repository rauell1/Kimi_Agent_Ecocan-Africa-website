#!/usr/bin/env node
/**
 * generate-architecture-map.mjs
 *
 * Deep architectural analysis for the dj-kimchi Next.js project.
 *
 * Outputs:
 *   docs/codebase-map.md   — human-readable architecture map
 *   docs/codebase-map.json — machine-readable structure + dependency graph
 *   docs/.map-state.json   — internal file-hash state for incremental updates
 *
 * Usage:
 *   node scripts/generate-architecture-map.mjs           # one-shot
 *   node scripts/generate-architecture-map.mjs --watch   # file-watch mode
 *   node scripts/generate-architecture-map.mjs --force   # skip hash check
 */

import crypto from "node:crypto";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { execSync } from "node:child_process";

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const DOCS_DIR = path.join(ROOT, "docs");
const OUT_MD = path.join(DOCS_DIR, "codebase-map.md");
const OUT_JSON = path.join(DOCS_DIR, "codebase-map.json");
const STATE_FILE = path.join(DOCS_DIR, ".map-state.json");
const WATCH_DEBOUNCE_MS = 800;

/**
 * Directories we never scan.
 * NOTE: `docs` is excluded intentionally — it is the output target of this script.
 * Including it would cause the script to analyse its own output and could trigger
 * self-referential re-runs in watch mode.
 */
const IGNORED_DIRS = new Set([
  ".git", ".next", "node_modules", "dist", "build", "coverage",
  ".turbo", ".cache", ".code-review-graph",
  "docs", // output directory — excluded to prevent self-referential updates
]);

/** File extensions we analyse for imports. */
const CODE_EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

/* ------------------------------------------------------------------ */
/*  Git helpers                                                        */
/* ------------------------------------------------------------------ */

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function getGitMeta() {
  const hash = git("rev-parse HEAD") || "unknown";
  const shortHash = hash.slice(0, 8);
  const branch = git("rev-parse --abbrev-ref HEAD") || "unknown";
  const author = git("log -1 --format=%an <%ae>") || "unknown";
  const commitMsg = git("log -1 --format=%s") || "";
  const timestamp = new Date().toISOString();
  return { hash, shortHash, branch, author, commitMsg, timestamp };
}

/** Returns top-N hotspot files by commit frequency over last N commits. */
function getHotspots(topN = 15, depth = 200) {
  const raw = git(`log --name-only --format='' -${depth}`);
  const counts = new Map();
  for (const line of raw.split("\n")) {
    const f = line.trim();
    if (!f) continue;
    counts.set(f, (counts.get(f) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([file, commitCount]) => ({ file, commitCount }));
}

/** Returns files changed in the last commit. */
function getLastCommitChanges() {
  const raw = git("diff-tree --no-commit-id -r --name-status HEAD");
  const changes = [];
  for (const line of raw.split("\n")) {
    const parts = line.trim().split(/\s+/);
    if (parts.length >= 2) {
      const [status, ...fileParts] = parts;
      changes.push({ status, file: fileParts.join(" ") });
    }
  }
  return changes;
}

/* ------------------------------------------------------------------ */
/*  File-hash helpers (incremental updates)                           */
/* ------------------------------------------------------------------ */

async function hashFile(filePath) {
  try {
    const buf = await fsp.readFile(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
  } catch {
    return null;
  }
}

async function loadState() {
  try {
    const raw = await fsp.readFile(STATE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { hashes: {}, lastCommit: "" };
  }
}

async function saveState(state) {
  await fsp.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

/* ------------------------------------------------------------------ */
/*  File scanning                                                      */
/* ------------------------------------------------------------------ */

async function walkDir(dir, fileList = []) {
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch {
    return fileList;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name) && !entry.name.startsWith(".")) {
        await walkDir(path.join(dir, entry.name), fileList);
      }
    } else if (entry.isFile()) {
      fileList.push(path.join(dir, entry.name));
    }
  }
  return fileList;
}

function toRelative(absPath) {
  return path.relative(ROOT, absPath).split(path.sep).join("/");
}

function toAlias(relPath) {
  // src/... → @/...
  if (relPath.startsWith("src/")) return "@/" + relPath.slice(4);
  return relPath;
}

/* ------------------------------------------------------------------ */
/*  Role detection                                                     */
/* ------------------------------------------------------------------ */

/**
 * Classify a relative file path into a semantic role.
 * Returns one of: page | layout | api-route | component-site |
 *   component-ui | hook | store | lib | config | schema | script | asset | other
 */
function detectRole(relPath) {
  if (relPath.startsWith("src/app/")) {
    if (relPath.match(/\/api\//)) return "api-route";
    if (relPath.endsWith("/layout.tsx") || relPath.endsWith("/layout.ts")) return "layout";
    if (relPath.endsWith("/loading.tsx") || relPath.endsWith("/loading.ts")) return "loading";
    if (relPath.endsWith("/error.tsx") || relPath.endsWith("/error.ts")) return "error";
    if (relPath.endsWith("/page.tsx") || relPath.endsWith("/page.ts")) return "page";
    if (relPath.endsWith("globals.css")) return "styles";
    return "app-file";
  }
  if (relPath.startsWith("src/components/site/")) return "component-site";
  if (relPath.startsWith("src/components/ui/")) return "component-ui";
  if (relPath.startsWith("src/components/")) return "component";
  if (relPath.startsWith("src/hooks/")) return "hook";
  if (relPath.startsWith("src/stores/")) return "store";
  if (relPath.startsWith("src/lib/")) return "lib";
  if (relPath.startsWith("src/types/")) return "types";
  if (relPath.startsWith("prisma/")) return "schema";
  if (relPath.startsWith("scripts/")) return "script";
  if (relPath.match(/\.(config|rc)\.(ts|js|mjs|cjs)$/)) return "config";
  if (relPath.endsWith("package.json") || relPath.endsWith("tsconfig.json")) return "config";
  return "other";
}

/** True if the role is a code file we should parse for imports. */
function isCodeRole(role) {
  return !["styles", "schema", "config", "asset", "other", "script"].includes(role);
}

/* ------------------------------------------------------------------ */
/*  Import parser                                                      */
/* ------------------------------------------------------------------ */

const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s+(?:(?:type\s+)?(?:[^'"]+?)\s+from\s+)?['"]([^'"]+)['"]/g;
const REQUIRE_RE = /require\(['"]([^'"]+)['"]\)/g;

function extractImports(source) {
  const imports = new Set();
  let m;
  IMPORT_RE.lastIndex = 0;
  while ((m = IMPORT_RE.exec(source)) !== null) {
    imports.add(m[1]);
  }
  REQUIRE_RE.lastIndex = 0;
  while ((m = REQUIRE_RE.exec(source)) !== null) {
    imports.add(m[1]);
  }
  return [...imports];
}

/**
 * Resolve an import specifier to a relative project path (or null if external).
 * Returns something like "src/lib/utils" (no extension).
 */
function resolveImport(specifier, _fromRelPath) {
  if (specifier.startsWith("@/")) {
    return "src/" + specifier.slice(2);
  }
  if (specifier.startsWith(".")) {
    // relative — resolve from fromRelPath's directory
    const fromDir = path.dirname(path.join(ROOT, _fromRelPath));
    const resolved = path.relative(ROOT, path.join(fromDir, specifier));
    return resolved.split(path.sep).join("/");
  }
  // external package
  return null;
}

async function parseFileImports(absPath, relPath) {
  try {
    const source = await fsp.readFile(absPath, "utf8");
    const rawImports = extractImports(source);
    const internal = [];
    const external = [];
    for (const spec of rawImports) {
      const resolved = resolveImport(spec, relPath);
      if (resolved) {
        internal.push(resolved);
      } else {
        // Extract top-level package name
        const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0];
        external.push(pkg);
      }
    }
    return { internal: [...new Set(internal)], external: [...new Set(external)] };
  } catch {
    return { internal: [], external: [] };
  }
}

/* ------------------------------------------------------------------ */
/*  Export detection (brief annotation)                               */
/* ------------------------------------------------------------------ */

function detectExports(source) {
  const names = [];
  // export function / export const / export class / export default
  const re = /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|let|var|type|interface|enum)\s+([A-Za-z_$][A-Za-z0-9_$]*)/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    names.push(m[1]);
  }
  // export default (anonymous)
  if (/export\s+default\b/.test(source) && !names.includes("default")) {
    names.push("default");
  }
  return [...new Set(names)];
}

/* ------------------------------------------------------------------ */
/*  Risk flag detection                                               */
/* ------------------------------------------------------------------ */

const CORE_PATTERNS = [
  /src\/lib\/(db|auth|env|rate-limit)/,
  /src\/app\/api\//,
  /src\/stores\//,
  /prisma\/schema/,
];

function isCoreFile(relPath) {
  return CORE_PATTERNS.some((re) => re.test(relPath));
}

/* ------------------------------------------------------------------ */
/*  Main analysis                                                      */
/* ------------------------------------------------------------------ */

async function analyseRepo(force = false) {
  const meta = getGitMeta();
  const state = await loadState();

  // Collect all source files
  const allFiles = await walkDir(ROOT);
  const srcFiles = allFiles.filter((f) => {
    const ext = path.extname(f);
    return CODE_EXTS.has(ext) || f.endsWith(".prisma") || f.endsWith(".css");
  });

  // Compute hashes
  const newHashes = {};
  const changedFiles = [];

  for (const absPath of srcFiles) {
    const rel = toRelative(absPath);
    if (IGNORED_DIRS.has(rel.split("/")[0])) continue;
    const hash = await hashFile(absPath);
    if (hash) {
      newHashes[rel] = hash;
      if (!force && state.hashes[rel] !== hash) {
        changedFiles.push(rel);
      }
    }
  }

  // If nothing changed and commit is the same, skip
  const commitChanged = state.lastCommit !== meta.hash;
  if (!force && changedFiles.length === 0 && !commitChanged) {
    return { skipped: true };
  }

  // Build file nodes
  const nodes = [];
  for (const absPath of srcFiles) {
    const rel = toRelative(absPath);
    if (IGNORED_DIRS.has(rel.split("/")[0])) continue;
    const ext = path.extname(absPath);
    if (!CODE_EXTS.has(ext)) continue;

    const role = detectRole(rel);
    let exports = [];
    let importsData = { internal: [], external: [] };

    if (isCodeRole(role)) {
      try {
        const src = await fsp.readFile(absPath, "utf8");
        exports = detectExports(src);
        importsData = await parseFileImports(absPath, rel);
      } catch { /* skip unreadable */ }
    }

    nodes.push({
      path: rel,
      alias: toAlias(rel),
      role,
      exports,
      imports: importsData,
      isCore: isCoreFile(rel),
      hash: newHashes[rel] ?? null,
      changed: changedFiles.includes(rel),
    });
  }

  // Build dependency graph (internal only)
  const depGraph = {};
  for (const node of nodes) {
    depGraph[node.path] = node.imports.internal;
  }

  // Identify who depends on each file (reverse graph)
  const reverseGraph = {};
  for (const [from, targets] of Object.entries(depGraph)) {
    for (const target of targets) {
      if (!reverseGraph[target]) reverseGraph[target] = [];
      reverseGraph[target].push(from);
    }
  }

  // Hotspots
  const hotspots = getHotspots(15, 200);

  // Risk flags
  const riskFlags = [];
  for (const f of changedFiles) {
    if (isCoreFile(f)) {
      riskFlags.push({ file: f, reason: "Core module modified — review carefully" });
    }
  }

  // External packages used across project
  const extPkgs = new Map();
  for (const n of nodes) {
    for (const p of n.imports.external) {
      extPkgs.set(p, (extPkgs.get(p) ?? 0) + 1);
    }
  }
  const topExtPkgs = [...extPkgs.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([pkg, usages]) => ({ pkg, usages }));

  // Summary of changes since last run
  const lastCommitChanges = getLastCommitChanges();
  const summary = [
    meta.commitMsg,
    ...lastCommitChanges.map((c) => `${c.status}: ${c.file}`),
  ].filter(Boolean);

  const result = {
    meta: {
      version: meta.shortHash,
      commitHash: meta.hash,
      branch: meta.branch,
      author: meta.author,
      timestamp: meta.timestamp,
      summary,
    },
    stats: {
      totalFiles: nodes.length,
      changedFiles: changedFiles.length,
      coreFiles: nodes.filter((n) => n.isCore).length,
    },
    layers: {
      pages: nodes.filter((n) => n.role === "page"),
      layouts: nodes.filter((n) => n.role === "layout"),
      apiRoutes: nodes.filter((n) => n.role === "api-route"),
      componentsSite: nodes.filter((n) => n.role === "component-site"),
      componentsUi: nodes.filter((n) => n.role === "component-ui"),
      components: nodes.filter((n) => n.role === "component"),
      hooks: nodes.filter((n) => n.role === "hook"),
      stores: nodes.filter((n) => n.role === "store"),
      lib: nodes.filter((n) => n.role === "lib"),
    },
    dependencies: {
      graph: depGraph,
      reverseGraph,
      externalPackages: topExtPkgs,
    },
    hotspots,
    riskFlags,
    changedFiles,
  };

  // Save updated state
  await saveState({ hashes: newHashes, lastCommit: meta.hash });

  return result;
}

/* ------------------------------------------------------------------ */
/*  Markdown renderer                                                  */
/* ------------------------------------------------------------------ */

function renderMarkdown(data) {
  const { meta, stats, layers, dependencies, hotspots, riskFlags, changedFiles } = data;

  const lines = [];

  lines.push("# DJ Kimchi — Codebase Architecture Map");
  lines.push("");
  lines.push("> **Auto-Generated.** Do not edit manually.");
  lines.push("> Run `npm run arch:update` to refresh, or it updates automatically on every commit.");
  lines.push("");

  /* Meta */
  lines.push("## Version");
  lines.push("");
  lines.push(`| Field | Value |`);
  lines.push(`|-------|-------|`);
  lines.push(`| Commit | \`${meta.version}\` (\`${meta.commitHash.slice(0, 12)}\`) |`);
  lines.push(`| Branch | \`${meta.branch}\` |`);
  lines.push(`| Author | ${meta.author} |`);
  lines.push(`| Generated | ${meta.timestamp} |`);
  lines.push(`| Total source files | ${stats.totalFiles} |`);
  lines.push(`| Files changed in last commit | ${stats.changedFiles} |`);
  lines.push("");

  if (meta.summary.length > 0) {
    lines.push("### Changes Since Last Version");
    lines.push("");
    for (const s of meta.summary) {
      lines.push(`- ${s}`);
    }
    lines.push("");
  }

  /* Architecture summary */
  lines.push("## Architecture Summary");
  lines.push("");
  lines.push("```");
  lines.push("dj-kimchi/              Next.js 16 DJ portfolio + booking system");
  lines.push("├── src/");
  lines.push("│   ├── app/            Next.js App Router pages & layouts");
  lines.push("│   │   ├── page.tsx    Single-page entrypoint (SPA shell)");
  lines.push("│   │   ├── layout.tsx  Root layout (ThemeProvider + fonts)");
  lines.push("│   │   └── api/        API Routes");
  lines.push("│   │       ├── booking/    POST booking form → DB + Resend email");
  lines.push("│   │       ├── health/     GET health probe (DB + email status)");
  lines.push("│   │       ├── mixcloud-url/ GET stream URL via yt-dlp");
  lines.push("│   │       └── webhooks/   POST inbound webhook handler");
  lines.push("│   ├── components/");
  lines.push("│   │   ├── site/       Domain-specific page sections");
  lines.push("│   │   └── ui/         Shadcn/Radix primitives (40+ components)");
  lines.push("│   ├── hooks/          Custom React hooks (4)");
  lines.push("│   ├── stores/         Zustand audio state store");
  lines.push("│   └── lib/            Shared utilities (db, env, rate-limit, resend)");
  lines.push("├── prisma/             SQLite schema → Booking model");
  lines.push("├── public/             Static assets (images)");
  lines.push("├── scripts/            Tooling scripts (map gen, health, hooks)");
  lines.push("└── docs/               Generated maps (this file)");
  lines.push("```");
  lines.push("");

  /* Codebase tree */
  lines.push("## Codebase Tree");
  lines.push("");

  const renderLayer = (label, nodes) => {
    if (!nodes.length) return;
    lines.push(`### ${label} (${nodes.length})`);
    lines.push("");
    lines.push("| File | Role | Exports | Core? |");
    lines.push("|------|------|---------|-------|");
    for (const n of nodes) {
      const exps = n.exports.slice(0, 4).join(", ") || "—";
      const core = n.isCore ? "⚠️ yes" : "no";
      lines.push(`| \`${n.path}\` | ${n.role} | ${exps} | ${core} |`);
    }
    lines.push("");
  };

  renderLayer("Pages", layers.pages);
  renderLayer("Layouts", layers.layouts);
  renderLayer("API Routes", layers.apiRoutes);
  renderLayer("Site Components", layers.componentsSite);
  renderLayer("UI Primitives", layers.componentsUi);
  if (layers.components.length) renderLayer("Other Components", layers.components);
  renderLayer("Hooks", layers.hooks);
  renderLayer("Stores", layers.stores);
  renderLayer("Library / Utilities", layers.lib);

  /* Entry points */
  lines.push("## Entry Points");
  lines.push("");
  lines.push("| Path | Description |");
  lines.push("|------|-------------|");
  lines.push("| `src/app/page.tsx` | Main SPA shell — renders all sections |");
  lines.push("| `src/app/layout.tsx` | Root layout with ThemeProvider |");
  lines.push("| `src/app/api/booking/route.ts` | Booking API — validation, DB, email |");
  lines.push("| `src/app/api/health/route.ts` | Health probe endpoint |");
  lines.push("| `src/app/api/mixcloud-url/route.ts` | Mixcloud stream resolver (yt-dlp) |");
  lines.push("| `src/stores/audio-store.ts` | Global audio state (Zustand) |");
  lines.push("| `src/lib/site-data.ts` | All static content (mixes, videos, socials) |");
  lines.push("| `prisma/schema.prisma` | Database schema (Booking model) |");
  lines.push("");

  /* Dependency map */
  lines.push("## Dependency Map");
  lines.push("");
  lines.push("### Internal Import Graph");
  lines.push("");
  lines.push("Files with the most dependents (most imported):");
  lines.push("");
  lines.push("| File | Imported by (N files) |");
  lines.push("|------|-----------------------|");

  const depCounts = Object.entries(data.dependencies.reverseGraph)
    .map(([f, importers]) => ({ file: f, count: importers.length }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  for (const { file, count } of depCounts) {
    lines.push(`| \`${file}\` | ${count} |`);
  }
  lines.push("");

  lines.push("### Top External Packages");
  lines.push("");
  lines.push("| Package | Used in N files |");
  lines.push("|---------|-----------------|");
  for (const { pkg, usages } of dependencies.externalPackages.slice(0, 20)) {
    lines.push(`| \`${pkg}\` | ${usages} |`);
  }
  lines.push("");

  /* Hotspots */
  lines.push("## Hotspots (Frequently Modified Files)");
  lines.push("");
  lines.push("Tracks commit frequency over last 200 commits. High count = higher risk of bugs.");
  lines.push("");
  lines.push("| File | Commits |");
  lines.push("|------|---------|");
  for (const { file, commitCount } of hotspots) {
    lines.push(`| \`${file}\` | ${commitCount} |`);
  }
  lines.push("");

  /* Risk flags */
  if (riskFlags.length > 0) {
    lines.push("## ⚠️ Risk Flags");
    lines.push("");
    lines.push("Core files changed in the last commit:");
    lines.push("");
    for (const { file, reason } of riskFlags) {
      lines.push(`- **\`${file}\`** — ${reason}`);
    }
    lines.push("");
  }

  /* Debugging zones */
  lines.push("## Debugging Zones");
  lines.push("");
  lines.push("| Area | Files | Common Issues |");
  lines.push("|------|-------|---------------|");
  lines.push("| Booking API | `src/app/api/booking/route.ts` | Rate limiting, Zod validation, DB/email config |");
  lines.push("| Database layer | `src/lib/db.ts` | Missing DATABASE_URL env, Prisma connection |");
  lines.push("| Audio player | `src/stores/audio-store.ts`, `src/components/site/global-player.tsx` | Mixcloud yt-dlp extraction, stream URL cache |");
  lines.push("| Email | `src/lib/resend.ts` | RESEND_API_KEY not set, rate limit |");
  lines.push("| Env config | `src/lib/env.ts` | Missing .env variables |");
  lines.push("| Health check | `src/app/api/health/route.ts` | DB latency, service status |");
  lines.push("");

  /* Auto-update system */
  lines.push("## Auto-Update System");
  lines.push("");
  lines.push("The map is automatically regenerated via three mechanisms:");
  lines.push("");
  lines.push("| Trigger | Mechanism | Command |");
  lines.push("|---------|-----------|---------|");
  lines.push("| After every commit (local) | Git post-commit hook | auto — install with `npm run hooks:install` |");
  lines.push("| On push/PR to main | GitHub Actions | `.github/workflows/update-codebase-map.yml` |");
  lines.push("| During active development | File watcher | `npm run arch:watch` |");
  lines.push("| Manual refresh | One-shot | `npm run arch:update` |");
  lines.push("");
  lines.push("### Incremental Update Strategy");
  lines.push("");
  lines.push("- Each file is SHA-256 hashed and stored in `docs/.map-state.json`.");
  lines.push("- On next run, only files with changed hashes are flagged as modified.");
  lines.push("- If no file changes AND commit hash is unchanged, generation is skipped.");
  lines.push("- `--force` flag bypasses the hash check for full regeneration.");
  lines.push("");
  lines.push("### Significant Change Criteria");
  lines.push("");
  lines.push("- New or deleted source files");
  lines.push("- Modified API routes, stores, or lib utilities");
  lines.push("- Dependency additions/removals (`package.json` changes)");
  lines.push("- Schema changes (`prisma/schema.prisma`)");
  lines.push("- Import relationship changes");
  lines.push("");

  /* Improvement suggestions */
  lines.push("## Improvement Suggestions");
  lines.push("");
  lines.push("1. **Database persistence** — Set `DATABASE_URL` env var to enable SQLite booking storage.");
  lines.push("2. **Email notifications** — Set `RESEND_API_KEY` env var to enable booking emails.");
  lines.push("3. **Test coverage** — No test suite exists; add Vitest + React Testing Library.");
  lines.push("4. **Type safety for env** — `src/lib/env.ts` could use Zod to validate all env vars at startup.");
  lines.push("5. **Mixcloud fallback** — `yt-dlp` dependency is fragile; add a fallback embed mode.");
  lines.push("6. **Error monitoring** — No Sentry or equivalent; add for production error tracking.");
  lines.push("7. **Rate limiting** — Current in-memory rate limiter resets on restart; consider Redis.");
  lines.push("8. **Auth for admin** — Bookings are publicly readable via DB; add admin dashboard with next-auth.");
  lines.push("");

  return lines.join("\n") + "\n";
}

/* ------------------------------------------------------------------ */
/*  Write outputs                                                      */
/* ------------------------------------------------------------------ */

async function writeOutputs(data) {
  await fsp.mkdir(DOCS_DIR, { recursive: true });

  // Write JSON
  await fsp.writeFile(OUT_JSON, JSON.stringify(data, null, 2), "utf8");

  // Write Markdown
  const md = renderMarkdown(data);
  await fsp.writeFile(OUT_MD, md, "utf8");
}

/* ------------------------------------------------------------------ */
/*  Watch mode                                                         */
/* ------------------------------------------------------------------ */

function isRelevantChange(fileName) {
  if (!fileName) return false;
  const p = fileName.split(path.sep).join("/");
  if (p.startsWith("docs/")) return false;
  if (p.startsWith(".git/")) return false;
  if (p.startsWith("node_modules/")) return false;
  if (p.startsWith(".next/")) return false;
  return true;
}

async function runWatchMode() {
  await runOnce(false);
  let timer = null;
  let running = false;
  let queued = false;

  const schedule = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      if (running) { queued = true; return; }
      running = true;
      try {
        await runOnce(false);
      } finally {
        running = false;
        if (queued) { queued = false; schedule(); }
      }
    }, WATCH_DEBOUNCE_MS);
  };

  const watcher = fs.watch(ROOT, { recursive: true }, (_e, fileName) => {
    if (isRelevantChange(fileName)) schedule();
  });
  watcher.on("error", (err) => console.error("[arch-map] watcher error", err));
  console.log("[arch-map] watching for changes…");
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

async function runOnce(force) {
  const result = await analyseRepo(force);
  if (result.skipped) {
    console.log("[arch-map] No changes detected — map is up to date.");
    return;
  }
  await writeOutputs(result);
  console.log(
    `[arch-map] Generated docs/codebase-map.md & docs/codebase-map.json` +
    ` (commit: ${result.meta.version}, ` +
    `${result.stats.changedFiles} file(s) changed)`
  );
}

async function main() {
  const args = process.argv.slice(2);
  const watch = args.includes("--watch");
  const force = args.includes("--force");

  if (watch) {
    await runWatchMode();
    return;
  }
  await runOnce(force);
}

main().catch((err) => {
  console.error("[arch-map] Fatal:", err.message);
  process.exit(1);
});
