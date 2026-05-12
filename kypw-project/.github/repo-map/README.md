# 🗺️ Repository Map — KYPW Platform

> Auto-generated on 2026-05-10 16:25 UTC  
> Commit: `292ed613e6938a74f8c0c2cb28f5bb0c3e3592ea`  
> Workflow: [Run #1](https://github.com/rauell1/kypw-project/actions/runs/25633778146)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| Total files | 188 |
| TypeScript/TSX files | 145 |
| Lines of code | ~21006 |
| API routes | 36 |
| Database models | 17 |
| UI components | 48 |
| Framework | Next.js 16 (App Router) |
| Database | SQLite + Prisma ORM |
| UI Library | shadcn/ui + Tailwind CSS 4 |

## Generated Maps

| File | Description |
|------|-------------|
| `structure.json` | Complete file tree with hashes, sizes, and timestamps |
| `dependencies.json` | Package dependency graph grouped by category |
| `api-routes.json` | All API endpoint paths, methods, and auth status |
| `db-schema.json` | Prisma models, fields, relations, and types |
| `component-tree.md` | Visual component hierarchy |
| `README.md` | This summary file |

## How It Works

This workflow runs on every push to generate an up-to-date map of the repository.
The maps are committed back to `.github/repo-map/` so they're always in sync.

### Detecting Changes

Compare against the previous commit:
```bash
git diff HEAD~1 -- .github/repo-map/structure.json
git diff HEAD~1 -- .github/repo-map/api-routes.json
git diff HEAD~1 -- .github/repo-map/db-schema.json
```

