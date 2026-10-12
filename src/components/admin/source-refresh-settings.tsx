"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CalendarClock, Check, CircleAlert, Clock3, FileText, Info, LoaderCircle, Pause, Play, ShieldCheck } from "lucide-react";
import type { SourceItem } from "@/components/admin/sources-workspace";

type Props = { source: SourceItem; initialEnabled: boolean; initialFrequency: string; recordedSettingAt: string | null };
const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "manual", label: "Manual only" },
] as const;
const statusLabel = (status: SourceItem["status"]) => status === "healthy" ? "Healthy" : status === "unavailable" ? "Unavailable" : "Needs review";
const statusStyle = (status: SourceItem["status"]) => status === "healthy" ? "border-[#c6e4d3] bg-[#e8f5ee] text-[#17634b]" : status === "unavailable" ? "border-[#f0c9c5] bg-[#fff0ee] text-[#a23e38]" : "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
function formatDate(value: string | null) {
  if (!value) return "No check recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No check recorded" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function SourceRefreshSettings({ source, initialEnabled, initialFrequency, recordedSettingAt }: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [frequency, setFrequency] = useState(initialFrequency);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (enabled && frequency === "manual") {
      setError("Choose a scheduled frequency or turn automatic refresh off.");
      return;
    }
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/admin/sources/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceKey: source.sourceKey, refreshEnabled: enabled, refreshFrequency: frequency }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; updatedAt?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save source refresh settings.");
      setMessage(enabled && frequency !== "manual"
        ? "Refresh preference saved. No automatic check is scheduled until the fetch scheduler is connected."
        : "Refresh preference saved. This source will not be checked automatically.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save source refresh settings.");
    } finally {
      setBusy(false);
    }
  }

  const configured = enabled && frequency !== "manual";
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/sources" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><ArrowLeft className="h-4 w-4" />Back to sources</Link>
      <a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Open source<ArrowUpRight className="h-4 w-4" /><span className="sr-only"> (opens in a new tab)</span></a>
    </div>

    <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex min-w-0 items-center gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8f5ee] text-[#17634b]"><FileText className="h-6 w-6" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Sources / Refresh settings</p><h1 className="mt-1 break-words text-2xl font-bold tracking-[-.03em] text-[#142e27] sm:text-3xl">{source.title}</h1><p className="mt-1 text-sm text-[#596a63]">{source.sourceType.replaceAll("_", " ")} · Used by {source.recordNames.length} catalogue {source.recordNames.length === 1 ? "record" : "records"}</p></div></div>
      <span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusStyle(source.status)}`}><span className="h-2 w-2 rounded-full bg-current" />{statusLabel(source.status)}</span>
    </header>

    {message && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#c8ded3] bg-[#eef7f2] px-4 py-3 text-sm text-[#245844]"><Check className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}
    {error && <div role="alert" className="flex items-start gap-2 rounded-lg border border-[#f0c9c5] bg-[#fff0ee] px-4 py-3 text-sm text-[#87382e]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="refresh-title">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8f5ee] text-[#17634b]"><CalendarClock className="h-5 w-5" /></span><div><h2 id="refresh-title" className="text-lg font-bold text-[#172b35]">Automatic refresh</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">Choose the intended refresh cadence for this source.</p></div></div>
        <form onSubmit={save} className="mt-5">
          <label className="flex cursor-pointer items-center gap-3 border-y border-[#edf1ef] py-4">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="peer sr-only" aria-describedby="refresh-disclaimer" />
            <span aria-hidden className={`relative h-7 w-12 shrink-0 rounded-full transition ${enabled ? "bg-[#0e8064]" : "bg-[#bdc8c2]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${enabled ? "left-6" : "left-1"}`} /></span>
            <span className="text-sm font-semibold text-[#263b33]">Configure automatic refresh</span>
            <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${configured ? "bg-[#fff6df] text-[#805d13]" : "bg-[#edf1ef] text-[#56675f]"}`}>{configured ? "Preference saved · not active" : "Off"}</span>
          </label>
          <label className="mt-4 block text-sm font-semibold text-[#344e47]">Refresh frequency<select value={frequency} onChange={(event) => setFrequency(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]">{frequencies.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <div className="mt-4 grid gap-x-5 gap-y-3 rounded-lg bg-[#f6f8f7] p-4 text-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div><p className="text-xs font-semibold text-[#687970]">Next scheduled refresh</p><p className="mt-1 font-medium text-[#263b33]">Not scheduled</p></div>
            <div><p className="text-xs font-semibold text-[#687970]">Last successful refresh</p><p className="mt-1 font-medium text-[#263b33]">No automated run recorded</p></div>
            <div><p className="text-xs font-semibold text-[#687970]">Last recorded source check</p><p className="mt-1 font-medium text-[#263b33]">{formatDate(source.lastCheckedAt)}{source.lastCheckType ? ` · ${source.lastCheckType.toLowerCase()}` : ""}</p></div>
            <div><p className="text-xs font-semibold text-[#687970]">Fetch method</p><p className="mt-1 font-medium text-[#263b33]">Manual review only</p></div>
          </div>
          <p id="refresh-disclaimer" className="mt-4 flex items-start gap-2 rounded-lg border border-[#ead8a9] bg-[#fff8e7] p-3 text-xs leading-relaxed text-[#62430b]"><Info className="mt-0.5 h-4 w-4 shrink-0" />The refresh scheduler and source fetcher are not connected in this release. Saving a cadence records your preference only; it does not start a background job or change catalogue data.</p>
          {recordedSettingAt && <p className="mt-3 text-xs text-[#687970]">Settings last saved {formatDate(recordedSettingAt)}.</p>}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ef] pt-4">
            <span className="text-xs text-[#687970]">Changes are recorded in Change history.</span>
            <button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#095640] disabled:cursor-wait disabled:opacity-70">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save settings</button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="workflow-title">
        <h2 id="workflow-title" className="text-lg font-bold text-[#172b35]">How updates will work</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">When scheduled fetching is available, a source check will follow this review-first flow.</p>
        <ol className="mt-5 space-y-4">
          {[{ title: "Fetch source", text: "Retrieve the latest information using a configured source-specific method.", icon: Play }, { title: "Compare with approved data", text: "Detect candidate changes without replacing published catalogue values.", icon: Clock3 }, { title: "Review important changes", text: "Send material changes to an administrator for approval before students see them.", icon: ShieldCheck }].map(({ title, text, icon: Icon }, index) => <li key={title} className="flex gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8f5ee] text-[#17634b]"><Icon className="h-4 w-4" /></span><div><p className="font-semibold text-[#263b33]"><span className="mr-2 text-[#17634b]">{index + 1}.</span>{title}</p><p className="mt-1 text-sm leading-relaxed text-[#596a63]">{text}</p></div></li>)}
        </ol>
      </section>
    </div>

    <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-labelledby="history-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e0] px-5 py-4"><div><h2 id="history-title" className="text-lg font-bold text-[#172b35]">Recent refreshes</h2><p className="mt-1 text-sm text-[#596a63]">Automated attempts for this source</p></div><Link href="/admin/change-history" className="text-sm font-semibold text-[#17634b] underline underline-offset-2">View change history</Link></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th scope="col" className="px-4 py-3">Date</th><th scope="col" className="px-4 py-3">Result</th><th scope="col" className="px-4 py-3">Changes</th><th scope="col" className="px-4 py-3">Duration</th></tr></thead><tbody><tr><td colSpan={4} className="px-4 py-10 text-center"><span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#f0f4f2] text-[#526a7b]"><Pause className="h-4 w-4" /></span><p className="mt-3 font-semibold text-[#344e47]">No refresh attempts recorded</p><p className="mt-1 text-sm text-[#718078]">Manual checks and automated run history are not stored by the current app.</p></td></tr></tbody></table></div>
    </section>

    <aside className="flex items-start gap-3 rounded-xl border border-[#d4e3da] bg-[#f3f8f5] p-4 sm:p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#17634b]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-bold text-[#172b35]">Refresh policy</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">Approved data remains student-visible while proposed changes wait for review. A temporary source failure must never erase the last approved information.</p></div></aside>
  </div>;
}
