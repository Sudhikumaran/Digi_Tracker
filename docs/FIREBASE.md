# Firebase / Firestore — DigiTracker Database

**DigiTracker now uses Firebase Firestore as its only database.** MongoDB is no longer required.

## Setup

1. Service account JSON is at `backend/credentials/firebase-service-account.json`
2. Enable **Cloud Firestore** in [Firebase Console](https://console.firebase.google.com/) → **digi-tracker-8b0be**
   - Choose **Production mode** or **Test mode** for development
   - Pick a region (e.g. `asia-south1` or `us-central1`)

## Seed data

```bash
cd backend
npm run seed
```

Demo logins after seed:
- Super Admin: `superadmin@digitracker.com` / `SuperAdmin@123`
- Owner: `owner@fitnesspro.com` / `Owner@123`
- Staff: `staff@fitnesspro.com` / `Staff@123`

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
