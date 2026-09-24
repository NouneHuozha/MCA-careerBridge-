"use client";

import { usePathname } from "next/navigation";
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
  const isCounselling = pathname.startsWith("/counselling");
  const isStart = pathname.startsWith("/start");
  const isProfile = pathname.startsWith("/profile");
  const isJourney = pathname.startsWith("/my-journey") || pathname.startsWith("/reflection");
  const isGuidedFlow = isStart || isCounselling || isJourney;
  const showPageBack = !isAdmin && !isGuidedFlow && !isProfile;
  return <SavedProvider key={user?.email ?? "guest"} signedIn={Boolean(user)}><>{!isAdmin && !isGuidedFlow && <SiteNav user={user ? { name: user.name, email: user.email } : null} />}<main id="main" className="min-w-0 flex-1">{showPageBack && <PageBack />}{children}</main>{!isAdmin && !isGuidedFlow && <SiteFooter />}{!isAdmin && !isGuidedFlow && <MentorWidget />}</></SavedProvider>;
}
