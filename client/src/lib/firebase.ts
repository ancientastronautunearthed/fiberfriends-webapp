import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let firebaseConfigError: string | null = null;

const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

if (
  !firebaseConfig.apiKey ||
  firebaseConfig.apiKey.includes("YOUR_API_KEY") || 
  firebaseConfig.apiKey.includes("VITE_") || 
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId
) {
  firebaseConfigError =
    "Firebase configuration is missing or invalid. " +
    "Please ensure VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, " +
    "and VITE_FIREBASE_PROJECT_ID are set correctly in your .env file. " +
    "Authentication and Firebase-dependent features will not work.";
  
  if (!IS_DEMO_MODE) {
    console.error("Firebase Init Error:", firebaseConfigError);
  }
} else {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } catch (e) {
      firebaseConfigError = `Firebase initialization failed: ${e instanceof Error ? e.message : String(e)}`;
      if (!IS_DEMO_MODE) {
        console.error("Firebase Caught Init Error:", firebaseConfigError);
      }
      app = null; 
      auth = null; 
      db = null;
    }
  } else {
    app = getApps()[0]!;
    try {
        auth = getAuth(app);
        db = getFirestore(app);
    } catch (e) {
        firebaseConfigError = `Firebase getAuth/getFirestore failed: ${e instanceof Error ? e.message : String(e)}`;
        if (!IS_DEMO_MODE) {
            console.error("Firebase getAuth/getFirestore Error:", firebaseConfigError);
        }
        auth = null;
        db = null;
    }
  }
}

// Create Google provider
export const googleProvider = new GoogleAuthProvider();

export { app, auth, db, firebaseConfigError };