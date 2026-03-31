import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark-dimmed.css";
import type { Components } from "react-markdown";
import { slugify } from "@/lib/headings";
import { Children, type ReactNode } from "react";

function getTextContent(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => {
      if (typeof child === "string") return child;
      if (typeof child === "number") return String(child);
      if (typeof child === "object" && child !== null && "props" in child) {
        return getTextContent((child as { props: { children?: ReactNode } }).props.children);
      }
      return "";
    })
    .join("");
}

const components: Components = {
  h1: ({ children }) => (
    <h1
      id={slugify(getTextContent(children))}
      className="mb-4 mt-8 font-heading text-2xl font-bold first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      id={slugify(getTextContent(children))}
      className="mb-3 mt-8 border-b border-border pb-2 font-heading text-xl font-semibold"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={slugify(getTextContent(children))}
      className="mb-2 mt-6 font-heading text-lg font-semibold"
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      id={slugify(getTextContent(children))}
      className="mb-2 mt-4 font-heading text-base font-semibold"
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5
      id={slugify(getTextContent(children))}
      className="mb-1 mt-3 font-heading text-sm font-semibold"
    >
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      id={slugify(getTextContent(children))}
      className="mb-1 mt-3 font-heading text-xs font-semibold"
    >
      {children}
    </h6>
  ),
  p: ({ children }) => <p className="mb-4 leading-7 text-foreground/90">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-1 pl-6 text-foreground/90">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-1 pl-6 text-foreground/90">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 border-l-4 border-primary/40 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    // Block code (inside <pre>) has hljs/language- classes OR no class at all.
    // Inline code is never inside <pre>, so we use a wrapper approach:
    // <pre> renders a custom element that marks its children as block context.
    // Here we only style truly inline code — if className exists from hljs, it's block.
    if (className) {
      return <code className={className}>{children}</code>;
    }
    // Inline code — styled with bg
    return (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-primary">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-[oklch(0.18_0.015_270)] p-4 font-mono text-sm text-[oklch(0.85_0.01_270)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-border bg-muted/50">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-t border-border px-4 py-2">{children}</td>,
  hr: () => <hr className="my-8 border-border" />,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  input: ({ checked, ...props }) => (
    <input type="checkbox" checked={checked} readOnly className="mr-2 accent-primary" {...props} />
  ),
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose-plan max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: false }]]}
        components={components}
      >
        {content}
      </Markdown>
    </div>
  );
}
