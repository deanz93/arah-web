# arah-web — Sprint Stories

Stories are ordered by dependency and value. Work top-to-bottom within each epic. Prefix: `WEB-`.

---

## Epic 1: Dashboard & Analytics

### WEB-001: Admin dashboard stats with live Firestore counts
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** MVP

**As an** Arah operator **I want** to see key platform metrics at a glance on the dashboard **so that** I can monitor platform health without querying the database directly.

**Acceptance criteria:**
- [ ] `AdminDashboard` server component fetches: active report count, total user count, count by report type
- [ ] Four `StatsCard` components show: "Laporan Aktif", "Pengguna Berdaftar", "Laporan Polis", "Laporan Banjir"
- [ ] `ReportsChart` pie chart shows all 6 report types with BM labels and distinct colours
- [ ] Dashboard data revalidates every 60 seconds (`export const revalidate = 60`)
- [ ] Loading state: Next.js `loading.tsx` shows skeleton cards

**Technical notes:** `src/app/admin/page.tsx` — wrap queries in `unstable_cache` with `revalidate: 60`; `StatsCard.tsx` accepts `delta?: number` prop for week-over-week delta; `src/app/admin/loading.tsx` with `animate-pulse` skeleton
**Estimate:** S

---

### WEB-002: Delete report from admin moderation table
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** MVP

**As an** Arah operator **I want** to delete a false or harmful community report **so that** it no longer appears on users' maps.

**Acceptance criteria:**
- [ ] Each row in the reports table has a "Padam" button
- [ ] Clicking "Padam" shows confirmation dialog: "Padam laporan ini? Tindakan ini tidak boleh dibatalkan."
- [ ] On confirm, calls `DELETE /api/reports/[id]` which sets `active: false` in Firestore
- [ ] Row is removed from the table immediately after deletion (optimistic update or page revalidation)
- [ ] On API error, shows BM-language toast: "Gagal memadam laporan. Cuba lagi."

**Technical notes:** `src/app/api/reports/[id]/route.ts` `DELETE` handler; `adminDb.collection('reports').doc(id).update({ active: false })`; `revalidatePath('/admin/reports')` after success; guard with admin auth check
**Estimate:** M

---

### WEB-003: Analytics page with time-series charts
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** MVP

**As an** Arah operator **I want** to see daily and weekly usage trends **so that** I can understand platform growth and user behaviour.

**Acceptance criteria:**
- [ ] `/admin/analytics` page with daily report submissions (7 days) and report type breakdown (30 days)
- [ ] Daily submissions chart uses Recharts `BarChart` with date on X-axis and count on Y-axis
- [ ] Data grouped by `created_at` date using Firestore queries with date range filters
- [ ] Charts use `ResponsiveContainer` and render correctly at all screen widths
- [ ] Date range picker allows 7d / 30d / 90d windows

**Technical notes:** `src/app/admin/analytics/page.tsx` (Server Component) + `src/components/admin/DailyChart.tsx` (client component for Recharts); `date-fns` `format(date, 'yyyy-MM-dd')` for grouping
**Estimate:** L

---

### WEB-010: Active sidebar navigation with current route highlighting
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** MVP

**As an** Arah operator **I want** the admin sidebar to highlight the active page **so that** I always know which section I'm in.

**Acceptance criteria:**
- [ ] Sidebar nav uses `usePathname()` to apply an active class to the current route
- [ ] Active link has a white background and dark text (or similar visual distinction)
- [ ] All nav items link to existing routes (Dashboard, Laporan, Pengguna, Analitik)
- [ ] Nav item added: `/admin/map` (Peta Admin) when WEB-008 is done

**Technical notes:** `src/app/admin/layout.tsx` is Server Component — convert nav to `'use client'` sub-component `AdminNav.tsx`; `clsx(baseClasses, { 'bg-white text-blue-900': isActive })`; `isActive = pathname === item.href || pathname.startsWith(item.href + '/')`
**Estimate:** S

---

### WEB-011: 7-day trend chart for DAU, reports, and routes
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** MVP

**As an** Arah operator **I want** to see a 7-day trend chart for daily active users, reports submitted, and routes computed **so that** I can spot growth or decline at a glance.

**Acceptance criteria:**
- [ ] Recharts `LineChart` with three series: DAU, reports, routes on shared date X-axis
- [ ] Server component fetches Firestore `analytics/daily/{date}` documents for the last 7 days
- [ ] Each line has a distinct colour; legend shows series names in BM
- [ ] Chart auto-refreshes every 30s via SWR `refreshInterval: 30000`
- [ ] Empty dates show zero values (not gaps in the line)

**Technical notes:** `src/components/admin/TrendChart7d.tsx` (`'use client'`); SWR `useSWR('/api/analytics/trend?days=7')`; API route `src/app/api/analytics/trend/route.ts` fetches Firestore `analytics/daily` subcollection; Recharts `ResponsiveContainer` + `LineChart`
**Estimate:** M

---

### WEB-012: 30-day trend chart with date range picker
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to view a 30-day trend and customise the date range **so that** I can analyse platform performance over any period.

**Acceptance criteria:**
- [ ] 30-day trend chart with same metrics as WEB-011
- [ ] Date range picker component allows custom start and end date selection
- [ ] URL search params reflect selected date range: `?from=2025-01-01&to=2025-01-31`
- [ ] Chart updates when date range changes without full page reload
- [ ] "Eksport CSV" button downloads the visible data range as a CSV file

**Technical notes:** `src/components/admin/DateRangePicker.tsx` (`'use client'`); `useRouter().push(newUrl)` on date change; server component reads `searchParams.from` and `searchParams.to`; `json2csv` for CSV export via browser download
**Estimate:** M

---

### WEB-013: Report heatmap on full MapLibre GL map
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to see a heatmap of report density across Malaysia **so that** I can identify hotspot areas and deploy moderation attention effectively.

**Acceptance criteria:**
- [ ] MapLibre GL map (`src/components/admin/ReportHeatmap.tsx`) centred on Malaysia
- [ ] Circle layer source: `GET /v1/reports?bbox=Malaysia_full` returns all active reports as GeoJSON
- [ ] Circle radius scales with report density per geohash cell (cluster-based sizing)
- [ ] Colour scale by report type: police=blue, accident=red, flood=teal, hazard=amber
- [ ] Layer toggle to switch between density heatmap and individual pin view

**Technical notes:** `src/components/admin/ReportHeatmap.tsx` (`'use client'`); `dynamic(() => import(...), { ssr: false })` to avoid Next.js SSR issues with `maplibre-gl`; Malaysia bbox: `sw: [1.0, 99.5], ne: [7.5, 119.5]`; MapLibre `HeatmapLayer` for density view
**Estimate:** L

---

### WEB-014: User retention cohort table
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to see Day-1, Day-7, and Day-30 retention rates for user cohorts **so that** I understand how well the app retains new users.

**Acceptance criteria:**
- [ ] Retention table shows monthly cohorts (rows) vs retention periods Day-1/Day-7/Day-30 (columns)
- [ ] Data from Firestore `analytics/cohorts/{month}` collection
- [ ] Cells show retention percentage; colour-coded green (>50%), amber (20–50%), red (<20%)
- [ ] Table covers the last 6 months of cohorts
- [ ] Tooltip on hover shows absolute user count and percentage

**Technical notes:** `src/app/(admin)/dashboard/page.tsx` extends with cohort table; Firestore `analytics/cohorts/{YYYY-MM} { day1Retention, day7Retention, day30Retention, cohortSize }`; `clsx` for cell colour; `title` attribute for tooltip
**Estimate:** M

---

### WEB-015: Feature usage analytics — report types and navigation stats
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to see which report types are most used and navigation session statistics **so that** I can prioritise features and understand user behaviour.

**Acceptance criteria:**
- [ ] Pie chart showing report type breakdown (police/accident/flood/pothole/etc.) with BM labels
- [ ] Navigation session stats: average duration (minutes), average distance (km), sessions per day
- [ ] "Jenis Laporan Terpopular" section ranks all 10 report types by count
- [ ] Date range filter applies to all feature usage charts
- [ ] Stats refreshed every 5 minutes via SWR

**Technical notes:** `src/components/admin/FeatureUsagePanel.tsx`; Recharts `PieChart` + `Cell`; navigation stats from Firestore `analytics/navigation` collection; `GET /v1/admin/analytics/usage?from=&to=`
**Estimate:** M

---

### WEB-016: Geography analytics — popular route corridors
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v2

**As an** Arah operator **I want** to see popular route corridors and top origin-destination pairs **so that** I can understand travel patterns and focus map quality improvements.

**Acceptance criteria:**
- [ ] MapLibre heatmap showing popular route corridors (line density) across Malaysia
- [ ] Table of top 10 origin → destination pairs (city-level, not exact coordinates)
- [ ] Route corridor data from Firestore `analytics/route_corridors` collection
- [ ] OD pairs aggregated at JPN (Pekan, District) level to preserve privacy
- [ ] Table is sortable by trip count

**Technical notes:** `src/app/(admin)/analytics/geography/page.tsx`; corridor data: GeoJSON LineString features with `count` property; MapLibre `LineLayer` with `lineWidth` expression based on count; OD pair aggregation done server-side
**Estimate:** L

---

### WEB-017: API monitoring panel with latency metrics
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to see API health metrics (request rate, error rate, p99 latency) **so that** I can detect performance degradation before users report it.

**Acceptance criteria:**
- [ ] API monitoring panel on dashboard shows: requests/s, error rate %, p99 latency per endpoint
- [ ] Data pulled from Prometheus `/api/metrics` proxy endpoint every 30s via SWR
- [ ] Endpoints monitored: `/v1/route`, `/v1/reports`, `/v1/geocode/search`, `/v1/traffic`
- [ ] Error rate > 5% shows amber badge; > 10% shows red badge
- [ ] p99 latency > 2000ms shows warning indicator

**Technical notes:** `src/components/admin/APIMonitorPanel.tsx`; `GET /api/metrics` Next.js API route proxies Prometheus queries; Prometheus PromQL: `rate(http_requests_total[1m])` and `histogram_quantile(0.99, http_request_duration_seconds_bucket)`; SWR `refreshInterval: 30000`
**Estimate:** L

---

### WEB-018: Date range filter for all dashboard widgets
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** a single date range filter that updates all dashboard widgets simultaneously **so that** I can analyse a specific time period without setting filters on each widget separately.

**Acceptance criteria:**
- [ ] Global date range selector at top of dashboard: Today / 7d / 30d / Custom
- [ ] Selecting a range updates URL search params: `?period=7d` or `?from=2025-01-01&to=2025-01-07`
- [ ] All server-fetched widgets pass the date range to their Firestore queries
- [ ] All SWR-fetched client components include the date range in their fetch keys
- [ ] Default is "7d" on first load

**Technical notes:** `src/components/admin/DashboardDateFilter.tsx` (`'use client'`); `useRouter().replace(newUrl)` to update search params; server components read `searchParams.period`; SWR key includes `period` so changing filter triggers re-fetch
**Estimate:** M

---

### WEB-019: Export dashboard data to CSV
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v1

**As an** Arah operator **I want** to export any chart or table to CSV **so that** I can share data with stakeholders or analyse it in Excel.

**Acceptance criteria:**
- [ ] "Eksport CSV" button on each chart/table section in the dashboard
- [ ] `json2csv` library converts the chart's data array to CSV format
- [ ] CSV download triggered via `<a href="data:text/csv,...">` blob URL
- [ ] Filename includes chart name and date range: `laporan-harian-2025-01-01-to-2025-01-07.csv`
- [ ] Export respects the current date range filter

**Technical notes:** `src/utils/exportCsv.ts` `exportToCSV(data, filename)`; `json2csv` `Parser` class; `URL.createObjectURL(blob)` + programmatic `<a>` click; applied to: daily stats, report type breakdown, cohort table
**Estimate:** S

---

### WEB-020: Revenue dashboard scaffold (v3 placeholder)
**Epic:** Dashboard & Analytics
**Status:** 🔲 Todo
**Feature:** DASH-001
**Priority:** v2

**As an** Arah product manager **I want** a revenue section on the dashboard **so that** when subscription features launch in v3, the dashboard already has a dedicated section.

**Acceptance criteria:**
- [ ] "Hasil" (Revenue) section on dashboard shows greyed-out KPI placeholders
- [ ] Placeholder KPIs: Subscription Count, ARPU (Average Revenue Per User), MRR
- [ ] Each placeholder shows "Em lagi" badge indicating future feature
- [ ] Section is visually distinct (dashed border, grey background) from live metrics
- [ ] No backend calls made for greyed-out placeholders

**Technical notes:** `src/components/admin/RevenuePlaceholder.tsx`; static component, no data fetching; `opacity-50 pointer-events-none` Tailwind classes; "Em lagi" badge using `bg-gray-200 text-gray-500` pill
**Estimate:** S

---

## Epic 2: Report Moderation

### WEB-005: Report filter and search
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** MVP

**As an** Arah operator **I want** to filter the reports table by type and search by location coordinates **so that** I can find specific reports quickly.

**Acceptance criteria:**
- [ ] Report table filter dropdown: "Semua Jenis" / "Polis" / "Kemalangan" / "Banjir" / "Lubang" / "Sekatan" / "Bahaya"
- [ ] Text input allows filtering by coordinate prefix
- [ ] Filters reflected in URL search params: `/admin/reports?type=police`
- [ ] Server component reads `searchParams.type` and applies `.where('type', '==', type)` to Firestore query
- [ ] Filter state persists on page navigation and refresh (URL-driven)

**Technical notes:** `export default async function ReportsPage({ searchParams }: { searchParams: { type?: string } })`; client-side filter controls use `<Link>` with query params; coordinate search filtered client-side from fetched 50 results
**Estimate:** M

---

### WEB-021: Moderation queue — paginated report table
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** MVP

**As an** Arah operator **I want** a paginated table of all active reports **so that** I can efficiently review and moderate community reports.

**Acceptance criteria:**
- [ ] `src/app/(admin)/reports/page.tsx` renders paginated table, 50 rows per page, cursor-based
- [ ] Columns: Type (icon+label), Photo thumbnail (if attached), Coordinates, Upvotes, Downvotes, Age, Status
- [ ] Rows sortable by: Downvotes (default desc), Age, Type
- [ ] Cursor pagination: "Seterusnya" / "Sebelumnya" buttons; cursor = last Firestore doc ID
- [ ] Total report count shown above table: "Menunjukkan 50 daripada {total} laporan"

**Technical notes:** `src/app/(admin)/reports/page.tsx`; Firestore query: `adminDb.collection('reports').where('active', '==', true).orderBy('downvotes', 'desc').limit(50).startAfter(cursor)`; cursor passed as URL param `?cursor={docId}`
**Estimate:** M

---

### WEB-022: Report detail drawer with full metadata
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** MVP

**As an** Arah operator **I want** to click a report row and see full details in a side drawer **so that** I can assess the report without leaving the moderation table.

**Acceptance criteria:**
- [ ] Clicking a row opens a slide-in drawer from the right (350px wide)
- [ ] Drawer shows: report type, timestamp, coordinates (clickable to copy), `user_hash` (truncated), photo (full size if attached), upvotes, downvotes, vote history timeline, flag count
- [ ] "Padam" and "Pulihkan" (Restore) buttons in drawer header
- [ ] Drawer closes on Escape key or clicking outside
- [ ] "Lihat di Peta" button opens MapLibre modal (WEB-023)

**Technical notes:** `src/components/admin/ReportDetailDrawer.tsx` (`'use client'`); URL param `?reportId={id}` drives drawer open state; `useSearchParams` + `router.push` to open/close; smooth slide animation via CSS `transition: transform 300ms`
**Estimate:** M

---

### WEB-023: View report on map in modal
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** to see a report's exact map location **so that** I can verify the reported location is real and the report makes sense.

**Acceptance criteria:**
- [ ] "Lihat di Peta" button in report detail drawer opens a MapLibre modal
- [ ] Modal map is centred on the report's coordinates with zoom 15
- [ ] Report pin displayed with type-specific icon at exact coordinates
- [ ] Nearby reports also shown on the modal map for context
- [ ] Modal has "Padam" button that triggers report deletion and closes modal + drawer

**Technical notes:** `src/components/admin/ReportMapModal.tsx` (`'use client'`); `dynamic(() => import('maplibre-gl'), { ssr: false })`; `maplibregl.Map` initialised in `useEffect`; pin added via `maplibregl.Marker`; modal via Headless UI `Dialog`
**Estimate:** M

---

### WEB-024: Bulk select and delete reports
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** to select multiple reports and delete them at once **so that** I can clear spam or false reports efficiently without deleting one at a time.

**Acceptance criteria:**
- [ ] Checkbox on each report row; master checkbox in header selects/deselects all visible rows
- [ ] "Padam Dipilih ({n})" button appears in table toolbar when any row is checked
- [ ] Clicking "Padam Dipilih" shows confirmation: "Padam {n} laporan yang dipilih?"
- [ ] On confirm, sends parallel `DELETE /api/reports/:id` requests with a progress indicator
- [ ] Success toast: "{n} laporan berjaya dipadam"; failed deletes listed separately

**Technical notes:** `src/components/admin/ReportsTable.tsx` checkbox state in `useState<Set<string>>`; `Promise.allSettled(ids.map(id => fetch(`/api/reports/${id}`, { method: 'DELETE' })))` for parallel deletes; progress: count resolved / total
**Estimate:** M

---

### WEB-025: Auto-refresh reports table on WebSocket event
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** the reports table to update automatically when new reports arrive **so that** I always see the latest reports without manual refresh.

**Acceptance criteria:**
- [ ] Socket.io client (`src/lib/socket.ts`) connects to `/reports` namespace on page mount
- [ ] On `report:new` event, new row is prepended to the table with a subtle "Baru" badge for 5 seconds
- [ ] On `report:removed` event, corresponding row fades out and is removed
- [ ] WebSocket connection status shown in table header: green dot (connected) / amber (connecting)
- [ ] Socket disconnects when admin navigates away from `/admin/reports` page

**Technical notes:** `src/lib/socket.ts` `io(WS_URL + '/reports', { auth: { token } })`; token from `document.cookie` session; `socket.on('report:new', report => setReports(prev => [report, ...prev]))`; cleanup in `useEffect` return `socket.disconnect()`
**Estimate:** M

---

### WEB-026: Flagged report review queue
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** a separate queue for flagged reports **so that** community-flagged content gets prompt moderation attention.

**Acceptance criteria:**
- [ ] "Dilaporkan" tab on the reports page shows reports with `flag_count >= 1`
- [ ] Table columns: Type, Flag Count, Flagged At (first flag timestamp), Status
- [ ] "Luluskan" (Approve — dismiss all flags, mark as valid) button per row
- [ ] "Padam" (Delete — flag confirmed as spam) button per row
- [ ] Flag queue count shown in sidebar badge: "Laporan (3)"

**Technical notes:** `src/app/(admin)/reports/flagged/page.tsx`; Firestore query: `.where('flag_count', '>=', 1).where('active', '==', true)`; "Luluskan" → `PATCH /api/reports/:id { flags: 0, flagReviewed: true }`; badge count from Firestore `adminDb.collection('reports').where('flag_count', '>=', 1).count()`
**Estimate:** M

---

### WEB-027: Export reports to CSV
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** to export the current filtered report list as a CSV **so that** I can share moderation data with the team or keep records.

**Acceptance criteria:**
- [ ] "Eksport CSV" button above report table triggers `GET /v1/reports?format=csv&type=...&from=...&to=...`
- [ ] CSV includes columns: id, type, lat, lng, created_at, expires_at, upvotes, downvotes, status, flag_count
- [ ] Current filter state (type, date range) is applied to the export
- [ ] Download filename: `laporan-{type}-{from}-{to}.csv`
- [ ] Streaming response for large exports (> 1000 rows) using Next.js `StreamingResponse`

**Technical notes:** `src/app/api/reports/export/route.ts`; `GET /v1/reports?format=csv` via arah-api; or query Firestore directly in Next.js API route and stream CSV using `json2csv` `AsyncParser`; `Content-Disposition: attachment; filename=...` response header
**Estimate:** M

---

### WEB-028: Report trend sparkline on moderation page
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** to see a 7-day report trend sparkline on the moderation page **so that** I can tell at a glance whether report volume is increasing.

**Acceptance criteria:**
- [ ] Small Recharts `AreaChart` sparkline above the report table (height: 60px)
- [ ] Shows reports per day for the last 7 days
- [ ] Area colour: green if trend is flat/declining, amber if increasing > 20%
- [ ] Hovering the sparkline shows date and count tooltip
- [ ] Sparkline data fetched via SWR `useSWR('/api/analytics/reports/trend?days=7')`

**Technical notes:** `src/components/admin/ReportTrendSparkline.tsx`; Recharts `AreaChart` `width="100%"` `height={60}` no axes for sparkline look; trend calculation: `(day7Count - day1Count) / day1Count * 100`; `clsx` for colour
**Estimate:** S

---

### WEB-029: Expired reports archive view
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v2

**As an** Arah operator **I want** to view reports that have expired in the last 30 days **so that** I can audit past moderation activity and review historical incidents.

**Acceptance criteria:**
- [ ] "Arkib" tab on reports page shows expired reports from last 30 days
- [ ] Table is read-only: no delete or approve buttons (data is archived)
- [ ] Columns: Type, Location, Created At, Expired At, Final Vote Counts
- [ ] Filterable by type and date range (max 30-day window)
- [ ] Download to CSV available (reuses WEB-027 export with `status=expired` filter)

**Technical notes:** `src/app/(admin)/reports/archived/page.tsx`; Firestore query: `.where('active', '==', false).where('expires_at', '>=', thirtyDaysAgo).orderBy('expires_at', 'desc').limit(100)`; read-only rendering (no action buttons)
**Estimate:** M

---

### WEB-030: Report count badge in sidebar navigation
**Epic:** Report Moderation
**Status:** 🔲 Todo
**Feature:** MOD-001
**Priority:** v1

**As an** Arah operator **I want** to see a badge count on the sidebar "Laporan" link **so that** I know how many reports need urgent moderation attention without opening the page.

**Acceptance criteria:**
- [ ] Sidebar "Laporan" link shows a red badge with count of pending moderation reports
- [ ] "Pending moderation" = reports with `flag_count >= 1` OR `downvotes - upvotes >= 2`
- [ ] Badge count updates every 60s via SWR polling
- [ ] Badge disappears when count is 0
- [ ] Badge count also shown in `<title>` tag: "(3) Laporan | Arah Admin"

**Technical notes:** `src/components/admin/AdminNav.tsx` (`'use client'`); SWR `useSWR('/api/reports/pending-count', { refreshInterval: 60000 })`; `<span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{count}</span>`; `useEffect` updates `document.title`
**Estimate:** S

---

## Epic 3: User Management

### WEB-006: User management page
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** MVP

**As an** Arah operator **I want** to view all registered users and disable problematic accounts **so that** I can enforce platform community standards.

**Acceptance criteria:**
- [ ] `/admin/users` page lists users from Firestore `users` collection (25 per page, cursor pagination)
- [ ] Table columns: Display name, UID (truncated), Language, Reports submitted, Joined date
- [ ] "Nyahdayakan" (Disable) button calls `PATCH /api/users/[uid]/disable` → `adminAuth.updateUser(uid, { disabled: true })`
- [ ] Disabled users shown with red "Dinyahdayakan" badge
- [ ] Pagination: "Seterusnya" / "Sebelumnya" buttons with Firestore cursor (`startAfter(lastDoc)`)

**Technical notes:** `src/app/admin/users/page.tsx` (Server Component); Firestore query: `adminDb.collection('users').orderBy('created_at', 'desc').limit(25)`; Firebase Auth status fetched via `adminAuth.getUser(uid)` and merged
**Estimate:** L

---

### WEB-007: User report history
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** MVP

**As an** Arah operator **I want** to view all reports submitted by a specific user **so that** I can assess if a user is submitting false reports before disabling their account.

**Acceptance criteria:**
- [ ] Clicking a user in user table navigates to `/admin/users/[uid]` detail page
- [ ] Detail page shows: user info card + table of all reports by `user_hash` (derived from uid)
- [ ] Report table shows: type, coordinates, upvotes, downvotes, status, date
- [ ] "Padam" button on each report row deletes it (reuses WEB-002 logic)
- [ ] "Nyahdayakan Pengguna" button shown on the detail page

**Technical notes:** `user_hash = createHash('sha256').update(uid).digest('hex')`; Firestore query: `.where('user_hash', '==', hash).orderBy('created_at', 'desc').limit(50)`; composite index required: `(user_hash, created_at)`
**Estimate:** M

---

### WEB-031: User profile drawer with activity overview
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** MVP

**As an** Arah operator **I want** to click a user row and see their profile details in a side drawer **so that** I can quickly review a user without navigating away from the user list.

**Acceptance criteria:**
- [ ] Clicking a row opens a 380px right-side drawer with: avatar, display name, email/phone, join date, platform (Android/iOS/Web), report count, ban status (if any), last login
- [ ] "Sekat" (Ban) and "Lihat Laporan" buttons in drawer
- [ ] Ban status shows: duration remaining if temporarily banned, "Disekat Kekal" if permanent
- [ ] Drawer shows last 3 reports submitted by user as a mini-list
- [ ] Drawer closes on Escape or outside click

**Technical notes:** `src/components/admin/UserProfileDrawer.tsx`; URL param `?userId={uid}` drives drawer state; `GET /api/admin/users/:uid` returns merged Firestore + Firebase Auth data; last 3 reports from Firestore `reports` filtered by `user_hash`
**Estimate:** M

---

### WEB-032: Search users by name, phone, or email
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** MVP

**As an** Arah operator **I want** to search for a user by name, phone number, or email **so that** I can quickly find a specific account to investigate.

**Acceptance criteria:**
- [ ] Search input above user table with 300ms debounce
- [ ] Search fires `GET /v1/admin/users?q={query}` with query routed to the arah-api
- [ ] Results match against `displayName`, `phoneNumber`, and `email` fields
- [ ] Empty search shows the default paginated user list
- [ ] "Tiada pengguna dijumpai" state shown for zero results

**Technical notes:** `src/components/admin/UserSearch.tsx` (`'use client'`); SWR `useSWR(query.length > 2 ? `/api/admin/users?q=${query}` : null)`; API route proxies to `GET /v1/admin/users?q=` (arah-api); Firebase Admin `listUsers()` filtered client-side for small user base
**Estimate:** M

---

### WEB-033: Ban user with reason and duration
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As an** Arah operator **I want** to ban a user for a specified duration with a reason **so that** disruptive users are suspended and a record of why exists.

**Acceptance criteria:**
- [ ] "Sekat Pengguna" button opens a modal form with: reason text input (required), duration selector (1 hari / 7 hari / 30 hari / Kekal)
- [ ] Submitting calls `POST /v1/admin/users/:uid/ban { reason, duration_days }` (or `null` for permanent)
- [ ] On success, user profile drawer and table row show "Disekat" red badge with duration remaining
- [ ] Ban action written to Firestore `audit_log` collection with actor, reason, timestamp
- [ ] Banned user receives FCM notification: "Akaun anda telah disekat. Sebab: {reason}"

**Technical notes:** `src/components/admin/BanUserModal.tsx`; `POST /v1/admin/users/:uid/ban` sets Firestore `users/{uid}.ban: { reason, expiresAt, bannedBy }`; Firebase Auth `updateUser(uid, { disabled: true })` for permanent ban; audit log entry: `adminDb.collection('audit_log').add({ actor, action: 'ban_user', target: uid, reason, timestamp })`
**Estimate:** M

---

### WEB-034: Unban user
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As an** Arah operator **I want** to unban a previously banned user **so that** users who have served their suspension or were banned in error can access the platform again.

**Acceptance criteria:**
- [ ] "Nyahsekat" button shown only on banned users in the user profile drawer
- [ ] Confirmation dialog: "Nyahsekat pengguna ini?"
- [ ] On confirm, calls `DELETE /v1/admin/users/:uid/ban`
- [ ] Unban action removes Firestore `users/{uid}.ban` field and re-enables Firebase Auth user
- [ ] Audit log entry created: `{ actor, action: 'unban_user', target: uid, timestamp }`
- [ ] User drawer and table badge update immediately (optimistic)

**Technical notes:** `DELETE /v1/admin/users/:uid/ban` → `adminDb.collection('users').doc(uid).update({ ban: FieldValue.delete() })` + `adminAuth.updateUser(uid, { disabled: false })`; audit log via `adminDb.collection('audit_log').add(...)`
**Estimate:** S

---

### WEB-035: Promote user to admin role
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As a** super-admin **I want** to promote a regular user to admin **so that** trusted team members can access the admin panel.

**Acceptance criteria:**
- [ ] "Jadikan Admin" button in user profile drawer (only visible to super-admins)
- [ ] Confirmation: "Jadikan {displayName} sebagai pentadbir? Mereka akan mendapat akses penuh ke panel admin."
- [ ] On confirm, calls `POST /v1/admin/users/:uid/promote-admin`
- [ ] API calls Firebase Admin `setCustomUserClaims(uid, { admin: true, role: 'admin' })`
- [ ] User profile drawer shows "Admin" badge after promotion
- [ ] Audit log entry created for the promotion

**Technical notes:** `POST /v1/admin/users/:uid/promote-admin`; `adminAuth.setCustomUserClaims(uid, { admin: true })`; only callable by users with `role: 'superadmin'` claim; Firestore `users/{uid}.role = 'admin'` updated for display
**Estimate:** M

---

### WEB-036: View user reports from user drawer
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As an** Arah operator **I want** to jump from a user's drawer directly to their report history **so that** I can investigate suspicious reporting patterns without losing my place.

**Acceptance criteria:**
- [ ] "Lihat Laporan" button in user profile drawer navigates to `/admin/reports?userHash={hash}`
- [ ] Reports page filters to only show that user's reports when `userHash` URL param is set
- [ ] "← Kembali ke Pengguna" back link appears in report table header when filtered by user
- [ ] User hash is computed from uid for the filter: `SHA256(uid)` (server-side)
- [ ] Filter label shows: "Menapis laporan untuk pengguna: {displayName}"

**Technical notes:** `src/app/(admin)/reports/page.tsx` reads `searchParams.userHash`; adds Firestore `.where('user_hash', '==', userHash)` when param present; `<Link href={`/admin/users?userId=${uid}`}>← Kembali</Link>` in breadcrumb
**Estimate:** S

---

### WEB-037: User growth chart — new signups per day
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As an** Arah operator **I want** to see a chart of new user signups per day **so that** I can measure the impact of marketing campaigns and app store releases.

**Acceptance criteria:**
- [ ] Recharts `BarChart` on the users page showing new signups per day for last 30 days
- [ ] Data from Firestore `analytics/signups/{date} { count, android, ios, web }` documents
- [ ] Stacked bars: Android (green), iOS (blue), Web (purple) per day
- [ ] Total signup count shown above chart: "349 pengguna baru bulan ini"
- [ ] Date range filter: 7d / 30d / 90d

**Technical notes:** `src/components/admin/UserGrowthChart.tsx`; Recharts `BarChart` with `stackId="a"`; Firestore batch read 30 documents in parallel with `Promise.all`; `src/app/(admin)/users/page.tsx` includes chart above the user table
**Estimate:** M

---

### WEB-038: Bulk user export to CSV
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v1

**As an** Arah operator **I want** to export all user data to CSV **so that** I can perform offline analysis or create mailing lists for announcements.

**Acceptance criteria:**
- [ ] "Eksport Pengguna CSV" button above user table triggers export
- [ ] CSV includes non-sensitive fields: uid (truncated), displayName, language, reportCount, joinedAt, platform, state (region)
- [ ] Email and phone number are NOT included in export (privacy — PDPA)
- [ ] Export fetches all users (not just current page) using cursor pagination internally
- [ ] Progress toast while generating: "Menjana CSV... ({count} pengguna)"

**Technical notes:** `src/app/api/admin/users/export/route.ts`; streaming CSV via `AsyncParser` from `json2csv`; Firestore `listUsers` in Firebase Admin SDK; exclude `email`, `phoneNumber`, `providerData` from export; `Content-Disposition: attachment; filename=pengguna-{date}.csv`
**Estimate:** M

---

### WEB-039: User activity timeline
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v2

**As an** Arah operator **I want** to see a timeline of a user's activity (logins, reports, profile edits) **so that** I can reconstruct their activity pattern when investigating an account.

**Acceptance criteria:**
- [ ] Activity timeline in user detail page (`/admin/users/[uid]`) below the report table
- [ ] Shows: login events, reports submitted, profile edits, ban/unban events
- [ ] Events sourced from Firestore `audit_log` filtered by `target_uid = uid`
- [ ] Timeline shows last 50 events; "Muatkan Lebih" pagination
- [ ] Each event shows: timestamp, event type icon, description, IP address (if available)

**Technical notes:** `src/components/admin/UserActivityTimeline.tsx`; Firestore `adminDb.collection('audit_log').where('target_uid', '==', uid).orderBy('timestamp', 'desc').limit(50)`; event type icons using Heroicons; login events written by Cloud Function on Firebase Auth `user.signin` trigger
**Estimate:** L

---

### WEB-040: User demographic breakdown charts
**Epic:** User Management
**Status:** 🔲 Todo
**Feature:** USR-001
**Priority:** v2

**As an** Arah operator **I want** to see demographic breakdowns by platform and region **so that** I understand our user base and can target improvements.

**Acceptance criteria:**
- [ ] Platform pie chart: Android / iOS / Web percentage breakdown
- [ ] Region bar chart: top 13 Malaysian states + WP by user count
- [ ] Data from Firestore `analytics/demographics` document
- [ ] Charts on `/admin/analytics` page under "Demografi Pengguna" section
- [ ] Both charts respect the dashboard date range filter

**Technical notes:** `src/components/admin/DemographicsPanel.tsx`; Recharts `PieChart` for platform; Recharts `BarChart` (horizontal) for states; Firestore `analytics/demographics { platforms: {...}, states: {...} }` document updated by Cloud Function daily; state names from `src/constants/states.ts`
**Estimate:** M

---

## Epic 4: Flood Zone & Alert Management

### WEB-041: Flood zone list with severity and status
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** MVP

**As an** Arah operator **I want** to see all defined flood zones in a table **so that** I can manage and monitor which areas are designated as flood-risk zones.

**Acceptance criteria:**
- [ ] `src/app/(admin)/flood-zones/page.tsx` shows table of all flood zones
- [ ] Columns: Name, State, Severity (Low/Medium/High), Area (km²), Last Report At, Active status toggle
- [ ] Severity shown as colour-coded badge: Low=yellow, Medium=orange, High=red
- [ ] Active/inactive toggle per zone (inactive zones are not used in routing or alerts)
- [ ] "Tambah Zon" (Add Zone) button opens draw mode (WEB-042)

**Technical notes:** Firestore `flood_zones` collection; `src/app/(admin)/flood-zones/page.tsx`; server component fetches `adminDb.collection('flood_zones').orderBy('severity', 'desc').get()`; active toggle → `PATCH /v1/flood-zones/:id { active }`
**Estimate:** M

---

### WEB-042: Draw flood zone polygon on MapLibre
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** MVP

**As an** Arah operator **I want** to draw a flood zone polygon directly on the map **so that** I can define precise geographic areas at risk of flooding.

**Acceptance criteria:**
- [ ] "Tambah Zon" enters MapLibre draw mode using `@maplibre/maplibre-gl-draw`
- [ ] Operator clicks to place polygon vertices; double-click to close polygon
- [ ] After drawing, a form appears: Name (required), State, Severity (Low/Medium/High)
- [ ] Submitting calls `POST /v1/flood-zones { name, state, severity, polygon: GeoJSON }`
- [ ] New zone appears on map immediately as a coloured polygon fill

**Technical notes:** `src/components/admin/FloodZoneMapEditor.tsx` (`'use client'`); `MapboxDraw` initialised with `modes: { draw_polygon, simple_select, direct_select }`; draw result: `drawControl.getAll().features[0].geometry`; `POST /v1/flood-zones` body includes `{ type: "Feature", geometry: { type: "Polygon", coordinates: [...] } }`
**Estimate:** L

---

### WEB-043: Edit existing flood zone geometry and severity
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** v1

**As an** Arah operator **I want** to edit an existing flood zone's boundary or severity **so that** I can refine zones as better flood risk information becomes available.

**Acceptance criteria:**
- [ ] Clicking a flood zone polygon on the map enters edit mode (vertex handles appear)
- [ ] Dragging vertices reshapes the polygon; drag polygon to move entire zone
- [ ] "Simpan" button calls `PATCH /v1/flood-zones/:id { polygon, severity }` with updated geometry
- [ ] Severity dropdown visible in edit panel alongside the map
- [ ] "Batal" cancels edit and reverts to original polygon

**Technical notes:** `MapboxDraw` `simple_select` mode with `direct_select` for vertex editing; load existing polygon via `drawControl.add(existingGeoJSON)`; `PATCH /v1/flood-zones/:id` updates Firestore `flood_zones/{id}`; optimistic map update on save
**Estimate:** M

---

### WEB-044: Delete flood zone with confirmation
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** v1

**As an** Arah operator **I want** to delete a flood zone that is no longer relevant **so that** the routing and alert system doesn't avoid areas that are no longer at risk.

**Acceptance criteria:**
- [ ] "Padam Zon" button in flood zone table row or map edit panel
- [ ] Confirmation dialog: "Padam zon banjir '{name}'? Pengguna tidak akan lagi mendapat amaran untuk kawasan ini."
- [ ] On confirm, calls `DELETE /v1/flood-zones/:id`
- [ ] Zone polygon removed from map immediately (optimistic update)
- [ ] Toast: "Zon banjir '{name}' telah dipadam"

**Technical notes:** `DELETE /v1/flood-zones/:id`; Firestore `adminDb.collection('flood_zones').doc(id).delete()`; map removal: `drawControl.delete(featureId)` or remove MapLibre source layer; revalidate flood zones list
**Estimate:** S

---

### WEB-045: Severity colour coding on flood zone map
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** MVP

**As an** Arah operator **I want** flood zones colour-coded by severity on the map **so that** I can immediately see the risk level of each zone without reading labels.

**Acceptance criteria:**
- [ ] Low severity: yellow fill (`rgba(255, 235, 59, 0.3)`) + yellow stroke
- [ ] Medium severity: orange fill (`rgba(255, 152, 0, 0.4)`) + orange stroke
- [ ] High severity: red fill (`rgba(244, 67, 54, 0.5)`) + red stroke
- [ ] Colour legend shown in map corner: Low / Sederhana / Tinggi
- [ ] Colours match the severity badges in the table (WEB-041)

**Technical notes:** MapLibre `FillLayer` `fill-color` expression: `['match', ['get', 'severity'], 'low', 'rgba(255,235,59,0.3)', 'medium', 'rgba(255,152,0,0.4)', 'high', 'rgba(244,67,54,0.5)', 'transparent']`; `LineLayer` for border with matching colour
**Estimate:** S

---

### WEB-046: Emergency broadcast to flood zone users
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** MVP

**As an** Arah operator **I want** to send an emergency broadcast to users in a specific flood zone **so that** I can alert affected drivers immediately during a flood event.

**Acceptance criteria:**
- [ ] "Hantar Amaran Kecemasan" button on flood zone list page
- [ ] Form: select zone(s) (multi-select), compose message (BM, max 200 chars), priority (Normal / Tinggi / Kecemasan)
- [ ] Preview panel shows how the notification will appear on mobile
- [ ] Confirm button calls `POST /v1/admin/broadcast { zone_ids, message, priority }` which triggers FCM multicast
- [ ] Success response includes: `{ sent_to: N }` — show "Amaran dihantar kepada {N} peranti"

**Technical notes:** `src/app/(admin)/flood-zones/broadcast/page.tsx`; `POST /v1/admin/broadcast` calls Firebase Admin `messaging.sendMulticast({ tokens: [...], notification: { title, body }, android: { priority: 'high' } })`; tokens from Firestore `users` where FCM token exists + device is in zone
**Estimate:** L

---

### WEB-047: Alert broadcast history table
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** v1

**As an** Arah operator **I want** to see a history of all emergency broadcasts sent **so that** I can audit what alerts were sent, when, and how many users were reached.

**Acceptance criteria:**
- [ ] Broadcasts history table on flood zone page: Timestamp, Zone(s), Message (truncated), Sent By, Devices Reached, Read Count
- [ ] Data from Firestore `broadcasts` collection
- [ ] "Baca oleh" count updated lazily from FCM delivery receipts
- [ ] Clicking a row shows full message and zone(s) on a mini-map
- [ ] Exports to CSV via "Eksport CSV" button

**Technical notes:** Firestore `broadcasts` collection: `{ id, zoneIds, message, priority, sentBy, sentAt, deviceCount, readCount }`; `readCount` updated by Cloud Function on FCM delivery receipt; Recharts not needed here — simple table
**Estimate:** M

---

### WEB-048: Scheduled emergency broadcast
**Epic:** Flood Zone & Alert Management
**Status:** 🔲 Todo
**Feature:** FLD-001
**Priority:** v2

**As an** Arah operator **I want** to schedule an emergency broadcast for a future date and time **so that** I can pre-plan alerts for known events like tropical storm warnings.

**Acceptance criteria:**
- [ ] "Jadualkan Amaran" tab on broadcast form adds date/time picker
- [ ] Scheduled broadcasts saved to Firestore `scheduled_broadcasts` with status `pending`
- [ ] List of pending scheduled broadcasts shown with cancel option
- [ ] Cloud Function (Cloud Scheduler trigger) sends the broadcast at the scheduled time
- [ ] If zone is cancelled before send time, operator can cancel the scheduled broadcast

**Technical notes:** `src/app/(admin)/flood-zones/broadcast/page.tsx` extended with schedule tab; Firestore `scheduled_broadcasts` collection; Cloud Scheduler job runs every 5 minutes checking for `scheduledAt <= now AND status = 'pending'`; cancel: `PATCH /v1/admin/broadcasts/:id { status: 'cancelled' }`
**Estimate:** L

---

## Epic 5: Auth & Security

### WEB-004: Admin authentication with Firebase session cookies
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** MVP

**As an** Arah operator **I want** admin pages to be protected by authentication **so that** only authorised operators can access Firestore data.

**Acceptance criteria:**
- [ ] `/admin` and all sub-routes redirect unauthenticated users to `/admin/login`
- [ ] `/admin/login` page has "Log Masuk dengan Google" button using Firebase client SDK
- [ ] Firebase ID token exchanged for server-side session cookie via `POST /api/auth/session`
- [ ] Next.js middleware checks session cookie on all `/admin/*` routes
- [ ] Session cookie expires after 7 days; expired sessions redirect to login
- [ ] Only pre-approved admin email addresses (`ADMIN_EMAILS` env var) can access the panel

**Technical notes:** `adminAuth.createSessionCookie(idToken, { expiresIn: 7 * 24 * 60 * 60 * 1000 })`; verify in middleware: `adminAuth.verifySessionCookie(cookie, true)`; create: `src/app/admin/login/page.tsx`, `src/app/api/auth/session/route.ts`, `src/middleware.ts`
**Estimate:** M

---

### WEB-008: Admin map view of all active reports
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** MVP

**As an** Arah operator **I want** to see active community reports visualised on a map of Malaysia **so that** I can understand geographic distribution and identify hotspots.

**Acceptance criteria:**
- [ ] `/admin/map` page shows a full-screen MapLibre GL map centred on Malaysia
- [ ] All active reports rendered as coloured point markers by type
- [ ] Clicking a marker shows popup: type, coordinates, upvote/downvote, expires_at, "Padam" button
- [ ] "Padam" in popup calls `DELETE /api/reports/[id]` and removes marker
- [ ] Map uses Arah tile server (`tiles.arah.my/style.json`)

**Technical notes:** `src/app/admin/map/page.tsx` server component; `src/components/admin/ReportsMap.tsx` (`'use client'`); `dynamic(() => import(...), { ssr: false })`; `maplibregl.Marker` for pins; sidebar link "Peta" added to `AdminLayout` nav
**Estimate:** L

---

### WEB-009: Public landing page download tracking
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** v1

**As an** Arah product manager **I want** to track how many visitors click the Android and iOS download buttons **so that** I can measure app acquisition conversion.

**Acceptance criteria:**
- [ ] Clicking "Muat turun Android" logs Firebase Analytics event `download_click` with `{ platform: 'android' }`
- [ ] Clicking "Muat turun iOS" logs `download_click` with `{ platform: 'ios' }`
- [ ] Analytics initialisation uses the lazy `isSupported()` pattern
- [ ] Events visible in Firebase Analytics console within 24 hours
- [ ] No analytics in development (`process.env.NODE_ENV !== 'production'` guard)

**Technical notes:** Convert download `<a>` tags in `src/app/page.tsx` to `'use client'` `DownloadButton` component; `logEvent(analytics, 'download_click', { platform })`; `analytics` is a `Promise<Analytics | null>` — await before calling `logEvent`
**Estimate:** S

---

### WEB-049: Session middleware protecting all admin routes
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** MVP

**As an** Arah operator **I want** all admin routes protected by session middleware **so that** even direct URL access without login is blocked.

**Acceptance criteria:**
- [ ] `src/middleware.ts` intercepts all requests matching `/admin/*` (excluding `/admin/login`)
- [ ] Reads session cookie; verifies with `adminAuth.verifySessionCookie(cookie, true)`
- [ ] On invalid/expired cookie: redirect to `/admin/login?redirect={originalPath}`
- [ ] After login, user is redirected to the original path they tried to access
- [ ] Middleware excludes `/api/*` routes from session check (API routes use Bearer token auth)

**Technical notes:** `src/middleware.ts` `config.matcher = ['/admin/((?!login).*)']`; `adminAuth.verifySessionCookie` called in middleware Edge runtime — requires Firebase Admin initialised with `initializeApp` in a non-Edge compatible way; use `jose` JWT verification as alternative in Edge runtime
**Estimate:** M

---

### WEB-050: Audit log viewer for all admin actions
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** v1

**As an** Arah operator **I want** to see a log of all admin actions **so that** I can audit who deleted reports, banned users, or sent broadcasts.

**Acceptance criteria:**
- [ ] `src/app/(admin)/audit-log/page.tsx` shows paginated table of all admin actions
- [ ] Columns: Actor (email), Action (delete_report / ban_user / broadcast / etc.), Target (id), Timestamp, Reason (if applicable)
- [ ] Filter by actor and action type
- [ ] Audit log is append-only; no delete button is shown on this page
- [ ] Auto-refresh every 30s via SWR

**Technical notes:** Firestore `audit_log` collection; `adminDb.collection('audit_log').orderBy('timestamp', 'desc').limit(50)`; action types constant in `src/constants/auditActions.ts`; write entries in all admin API routes using `adminDb.collection('audit_log').add({ actor: session.email, action, target, reason, timestamp: FieldValue.serverTimestamp() })`
**Estimate:** M

---

### WEB-051: Admin 403 access denied page
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** v1

**As an** Arah system **I want** to show a clear access denied page to non-admin users who somehow reach admin routes **so that** unauthorised access attempts are clearly rejected with actionable information.

**Acceptance criteria:**
- [ ] Custom 403 page shown when authenticated (valid session) but non-admin user accesses `/admin/*`
- [ ] Page content: "Akses Ditolak" heading, explanation: "Akaun anda tidak mempunyai kebenaran admin", contact info: `admin@arah.my`
- [ ] "Log Keluar" button signs out and redirects to `/admin/login`
- [ ] Page does not expose any admin data or navigation
- [ ] HTTP 403 status code returned (not 200)

**Technical notes:** `src/app/(admin)/403/page.tsx`; middleware checks `decodedClaims.admin === true` after session verification; non-admin redirect → `/admin/403`; `notFound()` alternative approach; "Log Keluar" calls `DELETE /api/auth/session` then redirects
**Estimate:** S

---

### WEB-052: Admin role badge and profile in sidebar
**Epic:** Auth & Security
**Status:** 🔲 Todo
**Feature:** AUTH-002
**Priority:** v1

**As a** logged-in operator **I want** to see my name and role displayed in the admin sidebar **so that** I always know which account I'm logged in as.

**Acceptance criteria:**
- [ ] Sidebar footer shows: avatar (from Google photo), display name, admin role badge ("Admin" / "Super Admin")
- [ ] "Log Keluar" button calls `DELETE /api/auth/session` to clear cookie then redirects to `/admin/login`
- [ ] Hovering over avatar shows last login time tooltip
- [ ] If session is about to expire (< 1 hour remaining), amber warning: "Sesi akan tamat — sila log masuk semula"
- [ ] Session expiry countdown implemented via client-side cookie expiry check

**Technical notes:** `src/components/admin/AdminSidebarProfile.tsx` (`'use client'`); session data from `GET /api/auth/me` which reads and decodes the session cookie; `DELETE /api/auth/session` route clears `HttpOnly` cookie; session expiry from JWT `exp` claim decoded in client
**Estimate:** M

---
