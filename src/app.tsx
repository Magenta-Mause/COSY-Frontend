import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./scrollbar.css";
import ProviderCollection from "@/components/technical/Providers/ProviderCollection.tsx";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "@/routeTree.gen";
import "@/i18n/i18n.ts";

const router = createRouter({ routeTree });

// biome-ignore lint: need assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProviderCollection>
      <RouterProvider router={router} />
    </ProviderCollection>
  </StrictMode>,
);
