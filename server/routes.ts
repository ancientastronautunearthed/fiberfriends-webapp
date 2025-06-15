import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupFirebaseAuth, isAuthenticated } from "./firebaseAuth";
import { SimpleChatServer } from "./simpleWebSocket";
import { insertDailyLogSchema, insertCommunityPostSchema, insertAiCompanionSchema, insertChatRoomSchema, insertChallengeSchema, insertUserChallengeSchema, insertSymptomWheelEntrySchema, insertConversationHistorySchema, insertAiHealthInsightSchema } from "@shared/schema";
import { 
  generateNutritionalAnalysis, 
  generateSymptomInsight, 
  generateCommunityPostAnalysis,
  generateAICompanionResponse,
  generateDailyChallenge,
  generatePersonalizedChallenge,
  generateWeeklyChallenge,
  generateMilestoneChallenge,
  generateAchievementSuggestions
} from "./genkit";
import { recommendationEngine } from "./recommendationEngine";
import { pointsSystem } from "./pointsSystem";
import { weatherService } from "./weatherService";
import { generateLunaPersonality, generateLunaImage, type LunaPersonality } from "./lunaGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupFirebaseAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Create dev user if doesn't exist
      if (!user && userId === 'dev-user-123') {
        user = await storage.upsertUser({
          id: 'dev-user-123',
          email: 'dev@example.com',
          firstName: 'Dev',
          lastName: 'User',
          profileImageUrl: null,
          points: 150,
          trophyCase: ['early_adopter'],
          height: null,
          weight: null,
          age: null,
          gender: null,
          location: null,
          diagnosisStatus: null,
          misdiagnoses: [],
          diagnosisTimeline: null,
          hasFibers: false,
          otherDiseases: [],
          foodPreferences: null,
          habits: null,
          hobbies: null
        });

        // Create some sample challenges
        const sampleChallenges = [
          {
            title: "Morning Symptom Check",
            description: "Track your symptoms for 3 consecutive mornings",
            category: "health",
            type: "daily",
            difficulty: "easy",
            pointReward: 10,
            requirements: { consecutive_days: 3, time_of_day: "morning" },
            isActive: true
          },
          {
            title: "Hydration Hero",
            description: "Drink 8 glasses of water daily for a week",
            category: "health",
            type: "weekly",
            difficulty: "medium",
            pointReward: 25,
            requirements: { daily_glasses: 8, duration_days: 7 },
            isActive: true
          },
          {
            title: "Mindful Moments",
            description: "Practice 5 minutes of mindfulness daily",
            category: "mindfulness",
            type: "personalized",
            difficulty: "easy",
            pointReward: 15,
            requirements: { daily_minutes: 5, technique: "breathing" },
            isActive: true
          }
        ];

        // Create sample challenges
        const createdChallenges = [];
        for (const challenge of sampleChallenges) {
          const created = await storage.createChallenge(challenge);
          createdChallenges.push(created);
        }

        // Create sample user challenge
        await storage.assignChallengeToUser({
          userId: 'dev-user-123',
          challengeId: createdChallenges[0].id,
          status: 'completed',
          progress: { days_completed: 3, total_days: 3 },
          pointsEarned: 10
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Complete onboarding with comprehensive health profile
  app.post('/api/auth/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const user = await storage.completeOnboarding(userId, profileData);
      res.json(user);
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Daily logs routes
  app.get('/api/daily-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getDailyLogs(userId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching daily logs:", error);
      res.status(500).json({ message: "Failed to fetch daily logs" });
    }
  });

  app.post('/api/daily-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertDailyLogSchema.parse({
        ...req.body,
        userId,
        date: new Date(),
      });
      
      const log = await storage.createDailyLog(validatedData);
      
      // Mock AI analysis for symptom logs
      if (log.logType === 'symptoms') {
        const aiInsight = "Your symptoms appear to be stable. Consider maintaining your current routine and tracking any patterns you notice.";
        res.json({ ...log, aiInsight });
      } else if (log.logType === 'food') {
        const nutritionalAnalysis = {
          calories: Math.floor(Math.random() * 300) + 200,
          protein: Math.floor(Math.random() * 20) + 10,
          critique: "This meal provides good nutritional balance. Consider adding more vegetables for additional vitamins and minerals."
        };
        res.json({ ...log, nutritionalAnalysis });
      } else {
        res.json(log);
      }
    } catch (error) {
      console.error("Error creating daily log:", error);
      res.status(500).json({ message: "Failed to create daily log" });
    }
  });

  // Community posts routes
  app.get('/api/community-posts', async (req, res) => {
    try {
      const category = req.query.category as string;
      const posts = await storage.getCommunityPosts(category);
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });

  app.post('/api/community-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const post = await storage.createCommunityPost(validatedData);
      
      // Mock AI analysis
      const aiAnalysis = "This post discusses valuable health management strategies. The approaches mentioned align with common beneficial practices for symptom management.";
      const updatedPost = await storage.updateCommunityPost(post.id, { aiAnalysis });
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create community post" });
    }
  });

  // AI Companion routes
  app.get('/api/ai-companion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companion = await storage.getAiCompanion(userId);
      res.json(companion);
    } catch (error) {
      console.error("Error fetching AI companion:", error);
      res.status(500).json({ message: "Failed to fetch AI companion" });
    }
  });

  app.post('/api/ai-companion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAiCompanionSchema.parse({
        ...req.body,
        userId,
      });
      
      const companion = await storage.createAiCompanion(validatedData);
      res.json(companion);
    } catch (error) {
      console.error("Error creating AI companion:", error);
      res.status(500).json({ message: "Failed to create AI companion" });
    }
  });

  // Enhanced AI Companion - Conversation History
  app.get('/api/ai-companion/:companionId/conversation', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companionId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      const history = await storage.getConversationHistory(userId, companionId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      res.status(500).json({ message: "Failed to fetch conversation history" });
    }
  });

  app.post('/api/ai-companion/:companionId/message', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companionId } = req.params;
      const { message, context } = req.body;
      
      // Save user message
      const userMessageData = insertConversationHistorySchema.parse({
        userId,
        companionId,
        messageType: 'user',
        content: message,
        context: context || {},
        sentiment: null,
        metadata: { timestamp: new Date().toISOString() }
      });
      
      const userMessage = await storage.saveConversationMessage(userMessageData);
      
      // Get conversation context for AI response
      const conversationContext = await storage.getConversationContext(userId, companionId);
      
      // Get user's complete health profile for personalized responses
      const userProfile = await storage.getUser(userId);
      
      // Generate AI response with comprehensive health profile context
      const aiResponse = await generateAICompanionResponse(message, {
        userId,
        conversationHistory: conversationContext.recentMessages,
        memoryContext: conversationContext.memoryContext,
        conversationStyle: conversationContext.conversationStyle,
        preferences: conversationContext.preferences,
        userContext: userProfile || {}
      });
      
      // Save AI response
      const aiMessageData = insertConversationHistorySchema.parse({
        userId,
        companionId,
        messageType: 'ai',
        content: aiResponse.response || aiResponse,
        context: { 
          responseType: aiResponse.responseType || 'conversational',
          confidence: aiResponse.confidence || 0.8
        },
        sentiment: aiResponse.sentiment || 'neutral',
        metadata: { 
          responseTime: aiResponse.responseTime || 1000,
          tokensUsed: aiResponse.tokensUsed || 150
        }
      });
      
      const aiMessage = await storage.saveConversationMessage(aiMessageData);
      
      res.json({
        userMessage,
        aiMessage,
        response: aiResponse.response || aiResponse
      });
    } catch (error) {
      console.error("Error processing AI companion message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Enhanced AI Companion - Health Insights
  app.get('/api/ai-companion/health-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companionId = req.query.companionId as string;
      
      const insights = await storage.getAiHealthInsights(userId, companionId);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching health insights:", error);
      res.status(500).json({ message: "Failed to fetch health insights" });
    }
  });

  app.post('/api/ai-companion/health-insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAiHealthInsightSchema.parse({
        ...req.body,
        userId,
      });
      
      const insight = await storage.createAiHealthInsight(validatedData);
      res.json(insight);
    } catch (error) {
      console.error("Error creating health insight:", error);
      res.status(500).json({ message: "Failed to create health insight" });
    }
  });

  app.patch('/api/ai-companion/health-insights/:id/dismiss', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const insight = await storage.dismissHealthInsight(id);
      res.json(insight);
    } catch (error) {
      console.error("Error dismissing health insight:", error);
      res.status(500).json({ message: "Failed to dismiss health insight" });
    }
  });

  // AI Companion Personality Update
  app.patch('/api/ai-companion/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const companion = await storage.updateAiCompanion(id, updates);
      res.json(companion);
    } catch (error) {
      console.error("Error updating AI companion:", error);
      res.status(500).json({ message: "Failed to update AI companion" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Symptom wheel routes
  app.get('/api/symptom-wheel-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 30;
      const entries = await storage.getSymptomWheelEntries(userId, limit);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching symptom wheel entries:", error);
      res.status(500).json({ message: "Failed to fetch symptom wheel entries" });
    }
  });

  app.post('/api/symptom-wheel-entries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSymptomWheelEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const entry = await storage.createSymptomWheelEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating symptom wheel entry:", error);
      res.status(500).json({ message: "Failed to create symptom wheel entry" });
    }
  });

  app.get('/api/symptom-wheel-analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getSymptomWheelAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching symptom wheel analytics:", error);
      res.status(500).json({ message: "Failed to fetch symptom wheel analytics" });
    }
  });

  // Symptom pattern routes
  app.get('/api/symptom-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patterns = await storage.getSymptomPatterns(userId);
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching symptom patterns:", error);
      res.status(500).json({ message: "Failed to fetch symptom patterns" });
    }
  });

  app.post('/api/symptom-patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patternData = { ...req.body, userId };
      const pattern = await storage.createSymptomPattern(patternData);
      res.json(pattern);
    } catch (error) {
      console.error("Error creating symptom pattern:", error);
      res.status(500).json({ message: "Failed to create symptom pattern" });
    }
  });

  // Symptom correlation routes
  app.get('/api/symptom-correlations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const correlations = await storage.getSymptomCorrelations(userId);
      res.json(correlations);
    } catch (error) {
      console.error("Error fetching symptom correlations:", error);
      res.status(500).json({ message: "Failed to fetch symptom correlations" });
    }
  });

  app.post('/api/symptom-correlations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const correlationData = { ...req.body, userId };
      const correlation = await storage.createSymptomCorrelation(correlationData);
      res.json(correlation);
    } catch (error) {
      console.error("Error creating symptom correlation:", error);
      res.status(500).json({ message: "Failed to create symptom correlation" });
    }
  });

  // Chat API routes
  app.get('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const rooms = await storage.getChatRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      res.status(500).json({ message: "Failed to fetch chat rooms" });
    }
  });

  app.post('/api/chat/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertChatRoomSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const room = await storage.createChatRoom(validatedData);
      
      // Auto-join the creator to the room
      await storage.joinRoom(room.id, userId);
      
      res.json(room);
    } catch (error) {
      console.error("Error creating chat room:", error);
      res.status(500).json({ message: "Failed to create chat room" });
    }
  });

  app.get('/api/chat/rooms/:roomId', isAuthenticated, async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if user is a member
      const isMember = await storage.isRoomMember(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this room" });
      }
      
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      res.json(room);
    } catch (error) {
      console.error("Error fetching chat room:", error);
      res.status(500).json({ message: "Failed to fetch chat room" });
    }
  });

  app.post('/api/chat/rooms/:roomId/join', isAuthenticated, async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.claims.sub;
      
      // Check if room exists
      const room = await storage.getChatRoom(roomId);
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      
      // Check if already a member
      const isMember = await storage.isRoomMember(roomId, userId);
      if (isMember) {
        return res.status(400).json({ message: "Already a member of this room" });
      }
      
      const member = await storage.joinRoom(roomId, userId);
      res.json(member);
    } catch (error) {
      console.error("Error joining chat room:", error);
      res.status(500).json({ message: "Failed to join chat room" });
    }
  });

  app.get('/api/chat/rooms/:roomId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { roomId } = req.params;
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Check if user is a member
      const isMember = await storage.isRoomMember(roomId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not authorized to access this room" });
      }
      
      const messages = await storage.getChatMessages(roomId, limit);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Gamification Routes
  
  // Challenge routes
  app.get('/api/challenges', async (req, res) => {
    try {
      const { type, active } = req.query;
      const challenges = await storage.getChallenges(
        type as string, 
        active === 'true' ? true : active === 'false' ? false : undefined
      );
      res.json(challenges);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Failed to fetch challenges" });
    }
  });

  app.post('/api/challenges/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type = 'daily' } = req.body;

      // Check if user can create more challenges today
      const canCreate = await storage.canCreateChallenge(userId);
      if (!canCreate) {
        return res.status(429).json({ 
          message: 'Daily challenge creation limit reached. You can create up to 3 challenges per day.',
          error: 'RATE_LIMIT_EXCEEDED'
        });
      }
      
      let challenge;
      
      if (type === 'daily') {
        challenge = await generateDailyChallenge();
      } else if (type === 'personalized') {
        const userProfile = await storage.getUser(userId);
        const userHistory = await storage.getUserChallenges(userId);
        challenge = await generatePersonalizedChallenge(userProfile, userHistory);
      } else if (type === 'weekly') {
        const communityData = await storage.getCommunityPosts();
        challenge = await generateWeeklyChallenge(communityData);
      } else if (type === 'milestone') {
        const userAchievements = await storage.getUserAchievements(userId);
        const userStats = { /* user stats */ };
        challenge = await generateMilestoneChallenge(userAchievements, userStats);
      }
      
      if (challenge) {
        const challengeData = {
          title: challenge.title,
          description: challenge.description,
          category: challenge.category,
          difficulty: challenge.difficulty,
          type,
          pointReward: challenge.points,
          requirements: challenge.requirements || {},
          isActive: true,
          validFrom: new Date(),
          validUntil: type === 'daily' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : 
                      type === 'weekly' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null
        };
        
        const createdChallenge = await storage.createChallenge(challengeData);
        
        // Update rate limit counter
        const today = new Date().toISOString().split('T')[0];
        await storage.updateChallengeCreationLimit(userId, today);
        
        res.json(createdChallenge);
      } else {
        res.status(400).json({ message: "Invalid challenge type" });
      }
    } catch (error) {
      console.error("Error generating challenge:", error);
      res.status(500).json({ message: "Failed to generate challenge" });
    }
  });

  // User challenge routes
  app.get('/api/user-challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.query;
      const userChallenges = await storage.getUserChallenges(userId, status as string);
      res.json(userChallenges);
    } catch (error) {
      console.error("Error fetching user challenges:", error);
      res.status(500).json({ message: "Failed to fetch user challenges" });
    }
  });

  app.post('/api/user-challenges/accept', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId } = req.body;
      
      // Check if user already has 3 active challenges
      const activeChallenges = await storage.getUserChallenges(userId, 'active');
      if (activeChallenges.length >= 3) {
        return res.status(400).json({ 
          message: "You can only have 3 active challenges at a time. Please complete or dismiss some challenges first." 
        });
      }
      
      const userChallenge = {
        userId,
        challengeId,
        status: 'active',
        progress: {},
        pointsEarned: 0
      };
      
      const acceptedChallenge = await storage.assignChallengeToUser(userChallenge);
      res.json(acceptedChallenge);
    } catch (error) {
      console.error("Error accepting challenge:", error);
      res.status(500).json({ message: "Failed to accept challenge" });
    }
  });

  app.patch('/api/user-challenges/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { progress, status } = req.body;
      
      const updatedChallenge = await storage.updateUserChallengeProgress(id, progress, status);
      res.json(updatedChallenge);
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      res.status(500).json({ message: "Failed to update challenge progress" });
    }
  });

  app.patch('/api/user-challenges/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { pointsEarned } = req.body;
      
      const completedChallenge = await storage.completeUserChallenge(id, pointsEarned);
      
      // Update user total points
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserPoints(userId, (user.points || 0) + pointsEarned);
      }
      
      // Update leaderboards
      await storage.updateUserLeaderboard(userId, 'all_time', 'points', (user?.points || 0) + pointsEarned);
      
      res.json(completedChallenge);
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Failed to complete challenge" });
    }
  });

  // Dismiss user challenge
  app.delete('/api/user-challenges/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      
      // Get all user challenges and find the one to dismiss
      const userChallenges = await storage.getUserChallenges(userId);
      const userChallenge = userChallenges.find(uc => uc.id === id);
      
      if (!userChallenge) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      
      // Remove the challenge from user's active list
      await storage.updateUserChallengeProgress(id, {}, 'dismissed');
      
      res.json({ message: "Challenge dismissed successfully" });
    } catch (error) {
      console.error("Error dismissing challenge:", error);
      res.status(500).json({ message: "Failed to dismiss challenge" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', async (req, res) => {
    try {
      const { category } = req.query;
      const achievements = await storage.getAchievements(category as string);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/user-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  app.post('/api/user-achievements/unlock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { achievementId } = req.body;
      
      const unlockedAchievement = await storage.unlockAchievement(userId, achievementId);
      
      // Update user points
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUserPoints(userId, (user.points || 0) + unlockedAchievement.pointsEarned);
      }
      
      res.json(unlockedAchievement);
    } catch (error) {
      console.error("Error unlocking achievement:", error);
      res.status(500).json({ message: "Failed to unlock achievement" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { period = 'all_time', category = 'points', limit = 10 } = req.query;
      const leaderboard = await storage.getLeaderboard(
        period as string, 
        category as string, 
        parseInt(limit as string)
      );
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.get('/api/user-rank', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { period = 'all_time', category = 'points' } = req.query;
      const rank = await storage.getUserRank(userId, period as string, category as string);
      res.json({ rank });
    } catch (error) {
      console.error("Error fetching user rank:", error);
      res.status(500).json({ message: "Failed to fetch user rank" });
    }
  });

  // Recommendation Engine Routes
  
  // Get personalized challenge recommendations
  app.get('/api/recommendations/challenges', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type, count = 3 } = req.query;
      
      const recommendations = await recommendationEngine.generateRecommendations(
        userId, 
        type as string, 
        parseInt(count as string)
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Submit user feedback for recommendations
  app.post('/api/recommendations/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId, feedback } = req.body;
      
      await recommendationEngine.updateUserFeedback(userId, challengeId, feedback);
      
      res.json({ message: "Feedback recorded successfully" });
    } catch (error) {
      console.error("Error recording feedback:", error);
      res.status(500).json({ message: "Failed to record feedback" });
    }
  });

  // Get user health profile analytics
  app.get('/api/recommendations/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Generate recommendations to get the profile data
      const recommendations = await recommendationEngine.generateRecommendations(userId, undefined, 1);
      
      // Extract profile insights from the first recommendation
      const profile = recommendations.length > 0 ? {
        completionRate: Math.random() * 100, // This would come from actual profile analysis
        engagementScore: Math.random() * 100,
        currentLevel: Math.floor(Math.random() * 10) + 1,
        preferredCategories: ['health', 'nutrition', 'mindfulness'],
        streakCount: Math.floor(Math.random() * 30),
        adaptedDifficulty: recommendations[0].adaptedDifficulty
      } : null;
      
      res.json(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Points System Routes
  
  // Award points for specific activity
  app.post('/api/points/award', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { activityType, description, metadata } = req.body;
      
      const pointsEarned = await pointsSystem.awardPoints(userId, activityType, description, metadata);
      
      res.json({ 
        pointsEarned,
        message: `Earned ${pointsEarned} points for ${activityType}` 
      });
    } catch (error) {
      console.error("Error awarding points:", error);
      res.status(500).json({ message: "Failed to award points" });
    }
  });

  // Get user points summary
  app.get('/api/points/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summary = await pointsSystem.getUserPointsSummary(userId);
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching points summary:", error);
      res.status(500).json({ message: "Failed to fetch points summary" });
    }
  });

  // Get recent point activities
  app.get('/api/points/activities', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const activities = await storage.getRecentPointActivities(userId, limit);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching point activities:", error);
      res.status(500).json({ message: "Failed to fetch point activities" });
    }
  });

  // Weather and Activity Routes
  
  // Get personalized activity recommendations
  app.get('/api/activities/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await weatherService.getPersonalizedActivities(userId);
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error getting activity recommendations:", error);
      res.status(500).json({ message: "Failed to get activity recommendations" });
    }
  });

  // Get current weather for user's location
  app.get('/api/weather/current', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.location) {
        return res.status(400).json({ message: "User location not set" });
      }

      const weather = await weatherService.getCurrentWeather(user.location);
      
      if (!weather) {
        return res.status(503).json({ message: "Weather service unavailable" });
      }

      res.json(weather);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // Check if user has a day off
  app.get('/api/schedule/work-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const isWorkDay = await weatherService.isWorkDay(userId);
      
      const now = new Date();
      const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });

      res.json({
        isWorkDay,
        currentDay: dayName,
        currentTime: timeString,
        message: isWorkDay 
          ? `It's ${dayName} - hope you're having a good work day!`
          : `It's ${dayName} - a perfect day to focus on your health and well-being!`
      });
    } catch (error) {
      console.error("Error checking work status:", error);
      res.status(500).json({ message: "Failed to check work status" });
    }
  });

  // Badge Routes
  
  // Get user badges
  app.get('/api/badges/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      
      res.json(badges);
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  // Get available badges to work toward
  app.get('/api/badges/available', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availableBadges = await pointsSystem.getAvailableBadges(userId);
      
      res.json(availableBadges);
    } catch (error) {
      console.error("Error fetching available badges:", error);
      res.status(500).json({ message: "Failed to fetch available badges" });
    }
  });

  // Enhanced gamification dashboard with points system
  app.get('/api/gamification/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const [
        user,
        pointsSummary,
        activeChallenges,
        recentAchievements,
        userRank,
        availableChallenges,
        recommendations
      ] = await Promise.all([
        storage.getUser(userId),
        pointsSystem.getUserPointsSummary(userId),
        storage.getUserChallenges(userId, 'active'),
        storage.getUserAchievements(userId),
        storage.getUserRank(userId, 'all_time', 'points'),
        storage.getChallenges(undefined, true),
        recommendationEngine.generateRecommendations(userId, undefined, 3)
      ]);

      res.json({
        user: {
          points: user?.points || 0,
          totalPoints: user?.totalPoints || 0,
          currentTier: user?.currentTier || 'Newcomer',
          pointsToNextTier: user?.nextTierPoints || 100,
          streakDays: user?.streakDays || 0,
          rank: userRank,
          totalChallenges: activeChallenges.length,
          totalAchievements: recentAchievements.length
        },
        pointsSummary,
        activeChallenges: activeChallenges.slice(0, 5),
        recentAchievements: recentAchievements.slice(0, 3),
        availableChallenges: availableChallenges.slice(0, 5),
        recommendations: recommendations
      });
    } catch (error) {
      console.error("Error fetching gamification dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Luna Generation Routes
  
  // Generate Luna personality and image
  app.post('/api/luna/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { personality } = req.body;
      
      const generatedLuna = await generateLunaPersonality(personality);
      
      // Award points for creating Luna
      await pointsSystem.awardPoints(userId, 'AI_COMPANION_CREATE', 'Created personalized Luna companion');
      
      res.json(generatedLuna);
    } catch (error) {
      console.error("Error generating Luna:", error);
      res.status(500).json({ message: "Failed to generate Luna companion" });
    }
  });

  // Preview Luna with partial choices
  app.post('/api/luna/preview', async (req, res) => {
    try {
      const { personality } = req.body;
      
      // Generate just the image preview for quick feedback
      const imageUrl = await generateLunaImage(personality);
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating Luna preview:", error);
      res.status(500).json({ message: "Failed to generate Luna preview" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server
  const chatWS = new SimpleChatServer(httpServer);
  console.log('Simple Chat WebSocket server initialized');
  
  return httpServer;
}
