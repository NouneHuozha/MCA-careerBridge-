import { AlertTriangle, CheckCircle2, CircleHelp, ShieldCheck } from "lucide-react";

const rows = [
  { field: "Institution name", value: "Government College, Kohima", source: "Sample record", state: "Verified", action: "View", tone: "green" },
  { field: "District", value: "Kohima", source: "Not checked", state: "Needs verification", action: "Review", tone: "amber" },
  { field: "Admission dates", value: "Not currently available", source: "No current notice attached", state: "Not currently available", action: "Add source", tone: "muted" },
  { field: "Contact phone", value: "Last approved value retained", source: "Source unavailable", state: "Source unavailable", action: "Open source", tone: "red" },
  { field: "Hostel information", value: "Not currently available", source: "Not attached", state: "Not currently available", action: "Add source", tone: "muted" },
] as const;

const stateStyle = {
  green: "bg-[#e8f4ed] text-[#17634b]",
  amber: "bg-[#fff5df] text-[#94610c]",
  muted: "bg-[#f1f4f2] text-[#53665e]",
  red: "bg-[#fde8e8] text-[#a13e3e]",
} as const;

export function PartialDataStatePreview() {
  return <div className="space-y-5">
    <header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue <span aria-hidden="true">/</span> Institutions <span aria-hidden="true">/</span> preview</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Institution detail</h1></header>
    <section role="status" className="flex items-start gap-3 rounded-lg border border-[#e9d7a9] bg-[#fff8e8] px-4 py-3 text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0"/><div><p className="text-sm font-bold">Some information is not currently available</p><p className="mt-0.5 text-xs leading-relaxed">We retained the last approved information where available. Check the official source before updating or publishing.</p></div><span className="ml-auto rounded-full border border-[#e4d5ad] bg-white/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">Sample preview</span></section>

    <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="institution-details-title"><div className="border-b border-[#e2e9e5] px-4 py-3.5"><h2 id="institution-details-title" className="font-bold text-[#263d32]">Institution details</h2><p className="mt-1 text-xs text-[#687970]">Partial-data state · missing fields are not negative claims</p></div><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#f3f6f4] text-xs font-bold text-[#53665e]"><tr><th scope="col" className="px-3 py-3">Field</th><th scope="col" className="px-3 py-3">Current value</th><th scope="col" className="px-3 py-3">Source / freshness</th><th scope="col" className="px-3 py-3">State</th><th scope="col" className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-[#e5ebe8]">{rows.map((row) => <tr key={row.field} className="align-middle"><th scope="row" className="px-3 py-3.5 font-medium text-[#34443c]">{row.field}</th><td className="px-3 py-3.5 text-[#34443c]">{row.value}</td><td className="px-3 py-3.5 text-xs text-[#687970]">{row.source}</td><td className="px-3 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${stateStyle[row.tone]}`}>{row.state}</span></td><td className="px-3 py-3.5"><button type="button" disabled title="Actions are disabled in this sample preview" className="min-h-8 cursor-not-allowed rounded-md border border-[#d4dfda] bg-[#f7f9f8] px-3 text-xs font-semibold text-[#87948d]">{row.action}</button></td></tr>)}</tbody></table></div></section>

    <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm" aria-labelledby="safe-handling-title"><h2 id="safe-handling-title" className="font-bold text-[#263d32]">Safe handling</h2><div className="mt-3 flex flex-wrap gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f4ed] px-3 py-1.5 text-xs font-bold text-[#17634b]"><CheckCircle2 aria-hidden className="h-3.5 w-3.5"/>Last approved values retained</span><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf2fb] px-3 py-1.5 text-xs font-bold text-[#3569a5]"><ShieldCheck aria-hidden className="h-3.5 w-3.5"/>No unsupported negative claims</span></div><p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#687970]"><CircleHelp aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>“Not currently available” is distinct from “Not offered” or “Not required.” These rows are illustrative and are not loaded from the live catalogue.</p></section>
  </div>;
}
