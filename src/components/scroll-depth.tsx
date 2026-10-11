"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** A gentle perspective shift tied to scroll progress through its section. */
export function ScrollDepth({ children, className = "" }: { children: ReactNode; className?: string }) {
  const scene = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sceneNode = scene.current;
    const layerNode = layer.current;
    if (!sceneNode || !layerNode || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = sceneNode.getBoundingClientRect();
        const progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height * 0.82)));
        const translateY = progress * 28;
        const rotateX = progress * 3.2;
        layerNode.style.transform = `translate3d(0, ${translateY}px, -24px) rotateX(${rotateX}deg) scale(1.08)`;
      });
    };

    layerNode.style.transformOrigin = "50% 45%";
    layerNode.style.transformStyle = "preserve-3d";
    layerNode.style.willChange = "transform";
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      layerNode.style.transform = "";
      layerNode.style.willChange = "";
    };
  }, []);

  return <div ref={scene} className={`absolute inset-0 -z-20 overflow-hidden [perspective:1400px] ${className}`}>
    <div ref={layer} className="absolute inset-0">{children}</div>
  </div>;
}
