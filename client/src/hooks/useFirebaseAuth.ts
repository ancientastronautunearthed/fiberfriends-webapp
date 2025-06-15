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

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await handleUserLogin(firebaseUser);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
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
      setIsAuthenticated(false);
    }
  };

  const signIn = async () => {
    try {
      console.log("Starting Google sign-in...");
      
      // Clear any existing popup blockers
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        console.log("Sign-in successful:", result.user.email);
        await handleUserLogin(result.user);
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
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
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