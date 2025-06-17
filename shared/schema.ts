// Firebase Firestore Schema Types
// This file defines the data models for Firebase Firestore collections

import { FieldValue } from 'firebase-admin/firestore';

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
  totalPoints: number;
  currentTier: string; // e.g., 'NEWCOMER', 'EXPLORER'
  streakDays: number;
  longestStreak?: number;
  level?: number;
}

export interface UserProfile {
  age?: number;
  location?: string; // For weather service
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
  nutritionalAnalysis?: any; // Added for food log analysis
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
  aiAnalysis?: string; // Corrected: Added this field
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
  earnedAt: Date;
  progress: number;
  isCompleted: boolean;
}

export interface PointActivity {
  id: string;
  userId: string;
  type: string;
  points: number;
  description: string;
  metadata?: any;
  createdAt: Date;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: Date; // Corrected: Renamed from earnedAt to awardedAt for consistency
  progress?: number;
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
  createdAt: Date;
}

export interface SymptomCorrelation {
  id: string;
  userId: string;
  symptom1: string;
  symptom2: string;
  correlationStrength: number;
  frequency: number;
  timeDelay?: number;
  confidence: number;
  createdAt: Date;
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
export type InsertUserAchievement = Omit<UserAchievement, 'id' | 'earnedAt'>;
export type InsertChatRoom = Omit<ChatRoom, 'id' | 'memberCount' | 'createdAt'>;
export type InsertChatMessage = Omit<ChatMessage, 'id' | 'createdAt'>;
export type InsertChatRoomMember = Omit<ChatRoomMember, 'id' | 'joinedAt'>;
export type InsertSymptomPattern = Omit<SymptomPattern, 'id' | 'createdAt'>;
export type InsertSymptomCorrelation = Omit<SymptomCorrelation, 'id' | 'createdAt'>;
export type InsertAiHealthInsight = Omit<AiHealthInsight, 'id' | 'createdAt'>;
export type InsertSymptomWheelEntry = Omit<SymptomWheelEntry, 'id' | 'createdAt'>;
export type InsertPointActivity = Omit<PointActivity, 'id' | 'createdAt'>; // Corrected: Added this type
export type InsertUserBadge = Omit<UserBadge, 'id' | 'awardedAt'>; // Corrected: Added this type and use awardedAt

// Update types
export type UpsertUser = Partial<InsertUser> & { id?: string };