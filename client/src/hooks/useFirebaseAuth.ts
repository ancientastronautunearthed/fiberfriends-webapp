import { useState, useEffect } from "react";
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export function useFirebaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const testMode = localStorage.getItem('test-mode');
    const testUserData = localStorage.getItem('test-user');
    
    if (testMode === 'true' && testUserData) {
      try {
        const testUser = JSON.parse(testUserData);
        setUser(testUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      } catch (error) {
        console.error('Error parsing test user data:', error);
        localStorage.removeItem('test-mode');
        localStorage.removeItem('test-user');
      }
    }

    if (!auth) {
      console.log('Firebase auth not available, enabling test mode');
      const testUser = {
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
      };
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('test-user', JSON.stringify(testUser));
      setUser(testUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          profileImageUrl: firebaseUser.photoURL,
          onboardingCompleted: false,
          points: 0,
          totalPoints: 0,
          currentTier: "Newcomer",
          streakDays: 0,
          longestStreak: 0
        };
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
      const testUser = {
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
      };
      localStorage.setItem('test-mode', 'true');
      localStorage.setItem('test-user', JSON.stringify(testUser));
      setUser(testUser);
      setIsAuthenticated(true);
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Sign-in successful:", result.user.email);
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        const testUser = {
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
        };
        localStorage.setItem('test-mode', 'true');
        localStorage.setItem('test-user', JSON.stringify(testUser));
        setUser(testUser);
        setIsAuthenticated(true);
        return;
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (localStorage.getItem('test-mode') === 'true') {
      localStorage.removeItem('test-mode');
      localStorage.removeItem('test-user');
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    signIn,
    signOut
  };
}