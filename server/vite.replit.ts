import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";
import { fileURLToPath } from 'url';

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const viteConfig = {
  plugins: [
    {
      name: "@vitejs/plugin-react",
      ...((await import("@vitejs/plugin-react")).default())
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "..", "client", "src"),
      "@shared": path.resolve(__dirname, "..", "shared"),
      "@assets": path.resolve(__dirname, "..", "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "..", "client"),
  build: {
    outDir: path.resolve(__dirname, "..", "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
};

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Use process.cwd() for reliable path resolution
      const clientTemplate = path.resolve(
        process.cwd(),
        "client",
        "index.html"
      );

      if (!fs.existsSync(clientTemplate)) {
        log(`Template not found: ${clientTemplate}`, "vite");
        return next();
      }

      let template = fs.readFileSync(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);

      const nonce = nanoid();
      template = template.replace(
        /(<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>)/gi,
        `$1`.replace(/(<script\b)/, `$1 nonce="${nonce}"`)
      );

      res.status(200).set({ 
        "Content-Type": "text/html",
        "Content-Security-Policy": `script-src 'nonce-${nonce}' 'unsafe-eval';`
      }).end(template);
    } catch (e) {
      if (e instanceof Error) {
        vite.ssrFixStacktrace(e);
        log(`Error transforming HTML: ${e.message}`, "vite");
        res.status(500).end(e.message);
      }
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist/public");
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    
    app.get("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Not Found");
      }
    });
  } else {
    log("Built files not found. Please run 'npm run build' first.", "static");
  }
}