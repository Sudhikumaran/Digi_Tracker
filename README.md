# DigiTracker

Business growth tracking SaaS — Flutter mobile app, React admin dashboard, Node.js API, Firebase Firestore.

## Stack

- **Backend** — Node.js, Express, Firestore, Firebase Admin (FCM)
- **Admin** — React, Vite, Tailwind
- **Mobile** — Flutter, Riverpod

## Quick start

### 1. Firebase

1. Place your Firebase service account JSON at `backend/credentials/firebase-service-account.json`
2. Enable **Cloud Firestore** in Firebase Console
3. See [docs/FIREBASE.md](docs/FIREBASE.md)

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed
npm run dev
```

API: http://localhost:5000

### 3. Admin

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

Admin: http://localhost:5173

### 4. Mobile

```bash
cd mobile
flutter pub get
```

**Production build (uses Railway API automatically):**

```bash
cd mobile
.\scripts\build_release.ps1
```

**Test on a physical device against production:**

```bash
cd mobile
.\scripts\run_production.ps1
```

APK output: `mobile/build/app/outputs/flutter-apk/app-release.apk`

## Production accounts (after `npm run seed`)

Set `SEED_*_PASSWORD` variables in Railway before seeding. Default emails:

| Role | Email |
|------|-------|
| Super Admin | `superadmin@digitracker.com` |
| Business Admin | `admin@digitracker.com` |
| Staff | `staff@digitracker.com` |

The seed creates login accounts and an empty business shell only — no demo modules, entries, or sample data.

## Docs

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Firebase setup](docs/FIREBASE.md)
- [Deployment](docs/deployment.md)
