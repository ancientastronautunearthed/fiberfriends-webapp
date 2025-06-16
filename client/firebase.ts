import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Vite environment variables with fallbacks for different environments
const getEnvVar = (key: string) => {
  if (typeof window !== 'undefined') {
    return (window as any).__ENV__?.[key] || (import.meta as any).env?.[key];
  }
  return process.env[key];
};

const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: "fiber-friends-9b614.firebaseapp.com",
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: "fiber-friends.firebasestorage.app",
  messagingSenderId: "202818399028",
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
  measurementId: "G-6E6V9BVQ0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;