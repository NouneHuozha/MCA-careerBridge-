"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowDownToLine, ExternalLink, Info, ShieldCheck } from "lucide-react";

const fields = [
  { name: "Application deadline", snapshot: "15 October 2026", proposed: "15 October 2026", state: "Needs review" },
  { name: "Scholarship cycle", snapshot: "2026–27", proposed: "2026–27", state: "Informational" },
  { name: "Application link", snapshot: "Not extracted", proposed: "Current approved link retained", state: "Needs review" },
];

const officialSourceUrl = "https://scholarships.gov.in/";

export function SourceSnapshotWorkspace() {
  const [notice, setNotice] = useState("");

  function downloadSample() {
    const sample = [
      "CareerBridge — Synthetic source snapshot example",
      "This is a generated sample, not a raw capture of the source website.",
      "Source: National Scholarship Portal",
      "Fetched: 12 October 2026, 04:08",
      "HTTP status: 200",
      "Content type: text/html",
      "Parser version: v1.4",
      "",
      "Excerpt — deadline section:",
      "Applications for the 2026–27 cycle are invited. Please refer to the current official notice for important dates and eligibility conditions.",
      "",
      "Extracted fields (sample):",
      ...fields.map((field) => `${field.name}: ${field.snapshot} | Proposed: ${field.proposed} | ${field.state}`),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([sample], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "sample-source-snapshot.txt";
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Downloaded a generated sample summary. No raw snapshot file is stored in this release.");
  }

  return <div className="space-y-4">
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#687970]"><Link href="/admin/sources" className="hover:text-[#145c42]">Sources</Link><span aria-hidden>/</span><Link href="/admin/sources/history" className="hover:text-[#145c42]">National Scholarship Portal</Link><span aria-hidden>/</span><Link href="/admin/sources/history" className="hover:text-[#145c42]">Fetch history</Link><span aria-hidden>/</span><span className="font-semibold text-[#263d32]">Snapshot</span></nav>
    <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#dce5e0] pb-4">
      <div><h1 className="text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Source snapshot</h1><p className="mt-1.5 max-w-3xl text-sm text-[#53665e]">Inspect the evidence captured during a fetch and compare it with extracted values.</p></div>
      <Link href="/admin/sources/history" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Back to fetch history</Link>
    </header>

    <div role="note" className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Reference example only.</strong> The metadata, excerpt, and extracted fields are synthetic. Raw source snapshots are not retained in this release; this page does not approve or publish any value.</p></div>
    {notice && <p role="status" className="rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2.5 text-xs leading-relaxed text-[#426652]">{notice}</p>}

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,.85fr)]">
      <div className="space-y-4">
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="snapshot-metadata-heading">
          <div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="snapshot-metadata-heading" className="text-base font-bold text-[#263d32]">Snapshot metadata</h2><p className="mt-0.5 text-xs text-[#687970]">National Scholarship Portal · automatic fetch evidence</p></div>
          <div className="overflow-x-auto px-4 py-3"><table className="w-full min-w-[680px] text-left text-xs"><tbody>
            <tr className="bg-[#f4f7f5] text-[11px] font-bold text-[#53665e]"><th className="px-2 py-2">Source URL</th><th className="px-2 py-2">Fetched at</th><th className="px-2 py-2">HTTP status</th><th className="px-2 py-2">Content type</th></tr>
            <tr className="border-b border-[#e7ece9] text-[#344b41]"><td className="break-all px-2 py-2.5">https://scholarships.gov.in/</td><td className="whitespace-nowrap px-2 py-2.5">12 October 2026, 04:08</td><td className="px-2 py-2.5">200</td><td className="px-2 py-2.5">text/html</td></tr>
            <tr className="bg-[#f4f7f5] text-[11px] font-bold text-[#53665e]"><th className="px-2 py-2">Content hash</th><th className="px-2 py-2">Parser version</th><th className="px-2 py-2" colSpan={2}>Fetch result · snapshot</th></tr>
            <tr className="text-[#344b41]"><td className="px-2 py-2.5">Sample: sha256: 84b19e58…c34a</td><td className="px-2 py-2.5">v1.4</td><td className="px-2 py-2.5">Successful response · extraction needs review</td><td className="px-2 py-2.5">Previous fetch</td></tr>
          </tbody></table></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="extracted-fields-heading">
          <div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="extracted-fields-heading" className="text-base font-bold text-[#263d32]">Extracted fields</h2><p className="mt-0.5 text-xs text-[#687970]">Fetched values remain evidence until approved.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-[#f4f7f5] text-[11px] font-bold text-[#53665e]"><tr><th className="px-3 py-2.5">Extracted field</th><th className="px-3 py-2.5">Snapshot value</th><th className="px-3 py-2.5">Proposed value</th><th className="px-3 py-2.5">Review state</th></tr></thead><tbody className="divide-y divide-[#e7ece9]">{fields.map((field) => <tr key={field.name}><td className="px-3 py-3 font-semibold text-[#344b41]">{field.name}</td><td className="px-3 py-3 text-[#53665e]">{field.snapshot}</td><td className="px-3 py-3 text-[#53665e]">{field.proposed}</td><td className="px-3 py-3"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${field.state === "Needs review" ? "bg-[#fff5df] text-[#94610c]" : "bg-[#edf4fb] text-[#3973a8]"}`}>{field.state}</span></td></tr>)}</tbody></table></div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="excerpt-heading"><div className="border-b border-[#e2e9e5] px-4 py-3"><h2 id="excerpt-heading" className="text-base font-bold text-[#263d32]">Relevant source excerpt</h2><p className="mt-0.5 text-xs text-[#687970]">Focused evidence view</p></div><div className="p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#687970]">Snapshot excerpt · deadline section</p><blockquote className="mt-2 rounded-lg border border-[#e2e9e5] bg-[#f7faf8] p-3 text-sm leading-relaxed text-[#344b41]">“Applications for the 2026–27 cycle are invited. Please refer to the current official notice for important dates and eligibility conditions.”</blockquote><p className="mt-2 text-[11px] leading-relaxed text-[#687970]">Excerpt shown for comparison; the full raw page is not available in this release.</p></div></section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="snapshot-actions-heading"><div className="border-b border-[#e2e9e5] pb-3"><h2 id="snapshot-actions-heading" className="text-base font-bold text-[#263d32]">Snapshot actions</h2><p className="mt-0.5 text-xs text-[#687970]">Previous fetch · evidence only, not a live source page</p></div><div className="mt-3 flex flex-wrap gap-2"><a href={officialSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><ExternalLink aria-hidden className="h-3.5 w-3.5" />Open original source</a><button type="button" onClick={downloadSample} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><ArrowDownToLine aria-hidden className="h-3.5 w-3.5" />Download snapshot</button><button type="button" onClick={() => setNotice("Preview only: no review item was created. Snapshot changes require an explicit human review workflow.")} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-[#12664f] px-3 text-xs font-bold text-white hover:bg-[#0d5742]">Create review item</button></div><p className="mt-3 rounded-lg border border-[#dce8e1] bg-[#f7faf8] px-3 py-2.5 text-xs leading-relaxed text-[#53665e]">This snapshot is evidence from a previous fetch. It is not automatically approved. Download generates a clearly labeled sample summary, not a raw capture.</p></section>

        <p className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-3 text-xs leading-relaxed text-[#426652]"><ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Student-facing values remain unchanged until a proposed change is reviewed and approved.</p>
      </aside>
    </div>
  </div>;
}
