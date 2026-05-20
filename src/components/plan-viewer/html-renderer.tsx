interface HtmlRendererProps {
  content: string;
  title: string;
}

export function HtmlRenderer({ content, title }: HtmlRendererProps) {
  return (
    <iframe
      title={title}
      srcDoc={content}
      sandbox="allow-scripts"
      className="h-full w-full border-0 bg-white"
    />
  );
}
