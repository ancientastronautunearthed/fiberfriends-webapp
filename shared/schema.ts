// Firebase Firestore Schema Types
// This file defines the data models for Firebase Firestore collections

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfile;
  
  // Points and gamification properties
  points: number; // Current points balance
  totalPoints: number; // All-time total points earned
  currentTier: string; // Current tier (NEWCOMER, EXPLORER, etc.)
  nextTierPoints?: number; // Points needed for next tier
  
  // Streak tracking
  streakDays: number; // Current streak in days (was currentStreak)
  longestStreak?: number; // Longest streak achieved
  
  // Additional properties
  tier: string; // Legacy field, same as currentTier
  currentStreak: number; // Legacy field, same as streakDays
  location?: string; // User's location for weather service
  level?: number; // User level for gamification
  experiencePoints?: number; // XP for leveling system
  nextLevelXP?: number; // XP needed for next level
}

export interface UserProfile {
  age?: number;
  diagnosisDate?: Date;
  severity?: 'mild' | 'moderate' | 'severe';
  primarySymptoms: string[];
  triggers: string[];
  medications: string[];
  allergies: string[];
  goals: string[];
  privacySettings: {
    shareData: boolean;
    visibleToSupport: boolean;
    anonymousContribution: boolean;
  };
  // Additional profile fields
  completionRate?: number; // Profile completion percentage
  engagementScore?: number; // User engagement score
  currentLevel?: number; // Current level in the app
  streakCount?: number; // Another streak tracking field
  preferredCategories?: string[]; // Preferred content categories
  adaptedDifficulty?: string; // Adapted difficulty level
}

export interface DailyLog {
  id: string;
  userId: string;
  date: Date;
  symptoms: SymptomEntry[];
  foodItems: FoodEntry[];
  environmentalFactors: EnvironmentalEntry[];
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  sleepHours?: number;
  notes?: string;
  createdAt: Date;
}

export interface SymptomEntry {
  type: string;
  severity: number; // 1-10 scale
  location?: string;
  duration?: string;
  triggers?: string[];
  notes?: string;
}

export interface FoodEntry {
  name: string;
  category: string;
  portion: string;
  time: Date;
  reaction?: string;
  severity?: number;
}

export interface EnvironmentalEntry {
  factor: string;
  value: string | number;
  unit?: string;
}

export interface AiCompanion {
  id: string;
  userId: string;
  name: string;
  personality: LunaPersonality;
  imageUrl: string;
  description: string;
  communicationStyle: string;
  focusAreas: string[];
  greeting: string;
  createdAt: Date;
}

export interface LunaPersonality {
  tone: 'warm' | 'professional' | 'playful' | 'gentle' | 'energetic';
  style: 'supportive' | 'analytical' | 'motivational' | 'empathetic' | 'practical';
  personality: 'nurturing' | 'scientific' | 'encouraging' | 'calm' | 'enthusiastic';
  appearance: {
    hairColor: 'blonde' | 'brown' | 'black' | 'red' | 'silver' | 'blue';
    eyeColor: 'blue' | 'brown' | 'green' | 'hazel' | 'purple' | 'amber';
    style: 'professional' | 'casual' | 'artistic' | 'futuristic' | 'natural';
    outfit: 'lab_coat' | 'casual_wear' | 'business_attire' | 'artistic_clothing' | 'nature_inspired';
    environment: 'medical_office' | 'cozy_room' | 'garden' | 'tech_space' | 'peaceful_sanctuary';
  };
}

export interface ConversationHistory {
  id: string;
  companionId: string;
  userId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes: number;
  replies: number;
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityReply {
  id: string;
  postId: string;
  userId: string;
  content: string;
  likes: number;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'personal' | 'milestone';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  requirements: any;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  participantCount: number;
  createdAt: Date;
}

export interface UserChallenge {
  id: string;
  userId: string;
  challengeId: string;
  challenge?: Challenge; // Reference to the challenge details
  status: 'active' | 'completed' | 'failed' | 'skipped';
  progress: number;
  startedAt: Date;
  completedAt?: Date;
  evidence?: any;
  pointsEarned: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  requirements: any;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: Date;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
  isCompleted: boolean;
  pointsEarned?: number; // Points earned from this achievement
}

export interface PointActivity {
  id: string;
  userId: string;
  type: string;
  points: number;
  pointsEarned?: number; // Alternative field name
  description: string;
  metadata?: any;
  createdAt: Date;
  timestamp?: Date; // Alternative timestamp field
  bonus?: boolean; // If this was a bonus activity
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  title: string;
  name?: string; // Alternative to title
  description: string;
  icon: string;
  iconUrl?: string; // URL for custom icons
  awardedAt: Date;
  unlockedAt?: Date; // Alternative to awardedAt
  earnedAt?: Date; // Another alternative
  progress?: number;
  rarity?: string; // Badge rarity
  tier?: string; // Badge tier (bronze, silver, gold, platinum)
  pointsReward?: number; // Points given for earning this badge
  target?: number; // Target for progress-based badges
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'support';
  createdBy: string;
  memberCount: number;
  isActive: boolean;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  userId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  isAnonymous: boolean;
  createdAt: Date;
}

export interface ChatRoomMember {
  id: string;
  roomId: string;
  userId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  lastSeenAt?: Date;
}

export interface SymptomPattern {
  id: string;
  userId: string;
  patternType: string;
  symptoms: string[];
  triggers: string[];
  frequency: string;
  severity: number;
  timePattern: string;
  confidence: number;
  detectedAt: Date;
}

export interface SymptomCorrelation {
  id: string;
  userId: string;
  symptom1: string;
  symptom2: string;
  primarySymptom?: string; // Alternative field name
  correlatedSymptom?: string; // Alternative field name
  correlationStrength: number;
  frequency: number;
  timeDelay?: number;
  confidence: number;
  detectedAt: Date;
}

export interface AiHealthInsight {
  id: string;
  userId: string;
  type: 'pattern' | 'recommendation' | 'warning' | 'progress';
  title: string;
  content: string;
  data: any;
  confidence: number;
  isRead: boolean;
  createdAt: Date;
}

export interface SymptomWheelEntry {
  id: string;
  userId: string;
  date: Date;
  symptoms: {
    category: string;
    severity: number;
    location?: string;
  }[];
  overallSeverity: number;
  notes?: string;
  createdAt: Date;
}

export interface Leaderboard {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'all-time';
  category: 'points' | 'streak' | 'challenges' | 'community';
  rank: number;
  score: number;
  updatedAt: Date;
}

// Type helpers for creating and updating documents
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertDailyLog = Omit<DailyLog, 'id' | 'createdAt'>;
export type InsertAiCompanion = Omit<AiCompanion, 'id' | 'createdAt'>;
export type InsertConversationHistory = Omit<ConversationHistory, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCommunityPost = Omit<CommunityPost, 'id' | 'likes' | 'replies' | 'createdAt' | 'updatedAt'>;
export type InsertChallenge = Omit<Challenge, 'id' | 'participantCount' | 'createdAt'>;
export type InsertUserChallenge = Omit<UserChallenge, 'id' | 'startedAt'>;
export type InsertAchievement = Omit<Achievement, 'id' | 'createdAt'>;
export type InsertUserAchievement = Omit<UserAchievement, 'id'>;
export type InsertChatRoom = Omit<ChatRoom, 'id' | 'memberCount' | 'createdAt'>;
export type InsertChatMessage = Omit<ChatMessage, 'id' | 'createdAt'>;
export type InsertChatRoomMember = Omit<ChatRoomMember, 'id'>;
export type InsertSymptomPattern = Omit<SymptomPattern, 'id' | 'detectedAt'>;
export type InsertSymptomCorrelation = Omit<SymptomCorrelation, 'id' | 'detectedAt'>;
export type InsertAiHealthInsight = Omit<AiHealthInsight, 'id' | 'createdAt'>;
export type InsertSymptomWheelEntry = Omit<SymptomWheelEntry, 'id' | 'createdAt'>;

// Update types
export type UpsertUser = Partial<InsertUser> & { id?: string };