# arah-web — Architecture

## Component diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser (Client)                            │
│                                                                     │
│  ┌───────────────┐   ┌──────────────────────────────────────────┐  │
│  │  Public Page  │   │          Admin Dashboard Shell           │  │
│  │  src/app/     │   │  src/app/admin/layout.tsx (sidebar nav)  │  │
│  │  page.tsx     │   └───────────────┬──────────────────────────┘  │
│  │  (Server)     │                   │                             │
│  └───────────────┘   ┌──────────────▼──────────────────────────┐  │
│                       │        Admin Pages (Server Components)   │  │
│                       │  /admin          AdminDashboard (page)   │  │
│                       │  /admin/reports  ReportsPage   (page)    │  │
│                       │  /admin/users    [WEB-006]               │  │
│                       │  /admin/analytics [WEB-003]              │  │
│                       └───────────────┬─────────────────────────┘  │
│                                       │ pass props                 │
│                       ┌──────────────▼──────────────────────────┐  │
│                       │     Client Components ('use client')     │  │
│                       │  ReportsChart (Recharts PieChart)        │  │
│                       │  [future: interactive report map]        │  │
│                       └─────────────────────────────────────────┘  │
│                                                                     │
│                       ┌─────────────────────────────────────────┐  │
│                       │   Server-only (never in browser bundle)  │  │
│                       │  src/lib/firebase-admin.ts               │  │
│                       │  adminDb, adminAuth                      │  │
│                       └───────────┬─────────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────────┘
                                    │ gRPC / Firebase Admin SDK
                            ┌───────▼────────────────────────┐
                            │      Firebase (Google Cloud)    │
                            │  Firestore   Auth   Analytics   │
                            └────────────────────────────────┘
```

## Page tree

```
/                          — public landing page (Server Component)
/admin                     — admin layout (Server Component)
  /admin                   — dashboard: stats + pie chart (Server Component + Client chart)
  /admin/reports           — report moderation table (Server Component)
  /admin/users             — user management [WEB-006, not yet created]
  /admin/analytics         — analytics charts [WEB-003, not yet created]
```

## Data flow

### Admin dashboard page load
```
Browser → GET /admin
  → Next.js Server Component (AdminDashboard)
    → adminDb.collection('reports').where('active','==',true).count().get()
    → adminDb.collection('users').count().get()
    → adminDb.collection('reports').where('active','==',true).select('type').get()
      → Returns: { activeReports: N, totalUsers: N, byType: { police: N, ... } }
        → StatsCard (Server Component — no hydration cost)
        → ReportsChart ('use client' — receives pre-computed chartData as prop)
```

### Report moderation
```
Browser → GET /admin/reports
  → Next.js Server Component (ReportsPage)
    → adminDb.collection('reports').where('active','==',true).orderBy('created_at','desc').limit(50).get()
      → Returns: Report[] with id, type, lat, lng, upvotes, downvotes, expires_at
        → Table rendered server-side
          → "Padam" button → [WEB-002: Server Action or Route Handler to set active=false]
```

### Public landing page
```
Browser → GET /
  → Static HTML from Server Component (no Firestore calls)
    → Links to Android / iOS download (href="#")
    → Feature cards: Berdaulat, Amaran Banjir, Kos Tol
```

## Key design decisions

### Server Components for admin data
All Firestore reads in admin pages are performed in async Server Components using the Firebase Admin SDK. This means:
- No Firestore credentials ever reach the browser
- No loading spinners for initial data (SSR)
- No client-side Firestore SDK bundle overhead
- Revalidation is controlled by Next.js `revalidate` or `no-store` fetch options

### Client islands for interactivity
Only components that require browser APIs or interactivity are `'use client'`. Currently:
- `ReportsChart` — uses Recharts which requires the DOM and `window`
- Future: interactive map view, real-time data subscription

### Admin SDK singleton pattern
`src/lib/firebase-admin.ts` uses a lazy singleton to avoid re-initialising the Admin SDK across hot reloads in development:
```typescript
let adminApp: App
function getAdminApp(): App {
  if (adminApp) return adminApp
  if (getApps().length > 0) { adminApp = getApps()[0]; return adminApp }
  adminApp = initializeApp({ credential: cert({ ... }) })
  return adminApp
}
export const adminDb = getFirestore(getAdminApp())
export const adminAuth = getAuth(getAdminApp())
```

### Tailwind with BM-first labelling
All UI copy in `src/app/admin/` is in Bahasa Malaysia. This is a deliberate product decision — the admin users are Malaysian operators. English is used only in code identifiers and comments.

### typedRoutes experimental
`next.config.js` enables `experimental.typedRoutes: true`, which provides compile-time type safety for `href` props in `<Link>` and `redirect()` calls.

## State management approach

`arah-web` deliberately has no client-side global state manager (no Zustand, no Redux). The pattern is:

- **Server Components** own all data fetching via `adminDb` queries
- **URL search params** drive pagination, filtering, and sorting state (bookmarkable, shareable)
- **Client components** own only transient UI state (e.g. dropdown open/closed, optimistic delete)
- **Server Actions** (to be implemented) handle mutations (delete report, disable user) and revalidate the page

This approach keeps the client bundle small and avoids hydration mismatches.
