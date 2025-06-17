// server/storage.ts

import { adminDb } from "./db";
import * as admin from 'firebase-admin';
import {
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
    const userRef = adminDb.collection('users').doc(userData.id!);
    const now = FieldValue.serverTimestamp();
    await userRef.set({
      ...userData,
      createdAt: now,
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

  // --- AI Companion operations ---
  async getAiCompanion(userId: string): Promise<AiCompanion | undefined> {
    const snapshot = await adminDb.collection('AiCompanions')
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    return fromDoc<AiCompanion>(snapshot.docs[0]);
  }

  async createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion> {
    const docRef = await adminDb.collection('AiCompanions').add({
      ...companion,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<AiCompanion>(doc)!;
  }

  // --- Daily Log operations ---
  async getDailyLogs(userId: string): Promise<DailyLog[]> {
    const snapshot = await adminDb.collection('dailyLogs')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(30)
      .get();
    
    return snapshot.docs.map(doc => fromDoc<DailyLog>(doc)!);
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const docRef = await adminDb.collection('dailyLogs').add({
      ...log,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<DailyLog>(doc)!;
  }

  // --- Community Post operations ---
  async getCommunityPosts(category?: string): Promise<CommunityPost[]> {
    let query = adminDb.collection('communityPosts').orderBy('createdAt', 'desc');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.limit(50).get();
    return snapshot.docs.map(doc => fromDoc<CommunityPost>(doc)!);
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const docRef = await adminDb.collection('communityPosts').add({
      ...post,
      likes: 0,
      replies: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<CommunityPost>(doc)!;
  }

  async updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost> {
    const postRef = adminDb.collection('communityPosts').doc(id);
    await postRef.update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await postRef.get();
    return fromDoc<CommunityPost>(doc)!;
  }

  // --- Dashboard stats ---
  async getDashboardStats(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [logsSnapshot, entriesSnapshot] = await Promise.all([
      adminDb.collection('dailyLogs')
        .where('userId', '==', userId)
        .where('date', '>=', thirtyDaysAgo)
        .get(),
      adminDb.collection('symptomWheelEntries')
        .where('userId', '==', userId)
        .where('date', '>=', thirtyDaysAgo)
        .get()
    ]);

    return {
      totalLogs: logsSnapshot.size,
      totalEntries: entriesSnapshot.size,
      currentStreak: await this.calculateStreak(userId),
      lastLogDate: logsSnapshot.empty ? null : logsSnapshot.docs[0].data().date
    };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const snapshot = await adminDb.collection('dailyLogs')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(365)
      .get();

    if (snapshot.empty) return 0;

    let streak = 0;
    let lastDate: Date | null = null;

    for (const doc of snapshot.docs) {
      const currentDate = doc.data().date.toDate();
      
      if (!lastDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        if (currentDate.getTime() === today.getTime() || 
            currentDate.getTime() === today.getTime() - 86400000) {
          streak = 1;
          lastDate = currentDate;
        } else {
          break;
        }
      } else {
        const dayDiff = (lastDate.getTime() - currentDate.getTime()) / 86400000;
        if (dayDiff === 1) {
          streak++;
          lastDate = currentDate;
        } else {
          break;
        }
      }
    }

    return streak;
  }

  // --- Symptom Pattern operations ---
  async getSymptomPatterns(userId: string): Promise<SymptomPattern[]> {
    const snapshot = await adminDb.collection('symptomPatterns')
      .where('userId', '==', userId)
      .orderBy('detectedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<SymptomPattern>(doc)!);
  }

  async createSymptomPattern(pattern: InsertSymptomPattern): Promise<SymptomPattern> {
    const docRef = await adminDb.collection('symptomPatterns').add({
      ...pattern,
      detectedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomPattern>(doc)!;
  }

  // --- Symptom Correlation operations ---
  async getSymptomCorrelations(userId: string): Promise<SymptomCorrelation[]> {
    const snapshot = await adminDb.collection('symptomCorrelations')
      .where('userId', '==', userId)
      .orderBy('correlationStrength', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<SymptomCorrelation>(doc)!);
  }

  async createSymptomCorrelation(correlation: InsertSymptomCorrelation): Promise<SymptomCorrelation> {
    const docRef = await adminDb.collection('symptomCorrelations').add({
      ...correlation,
      detectedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomCorrelation>(doc)!;
  }

  // --- Symptom Wheel operations ---
  async getSymptomWheelEntries(userId: string, limit = 10): Promise<SymptomWheelEntry[]> {
    const snapshot = await adminDb.collection('symptomWheelEntries')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => fromDoc<SymptomWheelEntry>(doc)!);
  }

  async createSymptomWheelEntry(entry: InsertSymptomWheelEntry): Promise<SymptomWheelEntry> {
    const docRef = await adminDb.collection('symptomWheelEntries').add({
      ...entry,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<SymptomWheelEntry>(doc)!;
  }

  async getSymptomWheelAnalytics(userId: string): Promise<any> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshot = await adminDb.collection('symptomWheelEntries')
      .where('userId', '==', userId)
      .where('date', '>=', thirtyDaysAgo)
      .get();

    if (snapshot.empty) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        mostCommonSymptoms: [],
        intensityTrend: 'stable'
      };
    }

    const entries = snapshot.docs.map(doc => doc.data());
    const symptomCounts = new Map<string, number>();
    let totalIntensity = 0;
    let entryCount = 0;

    entries.forEach(entry => {
      entry.symptoms.forEach((symptom: any) => {
        const key = `${symptom.category}-${symptom.location || 'general'}`;
        symptomCounts.set(key, (symptomCounts.get(key) || 0) + 1);
        totalIntensity += symptom.severity;
        entryCount++;
      });
    });

    const mostCommonSymptoms = Array.from(symptomCounts.entries())
      .map(([key, count]) => {
        const [category, location] = key.split('-');
        return { category, location, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEntries: snapshot.size,
      averageIntensity: entryCount > 0 ? (totalIntensity / entryCount).toFixed(1) : 0,
      mostCommonSymptoms,
      intensityTrend: this.calculateTrend(entries)
    };
  }

  private calculateTrend(entries: any[]): string {
    if (entries.length < 2) return 'stable';
    
    const sortedEntries = entries.sort((a, b) => 
      a.date.toDate().getTime() - b.date.toDate().getTime()
    );
    
    const firstHalf = sortedEntries.slice(0, Math.floor(entries.length / 2));
    const secondHalf = sortedEntries.slice(Math.floor(entries.length / 2));
    
    const avgFirst = this.calculateAverageIntensity(firstHalf);
    const avgSecond = this.calculateAverageIntensity(secondHalf);
    
    if (avgSecond > avgFirst * 1.1) return 'increasing';
    if (avgSecond < avgFirst * 0.9) return 'decreasing';
    return 'stable';
  }

  private calculateAverageIntensity(entries: any[]): number {
    let total = 0;
    let count = 0;
    
    entries.forEach(entry => {
      entry.symptoms.forEach((symptom: any) => {
        total += symptom.severity;
        count++;
      });
    });
    
    return count > 0 ? total / count : 0;
  }

  // --- Chat operations ---
  async getChatRooms(): Promise<ChatRoom[]> {
    const snapshot = await adminDb.collection('chatRooms')
      .where('isActive', '==', true)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<ChatRoom>(doc)!);
  }

  async getChatRoom(roomId: string): Promise<ChatRoom | undefined> {
    const doc = await adminDb.collection('chatRooms').doc(roomId).get();
    return fromDoc<ChatRoom>(doc);
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const docRef = await adminDb.collection('chatRooms').add({
      ...room,
      memberCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ChatRoom>(doc)!;
  }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const snapshot = await adminDb.collection('chatMessages')
      .where('roomId', '==', roomId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => fromDoc<ChatMessage>(doc)!).reverse();
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const docRef = await adminDb.collection('chatMessages').add({
      ...message,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ChatMessage>(doc)!;
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const snapshot = await adminDb.collection('chatRoomMembers')
      .where('roomId', '==', roomId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  async joinRoom(roomId: string, userId: string): Promise<ChatRoomMember> {
    const docRef = await adminDb.collection('chatRoomMembers').add({
      roomId,
      userId,
      role: 'member',
      joinedAt: FieldValue.serverTimestamp(),
    });
    
    // Update room member count
    await adminDb.collection('chatRooms').doc(roomId).update({
      memberCount: FieldValue.increment(1)
    });
    
    const doc = await docRef.get();
    return fromDoc<ChatRoomMember>(doc)!;
  }

  // --- Gamification operations ---
  async getChallenges(type?: string, isActive = true): Promise<Challenge[]> {
    let query = adminDb.collection('challenges')
      .where('isActive', '==', isActive);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<Challenge>(doc)!);
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const doc = await adminDb.collection('challenges').doc(id).get();
    return fromDoc<Challenge>(doc);
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const docRef = await adminDb.collection('challenges').add({
      ...challenge,
      participantCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<Challenge>(doc)!;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const challengeRef = adminDb.collection('challenges').doc(id);
    await challengeRef.update(updates);
    const doc = await challengeRef.get();
    return fromDoc<Challenge>(doc)!;
  }

  async getUserChallenges(userId: string, status?: string): Promise<UserChallenge[]> {
    let query = adminDb.collection('userChallenges')
      .where('userId', '==', userId);
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('startedAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<UserChallenge>(doc)!);
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

  async assignChallengeToUser(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const docRef = await adminDb.collection('userChallenges').add({
      ...userChallenge,
      startedAt: FieldValue.serverTimestamp(),
    });
    
    // Update challenge participant count
    await adminDb.collection('challenges').doc(userChallenge.challengeId).update({
      participantCount: FieldValue.increment(1)
    });
    
    const doc = await docRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  async updateUserChallengeProgress(id: string, progress: any, status?: string): Promise<UserChallenge> {
    const updates: any = { progress };
    if (status) {
      updates.status = status;
    }
    
    const challengeRef = adminDb.collection('userChallenges').doc(id);
    await challengeRef.update(updates);
    const doc = await challengeRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  async completeUserChallenge(id: string, pointsEarned: number): Promise<UserChallenge> {
    const challengeRef = adminDb.collection('userChallenges').doc(id);
    await challengeRef.update({
      status: 'completed',
      completedAt: FieldValue.serverTimestamp(),
      pointsEarned,
    });
    const doc = await challengeRef.get();
    return fromDoc<UserChallenge>(doc)!;
  }

  async getAchievements(category?: string): Promise<Achievement[]> {
    let query: FirebaseFirestore.Query = adminDb.collection('achievements');
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const snapshot = await query.orderBy('rarity').orderBy('title').get();
    return snapshot.docs.map(doc => fromDoc<Achievement>(doc)!);
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    const doc = await adminDb.collection('achievements').doc(id).get();
    return fromDoc<Achievement>(doc);
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const docRef = await adminDb.collection('achievements').add({
      ...achievement,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<Achievement>(doc)!;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const snapshot = await adminDb.collection('userAchievements')
      .where('userId', '==', userId)
      .orderBy('unlockedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<UserAchievement>(doc)!);
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const achievement = await this.getAchievement(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const docRef = await adminDb.collection('userAchievements').add({
      userId,
      achievementId,
      unlockedAt: FieldValue.serverTimestamp(),
      progress: 100,
      isCompleted: true,
    });

    const doc = await docRef.get();
    return fromDoc<UserAchievement>(doc)!;
  }

  async getLeaderboard(period: string, category: string, limit = 10): Promise<Leaderboard[]> {
    const snapshot = await adminDb.collection('leaderboards')
      .where('period', '==', period)
      .where('category', '==', category)
      .orderBy('score', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => fromDoc<Leaderboard>(doc)!);
  }

  async updateUserLeaderboard(userId: string, period: string, category: string, score: number): Promise<void> {
    const leaderboardId = `${userId}_${period}_${category}`;
    await adminDb.collection('leaderboards').doc(leaderboardId).set({
      userId,
      period,
      category,
      score,
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  }

  async getUserRank(userId: string, period: string, category: string): Promise<number> {
    const userScore = await adminDb.collection('leaderboards')
      .where('userId', '==', userId)
      .where('period', '==', period)
      .where('category', '==', category)
      .limit(1)
      .get();
    
    if (userScore.empty) return -1;
    
    const score = userScore.docs[0].data().score;
    
    const higherScores = await adminDb.collection('leaderboards')
      .where('period', '==', period)
      .where('category', '==', category)
      .where('score', '>', score)
      .get();
    
    return higherScores.size + 1;
  }

  // --- Point System operations ---
  async updateUserPoints(userId: string, points: number): Promise<User> {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      totalPoints: FieldValue.increment(points),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await userRef.get();
    return fromDoc<User>(doc)!;
  }

  async recordPointActivity(activity: Omit<PointActivity, 'id'>): Promise<void> {
    await adminDb.collection('pointActivities').add({
      ...activity,
      timestamp: FieldValue.serverTimestamp(),
    });
  }

  async getPointActivitiesByType(userId: string, type: string): Promise<PointActivity[]> {
    const snapshot = await adminDb.collection('pointActivities')
      .where('userId', '==', userId)
      .where('type', '==', type)
      .orderBy('timestamp', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<PointActivity>(doc)!);
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const snapshot = await adminDb.collection('userBadges')
      .where('userId', '==', userId)
      .orderBy('awardedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => fromDoc<UserBadge>(doc)!);
  }

  async awardBadge(userId: string, badge: Omit<UserBadge, 'id' | 'userId'>): Promise<void> {
    await adminDb.collection('userBadges').add({
      ...badge,
      userId,
      awardedAt: FieldValue.serverTimestamp(),
    });
  }

  async getDailyActivity(userId: string, date: Date): Promise<DailyActivity | undefined> {
    const dateStr = date.toISOString().split('T')[0];
    const doc = await adminDb.collection('dailyActivities').doc(`${userId}_${dateStr}`).get();
    return fromDoc<DailyActivity>(doc);
  }

  async updateDailyActivity(userId: string, date: Date, activity: any, points: number): Promise<void> {
    const dateStr = date.toISOString().split('T')[0];
    const docId = `${userId}_${dateStr}`;
    
    await adminDb.collection('dailyActivities').doc(docId).set({
      userId,
      date,
      activities: FieldValue.arrayUnion(activity),
      totalPoints: FieldValue.increment(points),
    }, { merge: true });
  }

  // --- AI Health Insights operations ---
  async getAiHealthInsights(userId: string, isRead?: boolean): Promise<AiHealthInsight[]> {
    let query = adminDb.collection('aiHealthInsights')
      .where('userId', '==', userId);
    
    if (isRead !== undefined) {
      query = query.where('isRead', '==', isRead);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => fromDoc<AiHealthInsight>(doc)!);
  }

  async createAiHealthInsight(insight: InsertAiHealthInsight): Promise<AiHealthInsight> {
    const docRef = await adminDb.collection('aiHealthInsights').add({
      ...insight,
      createdAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<AiHealthInsight>(doc)!;
  }

  async markInsightAsRead(id: string): Promise<void> {
    await adminDb.collection('aiHealthInsights').doc(id).update({
      isRead: true,
    });
  }

  // --- Conversation History operations ---
  async getConversationHistory(companionId: string, userId: string): Promise<ConversationHistory | undefined> {
    const snapshot = await adminDb.collection('conversationHistory')
      .where('companionId', '==', companionId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    return fromDoc<ConversationHistory>(snapshot.docs[0]);
  }

  async createConversationHistory(history: InsertConversationHistory): Promise<ConversationHistory> {
    const docRef = await adminDb.collection('conversationHistory').add({
      ...history,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    const doc = await docRef.get();
    return fromDoc<ConversationHistory>(doc)!;
  }

  async updateConversationHistory(id: string, messages: any[]): Promise<void> {
    await adminDb.collection('conversationHistory').doc(id).update({
      messages,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();