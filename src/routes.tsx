import { createRouter, createRoute, createRootRoute, HeadContent } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/plan-viewer/empty-state";
import { PlanViewer } from "@/components/plan-viewer/plan-viewer";
import { fetchPlan } from "@/lib/api";
import { extractTitleFromContent } from "@/lib/frontmatter";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <HeadContent />
      <AppShell />
    </>
  ),
  head: () => ({
    meta: [{ title: "Plan Viewer" }],
  }),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: EmptyState,
});

const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plan/$sourceId/$",
  loader: async ({ params }) => {
    if (import.meta.env.DEV && params.sourceId === "api" && params._splat) {
      try {
        const plan = await fetchPlan(params._splat);
        return { title: plan.title };
      } catch {
        return { title: extractTitleFromContent("", params._splat) };
      }
    }
    return { title: params._splat?.replace(/\.md$/, "").replace(/-/g, " ") ?? "Plan" };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.title} — Plan Viewer` : "Plan Viewer" }],
  }),
  component: () => {
    const { sourceId, _splat: relativePath } = planRoute.useParams();
    return <PlanViewer sourceId={sourceId} relativePath={relativePath ?? ""} />;
  },
});

const routeTree = rootRoute.addChildren([indexRoute, planRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
