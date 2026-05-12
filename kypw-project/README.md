# KYPW Project

This repository contains the KYPW project.

## Overview
This is a modern web application built with **Next.js**, **React**, and **TypeScript**. It utilizes a robust technology stack designed for scalability and developer experience.

## Tech Stack
- **Framework:** Next.js
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI / Shadcn UI
- **Database / ORM:** Prisma
- **Authentication:** Next-Auth & Supabase
- **State Management:** Zustand & React Query

## Getting Started

### Prerequisites
Make sure you have Node.js and Bun (or npm/yarn/pnpm) installed.

### Installation

1. Install the dependencies:
   ```bash
   bun install
   ```

2. Generate Prisma Client:
   ```bash
   bun run db:generate
   ```

### Running the Application

To run the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management
- Push schema to database: `bun run db:push`
- Run migrations: `bun run db:migrate`
- Open Prisma Studio: `bun run db:studio`

## Scripts
- `bun run build`: Build the application for production.
- `bun run lint`: Run ESLint.
- `bun run docs:update`: Update project codemap and documentation.
