import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  build: {
    outDir: "public/build/react",
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: "src/main.jsx",
    },
  },
});
