import Link from "next/link";
import { BookOpen, Clock3, FileUp, Link2, ListChecks, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Review queue", href: "/admin", icon: ListChecks, key: "queue" },
  { label: "Catalogue", href: "/admin/catalogue/institutions", icon: BookOpen, key: "catalogue" },
  { label: "Sources", href: "/admin/sources", icon: Link2, key: "sources" },
  { label: "Imports", href: "/admin/imports", icon: FileUp, key: "imports" },
  { label: "Change history", href: "/admin/change-history", icon: Clock3, key: "history" },
] as const;
const plannedItems = [
  { label: "Settings", icon: Settings },
];

export function AdminPortalShell({
  children,
  active = "catalogue",
  breadcrumb,
}: {
  children: ReactNode;
  active?: "queue" | "catalogue" | "sources" | "imports" | "history";
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
              return <Link key={key} href={href} aria-current={selected ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-sm font-semibold transition ${selected ? "border-[#12664f] bg-[#dff0e8] text-[#10573f] shadow-sm" : "border-transparent text-[#344d43] hover:bg-white hover:text-[#10573f]"}`}><Icon aria-hidden className="h-5 w-5" />{label}</Link>;
            })}
          </nav>
          <div className="px-5 pt-2">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[.12em] text-[#52665d]">More sections</p>
            <ul className="space-y-1">
              {plannedItems.map(({ label, icon: Icon }) => <li key={label} title={`${label} workflow is not available yet`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#687970]"><Icon aria-hidden className="h-4 w-4" />{label}<span className="ml-auto rounded-full bg-[#edf1ef] px-2 py-0.5 text-[10px] font-semibold text-[#56675f]">Planned</span></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#d7e1dc] px-5 py-5 text-xs leading-relaxed text-[#52665d]">Evidence before publication.<br />Keep student-facing facts current.</div>
      </aside>
      <main className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-[#d7e1dc] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3 text-sm font-semibold text-[#344d43]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0efe8] text-xs font-bold text-[#10573f] lg:hidden">CB</span><span className="hidden sm:inline">CareerBridge Admin</span><span className="text-[#708178]">/</span><span className="text-[#17392f]">{breadcrumb}</span></div>
          <div className="flex items-center gap-2 rounded-full border border-[#d7e1dc] bg-white px-2 py-1.5 text-sm font-semibold text-[#344e47]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e0efe8] text-xs font-bold text-[#245844]">AD</span><span className="pr-1">Admin</span></div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#d7e1dc] bg-white px-5 py-2.5 lg:hidden" aria-label="Admin navigation">
          {navItems.map(({ label, href, icon: Icon, key }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${active === key ? "bg-[#dff0e8] text-[#10573f]" : "text-[#344d43] hover:bg-[#f1f5f3]"}`}><Icon aria-hidden className="h-4 w-4" />{label}</Link>)}
        </nav>
        <div className="px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9"><div className="mx-auto max-w-[1500px]">{children}</div></div>
      </main>
    </div>
  );
}
