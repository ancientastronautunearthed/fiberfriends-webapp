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
  
  // Complete health profile fields from initial document
  height: varchar("height"),
  weight: varchar("weight"),
  age: integer("age"),
  gender: varchar("gender"),
  location: varchar("location"), // city, state
  diagnosisStatus: varchar("diagnosis_status"), // 'diagnosed', 'suspected'
  misdiagnoses: text("misdiagnoses").array(),
  diagnosisTimeline: text("diagnosis_timeline"),
  hasFibers: boolean("has_fibers").default(false),
  otherDiseases: text("other_diseases").array(),
  foodPreferences: jsonb("food_preferences"), // {dislikes: [], favorites: []}
  
  // Enhanced lifestyle habits with detailed smoking/alcohol info
  habits: jsonb("habits"), // {smoking: boolean, alcohol: boolean, exercise: string}
  smokingDuration: varchar("smoking_duration"), // How long they've smoked
  smokingFrequency: varchar("smoking_frequency"), // How often they smoke
  alcoholDuration: varchar("alcohol_duration"), // How long they've been drinking
  alcoholFrequency: varchar("alcohol_frequency"), // How often they drink
  
  // Personal & Family Information
  relationshipStatus: varchar("relationship_status"),
  hasChildren: boolean("has_children").default(false),
  childrenCount: integer("children_count"),
  childrenAges: varchar("children_ages"),
  hasSiblings: boolean("has_siblings").default(false),
  siblingsCount: integer("siblings_count"),
  
  // Birthday & Important Dates for Reminders and Gift Ideas
  dateOfBirth: varchar("date_of_birth"),
  partnerBirthday: varchar("partner_birthday"),
  childrenBirthdays: varchar("children_birthdays"), // JSON string of dates
  familyBirthdays: varchar("family_birthdays"), // JSON string of family member birthdays
  importantDates: varchar("important_dates"), // JSON string of other important dates
  
  // Social Support Network
  closeFriends: integer("close_friends"), // Number of close friends
  familySupport: varchar("family_support"), // Level of family support
  socialPreferences: text("social_preferences"), // How they prefer to socialize
  
  // Hobbies and interests
  hobbies: text("hobbies"),
  
  // Onboarding completion tracking
  onboardingCompleted: boolean("onboarding_completed").default(false),
  
  // Gamification
  points: integer("points").default(0),
  trophyCase: text("trophy_case").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Companions
export const aiCompanions = pgTable("ai_companions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companionName: varchar("companion_name").notNull(),
  companionImageUrl: varchar("companion_image_url"),
  personaKeywords: text("persona_keywords").array(),
  personality: text("personality"),
  preferences: jsonb("preferences"),
  voiceEnabled: boolean("voice_enabled").default(true),
  conversationStyle: varchar("conversation_style").default("supportive"),
  memoryContext: jsonb("memory_context"),
  lastInteraction: timestamp("last_interaction"),
  totalConversations: integer("total_conversations").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Conversation History
export const conversationHistory = pgTable("conversation_history", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companionId: varchar("companion_id").notNull().references(() => aiCompanions.id, { onDelete: "cascade" }),
  messageType: varchar("message_type").notNull(),
  content: text("content").notNull(),
  context: jsonb("context"),
  sentiment: varchar("sentiment"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// AI Health Insights
export const aiHealthInsights = pgTable("ai_health_insights", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  companionId: varchar("companion_id").notNull().references(() => aiCompanions.id, { onDelete: "cascade" }),
  insightType: varchar("insight_type").notNull(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  dataSource: varchar("data_source"),
  confidence: real("confidence"),
  actionable: boolean("actionable").default(false),
  dismissed: boolean("dismissed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  relevantData: jsonb("relevant_data"),
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

// Symptom Wheel Entries
export const symptomWheelEntries = pgTable("symptom_wheel_entries", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  entryDate: timestamp("entry_date").notNull(),
  symptomData: jsonb("symptom_data").notNull(), // Array of {symptomId, intensity, mood}
  totalSymptoms: integer("total_symptoms").default(0),
  averageIntensity: real("average_intensity").default(0),
  notes: text("notes"),
  moodScore: integer("mood_score"), // Overall mood 1-10
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

// Gamification Tables
export const challenges = pgTable("challenges", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // 'daily', 'weekly', 'milestone', 'special'
  category: varchar("category").notNull(), // 'health', 'nutrition', 'social', 'mindfulness'
  difficulty: varchar("difficulty").notNull(), // 'easy', 'medium', 'hard'
  pointReward: integer("point_reward").notNull(),
  requirements: jsonb("requirements").notNull(), // Completion criteria
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  icon: varchar("icon").notNull(),
  category: varchar("category").notNull(),
  tier: varchar("tier").notNull(), // 'bronze', 'silver', 'gold', 'platinum'
  pointValue: integer("point_value").notNull(),
  requirements: jsonb("requirements").notNull(),
  isSecret: boolean("is_secret").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userChallenges = pgTable("user_challenges", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  challengeId: varchar("challenge_id").notNull().references(() => challenges.id),
  status: varchar("status").notNull(), // 'active', 'completed', 'failed', 'skipped'
  progress: jsonb("progress").default({}),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  pointsEarned: integer("points_earned").default(0),
}, (table) => [
  index("idx_user_challenges_user").on(table.userId),
  index("idx_user_challenges_status").on(table.status),
]);

export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  pointsEarned: integer("points_earned").notNull(),
}, (table) => [
  index("idx_user_achievements_user").on(table.userId),
]);

export const leaderboards = pgTable("leaderboards", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  period: varchar("period").notNull(), // 'daily', 'weekly', 'monthly', 'all_time'
  category: varchar("category").notNull(), // 'points', 'challenges', 'streak'
  score: integer("score").notNull(),
  rank: integer("rank"),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_leaderboards_period_category").on(table.period, table.category),
  index("idx_leaderboards_rank").on(table.rank),
]);

export const challengeCreationLimits = pgTable("challenge_creation_limits", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  challengesCreated: integer("challenges_created").notNull().default(0),
  lastCreatedAt: timestamp("last_created_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_creation_limits_user_date").on(table.userId, table.date),
]);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  aiCompanions: many(aiCompanions),
  dailyLogs: many(dailyLogs),
  communityPosts: many(communityPosts),
  symptomPatterns: many(symptomPatterns),
  symptomCorrelations: many(symptomCorrelations),
  symptomWheelEntries: many(symptomWheelEntries),
  chatMessages: many(chatMessages),
  chatRoomMembers: many(chatRoomMembers),
  createdChatRooms: many(chatRooms),
  userChallenges: many(userChallenges),
  userAchievements: many(userAchievements),
  leaderboards: many(leaderboards),
  conversationHistory: many(conversationHistory),
  aiHealthInsights: many(aiHealthInsights),
}));

export const aiCompanionsRelations = relations(aiCompanions, ({ one, many }) => ({
  user: one(users, {
    fields: [aiCompanions.userId],
    references: [users.id],
  }),
  conversationHistory: many(conversationHistory),
  healthInsights: many(aiHealthInsights),
}));

export const conversationHistoryRelations = relations(conversationHistory, ({ one }) => ({
  user: one(users, {
    fields: [conversationHistory.userId],
    references: [users.id],
  }),
  companion: one(aiCompanions, {
    fields: [conversationHistory.companionId],
    references: [aiCompanions.id],
  }),
}));

export const aiHealthInsightsRelations = relations(aiHealthInsights, ({ one }) => ({
  user: one(users, {
    fields: [aiHealthInsights.userId],
    references: [users.id],
  }),
  companion: one(aiCompanions, {
    fields: [aiHealthInsights.companionId],
    references: [aiCompanions.id],
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

export const challengesRelations = relations(challenges, ({ many }) => ({
  userChallenges: many(userChallenges),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userChallengesRelations = relations(userChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userChallenges.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallenges.challengeId],
    references: [challenges.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const leaderboardsRelations = relations(leaderboards, ({ one }) => ({
  user: one(users, {
    fields: [leaderboards.userId],
    references: [users.id],
  }),
}));

export const challengeCreationLimitsRelations = relations(challengeCreationLimits, ({ one }) => ({
  user: one(users, {
    fields: [challengeCreationLimits.userId],
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

export const insertSymptomWheelEntrySchema = createInsertSchema(symptomWheelEntries).omit({
  id: true,
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

export type InsertSymptomWheelEntry = z.infer<typeof insertSymptomWheelEntrySchema>;
export type SymptomWheelEntry = typeof symptomWheelEntries.$inferSelect;

// Enhanced AI companion types
export const insertConversationHistorySchema = createInsertSchema(conversationHistory).omit({
  id: true,
  timestamp: true,
});

export const insertAiHealthInsightSchema = createInsertSchema(aiHealthInsights).omit({
  id: true,
  createdAt: true,
});

export type InsertConversationHistory = z.infer<typeof insertConversationHistorySchema>;
export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertAiHealthInsight = z.infer<typeof insertAiHealthInsightSchema>;
export type AiHealthInsight = typeof aiHealthInsights.$inferSelect;

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

// Gamification schema types
export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeSchema = createInsertSchema(userChallenges).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboards).omit({
  id: true,
  updatedAt: true,
});

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertUserChallenge = z.infer<typeof insertUserChallengeSchema>;
export type UserChallenge = typeof userChallenges.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertLeaderboard = z.infer<typeof insertLeaderboardSchema>;
export type Leaderboard = typeof leaderboards.$inferSelect;

export const insertChallengeCreationLimitSchema = createInsertSchema(challengeCreationLimits).omit({
  id: true,
  createdAt: true,
});

export type InsertChallengeCreationLimit = z.infer<typeof insertChallengeCreationLimitSchema>;
export type ChallengeCreationLimit = typeof challengeCreationLimits.$inferSelect;
