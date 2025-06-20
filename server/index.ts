import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic, log } from "./vite.firebase";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint for Cloud Run
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Middleware to log API requests
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`);
    }
  });
  next();
});

async function startServer() {
  log("Starting Fiber Friends server for Firebase App Hosting...");
  const server = createServer(app);

  try {
    // Register all API and WebSocket routes
    await registerRoutes(app, server);

    // FORCE DEVELOPMENT MODE - change this when deploying to production
    const isDevelopment = true; // process.env.NODE_ENV?.trim() !== 'production';
    const nodeEnv = isDevelopment ? 'development' : 'production';
    log(`Running in ${nodeEnv} mode`);

    if (isDevelopment) {
      // Development-only setup
      log("Setting up Vite middleware for development...");
      await setupVite(app, server);
    } else {
      // Production setup for Firebase App Hosting
      log("Serving static files for production...");
      serveStatic(app);
    }

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // Use PORT from environment variable (Firebase App Hosting sets this automatically)
    const port = parseInt(process.env.PORT || "8080", 10);
    const host = "0.0.0.0";

    server.listen(port, host, () => {
      log(`Server running on ${host}:${port}`);
      log(`Environment: ${nodeEnv}`);
      log(`Firebase Project: ${process.env.FIREBASE_PROJECT_ID || 'fiber-friends'}`);
    });

  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer().catch((error) => {
  log(`Server startup error: ${error}`);
  process.exit(1);
});