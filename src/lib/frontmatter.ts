import { stripPlanExtension } from "./plan-file-type.ts";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;
const HTML_TITLE_RE = /<title>([^<]+)<\/title>/i;
const HTML_H1_RE = /<h1[^>]*>([\s\S]*?)<\/h1>/i;
const HTML_TAG_RE = /<[^>]+>/g;

export interface Frontmatter {
  name?: string;
  [key: string]: unknown;
}

export function parseFrontmatter(content: string): {
  frontmatter: Frontmatter;
  body: string;
} {
  const match = content.match(FRONTMATTER_RE);
  if (!match) return { frontmatter: {}, body: content };

  const raw = match[1];
  const frontmatter: Frontmatter = {};

  for (const line of raw.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();
    if (key && value) {
      frontmatter[key] = value;
    }
  }

  return { frontmatter, body: content.slice(match[0].length) };
}

export function extractTitleFromContent(content: string, filename: string): string {
  const { frontmatter, body } = parseFrontmatter(content);
  if (typeof frontmatter.name === "string" && frontmatter.name) {
    return frontmatter.name;
  }
  const firstHeading = body.split("\n").find((line) => line.startsWith("# "));
  if (firstHeading) return firstHeading.replace(/^#\s+/, "");
  return stripPlanExtension(filename).replace(/-/g, " ");
}

export function extractTitleFromHtml(content: string, filename: string): string {
  const titleMatch = content.match(HTML_TITLE_RE);
  if (titleMatch?.[1]?.trim()) return titleMatch[1].trim();
  const h1Match = content.match(HTML_H1_RE);
  if (h1Match?.[1]) {
    const text = h1Match[1].replace(HTML_TAG_RE, "").trim();
    if (text) return text;
  }
  return stripPlanExtension(filename).replace(/-/g, " ");
}

export function stripFrontmatter(content: string): string {
  return parseFrontmatter(content).body;
}
