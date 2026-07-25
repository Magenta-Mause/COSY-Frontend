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
  // sockjs-client (via react-stomp-hooks) references the Node `global` identifier, which does
  // not exist in browsers. This must be a top-level `define` so it applies to the production
  // build: the `optimizeDeps.esbuildOptions.define` below only covers dev pre-bundling, which
  // is why the built app threw "global is not defined" while dev worked fine.
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      // NOTE: there used to be a `global: "global"` alias here. It aliased to an npm package
      // that is not a dependency of this project, so it never resolved anything; the `define`
      // above is what actually provides `global`.
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
