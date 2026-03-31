import { Children, type ReactNode } from "react";
import Markdown from "react-markdown";
import type { Components } from "react-markdown";

import "highlight.js/styles/github-dark-dimmed.css";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { slugify } from "@/lib/headings";

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
      className="font-heading mt-8 mb-4 scroll-mt-16 text-2xl font-bold first:mt-0"
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      id={slugify(getTextContent(children))}
      className="border-border font-heading mt-8 mb-3 scroll-mt-16 border-b pb-2 text-xl font-semibold"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={slugify(getTextContent(children))}
      className="font-heading mt-6 mb-2 scroll-mt-16 text-lg font-semibold"
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4
      id={slugify(getTextContent(children))}
      className="font-heading mt-4 mb-2 scroll-mt-16 text-base font-semibold"
    >
      {children}
    </h4>
  ),
  h5: ({ children }) => (
    <h5
      id={slugify(getTextContent(children))}
      className="font-heading mt-3 mb-1 scroll-mt-16 text-sm font-semibold"
    >
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6
      id={slugify(getTextContent(children))}
      className="font-heading mt-3 mb-1 scroll-mt-16 text-xs font-semibold"
    >
      {children}
    </h6>
  ),
  p: ({ children }) => <p className="text-foreground/90 mb-4 leading-7">{children}</p>,
  ul: ({ children }) => (
    <ul className="text-foreground/90 mb-4 list-disc space-y-1 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-foreground/90 mb-4 list-decimal space-y-1 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-7">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary decoration-primary/30 hover:decoration-primary font-medium underline underline-offset-4"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-primary/40 text-muted-foreground mb-4 border-l-4 pl-4 italic">
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
      <code className="bg-muted text-primary rounded-md px-1.5 py-0.5 font-mono text-sm">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="border-border mb-4 overflow-x-auto rounded-lg border bg-[oklch(0.18_0.015_270)] p-4 font-mono text-sm text-[oklch(0.85_0.01_270)] [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-border bg-muted/50 border-b">{children}</thead>,
  th: ({ children }) => <th className="px-4 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border-border border-t px-4 py-2">{children}</td>,
  hr: () => <hr className="border-border my-8" />,
  strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
  input: ({ checked, ...props }) => (
    <input type="checkbox" checked={checked} readOnly className="accent-primary mr-2" {...props} />
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
