"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BookmarkCheck, Menu, UserRound, X } from "lucide-react";

const destinations = [
  { href: "/my-journey", label: "My Guidance" },
  { href: "/saved", label: "My Explorations" },
  { href: "/explore", label: "Explore Library" },
  { href: "/how-it-works", label: "Help" },
  { href: "/profile", label: "Profile" },
];

function BrandLink() {
  return (
    <Link href="/" aria-label="CareerBridge home" className="inline-flex shrink-0 items-center gap-2.5 rounded-md">
      <svg aria-hidden="true" viewBox="0 0 48 42" className="h-9 w-10" fill="none">
        <path d="M4 37v-3a20 20 0 0 1 40 0v3h-8v-3a12 12 0 0 0-24 0v3H4Z" fill="#315f58" />
        <path d="M13 37v-3a11 11 0 0 1 22 0v3h-6v-3a5 5 0 0 0-10 0v3h-6Z" fill="#b4c9bd" />
      </svg>
      <span className="font-serif text-[1.2rem] font-semibold tracking-[-.035em] text-[#202b27]">CareerBridge</span>
    </Link>
  );
}

export function PostCounsellingHeader({ activeHref }: { activeHref?: string } = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7e4d9] bg-[#fbfaf4]/95 backdrop-blur">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <BrandLink />

        <nav aria-label="Personalized guidance" className="hidden items-center gap-1 lg:flex">
          {destinations.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={activeHref === item.href ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-lg px-3 text-[14px] font-medium transition-colors hover:bg-[#eef3eb] hover:text-[#124d3d] focus-visible:outline-offset-2 ${activeHref === item.href ? "bg-[#eef3eb] text-[#124d3d]" : "text-[#314c42]"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 lg:flex">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#a5c4b4] underline-offset-4 transition-colors hover:text-[#124d3d]"
          >
            <BookmarkCheck aria-hidden className="h-4 w-4" />
            Save and come back later
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/profile"
            aria-label="Profile"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#dce4da] bg-white text-[#285f50]"
          >
            <UserRound aria-hidden className="h-[18px] w-[18px]" />
          </Link>
          <button
            type="button"
            ref={menuButtonRef}
            aria-expanded={mobileOpen}
            aria-controls="post-counselling-mobile-nav"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMobileOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce4da] bg-white text-[#285f50] focus-visible:outline-offset-2"
          >
            {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav id="post-counselling-mobile-nav" aria-label="Mobile personalized guidance" className="border-t border-[#e7e4d9] bg-[#fbfaf4] px-5 pb-5 pt-3 lg:hidden">
          <div className="mx-auto grid max-w-2xl gap-1 sm:grid-cols-2">
            {destinations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={activeHref === item.href ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-[#eef3eb] ${activeHref === item.href ? "bg-[#eef3eb] text-[#124d3d]" : "text-[#314c42]"}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="col-span-full mt-2 inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#dce4da] bg-white px-3 text-sm font-medium text-[#35675b]"
            >
              <BookmarkCheck aria-hidden className="h-4 w-4" />
              Save and come back later
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
