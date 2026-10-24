"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";

const primaryLinks = [
  { href: "/explore", label: "Explore" },
  { href: "/careers", label: "Careers" },
  { href: "/pathways", label: "Study routes" },
  { href: "/courses", label: "Courses" },
  { href: "/institutions", label: "Places to study" },
];

const resourceLinks = [
  { href: "/exams", label: "Entrance exams" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/opportunities", label: "Skills & opportunities" },
];

type NavUser = { name: string | null; email: string } | null;

export function ExploreLibraryNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const guidanceHref = user ? "/guidance" : "/start";

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="relative z-40 bg-[#f7f8f5]">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Logo size="md" />

        <nav aria-label="Explore Library" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`px-3 py-2 text-[13px] font-semibold transition-colors ${
                isActive(item.href)
                  ? "text-[#09332a]"
                  : "text-[#4a5c52] hover:text-[#09332a]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative">
            <button
              type="button"
              aria-expanded={resourcesOpen}
              aria-haspopup="true"
              onClick={() => setResourcesOpen((open) => !open)}
              className="inline-flex min-h-10 items-center gap-1 px-3 py-2 text-[13px] font-semibold text-[#4a5c52] transition-colors hover:text-[#09332a]"
            >
              Resources
              <ChevronDown
                aria-hidden="true"
                className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
              />
            </button>
            {resourcesOpen ? (
              <div className="absolute right-0 top-[calc(100%+10px)] w-60 rounded-2xl border border-[#d5ded8] bg-white p-2">
                {resourceLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setResourcesOpen(false)}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#263b30] transition-colors hover:bg-[#edf1ee]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href="/how-it-works"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[#4a5c52] hover:text-[#09332a]"
          >
            How it works
          </Link>
          <Link
            href={guidanceHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#09332a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0d4538]"
          >
            {user ? "My Guidance" : "Start counselling"}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-[#c2cfc9] text-[#09332a] lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="Mobile Explore Library"
          className="bg-[#e6eeea] px-5 py-4 lg:hidden"
        >
          <div className="grid gap-1">
            {[...primaryLinks, ...resourceLinks, { href: "/how-it-works", label: "How it works" }].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={`min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                  isActive(item.href)
                    ? "bg-[#e1e8e3] text-[#09332a]"
                    : "text-[#4a5c52] hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={guidanceHref}
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#09332a] px-5 text-sm font-semibold text-white"
            >
              {user ? "My Guidance" : "Start counselling"}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
