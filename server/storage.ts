import { 
  users, 
  aiCompanions,
  dailyLogs,
  communityPosts,
  symptomPatterns,
  symptomCorrelations,
  chatRooms,
  chatMessages,
  chatRoomMembers,
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
  type ChatRoom,
  type InsertChatRoom,
  type ChatMessage,
  type InsertChatMessage,
  type ChatRoomMember,
  type InsertChatRoomMember
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
  updateCommunityPost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost>;
  
  // Dashboard stats
  getDashboardStats(userId: string): Promise<any>;
  
  // Symptom pattern operations
  getSymptomPatterns(userId: string): Promise<SymptomPattern[]>;
  createSymptomPattern(pattern: InsertSymptomPattern): Promise<SymptomPattern>;
  
  // Symptom correlation operations
  getSymptomCorrelations(userId: string): Promise<SymptomCorrelation[]>;
  createSymptomCorrelation(correlation: InsertSymptomCorrelation): Promise<SymptomCorrelation>;
  
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
    const totalLogs = recentLogs.length;
    const streak = 7; // Mock calculation
    
    return {
      totalLogs,
      streak,
      recentLogs: recentLogs.slice(0, 5),
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
}

export const storage = new DatabaseStorage();