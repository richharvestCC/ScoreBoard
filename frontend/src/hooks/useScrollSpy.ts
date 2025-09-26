import { useEffect, useState } from 'react';

type Options = {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * Observes section elements and returns the currently active section id.
 * Pass a stable list of section ids. Uses IntersectionObserver under the hood.
 */
export function useScrollSpy(ids: string[], options?: Options) {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (!ids || ids.length === 0) return;
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1));
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      {
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '-16% 0px -70% 0px',
        threshold: options?.threshold ?? [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, options?.root, options?.rootMargin, options?.threshold]);

  return activeId;
}

export default useScrollSpy;

