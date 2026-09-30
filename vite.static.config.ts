// Static SPA build only — produces a plain dist/ folder (index.html + assets)
// that can be uploaded to Apache / FileZilla. The Lovable preview and publish
// pipeline keeps using vite.config.ts.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

export default defineConfig({
  base: "./",
  plugins: [
    tsConfigPaths(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
