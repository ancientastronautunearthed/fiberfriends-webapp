// server/index.ts

import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic, log } from "./vite";
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
  log("Starting Fiber Friends server...");
  const server = createServer(app);

  try {
    // Register all API and WebSocket routes
    await registerRoutes(app, server);

    if (process.env.NODE_ENV === "development") {
      // Development-only setup
      await setupVite(app, server);
    } else {
      // Production-only setup
      serveStatic(app);
    }

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // Use PORT from environment variable (default to 5000 for development)
    const port = parseInt(process.env.PORT || "5000", 10);
    const host = process.env.HOST || "0.0.0.0";

    server.listen(port, host, () => {
      log(`Server listening on ${host}:${port}`);
      log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      log(`Health check available at http://${host}:${port}/health`);
    });

    // Graceful shutdown handling
    const shutdown = () => {
      log("Shutting down server...");
      server.close(() => {
        log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    log(`Failed to start server: ${error}`);
    process.exit(1);
  }
}

startServer().catch((error) => {
  log(`Fatal error: ${error}`);
  process.exit(1);
});