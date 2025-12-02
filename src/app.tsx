/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "@/routeTree.gen";
import "@/index.css";
import ProviderCollection from "@components/technical/Providers/ProviderCollection.tsx";
import "@/i18n/i18n";

const router = createRouter({ routeTree });

// biome-ignore lint: default template stuff
const elem = document.getElementById("root")!;
const app = (
  <StrictMode>
    <ProviderCollection>
      <RouterProvider router={router} />
    </ProviderCollection>
  </StrictMode>
);

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  // biome-ignore lint: default template stuff
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
