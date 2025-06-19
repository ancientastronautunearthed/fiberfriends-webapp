import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  points: number;
  tier: 'NONE' | 'CONTRIBUTOR' | 'BRONZE' | 'SILVER' | 'GOLD';
}

export interface MonsterData {
  uid: string;
  name: string;
  imageUrl: string;
  health: number;
  generated: boolean;
  lastRecoveryDate?: string;
  voiceConfig?: {
    voiceURI: string;
    pitch: number;
    rate: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TombEntry {
  name: string;
  imageUrl: string;
  cause: string;
  diedAt?: Timestamp;
}

export interface SymptomEntry {
  id: string;
  uid: string;
  date: string; // YYYY-MM-DD
  symptoms: string[];
  notes: string;
  photos?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper function for collections
const getCollection = (name: string) => {
  if (!db) throw new Error('Firestore not available');
  return collection(db, name);
};

const getDocument = (collectionName: string, docId: string) => {
  if (!db) throw new Error('Firestore not available');
  return doc(db, collectionName, docId);
};

// MAIN FUNCTION THAT WAS MISSING: checkDailySymptomLog
export const checkDailySymptomLog = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // Fallback if Firebase not available
  if (!db) {
    console.log('Firebase not available, using test mode for symptom check');
    return {
      needsSymptomLog: false, // Don't require in test mode
      lastSubmission: null,
      today
    };
  }

  try {
    // Check if user logged symptoms today
    const dailyLogsQuery = query(
      collection(db, 'dailyLogs'),
      where('userId', '==', userId),
      where('date', '==', today),
      limit(1)
    );
    
    const dailyLogsSnapshot = await getDocs(dailyLogsQuery);
    const hasLoggedToday = !dailyLogsSnapshot.empty;

    // Get the most recent submission
    const recentLogsQuery = query(
      collection(db, 'dailyLogs'),
      where('userId', '==', userId),
      orderBy('date', 'desc'),
      limit(1)
    );
    
    const recentLogsSnapshot = await getDocs(recentLogsQuery);
    const lastSubmission = recentLogsSnapshot.empty 
      ? null 
      : recentLogsSnapshot.docs[0].data().date;

    return {
      needsSymptomLog: !hasLoggedToday,
      lastSubmission,
      today
    };
  } catch (error) {
    console.error('Error checking daily symptom log:', error);
    // Return safe fallback
    return {
      needsSymptomLog: false,
      lastSubmission: null,
      today
    };
  }
};

// User Management
export const createUser = async (userId: string, userData: any) => {
  // Check if Firebase is available
  if (!db) {
    console.log('Firebase not available, using test mode');
    const testUser = { id: userId, ...userData };
    localStorage.setItem('test-user', JSON.stringify(testUser));
    return;
  }

  try {
    await setDoc(doc(db, "users", userId), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    // Fallback to test mode
    const testUser = { id: userId, ...userData };
    localStorage.setItem('test-user', JSON.stringify(testUser));
    localStorage.setItem('test-mode', 'true');
  }
};

export const getUser = async (userId: string) => {
  // Check if Firebase is available
  if (!db) {
    console.log('Firebase not available, checking test mode');
    const testUser = localStorage.getItem('test-user');
    return testUser ? JSON.parse(testUser) : null;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Error getting user from Firestore:', error);
    // Fallback to test mode
    const testUser = localStorage.getItem('test-user');
    return testUser ? JSON.parse(testUser) : null;
  }
};

export const updateUser = async (userId: string, userData: any) => {
  if (!db) {
    console.log('Firebase not available, using test mode');
    const testUser = { id: userId, ...userData };
    localStorage.setItem('test-user', JSON.stringify(testUser));
    return;
  }

  try {
    await updateDoc(doc(db, "users", userId), {
      ...userData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    // Fallback to test mode
    const testUser = { id: userId, ...userData };
    localStorage.setItem('test-user', JSON.stringify(testUser));
  }
};

// FirestoreService class
class FirestoreService {
  private getCollection(name: string) {
    if (!db) throw new Error('Firestore not initialized');
    return collection(db, name);
  }

  private getDocument(collectionName: string, docId: string) {
    if (!db) throw new Error('Firestore not initialized');
    return doc(db, collectionName, docId);
  }

  // User Profile methods
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = this.getDocument('users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async createUserProfile(uid: string, email: string, displayName?: string): Promise<void> {
    try {
      const docRef = this.getDocument('users', uid);
      const now = Timestamp.now();
      
      const profileData: any = {
        email,
        points: 0,
        tier: 'NONE',
        createdAt: now,
        updatedAt: now
      };
      
      if (displayName !== undefined && displayName !== null) {
        profileData.displayName = displayName;
      }
      
      await setDoc(docRef, profileData);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const docRef = this.getDocument('users', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async addPoints(uid: string, points: number): Promise<void> {
    try {
      const profile = await this.getUserProfile(uid);
      if (profile) {
        const newPoints = profile.points + points;
        await this.updateUserProfile(uid, { points: newPoints });
      }
    } catch (error) {
      console.error('Error adding points:', error);
      throw error;
    }
  }

  // Monster methods
  async getMonsterData(uid: string): Promise<MonsterData | null> {
    try {
      const docRef = this.getDocument('monsters', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { uid, ...docSnap.data() } as MonsterData;
      }
      return null;
    } catch (error) {
      console.error('Error getting monster data:', error);
      throw error;
    }
  }

  async createMonster(uid: string, monsterData: Omit<MonsterData, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const docRef = this.getDocument('monsters', uid);
      const now = Timestamp.now();
      
      await setDoc(docRef, {
        ...monsterData,
        createdAt: now,
        updatedAt: now
      });
    } catch (error) {
      console.error('Error creating monster:', error);
      throw error;
    }
  }

  async updateMonsterData(uid: string, updates: Partial<MonsterData>): Promise<void> {
    try {
      const docRef = this.getDocument('monsters', uid);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating monster data:', error);
      throw error;
    }
  }

  async deleteMonster(uid: string): Promise<void> {
    try {
      const docRef = this.getDocument('monsters', uid);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting monster:', error);
      throw error;
    }
  }

  // Tomb methods
  async addToTomb(uid: string, tombData: TombEntry): Promise<void> {
    try {
      const collectionRef = this.getCollection('tomb');
      await addDoc(collectionRef, {
        uid,
        ...tombData,
        diedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error adding to tomb:', error);
      throw error;
    }
  }

  async getTombEntries(uid: string): Promise<TombEntry[]> {
    try {
      const collectionRef = this.getCollection('tomb');
      const q = query(
        collectionRef,
        where('uid', '==', uid),
        orderBy('diedAt', 'desc'),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data()) as TombEntry[];
    } catch (error) {
      console.error('Error getting tomb entries:', error);
      throw error;
    }
  }
}

// Export the service instance
export const firestoreService = new FirestoreService();

// Re-export common Firestore functions for convenience
export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  serverTimestamp
};