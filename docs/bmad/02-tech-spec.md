# arah-web — Technical Specification

## Runtime dependency table

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 14.2.5 | App Router SSR framework |
| `react` | 18.3.1 | UI rendering |
| `react-dom` | 18.3.1 | DOM renderer |
| `firebase` | ^10.13.0 | Client SDK: auth, Firestore (client-side), analytics |
| `firebase-admin` | ^12.4.0 | Server SDK: Firestore Admin, Auth Admin (server-only) |
| `recharts` | ^2.12.0 | Chart components (PieChart for report types, BarChart for analytics) |
| `maplibre-gl` | ^4.5.0 | MapLibre GL JS for any web map views (admin map, landing) |
| `react-map-gl` | ^7.1.7 | React wrapper for maplibre-gl |
| `date-fns` | ^3.6.0 | Date formatting for report timestamps |
| `clsx` | ^2.1.1 | Conditional Tailwind class composition |

## Dev dependency table

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.5.4 | Type system |
| `@types/node` | ^22.0.0 | Node.js type definitions (for server-side code) |
| `@types/react` | ^18.3.0 | React type definitions |
| `@types/react-dom` | ^18.3.0 | ReactDOM type definitions |
| `tailwindcss` | ^3.4.9 | Utility-first CSS framework |
| `postcss` | ^8.4.41 | CSS transformation pipeline |
| `autoprefixer` | ^10.4.20 | CSS vendor prefixing |
| `eslint` | ^8.57.0 | Linting |
| `eslint-config-next` | 14.2.5 | Next.js ESLint rules |

## File naming conventions

- **Pages** — `page.tsx` inside the App Router segment directory: `src/app/admin/reports/page.tsx`
- **Layouts** — `layout.tsx` inside the segment directory: `src/app/admin/layout.tsx`
- **Components** — PascalCase, no suffix, in feature subdirectory: `src/components/admin/StatsCard.tsx`
- **Library modules** — camelCase: `src/lib/firebase.ts`, `src/lib/firebase-admin.ts`
- **Server-only modules** — suffix pattern not enforced yet; convention: if it imports `firebase-admin`, it is server-only. Add `import 'server-only'` from the `server-only` package as a guard.
- **Types** — inline in component files for component-local types; shared types in `src/types/` (to be created)

## TypeScript configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "paths": { "@/*": ["./src/*"] },
    "plugins": [{ "name": "next" }]
  }
}
```

### Path alias usage
```typescript
// Always use @/ for src/ imports
import { adminDb } from '@/lib/firebase-admin'
import StatsCard from '@/components/admin/StatsCard'
```

### Server Component pattern (async)
```typescript
// src/app/admin/page.tsx
async function getStats() {
  const snap = await adminDb.collection('reports').where('active', '==', true).count().get()
  return { activeReports: snap.data().count }
}

export default async function AdminDashboard() {
  const stats = await getStats()
  return <StatsCard value={stats.activeReports} label="Laporan Aktif" icon="⚠️" />
}
```

### Client Component pattern
```typescript
'use client'
// Must have 'use client' directive
// Can use hooks (useState, useEffect), browser APIs, Recharts
import { PieChart, Pie } from 'recharts'

export default function ReportsChart({ data }: { data: { name: string; value: number }[] }) {
  return <PieChart>...</PieChart>
}
```

### Server Action pattern (to implement)
```typescript
'use server'
import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

export async function deleteReport(reportId: string) {
  await adminDb.collection('reports').doc(reportId).update({ active: false })
  revalidatePath('/admin/reports')
}
```

## Environment variables

### Client-side (prefixed with `NEXT_PUBLIC_`)

| Variable | Example | Notes |
|----------|---------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` | Safe to expose (Firebase design) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `arah-app.firebaseapp.com` | |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `arah-app` | |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `arah-app.appspot.com` | |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123:web:abc` | |

### Server-side only (no `NEXT_PUBLIC_` prefix — never exposed to browser)

| Variable | Example | Notes |
|----------|---------|-------|
| `FIREBASE_PROJECT_ID` | `arah-app` | Used by Admin SDK |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-...@arah-app.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN RSA PRIVATE KEY-----\n...` | Escape newlines as `\n` in `.env.local` |

**Critical:** Never import `src/lib/firebase-admin.ts` in a `'use client'` file. Next.js will bundle it into the client and expose the private key. The `server-only` package can be used as a compile-time guard.

## Error handling approach

### Server Components — throw and let Next.js handle
```typescript
// Next.js renders the nearest error.tsx boundary on thrown errors
async function getStats() {
  try {
    const snap = await adminDb.collection('reports').count().get()
    return snap.data().count
  } catch (err) {
    console.error('[AdminDashboard] Firestore error:', err)
    throw new Error('Gagal memuatkan data dashboard')  // Next.js error boundary catches this
  }
}
```

### Error boundaries
Create `src/app/admin/error.tsx` (a `'use client'` boundary) to show a graceful error UI when any admin server component throws.

### Route Handler errors
Return proper HTTP status codes:
```typescript
// src/app/api/reports/[id]/route.ts
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await adminDb.collection('reports').doc(params.id).update({ active: false })
    return new Response(null, { status: 204 })
  } catch {
    return Response.json({ error: 'Gagal memadam laporan' }, { status: 500 })
  }
}
```

## Testing approach

- **Unit tests** — not yet configured; add Jest + `@testing-library/react` for component tests
- **Integration tests** — not yet configured; consider Playwright for admin page smoke tests
- **Typecheck** — `npm run typecheck` runs `tsc --noEmit`; always pass before PR
- **ESLint** — `npm run lint` uses `eslint-config-next` which includes React hooks rules

```bash
npm run typecheck   # TypeScript validation
npm run lint        # ESLint
npm run build       # Build (catches server-component / client-component boundary violations)
```

Note: `npm run build` is the most reliable test — Next.js's compiler validates RSC boundaries, missing metadata, and route type safety during the build.

## Tailwind configuration

`tailwind.config.js` scans `src/**/*.{ts,tsx}`. Custom additions needed:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        arah: {
          blue: '#1565c0',  // Primary brand colour (matches OnboardingScreen backgroundColor)
          dark: '#0d47a1',  // Darker variant (sidebar)
        }
      }
    }
  }
}
```
