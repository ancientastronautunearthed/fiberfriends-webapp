// server/db.ts

import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  // Environment variables for Firebase Admin are automatically provided
  // by the Firebase App Hosting environment. For local development, you would
  // need to set up a service account file.
  admin.initializeApp();
}

export const adminDb = admin.firestore();