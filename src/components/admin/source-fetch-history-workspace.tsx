"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  Info,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type FetchAttempt = {
  id: "latest" | "extraction-error" | "unavailable";
  date: string;
  result: string;
  resultTone: "success" | "error" | "warning";
  httpStatus: string;
  recordsFound: string;
  changesDetected: string;
  parserVersion: string;
  duration: string;
};

const attempts: FetchAttempt[] = [
  { id: "extraction-error", date: "13 Oct 2026, 04:10", result: "Extraction failed", resultTone: "error", httpStatus: "200", recordsFound: "7 observed", changesDetected: "Not evaluated", parserVersion: "v1.4", duration: "2.4s" },
  { id: "latest", date: "12 Oct 2026, 04:08", result: "Successful", resultTone: "success", httpStatus: "200", recordsFound: "7", changesDetected: "1 needs review", parserVersion: "v1.4", duration: "2.7s" },
  { id: "unavailable", date: "11 Oct 2026, 04:09", result: "Unavailable", resultTone: "warning", httpStatus: "timeout", recordsFound: "—", changesDetected: "—", parserVersion: "v1.4", duration: "—" },
];

const resultStyles: Record<FetchAttempt["resultTone"], string> = {
  success: "border-[#c6e4d3] bg-[#e8f5ee] text-[#17634b]",
  error: "border-[#efc9c4] bg-[#fff0ee] text-[#a23e38]",
  warning: "border-[#ead8a9] bg-[#fff6df] text-[#805d13]",
};

export function SourceFetchHistoryWorkspace() {
  const [selectedId, setSelectedId] = useState<FetchAttempt["id"]>("extraction-error");
  const [notice, setNotice] = useState("");
  const [showSnapshot, setShowSnapshot] = useState(false);
  const selected = attempts.find((attempt) => attempt.id === selectedId) ?? attempts[1];

  function previewAction(action: string) {
    setNotice(`${action} is a preview only. The source fetcher and extraction service are not connected, so no fetch, catalogue edit, or audit event was created.`);
  }

  function openSource() {
    window.open("https://scholarships.gov.in/", "_blank", "noopener,noreferrer");
    previewAction("The official source opened in a new tab");
  }

  return <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#687970]">
      <Link href="/admin/sources" className="hover:text-[#145c42]">Sources</Link>
      <span aria-hidden>/</span>
      <span>National Scholarship Portal</span>
      <span aria-hidden>/</span>
      <span className="font-semibold text-[#263d32]">Fetch history</span>
    </div>

    <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[#dce5e0] pb-4">
      <div>
        <h1 className="text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Fetch history</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-[#53665e]">See automatic refresh results, extracted records, and source errors over time.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={openSource} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><Play aria-hidden className="h-4 w-4" />Run check now</button>
        <Link href="/admin/sources" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Edit source</Link>
      </div>
    </header>

    <div role="note" className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652]">
      <Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
      <p><strong>Reference example only.</strong> The history and metadata below are synthetic UI data, not real fetches. Automatic fetching, snapshots, and extraction are not connected in this release; the controls below do not change saved data.</p>
    </div>
    {notice && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#d6e6dc] bg-[#f2f8f4] px-3 py-2 text-xs leading-relaxed text-[#426652"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />{notice}<button type="button" onClick={() => setNotice("")} className="ml-auto font-semibold underline" aria-label="Dismiss message">Dismiss</button></div>}

    <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(390px,.85fr)]">
      <div className="space-y-3">
        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="source-summary-heading">
          <div className="border-b border-[#e2e9e5] px-4 py-3">
            <h2 id="source-summary-heading" className="text-base font-bold text-[#263d32]">National Scholarship Portal</h2>
            <p className="mt-0.5 text-[11px] text-[#687970]">Government portal · reference schedule only</p>
          </div>
          <dl className="grid gap-x-5 gap-y-3 px-4 py-3 text-xs sm:grid-cols-2">
            <div><dt className="text-[#687970]">Automatic refresh</dt><dd className="mt-0.5 font-semibold text-[#344b41]">Enabled · sample preference</dd></div>
            <div><dt className="text-[#687970]">Frequency</dt><dd className="mt-0.5 font-semibold text-[#344b41]">Daily</dd></div>
            <div><dt className="text-[#687970]">Next scheduled refresh</dt><dd className="mt-0.5 font-semibold text-[#344b41]">Tomorrow, 04:00 · sample only</dd></div>
            <div><dt className="text-[#687970]">Source</dt><dd className="mt-0.5 font-semibold text-[#344b41]">National Scholarship Portal</dd></div>
          </dl>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby="fetch-history-heading">
          <div className="border-b border-[#e2e9e5] px-3 py-2.5">
            <h2 id="fetch-history-heading" className="text-base font-bold text-[#263d32]">Fetch history</h2>
            <p className="mt-0.5 text-[11px] text-[#687970]">Three recent attempts · synthetic reference rows</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[830px] text-left text-[11px]">
              <thead className="bg-[#f4f7f5] font-bold text-[#53665e]"><tr>{["Date/time", "Result", "HTTP / status", "Records found", "Changes detected", "Parser version", "Duration", "Action"].map((label) => <th key={label} className="whitespace-nowrap px-2 py-2">{label}</th>)}</tr></thead>
              <tbody className="divide-y divide-[#e6ece8]">
                {attempts.map((attempt) => <tr key={attempt.id} className={attempt.id === selectedId ? "bg-[#f6faf7]" : "hover:bg-[#fbfcfb]"}>
                  <td className="whitespace-nowrap px-2 py-2.5 text-[#53665e]">{attempt.date}</td>
                  <td className="px-2 py-2.5"><span className={`inline-flex whitespace-nowrap items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${resultStyles[attempt.resultTone]}`}>{attempt.resultTone === "success" ? <CheckCircle2 aria-hidden className="h-3 w-3" /> : attempt.resultTone === "error" ? <XCircle aria-hidden className="h-3 w-3" /> : <AlertTriangle aria-hidden className="h-3 w-3" />}{attempt.result}</span></td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-[#53665e]">{attempt.httpStatus}</td>
                  <td className="px-2 py-2.5 text-[#53665e]">{attempt.recordsFound}</td>
                  <td className="whitespace-nowrap px-2 py-2.5 text-[#53665e]">{attempt.changesDetected}</td>
                  <td className="px-2 py-2.5 text-[#53665e]">{attempt.parserVersion}</td>
                  <td className="px-2 py-2.5 text-[#53665e]">{attempt.duration}</td>
                  <td className="px-2 py-2.5"><button type="button" onClick={() => { setSelectedId(attempt.id); setNotice(""); setShowSnapshot(false); }} aria-pressed={attempt.id === selectedId} className="min-h-7 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]">View</button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="refresh-policy-heading">
          <div className="flex items-center justify-between gap-2"><h2 id="refresh-policy-heading" className="text-sm font-bold text-[#263d32]">Refresh policy</h2><span className="rounded-full border border-[#d6e6dc] bg-[#f2f8f4] px-2 py-1 text-[10px] font-bold text-[#426652]">Preview</span></div>
          <ul className="mt-2 divide-y divide-[#e7ece9] text-[11px]">
            <li className="flex items-center justify-between gap-3 py-2"><span>Fetch source automatically</span><span className="rounded-full bg-[#e9f5ee] px-2 py-1 font-bold text-[#17634b]">Sample preference: enabled</span></li>
            <li className="flex items-center justify-between gap-3 py-2"><span>Fetched data is evidence, not approval</span><span className="rounded-full bg-[#edf4fb] px-2 py-1 font-bold text-[#3973a8]">Policy</span></li>
            <li className="flex items-center justify-between gap-3 py-2"><span>Important changes need admin review</span><span className="rounded-full bg-[#fff5df] px-2 py-1 font-bold text-[#94610c]">Before student visibility</span></li>
          </ul>
          <p className="mt-2 rounded-md border border-[#dce8e1] bg-[#f7faf8] px-3 py-2 text-[10px] leading-relaxed text-[#53665e]">The configured scheduler is not connected. No background refresh will run from this page.</p>
        </section>
      </div>

      <div className="space-y-3">
        {selected.id === "extraction-error" ? <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="selected-attempt-heading">
          <div className="flex items-start justify-between gap-2"><div><h2 id="selected-attempt-heading" className="text-base font-bold text-[#263d32]">Selected extraction-error state</h2><p className="mt-0.5 text-[10px] text-[#687970]">A successful HTTP response does not guarantee successful extraction.</p></div><span className="rounded-full border border-[#efc9c4] bg-[#fff0ee] px-2 py-1 text-[10px] font-bold text-[#a23e38]">HTTP 200 · extraction failed</span></div>
          <div role="alert" className="mt-3 rounded-md border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5"><p className="text-xs font-bold text-[#9e4038]">Extraction failed</p><p className="mt-1 text-[11px] leading-relaxed text-[#8e4038]">The source responded, but the expected application deadline field was not found.</p></div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 text-[10px]">
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">HTTP status</dt><dd className="mt-0.5 font-bold text-[#344b41]">200</dd><dd className="mt-0.5 text-[#85928b]">Response received</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Parser version</dt><dd className="mt-0.5 font-bold text-[#344b41]">v1.4</dd><dd className="mt-0.5 text-[#85928b]">Sample metadata</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Last successful extraction</dt><dd className="mt-0.5 font-bold text-[#344b41]">12 Oct 2026, 04:08</dd><dd className="mt-0.5 text-[#85928b]">Previous approved extraction</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Current approved value</dt><dd className="mt-0.5 font-bold text-[#344b41]">30 September 2026</dd><dd className="mt-0.5 text-[#85928b]">Kept while review is pending</dd></div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setShowSnapshot((value) => !value)} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><FileText aria-hidden className="h-3 w-3" />{showSnapshot ? "Hide source snapshot" : "Open source snapshot"}</button>
            <button type="button" onClick={() => previewAction("Retry extraction")} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><RefreshCw aria-hidden className="h-3 w-3" />Retry extraction</button>
            <button type="button" onClick={() => previewAction("Mark as technical issue")} className="min-h-8 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]">Mark as technical issue</button>
            <button type="button" onClick={() => previewAction("Keep previous value")} className="min-h-8 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]">Keep previous value</button>
            <button type="button" onClick={() => previewAction("Pause automatic refresh")} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><Pause aria-hidden className="h-3 w-3" />Pause automatic refresh</button>
          </div>
          {showSnapshot && <div className="mt-3 rounded-md border border-[#d7e1dc] bg-[#f7faf8] p-3" aria-label="Sample source snapshot metadata"><div className="flex items-center gap-2"><Database aria-hidden className="h-4 w-4 text-[#17634b]" /><h3 className="text-[11px] font-bold text-[#344b41]">Raw snapshot metadata · sample</h3></div><dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]"><div><dt className="text-[#687970]">Content type</dt><dd className="font-semibold text-[#344b41]">text/html · sample</dd></div><div><dt className="text-[#687970]">Content hash</dt><dd className="font-semibold text-[#344b41]">Not stored in this release</dd></div><div><dt className="text-[#687970]">Retrieved at</dt><dd className="font-semibold text-[#344b41]">12 Oct 2026, 04:08 · sample</dd></div><div><dt className="text-[#687970]">Snapshot storage</dt><dd className="font-semibold text-[#344b41]">Not connected</dd></div></dl><p className="mt-2 text-[10px] leading-relaxed text-[#687970]">No raw page content is available to open; this panel previews the metadata placement only.</p></div>}
          <p className="mt-3 rounded-md border border-[#ead8a9] bg-[#fff8e7] px-3 py-2 text-[10px] leading-relaxed text-[#71551d]">No new value was published. The last approved value remains in the catalogue until a candidate is reviewed and approved.</p>
        </section> : selected.id === "latest" ? <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="selected-attempt-heading">
          <div className="flex items-start justify-between gap-2"><div><h2 id="selected-attempt-heading" className="text-base font-bold text-[#263d32]">Selected successful fetch</h2><p className="mt-0.5 text-[10px] text-[#687970]">12 Oct 2026, 04:08 · sample attempt</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${resultStyles.success}`}>Successful</span></div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 text-[10px]">{[["Raw snapshot", "Metadata preview only"], ["Content type", "text/html · sample"], ["Content hash", "Not stored in this release"], ["Retrieved at", "12 Oct 2026, 04:08 · sample"], ["Parser version", "v1.4 · sample"], ["Extracted fields", "7 fields · sample"], ["Changes proposed", "1 needs review · sample"]].map(([label, value]) => <div key={label} className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">{label}</dt><dd className="mt-0.5 font-bold text-[#344b41]">{value}</dd></div>)}</div>
          <button type="button" onClick={() => { setShowSnapshot((value) => !value); previewAction("Open source snapshot"); }} className="mt-3 inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47]"><FileText aria-hidden className="h-3 w-3" />Open snapshot metadata</button>
          {showSnapshot && <p className="mt-2 rounded-md bg-[#f7faf8] p-2 text-[10px] leading-relaxed text-[#53665e]">Raw snapshot storage is not connected, so there is no captured source page to display.</p>}
        </section> : <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="selected-attempt-heading">
          <div className="flex items-start justify-between gap-2"><div><h2 id="selected-attempt-heading" className="text-base font-bold text-[#263d32]">Selected unavailable fetch</h2><p className="mt-0.5 text-[10px] text-[#687970]">11 Oct 2026, 04:09 · sample attempt</p></div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${resultStyles.warning}`}>Unavailable</span></div>
          <div role="alert" className="mt-3 rounded-md border border-[#ead8a9] bg-[#fff8e7] px-3 py-2.5"><p className="text-xs font-bold text-[#805d13]">Source could not be reached</p><p className="mt-1 text-[11px] leading-relaxed text-[#71551d]">The sample attempt timed out. The last approved value remains unchanged.</p></div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 text-[10px]">{[["HTTP / status", "timeout"], ["Parser version", "v1.4 · sample"], ["Records found", "Not available"], ["Duration", "Not recorded"]].map(([label, value]) => <div key={label} className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">{label}</dt><dd className="mt-0.5 font-bold text-[#344b41]">{value}</dd></div>)}</dl>
        </section>}

        <section className="rounded-xl border border-[#d7e1dc] bg-white p-3 shadow-sm" aria-labelledby="source-snapshot-heading">
          <h2 id="source-snapshot-heading" className="text-sm font-bold text-[#263d32]">Source snapshot</h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-4 text-[10px]">
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Raw snapshot</dt><dd className="mt-0.5 font-bold text-[#344b41]">Not retained in this release</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Content type</dt><dd className="mt-0.5 font-bold text-[#344b41]">Sample: text/html</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Content hash</dt><dd className="mt-0.5 font-bold text-[#344b41]">Not available</dd></div>
            <div className="border-b border-[#edf1ef] py-2"><dt className="text-[#687970]">Retrieved</dt><dd className="mt-0.5 font-bold text-[#344b41]">Timestamp shown in history</dd></div>
          </dl>
          <p className="mt-2 flex items-start gap-1.5 rounded-md border border-[#d6e6dc] bg-[#f2f8f4] px-2.5 py-2 text-[10px] leading-relaxed text-[#426652]"><ShieldCheck aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0" />Parser details are admin-only. Student-facing catalogue values continue to use approved records only.</p>
          <div className="mt-2 flex flex-wrap gap-1.5"><Link href="/admin/sources/history/snapshot" className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47] hover:bg-[#f3f7f5]"><FileText aria-hidden className="h-3 w-3" />Open snapshot viewer</Link><button type="button" onClick={openSource} className="inline-flex min-h-8 items-center gap-1 rounded-md border border-[#cbd8d2] px-2 text-[10px] font-semibold text-[#344e47]"><ExternalLink aria-hidden className="h-3 w-3" />Open source website</button></div>
        </section>

        <p className="flex items-start gap-2 rounded-lg border border-[#dce8e1] bg-[#f7faf8] px-3 py-2.5 text-[10px] leading-relaxed text-[#53665e]"><Clock3 aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#687970]" />A failed extraction never clears an approved deadline. Review the source and approve a proposed value before publishing it.</p>
      </div>
    </div>
  </div>;
}
