import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC3AhSg8eAklY-Df6PcDkWqO30MmTjzhEg",
  authDomain: "fiber-friends-9b614.firebaseapp.com",
  projectId: "fiber-friends",
  storageBucket: "fiber-friends.firebasestorage.app",
  messagingSenderId: "202818399028",
  appId: "1:202818399028:web:87d262008300781f8cfd361",
};

// Initialize Firebase only if no apps exist
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

export default app;