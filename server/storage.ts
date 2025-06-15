// server/storage.ts

import { adminDb } from "./db";
import * as admin from 'firebase-admin';
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

// Helper to convert a Firestore document to our TypeScript type
const fromDoc = <T extends { id: string }>(doc: FirebaseFirestore.DocumentSnapshot): T | undefined => {
  if (!doc.exists) return undefined;
  
  const data = doc.data();
  // Convert Firestore Timestamps to JS Date objects for consistency
  for (const key in data) {
    if (data[key] instanceof admin.firestore.Timestamp) {
      data[key] = data[key].toDate();
    }
  }
  
  return { id: doc.id, ...data } as T;
};

export interface PointActivity {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string;
  timestamp: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  awardedAt: Date;
  progress?: number;
}

export interface DailyActivity {
  id: string;
  userId: string;
  date: Date;
  activities: any[];
  totalPoints: number;
}

export class DatabaseStorage {
  // --- User operations ---
  async getUser(id: string): Promise<User | undefined> {
    const doc = await adminDb.collection('users').doc(id).get();
    return fromDoc<User>(doc);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRef = adminDb.collection('users').doc(userData.id);
    const now = FieldValue.serverTimestamp();
    await userRef.set({
      ...userData,
      createdAt: userData.createdAt || now,
      updatedAt: now,
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
      date: new Date(log.date),
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

  // --- Points System operations ---
  async createPointActivity(activity: {
    userId: string;
    points: number;
    type: string;
    description: string;
    metadata?: any;
  }): Promise<PointActivity> {
    const docRef = await adminDb.collection('pointActivities').add({
      ...activity,
      timestamp: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<PointActivity>(doc)!;
  }

  async getPointActivitiesByType(userId: string, type: string): Promise<PointActivity[]> {
    const snapshot = await adminDb.collection('pointActivities')
      .where('userId', '==', userId)
      .where('type', '==', type)
      .orderBy('timestamp', 'desc')
      .get();
    return snapshot.docs.map(doc => fromDoc<PointActivity>(doc)!);
  }

  async getRecentPointActivities(userId: string, limit: number = 10): Promise<PointActivity[]> {
    const snapshot = await adminDb.collection('pointActivities')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => fromDoc<PointActivity>(doc)!);
  }

  async getActivityCount(userId: string, type: string): Promise<number> {
    const snapshot = await adminDb.collection('pointActivities')
      .where('userId', '==', userId)
      .where('type', '==', type)
      .get();
    return snapshot.size;
  }

  // --- Daily Activity operations ---
  async getDailyActivity(userId: string, date: Date): Promise<DailyActivity | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const snapshot = await adminDb.collection('dailyActivities')
      .where('userId', '==', userId)
      .where('date', '>=', startOfDay)
      .where('date', '<=', endOfDay)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    return fromDoc<DailyActivity>(snapshot.docs[0]);
  }

  async createDailyActivity(activity: {
    userId: string;
    date: Date;
    activities: any[];
    totalPoints: number;
  }): Promise<DailyActivity> {
    const docRef = await adminDb.collection('dailyActivities').add(activity);
    const doc = await docRef.get();
    return fromDoc<DailyActivity>(doc)!;
  }

  async updateDailyActivity(id: string, updates: Partial<DailyActivity>): Promise<DailyActivity> {
    const docRef = adminDb.collection('dailyActivities').doc(id);
    await docRef.update(updates);
    const doc = await docRef.get();
    return fromDoc<DailyActivity>(doc)!;
  }

  // --- Badge operations ---
  async createUserBadge(badge: {
    userId: string;
    badgeId: string;
    progress?: number;
  }): Promise<UserBadge> {
    const docRef = await adminDb.collection('userBadges').add({
      ...badge,
      awardedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<UserBadge>(doc)!;
  }

  async hasUserBadge(userId: string, badgeId: string): Promise<boolean> {
    const snapshot = await adminDb.collection('userBadges')
      .where('userId', '==', userId)
      .where('badgeId', '==', badgeId)
      .limit(1)
      .get();
    return !snapshot.empty;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const snapshot = await adminDb.collection('userBadges')
      .where('userId', '==', userId)
      .orderBy('awardedAt', 'desc')
      .get();
    return snapshot.docs.map(doc => fromDoc<UserBadge>(doc)!);
  }

  // --- Community Stats operations ---
  async getCommunityLikesReceived(userId: string): Promise<number> {
    const snapshot = await adminDb.collection('communityPosts')
      .where('authorId', '==', userId)
      .get();
    
    let totalLikes = 0;
    snapshot.docs.forEach(doc => {
      const post = doc.data();
      totalLikes += post.likes || 0;
    });
    
    return totalLikes;
  }

  // --- Conversation History operations ---
  async createConversationHistory(history: InsertConversationHistory): Promise<ConversationHistory> {
    const docRef = await adminDb.collection('conversationHistory').add({
      ...history,
      timestamp: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ConversationHistory>(doc)!;
  }

  async getConversationHistory(companionId: string): Promise<ConversationHistory[]> {
    const snapshot = await adminDb.collection('conversationHistory')
      .where('companionId', '==', companionId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();
    return snapshot.docs.map(doc => fromDoc<ConversationHistory>(doc)!);
  }

  // --- Health Insights operations ---
  async createAiHealthInsight(insight: InsertAiHealthInsight): Promise<AiHealthInsight> {
    const docRef = await adminDb.collection('aiHealthInsights').add({
      ...insight,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<AiHealthInsight>(doc)!;
  }

  async getAiHealthInsights(userId: string): Promise<AiHealthInsight[]> {
    const snapshot = await adminDb.collection('aiHealthInsights')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snapshot.docs.map(doc => fromDoc<AiHealthInsight>(doc)!);
  }

  // --- Symptom Pattern operations ---
  async createSymptomPattern(pattern: InsertSymptomPattern): Promise<SymptomPattern> {
    const docRef = await adminDb.collection('symptomPatterns').add({
      ...pattern,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomPattern>(doc)!;
  }

  async getSymptomPatterns(userId: string): Promise<SymptomPattern[]> {
    const snapshot = await adminDb.collection('symptomPatterns')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    return snapshot.docs.map(doc => fromDoc<SymptomPattern>(doc)!);
  }

  // --- Symptom Correlation operations ---
  async createSymptomCorrelation(correlation: InsertSymptomCorrelation): Promise<SymptomCorrelation> {
    const docRef = await adminDb.collection('symptomCorrelations').add({
      ...correlation,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomCorrelation>(doc)!;
  }

  async getSymptomCorrelations(userId: string): Promise<SymptomCorrelation[]> {
    const snapshot = await adminDb.collection('symptomCorrelations')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => fromDoc<SymptomCorrelation>(doc)!);
  }

  // --- Symptom Wheel operations ---
  async createSymptomWheelEntry(entry: InsertSymptomWheelEntry): Promise<SymptomWheelEntry> {
    const docRef = await adminDb.collection('symptomWheelEntries').add({
      ...entry,
      recordedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomWheelEntry>(doc)!;
  }

  async getSymptomWheelEntries(userId: string): Promise<SymptomWheelEntry[]> {
    const snapshot = await adminDb.collection('symptomWheelEntries')
      .where('userId', '==', userId)
      .orderBy('recordedAt', 'desc')
      .limit(30)
      .get();
    return snapshot.docs.map(doc => fromDoc<SymptomWheelEntry>(doc)!);
  }

  // --- Chat operations ---
  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const docRef = await adminDb.collection('chatRooms').add({
      ...room,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ChatRoom>(doc)!;
  }

  async getChatRoom(id: string): Promise<ChatRoom | undefined> {
    const doc = await adminDb.collection('chatRooms').doc(id).get();
    return fromDoc<ChatRoom>(doc);
  }

  async getUserChatRooms(userId: string): Promise<ChatRoom[]> {
    const memberSnapshot = await adminDb.collection('chatRoomMembers')
      .where('userId', '==', userId)
      .get();
    
    const roomIds = memberSnapshot.docs.map(doc => doc.data().roomId);
    if (roomIds.length === 0) return [];
    
    const roomSnapshot = await adminDb.collection('chatRooms')
      .where(admin.firestore.FieldPath.documentId(), 'in', roomIds)
      .get();
    
    return roomSnapshot.docs.map(doc => fromDoc<ChatRoom>(doc)!);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const docRef = await adminDb.collection('chatMessages').add({
      ...message,
      timestamp: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ChatMessage>(doc)!;
  }

  async getChatMessages(roomId: string): Promise<ChatMessage[]> {
    const snapshot = await adminDb.collection('chatMessages')
      .where('roomId', '==', roomId)
      .orderBy('timestamp', 'asc')
      .get();
    return snapshot.docs.map(doc => fromDoc<ChatMessage>(doc)!);
  }

  async addChatRoomMember(member: InsertChatRoomMember): Promise<ChatRoomMember> {
    const docRef = await adminDb.collection('chatRoomMembers').add({
      ...member,
      joinedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ChatRoomMember>(doc)!;
  }

  async getChatRoomMembers(roomId: string): Promise<ChatRoomMember[]> {
    const snapshot = await adminDb.collection('chatRoomMembers')
      .where('roomId', '==', roomId)
      .get();
    return snapshot.docs.map(doc => fromDoc<ChatRoomMember>(doc)!);
  }

  // --- Challenge operations ---
  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const docRef = await adminDb.collection('challenges').add({
      ...challenge,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<Challenge>(doc)!;
  }

  async getActiveChallenge(): Promise<Challenge | undefined> {
    const now = new Date();
    const snapshot = await adminDb.collection('challenges')
      .where('startDate', '<=', now)
      .where('endDate', '>=', now)
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    return fromDoc<Challenge>(snapshot.docs[0]);
  }

  async createUserChallenge(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const docRef = await adminDb.collection('userChallenges').add({
      ...userChallenge,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  async getUserChallenge(userId: string, challengeId: string): Promise<UserChallenge | undefined> {
    const snapshot = await adminDb.collection('userChallenges')
      .where('userId', '==', userId)
      .where('challengeId', '==', challengeId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    return fromDoc<UserChallenge>(snapshot.docs[0]);
  }

  async updateUserChallenge(id: string, updates: Partial<UserChallenge>): Promise<UserChallenge> {
    const docRef = adminDb.collection('userChallenges').doc(id);
    await docRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  // --- Achievement operations ---
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const docRef = await adminDb.collection('achievements').add({
      ...achievement,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<Achievement>(doc)!;
  }

  async getAchievements(): Promise<Achievement[]> {
    const snapshot = await adminDb.collection('achievements').get();
    return snapshot.docs.map(doc => fromDoc<Achievement>(doc)!);
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const docRef = await adminDb.collection('userAchievements').add({
      ...userAchievement,
      unlockedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<UserAchievement>(doc)!;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const snapshot = await adminDb.collection('userAchievements')
      .where('userId', '==', userId)
      .get();
    return snapshot.docs.map(doc => fromDoc<UserAchievement>(doc)!);
  }

  // --- Leaderboard operations ---
  async updateLeaderboard(entry: {
    userId: string;
    period: string;
    points: number;
    rank?: number;
  }): Promise<Leaderboard> {
    const docRef = adminDb.collection('leaderboards').doc(`${entry.userId}_${entry.period}`);
    await docRef.set({
      ...entry,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    const doc = await docRef.get();
    return fromDoc<Leaderboard>(doc)!;
  }

  async getLeaderboard(period: string, limit: number = 10): Promise<Leaderboard[]> {
    const snapshot = await adminDb.collection('leaderboards')
      .where('period', '==', period)
      .orderBy('points', 'desc')
      .limit(limit)
      .get();
    return snapshot.docs.map(doc => fromDoc<Leaderboard>(doc)!);
  }

  // Missing methods for routes.ts
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

  async getUserChallenges(userId: string, status?: string): Promise<UserChallenge[]> {
    let query: FirebaseFirestore.Query = adminDb.collection('userChallenges')
      .where('userId', '==', userId);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('startedAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<UserChallenge>(doc)!);
  }

  async getUserRank(userId: string, period: string, category: string): Promise<number> {
    const snapshot = await adminDb.collection('leaderboards')
      .where('period', '==', period)
      .where('category', '==', category)
      .orderBy('points', 'desc')
      .get();
    
    const userIndex = snapshot.docs.findIndex(doc => doc.data().userId === userId);
    return userIndex === -1 ? 0 : userIndex + 1;
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<any> {
    const achievement = await adminDb.collection('achievements').doc(achievementId).get();
    if (!achievement.exists) {
      throw new Error('Achievement not found');
    }

    const achievementData = achievement.data();
    const userAchievement = {
      userId,
      achievementId,
      pointsEarned: achievementData?.pointValue || 0,
      unlockedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('userAchievements').add(userAchievement);
    const doc = await docRef.get();
    return fromDoc<UserAchievement>(doc)!;
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({ points });
    const doc = await userRef.get();
    return fromDoc<User>(doc)!;
  }

  async getAvailableBadges(userId: string): Promise<any[]> {
    const userBadges = await this.getUserBadges(userId);
    const unlockedBadgeIds = userBadges.map(ub => ub.badgeId);
    
    const allBadgesSnapshot = await adminDb.collection('badgeDefinitions')
      .where('isActive', '==', true)
      .get();
    
    return allBadgesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(badge => !unlockedBadgeIds.includes(badge.id));
  }
}

export const storage = new DatabaseStorage();