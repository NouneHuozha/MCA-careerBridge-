"use client";

import { useState } from "react";
import { AlertTriangle, ArrowLeft, Building2, Check, ChevronDown, CirclePlay, Coins, ExternalLink, FileText, GraduationCap, Info, ListChecks } from "lucide-react";

type CheckStep = { title: string; detail: string };
type StartedDetail = {
  description: string;
  steps: CheckStep[];
  officialSourceHref: string;
};
type Item = { title: string; detail: string; icon: "document" | "graduation" | "coins"; startedDetail?: StartedDetail };
type ItemStatus = "todo" | "started" | "checked";

const icons = { document: FileText, graduation: GraduationCap, coins: Coins };
const statusNames: Record<ItemStatus, string> = { todo: "To check", started: "Started", checked: "Checked by you" };

export function PracticalChecklist({ items }: { items: Item[] }) {
  const [statuses, setStatuses] = useState<ItemStatus[]>(items.map(() => "todo"));
  const [open, setOpen] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [continueAnnouncement, setContinueAnnouncement] = useState("");
  const checkedCount = statuses.filter((status) => status === "checked").length;
  const activeItem = activeIndex === null ? undefined : items[activeIndex];
  const activeDetail = activeItem?.startedDetail;
  const activeStatus = activeIndex === null ? "todo" : statuses[activeIndex] ?? "todo";

  function setStatus(index: number, status: ItemStatus) {
    setStatuses((current) => current.map((value, itemIndex) => itemIndex === index ? status : value));
    setOpen(null);
  }

  function showCheck(index: number) {
    setActiveIndex(index);
    setContinueAnnouncement("");
  }

  function returnToChecklist() {
    setActiveIndex(null);
    setContinueAnnouncement("");
  }

  function continueCheck() {
    setContinueAnnouncement("Step 2 of 2: compare the current course and application details with the latest official notice. When you return to the checklist, you can mark it Checked by you; this still does not mean CareerBridge verified the information.");
    if (activeIndex !== null) {
      const nextStep = document.getElementById(`practical-check-step-${activeIndex}-1`);
      nextStep?.scrollIntoView({ behavior: "smooth", block: "center" });
      nextStep?.focus({ preventScroll: true });
    }
  }

  if (activeItem && activeDetail) {
    const activeMenuStatus = activeStatus === "checked" ? "Checked by you" : "Started";
    return <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(2.15rem,4vw,3.6rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">Practical checks</h1>
          <p className="mt-2 max-w-[980px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.35] text-[#596960]">A few small checks can help you understand what to verify before you decide.</p>
        </div>
        <button type="button" onClick={returnToChecklist} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-serif text-base font-semibold text-[#285e56] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
          <ArrowLeft aria-hidden className="h-5 w-5" />Back to practical checks
        </button>
      </header>

      <section aria-label="Example guidance record" className="mt-5 flex items-center gap-4 rounded-xl bg-[#eef5f2] px-5 py-4 sm:px-7">
        <span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e0f0e9] text-[#176b5d]"><Building2 className="h-7 w-7" /></span>
        <div><h2 className="font-serif text-xl font-semibold text-[#173d4a]">Example guidance record</h2><p className="mt-1 text-sm text-[#65766e]">Example record</p></div>
      </section>

      <article className="mt-5 grid gap-5 rounded-xl border border-[#e5e9e3] bg-white p-5 shadow-[0_5px_20px_-18px_rgba(40,69,60,.55)] sm:p-7 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,.72fr)]">
        <section aria-labelledby="practical-check-title">
          <div className="flex flex-wrap items-start gap-4 border-b border-[#e5e9e3] pb-5">
            <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#e6f3ed] text-[#176b5d]"><ListChecks className="h-8 w-8" strokeWidth={1.7} /></span>
            <div className="min-w-[220px] flex-1">
              <h2 id="practical-check-title" className="font-serif text-[clamp(1.4rem,2.2vw,1.9rem)] font-semibold leading-tight text-[#102c43]">{activeItem.title}</h2>
              <p className="mt-2 max-w-3xl font-serif text-base leading-relaxed text-[#68746d]">{activeDetail.description}</p>
            </div>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[#e5f2ed] px-4 font-serif text-sm font-semibold text-[#286b61]"><span aria-hidden className="h-3 w-3 rounded-full bg-[#2d8a78]" />{activeMenuStatus}</span>
          </div>

          <h3 className="mt-5 font-serif text-xl font-semibold text-[#173344]">Your steps</h3>
          <ol className="mt-4 space-y-5">
            {activeDetail.steps.map((step, index) => <li key={step.title} id={`practical-check-step-${activeIndex}-${index}`} tabIndex={index === 1 ? -1 : undefined} className={`flex gap-4 rounded-lg outline-none ${index === 1 ? "focus-visible:ring-2 focus-visible:ring-[#286b61] focus-visible:ring-offset-2" : ""}`}>
              <span aria-hidden className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-semibold ${index === 0 ? "bg-[#176b68] text-white" : "border-2 border-[#28736e] bg-white text-[#286b61]"}`}>
                {index === 0 ? <Check className="h-6 w-6" strokeWidth={2.5} /> : index + 1}
              </span>
              <div className="pt-1"><h4 className="font-serif text-lg font-semibold leading-snug text-[#263b46]">{step.title}</h4><p className="mt-1 text-sm leading-relaxed text-[#6e7973]">{step.detail}</p></div>
            </li>)}
          </ol>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={continueCheck} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#176b68] px-5 py-3 font-serif text-base font-semibold text-white transition hover:bg-[#105b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
              <CirclePlay aria-hidden className="h-5 w-5" />Continue this check
            </button>
            <a href={activeDetail.officialSourceHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[#28736e] px-5 py-3 font-serif text-base font-semibold text-[#235e5a] transition hover:bg-[#eef7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
              <ExternalLink aria-hidden className="h-5 w-5" />Open official source
            </a>
          </div>
          <p role="status" aria-live="polite" className={continueAnnouncement ? "mt-4 rounded-lg bg-[#eef7f2] p-4 text-sm leading-relaxed text-[#49645a]" : "sr-only"}>{continueAnnouncement}</p>
        </section>

        <aside className="space-y-4">
          <section aria-labelledby="verification-status-title" className="rounded-xl border border-[#eee3c9] bg-[#fffdfa] p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff1d9] text-[#c98215]"><AlertTriangle className="h-6 w-6" /></span>
              <div>
                <h3 id="verification-status-title" className="font-serif text-xl font-semibold text-[#34434a]">{activeStatus === "checked" ? "Checked by you" : "Awaiting verification"}</h3>
                <p className="mt-2 font-serif text-base leading-relaxed text-[#596960]">{activeStatus === "checked" ? "You marked this check as complete. CareerBridge has not independently verified every current detail." : "No current fact is confirmed in your checklist yet."}</p>
                <p className="mt-2 text-sm leading-relaxed text-[#738078]">Compare the details with the official institution source and the current admission notice.</p>
              </div>
            </div>
          </section>
          <section className="flex items-start gap-3 rounded-xl bg-[#f2f6f5] p-5 text-sm leading-relaxed text-[#64756d]">
            <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#71838b]" />
            <p>Starting a check does not mean you need to apply. It simply helps you verify information before you decide.</p>
          </section>
        </aside>
      </article>
    </>;
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
            <div className="flex w-full flex-wrap items-center justify-between gap-3 pl-10 sm:ml-auto sm:w-auto sm:justify-end sm:pl-0">
              <span className={`inline-flex min-h-10 min-w-[172px] items-center justify-center gap-2 rounded-full px-4 text-sm ${isChecked ? "bg-[#e5f4ed] font-medium text-[#286b61]" : isStarted ? "bg-[#e5f2ed] font-medium text-[#286b61]" : "bg-[#f1f3f1] text-[#56645d]"}`}>
                {isChecked ? <Check aria-hidden className="h-4 w-4" strokeWidth={2.5} /> : <span aria-hidden className="h-3 w-3 rounded-full bg-[#2d8a78]" />}{statusNames[status]}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {status === "todo" ? <button type="button" onClick={() => setStatus(index, "started")} className="inline-flex min-h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg border border-[#28736e] px-4 text-sm font-semibold text-[#235e5a] transition hover:bg-[#eef7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]"><CirclePlay aria-hidden className="h-4 w-4" />Mark as started</button> : <>
                  {item.startedDetail ? <button type="button" onClick={() => showCheck(index)} className="inline-flex min-h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg bg-[#176b68] px-4 text-sm font-semibold text-white transition hover:bg-[#105b59] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">{isStarted ? "Continue this check" : "Review this check"}</button> : null}
                  <div className="relative">
                    <button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} aria-controls={menuId} className="inline-flex min-h-11 min-w-[160px] items-center justify-center gap-2 rounded-lg border border-[#28736e] px-4 text-sm font-semibold text-[#235e5a] transition hover:bg-[#eef7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Change status<ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${open === index ? "rotate-180" : ""}`} /></button>
                    {open === index ? <div id={menuId} className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#dfe5df] bg-white p-1 text-sm shadow-lg">
                      {(["todo", "started", "checked"] as const).map((nextStatus) => <button key={nextStatus} type="button" onClick={() => setStatus(index, nextStatus)} aria-current={status === nextStatus ? "true" : undefined} className="flex min-h-10 w-full items-center justify-between rounded px-3 py-2 text-left text-[#33453d] hover:bg-[#eef6f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">{statusNames[nextStatus]}{status === nextStatus ? <Check aria-hidden className="h-4 w-4 text-[#176b5d]" /> : null}</button>)}
                    </div> : null}
                  </div>
                </>}
              </div>
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
