# KYPW — Vercel Deployment Guide (Production-Ready)

> **Project:** Kenya Youth Parliament for Water (KYPW)  
> **Framework:** Next.js 16 + Prisma + Supabase PostgreSQL  
> **Last updated:** June 2025

---

## STEP 1 — Create Your Supabase Project (Do This First)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Choose a **name** (e.g. `kypw-production`)
4. Set a **database password** — **SAVE THIS**, you'll need it
5. Choose the **closest region** (e.g. `af-south-1` for Africa, or `eu-west-1` for Europe)
6. Click **"Create new project"** and wait ~2 minutes

### Get Your Credentials

After the project is ready, go to **Settings → API**:

| Setting | Where to Find It |
|---------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL (e.g. `https://abc123.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (keep secret!) |

Go to **Settings → Database → Connection string** → switch to **"Transaction"** mode:

```
DATABASE_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Switch to **"Session"** mode for DIRECT_URL:

```
DIRECT_URL=postgresql://postgres.abc123:[PASSWORD]@aws-0-region.supabase.com:5432/postgres
```

---

## STEP 2 — Push Your Database Schema (One-Time Setup)

Open your terminal and run:

```bash
# Set your database URL temporarily
export DATABASE_URL="postgresql://postgres.abc123:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_URL="postgresql://postgres.abc123:[PASSWORD]@aws-0-region.supabase.com:5432/postgres"

# Push the schema to Supabase (creates all 17 tables)
npx prisma db push

# Verify it worked
npx prisma studio
```

You should see 17 tables: User, UserSession, Event, EventParticipant, EventDocumentation, EventMetrics, EventReport, EventDocRequirement, EventMedia, AuditLog, ContactMessage, NewsPost, Notification, PasswordResetToken, NewsletterSubscriber, WorkflowRun, WorkflowStep.

---

## STEP 3 — Seed the Database (Optional but Recommended)

After deploying to Vercel (Step 6), visit:
```
https://your-domain.com/api/seed
```

This creates:
- 1 admin user (`admin@kypw.ke` / password: `admin123`)
- 5 sample events

**⚠️ Change the admin password immediately after first login!**

---

## STEP 4 — Connect Your Git Repository to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click **"Add New Project"** → **"Import Git Repository"**
4. Select your KYPW repository
5. **Do NOT change any build settings** — the `vercel.json` handles everything

---

## STEP 5 — Set Environment Variables in Vercel

Go to your Vercel project → **Settings** → **Environment Variables**.

Add ALL of these variables. Select **Production + Preview + Development** for each:

### Required Variables

| Variable | Example Value |
|----------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` |
| `DATABASE_URL` | `postgresql://postgres.abc123:[PASS]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.abc123:[PASS]@aws-0-region.supabase.com:5432/postgres` |

### Optional Variables

| Variable | Example Value | Purpose |
|----------|--------------|---------|
| `RESEND_API_KEY` | `re_abc123` | Email sending (get from resend.com) |
| `RESEND_FROM_EMAIL` | `info@rauell.systems` | Sender address |
| `RESEND_FROM_NAME` | `Kenya Youth Parliament of Water` | Sender display name |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` | Admin Supabase operations |
| `NEXT_PUBLIC_SITE_URL` | `https://rauell.systems` | Site URL for OG tags |

> **If RESEND_API_KEY is not set**, emails are silently logged to the server console. No errors.

---

## STEP 6 — Deploy

Click **"Deploy"** in Vercel. 

**What happens during build:**
1. `npm install` — installs all dependencies
2. `npx prisma generate` — generates the Prisma client for PostgreSQL
3. `next build` — builds the Next.js app with standalone output

First build takes ~2-3 minutes. Subsequent builds are ~60 seconds.

---

## STEP 7 — Configure Your Custom Domain

1. In Vercel → **Settings** → **Domains** → Add `rauell.systems`
2. Also add `www.rauell.systems` (redirects to apex)

### DNS Records (set at your domain registrar)

| Type | Name | Value |
|------|------|-------|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

SSL is automatic. Wait 5-10 minutes for propagation.

---

## STEP 8 — Verify Everything Works

Open these URLs and check:

| URL | What to Check |
|-----|--------------|
| `https://rauell.systems` | Homepage loads with hero image, header, footer |
| `https://rauell.systems/#/events` | Events page shows event cards |
| `https://rauell.systems/#/about` | About page loads |
| `https://rauell.systems/#/contact` | Contact form visible |
| `https://rauell.systems/#/news` | News page loads |
| `https://rauell.systems/sitemap.xml` | XML sitemap with 5 URLs |
| `https://rauell.systems/robots.txt` | Robots file with sitemap link |
| `https://rauell.systems/api/events?public=true` | Returns JSON with events |
| `https://rauell.systems/api/auth/me` | Returns `{"user": null}` |

### Test Auth
1. Go to `https://rauell.systems/#/auth`
2. Sign up with email + password
3. You should be redirected to the dashboard

### Test Newsletter
1. Use the newsletter form in the footer
2. Enter any email and submit
3. Check `/api/workflows?stats=true` to see the workflow ran

---

## What NOT to Do

❌ **Do NOT run `prisma db push` during Vercel builds** — schema changes are a manual step  
❌ **Do NOT use `bun` in Vercel build commands** — use `npm` or `npx`  
❌ **Do NOT commit `.env` or `.env.local`** — use Vercel Environment Variables  
❌ **Do NOT put the Supabase service role key in client-side code**  
❌ **Do NOT use `output: "standalone"` with custom server scripts** — Vercel handles this  

---

## Troubleshooting

### Build fails with "prisma generate" error
→ Make sure `DATABASE_URL` is set in Vercel Environment Variables (even the format matters)

### Build fails with TypeScript error
→ Run `npx eslint .` locally to find the error before pushing

### API routes return 500
→ Check Vercel Function Logs (Deployments → click deployment → Functions tab)
→ Most common cause: missing `DATABASE_URL`

### Pages load but no data
→ Run `npx prisma db push` against your Supabase database to create tables
→ Then visit `/api/seed` to add sample data

### Images not loading
→ Make sure images in `public/` are committed to Git
→ Check browser console for 404 errors on specific image paths

---

## Architecture on Vercel

```
Browser → Vercel CDN → Next.js Serverless Functions
                              ↓
                    ┌─────────────────────┐
                    │  Supabase PostgreSQL │
                    │  (17 tables)         │
                    │  via Prisma ORM      │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │  External Services   │
                    │  - Resend (email)    │
                    │  - z-ai-web-dev-sdk  │
                    │  - Supabase Auth     │
                    └─────────────────────┘
```

---

## Quick Checklist

```
□ Supabase project created and running
□ DATABASE_URL and DIRECT_URL obtained from Supabase
□ Schema pushed to Supabase (npx prisma db push)
□ 17 tables visible in Supabase Dashboard → Table Editor
□ Git repo pushed to GitHub
□ Vercel project connected to Git repo
□ 4 required env vars set in Vercel (SUPABASE_URL, ANON_KEY, DATABASE_URL, DIRECT_URL)
□ Optional: RESEND_API_KEY set (for real email sending)
□ Build succeeds on Vercel
□ Custom domain configured (rauell.systems)
□ SSL certificate active
□ Homepage loads at https://rauell.systems
□ /sitemap.xml accessible
□ /robots.txt accessible
□ API endpoints respond
□ Auth (signup/signin) works
□ /api/seed creates admin user + events
□ Dashboard accessible after login
```
