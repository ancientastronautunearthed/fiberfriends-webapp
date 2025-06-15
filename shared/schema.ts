import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Health profile fields
  height: varchar("height"),
  weight: varchar("weight"),
  age: integer("age"),
  gender: varchar("gender"),
  location: varchar("location"),
  diagnosisStatus: varchar("diagnosis_status"), // 'diagnosed', 'suspected'
  misdiagnoses: text("misdiagnoses").array(),
  diagnosisTimeline: text("diagnosis_timeline"),
  hasFibers: boolean("has_fibers").default(false),
  otherDiseases: text("other_diseases").array(),
  foodPreferences: jsonb("food_preferences"), // {dislikes: [], favorites: []}
  habits: jsonb("habits"), // {smoking: boolean, etc}
  hobbies: text("hobbies"),
  points: integer("points").default(0),
  trophyCase: text("trophy_case").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Companions
export const aiCompanions = pgTable("ai_companions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  companionName: varchar("companion_name").notNull(),
  companionImageUrl: varchar("companion_image_url"),
  personaKeywords: text("persona_keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Logs
export const dailyLogs = pgTable("daily_logs", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(),
  logType: varchar("log_type").notNull(), // 'food', 'symptoms'
  data: jsonb("data").notNull(), // Contains specific log details
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: varchar("id").primaryKey(),
  authorId: varchar("author_id").notNull(),
  category: varchar("category").notNull(), // 'story', 'success_tactic', 'question', 'support'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  aiAnalysis: text("ai_analysis"),
  likes: integer("likes").default(0),
  replies: integer("replies").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Symptom Patterns and Analytics
export const symptomPatterns = pgTable("symptom_patterns", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  patternType: varchar("pattern_type").notNull(), // 'correlation', 'trend', 'trigger', 'cycle'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  confidence: integer("confidence").notNull(), // 0-100 confidence score
  frequency: varchar("frequency"), // 'daily', 'weekly', 'monthly', 'irregular'
  triggeredBy: text("triggered_by").array(), // Food items, activities, weather, etc.
  symptoms: jsonb("symptoms").notNull(), // Affected symptoms and severity patterns
  timeframe: jsonb("timeframe").notNull(), // Start/end dates, duration
  recommendations: text("recommendations").array(),
  isActive: boolean("is_active").default(true),
  lastDetected: timestamp("last_detected"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Symptom Correlations
export const symptomCorrelations = pgTable("symptom_correlations", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  primarySymptom: varchar("primary_symptom").notNull(),
  correlatedSymptom: varchar("correlated_symptom").notNull(),
  correlationStrength: integer("correlation_strength").notNull(), // -100 to 100
  occurrenceCount: integer("occurrence_count").default(1),
  averageTimeLag: integer("average_time_lag"), // Hours between symptoms
  contextFactors: text("context_factors").array(), // Weather, food, stress, etc.
  lastObserved: timestamp("last_observed").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Rooms
export const chatRooms = pgTable("chat_rooms", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // general, support, research, etc.
  isPrivate: boolean("is_private").default(false),
  createdBy: varchar("created_by").notNull(),
  memberCount: integer("member_count").default(0),
  lastActivity: timestamp("last_activity").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  messageType: varchar("message_type").default("text"), // text, image, file, system
  replyToId: varchar("reply_to_id"), // For threaded conversations
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat Room Members
export const chatRoomMembers = pgTable("chat_room_members", {
  id: varchar("id").primaryKey(),
  roomId: varchar("room_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: varchar("role").default("member"), // member, moderator, admin
  joinedAt: timestamp("joined_at").defaultNow(),
  lastRead: timestamp("last_read").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  aiCompanions: many(aiCompanions),
  dailyLogs: many(dailyLogs),
  communityPosts: many(communityPosts),
  symptomPatterns: many(symptomPatterns),
  symptomCorrelations: many(symptomCorrelations),
  chatMessages: many(chatMessages),
  chatRoomMembers: many(chatRoomMembers),
  createdChatRooms: many(chatRooms),
}));

export const aiCompanionsRelations = relations(aiCompanions, ({ one }) => ({
  user: one(users, {
    fields: [aiCompanions.userId],
    references: [users.id],
  }),
}));

export const dailyLogsRelations = relations(dailyLogs, ({ one }) => ({
  user: one(users, {
    fields: [dailyLogs.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  author: one(users, {
    fields: [communityPosts.authorId],
    references: [users.id],
  }),
}));

export const symptomPatternsRelations = relations(symptomPatterns, ({ one }) => ({
  user: one(users, {
    fields: [symptomPatterns.userId],
    references: [users.id],
  }),
}));

export const symptomCorrelationsRelations = relations(symptomCorrelations, ({ one }) => ({
  user: one(users, {
    fields: [symptomCorrelations.userId],
    references: [users.id],
  }),
}));

export const chatRoomsRelations = relations(chatRooms, ({ one, many }) => ({
  creator: one(users, {
    fields: [chatRooms.createdBy],
    references: [users.id],
  }),
  messages: many(chatMessages),
  members: many(chatRoomMembers),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatMessages.roomId],
    references: [chatRooms.id],
  }),
  author: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyToId],
    references: [chatMessages.id],
  }),
}));

export const chatRoomMembersRelations = relations(chatRoomMembers, ({ one }) => ({
  room: one(chatRooms, {
    fields: [chatRoomMembers.roomId],
    references: [chatRooms.id],
  }),
  user: one(users, {
    fields: [chatRoomMembers.userId],
    references: [users.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAiCompanionSchema = createInsertSchema(aiCompanions).omit({
  id: true,
  createdAt: true,
});

export const insertDailyLogSchema = createInsertSchema(dailyLogs).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likes: true,
  replies: true,
  createdAt: true,
});

export const insertSymptomPatternSchema = createInsertSchema(symptomPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSymptomCorrelationSchema = createInsertSchema(symptomCorrelations).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAiCompanion = z.infer<typeof insertAiCompanionSchema>;
export type AiCompanion = typeof aiCompanions.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertSymptomPattern = z.infer<typeof insertSymptomPatternSchema>;
export type SymptomPattern = typeof symptomPatterns.$inferSelect;
export type InsertSymptomCorrelation = z.infer<typeof insertSymptomCorrelationSchema>;
export type SymptomCorrelation = typeof symptomCorrelations.$inferSelect;

export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  lastActivity: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).omit({
  id: true,
  joinedAt: true,
  lastRead: true,
});

export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
