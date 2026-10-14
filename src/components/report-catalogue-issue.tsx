"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flag, LoaderCircle, Send, X } from "lucide-react";

type IssueType = "incorrect_detail" | "broken_application_link" | "outdated_deadline" | "wrong_course_availability" | "missing_source" | "other";

export function ReportCatalogueIssue({ entityType, entityRef, entityName, sourceUrl }: { entityType: "institution" | "course" | "scholarship" | "entrance_exam" | "opportunity"; entityRef: string; entityName: string; sourceUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [issueType, setIssueType] = useState<IssueType>("incorrect_detail");
  const [reason, setReason] = useState("");
  const [reportedUrl, setReportedUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/feedback-flags", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entityType, entityRef, issueType, reason, sourceUrl: reportedUrl.trim() }) });
      const payload = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Could not send your report.");
      setMessage("Thanks for letting us know. Your report has been sent for review; it has not changed the catalogue."); setReason(""); setReportedUrl("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not send your report."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-xl border border-[#d9e5df] bg-[#f7faf8] p-4 sm:p-5" aria-label="Report an issue with this record">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 text-base font-semibold text-[#18392f]"><Flag aria-hidden className="h-4 w-4 text-[#267253]"/>Something wrong with this information?</h2><p className="mt-1 text-sm text-[#5d6f66]">Report an issue with {entityName}. Reports are reviewed by the team and don’t change catalogue data directly.</p></div><button type="button" onClick={() => { setOpen((value) => !value); setError(""); }} aria-expanded={open} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#245844] hover:bg-[#eef6f1]">{open ? <><X aria-hidden className="h-4 w-4"/>Close</> : <><Flag aria-hidden className="h-4 w-4"/>Report an issue</>}</button></div>
    {message && <p role="status" className="mt-4 rounded-lg border border-[#cce4d6] bg-[#edf8f1] px-3 py-2.5 text-sm text-[#1d5c3f]">{message}</p>}
    {open && <form onSubmit={submit} className="mt-4 grid gap-4 border-t border-[#e0e9e4] pt-4 sm:grid-cols-2">
      <p className="sm:col-span-2 text-xs leading-relaxed text-[#687970]">Sign in to submit a report. Our review team will check it; this form does not edit the catalogue.</p>
      <label className="text-sm font-semibold text-[#344b41]">Issue type<select value={issueType} onChange={(event) => setIssueType(event.target.value as IssueType)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"><option value="incorrect_detail">Incorrect detail</option><option value="broken_application_link">Broken application link</option><option value="outdated_deadline">Deadline may be outdated</option><option value="wrong_course_availability">Course availability</option><option value="missing_source">Missing source</option><option value="other">Other issue</option></select></label>
      <label className="text-sm font-semibold text-[#344b41]">Link related to the report (optional)<input value={reportedUrl} onChange={(event) => setReportedUrl(event.target.value)} type="url" maxLength={2048} placeholder={sourceUrl || "https://"} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal"/></label>
      <label className="sm:col-span-2 text-sm font-semibold text-[#344b41]">What should we check?<textarea required minLength={8} maxLength={1000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell us what seems incorrect or missing, and where you saw the issue." className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] bg-white p-3 text-sm font-normal outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/><span className="mt-1 block text-right text-xs font-normal text-[#718078]">{reason.length}/1,000</span></label>
      {error && <p role="alert" className="sm:col-span-2 rounded-lg border border-[#edc9c4] bg-[#fff2f0] px-3 py-2 text-sm text-[#9e4038]">{error} {error === "Sign in to send a report." && <Link href={`/sign-in?next=${encodeURIComponent(pathname || "/")}`} className="font-bold underline">Sign in</Link>}</p>}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button type="submit" disabled={busy || reason.trim().length < 8} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin"/> : <Send aria-hidden className="h-4 w-4"/>}{busy ? "Sending report…" : "Send report"}</button><p className="text-xs text-[#718078]">We’ll add this to the feedback review queue.</p></div>
    </form>}
  </section>;
}
