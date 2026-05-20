import { describe, expect, test } from "vite-plus/test";

import {
  extractTitleFromContent,
  extractTitleFromHtml,
  parseFrontmatter,
  stripFrontmatter,
} from "./frontmatter";

describe("parseFrontmatter", () => {
  test("parses YAML frontmatter", () => {
    const content = "---\nname: My Plan\noverview: A test plan\n---\n# Heading";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter.name).toBe("My Plan");
    expect(frontmatter.overview).toBe("A test plan");
    expect(body).toBe("# Heading");
  });

  test("returns empty frontmatter and full body when no frontmatter", () => {
    const content = "# Just a heading\nSome content";
    const { frontmatter, body } = parseFrontmatter(content);
    expect(frontmatter).toEqual({});
    expect(body).toBe(content);
  });

  test("handles frontmatter with complex values by taking first line value", () => {
    const content = "---\nname: Add MarketGrouping to Clip.ts\nisProject: false\n---\n# Title";
    const { frontmatter } = parseFrontmatter(content);
    expect(frontmatter.name).toBe("Add MarketGrouping to Clip.ts");
    expect(frontmatter.isProject).toBe("false");
  });
});

describe("stripFrontmatter", () => {
  test("strips frontmatter from content", () => {
    const content = "---\nname: Test\n---\n# Heading\nBody";
    expect(stripFrontmatter(content)).toBe("# Heading\nBody");
  });

  test("returns content unchanged when no frontmatter", () => {
    const content = "# Heading\nBody";
    expect(stripFrontmatter(content)).toBe(content);
  });
});

describe("extractTitleFromContent", () => {
  test("uses frontmatter name when available", () => {
    const content = "---\nname: My Custom Title\n---\n# Heading";
    expect(extractTitleFromContent(content, "file.md")).toBe("My Custom Title");
  });

  test("falls back to first heading when no frontmatter name", () => {
    const content = "---\noverview: Something\n---\n# The Heading";
    expect(extractTitleFromContent(content, "file.md")).toBe("The Heading");
  });

  test("falls back to filename when no frontmatter or heading", () => {
    expect(extractTitleFromContent("Just text", "my-plan.md")).toBe("my plan");
  });

  test("uses heading from body, not from frontmatter block", () => {
    const content = "# Real Title\nContent here";
    expect(extractTitleFromContent(content, "file.md")).toBe("Real Title");
  });

  test("strips .html extension in filename fallback", () => {
    expect(extractTitleFromContent("plain text", "my-page.HTML")).toBe("my page");
  });
});

describe("extractTitleFromHtml", () => {
  test("uses <title> when present", () => {
    expect(extractTitleFromHtml("<html><head><title>My Page</title></head>", "f.html")).toBe(
      "My Page",
    );
  });

  test("trims whitespace in <title>", () => {
    expect(extractTitleFromHtml("<title>  Spaced  </title>", "f.html")).toBe("Spaced");
  });

  test("handles uppercase <TITLE>", () => {
    expect(extractTitleFromHtml("<TITLE>Loud</TITLE>", "f.html")).toBe("Loud");
  });

  test("falls back to <h1> when no <title>", () => {
    expect(extractTitleFromHtml("<h1>Heading</h1>", "f.html")).toBe("Heading");
  });

  test("strips nested tags inside <h1>", () => {
    expect(extractTitleFromHtml("<h1>Hello <span>World</span></h1>", "f.html")).toBe("Hello World");
  });

  test("handles <h1> with attributes", () => {
    expect(extractTitleFromHtml('<h1 class="x" id="y">Title</h1>', "f.html")).toBe("Title");
  });

  test("falls back to humanized filename when no <title> or <h1>", () => {
    expect(extractTitleFromHtml("<p>nope</p>", "my-page.html")).toBe("my page");
  });

  test("filename fallback works for .htm too", () => {
    expect(extractTitleFromHtml("<p>nope</p>", "my-page.htm")).toBe("my page");
  });

  test("empty <title> falls through to <h1>", () => {
    expect(extractTitleFromHtml("<title>   </title><h1>Real</h1>", "f.html")).toBe("Real");
  });
});
