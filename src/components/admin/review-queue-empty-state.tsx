import Link from "next/link";
import { Activity, CheckCircle2, GraduationCap } from "lucide-react";

export function ReviewQueueEmptyState() {
  return <div className="min-h-[560px]">
    <header className="border-b border-[#dce5e0] pb-5"><p className="text-xs text-[#687970]">Review queue</p><h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27]">Review queue</h1></header>
    <div className="flex min-h-[460px] items-center justify-center px-4 py-10">
      <section className="w-full max-w-[680px] rounded-2xl border border-[#e1e8e4] bg-white px-6 py-10 text-center shadow-sm sm:px-10" aria-labelledby="queue-empty-title">
        <span aria-hidden="true" className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#e8f5ee] text-[#17634b]"><CheckCircle2 className="h-7 w-7" /></span>
        <h2 id="queue-empty-title" className="mt-5 text-xl font-bold tracking-tight text-[#263d32] sm:text-2xl">Nothing needs your attention right now</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#687970]">No review items are currently recorded. New changes and issues will appear here when they need review.</p>
        <p className="mx-auto mt-2 max-w-lg text-xs leading-relaxed text-[#687970]">Automatic source checks are not connected in this release, so this clear queue does not confirm that sources were checked.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2"><Link href="/admin/catalogue" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38]"><GraduationCap aria-hidden className="h-4 w-4" />View catalogue</Link><Link href="/admin/sources/activity" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><Activity aria-hidden className="h-4 w-4" />View source activity</Link></div>
      </section>
    </div>
  </div>;
}
