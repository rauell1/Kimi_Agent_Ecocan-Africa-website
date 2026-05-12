/**
 * KYPW Codemap Generator
 *
 * Generates a comprehensive code architecture map of the KYPW project.
 * Auto-updates whenever the project structure changes.
 *
 * Usage:
 *   bun run codemap          → Generate and print to console
 *   bun scripts/generate-codemap.ts → Write to docs/codemap.md
 *
 * Output:
 *   - Project structure tree
 *   - Component hierarchy
 *   - API route inventory
 *   - Database model relationships
 *   - Dependency map
 *   - Integration points (Supabase, Resend, LLM)
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from "fs";
import { join, relative } from "path";

const PROJECT_ROOT = process.cwd();
const DOCS_DIR = join(PROJECT_ROOT, "docs");
const CODEMAP_PATH = join(DOCS_DIR, "codemap.md");

// ── Tree Generator ──────────────────────────────────────

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "dir";
  children?: TreeNode[];
  size?: number;
}

function buildTree(dir: string, depth = 0, maxDepth = 4): TreeNode[] {
  if (depth > maxDepth) return [];
  if (!existsSync(dir)) return [];

  const skipDirs = new Set(["node_modules", ".next", ".git", ".vercel", "dist", "build", ".prisma", "mini-services"]);
  const skipFiles = new Set([".DS_Store", "custom.db", "custom.db-journal"]);

  const entries = readdirSync(dir)
    .filter((e) => !skipDirs.has(e) && !skipFiles.has(e))
    .sort((a, b) => {
      const aDir = statSync(join(dir, a)).isDirectory();
      const bDir = statSync(join(dir, b)).isDirectory();
      if (aDir && !bDir) return -1;
      if (!aDir && bDir) return 1;
      return a.localeCompare(b);
    });

  return entries.map((name): TreeNode => {
    const fullPath = join(dir, name);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      return {
        name,
        path: relative(PROJECT_ROOT, fullPath),
        type: "dir",
        children: buildTree(fullPath, depth + 1, maxDepth),
      };
    }
    return {
      name,
      path: relative(PROJECT_ROOT, fullPath),
      type: "file",
      size: stat.size,
    };
  });
}

function treeToString(nodes: TreeNode[], prefix = "", isLast = true): string {
  let result = "";
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    const connector = last ? "└── " : "├── ";
    const icon = node.type === "dir" ? "📁 " : "📄 ";
    result += `${prefix}${connector}${icon}${node.name}\n`;
    if (node.children && node.children.length > 0) {
      result += treeToString(node.children, prefix + (last ? "    " : "│   "));
    }
  });
  return result;
}

// ── Scanners ────────────────────────────────────────────

function scanApiRoutes(): Array<{ method: string; path: string; file: string }> {
  const routes: Array<{ method: string; path: string; file: string }> = [];
  const apiDir = join(PROJECT_ROOT, "src", "app", "api");

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (entry === "route.ts") {
        const content = readFileSync(fullPath, "utf-8");
        const methods = [];
        if (/export\s+(?:async\s+)?function\s+GET\b/.test(content)) methods.push("GET");
        if (/export\s+(?:async\s+)?function\s+POST\b/.test(content)) methods.push("POST");
        if (/export\s+(?:async\s+)?function\s+PUT\b/.test(content)) methods.push("PUT");
        if (/export\s+(?:async\s+)?function\s+PATCH\b/.test(content)) methods.push("PATCH");
        if (/export\s+(?:async\s+)?function\s+DELETE\b/.test(content)) methods.push("DELETE");

        const routePath = "/api/" + relative(apiDir, dir).replace(/\\/g, "/");
        for (const method of methods) {
          routes.push({ method, path: routePath, file: relative(PROJECT_ROOT, fullPath) });
        }
      }
    }
  }

  walk(apiDir);
  return routes;
}

function scanModels(): Array<{ name: string; fields: string[]; relations: string[] }> {
  const schemaPath = join(PROJECT_ROOT, "prisma", "schema.prisma");
  if (!existsSync(schemaPath)) return [];

  const schema = readFileSync(schemaPath, "utf-8");
  const models: Array<{ name: string; fields: string[]; relations: string[] }> = [];
  const modelRegex = /^model\s+(\w+)\s*\{([\s\S]*?)\n\}/gm;

  let match;
  while ((match = modelRegex.exec(schema)) !== null) {
    const name = match[1];
    const body = match[2];
    const fields: string[] = [];
    const relations: string[] = [];

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("//")) continue;
      const fieldMatch = trimmed.match(/^(\w+)\s+/);
      if (fieldMatch) {
        fields.push(fieldMatch[1]);
      }
      if (trimmed.includes("@relation(")) {
        const nameMatch = trimmed.match(/name:\s*"(\w+)"/);
        relations.push(nameMatch ? nameMatch[1] : fieldMatch?.[1] ?? "unknown");
      }
    }

    models.push({ name, fields, relations });
  }

  return models;
}

function scanComponents(): Array<{ name: string; file: string; type: string }> {
  const components: Array<{ name: string; file: string; type: string }> = [];
  const compDir = join(PROJECT_ROOT, "src", "components");

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else if (entry.endsWith(".tsx")) {
        const content = readFileSync(fullPath, "utf-8");
        const type = content.includes("export default function") ? "page"
          : content.includes('"use client"') ? "client"
          : content.includes('"use server"') ? "server"
          : "component";

        const nameMatch = entry.match(/^(.+)\.tsx$/);
        components.push({
          name: nameMatch ? nameMatch[1] : entry,
          file: relative(PROJECT_ROOT, fullPath),
          type,
        });
      }
    }
  }

  walk(compDir);
  return components;
}

function scanWorkflows(): string[] {
  const wfDir = join(PROJECT_ROOT, "src", "lib", "workflows");
  if (!existsSync(wfDir)) return [];
  return readdirSync(wfDir)
    .filter((f) => f.endsWith(".ts") && f !== "index.ts")
    .map((f) => f.replace(/\.ts$/, ""));
}

function scanIntegrations(): Array<{ name: string; config: string[] }> {
  const integrations: Array<{ name: string; config: string[] }> = [];

  // Supabase
  const supabaseConfig: string[] = [];
  if (existsSync(join(PROJECT_ROOT, "src", "lib", "supabase", "server.ts"))) supabaseConfig.push("server.ts");
  if (existsSync(join(PROJECT_ROOT, "src", "lib", "supabase", "client.ts"))) supabaseConfig.push("client.ts");
  if (existsSync(join(PROJECT_ROOT, "src", "app", "api", "supabase"))) supabaseConfig.push("api/supabase/*");
  if (supabaseConfig.length) integrations.push({ name: "Supabase Auth + DB", config: supabaseConfig });

  // Resend (email)
  if (existsSync(join(PROJECT_ROOT, "src", "lib", "email.ts"))) {
    integrations.push({ name: "Resend (Email)", config: ["src/lib/email.ts"] });
  }

  // LLM (z-ai-web-dev-sdk)
  if (existsSync(join(PROJECT_ROOT, "src", "lib", "workflows", "ai-report.ts"))) {
    integrations.push({ name: "LLM (z-ai-web-dev-sdk)", config: ["src/lib/workflows/ai-report.ts"] });
  }

  // Prisma
  integrations.push({ name: "Prisma ORM", config: ["prisma/schema.prisma", "src/lib/db.ts"] });

  return integrations;
}

// ── Main ────────────────────────────────────────────────

function generateCodemap() {
  const tree = buildTree(PROJECT_ROOT);
  const apiRoutes = scanApiRoutes();
  const models = scanModels();
  const components = scanComponents();
  const workflows = scanWorkflows();
  const integrations = scanIntegrations();
  const timestamp = new Date().toISOString();

  const markdown = `# KYPW Codemap — Project Architecture

> Auto-generated: ${timestamp}
> Generator: \`bun scripts/generate-codemap.ts\`
> Run \`bun run codemap\` to regenerate.

---

## Project Structure

\`\`\`
${treeToString(tree)}
\`\`\`

---

## API Routes (${apiRoutes.length} endpoints)

| Method | Path | File |
|--------|------|------|
${apiRoutes.map((r) => `| \`${r.method}\` | \`${r.path}\` | \`${r.file}\` |`).join("\n")}

---

## Database Models (${models.length} models — Supabase PostgreSQL)

${models.map((m) => `
### \`${m.name}\`

- **Fields**: ${m.fields.join(", ")}
${m.relations.length > 0 ? `- **Relations**: ${m.relations.join(", ")}` : ""}
`).join("\n")}

**Entity Relationship Summary:**

\`\`\`
${models.map((m) => m.relations.length > 0 ? `${m.name} → ${m.relations.join(", ")}` : `${m.name} (standalone)`).join("\n")}
\`\`\`

---

## Components (${components.length})

### Page Components
${components.filter((c) => c.type === "page").map((c) => `- \`${c.name}\` — \`${c.file}\``).join("\n") || "- (none)"}

### Client Components
${components.filter((c) => c.type === "client").map((c) => `- \`${c.name}\` — \`${c.file}\``).join("\n") || "- (none)"}

### UI Components
${components.filter((c) => c.file.includes("components/ui")).map((c) => `- \`${c.name}\` — \`${c.file}\``).join("\n") || "- (none)"}

---

## Workflow Engine (${workflows.length} workflows)

| Workflow | File |
|----------|------|
${workflows.map((w) => `| \`${w}\` | \`src/lib/workflows/${w}.ts\` |`).join("\n")}

Each workflow provides:
- **Step isolation**: Each step runs independently with its own retry policy
- **Automatic retries**: Exponential backoff on transient failures
- **Full observability**: Every step logged to \`WorkflowRun\` and \`WorkflowStep\` tables

---

## Integrations

| Integration | Config Files |
|-------------|-------------|
${integrations.map((i) => `| ${i.name} | ${i.config.map((c) => `\`${c}\``).join(", ")} |`).join("\n")}

---

## Architecture Diagram

\`\`\`
┌─────────────────────────────────────────────────┐
│                   Vercel Edge                   │
│  ┌───────────┐  ┌───────────┐  ┌────────────┐ │
│  │  Static   │  │  API      │  │  Serverless│ │
│  │  Assets   │  │  Routes   │  │  Functions │ │
│  └───────────┘  └─────┬─────┘  └──────┬─────┘ │
└───────────────────────┼────────────────┼───────┘
                        │                │
              ┌─────────▼────────────────▼─────────┐
              │         Next.js App Router          │
              │  ┌──────────┐  ┌───────────────┐   │
              │  │  Pages   │  │  API Routes   │   │
              │  └────┬─────┘  └───────┬───────┘   │
              │       │                │           │
              │  ┌────▼────────────────▼──────┐    │
              │  │     Workflow Engine         │    │
              │  │  (step isolation + retry)   │    │
              │  └────┬────────────────┬──────┘    │
              └───────┼────────────────┼───────────┘
                      │                │
         ┌────────────▼──┐    ┌───────▼────────┐
         │  Supabase     │    │  External APIs │
         │  PostgreSQL   │    │  ┌───────────┐ │
         │  ┌──────────┐ │    │  │  Resend   │ │
         │  │  Auth    │ │    │  │  (Email)  │ │
         │  ├──────────┤ │    │  ├───────────┤ │
         │  │  Data    │ │    │  │  LLM SDK  │ │
         │  │  Models  │ │    │  │  (AI)     │ │
         │  └──────────┘ │    │  └───────────┘ │
         └───────────────┘    └────────────────┘
\`\`\`

---

## Deployment

- **Platform**: Vercel
- **Region**: iad1 (US East)
- **Database**: Supabase PostgreSQL (connection pooler)
- **Auth**: Supabase Auth + session-based (cookies)
- **Email**: Resend.com (with console fallback)
- **AI**: z-ai-web-dev-sdk (workflow-based with retries)
`;

  // Write to file
  if (!existsSync(DOCS_DIR)) {
    mkdirSync(DOCS_DIR, { recursive: true });
  }
  writeFileSync(CODEMAP_PATH, markdown, "utf-8");

  // Summary
  console.log("✅ KYPW Codemap generated");
  console.log(`   📄 File: ${CODEMAP_PATH}`);
  console.log(`   📁 Structure: ${tree.length} top-level items`);
  console.log(`   🔗 API Routes: ${apiRoutes.length}`);
  console.log(`   🗄️  DB Models: ${models.length}`);
  console.log(`   ⚛️  Components: ${components.length}`);
  console.log(`   ⚡ Workflows: ${workflows.length}`);
  console.log(`   🔌 Integrations: ${integrations.length}`);
}

generateCodemap();
