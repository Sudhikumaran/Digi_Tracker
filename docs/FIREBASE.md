# Firebase / Firestore — DigiTracker Database

**DigiTracker now uses Firebase Firestore as its only database.** MongoDB is no longer required.

## Setup

1. Service account JSON is at `backend/credentials/firebase-service-account.json`
2. Enable **Cloud Firestore** in [Firebase Console](https://console.firebase.google.com/) → **digi-tracker-8b0be**
   - Choose **Production mode** or **Test mode** for development
   - Pick a region (e.g. `asia-south1` or `us-central1`)

## Production seed

```bash
cd backend
npm run seed
```

Requires `SEED_SUPERADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD`, and `SEED_STAFF_PASSWORD` when `NODE_ENV=production`.

Default accounts (passwords from env):

- Super Admin: `superadmin@digitracker.com`
- Business Admin: `admin@digitracker.com`
- Staff: `staff@digitracker.com`

No demo modules or entries are created — only subscription plans, one empty business, and the three login accounts.

## Start API

```bash
cd backend
npm run dev
```

Expected logs:
```
Firestore connected: digi-tracker-8b0be
[Firebase] Initialized project: digi-tracker-8b0be
DigiTracker API running on port 5000
```

## Collections

| Collection | Purpose |
|------------|---------|
| users | Accounts, roles, rewards |
| businesses | Tenant businesses |
| modules | Tracking modules |
| entries | Daily metric submissions |
| rewards | Points history |
| notifications | In-app + FCM push |
| auditLogs | Entry change history |
| reports | Generated reports metadata |
| plans | Subscription plans |
| subscriptions | Business subscriptions |
| refreshTokens | JWT refresh tokens |

## Push notifications

FCM is integrated — notifications created in the app also send push to registered devices.

Mobile: run `flutterfire configure --project=digi-tracker-8b0be` once to enable client push tokens.
