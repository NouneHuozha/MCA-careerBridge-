"use client";

import Link from "next/link";
import { ArrowLeftRight, Search, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

function GuidanceBrand() {
  return <Link href="/" aria-label="CareerBridge home" className="inline-flex shrink-0 items-center rounded-md font-serif text-[1.75rem] font-semibold tracking-[-.045em] text-[#123f3b]">CareerBridge</Link>;
}

export function GuidanceHeader() {
  return <header className="border-b border-[#e5e6e1] bg-white"><div className="mx-auto flex min-h-[62px] max-w-[1500px] items-center gap-5 px-5 sm:px-8 lg:px-12"><GuidanceBrand /><span aria-hidden className="hidden h-8 w-px bg-[#d9ddd7] sm:block" /><nav aria-label="Exploration navigation" className="hidden items-center gap-7 sm:flex"><Link href="/saved" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#26312c] hover:text-[#286b61]">◉ <span>My explorations</span></Link><Link href="/guidance/possibilities" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#26312c] hover:text-[#286b61]"><ArrowLeftRight className="h-5 w-5" />Switch exploration</Link></nav><div className="ml-auto flex items-center gap-3"><label className="hidden items-center gap-2 rounded-lg border border-[#dfe4df] bg-[#f7f9f7] px-3 sm:flex"><Search aria-hidden className="h-4 w-4 text-[#45645b]" /><span className="sr-only">Search</span><input aria-label="Search institutions, courses or careers" placeholder="Search institutions, courses or careers..." className="h-9 w-[275px] bg-transparent text-sm outline-none placeholder:text-[#929b94]" /></label><Link href="/profile" aria-label="Profile" className="grid h-10 w-10 place-items-center rounded-full bg-[#0d5b55] text-white"><UserRound aria-hidden className="h-5 w-5" /></Link></div></div></header>;
}

function TransitionHeader() {
  return <header className="flex items-center justify-between px-5 pt-6 sm:px-8 sm:pt-7 lg:px-16 lg:pt-8">
    <Link href="/" aria-label="CareerBridge home" className="inline-flex items-center gap-2.5 text-[#202522]">
      <span aria-hidden className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-t-[1.1rem] border-[5px] border-[#2f6d67] border-b-0 sm:h-10 sm:w-10">
        <span className="absolute bottom-0 h-5 w-5 rounded-t-full border-[4px] border-[#b8c6bc] border-b-0" />
      </span>
      <span className="font-serif text-[1.35rem] font-semibold tracking-[-.045em] sm:text-[1.55rem]">CareerBridge</span>
    </Link>
    <Link href="/profile" className="font-serif text-[.95rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] sm:text-[1.05rem]">Save and come back later</Link>
  </header>;
}

export function GuidanceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isTransition = pathname === "/guidance/complete";
  return <div className="min-h-screen bg-[#fcfcfa] text-[#243b32]">{isTransition ? <TransitionHeader /> : <GuidanceHeader />}{children}</div>;
}
