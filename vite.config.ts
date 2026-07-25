import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from '@tanstack/router-plugin/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [tanstackRouter({
    target: 'react',
    autoCodeSplitting: true,
  }), react(
    {
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      }
    }
  ), tailwindcss(),
  ],
  resolve: {
    alias: {
      // Polyfill for global
      global: "global",
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      // Enable Node.js global polyfill
      define: {
        global: "globalThis",
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
        }),
      ],
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },
    },
  },
});
