import { 
  users, 
  aiCompanions,
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
  challengeCreationLimits,
  type User, 
  type UpsertUser,
  type AiCompanion,
  type InsertAiCompanion,
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
  type InsertLeaderboard,
  type ChallengeCreationLimit,
  type InsertChallengeCreationLimit
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<UpsertUser>): Promise<User>;
  
  // AI Companion operations
  getAiCompanion(userId: string): Promise<AiCompanion | undefined>;
  createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion>;
  
  // Daily Log operations
  getDailyLogs(userId: string): Promise<DailyLog[]>;
  createDailyLog(log: InsertDailyLog): Promise<DailyLog>;
  
  // Community Post operations
  getCommunityPosts(category?: string): Promise<CommunityPost[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<any>;
  
  // Symptom pattern operations
  getSymptomPatterns(userId: string): Promise<SymptomPattern[]>;
  createSymptomPattern(pattern: InsertSymptomPattern): Promise<SymptomPattern>;
  
  // Symptom correlation operations
  getSymptomCorrelations(userId: string): Promise<SymptomCorrelation[]>;
  createSymptomCorrelation(correlation: InsertSymptomCorrelation): Promise<SymptomCorrelation>;
  
  // Symptom wheel operations
  getSymptomWheelEntries(userId: string, limit?: number): Promise<SymptomWheelEntry[]>;
  createSymptomWheelEntry(entry: InsertSymptomWheelEntry): Promise<SymptomWheelEntry>;
  getSymptomWheelAnalytics(userId: string): Promise<any>;
  
  // Chat operations
  getChatRooms(): Promise<ChatRoom[]>;
  getChatRoom(roomId: string): Promise<ChatRoom | undefined>;
  createChatRoom(room: InsertChatRoom): Promise<ChatRoom>;
  getChatMessages(roomId: string, limit?: number): Promise<ChatMessage[]>;
  getChatMessageWithUser(messageId: string): Promise<any>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  isRoomMember(roomId: string, userId: string): Promise<boolean>;
  joinRoom(roomId: string, userId: string): Promise<ChatRoomMember>;
  updateRoomActivity(roomId: string): Promise<void>;

  // Gamification operations
  getChallenges(type?: string, isActive?: boolean): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  createChallenge(challenge: InsertChallenge): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge>;
  
  getUserChallenges(userId: string, status?: string): Promise<UserChallenge[]>;
  getUserChallenge(userId: string, challengeId: string): Promise<UserChallenge | undefined>;
  assignChallengeToUser(userChallenge: InsertUserChallenge): Promise<UserChallenge>;
  updateUserChallengeProgress(id: string, progress: any, status?: string): Promise<UserChallenge>;
  completeUserChallenge(id: string, pointsEarned: number): Promise<UserChallenge>;
  
  getAchievements(category?: string): Promise<Achievement[]>;
  getAchievement(id: string): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;
  
  getLeaderboard(period: string, category: string, limit?: number): Promise<Leaderboard[]>;
  updateUserLeaderboard(userId: string, period: string, category: string, score: number): Promise<void>;
  getUserRank(userId: string, period: string, category: string): Promise<number>;
  
  updateUserPoints(userId: string, points: number): Promise<User>;
  
  // Challenge creation rate limiting
  getChallengeCreationLimit(userId: string, date: string): Promise<ChallengeCreationLimit | undefined>;
  updateChallengeCreationLimit(userId: string, date: string): Promise<ChallengeCreationLimit>;
  canCreateChallenge(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // AI Companion operations
  async getAiCompanion(userId: string): Promise<AiCompanion | undefined> {
    const [companion] = await db
      .select()
      .from(aiCompanions)
      .where(eq(aiCompanions.userId, userId));
    return companion;
  }

  async createAiCompanion(companion: InsertAiCompanion): Promise<AiCompanion> {
    const companionWithId = {
      ...companion,
      id: crypto.randomUUID(),
    };
    const [result] = await db
      .insert(aiCompanions)
      .values(companionWithId)
      .returning();
    return result;
  }

  // Daily Log operations
  async getDailyLogs(userId: string): Promise<DailyLog[]> {
    const logs = await db
      .select()
      .from(dailyLogs)
      .where(eq(dailyLogs.userId, userId))
      .orderBy(desc(dailyLogs.date))
      .limit(30);
    return logs;
  }

  async createDailyLog(log: InsertDailyLog): Promise<DailyLog> {
    const logWithId = {
      ...log,
      id: crypto.randomUUID(),
    };
    const [result] = await db
      .insert(dailyLogs)
      .values(logWithId)
      .returning();
    return result;
  }

  // Community Post operations
  async getCommunityPosts(category?: string): Promise<CommunityPost[]> {
    if (category) {
      return await db
        .select()
        .from(communityPosts)
        .where(eq(communityPosts.category, category))
        .orderBy(desc(communityPosts.createdAt))
        .limit(50);
    }

    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(50);
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const postWithId = {
      ...post,
      id: crypto.randomUUID(),
    };
    const [result] = await db
      .insert(communityPosts)
      .values(postWithId)
      .returning();
    return result;
  }

  async updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost> {
    const [result] = await db
      .update(communityPosts)
      .set(updates)
      .where(eq(communityPosts.id, id))
      .returning();
    return result;
  }

  // Dashboard stats
  async getDashboardStats(userId: string): Promise<any> {
    const recentLogs = await this.getDailyLogs(userId);
    const activeChallenges = await this.getUserChallenges(userId, 'active');
    const completedChallenges = await this.getUserChallenges(userId, 'completed');
    const userAchievements = await this.getUserAchievements(userId);
    
    const totalLogs = recentLogs.length;
    const streak = 7; // Mock calculation
    
    return {
      totalLogs,
      streak,
      recentLogs: recentLogs.slice(0, 5),
      activeChallenges: activeChallenges.slice(0, 3),
      totalActiveChallenges: activeChallenges.length,
      totalCompletedChallenges: completedChallenges.length,
      totalAchievements: userAchievements.length,
    };
  }

  // Symptom pattern operations
  async getSymptomPatterns(userId: string): Promise<SymptomPattern[]> {
    const patterns = await db.select().from(symptomPatterns).where(eq(symptomPatterns.userId, userId));
    return patterns;
  }

  async createSymptomPattern(pattern: InsertSymptomPattern): Promise<SymptomPattern> {
    const patternWithId = {
      ...pattern,
      id: crypto.randomUUID(),
    };
    const [newPattern] = await db
      .insert(symptomPatterns)
      .values(patternWithId)
      .returning();
    return newPattern;
  }

  // Symptom correlation operations
  async getSymptomCorrelations(userId: string): Promise<SymptomCorrelation[]> {
    const correlations = await db.select().from(symptomCorrelations).where(eq(symptomCorrelations.userId, userId));
    return correlations;
  }

  async createSymptomCorrelation(correlation: InsertSymptomCorrelation): Promise<SymptomCorrelation> {
    const correlationWithId = {
      ...correlation,
      id: crypto.randomUUID(),
    };
    const [newCorrelation] = await db
      .insert(symptomCorrelations)
      .values(correlationWithId)
      .returning();
    return newCorrelation;
  }

  // Symptom wheel operations
  async getSymptomWheelEntries(userId: string, limit: number = 30): Promise<SymptomWheelEntry[]> {
    const entries = await db
      .select()
      .from(symptomWheelEntries)
      .where(eq(symptomWheelEntries.userId, userId))
      .orderBy(desc(symptomWheelEntries.entryDate))
      .limit(limit);
    return entries;
  }

  async createSymptomWheelEntry(entry: InsertSymptomWheelEntry): Promise<SymptomWheelEntry> {
    const entryWithId = {
      ...entry,
      id: crypto.randomUUID(),
    };
    const [newEntry] = await db
      .insert(symptomWheelEntries)
      .values(entryWithId)
      .returning();
    return newEntry;
  }

  async getSymptomWheelAnalytics(userId: string): Promise<any> {
    const entries = await this.getSymptomWheelEntries(userId, 90); // Last 90 entries
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageIntensity: 0,
        averageMoodScore: 0,
        mostCommonSymptoms: [],
        intensityTrend: 'stable',
        weeklyStats: []
      };
    }

    const totalEntries = entries.length;
    const avgIntensity = entries.reduce((sum, entry) => sum + (entry.averageIntensity || 0), 0) / totalEntries;
    const avgMoodScore = entries.reduce((sum, entry) => sum + (entry.moodScore || 5), 0) / totalEntries;

    // Calculate most common symptoms
    const symptomCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.symptomData && Array.isArray(entry.symptomData)) {
        entry.symptomData.forEach((symptom: any) => {
          if (symptom.symptomId) {
            symptomCounts[symptom.symptomId] = (symptomCounts[symptom.symptomId] || 0) + 1;
          }
        });
      }
    });

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));

    // Calculate trend (simple comparison of recent vs older entries)
    const recentEntries = entries.slice(0, Math.ceil(entries.length / 3));
    const olderEntries = entries.slice(Math.ceil(entries.length * 2 / 3));
    
    const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.averageIntensity || 0), 0) / recentEntries.length;
    const olderAvg = olderEntries.reduce((sum, entry) => sum + (entry.averageIntensity || 0), 0) / olderEntries.length;
    
    let intensityTrend = 'stable';
    if (recentAvg > olderAvg + 0.5) intensityTrend = 'increasing';
    else if (recentAvg < olderAvg - 0.5) intensityTrend = 'decreasing';

    return {
      totalEntries,
      averageIntensity: Math.round(avgIntensity * 10) / 10,
      averageMoodScore: Math.round(avgMoodScore * 10) / 10,
      mostCommonSymptoms,
      intensityTrend,
      weeklyStats: this.calculateWeeklyStats(entries)
    };
  }

  private calculateWeeklyStats(entries: SymptomWheelEntry[]): any[] {
    const weeklyData: Record<string, { totalIntensity: number; count: number; moodTotal: number }> = {};
    
    entries.forEach(entry => {
      const week = this.getWeekKey(new Date(entry.entryDate));
      if (!weeklyData[week]) {
        weeklyData[week] = { totalIntensity: 0, count: 0, moodTotal: 0 };
      }
      weeklyData[week].totalIntensity += entry.averageIntensity || 0;
      weeklyData[week].moodTotal += entry.moodScore || 5;
      weeklyData[week].count += 1;
    });

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        averageIntensity: Math.round((data.totalIntensity / data.count) * 10) / 10,
        averageMoodScore: Math.round((data.moodTotal / data.count) * 10) / 10,
        entryCount: data.count
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  }

  private getWeekKey(date: Date): string {
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    return startOfWeek.toISOString().split('T')[0];
  }

  // Chat operations
  async getChatRooms(): Promise<ChatRoom[]> {
    const rooms = await db.select().from(chatRooms).orderBy(desc(chatRooms.lastActivity));
    return rooms;
  }

  async getChatRoom(roomId: string): Promise<ChatRoom | undefined> {
    const [room] = await db.select().from(chatRooms).where(eq(chatRooms.id, roomId));
    return room;
  }

  async createChatRoom(room: InsertChatRoom): Promise<ChatRoom> {
    const roomWithId = {
      ...room,
      id: crypto.randomUUID(),
    };
    const [newRoom] = await db
      .insert(chatRooms)
      .values(roomWithId)
      .returning();
    return newRoom;
  }

  async getChatMessages(roomId: string, limit = 50): Promise<ChatMessage[]> {
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.roomId, roomId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
    return messages.reverse(); // Return in chronological order
  }

  async getChatMessageWithUser(messageId: string): Promise<any> {
    const [result] = await db
      .select({
        id: chatMessages.id,
        roomId: chatMessages.roomId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        messageType: chatMessages.messageType,
        replyToId: chatMessages.replyToId,
        isEdited: chatMessages.isEdited,
        editedAt: chatMessages.editedAt,
        createdAt: chatMessages.createdAt,
        authorName: users.firstName,
        authorEmail: users.email,
        authorProfileImage: users.profileImageUrl,
      })
      .from(chatMessages)
      .innerJoin(users, eq(chatMessages.userId, users.id))
      .where(eq(chatMessages.id, messageId));
    return result;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const messageWithId = {
      ...message,
      id: crypto.randomUUID(),
    };
    const [newMessage] = await db
      .insert(chatMessages)
      .values(messageWithId)
      .returning();
    return newMessage;
  }

  async isRoomMember(roomId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(chatRoomMembers)
      .where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, userId)));
    return !!member;
  }

  async joinRoom(roomId: string, userId: string): Promise<ChatRoomMember> {
    const memberWithId = {
      id: crypto.randomUUID(),
      roomId,
      userId,
      role: 'member' as const,
    };
    const [newMember] = await db
      .insert(chatRoomMembers)
      .values(memberWithId)
      .returning();
    return newMember;
  }

  async updateRoomActivity(roomId: string): Promise<void> {
    await db
      .update(chatRooms)
      .set({ lastActivity: new Date() })
      .where(eq(chatRooms.id, roomId));
  }

  // Gamification operations
  async getChallenges(type?: string, isActive?: boolean): Promise<Challenge[]> {
    let query = db.select().from(challenges);
    
    if (type) {
      query = query.where(eq(challenges.type, type));
    }
    if (isActive !== undefined) {
      query = query.where(eq(challenges.isActive, isActive));
    }
    
    return await query.orderBy(desc(challenges.createdAt));
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const [challenge] = await db
      .select()
      .from(challenges)
      .where(eq(challenges.id, id));
    return challenge;
  }

  async createChallenge(challenge: InsertChallenge): Promise<Challenge> {
    const challengeWithId = {
      ...challenge,
      id: crypto.randomUUID(),
    };
    const [newChallenge] = await db
      .insert(challenges)
      .values(challengeWithId)
      .returning();
    return newChallenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const [updatedChallenge] = await db
      .update(challenges)
      .set(updates)
      .where(eq(challenges.id, id))
      .returning();
    return updatedChallenge;
  }

  async getUserChallenges(userId: string, status?: string): Promise<any[]> {
    let whereCondition;
    if (status) {
      whereCondition = and(eq(userChallenges.userId, userId), eq(userChallenges.status, status));
    } else {
      whereCondition = eq(userChallenges.userId, userId);
    }
    
    const userChallengeRows = await db
      .select()
      .from(userChallenges)
      .where(whereCondition)
      .orderBy(desc(userChallenges.startedAt));

    // Fetch challenge details for each user challenge
    const results = [];
    for (const userChallenge of userChallengeRows) {
      const [challenge] = await db
        .select()
        .from(challenges)
        .where(eq(challenges.id, userChallenge.challengeId));
      
      results.push({
        ...userChallenge,
        challenge: challenge || null
      });
    }
    
    return results;
  }

  async getUserChallenge(userId: string, challengeId: string): Promise<UserChallenge | undefined> {
    const [userChallenge] = await db
      .select()
      .from(userChallenges)
      .where(and(
        eq(userChallenges.userId, userId),
        eq(userChallenges.challengeId, challengeId)
      ));
    return userChallenge;
  }

  async assignChallengeToUser(userChallenge: InsertUserChallenge): Promise<UserChallenge> {
    const userChallengeWithId = {
      ...userChallenge,
      id: crypto.randomUUID(),
    };
    const [newUserChallenge] = await db
      .insert(userChallenges)
      .values(userChallengeWithId)
      .returning();
    return newUserChallenge;
  }

  async updateUserChallengeProgress(id: string, progress: any, status?: string): Promise<UserChallenge> {
    const updates: any = { progress };
    if (status) {
      updates.status = status;
    }
    
    const [updatedUserChallenge] = await db
      .update(userChallenges)
      .set(updates)
      .where(eq(userChallenges.id, id))
      .returning();
    return updatedUserChallenge;
  }

  async completeUserChallenge(id: string, pointsEarned: number): Promise<UserChallenge> {
    const [completedChallenge] = await db
      .update(userChallenges)
      .set({
        status: 'completed',
        completedAt: new Date(),
        pointsEarned,
      })
      .where(eq(userChallenges.id, id))
      .returning();
    return completedChallenge;
  }

  async getAchievements(category?: string): Promise<Achievement[]> {
    let query = db.select().from(achievements);
    
    if (category) {
      query = query.where(eq(achievements.category, category));
    }
    
    return await query.orderBy(achievements.tier, achievements.title);
  }

  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.id, id));
    return achievement;
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const achievementWithId = {
      ...achievement,
      id: crypto.randomUUID(),
    };
    const [newAchievement] = await db
      .insert(achievements)
      .values(achievementWithId)
      .returning();
    return newAchievement;
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const achievement = await this.getAchievement(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const userAchievementWithId = {
      id: crypto.randomUUID(),
      userId,
      achievementId,
      pointsEarned: achievement.pointValue,
    };

    const [newUserAchievement] = await db
      .insert(userAchievements)
      .values(userAchievementWithId)
      .returning();
    return newUserAchievement;
  }

  async getLeaderboard(period: string, category: string, limit = 10): Promise<Leaderboard[]> {
    return await db
      .select()
      .from(leaderboards)
      .where(and(
        eq(leaderboards.period, period),
        eq(leaderboards.category, category)
      ))
      .orderBy(leaderboards.rank)
      .limit(limit);
  }

  async updateUserLeaderboard(userId: string, period: string, category: string, score: number): Promise<void> {
    const existing = await db
      .select()
      .from(leaderboards)
      .where(and(
        eq(leaderboards.userId, userId),
        eq(leaderboards.period, period),
        eq(leaderboards.category, category)
      ));

    if (existing.length > 0) {
      await db
        .update(leaderboards)
        .set({ score, updatedAt: new Date() })
        .where(eq(leaderboards.id, existing[0].id));
    } else {
      const now = new Date();
      const leaderboardEntry = {
        id: crypto.randomUUID(),
        userId,
        period,
        category,
        score,
        rank: 0, // Will be calculated separately
        periodStart: now,
        periodEnd: now,
      };
      
      await db.insert(leaderboards).values(leaderboardEntry);
    }
  }

  async getUserRank(userId: string, period: string, category: string): Promise<number> {
    const [result] = await db
      .select({ rank: leaderboards.rank })
      .from(leaderboards)
      .where(and(
        eq(leaderboards.userId, userId),
        eq(leaderboards.period, period),
        eq(leaderboards.category, category)
      ));
    
    return result?.rank || 0;
  }

  async updateUserPoints(userId: string, points: number): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ 
        points: points,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Challenge creation rate limiting
  async getChallengeCreationLimit(userId: string, date: string): Promise<ChallengeCreationLimit | undefined> {
    const [limit] = await db
      .select()
      .from(challengeCreationLimits)
      .where(and(
        eq(challengeCreationLimits.userId, userId),
        eq(challengeCreationLimits.date, date)
      ));
    return limit;
  }

  async updateChallengeCreationLimit(userId: string, date: string): Promise<ChallengeCreationLimit> {
    const existing = await this.getChallengeCreationLimit(userId, date);
    
    if (existing) {
      const [updated] = await db
        .update(challengeCreationLimits)
        .set({
          challengesCreated: existing.challengesCreated + 1,
          lastCreatedAt: new Date()
        })
        .where(eq(challengeCreationLimits.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(challengeCreationLimits)
        .values({
          id: crypto.randomUUID(),
          userId,
          date,
          challengesCreated: 1,
          lastCreatedAt: new Date()
        })
        .returning();
      return created;
    }
  }

  async canCreateChallenge(userId: string): Promise<boolean> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const limit = await this.getChallengeCreationLimit(userId, today);
    
    // Allow 3 challenges per day
    const DAILY_LIMIT = 3;
    return !limit || limit.challengesCreated < DAILY_LIMIT;
  }
}

export const storage = new DatabaseStorage();