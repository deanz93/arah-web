# arah-web

> 🔒 **Private Repository** — This repo is part of the [Arah platform](https://github.com/deanz93/arah). Source code is proprietary and not open-source.



Next.js 14 admin portal for the [Arah](https://github.com/deanz93/arah) navigation platform.
Dashboard, report moderation, user management, analytics charts — Firebase Auth + Firestore Admin.

## Quick start
```bash
cp .env.local.example .env.local
npm install && npm run dev   # http://localhost:3000
```

## Docker
```bash
docker build -t arah/web .
docker run -p 3000:3000 --env-file .env.local arah/web
```