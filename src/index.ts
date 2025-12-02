import { API_TARGET } from "@config";
import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    // proxy api requests to API_TARGET
    "/api/*": async (req) => {
      const url = new URL(req.url);
      const target = API_TARGET + url.pathname + url.search;

      const backendRes = await fetch(target, {
        method: req.method,
        headers: req.headers,
        body: req.method === "GET" || req.method === "HEAD" ? undefined : req.body,
        redirect: "manual",
      });

      return new Response(backendRes.body, {
        status: backendRes.status,
        headers: backendRes.headers,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
console.log(`🔀 Proxying API requests to ${API_TARGET}`);
