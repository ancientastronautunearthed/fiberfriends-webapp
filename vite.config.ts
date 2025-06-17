import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// This is a corrected configuration that removes the top-level await
// which was causing the build to fail in a CommonJS environment.
export default defineConfig({
  plugins: [
    react(),
    // The runtimeErrorOverlay is fine to keep.
  
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
