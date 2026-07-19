# arah-web — Sprint Stories

Stories are ordered by dependency and value. Work top-to-bottom within each epic. Prefix: `WEB-`.

---

## Epic: Dashboard & Analytics

### WEB-001: Admin dashboard stats with live Firestore counts
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo

**As an** Arah operator **I want** to see key platform metrics at a glance on the dashboard **so that** I can monitor platform health without querying the database directly.

**Acceptance criteria:**
- [ ] `AdminDashboard` server component fetches: active report count, total user count, count by report type
- [ ] Four `StatsCard` components show: "Laporan Aktif", "Pengguna Berdaftar", "Laporan Polis", "Laporan Banjir"
- [ ] `ReportsChart` pie chart shows all 6 report types with BM labels and distinct colours
- [ ] Dashboard data revalidates every 60 seconds (`export const revalidate = 60`)
- [ ] Loading state: Next.js `loading.tsx` shows skeleton cards

**Technical notes:**
- `src/app/admin/page.tsx` already has the query logic — wrap queries in `unstable_cache` with `revalidate: 60` and tag `'reports'`
- `StatsCard.tsx` already accepts `delta?: number` prop — add week-over-week delta calculation using a second Firestore query with date range
- Create `src/app/admin/loading.tsx` with skeleton UI using `animate-pulse` Tailwind class
- `ReportsChart.tsx` already implemented — no changes needed for this story

**Estimate:** S

---

### WEB-002: Delete report from admin moderation table
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo

**As an** Arah operator **I want** to delete a false or harmful community report from the moderation table **so that** it no longer appears on users' maps.

**Acceptance criteria:**
- [ ] Each row in the reports table has a "Padam" button
- [ ] Clicking "Padam" shows a confirmation dialog: "Padam laporan ini? Tindakan ini tidak boleh dibatalkan."
- [ ] On confirm, calls `DELETE /api/reports/[id]` which sets `active: false` in Firestore
- [ ] Row is removed from the table immediately after deletion (optimistic update or page revalidation)
- [ ] On API error, shows a BM-language toast: "Gagal memadam laporan. Cuba lagi."
- [ ] Delete action is logged (console or Firebase Analytics event)

**Technical notes:**
- Create `src/app/api/reports/[id]/route.ts` with `DELETE` handler (see `docs/bmad/03-api-spec.md` for sketch)
- `adminDb.collection('reports').doc(id).update({ active: false })` — soft delete
- Call `revalidatePath('/admin/reports')` after successful update
- In `ReportsPage`: convert "Padam" button to a `<form>` with Server Action, or a client component with `fetch`
- Guard with admin auth check (placeholder until WEB-004 is done): check a hardcoded email allow-list

**Estimate:** M

---

### WEB-003: Analytics page with time-series charts
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo

**As an** Arah operator **I want** to see daily and weekly usage trends (new users, reports submitted, report types) **so that** I can understand platform growth and user behaviour.

**Acceptance criteria:**
- [ ] `/admin/analytics` page exists with at least two charts: daily report submissions (7 days) and report type breakdown (30 days)
- [ ] Daily submissions chart uses Recharts `BarChart` with date on X-axis and count on Y-axis
- [ ] Data is grouped by `created_at` date using Firestore queries with date range filters
- [ ] Charts use `ResponsiveContainer` and render correctly at all screen widths
- [ ] A date range picker allows operators to select 7d / 30d / 90d windows
- [ ] Sidebar "Analitik" link is active (highlighted) when on this page

**Technical notes:**
- Query pattern: `adminDb.collection('reports').where('created_at', '>=', startDate).where('created_at', '<=', endDate).select('created_at', 'type').get()`
- Group results by day in JS: `date-fns` `format(date, 'yyyy-MM-dd')`
- Create `src/app/admin/analytics/page.tsx` (Server Component for data) + `src/components/admin/DailyChart.tsx` (client component for Recharts)
- For active sidebar link: `usePathname()` in a `'use client'` nav component

**Estimate:** L

---

## Epic: Report Moderation

### WEB-004: Admin authentication with Firebase session cookies
**Epic:** Authentication
**Status:** 🔲 Todo

**As an** Arah operator **I want** admin pages to be protected by authentication **so that** only authorised operators can access Firestore data.

**Acceptance criteria:**
- [ ] `/admin` and all sub-routes redirect unauthenticated users to `/admin/login`
- [ ] `/admin/login` page has a "Daftar masuk dengan Google" button using Firebase client SDK
- [ ] On successful Google Sign-In, the Firebase ID token is exchanged for a server-side session cookie via `POST /api/auth/session`
- [ ] Next.js middleware checks for the session cookie on all `/admin/*` routes
- [ ] Session cookie expires after 7 days; expired sessions redirect to login
- [ ] Only pre-approved admin email addresses (env var `ADMIN_EMAILS`) can access the admin panel
- [ ] "Log keluar" button in the sidebar clears the session cookie and redirects to `/admin/login`

**Technical notes:**
- Firebase Admin: `adminAuth.createSessionCookie(idToken, { expiresIn: 7 * 24 * 60 * 60 * 1000 })`
- Verify in middleware: `adminAuth.verifySessionCookie(cookie, true)` (true = check revocation)
- `ADMIN_EMAILS=developer@plisca.com.my,admin2@arah.my` in `.env.local`
- Create files: `src/app/admin/login/page.tsx`, `src/app/api/auth/session/route.ts`, `src/middleware.ts`
- Middleware must be in `src/middleware.ts` at root of `src/` — not inside `app/`

**Estimate:** M

---

### WEB-005: Report filter and search
**Epic:** Report Moderation
**Status:** 🔲 Todo

**As an** Arah operator **I want** to filter the reports table by type and search by location coordinates **so that** I can find specific reports quickly without scrolling through 50 rows.

**Acceptance criteria:**
- [ ] Report table has a filter dropdown: "Semua Jenis" / "Polis" / "Kemalangan" / "Banjir" / "Lubang" / "Sekatan" / "Bahaya"
- [ ] Selecting a type filters the table to show only that type
- [ ] A text input allows filtering by coordinate prefix (e.g. "3.1" matches lat starting with 3.1)
- [ ] Filters are reflected in URL search params: `/admin/reports?type=police`
- [ ] Server component reads `searchParams.type` and applies `.where('type', '==', type)` to the Firestore query
- [ ] Filter state persists on page navigation and refresh (URL-driven)

**Technical notes:**
- Server component: `export default async function ReportsPage({ searchParams }: { searchParams: { type?: string } })`
- Client-side filter controls: use a `'use client'` form or `<Link>` with query params that submits to the same URL
- Firestore filter: add `.where('type', '==', searchParams.type)` only if `searchParams.type` is defined and valid
- Coordinate search: filter client-side from the fetched 50 results (no additional Firestore query needed)

**Estimate:** M

---

## Epic: User Management

### WEB-006: User management page
**Epic:** User Management
**Status:** 🔲 Todo

**As an** Arah operator **I want** to view all registered users and disable problematic accounts **so that** I can enforce platform community standards.

**Acceptance criteria:**
- [ ] `/admin/users` page lists users from Firestore `users` collection (25 per page, cursor pagination)
- [ ] Table columns: Display name, UID (truncated), Language, Reports submitted, Joined date
- [ ] "Nyahdayakan" (Disable) button calls `PATCH /api/users/[uid]/disable` → `adminAuth.updateUser(uid, { disabled: true })`
- [ ] Disabled users are shown with a red "Dinyahdayakan" badge
- [ ] Search input filters by display name (client-side, from fetched page)
- [ ] Pagination: "Seterusnya" / "Sebelumnya" buttons with Firestore cursor (`startAfter(lastDoc)`)

**Technical notes:**
- Create `src/app/admin/users/page.tsx` (Server Component)
- Firestore query: `adminDb.collection('users').orderBy('created_at', 'desc').limit(25)`
- For pagination, pass `startAfter` cursor as URL search param (Firestore document ID as cursor key)
- Firebase Auth status (disabled/enabled) is not stored in Firestore — fetch it separately via `adminAuth.getUser(uid)` or `adminAuth.listUsers()` and merge with Firestore data
- Create `src/app/api/users/[uid]/disable/route.ts`

**Estimate:** L

---

### WEB-007: User report history
**Epic:** User Management
**Status:** 🔲 Todo

**As an** Arah operator **I want** to view all reports submitted by a specific user **so that** I can assess if a user is submitting false reports before disabling their account.

**Acceptance criteria:**
- [ ] Clicking a user in the user table navigates to `/admin/users/[uid]` detail page
- [ ] Detail page shows: user info card + a table of all reports by `user_hash` (derived from uid)
- [ ] Report table shows: type, coordinates, upvotes, downvotes, status (active/expired), date
- [ ] "Padam" button on each report row deletes it (reuses WEB-002 logic)
- [ ] "Nyahdayakan Pengguna" button is shown on the detail page

**Technical notes:**
- `user_hash` in reports is SHA-256 of the Firebase UID — compute server-side with Node `crypto`:
  ```typescript
  import { createHash } from 'crypto'
  const hash = createHash('sha256').update(uid).digest('hex')
  ```
- Query: `adminDb.collection('reports').where('user_hash', '==', hash).orderBy('created_at', 'desc').limit(50).get()`
- This requires a Firestore composite index on `(user_hash, created_at)`

**Estimate:** M

---

## Epic: Map Admin

### WEB-008: Admin map view of active reports
**Epic:** Map Admin
**Status:** 🔲 Todo

**As an** Arah operator **I want** to see active community reports visualised on a map of Malaysia **so that** I can understand the geographic distribution of reports and identify hotspots.

**Acceptance criteria:**
- [ ] `/admin/map` page shows a full-screen MapLibre GL map centred on Malaysia (KL: 3.139, 101.6869)
- [ ] All active reports are rendered as coloured point markers by type (police=blue, accident=red, flood=teal, etc.)
- [ ] Clicking a marker shows a popup with: type, coordinates, upvote/downvote, expires_at, "Padam" button
- [ ] "Padam" in the popup calls `DELETE /api/reports/[id]` and removes the marker
- [ ] Map uses Arah tile server (`tiles.arah.my/style.json`) for Malaysia OSM base map

**Technical notes:**
- Create `src/app/admin/map/page.tsx` as a server component that fetches all active reports
- Create `src/components/admin/ReportsMap.tsx` as a `'use client'` component using `react-map-gl` + `maplibre-gl`
- Pass report data as props from server component to `ReportsMap`
- Note: `maplibre-gl` imports `window` — use Next.js `dynamic(() => import(...), { ssr: false })` to avoid SSR issues
- Sidebar link "Peta" needs to be added to `AdminLayout` nav array

**Estimate:** L

---

## Epic: Authentication

### WEB-009: Public landing page download tracking
**Epic:** Authentication
**Status:** 🔲 Todo

**As an** Arah product manager **I want** to track how many visitors click the Android and iOS download buttons **so that** I can measure app acquisition conversion.

**Acceptance criteria:**
- [ ] Clicking "Muat turun Android" logs a Firebase Analytics event `download_click` with `{ platform: 'android' }`
- [ ] Clicking "Muat turun iOS" logs `download_click` with `{ platform: 'ios' }`
- [ ] Analytics initialisation uses the lazy `isSupported()` pattern already in `src/lib/firebase.ts`
- [ ] Events are visible in Firebase Analytics console within 24 hours
- [ ] No analytics in development (`process.env.NODE_ENV !== 'production'` guard)

**Technical notes:**
- Convert the download `<a>` tags in `src/app/page.tsx` to a `'use client'` `DownloadButton` component
- Or use `onClick` in a small wrapper: `src/components/DownloadButton.tsx`
- `firebase/analytics` `logEvent` must be called after awaiting `analytics` (it's a `Promise<Analytics | null>`)

**Estimate:** S

---

### WEB-010: Add Pengguna and Analitik to sidebar navigation
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo

**As an** Arah operator **I want** the admin sidebar to highlight the active page **so that** I always know which section I'm in.

**Acceptance criteria:**
- [ ] The sidebar nav in `AdminLayout` uses `usePathname()` to apply an active class to the current route
- [ ] Active link has a white background and dark text (or similar visual distinction from inactive links)
- [ ] All four nav items link to existing routes (Dashboard, Laporan, Pengguna, Analitik)
- [ ] Nav items added: `/admin/map` (Peta Admin) when WEB-008 is done

**Technical notes:**
- `src/app/admin/layout.tsx` is a Server Component — convert nav to a `'use client'` sub-component `AdminNav.tsx` to use `usePathname()`
- Use `clsx(baseClasses, { 'bg-white text-blue-900': isActive })` pattern
- `isActive` = `pathname === item.href || pathname.startsWith(item.href + '/')` (for sub-routes)

**Estimate:** S
