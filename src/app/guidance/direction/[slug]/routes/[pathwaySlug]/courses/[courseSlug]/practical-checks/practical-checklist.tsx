"use client";

import { useState } from "react";
import { Building2, Check, ChevronDown, CirclePlay, Coins, FileText, GraduationCap } from "lucide-react";

type Item = { title: string; detail: string; icon: "document" | "graduation" | "coins" };

const icons = { document: FileText, graduation: GraduationCap, coins: Coins };

export function PracticalChecklist({ items }: { items: Item[] }) {
  const [started, setStarted] = useState<boolean[]>(items.map(() => false));
  const [done, setDone] = useState<boolean[]>(items.map(() => false));
  const [open, setOpen] = useState<number | null>(null);

  function toggleDone(index: number) {
    setDone((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value));
    setStarted((current) => current.map((value, itemIndex) => itemIndex === index ? true : value));
  }

  return <div className="space-y-3">{items.map((item, index) => {
    const Icon = icons[item.icon];
    const isDone = done[index];
    const isStarted = started[index];
    return <article key={item.title} className="rounded-xl border border-[#e5e9e3] bg-white px-5 py-4 shadow-[0_4px_18px_-18px_rgba(40,69,60,.5)]"><div className="flex flex-wrap items-center gap-4"><label className="grid h-7 w-7 shrink-0 place-items-center"><span className="sr-only">Mark {item.title} complete</span><input type="checkbox" checked={isDone} onChange={() => toggleDone(index)} className="h-5 w-5 rounded border-[#88948d] accent-[#176b5d]" /></label><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e6f3ed] text-[#176b5d]"><Icon className="h-6 w-6" strokeWidth={1.6} /></span><div className="min-w-[220px] flex-1"><h3 className={`font-serif text-[1.08rem] font-semibold leading-tight ${isDone ? "text-[#718078] line-through" : "text-[#26312c]"}`}>{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-[#6e7973]">{item.detail}</p></div><div className="flex items-center gap-3 sm:ml-auto"><div className="relative"><button type="button" onClick={() => setOpen(open === index ? null : index)} aria-expanded={open === index} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#f1f3f1] px-4 text-sm text-[#56645d]"><span aria-hidden className={`h-3 w-3 rounded-full ${isDone ? "bg-[#2d8b72]" : isStarted ? "bg-[#c69127]" : "bg-[#aeb6b1]"}`} />{isDone ? "Done" : isStarted ? "Started" : "To check"}<ChevronDown aria-hidden className="h-4 w-4" /></button>{open === index ? <div className="absolute right-0 z-10 mt-2 w-32 rounded-lg border border-[#dfe5df] bg-white p-1 text-sm shadow-lg"><button type="button" onClick={() => { setStarted((current) => current.map((value, itemIndex) => itemIndex === index ? false : value)); setDone((current) => current.map((value, itemIndex) => itemIndex === index ? false : value)); setOpen(null); }} className="block w-full rounded px-3 py-2 text-left hover:bg-[#eef6f1]">To check</button><button type="button" onClick={() => { setStarted((current) => current.map((value, itemIndex) => itemIndex === index ? true : value)); setDone((current) => current.map((value, itemIndex) => itemIndex === index ? false : value)); setOpen(null); }} className="block w-full rounded px-3 py-2 text-left hover:bg-[#eef6f1]">Started</button></div> : null}</div><button type="button" onClick={() => setStarted((current) => current.map((value, itemIndex) => itemIndex === index ? true : value))} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#28736e] px-4 text-sm font-semibold text-[#235e5a] transition hover:bg-[#eef7f2]"><CirclePlay className="h-4 w-4 fill-[#176b5d]" />{isStarted ? "Started" : "Mark as started"}</button></div></div></article>;
  })}</div>;
}

export function ActionIcon({ kind }: { kind: "compare" | "institution" | "people" }) {
  if (kind === "compare") return <span aria-hidden className="text-xl text-[#176b5d]">⚖</span>;
  if (kind === "institution") return <Building2 aria-hidden className="h-5 w-5 text-[#176b5d]" />;
  return <span aria-hidden className="text-xl text-[#176b5d]">♟</span>;
}

export function CompletedMark() {
  return <span aria-hidden className="inline-flex items-center gap-1 text-xs text-[#176b5d]"><Check className="h-3.5 w-3.5" />Saved</span>;
}
