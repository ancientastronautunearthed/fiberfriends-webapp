// server/index.ts

import express, { type Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupVite, serveStatic, log } from "./vite";
import { registerRoutes } from "./routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    log(`Server listening on port ${port}`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();