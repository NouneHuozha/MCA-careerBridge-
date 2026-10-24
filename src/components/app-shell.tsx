"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ExploreLibraryFooter } from "@/components/explore-library-footer";
import { ExploreLibraryNav } from "@/components/explore-library-nav";
import { PageBack } from "@/components/page-back";
import { SavedProvider } from "@/components/save-button";
import { MentorWidget } from "@/components/mentor-widget";
import { Logo } from "@/components/logo";

type AppUser = { name: string | null; email: string } | null;

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
  const isHome = pathname === "/";
  const isCounselling = pathname.startsWith("/counselling");
  const isStart = pathname.startsWith("/start");
  const isGuidance = pathname.startsWith("/guidance");
  const isGuidedFlow = isStart || isCounselling || isGuidance;
  const isExploreLibrary = [
    "/explore",
    "/careers",
    "/pathways",
    "/courses",
    "/institutions",
    "/exams",
    "/scholarships",
    "/opportunities",
    "/compare",
    "/about",
    "/how-it-works",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const showPageBack = !isAdmin && !isGuidedFlow && !isHome && !isExploreLibrary && !isAuthPage;
  return <SavedProvider key={user?.email ?? "guest"} signedIn={Boolean(user)}><>{isAuthPage ? <header className="py-4"><div className="cb-container"><Logo /></div></header> : null}{isExploreLibrary && <ExploreLibraryNav user={user ? { name: user.name, email: user.email } : null} />}{!isAdmin && !isAuthPage && !isGuidedFlow && !isExploreLibrary && <SiteNav user={user ? { name: user.name, email: user.email } : null} />}<main id="main" data-explore-library={isExploreLibrary ? "" : undefined} className="min-w-0 flex-1">{showPageBack && <PageBack />}{children}</main>{isExploreLibrary ? <ExploreLibraryFooter /> : !isAdmin && !isAuthPage && !isGuidedFlow && <SiteFooter home={isHome} />}{!isAdmin && !isGuidedFlow && !isHome && !isExploreLibrary && !isAuthPage && <MentorWidget />}</></SavedProvider>;
}
