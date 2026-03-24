import { createRouter, createRoute, createRootRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/plan-viewer/empty-state";
import { PlanViewer } from "@/components/plan-viewer/plan-viewer";

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EmptyState,
});

const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plan/$filename",
  component: () => {
    const { filename } = planRoute.useParams();
    return <PlanViewer filename={filename} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, planRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
