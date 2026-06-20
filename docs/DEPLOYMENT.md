# Deployment Guide

## Infrastructure Overview

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway/   │    │   MongoDB   │
│  (Admin UI) │    │   Render     │    │   Atlas     │
│             │    │  (Backend)   │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
                          │
                   ┌──────┴──────┐
                   │   Redis     │
                   │  (Upstash)  │
                   └─────────────┘
```

## Environment Variables

### Backend (.env)

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/digitracker
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=https://admin.yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FIREBASE_PROJECT_ID=your-firebase-project
REDIS_URL=redis://default:pass@host:6379
```

### Admin Dashboard (.env)

```env
VITE_API_URL=https://api.yourdomain.com/api/v1
```

### Flutter (app_config.dart)

```dart
static const String apiBaseUrl = 'https://api.yourdomain.com/api/v1';
```

---

## Backend Deployment (Railway / Render)

### 1. Prepare

```bash
cd backend
npm install
npm run build  # if using TypeScript
```

### 2. Railway

```bash
# Install Railway CLI
npm i -g @railway/cli
railway login
railway init
railway up
```

Set environment variables in Railway dashboard.

### 3. Render

Create a Web Service:
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Health Check:** `/api/v1/health`

### 4. MongoDB Atlas

1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create database user
3. Whitelist deployment server IP (or `0.0.0.0/0` for cloud)
4. Copy connection string to `MONGODB_URI`

### 5. Seed Production

```bash
npm run seed
```

---

## Admin Dashboard Deployment (Vercel)

```bash
cd admin
npm install
npm run build
```

### Vercel

```bash
npm i -g vercel
vercel --prod
```

Set `VITE_API_URL` in Vercel environment variables.

---

## Flutter Mobile Deployment

### Android

```bash
cd mobile
flutter build appbundle --release
```

Upload `build/app/outputs/bundle/release/app-release.aab` to Google Play Console.

**Signing:** Configure `android/key.properties` and keystore.

### iOS

```bash
flutter build ipa --release
```

Upload via Xcode or Transporter to App Store Connect.

### Firebase Setup (Push Notifications)

1. Create Firebase project
2. Add Android/iOS apps
3. Download `google-services.json` → `android/app/`
4. Download `GoogleService-Info.plist` → `ios/Runner/`
5. Add server key to backend `FIREBASE_*` env vars

---

## Docker Deployment (Alternative)

```bash
docker-compose up -d
```

`docker-compose.yml` includes:
- Backend API
- MongoDB
- Redis
- Nginx reverse proxy

---

## SSL & Domain Setup

```
api.yourdomain.com     → Backend API
admin.yourdomain.com   → Admin Dashboard
app.yourdomain.com     → Deep links for mobile
```

Use Cloudflare or Let's Encrypt for SSL certificates.

---

## Monitoring & Logging

| Tool | Purpose |
|------|---------|
| PM2 | Process management |
| Winston | Application logging |
| Sentry | Error tracking |
| Uptime Robot | Health monitoring |

### Health Check Endpoint

```
GET /api/v1/health
→ { "status": "ok", "timestamp": "...", "mongodb": "connected" }
```

---

## Scaling Checklist

- [ ] Enable MongoDB Atlas auto-scaling
- [ ] Add Redis for analytics caching
- [ ] Configure CDN for static assets (Cloudflare)
- [ ] Set up horizontal scaling (multiple API instances)
- [ ] Enable database read replicas for analytics queries
- [ ] Configure rate limiting per tenant
- [ ] Set up automated backups (daily MongoDB snapshots)
- [ ] Configure log aggregation (Datadog/Logtail)

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && npm ci && npm test

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - run: railway up

  deploy-admin:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - run: vercel --prod
```
