import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertDailyLogSchema, insertCommunityPostSchema, insertAiCompanionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
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

  const httpServer = createServer(app);
  return httpServer;
}
