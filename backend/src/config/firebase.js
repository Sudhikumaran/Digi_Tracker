const path = require('path');
const fs = require('fs');

let firebaseApp = null;

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const credentialsPath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
    path.join(__dirname, '../../credentials/firebase-service-account.json');

  if (!fs.existsSync(credentialsPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
}

function initFirebase() {
  if (firebaseApp) return firebaseApp;

  try {
    const admin = require('firebase-admin');
    const serviceAccount = loadServiceAccount();

    if (!serviceAccount) {
      console.warn('[Firebase] Service account not found — push notifications disabled');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    });

    console.log(`[Firebase] Initialized project: ${serviceAccount.project_id}`);
    return firebaseApp;
  } catch (err) {
    console.warn('[Firebase] Init failed — push notifications disabled:', err.message);
    return null;
  }
}

function getFirebaseAdmin() {
  if (!firebaseApp) initFirebase();
  return firebaseApp ? require('firebase-admin') : null;
}

function getMessaging() {
  const admin = getFirebaseAdmin();
  return admin?.messaging() || null;
}

module.exports = { initFirebase, getFirebaseAdmin, getMessaging };
