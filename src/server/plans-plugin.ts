import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import type { Plugin, Connect } from "vite";

const DEFAULT_PLANS_DIR = path.join(os.homedir(), ".claude", "plans");

interface PlansApiOptions {
  plansDir?: string;
}

interface PlanMeta {
  filename: string;
  title: string;
  modifiedAt: string;
  sizeBytes: number;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

function parseFrontmatter(content: string): { name: string | null; body: string } {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { name: null, body: content };
  let name: string | null = null;
  for (const line of match[1].split("\n")) {
    const m = line.match(/^name:\s*(.+)/);
    if (m) {
      name = m[1].trim();
      break;
    }
  }
  return { name, body: content.slice(match[0].length) };
}

function extractTitle(content: string, filename: string): string {
  const { name, body } = parseFrontmatter(content);
  if (name) return name;
  const firstLine = body.split("\n").find((line) => line.startsWith("# "));
  if (firstLine) return firstLine.replace(/^#\s+/, "");
  return filename.replace(/\.md$/, "").replace(/-/g, " ");
}

function createMiddleware(plansDir: string): Connect.NextHandleFunction {
  return async (req, res, next) => {
    if (!req.url?.startsWith("/api/plans")) return next();

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");

    try {
      // GET /api/plans — list all plans
      if (req.url === "/api/plans" || req.url === "/api/plans/") {
        let files: string[];
        try {
          const entries = await fs.readdir(plansDir);
          files = entries.filter((f) => f.endsWith(".md"));
        } catch {
          res.end(JSON.stringify([]));
          return;
        }

        const plans: PlanMeta[] = await Promise.all(
          files.map(async (filename) => {
            const filePath = path.join(plansDir, filename);
            const [stat, content] = await Promise.all([
              fs.stat(filePath),
              fs.readFile(filePath, "utf-8"),
            ]);
            return {
              filename,
              filePath,
              title: extractTitle(content, filename),
              modifiedAt: stat.mtime.toISOString(),
              sizeBytes: stat.size,
            };
          }),
        );

        plans.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

        res.end(JSON.stringify(plans));
        return;
      }

      // GET /api/plans/:filename — get single plan
      const match = req.url.match(/^\/api\/plans\/(.+)$/);
      if (match) {
        const filename = decodeURIComponent(match[1]);
        if (filename.includes("..") || filename.includes("/")) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: "Invalid filename" }));
          return;
        }

        const filePath = path.join(plansDir, filename);
        try {
          const [stat, content] = await Promise.all([
            fs.stat(filePath),
            fs.readFile(filePath, "utf-8"),
          ]);
          const { name, body } = parseFrontmatter(content);
          const title =
            name ??
            body
              .split("\n")
              .find((line) => line.startsWith("# "))
              ?.replace(/^#\s+/, "") ??
            filename.replace(/\.md$/, "").replace(/-/g, " ");
          res.end(
            JSON.stringify({
              filename,
              filePath,
              title,
              content: body,
              modifiedAt: stat.mtime.toISOString(),
              sizeBytes: stat.size,
            }),
          );
        } catch {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "Plan not found" }));
        }
        return;
      }

      next();
    } catch {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal server error" }));
    }
  };
}

export function plansApiPlugin(options?: PlansApiOptions): Plugin {
  const plansDir = options?.plansDir ?? DEFAULT_PLANS_DIR;

  return {
    name: "plans-api",
    configureServer(server) {
      server.middlewares.use(createMiddleware(plansDir));
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMiddleware(plansDir));
    },
  };
}
