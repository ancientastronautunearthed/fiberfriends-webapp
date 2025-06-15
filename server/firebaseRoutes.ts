import type { Express } from "express";
import { createServer, type Server } from "http";
import { generateNutritionalAnalysis, generateSymptomInsight, generateAICompanionResponse } from "./genkit";
import { generateLunaPersonality, generateLunaImage, type LunaPersonality } from "./lunaGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Firebase App Hosting backend is running' });
  });

  // Dashboard stats endpoint
  app.get('/api/dashboard-stats', async (req: any, res) => {
    try {
      const demoStats = {
        totalLogs: 14,
        streak: 7,
        recentLogs: [
          { id: 1, date: '2024-01-15', mood: 8, energy: 7, pain: 3 },
          { id: 2, date: '2024-01-14', mood: 7, energy: 6, pain: 4 },
          { id: 3, date: '2024-01-13', mood: 9, energy: 8, pain: 2 },
          { id: 4, date: '2024-01-12', mood: 6, energy: 5, pain: 5 },
          { id: 5, date: '2024-01-11', mood: 8, energy: 7, pain: 3 }
        ],
        activeChallenges: [
          { id: 1, title: "Daily Symptom Tracking", progress: 70, category: "health" },
          { id: 2, title: "Mindful Moments", progress: 45, category: "mindfulness" },
          { id: 3, title: "Anti-Inflammatory Diet", progress: 85, category: "nutrition" }
        ],
        totalActiveChallenges: 3,
        totalCompletedChallenges: 8,
        totalAchievements: 12
      };
      res.json(demoStats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Daily logs endpoint
  app.get('/api/daily-logs', async (req: any, res) => {
    try {
      const demoLogs = [
        {
          id: 1,
          date: '2024-01-15',
          symptoms: ['Skin crawling sensations', 'Fatigue', 'Joint pain'],
          mood: 8,
          energy: 7,
          pain: 3,
          sleep: 8,
          notes: 'Feeling better today after trying the anti-inflammatory diet suggestions.',
          timestamp: '2024-01-15T08:30:00Z'
        },
        {
          id: 2,
          date: '2024-01-14',
          symptoms: ['Fiber-like material on skin', 'Brain fog', 'Itching'],
          mood: 7,
          energy: 6,
          pain: 4,
          sleep: 6,
          notes: 'Documented new fiber samples under microscope. Stress levels moderate.',
          timestamp: '2024-01-14T09:15:00Z'
        },
        {
          id: 3,
          date: '2024-01-13',
          symptoms: ['Burning sensations', 'Skin lesions'],
          mood: 9,
          energy: 8,
          pain: 2,
          sleep: 9,
          notes: 'Great day! New skincare routine seems to be helping significantly.',
          timestamp: '2024-01-13T07:45:00Z'
        }
      ];
      res.json(demoLogs);
    } catch (error) {
      console.error("Error fetching daily logs:", error);
      res.status(500).json({ message: "Failed to fetch daily logs" });
    }
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

  // Weather API endpoints
  app.get('/api/weather/location', async (req, res) => {
    try {
      const { location } = req.query;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({ error: 'Location parameter is required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Weather service unavailable - API key not configured' });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Weather service error' });
      }

      const data = await response.json();

      const weatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        barometricPressure: data.main.pressure ? data.main.pressure * 0.02953 : undefined, // Convert hPa to inHg
        weatherCondition: data.weather[0].main.toLowerCase(),
        windSpeed: data.wind?.speed || 0,
        uvIndex: data.uvi,
        airQuality: undefined, // Would need separate API call
        location: data.name,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? data.visibility / 1609.34 : undefined, // Convert meters to miles
        timestamp: new Date()
      };

      res.json(weatherData);
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  app.get('/api/weather/coords', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      
      if (!lat || !lon || typeof lat !== 'string' || typeof lon !== 'string') {
        return res.status(400).json({ error: 'Latitude and longitude parameters are required' });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        return res.status(503).json({ error: 'Weather service unavailable - API key not configured' });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
      );

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Weather service error' });
      }

      const data = await response.json();

      const weatherData = {
        temperature: Math.round(data.main.temp),
        humidity: data.main.humidity,
        barometricPressure: data.main.pressure ? data.main.pressure * 0.02953 : undefined,
        weatherCondition: data.weather[0].main.toLowerCase(),
        windSpeed: data.wind?.speed || 0,
        uvIndex: data.uvi,
        airQuality: undefined,
        location: data.name,
        feelsLike: Math.round(data.main.feels_like),
        visibility: data.visibility ? data.visibility / 1609.34 : undefined,
        timestamp: new Date()
      };

      res.json(weatherData);
    } catch (error) {
      console.error('Weather coords API error:', error);
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  });

  // Environmental correlation analysis
  app.post('/api/ai/environmental-correlations', async (req, res) => {
    try {
      const { userId, entries } = req.body;
      
      if (!userId || !entries || !Array.isArray(entries)) {
        return res.status(400).json({ error: 'User ID and entries array are required' });
      }

      if (entries.length < 5) {
        return res.status(400).json({ error: 'Minimum 5 entries required for correlation analysis' });
      }

      // Analyze patterns using Gemini AI
      const analysisPrompt = `
        Analyze the following environmental and symptom data for patterns and correlations:
        
        ${entries.map((entry, index) => `
        Entry ${index + 1}:
        - Date: ${new Date(entry.recordedAt).toDateString()}
        - Weather: ${entry.temperature}°F, ${entry.humidity}% humidity, ${entry.weatherCondition}
        - Barometric Pressure: ${entry.barometricPressure || 'N/A'} inHg
        - Wind Speed: ${entry.windSpeed} mph
        - Stress Level: ${entry.stressLevel}/10
        - Sleep Quality: ${entry.sleepQuality}/10, ${entry.sleepHours} hours
        - Symptom Severity: ${entry.symptomSeverity}/10
        - Primary Symptoms: ${entry.primarySymptoms.join(', ') || 'None'}
        - Environmental Exposures: ${entry.exposureFactors.join(', ') || 'None'}
        - Mood: ${entry.moodRating}/10
        - Energy: ${entry.energyLevel}/10
        `).join('\n')}

        Identify correlations between environmental factors and symptom severity. Look for patterns in:
        1. Weather conditions (temperature, humidity, pressure, wind)
        2. Sleep quality and duration
        3. Stress levels
        4. Environmental exposures
        5. Seasonal or temporal patterns

        For each significant correlation found, provide:
        - Trigger type and specific value/condition
        - Correlation strength (0-1 scale)
        - Confidence level (0-1 scale)
        - Pattern description
        - Practical recommendations
        - Timeframe (daily/weekly/seasonal)
        - Average symptom impact percentage

        Return ONLY a JSON array of correlations. Each correlation should have this exact structure:
        {
          "triggerType": "weather/stress/sleep/exposure",
          "triggerValue": "specific condition or range",
          "correlationStrength": 0.0-1.0,
          "confidenceLevel": 0.0-1.0,
          "patternDescription": "clear description of the pattern",
          "recommendations": ["actionable suggestion 1", "actionable suggestion 2"],
          "timeframe": "daily/weekly/seasonal",
          "occurrenceCount": number,
          "averageSymptomIncrease": percentage
        }
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + process.env.GEMINI_API_KEY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: analysisPrompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      
      // Parse JSON response
      const correlations = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, ''));
      
      // Add IDs and timestamps
      const enrichedCorrelations = correlations.map((correlation: any) => ({
        ...correlation,
        id: `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        generatedAt: new Date(),
        lastUpdated: new Date(),
        isActive: true,
        dataPointsAnalyzed: entries.length
      }));

      res.json(enrichedCorrelations);
    } catch (error) {
      console.error('Environmental correlation analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze environmental correlations' });
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