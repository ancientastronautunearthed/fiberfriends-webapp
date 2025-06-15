import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  User, 
  UpsertUser,
  AiCompanion,
  InsertAiCompanion,
  DailyLog,
  InsertDailyLog,
  CommunityPost,
  InsertCommunityPost
} from "@shared/schema";

// User operations
export async function getUserProfile(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, "users", userId));
  return userDoc.exists() ? userDoc.data() as User : null;
}

export async function updateUserProfile(userId: string, updates: Partial<UpsertUser>): Promise<void> {
  await updateDoc(doc(db, "users", userId), {
    ...updates,
    updatedAt: Timestamp.now(),
  });
}

// AI Companion operations
export async function getAiCompanion(userId: string): Promise<AiCompanion | null> {
  const companionQuery = query(
    collection(db, "aiCompanions"),
    where("userId", "==", userId),
    limit(1)
  );
  const companionSnapshot = await getDocs(companionQuery);
  
  if (companionSnapshot.empty) return null;
  
  const companionDoc = companionSnapshot.docs[0];
  return { id: companionDoc.id, ...companionDoc.data() } as AiCompanion;
}

export async function createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion> {
  const docRef = await addDoc(collection(db, "aiCompanions"), {
    ...companion,
    createdAt: Timestamp.now(),
  });
  
  const companionDoc = await getDoc(docRef);
  return { id: docRef.id, ...companionDoc.data() } as AiCompanion;
}

// Daily Log operations
export async function getDailyLogs(userId: string): Promise<DailyLog[]> {
  const logsQuery = query(
    collection(db, "dailyLogs"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
    limit(30)
  );
  
  const logsSnapshot = await getDocs(logsQuery);
  return logsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DailyLog[];
}

export async function createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
  const docRef = await addDoc(collection(db, "dailyLogs"), {
    ...log,
    date: Timestamp.fromDate(log.date),
    createdAt: Timestamp.now(),
  });
  
  const logDoc = await getDoc(docRef);
  return { id: docRef.id, ...logDoc.data() } as DailyLog;
}

// Community Post operations
export async function getCommunityPosts(category?: string): Promise<CommunityPost[]> {
  let postsQuery = query(
    collection(db, "communityPosts"),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  if (category) {
    postsQuery = query(
      collection(db, "communityPosts"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(50)
    );
  }
  
  const postsSnapshot = await getDocs(postsQuery);
  return postsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CommunityPost[];
}

export async function createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
  const docRef = await addDoc(collection(db, "communityPosts"), {
    ...post,
    likes: 0,
    replies: 0,
    createdAt: Timestamp.now(),
  });
  
  const postDoc = await getDoc(docRef);
  return { id: docRef.id, ...postDoc.data() } as CommunityPost;
}

export async function updateCommunityPost(postId: string, updates: Partial<CommunityPost>): Promise<void> {
  await updateDoc(doc(db, "communityPosts", postId), updates);
}

// Dashboard stats
export async function getDashboardStats(userId: string) {
  const recentLogs = await getDailyLogs(userId);
  const totalLogs = recentLogs.length;
  const streak = 7; // Mock calculation
  
  return {
    totalLogs,
    streak,
    recentLogs: recentLogs.slice(0, 5),
  };
}