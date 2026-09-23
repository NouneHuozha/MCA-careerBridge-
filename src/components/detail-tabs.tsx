"use client";

import { useEffect, useId, useState, type ReactNode } from "react";
import { BookOpen, BriefcaseBusiness, Route, HeartHandshake, Building2, ShieldCheck, GraduationCap, Wallet, FileText, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = { overview: BookOpen, careers: BriefcaseBusiness, pathways: Route, reflect: HeartHandshake, institutions: Building2, sources: ShieldCheck, courses: GraduationCap, fees: Wallet, admission: FileText };
export type DetailTab = { id: string; label: string; icon?: string; content: ReactNode };

/** One topic at a time. Real tabs with keyboard navigation and URL deep links. */
export function DetailTabs({ tabs, label = "Explore this topic" }: { tabs: DetailTab[]; label?: string }) {
  const unique = useId().replace(/:/g, "");
  const [active, setActive] = useState(tabs[0]?.id);
  useEffect(() => {
    const selectHash = () => {
      const hash = window.location.hash.slice(1);
      if (tabs.some((tab) => tab.id === hash)) setActive(hash);
    };
    const timer = window.setTimeout(selectHash, 0);
    window.addEventListener("hashchange", selectHash);
    return () => { window.clearTimeout(timer); window.removeEventListener("hashchange", selectHash); };
  }, [tabs]);
  function select(id: string, focus = false) {
    setActive(id);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}#${id}`);
    if (focus) document.getElementById(`${unique}-tab-${id}`)?.focus();
  }
  return (
    <div className="min-w-0">
      <div className="cb-tablist" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => {
          const Icon = icons[tab.icon ?? tab.id] ?? BookOpen;
          return <button key={tab.id} id={`${unique}-tab-${tab.id}`} role="tab" aria-selected={active === tab.id} aria-controls={`${unique}-panel-${tab.id}`} tabIndex={active === tab.id ? 0 : -1} className="cb-tab" onClick={() => select(tab.id)} onKeyDown={(event) => {
            let next = index;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault(); select(tabs[next].id, true);
          }}><Icon aria-hidden className="h-4 w-4 shrink-0" />{tab.label}</button>;
        })}
      </div>
      {tabs.map((tab) => <section key={tab.id} id={`${unique}-panel-${tab.id}`} role="tabpanel" aria-labelledby={`${unique}-tab-${tab.id}`} tabIndex={0} hidden={active !== tab.id} className="cb-tabpanel animate-fade">{tab.content}</section>)}
    </div>
  );
}
