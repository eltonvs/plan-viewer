export interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split("\n");
  const headings: HeadingItem[] = [];
  const usedIds = new Set<string>();
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      let id = slugify(text);

      if (usedIds.has(id)) {
        let counter = 1;
        while (usedIds.has(`${id}-${counter}`)) counter++;
        id = `${id}-${counter}`;
      }
      usedIds.add(id);

      headings.push({ level, text, id });
    }
  }

  return headings;
}
