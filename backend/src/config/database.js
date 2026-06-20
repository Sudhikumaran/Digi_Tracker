const { initFirebase, getFirebaseAdmin } = require('./firebase');
const { getFirestore } = require('firebase-admin/firestore');

async function connectDB() {
  initFirebase();
  const admin = getFirebaseAdmin();
  if (!admin) {
    console.error('Firebase init failed — place service account at backend/credentials/firebase-service-account.json');
    process.exit(1);
  }
  const db = getFirestore();
  await db.collection('_health').doc('ping').set({ ok: true, at: new Date().toISOString() }, { merge: true });
  console.log(`Firestore connected: ${process.env.FIREBASE_PROJECT_ID || 'digi-tracker-8b0be'}`);
}

module.exports = connectDB;
