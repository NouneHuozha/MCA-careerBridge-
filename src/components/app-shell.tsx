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
  return <SavedProvider key={user?.email ?? "guest"} signedIn={Boolean(user)}><>{!isAdmin && <SiteNav user={user ? { name: user.name, email: user.email } : null} />}<main id="main" className="min-w-0 flex-1">{!isAdmin && <PageBack />}{children}</main>{!isAdmin && <SiteFooter />}{!isAdmin && <MentorWidget />}</></SavedProvider>;
}
