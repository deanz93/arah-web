# arah-web

> [![License: MIT](https://img.shields.io/badge/License-MIT-00D8A0.svg)](../arah/LICENSE) Open-source · Part of the [Arah platform](https://github.com/deanz93/arah)



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