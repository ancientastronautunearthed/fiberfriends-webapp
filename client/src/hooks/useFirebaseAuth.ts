import { useState, useEffect } from "react";
import { 
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { getUser, createUser } from "@/lib/firestore";

export function useFirebaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for test mode first
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

    // Check if Firebase auth is available
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

    // Listen for auth state changes with proper error handling
    let unsubscribe: (() => void) | null = null;

    try {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        try {
          setFirebaseUser(firebaseUser);

          if (firebaseUser) {
            await handleUserLogin(firebaseUser).catch((error) => {
              console.error('User login error:', error);
              setUser(null);
              setIsAuthenticated(false);
            });
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }

          setIsLoading(false);
        } catch (error) {
          console.error('Auth state handler error:', error);
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleUserLogin = async (firebaseUser: User) => {
    try {
      // Check if user exists in Firestore
      let userData = await getUser(firebaseUser.uid);

      if (!userData) {
        // Create new user in Firestore
        const newUserData = {
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ')[1] || '',
          profileImageUrl: firebaseUser.photoURL,
          onboardingCompleted: false,
          points: 0,
          totalPoints: 0,
          currentTier: "Newcomer",
          streakDays: 0,
          longestStreak: 0,
          researchDataOptIn: true,
          communityInsightsAccess: false,
          anonymizedDataContributed: false
        };

        await createUser(firebaseUser.uid, newUserData);
        userData = { id: firebaseUser.uid, ...newUserData };
      }

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error handling user login:", error);
      // Don't throw the error, just set auth to false
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const signIn = async () => {
    if (!auth || !googleProvider) {
      console.log("Firebase auth not available, enabling test mode");
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
      console.log("Starting Google sign-in...");

      // Check if we're in development and domain is not authorized
      if (process.env.NODE_ENV === 'development' && window.location.hostname.includes('repl.co')) {
        console.warn('Development mode: Please add this domain to Firebase Auth authorized domains');
        console.warn('Current domain:', window.location.origin);
      }

      // Clear any existing popup blockers
      if (googleProvider) {
        googleProvider.setCustomParameters({
          prompt: 'select_account'
        });

        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          console.log("Sign-in successful:", result.user.email);
          await handleUserLogin(result.user);
        }
      }
    } catch (error: any) {
      console.error("Sign-in error:", error);

      if (error.code === 'auth/popup-closed-by-user') {
        console.log("User closed the popup");
        return;
      }

      if (error.code === 'auth/popup-blocked') {
        console.log("Popup was blocked by browser");
        throw new Error("Please allow popups for this site and try again");
      }

      if (error.code === 'auth/unauthorized-domain') {
        console.error('Please add this domain to Firebase Auth authorized domains:', window.location.origin);
      }

      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Handle test mode logout
      if (localStorage.getItem('test-mode') === 'true') {
        localStorage.removeItem('test-mode');
        localStorage.removeItem('test-user');
        setUser(null);
        setIsAuthenticated(false);
        window.location.reload();
        return;
      }

      if (auth) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
      // Force logout regardless of Firebase error
      setUser(null);
      setIsAuthenticated(false);
    }
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