import Link from "next/link";
import { BookOpen, ClipboardCheck, Clock3, FileUp, Link2, ListChecks, Search, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Review queue", href: "/admin", icon: ListChecks, key: "queue" },
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
}: {
  children: ReactNode;
  active?: "queue" | "catalogue" | "sources" | "imports" | "history" | "proposals" | "settings";
  breadcrumb: string;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#172b35] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#d7e1dc] bg-[#f8faf9] lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div>
          <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-[#d7e1dc] px-6" aria-label="CareerBridge Admin home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6a53] text-sm font-bold text-white">CB</span>
            <span className="leading-tight"><span className="block text-lg font-semibold tracking-[-0.04em] text-[#17392f]">CareerBridge</span><span className="text-xs font-medium text-[#52665d]">Admin workspace</span></span>
          </Link>
          <nav className="space-y-1 px-3 py-5" aria-label="Admin navigation">
            {navItems.map(({ label, href, icon: Icon, key }) => {
              const selected = active === key;
              return <Link key={key} href={href} aria-current={selected ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-[15px] font-semibold transition ${selected ? "border-[#12664f] bg-[#dff0e8] text-[#10573f] shadow-sm" : "border-transparent text-[#344d43] hover:bg-white hover:text-[#10573f]"}`}><Icon aria-hidden className="h-5 w-5" />{label}</Link>;
            })}
          </nav>
        </div>
        <div className="border-t border-[#d7e1dc] px-5 py-5 text-xs leading-relaxed text-[#52665d]">Evidence before publication.<br />Keep student-facing facts current.</div>
      </aside>
      <main className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-[#d7e1dc] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#344d43]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0efe8] text-xs font-bold text-[#10573f] lg:hidden">CB</span><span className="hidden sm:inline">CareerBridge Admin</span><span className="text-[#708178]">/</span><span className="text-[#17392f]">{breadcrumb}</span></div>
          <form action="/admin/search" className="relative hidden min-w-0 max-w-[440px] flex-1 md:block">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]" />
            <input type="search" name="q" aria-label="Search institutions, courses, or sources" placeholder="Search institutions, courses or sources…" className="h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm text-[#263b33] outline-none placeholder:text-[#687970] focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" />
          </form>
          <Link href="/admin/search" aria-label="Search admin catalogue" className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[#cbd8d2] text-[#344e47] hover:bg-[#f5f8f6] md:hidden"><Search aria-hidden className="h-4 w-4" /></Link>
          <div className="flex items-center gap-2 rounded-full border border-[#d7e1dc] bg-white px-2 py-1.5 text-sm font-semibold text-[#344e47]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e0efe8] text-xs font-bold text-[#245844]">AD</span><span className="pr-1">Admin</span></div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#d7e1dc] bg-white px-5 py-2.5 lg:hidden" aria-label="Admin navigation">
          {navItems.map(({ label, href, icon: Icon, key }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] font-semibold ${active === key ? "bg-[#dff0e8] text-[#10573f]" : "text-[#344d43] hover:bg-[#f1f5f3]"}`}><Icon aria-hidden className="h-4 w-4" />{label}</Link>)}
        </nav>
        <div className="px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9"><div className="mx-auto max-w-[1500px]">{children}</div></div>
      </main>
    </div>
  );
}
