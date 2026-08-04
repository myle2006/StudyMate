import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_BACKEND_ORIGIN || "http://127.0.0.1",
        changeOrigin: true,
        rewrite: (path) => `${process.env.VITE_BACKEND_BASE_PATH || "/StudyMate"}${path}`,
      },
    },
  },
  build: {
    outDir: "public/build/react",
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: "src/main.jsx",
    },
  },
});
