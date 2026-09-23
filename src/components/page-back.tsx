"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowLeft, ChevronRight, Home } from "lucide-react";

const parents: Record<string, { href: string; label: string }> = {
  explore: { href: "/explore", label: "All fields" },
  careers: { href: "/explore", label: "Explore fields" },
  courses: { href: "/courses", label: "All courses" },
  pathways: { href: "/pathways", label: "All pathways" },
  institutions: { href: "/institutions", label: "All institutions" },
};
const labels: Record<string, string> = {
  start: "Your stage", counselling: "Understanding you", profile: "Your profile", explore: "Explore fields",
  courses: "Courses", pathways: "Pathways", institutions: "Institutions", scholarships: "Scholarships",
  exams: "Entrance exams", opportunities: "Skills & opportunities", saved: "Saved", dashboard: "Dashboard",
  compare: "Compare options", mentor: "Mentor", "action-plan": "Action plan", "how-it-works": "How it works",
  about: "About", "sign-in": "Sign in", "sign-up": "Create account", admin: "Data status",
};

/** App-aware back navigation; direct links always have a safe parent fallback. */
export function PageBack() {
  const pathname = usePathname();
  const router = useRouter();
  const trail = useRef<string[]>([]);
  useEffect(() => {
    const paths = trail.current;
    if (paths.at(-1) === pathname) return;
    if (paths.at(-2) === pathname) paths.pop();
    else paths.push(pathname);
  }, [pathname]);

  if (pathname === "/") return null;
  const segments = pathname.split("/").filter(Boolean);
  const parent = segments.length > 1 ? parents[segments[0]] : null;
  const fallback = parent?.href ?? (pathname === "/counselling" ? "/start" : "/");
  const currentLabel = parent ? segments[1].replace(/-/g, " ") : labels[segments[0]] ?? "Explore";

  return (
    <nav aria-label="Page navigation" className="cb-container flex min-w-0 items-center gap-3 pt-5 text-sm">
      <button type="button" onClick={() => trail.current.length > 1 ? router.back() : router.push(fallback)} className="cb-button cb-button-secondary shrink-0 px-3 py-2 text-sm">
        <ArrowLeft aria-hidden className="h-4 w-4" /> Back
      </button>
      <Link href={parent?.href ?? "/"} className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-forest-700 underline decoration-forest-300 underline-offset-4 hover:decoration-forest-700">
        {!parent && <Home aria-hidden className="h-3.5 w-3.5" />}{parent?.label ?? "Home"}
      </Link>
      <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-400" />
      <span aria-current="page" className="truncate text-xs capitalize text-ink-500">{currentLabel}</span>
    </nav>
  );
}
