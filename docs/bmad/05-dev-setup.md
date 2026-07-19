# arah-web — Developer Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20 LTS | Use `nvm` or `fnm`: `nvm use 20` |
| npm | 10+ | Bundled with Node 20 |
| Docker | 24+ | Optional: for local Firebase emulator |
| Git | 2.40+ | Version control |
| Firebase CLI | 13+ | `npm install -g firebase-tools` — for emulator and deploy |

---

## Step 1: Clone and install dependencies

```bash
git clone https://github.com/deanz93/arah-web.git
cd arah-web
npm install
```

---

## Step 2: Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```bash
# Firebase client SDK (safe to expose in browser)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=arah-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=arah-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=arah-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (server-side only — never prefix with NEXT_PUBLIC_)
FIREBASE_PROJECT_ID=arah-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@arah-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----\n"

# Admin allowed emails (comma-separated, no spaces)
ADMIN_EMAILS=developer@plisca.com.my
```

### Getting Firebase credentials

1. Go to [Firebase Console](https://console.firebase.google.com) → select project `arah-app`
2. **Client SDK config**: Project Settings → General → Your apps → Web app → Config
3. **Admin SDK service account key**: Project Settings → Service Accounts → Generate new private key
   - Download the JSON file
   - Copy `client_email` → `FIREBASE_CLIENT_EMAIL`
   - Copy `private_key` → `FIREBASE_PRIVATE_KEY` (the entire PEM string including header/footer)
   - **Important:** In `.env.local`, escape newlines in `FIREBASE_PRIVATE_KEY` as literal `\n` within double quotes

---

## Step 3: Start the development server

```bash
npm run dev
```

The server starts at [http://localhost:3000](http://localhost:3000).

Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Step 4 (optional): Use Firebase Local Emulator Suite

For development without production Firebase data:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools
firebase login

# From the arah-web directory (or arah-functions repo)
firebase emulators:start --only firestore,auth

# Emulator UI: http://localhost:4000
# Firestore: http://localhost:8080
# Auth: http://localhost:9099
```

To use the emulator in Next.js, add to `.env.local`:
```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
```

The Firebase Admin SDK automatically detects these environment variables and connects to the emulator.

Seed the emulator with test data:
```bash
# Import sample data from arah-functions repo:
firebase emulators:start --only firestore,auth --import=./emulator-data
```

---

## Step 5: Verify Firebase Admin SDK connection

Create a test route to verify the Admin SDK is working:

```bash
curl http://localhost:3000/api/health
# Expected: {"firestore":"connected","reports":42}
```

If you see `FIREBASE_PRIVATE_KEY` errors, the most common cause is newline escaping. In `.env.local`, ensure the private key is wrapped in double quotes with `\n` escaping:

```bash
# Wrong:
FIREBASE_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----
MIIEow...

# Correct:
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----\n"
```

---

## Build and deploy

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Production build (validates RSC boundaries, typed routes)
npm run build

# Start production server locally
npm run start
```

The app is containerised via `Dockerfile` for deployment on AWS EKS (ap-southeast-1). The CI pipeline (`.github/workflows/ci.yml`) runs lint + typecheck + build on every PR to `main`.

---

## Firestore indexes required

The admin dashboard requires two Firestore composite indexes. Create these in the Firebase Console (Firestore Database → Indexes → Composite):

| Collection | Fields | Query scope |
|-----------|--------|------------|
| `reports` | `active` ASC, `lat` ASC | Collection |
| `reports` | `active` ASC, `created_at` DESC | Collection |
| `reports` | `user_hash` ASC, `created_at` DESC | Collection |
| `users` | `created_at` DESC | Collection |

Or deploy them via the Firebase CLI using `firestore.indexes.json` in the `arah-functions` repo:
```bash
cd ../arah-functions
firebase deploy --only firestore:indexes
```

---

## Common issues and fixes

### `Error: Failed to parse private key: Error: Invalid PEM formatted message`
The `FIREBASE_PRIVATE_KEY` in `.env.local` has literal newline characters instead of `\n` escape sequences. Wrap the entire key in double quotes and replace actual newlines with `\n`:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----\n"
```

### `FirebaseError: Missing or insufficient permissions`
Firestore security rules are blocking the Admin SDK. This should not happen — the Admin SDK bypasses client security rules. If you see this error, you may be accidentally using the **client SDK** instead of the Admin SDK in a server component. Check that your import is from `@/lib/firebase-admin`, not `@/lib/firebase`.

### `Error: NEXT_PUBLIC_FIREBASE_* is undefined`
Next.js requires a full rebuild after adding new `NEXT_PUBLIC_` environment variables. Stop the dev server and re-run `npm run dev`.

### MapLibre GL SSR error: `window is not defined`
`maplibre-gl` uses `window` and cannot be server-side rendered. Wrap any component that imports it with:
```typescript
import dynamic from 'next/dynamic'
const ReportsMap = dynamic(() => import('@/components/admin/ReportsMap'), { ssr: false })
```

### Recharts hydration mismatch
If `ReportsChart` shows a React hydration error, ensure it has `'use client'` at the top of the file. Recharts components must be client components.

### `SyntaxError: Cannot use import statement in a module` (firebase-admin)
This usually means `firebase-admin` is being bundled for the client. Find where `src/lib/firebase-admin.ts` is imported and ensure it is only in Server Components, Route Handlers, or Server Actions — never in `'use client'` files.

---

## Test data — Malaysian coordinates for map testing

| Location | Latitude | Longitude |
|----------|----------|-----------|
| Kuala Lumpur (default centre) | 3.1390 | 101.6869 |
| Bukit Bintang | 3.1466 | 101.7101 |
| Putrajaya | 2.9264 | 101.6964 |
| George Town, Penang | 5.4141 | 100.3288 |
| Johor Bahru | 1.4927 | 103.7414 |
| Kota Kinabalu, Sabah | 5.9804 | 116.0735 |
| Kuching, Sarawak | 1.5533 | 110.3592 |

Insert test reports into Firestore emulator for these coordinates to test the admin map view and reports table.

---

## Environment variables reference

| Variable | Required | Used in | Notes |
|----------|----------|---------|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Client | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Client | `arah-app.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Client | `arah-app` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Client | `arah-app.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Client | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Client | From Firebase console |
| `FIREBASE_PROJECT_ID` | Yes | Server | Same as public project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Server | Service account email |
| `FIREBASE_PRIVATE_KEY` | Yes | Server | Service account private key (PEM) |
| `ADMIN_EMAILS` | No | Server | Comma-separated admin allowlist |
| `FIRESTORE_EMULATOR_HOST` | Dev only | Server | `127.0.0.1:8080` for emulator |
| `FIREBASE_AUTH_EMULATOR_HOST` | Dev only | Server | `127.0.0.1:9099` for emulator |
