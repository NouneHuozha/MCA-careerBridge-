"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpen, ClipboardCheck, Clock3, FileUp, Flag, Link2, ListChecks, Menu, Search, Settings, X } from "lucide-react";
import type { ReactNode } from "react";
import { AdminProfileMenu } from "@/components/admin/admin-profile-menu";

const navItems = [
  { label: "Review queue", href: "/admin", icon: ListChecks, key: "queue" },
  { label: "Feedback flags", href: "/admin/feedback-flags", icon: Flag, key: "flags" },
  { label: "Catalogue", href: "/admin/catalogue", icon: BookOpen, key: "catalogue" },
  { label: "Sources", href: "/admin/sources", icon: Link2, key: "sources" },
  { label: "Imports", href: "/admin/imports", icon: FileUp, key: "imports" },
  { label: "Change history", href: "/admin/change-history", icon: Clock3, key: "history" },
  { label: "Proposed changes", href: "/admin/change-history/proposed", icon: ClipboardCheck, key: "proposals" },
  { label: "Settings", href: "/admin/settings", icon: Settings, key: "settings" },
] as const;

export function AdminPortalShell({
  children,
  active = "catalogue",
  breadcrumb,
  referenceNav = false,
}: {
  children: ReactNode;
  active?: "queue" | "flags" | "catalogue" | "sources" | "imports" | "history" | "proposals" | "settings";
  breadcrumb: string;
  referenceNav?: boolean;
}) {
  const visibleNavItems = referenceNav ? navItems.filter(({ key }) => key !== "flags" && key !== "proposals") : navItems;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileItems = navItems.filter(({ key }) => key === "queue" || key === "catalogue" || key === "sources" || key === "settings");
  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#172b35] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#d7e1dc] bg-[#f8faf9] lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div>
          <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-[#d7e1dc] px-6" aria-label="CareerBridge Admin home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6a53] text-sm font-bold text-white">CB</span>
            <span className="leading-tight"><span className="block text-lg font-semibold tracking-[-0.04em] text-[#17392f]">CareerBridge</span><span className="text-xs font-medium text-[#52665d]">Admin workspace</span></span>
          </Link>
          <nav className="space-y-1 px-3 py-5" aria-label="Admin navigation">
            {visibleNavItems.map(({ label, href, icon: Icon, key }) => {
              const selected = active === key;
              return <Link key={key} href={href} aria-current={selected ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-[15px] font-semibold transition ${selected ? "border-[#12664f] bg-[#dff0e8] text-[#10573f] shadow-sm" : "border-transparent text-[#344d43] hover:bg-white hover:text-[#10573f]"}`}><Icon aria-hidden className="h-5 w-5" />{label}</Link>;
            })}
          </nav>
        </div>
        <div className="border-t border-[#d7e1dc] px-5 py-5 text-xs leading-relaxed text-[#52665d]">Evidence before publication.<br />Keep student-facing facts current.</div>
      </aside>
      <main className="min-w-0 pb-20 lg:pb-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#d7e1dc] bg-white px-4 sm:px-8">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5 lg:hidden" aria-label="CareerBridge Admin home">
            <span aria-hidden="true" className="relative h-0 w-0 border-b-[19px] border-l-[13px] border-r-[13px] border-b-[#14745b] border-l-transparent border-r-transparent after:absolute after:left-[-8px] after:top-[8px] after:border-b-[11px] after:border-l-[8px] after:border-r-[8px] after:border-b-[#53a383] after:border-l-transparent after:border-r-transparent" />
            <span className="truncate text-[17px] font-bold tracking-[-.03em] text-[#203c32]">CareerBridge</span><span className="text-xs text-[#687970]">Admin</span>
          </Link>
          <div className="hidden items-center gap-3 text-sm font-semibold text-[#344d43] lg:flex"><span>CareerBridge Admin</span><span className="text-[#708178]">/</span><span className="text-[#17392f]">{breadcrumb}</span></div>
          <form action="/admin/search" className="relative hidden min-w-0 max-w-[440px] flex-1 md:block">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]" />
            <input type="search" name="q" aria-label="Search institutions, courses, or sources" placeholder="Search institutions, courses or sources…" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm text-[#263b33] outline-none placeholder:text-[#687970] focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" />
          </form>
          <Link href="/admin/search" aria-label="Search admin catalogue" className="ml-auto hidden h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#cbd8d2] text-[#344e47] hover:bg-[#f5f8f6] md:grid lg:ml-0"><Search aria-hidden className="h-4 w-4" /></Link>
          <AdminProfileMenu />
          <button type="button" aria-label={mobileMenuOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={mobileMenuOpen} aria-controls="mobile-admin-navigation" onClick={() => setMobileMenuOpen((open) => !open)} className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#d7e1dc] text-[#344d43] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2 lg:hidden">{mobileMenuOpen ? <X aria-hidden className="h-5 w-5"/> : <Menu aria-hidden className="h-5 w-5"/>}</button>
        </header>
        {mobileMenuOpen && <><button type="button" aria-label="Close navigation menu" onClick={() => setMobileMenuOpen(false)} className="fixed inset-16 bottom-16 z-30 bg-[#10251d]/25 lg:hidden"/><nav id="mobile-admin-navigation" className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-8rem)] overflow-y-auto border-b border-[#d7e1dc] bg-[#f8faf9] p-3 shadow-lg lg:hidden" aria-label="Admin navigation">{visibleNavItems.map(({ label, href, icon: Icon, key }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`mb-1 flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${active === key ? "bg-[#dff0e8] text-[#10573f]" : "text-[#344d43] hover:bg-white"}`}><Icon aria-hidden className="h-5 w-5"/>{label}</Link>)}</nav></>}
        <div className="px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9"><div className="mx-auto max-w-[1500px]">{children}</div></div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-[#d7e1dc] bg-white/95 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur lg:hidden" aria-label="Primary mobile navigation">{mobileItems.map(({ label, href, icon: Icon, key }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold ${active === key ? "text-[#12664f]" : "text-[#687970]"}`}><Icon aria-hidden className="h-[18px] w-[18px]"/><span>{key === "queue" ? "Review" : key === "settings" ? "Settings" : label}</span></Link>)}</nav>
    </div>
  );
}
