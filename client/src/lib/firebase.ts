import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Check if we're in the browser environment
const isBrowser = typeof window !== 'undefined';

// Get environment variables safely
const getEnvVar = (key: string) => {
  if (isBrowser) {
    return (import.meta as any).env?.[key];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || "fiber-friends-9b614.firebaseapp.com",
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || "fiber-friends.firebasestorage.app",
  messagingSenderId: "202818399028",
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: "G-6E6V9BVQ0E"
};

// Initialize Firebase only if configuration is complete
let app: any = null;
let auth: any = null;
let db: any = null;

// Check if all required config values are present
const hasValidConfig = firebaseConfig.apiKey && 
                      firebaseConfig.projectId && 
                      firebaseConfig.appId &&
                      firebaseConfig.apiKey !== 'undefined';

if (hasValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    if (app) {
      auth = getAuth(app);
      db = getFirestore(app);
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error("Firebase initialization error:", error);
    app = null;
    auth = null;
    db = null;
  }
} else {
  console.log('Firebase config incomplete, check environment variables');
  app = null;
  auth = null;
  db = null;
}

// Set up test mode if Firebase is not available
if (!app && isBrowser) {
  localStorage.setItem('test-mode', 'true');
  if (!localStorage.getItem('test-user')) {
    localStorage.setItem('test-user', JSON.stringify({
      id: 'test-user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      onboardingCompleted: true,
      points: 100,
      totalPoints: 100,
      currentTier: 'Newcomer',
      streakDays: 3,
      longestStreak: 7
    }));
  }
}

export { auth, db };

// Only create GoogleAuthProvider if auth is available
export const googleProvider = auth ? (() => {
  const provider = new GoogleAuthProvider();
  provider.addScope('email');
  provider.addScope('profile');
  return provider;
})() : null;

export default app;