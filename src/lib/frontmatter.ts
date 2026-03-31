const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

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
  return filename.replace(/\.md$/, "").replace(/-/g, " ");
}

export function stripFrontmatter(content: string): string {
  return parseFrontmatter(content).body;
}
