"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cx } from "@/components/ui";

/** Content is visible before hydration and without JS; only off-screen content animates. */
export function Reveal({ children, delay = 0, as: As = "div", className, repeat = false }: { children: ReactNode; delay?: number; as?: ElementType; className?: string; repeat?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!repeat && node.getBoundingClientRect().top < window.innerHeight) { node.dataset.visible = "true"; return; }
    node.dataset.animate = "true";
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (repeat) node.dataset.visible = String(entry.isIntersecting);
        else if (entry.isIntersecting) { node.dataset.visible = "true"; observer.disconnect(); }
      }
    }, { threshold: .04 });
    observer.observe(node);
    return () => { observer.disconnect(); node.dataset.visible = "true"; };
  }, [repeat]);
  return <As ref={ref} style={{ transitionDelay: `${Math.min(delay, 250)}ms` }} className={cx("cb-reveal", className)}>{children}</As>;
}
