import { 
  users, 
  aiCompanions,
  dailyLogs,
  communityPosts,
  type User, 
  type UpsertUser,
  type AiCompanion,
  type InsertAiCompanion,
  type DailyLog,
  type InsertDailyLog,
  type CommunityPost,
  type InsertCommunityPost
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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
  updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<any>;
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
    const [result] = await db
      .insert(dailyLogs)
      .values(log)
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
    const [result] = await db
      .insert(communityPosts)
      .values(post)
      .returning();
    return result;
  }

  async updateCommunityPost(id: number, updates: Partial<CommunityPost>): Promise<CommunityPost> {
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
    const totalLogs = recentLogs.length;
    const streak = 7; // Mock calculation
    
    return {
      totalLogs,
      streak,
      recentLogs: recentLogs.slice(0, 5),
    };
  }
}

export const storage = new DatabaseStorage();