import { describe, expect, test } from "vite-plus/test";

import { slugify, extractHeadings } from "./headings";

describe("slugify", () => {
  test("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  test("strips non-alphanumeric characters", () => {
    expect(slugify("API Design (v2)")).toBe("api-design-v2");
  });

  test("collapses consecutive hyphens", () => {
    expect(slugify("foo - bar")).toBe("foo-bar");
  });

  test("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("extractHeadings", () => {
  test("extracts h1-h6 headings", () => {
    const md = "# Title\n## Section\n### Sub\n#### Deep\n##### Deeper\n###### Deepest";
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: "Title", id: "title" },
      { level: 2, text: "Section", id: "section" },
      { level: 3, text: "Sub", id: "sub" },
      { level: 4, text: "Deep", id: "deep" },
      { level: 5, text: "Deeper", id: "deeper" },
      { level: 6, text: "Deepest", id: "deepest" },
    ]);
  });

  test("skips headings inside fenced code blocks", () => {
    const md = "# Real\n```\n# Fake\n```\n## Also Real";
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: "Real", id: "real" },
      { level: 2, text: "Also Real", id: "also-real" },
    ]);
  });

  test("returns empty array for no headings", () => {
    expect(extractHeadings("Just some text\nNo headings here")).toEqual([]);
  });

  test("handles headings with inline formatting", () => {
    const md = "## **Bold** heading\n### `code` heading";
    expect(extractHeadings(md)).toEqual([
      { level: 2, text: "**Bold** heading", id: "bold-heading" },
      { level: 3, text: "`code` heading", id: "code-heading" },
    ]);
  });

  test("deduplicates identical heading slugs", () => {
    const md = "## Section\n## Section\n## Section";
    const result = extractHeadings(md);
    expect(result[0].id).toBe("section");
    expect(result[1].id).toBe("section-1");
    expect(result[2].id).toBe("section-2");
  });

  test("avoids collision between dedup suffix and organic slugs", () => {
    const md = "## Section\n## Section\n## Section 1";
    const result = extractHeadings(md);
    expect(result[0].id).toBe("section");
    expect(result[1].id).toBe("section-1");
    expect(result[2].id).toBe("section-1-1");
  });
});
