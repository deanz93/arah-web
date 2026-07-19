# arah-web — AI Agent Instructions

## What this service is

`arah-web` is the Next.js 14 App Router web application for the Arah platform. It serves two distinct surfaces: a public-facing marketing and download page (`/`) and a protected admin dashboard (`/admin`) for Arah operators to moderate community reports, monitor platform health, manage users, and view analytics. All admin data access is server-side via Firebase Admin SDK, making admin pages secure server components that never expose credentials to the browser.

## Repo structure

```
src/
  app/
    layout.tsx               — root layout: html lang="ms", global CSS, metadata
    page.tsx                 — public landing page (download links, feature highlights)
    globals.css              — Tailwind base + custom CSS variables
    admin/
      layout.tsx             — admin shell: sidebar nav (Dashboard / Laporan / Pengguna / Analitik)
      page.tsx               — admin dashboard: server component, Firestore count queries + StatsCard + ReportsChart
      reports/
        page.tsx             — report moderation table: active reports, delete action
      users/                 — [to be created] user management (MOB → WEB-006)
      analytics/             — [to be created] analytics charts (WEB-003)
  components/
    admin/
      StatsCard.tsx          — metric card: icon + value + label + optional delta %
      ReportsChart.tsx       — 'use client' Recharts PieChart of report types
  lib/
    firebase.ts              — client SDK singleton: auth, db (Firestore), analytics
    firebase-admin.ts        — Admin SDK singleton: adminDb, adminAuth (server-only)
next.config.js               — typedRoutes experimental enabled
tailwind.config.js           — Tailwind config
tsconfig.json                — strict TypeScript, paths: @/* → ./src/*
```

## How to run

```bash
# Install dependencies
npm install

# Development server
npm run dev           # http://localhost:3000

# Production build
npm run build
npm run start

# Type-check
npm run typecheck

# Lint
npm run lint
```

Environment: copy `.env.local.example` to `.env.local` and fill in Firebase credentials.

## Coding conventions

- **Server components by default** — every file in `src/app/` is a React Server Component unless it starts with `'use client'`. Do not add `'use client'` to page files that can be server components.
- **Firebase Admin SDK is server-only** — `src/lib/firebase-admin.ts` must never be imported in `'use client'` components. Only import it in Server Components, Route Handlers, or Server Actions.
- **Tailwind CSS for all styling** — no CSS modules, no styled-components. Use `clsx` for conditional class composition.
- **TypeScript strict mode** — `@/*` path alias for all `src/` imports; no `any` without justification.
- **Data fetching in Server Components** — fetch Firestore data directly in `async` server component functions; pass data as props to client components (e.g. `ReportsChart` receives pre-fetched data).
- **Bahasa Malaysia labels** — all admin UI text is in BM (e.g. "Laporan Aktif", "Pengguna Berdaftar"). Column headers and button labels should be BM-first.
- **No pagination hack** — Firestore queries in server components use `.limit(50)`. Add server-side cursor pagination before exceeding that limit in production.
- **Security** — admin routes must be protected by Firebase Auth middleware (see story WEB-004). Currently unprotected — do not deploy to production without completing WEB-004.

## Next story

Read `docs/bmad/04-stories.md` and pick the first story with status `🔲 Todo`.

## Cross-repo dependencies

| Dependency | How accessed | Purpose |
|-----------|-------------|---------|
| Firebase Firestore | `firebase-admin` SDK (server) | Read reports, users, analytics data |
| Firebase Auth | `firebase-admin` SDK (server) | Verify admin session tokens; list users |
| Firebase Analytics | `firebase` client SDK | Front-end engagement tracking (landing page) |
| `arah-mobile` | Firestore shared collections | Reports written by mobile are read here |
| `arah-api` (Fastify) | Optional: internal fetch in Route Handlers | Could proxy certain admin actions |
