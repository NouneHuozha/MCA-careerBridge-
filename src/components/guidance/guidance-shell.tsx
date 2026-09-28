"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const destinations = [
  { href: "/my-journey", label: "My Guidance" },
  { href: "/saved", label: "My Explorations" },
  { href: "/explore", label: "Explore Library" },
  { href: "/how-it-works", label: "Help" },
  { href: "/profile", label: "Profile" },
];

function GuidanceBrand() {
  return (
    <Link href="/" aria-label="CareerBridge home" className="inline-flex shrink-0 items-center gap-2.5 rounded-md">
      <span aria-hidden="true" className="relative grid h-9 w-10 place-items-center">
        <span className="absolute bottom-0 left-0 h-7 w-10 rounded-t-[1.25rem] border-[7px] border-b-0 border-[#315f58]" />
        <span className="absolute bottom-0 left-[11px] h-5 w-[18px] rounded-t-[1rem] border-[5px] border-b-0 border-[#b4c9bd]" />
      </span>
      <span className="font-serif text-[1.2rem] font-semibold tracking-[-.035em] text-[#202b27]">CareerBridge</span>
    </Link>
  );
}

export function GuidanceHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        menuButtonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <header className="border-b border-[#e7e4d9] bg-[#fbfaf4]">
      <div className="mx-auto flex min-h-[76px] max-w-[1600px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <GuidanceBrand />
        <nav aria-label="Personalized guidance" className="hidden items-center gap-1 lg:flex">
          {destinations.map((item) => (
            <Link key={item.href} href={item.href} className="inline-flex min-h-11 items-center rounded-lg px-3 text-[14px] font-medium text-[#314c42] transition-colors hover:bg-[#eef3eb] hover:text-[#124d3d] focus-visible:outline-offset-2">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/" className="hidden min-h-11 items-center whitespace-nowrap rounded-lg px-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42] focus-visible:outline-offset-2 lg:flex">
          Save and come back later
        </Link>
        <div className="flex items-center gap-2 lg:hidden">
          <Link href="/profile" aria-label="Profile" className="grid h-10 w-10 place-items-center rounded-full border border-[#dce4da] bg-white text-[#285f50]"><UserRound aria-hidden className="h-[18px] w-[18px]" /></Link>
          <button type="button" ref={menuButtonRef} aria-expanded={mobileOpen} aria-controls="guidance-mobile-nav" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#dce4da] bg-white text-[#285f50] focus-visible:outline-offset-2">
            {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobileOpen && <nav id="guidance-mobile-nav" aria-label="Mobile personalized guidance" className="border-t border-[#e7e4d9] bg-[#fbfaf4] px-5 pb-5 pt-3 lg:hidden"><div className="mx-auto grid max-w-2xl gap-1 sm:grid-cols-2">{destinations.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[#314c42] hover:bg-[#eef3eb]">{item.label}</Link>)}</div></nav>}
    </header>
  );
}

export function GuidanceShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#fbfaf4] text-[#243b32]"><GuidanceHeader />{children}</div>;
}
