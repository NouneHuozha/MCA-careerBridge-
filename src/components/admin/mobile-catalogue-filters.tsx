"use client";

import { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";

export type MobileSearchOption = { value: string; label: string };
type Props = {
  query: string;
  recordType: string;
  district: string;
  status: string;
  recordTypes: MobileSearchOption[];
  districts: MobileSearchOption[];
  statuses: MobileSearchOption[];
};

export function MobileCatalogueFilters({ query, recordType, district, status, recordTypes, districts, statuses }: Props) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return <>
    <form action="/admin/search" className="flex gap-2 lg:hidden">
      <label className="relative min-w-0 flex-1"><span className="sr-only">Search catalogue</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]"/><input type="search" name="q" defaultValue={query} placeholder="Search records" className="h-11 w-full rounded-lg border border-[#d2dcd7] bg-white pl-9 pr-3 text-sm text-[#263b33] outline-none focus:border-[#27765c] focus:ring-2 focus:ring-[#d4eee2]"/></label>
      <input type="hidden" name="type" value={recordType}/><input type="hidden" name="district" value={district}/><input type="hidden" name="status" value={status}/>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f4f7f5]"><Filter aria-hidden className="h-4 w-4"/>Filters</button>
    </form>
    {open && <div className="fixed inset-0 z-[60] lg:hidden">
      <button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="absolute inset-0 bg-[#162820]/30"/>
      <section role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title" className="absolute inset-y-0 right-0 flex w-[min(86vw,360px)] flex-col overflow-y-auto bg-white p-5 shadow-2xl">
        <header className="flex items-center justify-between"><h2 id="mobile-filter-title" className="text-xl font-bold text-[#263d32]">Filters</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-lg text-[#344b41] hover:bg-[#f1f5f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]"><X aria-hidden className="h-5 w-5"/></button></header>
        <form action="/admin/search" className="mt-5 flex flex-1 flex-col">
          <label className="mb-4 block text-sm font-medium text-[#687970]">Record type<select name="type" defaultValue={recordType} className="mt-2 h-12 w-full rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] focus:border-[#27765c] focus:outline-none focus:ring-2 focus:ring-[#d4eee2]">{recordTypes.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="mb-4 block text-sm font-medium text-[#687970]">Status<select name="status" defaultValue={status} className="mt-2 h-12 w-full rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] focus:border-[#27765c] focus:outline-none focus:ring-2 focus:ring-[#d4eee2]">{statuses.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="mb-4 block text-sm font-medium text-[#687970]">District<select name="district" defaultValue={district} className="mt-2 h-12 w-full rounded-lg border border-[#d2dcd7] bg-white px-3 text-sm text-[#344b41] focus:border-[#27765c] focus:outline-none focus:ring-2 focus:ring-[#d4eee2]">{districts.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="relative mb-5 block"><span className="sr-only">Search records</span><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]"/><input type="search" name="q" defaultValue={query} placeholder="Search records" className="h-12 w-full rounded-lg border border-[#d2dcd7] bg-white pl-9 pr-3 text-sm text-[#344b41]"/></label>
          <div className="grid grid-cols-[1fr_auto] gap-2"><button type="submit" className="min-h-11 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Apply filters</button><a href={query ? `/admin/search?q=${encodeURIComponent(query)}` : "/admin/search"} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344b41] hover:bg-[#f4f7f5]">Clear filters</a></div>
        </form>
      </section>
    </div>}
  </>;
}
