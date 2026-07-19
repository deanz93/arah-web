# arah-web — Product Brief

## What this service is

`arah-web` is the Next.js 14 web application for the **Arah** platform. It serves two distinct audiences on two distinct surfaces:

1. **Public landing page (`/`)** — a marketing page communicating Arah's value proposition to potential users, linking to Android and iOS app downloads, and emphasising Malaysian sovereignty over navigation data.

2. **Admin dashboard (`/admin`)** — a protected internal tool for Arah platform operators to monitor platform health, moderate community reports (approve or delete), manage registered users, and view usage analytics.

## Why it exists in the Arah ecosystem

The mobile app is self-sufficient for end-users but has no moderation or analytics capability. Platform operators need a web interface to: remove harmful or false community reports, understand usage trends, manage user accounts (e.g. ban bad actors), and monitor the health of the Arah platform without SSH access to Firebase.

The public landing page is the acquisition surface — it converts word-of-mouth visitors into app downloads.

## Goals

- **Report moderation** — allow operators to view, filter, and delete active community reports across Malaysia in near-real-time, reducing the spread of false or harmful reports
- **Usage analytics** — surface key platform metrics (active reports by type, user growth, daily active users) in visual dashboards to inform product and infrastructure decisions
- **User management** — allow operators to list, search, and disable Firebase Auth accounts for policy violations
- **Public acquisition** — communicate Arah's mission clearly to Malaysian drivers and provide direct download links to the iOS and Android apps
- **Secure by design** — admin pages are protected by Firebase Authentication; the Admin SDK is server-only and never runs in the browser

## Non-goals

- `arah-web` does **not** serve map tiles or routing to end-users — those are served by dedicated infrastructure services
- `arah-web` does **not** replace the mobile app for drivers — it is an admin/operator tool, not a navigation interface
- `arah-web` does **not** implement a public API — it is a Next.js server-rendered app, not a REST service
- `arah-web` does **not** handle toll pricing or route calculation — those are in `arah-api` and `arah-routing`
- Real-time report updates in the admin dashboard are out of scope for v0.1 (server components re-render on navigation, not WebSocket)

## Success metrics

| Metric | Target |
|--------|--------|
| Admin dashboard load time (initial) | < 2 seconds (server component, no client bundle wait) |
| Report moderation action (view → delete) | < 3 clicks |
| Public landing page Lighthouse score | > 90 (Performance, Accessibility, Best Practices) |
| Admin page security | Zero unauthenticated reads of Firestore data possible from browser |
| Analytics data freshness | < 60 seconds (Next.js revalidation on admin dashboard) |
| Build time (CI) | < 3 minutes |
