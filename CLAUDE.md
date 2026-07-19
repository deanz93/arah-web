# CLAUDE.md — arah-web

## What This Repo Does
Next.js 14 web portal: public-facing website + admin dashboard for the Arah platform. Admins moderate community reports, manage flood zones, view analytics, and manage users.

## Tech Stack
- Next.js 14 App Router + TypeScript (strict mode)
- **Tailwind CSS v3** — primary styling system
- **shadcn/ui** — component library (Radix UI + Tailwind)
- Firebase Admin SDK — server-side auth + Firestore
- Vitest + React Testing Library — unit tests
- Playwright — E2E tests

## Non-Negotiable: Styling Rules
- **Tailwind CSS only** — no custom `.css` files, no CSS Modules, no `style={{ }}` inline props
- **shadcn/ui first**: check if a shadcn component exists before building your own: Button, Dialog, Form, Table, Badge, Card, Select, Checkbox, Sheet, Toast, Skeleton, etc.
- Add new shadcn components: `npx shadcn-ui@latest add [component-name]`
- Design tokens live in `tailwind.config.ts` → `theme.extend.colors` (arah-teal, arah-amber, etc.)
- Dark mode: use `dark:` Tailwind variants — all new UI must work in both light and dark mode

## Non-Negotiable: Testing Rules
- Every new component → `__tests__/ComponentName.test.tsx` (Vitest + RTL)
- Every new page/route → smoke test that renders without crashing
- Form validation → test invalid input rejection and valid input acceptance
- Data tables → test empty state, loading state, data row rendering
- Run all tests: `npm run test`
- E2E smoke tests: `npm run test:e2e` (Playwright)

## Non-Negotiable: Design + UX Rules
- **shadcn DataTable** pattern for all data tables (sortable, searchable, paginated)
- **Confirmation Dialog** before ALL destructive actions (delete, ban user, clear reports)
- **Toast notifications** (via shadcn Toaster + sonner) for all async action results
- **Skeleton loaders** while fetching — never blank screen or spinner on top of stale content
- **Mobile-responsive**: all pages must work at 375px width — test with browser DevTools
- Form errors: inline validation messages next to the field, not just a top-of-form banner
- Empty states: every table/list must have a designed empty state with a clear CTA

## Dev Commands
```bash
npm ci
npm run dev           # http://localhost:3000
npm run test          # Vitest unit tests (watch: npm run test:watch)
npm run test:e2e      # Playwright E2E
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run build         # Production build — must pass before PR
```

## Branch + Story Format
Stories: `docs/bmad/04-stories.md`. Branch: `feature/WEB-NNN-short-description`
Commit: `feat(web): description` (Conventional Commits)
