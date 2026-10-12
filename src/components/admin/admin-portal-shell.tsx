import Link from "next/link";
import { BookOpen, Clock3, FileUp, ListChecks, Link2, Settings } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { label: "Review queue", href: "/admin", icon: ListChecks, key: "queue" },
  { label: "Catalogue", href: "/admin/catalogue/institutions", icon: BookOpen, key: "catalogue" },
] as const;
const plannedItems = [
  { label: "Sources", icon: Link2 },
  { label: "Imports", icon: FileUp },
  { label: "Change history", icon: Clock3 },
  { label: "Settings", icon: Settings },
];

export function AdminPortalShell({
  children,
  active = "catalogue",
  breadcrumb,
}: {
  children: ReactNode;
  active?: "queue" | "catalogue";
  breadcrumb: string;
}) {
  return (
    <div className="min-h-screen bg-[#fbfcfb] text-[#172b35] lg:grid lg:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="hidden border-r border-[#e2e9e7] bg-[#f7faf9] lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
        <div>
          <Link href="/admin" className="flex h-20 items-center gap-3 border-b border-[#e2e9e7] px-6" aria-label="CareerBridge Admin home">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0e6a53] text-sm font-bold text-white">CB</span>
            <span className="leading-tight"><span className="block text-lg font-semibold tracking-[-0.04em] text-[#17392f]">CareerBridge</span><span className="text-xs text-[#668078]">Admin workspace</span></span>
          </Link>
          <nav className="space-y-1 px-3 py-5" aria-label="Admin navigation">
            {navItems.map(({ label, href, icon: Icon, key }) => {
              const selected = active === key;
              return <Link key={key} href={href} aria-current={selected ? "page" : undefined} className={`flex items-center gap-3 rounded-lg border-l-[3px] px-3 py-3 text-sm font-medium transition ${selected ? "border-[#17745a] bg-[#e8f4ef] text-[#17664f]" : "border-transparent text-[#425a55] hover:bg-white hover:text-[#17664f]"}`}><Icon aria-hidden className="h-5 w-5" />{label}</Link>;
            })}
          </nav>
          <div className="px-5 pt-2">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-[#84938f]">Workspace sections</p>
            <ul className="space-y-1">
              {plannedItems.map(({ label, icon: Icon }) => <li key={label} title={`${label} workflow is not available yet`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#8a9994]"><Icon aria-hidden className="h-4 w-4" />{label}<span className="ml-auto text-[10px]">Soon</span></li>)}
            </ul>
          </div>
        </div>
        <div className="border-t border-[#e2e9e7] px-5 py-5 text-xs leading-relaxed text-[#70837e]">Evidence before publication.<br />Keep student-facing facts current.</div>
      </aside>
      <main className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-[#e2e9e7] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-3 text-sm font-medium text-[#476059]"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e8f4ef] text-xs font-bold text-[#17664f] lg:hidden">CB</span><span className="hidden sm:inline">CareerBridge Admin</span><span className="text-[#a0afaa]">/</span><span className="text-[#17392f]">{breadcrumb}</span></div>
          <div className="flex items-center gap-2 rounded-full border border-[#e5ece9] bg-white px-2 py-1.5 text-sm text-[#344e47]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e9f0ed] text-xs font-semibold text-[#315d4e]">AD</span><span className="pr-1">Admin</span></div>
        </header>
        <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-8"><div className="mx-auto max-w-[1500px]">{children}</div></div>
      </main>
    </div>
  );
}
