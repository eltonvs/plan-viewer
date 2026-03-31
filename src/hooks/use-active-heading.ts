import { useEffect, useRef, useState } from "react";

export function useActiveHeading(
  headingIds: string[],
  scrollContainerRef: React.RefObject<HTMLElement | null>,
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const visibleIds = useRef(new Set<string>());

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || headingIds.length === 0) return;

    visibleIds.current.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.current.add(entry.target.id);
          } else {
            visibleIds.current.delete(entry.target.id);
          }
        }

        // Pick the first visible heading in document order
        const firstVisible = headingIds.find((id) => visibleIds.current.has(id));
        if (firstVisible) {
          setActiveId(firstVisible);
          return;
        }

        // Fallback: find the last heading above the viewport
        const containerRect = container.getBoundingClientRect();
        let lastAbove: string | null = null;
        for (const id of headingIds) {
          const el = container.querySelector(`#${CSS.escape(id)}`);
          if (!el) continue;
          const rect = el.getBoundingClientRect();
          if (rect.top < containerRect.top + containerRect.height * 0.2) {
            lastAbove = id;
          }
        }
        if (lastAbove) {
          setActiveId(lastAbove);
        }
      },
      {
        root: container,
        rootMargin: "0px 0px -80% 0px",
        threshold: 0,
      },
    );

    for (const id of headingIds) {
      const el = container.querySelector(`#${CSS.escape(id)}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headingIds, scrollContainerRef]);

  return activeId;
}
