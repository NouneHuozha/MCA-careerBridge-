import Link from "next/link";
import { AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";

export function CatalogueNetworkErrorPreview() {
  return <section className="mx-auto flex min-h-[min(68vh,720px)] w-full items-center justify-center py-8" aria-labelledby="catalogue-error-title">
    <div className="w-full max-w-[470px] rounded-xl border border-[#dfe7e2] bg-white px-6 py-8 text-center shadow-[0_8px_28px_rgba(23,43,53,.06)] sm:px-10 sm:py-9">
      <span aria-hidden="true" className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff3d6] text-[#94610c]"><AlertTriangle className="h-5 w-5" /></span>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[.12em] text-[#8a671f]">Preview state · no live request made</p>
      <h1 id="catalogue-error-title" className="mt-3 text-xl font-bold tracking-tight text-[#17392f] sm:text-[22px]">We could not load this information</h1>
      <p className="mt-2 text-sm leading-relaxed text-[#64736c]">Check your connection and try again. No catalogue data was changed.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link href="/admin/catalogue" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2"><RotateCcw aria-hidden className="h-4 w-4" />Try again</Link>
        <Link href="/admin" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#344b41] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2">Go to review queue<ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </div>
      <p className="mt-5 text-xs leading-relaxed text-[#7a8881]">This preview leaves the current page unchanged. Retry opens the catalogue and requests its current data.</p>
    </div>
  </section>;
}
