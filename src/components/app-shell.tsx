"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBack } from "@/components/page-back";
import { SavedProvider } from "@/components/save-button";
import { MentorWidget } from "@/components/mentor-widget";

type AppUser = { name: string | null; email: string } | null;

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isHome = pathname === "/";
  const isCounselling = pathname.startsWith("/counselling");
  const isStart = pathname.startsWith("/start");
  const isGuidance = pathname.startsWith("/guidance");
  const isPostCounselling = isGuidance && !pathname.startsWith("/guidance/complete") && !pathname.startsWith("/guidance/confirm") && pathname !== "/guidance/review/details";
  const isGuidedFlow = isStart || isCounselling || isGuidance;
  const showPageBack = !isAdmin && !isGuidedFlow && !isHome;
  return <SavedProvider key={user?.email ?? "guest"} signedIn={Boolean(user)}><>{!isAdmin && !isGuidedFlow && <SiteNav user={user ? { name: user.name, email: user.email } : null} />}<main id="main" className="min-w-0 flex-1">{showPageBack && <PageBack />}{isGuidance ? <div className="cb-guidance-scope">{isPostCounselling ? <nav aria-label="Guidance navigation" className="sticky top-0 z-40 border-b border-[var(--cb-line)] bg-[var(--cb-canvas)]/95 backdrop-blur"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-2 gap-y-1 px-5 py-2 sm:px-8 lg:px-12"><Link href="/guidance" aria-current={pathname === "/guidance" ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition ${pathname === "/guidance" ? "bg-[var(--cb-primary)] text-white" : "text-[var(--cb-ink)] hover:bg-[var(--cb-surface-soft)]"}`}>My Guidance</Link><Link href="/guidance/possibilities" aria-current={pathname.startsWith("/guidance/possibilities") || pathname.startsWith("/guidance/direction") ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition ${pathname.startsWith("/guidance/possibilities") || pathname.startsWith("/guidance/direction") ? "bg-[var(--cb-primary)] text-white" : "text-[var(--cb-ink)] hover:bg-[var(--cb-surface-soft)]"}`}>Explore</Link><Link href="/guidance/explorations" aria-current={pathname.startsWith("/guidance/explorations") || pathname.startsWith("/guidance/saved") ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition ${pathname.startsWith("/guidance/explorations") || pathname.startsWith("/guidance/saved") ? "bg-[var(--cb-primary)] text-white" : "text-[var(--cb-ink)] hover:bg-[var(--cb-surface-soft)]"}`}>My Explorations</Link><Link href="/guidance/action-plan" aria-current={pathname.startsWith("/guidance/action-plan") ? "page" : undefined} className={`inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold transition ${pathname.startsWith("/guidance/action-plan") ? "bg-[var(--cb-primary)] text-white" : "text-[var(--cb-ink)] hover:bg-[var(--cb-surface-soft)]"}`}>Next steps</Link></div></nav> : null}{children}</div> : children}</main>{!isAdmin && !isGuidedFlow && <SiteFooter home={isHome} />}{!isAdmin && !isGuidedFlow && !isHome && <MentorWidget />}</></SavedProvider>;
}
