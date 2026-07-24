import react from "@vitejs/plugin-react";
import * as path from "node:path";
import { defineConfig } from "vitest/config";

// Standalone config, intentionally separate from vite.config.ts: it omits the
// TanStack Router plugin (which regenerates routeTree.gen.ts) and the Node globals
// polyfill, keeping the test run focused on the React plugin + the `@/` alias.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
