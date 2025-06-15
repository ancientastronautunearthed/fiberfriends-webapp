import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API endpoints immediately to prevent Vite interception
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

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("Firebase App Hosting mode: Full-stack application");
  console.log("API routes enabled for Firebase App Hosting backend");
  
  // Create server first
  const server = createServer(app);

  // Import and register Firebase App Hosting routes BEFORE Vite setup
  const { registerRoutes } = await import("./firebaseRoutes");
  await registerRoutes(app);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
