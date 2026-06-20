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
flutter run -d chrome
```

## Demo credentials (after seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@digitracker.com | SuperAdmin@123 |
| Owner | owner@fitnesspro.com | Owner@123 |
| Staff | staff@fitnesspro.com | Staff@123 |

## Docs

- [Architecture](docs/architecture.md)
- [API](docs/api.md)
- [Firebase setup](docs/FIREBASE.md)
- [Deployment](docs/deployment.md)
