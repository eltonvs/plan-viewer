# Multi-Folder Explorer with Recursive Subdirectory Support

## Context

The plan viewer currently supports a single folder source at a time — either the API backend (`~/.claude/plans`) or one browser-selected folder. Users want to open multiple folders simultaneously and browse nested subdirectories within them, treating the sidebar as a multi-source file explorer. Only `.md` files matter.

## Design Decisions

- **Accordion sections** (not a recursive tree): Each root folder is a collapsible accordion. Files inside are listed flat with their relative path (e.g. `archived/old-plan.md`). Simpler than a full tree, still shows hierarchy.
- **API source as a folder node**: When the backend API is available, it appears as an accordion section alongside browser folders — same visual treatment.
- **Per-folder implemented split**: Each accordion has its own active/implemented divider (matching current behavior, but scoped per folder).
- **Splat routing**: Route changes from `/plan/$filename` to `/plan/$sourceId/$` to uniquely identify plans across folders and subdirectories.
- **Keep both modes**: API mode and browser folder mode coexist.

## Data Model

### Types (`src/types/plan.ts`)

```ts
interface FolderSource {
  id: string; // unique identifier
  label: string; // display name (e.g. "plans", "my-project")
  handle?: FileSystemDirectoryHandle; // absent = API source
}

interface PlanMeta {
  filename: string; // leaf filename ("my-plan.md")
  relativePath: string; // path within source ("subfolder/my-plan.md")
  filePath: string; // full key for completion tracking ("sourceId/relativePath")
  sourceId: string; // which FolderSource this belongs to
  title: string;
  modifiedAt: string; // ISO string
  sizeBytes: number;
}

interface PlanDetail extends PlanMeta {
  content: string;
}
```

- `relativePath` is displayed in the plan list item (shows subfolder context)
- `filePath` = `sourceId + "/" + relativePath` — used as the localStorage key for completion tracking
- `sourceId` ties each plan to its accordion section

### FolderSource ID generation

- API source: `id = "api"`
- Browser folders: `id = handle.name + "-" + Date.now()` (handles opening the same folder name twice)

## Context & State (`src/context/folder-context.tsx`)

Replace single-handle state with a multi-source store:

```ts
interface FolderContextValue {
  sources: FolderSource[];
  isSupported: boolean;
  addFolder: () => Promise<void>; // showDirectoryPicker, append to sources
  removeFolder: (id: string) => void; // remove a source by ID
}
```

- On mount, if the API is reachable (probe `GET /api/plans`), auto-add `{ id: "api", label: "plans" }` as the first source.
- `addFolder()` calls `showDirectoryPicker()`, creates a `FolderSource` with the handle, appends to `sources`.
- `removeFolder(id)` filters it out. Cannot remove the API source (or can — up to implementation).

## Type Augmentation (`src/lib/fs-source.ts`)

The existing global type augmentation needs to be extended for subdirectory navigation. No `any` or `@ts-ignore` — all fully typed:

```ts
declare global {
  interface FileSystemDirectoryHandle {
    values(): AsyncIterableIterator<FileSystemHandle>;
    getDirectoryHandle(name: string): Promise<FileSystemDirectoryHandle>;
  }
  interface Window {
    showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
  }
}
```

## Recursive Directory Walking (`src/lib/fs-source.ts`)

Replace flat `readPlansFromHandle` with recursive walking:

```ts
async function walkDirectory(
  handle: FileSystemDirectoryHandle,
  sourceId: string,
  prefix: string = "",
): Promise<PlanMeta[]> {
  const plans: PlanMeta[] = [];
  for await (const entry of handle.values()) {
    if (entry.kind === "file" && entry.name.endsWith(".md")) {
      const file = await (entry as FileSystemFileHandle).getFile();
      const content = await file.text();
      const relativePath = prefix + entry.name;
      plans.push({
        filename: entry.name,
        relativePath,
        filePath: sourceId + "/" + relativePath,
        sourceId,
        title: extractTitle(content, entry.name),
        modifiedAt: new Date(file.lastModified).toISOString(),
        sizeBytes: file.size,
      });
    } else if (entry.kind === "directory") {
      const subHandle = entry as FileSystemDirectoryHandle;
      plans.push(...(await walkDirectory(subHandle, sourceId, prefix + entry.name + "/")));
    }
  }
  return plans;
}
```

`readPlanFromHandle` also needs to navigate subdirectories to find the file by `relativePath`:

```ts
async function getFileByRelativePath(
  root: FileSystemDirectoryHandle,
  relativePath: string,
): Promise<FileSystemFileHandle> {
  const parts = relativePath.split("/");
  const fileName = parts.pop()!;
  let dir = root;
  for (const part of parts) {
    dir = await dir.getDirectoryHandle(part);
  }
  return dir.getFileHandle(fileName);
}
```

## API Source Adapter (`src/lib/api.ts`)

`fetchPlans` response now needs `relativePath` and `sourceId`. Two options:

1. **Server plugin returns the extra fields** — add `relativePath` (same as filename for flat API) and let the client set `sourceId = "api"`.
2. **Client maps after fetch** — `fetchPlans()` returns current shape, hook maps to add `relativePath: filename`, `sourceId: "api"`.

**Recommended: Option 2** — no server plugin changes needed. The hook does the mapping.

For `fetchPlan(filename)`, the API continues to work with flat filenames since the server reads from a single directory. If the server eventually supports subdirectories, the endpoint would accept a path.

## Hooks

### `usePlans` (`src/hooks/use-plans.ts`)

Queries all sources in parallel and merges:

```ts
function usePlans() {
  const { sources } = useFolderContext();

  return useQuery({
    queryKey: ["plans", sources.map((s) => s.id)],
    queryFn: async () => {
      const results = await Promise.all(
        sources.map((source) =>
          source.handle
            ? walkDirectory(source.handle, source.id)
            : fetchPlans().then((plans) =>
                plans.map((p) => ({
                  ...p,
                  relativePath: p.filename,
                  sourceId: "api",
                  filePath: "api/" + p.filename,
                })),
              ),
        ),
      );
      return results.flat();
    },
    refetchInterval: 5_000,
  });
}
```

### `usePlanContent` (`src/hooks/use-plan-content.ts`)

Takes `sourceId` and `relativePath`:

```ts
function usePlanContent(sourceId: string, relativePath: string) {
  const { sources } = useFolderContext();
  const source = sources.find((s) => s.id === sourceId);

  return useQuery({
    queryKey: ["plan", sourceId, relativePath],
    queryFn: () => {
      if (source?.handle) return readPlanFromHandle(source.handle, sourceId, relativePath);
      return fetchPlan(relativePath); // API mode — relativePath = filename
    },
    staleTime: 30_000,
    refetchInterval: 5_000,
    enabled: !!source,
  });
}
```

### `useCompletedPlans` (`src/hooks/use-completed-plans.ts`)

No changes needed — already keys by `filePath` which will now be `sourceId/relativePath`.

## Routing (`src/routes.tsx`)

```ts
const planRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plan/$sourceId/$",   // splat captures relativePath
  component: () => {
    const { sourceId, _splat: relativePath } = planRoute.useParams();
    return <PlanViewer sourceId={sourceId} relativePath={relativePath} />;
  },
});
```

## Sidebar (`src/components/layout/sidebar.tsx`)

Restructure from single `<PlanList>` to:

```
<Sidebar>
  <Header>  (title, badge count, theme toggle, hide-completed toggle)
  <Search>
  <Separator>
  <ScrollArea>
    {sources.map(source => (
      <FolderAccordion
        key={source.id}
        source={source}
        plans={plansBySource[source.id]}  // filtered by search
        isCompleted={isCompleted}
        onToggleCompleted={toggleCompleted}
        onRemove={() => removeFolder(source.id)}
      />
    ))}
  </ScrollArea>
  <Separator>
  <Footer>  (Open Folder button)
</Sidebar>
```

### `FolderAccordion` component (new: `src/components/plan-list/folder-accordion.tsx`)

- Collapsible header: folder label, file count, remove button (X)
- Expanded body: flat list of `PlanListItem` components
  - Active plans first, then "Implemented" divider, then completed plans (current per-folder split behavior)
  - Each item shows `relativePath` for display (instead of `filename`) to convey subfolder context
- Starts expanded by default

### `PlanListItem` changes (`src/components/plan-list/plan-list-item.tsx`)

- Link `to` changes from `/plan/$filename` to `/plan/$sourceId/$`
- `params` becomes `{ sourceId: plan.sourceId, _splat: plan.relativePath }`
- Display: show `relativePath` (with subfolder prefix dimmed) instead of just `filename`
- `useMatchRoute` params updated accordingly

## PlanViewer (`src/components/plan-viewer/plan-viewer.tsx`)

- Props change from `{ filename }` to `{ sourceId, relativePath }`
- Calls `usePlanContent(sourceId, relativePath)`
- Rest unchanged

## PlanHeader (`src/components/plan-viewer/plan-header.tsx`)

- Shows `relativePath` instead of `filename` in the subtitle
- `filePath` for copy-to-clipboard remains the full path

## Empty State (`src/components/plan-viewer/empty-state.tsx`)

- "Open Folder" button calls `addFolder()` (was `openFolder()`)
- No other changes

## Files to Create

| File                                            | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| `src/components/plan-list/folder-accordion.tsx` | Collapsible folder section with plan list |

## Files to Modify

| File                                          | Change                                                                |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `src/types/plan.ts`                           | Add `relativePath`, `sourceId` to `PlanMeta`; add `FolderSource` type |
| `src/context/folder-context.tsx`              | Multi-source store (`sources[]`, `addFolder`, `removeFolder`)         |
| `src/lib/fs-source.ts`                        | Recursive `walkDirectory`, path-based `readPlanFromHandle`            |
| `src/lib/api.ts`                              | No changes (hook maps API response)                                   |
| `src/hooks/use-plans.ts`                      | Query all sources, merge results                                      |
| `src/hooks/use-plan-content.ts`               | Accept `sourceId` + `relativePath`, look up source                    |
| `src/routes.tsx`                              | Splat route `/plan/$sourceId/$`                                       |
| `src/components/layout/sidebar.tsx`           | Render `FolderAccordion` per source                                   |
| `src/components/plan-list/plan-list.tsx`      | Remove or refactor — logic moves into `FolderAccordion`               |
| `src/components/plan-list/plan-list-item.tsx` | Updated routing params, display `relativePath`                        |
| `src/components/plan-viewer/plan-viewer.tsx`  | Accept `sourceId` + `relativePath`                                    |
| `src/components/plan-viewer/plan-header.tsx`  | Show `relativePath`                                                   |
| `src/components/plan-viewer/empty-state.tsx`  | Call `addFolder()`                                                    |
| `src/main.tsx`                                | No changes (already wraps with `FolderProvider`)                      |
| `src/server/plans-plugin.ts`                  | Add `relativePath` and `sourceId` to list response                    |

## Type Safety Constraint

- No `any` types, no `@ts-ignore`, no `as unknown` casts
- All File System Access API types covered via the global augmentation (no implicit `any` from missing types)
- `vp check` must pass with zero errors (types, lint, format)
- TanStack Router splat params are typed: `useParams()` returns `{ sourceId: string; _splat: string }`

## Verification

1. `vp build` — no type/build errors
2. `vp dev` — API source auto-appears as "plans" accordion, plans load
3. Open a browser folder with nested subdirectories — appears as a second accordion, subfolders traversed, `relativePath` shown
4. Open a third folder — appears as third accordion
5. Remove a browser folder — accordion disappears, plans removed
6. Mark plans as implemented — per-folder split works, completion persists across sources
7. Search filters across all folders
8. Navigate via URL `/plan/api/some-plan.md` — loads correctly
9. Navigate via URL `/plan/my-folder-123/subfolder/plan.md` — loads correctly
10. 5s polling re-reads all sources
