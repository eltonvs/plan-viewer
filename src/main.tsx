import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FolderProvider } from "@/context/folder-context";
import { router } from "./routes";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FolderProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </FolderProvider>
    </QueryClientProvider>
  </StrictMode>,
);
