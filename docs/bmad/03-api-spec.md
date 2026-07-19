# arah-web — API Specification

`arah-web` is a Next.js App Router application. It consumes Firebase services server-side and exposes Next.js Route Handlers (`/api/*`) for client-initiated mutations. This document covers both.

---

## 1. Firebase Admin SDK — Firestore reads

All Firestore reads in admin pages are performed server-side using `adminDb` from `src/lib/firebase-admin.ts`. These are not HTTP calls — they are gRPC calls from the Next.js server to Firebase.

### Collection: `reports`

**Used by:** `src/app/admin/page.tsx`, `src/app/admin/reports/page.tsx`

#### Count of active reports (AdminDashboard)
```typescript
const snap = await adminDb.collection('reports').where('active', '==', true).count().get()
const count = snap.data().count  // number
```

#### Count by type (ReportsChart data)
```typescript
const byTypeSnap = await adminDb
  .collection('reports')
  .where('active', '==', true)
  .select('type')
  .get()

const byType: Record<string, number> = {}
byTypeSnap.forEach(doc => {
  const type = doc.data().type as string
  byType[type] = (byType[type] ?? 0) + 1
})
// Result: { police: 12, flood: 3, accident: 7, pothole: 45, roadblock: 2, hazard: 9 }
```

#### List active reports (ReportsPage)
```typescript
const snap = await adminDb
  .collection('reports')
  .where('active', '==', true)
  .orderBy('created_at', 'desc')
  .limit(50)
  .get()

// Documents have: id, type, lat, lng, upvotes, downvotes, active, created_at, expires_at, user_hash
const reports = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
```

**Document field types from Admin SDK:**

| Field | Admin SDK type | Notes |
|-------|---------------|-------|
| `type` | `string` | `police \| accident \| flood \| pothole \| roadblock \| hazard` |
| `lat` | `number` | |
| `lng` | `number` | |
| `upvotes` | `number` | |
| `downvotes` | `number` | |
| `active` | `boolean` | |
| `created_at` | `FirebaseFirestore.Timestamp` | Call `.toDate()` to get `Date` |
| `expires_at` | `FirebaseFirestore.Timestamp` | Call `.toDate()` to get `Date` |
| `user_hash` | `string` | SHA-256 of uid — never the raw uid |

### Collection: `users`

**Used by:** `src/app/admin/users/page.tsx` (to be created — story WEB-006)

#### Count of registered users
```typescript
const snap = await adminDb.collection('users').count().get()
const totalUsers = snap.data().count
```

#### List users (paginated)
```typescript
const snap = await adminDb
  .collection('users')
  .orderBy('created_at', 'desc')
  .limit(25)
  .get()

// For cursor pagination:
const lastDoc = snap.docs[snap.docs.length - 1]
const nextPage = await adminDb
  .collection('users')
  .orderBy('created_at', 'desc')
  .startAfter(lastDoc)
  .limit(25)
  .get()
```

**User document schema:**

| Field | Type | Notes |
|-------|------|-------|
| `uid` | `string` | Firebase Auth UID |
| `displayName` | `string` | From Google profile |
| `preferredLanguage` | `'ms' \| 'en'` | |
| `routePreferences` | `{ avoidTolls: boolean, avoidHighways: boolean }` | |
| `reportCount` | `number` | Denormalised counter |
| `created_at` | `Timestamp` | Account creation time |

---

## 2. Firebase Admin SDK — Auth operations

**Used by:** `src/app/admin/users/page.tsx` (story WEB-006), auth middleware (story WEB-004)

### Verify session token (middleware)
```typescript
import { adminAuth } from '@/lib/firebase-admin'

// In middleware.ts or a Route Handler:
const token = request.cookies.get('__session')?.value
const decoded = await adminAuth.verifyIdToken(token)
// decoded.uid — the user's Firebase UID
// Check if decoded.uid is in an admin allowlist
```

### List Firebase Auth users (admin user management)
```typescript
const listResult = await adminAuth.listUsers(1000)  // max 1000 per page
const users = listResult.users  // UserRecord[]
// UserRecord has: uid, email, displayName, disabled, metadata.creationTime
```

### Disable a user account
```typescript
await adminAuth.updateUser(uid, { disabled: true })
```

### Delete a user account
```typescript
await adminAuth.deleteUser(uid)
```

---

## 3. Next.js Route Handlers (internal API)

These are Next.js API routes at `src/app/api/`. They are called by client components and Server Actions.

### DELETE `/api/reports/[id]`

**File:** `src/app/api/reports/[id]/route.ts` (to be created — story WEB-002)

Soft-deletes a community report by setting `active: false`.

**Authentication:** Requires a valid Firebase session cookie. Returns `401` if not authenticated as admin.

**Request:** `DELETE /api/reports/abc123def456`

**Response (success):** `204 No Content`

**Response (error):**
```json
{ "error": "Gagal memadam laporan" }
```
HTTP 500.

**Implementation sketch:**
```typescript
// src/app/api/reports/[id]/route.ts
import { adminDb } from '@/lib/firebase-admin'
import { revalidatePath } from 'next/cache'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // TODO: verify admin session (WEB-004)
  await adminDb.collection('reports').doc(params.id).update({ active: false })
  revalidatePath('/admin/reports')
  return new Response(null, { status: 204 })
}
```

### PATCH `/api/users/[uid]/disable`

**File:** `src/app/api/users/[uid]/disable/route.ts` (to be created — story WEB-006)

Disables a Firebase Auth user account.

**Request:** `PATCH /api/users/uid123/disable`

**Response (success):** `200 OK` `{ "disabled": true }`

---

## 4. Firebase Client SDK (browser-side)

`src/lib/firebase.ts` initialises the client SDK for use in `'use client'` components.

### Exported singletons

```typescript
export const auth    // FirebaseAuth — for admin login flow
export const db      // Firestore — avoid direct Firestore calls in client; prefer server components
export const analytics  // Promise<Analytics | null> — for landing page event tracking
```

### Analytics event tracking (landing page)

```typescript
import { analytics } from '@/lib/firebase'
import { logEvent } from 'firebase/analytics'

// Track download button clicks
const ga = await analytics
if (ga) logEvent(ga, 'download_click', { platform: 'android' })
```

### Admin sign-in (client component)

```typescript
import { auth } from '@/lib/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'

const provider = new GoogleAuthProvider()
const result = await signInWithPopup(auth, provider)
const idToken = await result.user.getIdToken()
// POST idToken to /api/auth/session to create a server-side session cookie
```

---

## 5. Next.js Revalidation Strategy

| Page | Revalidation | Rationale |
|------|-------------|-----------|
| `/admin` (dashboard) | `{ revalidate: 60 }` | Stats freshen every 60s; acceptable for operators |
| `/admin/reports` | `{ cache: 'no-store' }` | Reports need to reflect deletes immediately |
| `/admin/users` | `{ revalidate: 300 }` | User list changes infrequently |
| `/` (landing) | `{ revalidate: false }` | Static — no Firestore calls |

Set in the Server Component file:
```typescript
export const revalidate = 60  // export from page.tsx
// or per-fetch:
const snap = await adminDb.collection('reports').count().get()  // Admin SDK bypasses Next.js cache
```

Note: Firebase Admin SDK calls bypass Next.js's fetch cache. To control Admin SDK caching, use `unstable_cache` from `next/cache`:
```typescript
import { unstable_cache } from 'next/cache'

const getStats = unstable_cache(
  async () => { /* adminDb queries */ },
  ['admin-stats'],
  { revalidate: 60, tags: ['reports'] }
)
```
