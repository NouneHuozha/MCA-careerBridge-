"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { cx } from "@/components/ui";

/** Content is visible before hydration and without JS; only off-screen content animates. */
export function Reveal({ children, delay = 0, as: As = "div", className }: { children: ReactNode; delay?: number; as?: ElementType; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) { node.dataset.visible = "true"; return; }
    node.dataset.animate = "true";
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) { node.dataset.visible = "true"; observer.disconnect(); } }, { threshold: .04 });
    observer.observe(node);
    return () => { observer.disconnect(); node.dataset.visible = "true"; };
  }, []);
  return <As ref={ref} style={{ transitionDelay: `${Math.min(delay, 250)}ms` }} className={cx("cb-reveal", className)}>{children}</As>;
}
