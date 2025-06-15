import { adminDb } from "./db";
import {
  users,
  aiCompanions,
  conversationHistory,
  aiHealthInsights,
  dailyLogs,
  communityPosts,
  symptomPatterns,
  symptomCorrelations,
  symptomWheelEntries,
  chatRooms,
  chatMessages,
  chatRoomMembers,
  challenges,
  achievements,
  userChallenges,
  userAchievements,
  leaderboards,
  type User,
  type UpsertUser,
  type AiCompanion,
  type InsertAiCompanion,
  type ConversationHistory,
  type InsertConversationHistory,
  type AiHealthInsight,
  type InsertAiHealthInsight,
  type DailyLog,
  type InsertDailyLog,
  type CommunityPost,
  type InsertCommunityPost,
  type SymptomPattern,
  type InsertSymptomPattern,
  type SymptomCorrelation,
  type InsertSymptomCorrelation,
  type SymptomWheelEntry,
  type InsertSymptomWheelEntry,
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatRoomMember,
  type InsertChatRoomMember,
  type Challenge,
  type InsertChallenge,
  type Achievement,
  type InsertAchievement,
  type UserChallenge,
  type InsertUserChallenge,
  type UserAchievement,
  type InsertUserAchievement,
  type Leaderboard,
} from "@shared/schema";
import { FieldValue } from 'firebase-admin/firestore';

// Helper to convert Firestore docs to our types
const fromDoc = <T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T | undefined => {
  if (!doc.exists) return undefined;
  return { id: doc.id, ...doc.data() } as T;
};

export class DatabaseStorage {
  // --- User operations ---
  async getUser(id: string): Promise<User | undefined> {
    const doc = await adminDb.collection('users').doc(id).get();
    return fromDoc<User>(doc);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRef = adminDb.collection('users').doc(userData.id);
    await userRef.set({
      ...userData,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const userDoc = await userRef.get();
    return fromDoc<User>(userDoc)!;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const userRef = adminDb.collection('users').doc(id);
    await userRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const userDoc = await userRef.get();
    return fromDoc<User>(userDoc)!;
  }
    
  async completeOnboarding(id: string, profileData: any): Promise<User> {
    return this.updateUser(id, { ...profileData, onboardingCompleted: true });
  }

  // --- AI Companion operations ---
  async getAiCompanion(userId: string): Promise<AiCompanion | undefined> {
    const snapshot = await adminDb.collection('aiCompanions').where('userId', '==', userId).limit(1).get();
    if (snapshot.empty) return undefined;
    return fromDoc<AiCompanion>(snapshot.docs[0]);
  }

  async createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion> {
    const docRef = await adminDb.collection('aiCompanions').add({
      ...companion,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<AiCompanion>(doc)!;
  }
    
  // --- Daily Log operations ---
  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const docRef = await adminDb.collection('dailyLogs').add({
      ...log,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<DailyLog>(doc)!;
  }

  async getDailyLogs(userId: string): Promise<DailyLog[]> {
    const snapshot = await adminDb.collection('dailyLogs')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();
    return snapshot.docs.map(doc => fromDoc<DailyLog>(doc)!);
  }

  // --- Community Post operations ---
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const docRef = await adminDb.collection('communityPosts').add({
      ...post,
      likes: 0,
      replies: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<CommunityPost>(doc)!;
  }

  async getCommunityPosts(category?: string): Promise<CommunityPost[]> {
    let query: FirebaseFirestore.Query = adminDb.collection('communityPosts');
    if (category) {
      query = query.where('category', '==', category);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').limit(50).get();
    return snapshot.docs.map(doc => fromDoc<CommunityPost>(doc)!);
  }

  async updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost> {
      const postRef = adminDb.collection('communityPosts').doc(id);
      await postRef.update(updates);
      const doc = await postRef.get();
      return fromDoc<CommunityPost>(doc)!;
  }

  // --- Chat operations ---
  async getChatRooms(): Promise<ChatRoom[]> {
    const snapshot = await adminDb.collection('chatRooms').orderBy('lastActivity', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<ChatRoom>(doc)!);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const docRef = await adminDb.collection('chatMessages').add({
      ...message,
      createdAt: FieldValue.serverTimestamp()
    });
    const doc = await docRef.get();
    return fromDoc<ChatMessage>(doc)!;
  }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const snapshot = await adminDb.collection('chatMessages')
      .where('roomId', '==', roomId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => fromDoc<ChatMessage>(doc)!).reverse();
  }

  async updateRoomActivity(roomId: string): Promise<void> {
    await adminDb.collection('chatRooms').doc(roomId).update({
        lastActivity: FieldValue.serverTimestamp()
    });
  }
    
  // --- Gamification operations ---
  async getChallenges(type?: string, isActive?: boolean): Promise<Challenge[]> {
    let query: FirebaseFirestore.Query = adminDb.collection('challenges');
    if (type) {
      query = query.where('type', '==', type);
    }
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive);
    }
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<Challenge>(doc)!);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const docRef = await adminDb.collection('challenges').add({
      ...challenge,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<Challenge>(doc)!;
  }
    
  async assignChallengeToUser(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const docRef = await adminDb.collection('userChallenges').add({
      ...userChallenge,
      startedAt: FieldValue.serverTimestamp()
    });
    const doc = await docRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  async getUserChallenges(userId: string, status?: string): Promise<UserChallenge[]> {
      let query: FirebaseFirestore.Query = adminDb.collection('userChallenges').where('userId', '==', userId);
      if (status) {
          query = query.where('status', '==', status);
      }
      const snapshot = await query.orderBy('startedAt', 'desc').get();
      return snapshot.docs.map(doc => fromDoc<UserChallenge>(doc)!);
  }

  // --- Symptom Wheel ---
  async createSymptomWheelEntry(entry: InsertSymptomWheelEntry): Promise<SymptomWheelEntry> {
      const docRef = await adminDb.collection('symptomWheelEntries').add({
          ...entry,
          createdAt: FieldValue.serverTimestamp()
      });
      const doc = await docRef.get();
      return fromDoc<SymptomWheelEntry>(doc)!;
  }
    
  // NOTE: This is a simplified example. You would continue to implement all the methods
  // from your original IStorage interface using the Firebase Admin SDK in a similar fashion.
}

export const storage = new DatabaseStorage();