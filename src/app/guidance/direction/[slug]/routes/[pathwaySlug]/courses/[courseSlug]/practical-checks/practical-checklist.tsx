"use client";

import { useState } from "react";
import { Building2, Check, ChevronDown, CirclePlay, Coins, FileText, GraduationCap } from "lucide-react";

type Item = { title: string; detail: string; icon: "document" | "graduation" | "coins" };
type ItemStatus = "todo" | "started" | "checked";

const icons = { document: FileText, graduation: GraduationCap, coins: Coins };
const statusNames: Record<ItemStatus, string> = { todo: "To check", started: "Started", checked: "Checked by you" };

export function PracticalChecklist({ items }: { items: Item[] }) {
  const [statuses, setStatuses] = useState<ItemStatus[]>(items.map(() => "todo"));
  const [open, setOpen] = useState<number | null>(null);
  const checkedCount = statuses.filter((status) => status === "checked").length;

  function setStatus(index: number, status: ItemStatus) {
    setStatuses((current) => current.map((value, itemIndex) => itemIndex === index ? status : value));
    setOpen(null);
  }

  return <>
    <header className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,.62fr)] lg:gap-7">
      <div>
        <h1 className="font-serif text-[clamp(2.15rem,4vw,3.6rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">Your practical checks</h1>
        <p className="mt-2 max-w-[980px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.35] text-[#596960]">Small steps can help you understand your options. They don’t commit you to a direction.</p>
      </div>
      {checkedCount ? <aside aria-live="polite" className="flex min-h-[84px] items-center gap-4 rounded-xl bg-[#eef7f2] px-5 py-4">
        <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#d7eee4] text-[#176b5d]"><Check className="h-6 w-6" strokeWidth={2.5} /></span>
        <div><p className="font-serif text-[1.05rem] font-semibold text-[#173d4a]">{checkedCount === 1 ? "One check recorded" : `${checkedCount} checks recorded`}</p><p className="mt-1 text-sm leading-snug text-[#64756d]">Checked is a reminder you set; it does not mean CareerBridge verified the details.</p></div>
      </aside> : null}
    </header>

    <div className="mt-6 space-y-3">
      {items.map((item, index) => {
        const Icon = icons[item.icon];
        const status = statuses[index] ?? "todo";
        const isChecked = status === "checked";
        const isStarted = status === "started";
        const menuId = `practical-check-status-${index}`;
        return <article key={item.title} className="rounded-xl border border-[#e5e9e3] bg-white px-4 py-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.5)] sm:px-5">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="grid h-7 w-7 shrink-0 place-items-center"><span className="sr-only">Mark {item.title} checked</span><input type="checkbox" checked={isChecked} onChange={(event) => setStatus(index, event.currentTarget.checked ? "checked" : "todo")} className="h-5 w-5 rounded border-[#88948d] accent-[#176b5d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]" /></label>
            <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e6f3ed] text-[#176b5d]"><Icon className="h-6 w-6" strokeWidth={1.6} /></span>
            <div className="min-w-[220px] flex-1 py-1"><h2 className="font-serif text-[1.08rem] font-semibold leading-tight text-[#26312c]">{item.title}</h2><p className="mt-1.5 text-sm leading-relaxed text-[#6e7973]">{item.detail}</p></div>
            <div className="flex w-full items-center justify-between gap-3 pl-10 sm:ml-auto sm:w-auto sm:pl-0">
              <span className={`inline-flex min-h-10 min-w-[172px] items-center justify-center gap-2 rounded-full px-4 text-sm ${isChecked ? "bg-[#e5f4ed] font-medium text-[#286b61]" : isStarted ? "bg-[#fff5df] text-[#785c21]" : "bg-[#f1f3f1] text-[#56645d]"}`}>
                {isChecked ? <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} /> : <span aria-hidden className={`h-3 w-3 rounded-full ${isStarted ? "bg-[#c69127]" : "bg-[#aeb6b1]"}`} />}{statusNames[status]}
              </span>
              {status === "todo" ? <button type="button" onClick={() => setStatus(index, "started")} className="inline-flex min-h-11 min-w-[180px] items-center justify-center gap-2 rounded-lg border border-[#28736e] px-4 text-sm font-semibold text-[#235e5a] transition hover:bg-[#eef7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]"><CirclePlay aria-hidden className="h-4 w-4 fill-[#176b5d]" />Mark as started</button> : <div className="relative">
                <button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} aria-controls={menuId} className="inline-flex min-h-11 min-w-[180px] items-center justify-center gap-2 rounded-lg border border-[#28736e] px-4 text-sm font-semibold text-[#235e5a] transition hover:bg-[#eef7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Change status<ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>
                {open === index ? <div id={menuId} className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#dfe5df] bg-white p-1 text-sm shadow-lg">
                  {(["todo", "started", "checked"] as const).map((nextStatus) => <button key={nextStatus} type="button" onClick={() => setStatus(index, nextStatus)} aria-current={status === nextStatus ? "true" : undefined} className="flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-[#33453d] hover:bg-[#eef6f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">{statusNames[nextStatus]}{status === nextStatus ? <Check aria-hidden className="h-4 w-4 text-[#176b5d]" /> : null}</button>)}
                </div> : null}
              </div>}
            </div>
          </div>
        </article>;
      })}
    </div>
  </>;
}

export function ActionIcon({ kind }: { kind: "compare" | "institution" | "people" }) {
  if (kind === "compare") return <span aria-hidden className="text-xl text-[#176b5d]">⚖</span>;
  if (kind === "institution") return <Building2 aria-hidden className="h-5 w-5 text-[#176b5d]" />;
  return <span aria-hidden className="text-xl text-[#176b5d]">♟</span>;
}

export function CompletedMark() {
  return <span aria-hidden className="inline-flex items-center gap-1 text-xs text-[#176b5d]"><Check className="h-3.5 w-3.5" />Saved</span>;
}
