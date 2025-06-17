import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupFirebaseAuth, isAuthenticated } from "./firebaseAuth";
import { SimpleChatServer } from "./simpleWebSocket";
import { InsertDailyLog, InsertCommunityPost, InsertAiCompanion, InsertChatRoom, InsertChallenge, InsertUserChallenge, InsertSymptomWheelEntry, InsertConversationHistory, InsertAiHealthInsight } from "@shared/schema";
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

export async function registerRoutes(app: Express, server: Server): Promise<void> {
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
          displayName: 'Dev User',
          photoURL: undefined,
          onboardingCompleted: false,
          totalPoints: 150,
          currentStreak: 0,
          tier: 'bronze',
        });
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.put('/api/profile/complete-onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.completeOnboarding(userId, req.body);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ error: "Failed to complete onboarding" });
    }
  });

  app.put('/api/profile/update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Daily Log routes
  app.post('/api/daily-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logData = insertDailyLogSchema.parse({
        ...req.body,
        userId,
      });
      
      const log = await storage.createDailyLog(logData);
      
      // Award points for logging
      const logType = logData.logType === 'food' ? 'FOOD_LOG_ENTRY' : 'SYMPTOM_LOG_ENTRY';
      await pointsSystem.awardPoints(userId, logType);
      
      // Generate AI insight if symptom log
      if (logData.logType === 'symptoms') {
        await generateSymptomInsight(logData.data);
      }
      
      res.json({ log });
    } catch (error) {
      console.error("Error creating daily log:", error);
      res.status(500).json({ error: "Failed to create daily log" });
    }
  });

  app.get('/api/daily-logs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const logs = await storage.getDailyLogs(userId);
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching daily logs:", error);
      res.status(500).json({ error: "Failed to fetch daily logs" });
    }
  });

  // Community Post routes
  app.post('/api/community-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = insertCommunityPostSchema.parse({
        ...req.body,
        authorId: userId,
      });
      
      const post = await storage.createCommunityPost(postData);
      
      // Generate AI analysis
      const aiAnalysis = await generateCommunityPostAnalysis(postData.content, postData.category);
      await storage.updateCommunityPost(post.id, { aiAnalysis });
      
      // Award points
      await pointsSystem.awardPoints(userId, 'COMMUNITY_POST_CREATE');
      
      res.json({ post: { ...post, aiAnalysis } });
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ error: "Failed to create community post" });
    }
  });

  app.get('/api/community-posts', async (req, res) => {
    try {
      const { category } = req.query;
      const posts = await storage.getCommunityPosts(category as string);
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ error: "Failed to fetch community posts" });
    }
  });

  // AI Companion routes
  app.post('/api/companion/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companionData = insertAiCompanionSchema.parse({
        ...req.body,
        userId,
      });
      
      const companion = await storage.createAiCompanion(companionData);
      res.json({ companion });
    } catch (error) {
      console.error("Error creating AI companion:", error);
      res.status(500).json({ error: "Failed to create AI companion" });
    }
  });

  app.get('/api/companion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companion = await storage.getAiCompanion(userId);
      res.json({ companion });
    } catch (error) {
      console.error("Error fetching AI companion:", error);
      res.status(500).json({ error: "Failed to fetch AI companion" });
    }
  });

  app.post('/api/companion/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, companionId } = req.body;
      
      const companion = await storage.getAiCompanion(userId);
      if (!companion) {
        return res.status(404).json({ error: "No AI companion found" });
      }
      
      const response = await generateAICompanionResponse(message, companion);
      
      // Save conversation history
      await storage.createConversationHistory({
        userId,
        content: message,
        companionId: companion.id,
        messageType: "user",
        context: {},
        // Optionally add other fields like sentiment or metadata if needed
      });
      
      // Award points for interaction
      await pointsSystem.awardPoints(userId, 'AI_CONVERSATION_MESSAGE');
      
      res.json({ response });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).json({ error: "Failed to generate AI response" });
    }
  });

  // Symptom Wheel routes
  app.post('/api/symptom-wheel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryData = insertSymptomWheelEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const entry = await storage.createSymptomWheelEntry(entryData);
      
      // Award points
      await pointsSystem.awardPoints(userId, 'SYMPTOM_WHEEL_ENTRY');
      
      res.json({ entry });
    } catch (error) {
      console.error("Error creating symptom wheel entry:", error);
      res.status(500).json({ error: "Failed to create symptom wheel entry" });
    }
  });

  app.get('/api/symptom-wheel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entries = await storage.getSymptomWheelEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching symptom wheel entries:", error);
      res.status(500).json({ error: "Failed to fetch symptom wheel entries" });
    }
  });

  // Pattern detection routes
  app.get('/api/patterns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patterns = await storage.getSymptomPatterns(userId);
      res.json({ patterns });
    } catch (error) {
      console.error("Error fetching patterns:", error);
      res.status(500).json({ error: "Failed to fetch patterns" });
    }
  });

  app.get('/api/correlations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const correlations = await storage.getSymptomCorrelations(userId);
      res.json({ correlations });
    } catch (error) {
      console.error("Error fetching correlations:", error);
      res.status(500).json({ error: "Failed to fetch correlations" });
    }
  });

  // Insights routes
  app.get('/api/insights', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const insights = await storage.getAiHealthInsights(userId);
      res.json({ insights });
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ error: "Failed to fetch insights" });
    }
  });

  // Challenge routes
  app.get('/api/challenges/active', async (req, res) => {
    try {
      const challenge = await storage.getActiveChallenge();
      res.json({ challenge });
    } catch (error) {
      console.error("Error fetching active challenge:", error);
      res.status(500).json({ error: "Failed to fetch active challenge" });
    }
  });

  app.post('/api/challenges/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId } = req.body;
      
      const userChallenge = await storage.createUserChallenge({
        userId,
        challengeId,
        status: 'active',
        progress: 0,
      });
      
      res.json({ userChallenge });
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ error: "Failed to join challenge" });
    }
  });

  app.post('/api/challenges/update-progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { challengeId, progress } = req.body;
      
      const userChallenge = await storage.getUserChallenge(userId, challengeId);
      if (!userChallenge) {
        return res.status(404).json({ error: "Challenge not found" });
      }
      
      const updated = await storage.updateUserChallenge(userChallenge.id, {
        progress,
        completedAt: progress >= 100 ? new Date() : null,
      });
      
      if (progress >= 100) {
        await pointsSystem.awardPoints(userId, 'CHALLENGE_COMPLETE');
      }
      
      res.json({ userChallenge: updated });
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      res.status(500).json({ error: "Failed to update challenge progress" });
    }
  });

  // Points and gamification routes
  app.get('/api/points/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const summary = await pointsSystem.getUserPointsSummary(userId);
      res.json({ summary });
    } catch (error) {
      console.error("Error fetching points summary:", error);
      res.status(500).json({ error: "Failed to fetch points summary" });
    }
  });

  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      const allAchievements = await storage.getAchievements();
      
      res.json({ 
        userAchievements,
        allAchievements,
      });
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get('/api/leaderboard', async (req, res) => {
    try {
      const { period = 'weekly' } = req.query;
      const leaderboard = await storage.getLeaderboard(period as string);
      res.json({ leaderboard });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Recommendations routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await recommendationEngine.generateRecommendations(userId);
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Weather service routes
  app.get('/api/weather/current', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ error: "Latitude and longitude required" });
      }
      
      const location = `${lat},${lon}`;
      const weather = await weatherService.getCurrentWeather(location);
      res.json({ weather });
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Luna personality generation routes
  app.post('/api/luna/generate-personality', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { choices } = req.body;
      
      const personality = await generateLunaPersonality(choices);
      res.json({ personality });
    } catch (error) {
      console.error("Error generating Luna personality:", error);
      res.status(500).json({ error: "Failed to generate Luna personality" });
    }
  });

  app.post('/api/luna/generate-image', isAuthenticated, async (req: any, res) => {
    try {
      const { personality } = req.body;
      const imageUrl = await generateLunaImage(personality as LunaPersonality);
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating Luna image:", error);
      res.status(500).json({ error: "Failed to generate Luna image" });
    }
  });

  // Set up WebSocket for chat
  const chatServer = new SimpleChatServer(server);
}