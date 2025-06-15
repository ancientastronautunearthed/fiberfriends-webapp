import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNutritionalAnalysis, generateSymptomInsight, generateAICompanionResponse } from "./genkit";
import { generateLunaPersonality, generateLunaImage, type LunaPersonality } from "./lunaGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Firebase App Hosting backend is running' });
  });

  // AI endpoints that can work server-side
  app.post('/api/ai/nutritional-analysis', async (req, res) => {
    try {
      const { foodDescription, mealType } = req.body;
      
      if (!foodDescription) {
        return res.status(400).json({ error: 'Food description is required' });
      }

      const analysis = await generateNutritionalAnalysis(foodDescription, mealType || 'general');
      res.json(analysis);
    } catch (error) {
      console.error('Nutritional analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze nutrition' });
    }
  });

  app.post('/api/ai/symptom-insight', async (req, res) => {
    try {
      const { symptomData } = req.body;
      
      if (!symptomData) {
        return res.status(400).json({ error: 'Symptom data is required' });
      }

      const insight = await generateSymptomInsight(symptomData);
      res.json(insight);
    } catch (error) {
      console.error('Symptom insight error:', error);
      res.status(500).json({ error: 'Failed to generate insight' });
    }
  });

  app.post('/api/ai/companion-response', async (req, res) => {
    try {
      const { message, context } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const response = await generateAICompanionResponse(message, context || {});
      res.json(response);
    } catch (error) {
      console.error('AI companion error:', error);
      res.status(500).json({ error: 'Failed to generate response' });
    }
  });

  app.post('/api/luna/generate-personality', async (req, res) => {
    try {
      const { choices } = req.body;
      
      if (!choices) {
        return res.status(400).json({ error: 'Personality choices are required' });
      }

      const luna = await generateLunaPersonality(choices as LunaPersonality);
      res.json(luna);
    } catch (error) {
      console.error('Luna generation error:', error);
      res.status(500).json({ error: 'Failed to generate Luna personality' });
    }
  });

  app.post('/api/luna/generate-image', async (req, res) => {
    try {
      const { personality } = req.body;
      
      if (!personality) {
        return res.status(400).json({ error: 'Personality data is required' });
      }

      const imageUrl = await generateLunaImage(personality as LunaPersonality);
      res.json({ imageUrl });
    } catch (error) {
      console.error('Luna image generation error:', error);
      res.status(500).json({ error: 'Failed to generate Luna image' });
    }
  });

  // Error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('API Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  const httpServer = createServer(app);
  return httpServer;
}