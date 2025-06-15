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
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  companionName: varchar("companion_name").notNull(),
  companionImageUrl: varchar("companion_image_url"),
  personaKeywords: text("persona_keywords").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily Logs
export const dailyLogs = pgTable("daily_logs", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  date: timestamp("date").notNull(),
  logType: varchar("log_type").notNull(), // 'food', 'symptoms'
  data: jsonb("data").notNull(), // Contains specific log details
  createdAt: timestamp("created_at").defaultNow(),
});

// Community Posts
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  authorId: varchar("author_id").notNull(),
  category: varchar("category").notNull(), // 'story', 'success_tactic', 'question', 'support'
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  aiAnalysis: text("ai_analysis"),
  likes: integer("likes").default(0),
  replies: integer("replies").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  aiCompanions: many(aiCompanions),
  dailyLogs: many(dailyLogs),
  communityPosts: many(communityPosts),
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

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertAiCompanion = z.infer<typeof insertAiCompanionSchema>;
export type AiCompanion = typeof aiCompanions.$inferSelect;
export type InsertDailyLog = z.infer<typeof insertDailyLogSchema>;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;
