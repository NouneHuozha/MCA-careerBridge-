"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Check, CheckCircle2, Clock3, ExternalLink, FileText, Info, Landmark, Link2, LoaderCircle, Plus, ShieldCheck } from "lucide-react";

type Institution = {
  code: string; name: string; type: string; ownership: string; state: string; country: string;
  district: string; city: string | null; officialWebsite: string | null; admissionPortal: string | null;
  hostelAvailable: string; admissionStatus: string; about: string | null; datasetLabel: string;
  verificationStatus: string; sourceUrl: string | null; lastVerifiedAt: string | null;
  isFresh: boolean;
};
type CourseLink = { id: number; courseSlug: string; courseName: string; verificationStatus: string; sourceUrl: string | null; lastVerifiedAt: string | null };
type Admission = { id: number; cycleLabel: string | null; applicationWindow: string | null; importantDates: { label: string; value: string }[] | null; process: string[] | null; documents: string[] | null; feesNote: string | null; sourceUrl: string | null; retrievedAt: string | null; verificationStatus: string };
type Source = { id: number | string; title: string; sourceType: string; url: string; status: string | null; retrievedAt: string | null; lastVerifiedAt?: string | null };
type Audit = { id: number; actor: string | null; action: string; entityType: string | null; metadata: Record<string, unknown> | null; createdAt: string };
type Props = { institution: Institution; courses: CourseLink[]; admissions: Admission[]; sources: Source[]; history: Audit[] };
type Tab = "details" | "courses" | "admission" | "sources" | "history";
const tabs: { id: Tab; label: string }[] = [
  { id: "details", label: "Details" }, { id: "courses", label: "Courses" },
  { id: "admission", label: "Admissions" }, { id: "sources", label: "Sources" }, { id: "history", label: "History" },
];
const verified = new Set(["verified", "current", "recently_verified", "published_verified"]);
const statusLabel = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
function dateLabel(value: string | null) { return value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Not recorded"; }
function safeExternalUrl(value: string | null | undefined) {
  if (!value) return null;
  try { return ["https:", "http:"].includes(new URL(value).protocol) ? value : null; } catch { return null; }
}
function RecordStatus({ status }: { status: string }) {
  const good = verified.has(status);
  const bad = ["unavailable", "blocked"].includes(status);
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${good ? "bg-[#e8f5ef] text-[#1b7254]" : bad ? "bg-[#fff0ef] text-[#a44a42]" : "bg-[#fff5df] text-[#8a641a]"}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{statusLabel(status)}</span>;
}
function FieldRow({ label, value, href }: { label: string; value: string | null; href?: string | null }) {
  const safeHref = safeExternalUrl(href);
  return <div className="grid gap-1.5 border-b border-[#e2e9e5] py-3.5 sm:grid-cols-[minmax(140px,.7fr)_minmax(0,1.5fr)] sm:items-start sm:gap-5">
    <span className="text-sm font-semibold text-[#53665d]">{label}</span>
    <span className="min-w-0 break-words text-[15px] font-semibold leading-relaxed text-[#263d32]">{safeHref && value ? <a href={safeHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#145c42] underline decoration-[#92b8a4] underline-offset-2">{value}<ExternalLink aria-hidden className="h-4 w-4 shrink-0" /><span className="sr-only">(opens in a new tab)</span></a> : value || <span className="font-medium text-[#53665d]">Not currently available</span>}</span>
  </div>;
}
function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-xl border border-dashed border-[#cbd9d2] bg-[#f5f8f6] px-5 py-10 text-center"><Info aria-hidden className="mx-auto h-6 w-6 text-[#53685e]" /><p className="mt-2 font-bold text-[#29483d]">{title}</p><p className="mt-1 text-sm leading-relaxed text-[#53665e]">{detail}</p></div>;
}

export function InstitutionVerificationWorkspace({ institution, courses, admissions, sources, history }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("details");
  const [sourceUrl, setSourceUrl] = useState(institution.sourceUrl ?? institution.officialWebsite ?? "");
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceType, setSourceType] = useState("official_site");
  const [sourceUrlDraft, setSourceUrlDraft] = useState("");
  const [sourceBusy, setSourceBusy] = useState(false);
  const [sourceMessage, setSourceMessage] = useState("");
  const [sourceMessageError, setSourceMessageError] = useState(false);
  const isVerified = verified.has(institution.verificationStatus);
  const checked = institution.isFresh;
  const checklist = useMemo(() => [
    { label: "Identity and location", complete: Boolean(institution.name && institution.district && institution.state) },
    { label: "Official website", complete: Boolean(institution.officialWebsite) },
    { label: "Current course offerings", complete: courses.length > 0 && courses.every((course) => verified.has(course.verificationStatus)) },
    { label: "Admission process", complete: admissions.some((entry) => verified.has(entry.verificationStatus) && Boolean(entry.process?.length)) },
    { label: "Fees and dates", complete: admissions.some((entry) => verified.has(entry.verificationStatus) && Boolean(entry.feesNote || entry.importantDates?.length)) },
    { label: "Hostel information", complete: institution.hostelAvailable !== "unknown" && checked },
  ], [institution, courses, admissions, checked]);
  const completeCount = checklist.filter((item) => item.complete).length;

  async function markVerified(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(""); setMessageError(false);
    try {
      const response = await fetch(`/api/admin/institutions/${encodeURIComponent(institution.code)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_verified", sourceUrl, reviewNote, confirmEvidence }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to save verification.");
      setMessage("Verification recorded. The audit event has been saved.");
      setReviewNote(""); setConfirmEvidence(false);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save verification."); setMessageError(true);
    } finally { setBusy(false); }
  }

  async function addSource(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSourceBusy(true); setSourceMessage(""); setSourceMessageError(false);
    try {
      const response = await fetch(`/api/admin/institutions/${encodeURIComponent(institution.code)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_source", title: sourceTitle, sourceType, url: sourceUrlDraft }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Unable to add source.");
      setSourceTitle(""); setSourceUrlDraft("");
      setSourceMessage("Source added as unverified. No source retrieval was performed.");
      router.refresh();
    } catch (error) {
      setSourceMessage(error instanceof Error ? error.message : "Unable to add source."); setSourceMessageError(true);
    } finally { setSourceBusy(false); }
  }

  return <>
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-medium text-[#53665e]"><Link href="/admin" className="hover:text-[#145c42]">Admin</Link><span aria-hidden className="text-[#89978f]">/</span><Link href="/admin/catalogue/institutions" className="hover:text-[#145c42]">Institutions</Link><span aria-hidden className="text-[#89978f]">/</span><span className="font-semibold text-[#263d32]">{institution.name}</span></div>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">{institution.name}</h1><RecordStatus status={checked ? institution.verificationStatus : isVerified ? "needs_verification" : institution.verificationStatus} /></div><p className="mt-2 text-base font-medium text-[#42584e]">{institution.city ? `${institution.city}, ` : ""}{institution.district}, {institution.state}</p><p className="mt-1 text-sm text-[#53665e]">Institution record · Last checked {institution.lastVerifiedAt ? dateLabel(institution.lastVerifiedAt) : "Never"}</p><p className="mt-2 inline-flex rounded-md bg-[#e9efec] px-2.5 py-1 text-xs font-semibold text-[#42584e]">{institution.code} <span className="mx-1.5 text-[#718078]">·</span> {institution.datasetLabel}</p></div>
    </header>

    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(350px,.8fr)]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="details-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5e0] pb-4"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#53665d]">Catalogue record</p><h2 id="details-heading" className="mt-1 text-xl font-bold text-[#213c32]">Institution details</h2><p className="mt-1 text-sm text-[#53665e]">Current student-facing values. Review before confirming.</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e9f3ee] text-[#145c42]"><Landmark aria-hidden className="h-5 w-5" /></span></div>
          <FieldRow label="Institution name" value={institution.name} />
          <FieldRow label="Type / ownership" value={`${statusLabel(institution.type)} · ${statusLabel(institution.ownership)}`} />
          <FieldRow label="District / city" value={`${institution.district}${institution.city ? ` · ${institution.city}` : ""}, ${institution.state}`} />
          <FieldRow label="Official website" value={institution.officialWebsite} href={institution.officialWebsite} />
          <FieldRow label="Application link" value={institution.admissionPortal} href={institution.admissionPortal} />
          <FieldRow label="Hostel information" value={institution.hostelAvailable === "unknown" ? null : statusLabel(institution.hostelAvailable)} />
          <div className="mt-4 flex gap-3 rounded-xl border border-[#cbd8d2] bg-[#f1f5f3] p-4 text-sm leading-relaxed text-[#42584e]"><Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#52665d]" /><p><strong>Read-only:</strong> descriptive fields cannot be edited here yet. Verification changes status only; it does not silently modify catalogue content.</p></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#dfe7e4] bg-white">
          <div role="tablist" aria-label="Institution review sections" className="flex gap-1 overflow-x-auto border-b border-[#dce5e0] bg-[#f3f6f4] px-3 pt-2">
            {tabs.map((item) => <button key={item.id} id={`tab-${item.id}`} role="tab" type="button" aria-selected={tab === item.id} aria-controls={tab === item.id ? `panel-${item.id}` : undefined} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-t-lg border-b-[3px] px-4 py-3.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#12664f] ${tab === item.id ? "border-[#12664f] bg-white text-[#104d3a]" : "border-transparent text-[#455b51] hover:bg-white hover:text-[#104d3a]"}`}>{item.label}</button>)}
          </div>
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="p-5 sm:p-6">
            {tab === "details" && <div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e9f3ee] text-[#145c42]"><ShieldCheck aria-hidden className="h-5 w-5" /></span><div><h2 className="text-base font-bold text-[#23483a]">Record review checklist</h2><p className="mt-0.5 text-sm font-medium text-[#53665e]">{completeCount} of {checklist.length} data checks complete</p></div></div><ul className="mt-4 divide-y divide-[#e2e9e5]">{checklist.map(({ label, complete }) => <li key={label} className="flex items-center justify-between gap-4 py-3.5 text-sm"><span className="font-medium text-[#344b41]">{label}</span><span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-bold ${complete ? "text-[#176847]" : "text-[#805b12]"}`}>{complete ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <Clock3 aria-hidden className="h-4 w-4" />}{complete ? "Complete" : "Review needed"}</span></li>)}</ul><p className="mt-4 rounded-lg bg-[#f1f4f2] p-3 text-xs leading-relaxed text-[#53665e]">This checklist is derived from available fields and linked records; it is not a separately stored review form.</p></div>}
            {tab === "courses" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Courses offered</h2><p className="mt-1 text-xs text-[#53665e]">Institution-course links are verified independently of the course catalogue.</p></div>{courses.length ? <><div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-[#f4f7f6] text-xs text-[#455b51]"><tr><th className="px-3 py-2.5">Course</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Last verified</th><th className="px-3 py-2.5">Source</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-t border-[#edf1ef]"><td className="px-3 py-3 font-medium text-[#29483d]">{course.courseName}</td><td className="px-3 py-3"><RecordStatus status={course.verificationStatus} /></td><td className="px-3 py-3 text-xs text-[#53665e]">{dateLabel(course.lastVerifiedAt)}</td><td className="px-3 py-3">{safeExternalUrl(course.sourceUrl) ? <a className="inline-flex items-center gap-1 text-xs text-[#286d54] underline" href={safeExternalUrl(course.sourceUrl)!} target="_blank" rel="noopener noreferrer">Open source<ArrowUpRight className="h-3.5 w-3.5" /></a> : <span className="text-xs text-[#53665e]">No source recorded</span>}</td></tr>)}</tbody></table></div><div className="space-y-3 md:hidden">{courses.map((course) => <article key={`mobile-course-${course.id}`} className="rounded-xl border border-[#d4dfda] bg-white p-4"><div className="flex items-start justify-between gap-3"><h3 className="text-base font-bold leading-snug text-[#20392f]">{course.courseName}</h3><RecordStatus status={course.verificationStatus} /></div><dl className="mt-3 grid grid-cols-2 gap-3 border-t border-[#e2e9e5] pt-3 text-sm"><div><dt className="text-xs font-bold uppercase tracking-wide text-[#53665e]">Last verified</dt><dd className="mt-1 font-semibold text-[#344b41]">{dateLabel(course.lastVerifiedAt)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#53665e]">Evidence</dt><dd className="mt-1">{safeExternalUrl(course.sourceUrl) ? <a className="inline-flex items-center gap-1 font-bold text-[#145c42] underline" href={safeExternalUrl(course.sourceUrl)!} target="_blank" rel="noopener noreferrer">Open source<ArrowUpRight className="h-4 w-4" /></a> : <span className="font-medium text-[#53665e]">Not recorded</span>}</dd></div></dl></article>)}</div></> : <EmptyPanel title="No course links recorded" detail="Course availability is not currently connected to this institution in the catalogue." />}</div>}
            {tab === "admission" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Admission information</h2><p className="mt-1 text-xs text-[#53665e]">Cycle-specific requirements and dates, when recorded.</p></div>{admissions.length ? <div className="space-y-4">{admissions.map((entry) => <article key={entry.id} className="rounded-lg border border-[#e5ece9] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-[#29483d]">{entry.cycleLabel || "Cycle not specified"}</h3><p className="mt-1 text-sm text-[#64766f]">Application window: {entry.applicationWindow || "Not currently available"}</p></div><RecordStatus status={entry.verificationStatus} /></div>{entry.importantDates?.length ? <dl className="mt-3 grid gap-2 sm:grid-cols-2">{entry.importantDates.map((date) => <div key={`${date.label}-${date.value}`} className="rounded-md bg-[#f7faf8] p-2.5"><dt className="text-xs text-[#53665e]">{date.label}</dt><dd className="mt-1 text-sm font-medium text-[#29483d]">{date.value}</dd></div>)}</dl> : null}{entry.process?.length ? <div className="mt-3"><p className="text-xs font-semibold text-[#455b51]">Process</p><ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-[#52675e]">{entry.process.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></div> : null}<p className="mt-3 text-sm text-[#52675e]">Fees: {entry.feesNote || "Not currently available"}</p><p className="mt-1 text-xs text-[#53665e]">Retrieved: {dateLabel(entry.retrievedAt)}</p>{safeExternalUrl(entry.sourceUrl) ? <a href={safeExternalUrl(entry.sourceUrl)!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#286d54] underline">Open admission source<ExternalLink className="h-3.5 w-3.5" /></a> : null}</article>)}</div> : <EmptyPanel title="No admission record" detail="No cycle-specific admission dates or requirements are currently recorded." />}</div>}
            {tab === "sources" && <div><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-[#23483a]">Sources and evidence</h2><p className="mt-1 text-xs text-[#53665e]">Stored source identity and retrieval information for this record.</p></div><Link2 aria-hidden className="h-5 w-5 text-[#528371]" /></div><form onSubmit={addSource} className="mb-5 rounded-lg border border-[#e2ebe6] bg-[#f8fbf9] p-4"><h3 className="flex items-center gap-2 text-sm font-semibold text-[#315b4c]"><Plus aria-hidden className="h-4 w-4" />Add source</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-[#344b41]">Source title<input required minLength={2} maxLength={200} value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Official admissions page" className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]" /></label><label className="text-sm font-semibold text-[#344b41]">Source type<select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]"><option value="official_site">Official site</option><option value="govt_portal">Government portal</option><option value="official_pdf">Official PDF</option><option value="official_api">Official API</option><option value="secondary">Secondary source</option></select></label><label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Source URL<input required type="url" value={sourceUrlDraft} onChange={(event) => setSourceUrlDraft(event.target.value)} placeholder="https://example.edu/admissions" className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]" /></label></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#53665e]">New sources are saved as unverified. This does not fetch or publish data.</p><button type="submit" disabled={sourceBusy || !sourceTitle.trim() || !sourceUrlDraft.trim()} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#12664f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:opacity-50">{sourceBusy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Add source</button></div>{sourceMessage && <p role="status" className={`mt-3 text-sm ${sourceMessageError ? "text-[#a33e3e]" : "text-[#1e7553]"}`}>{sourceMessage}</p>}</form>{sources.length ? <ul className="divide-y divide-[#edf1ef]">{sources.map((source) => <li key={source.id} className="flex flex-wrap items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="font-medium text-[#29483d]">{source.title}</p><p className="mt-1 text-xs capitalize text-[#53665e]">{source.sourceType.replaceAll("_", " ")} · {source.status ? statusLabel(source.status) : "Status not recorded"}</p>{safeExternalUrl(source.url) ? <a href={safeExternalUrl(source.url)!} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-[#286d54] underline">{source.url}<ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0" /></a> : <span className="mt-1 block text-xs text-[#53665e]">Invalid or missing source URL</span>}</div><span className="shrink-0 text-xs text-[#53665e]">Retrieved {dateLabel(source.retrievedAt)}</span></li>)}</ul> : <EmptyPanel title="No source record attached" detail="A source URL on the institution record is shown above if present, but source type and fetch health are not stored." />}</div>}
            {tab === "history" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Change history</h2><p className="mt-1 text-xs text-[#53665e]">Administrative events recorded for this institution.</p></div>{history.length ? <ol className="space-y-3">{history.map((event) => <li key={event.id} className="flex gap-3 rounded-lg border border-[#e7eeeb] p-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf6f1] text-[#28785d]"><FileText aria-hidden className="h-4 w-4" /></span><div className="min-w-0"><p className="font-medium capitalize text-[#29483d]">{event.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-[#53665e]">{event.actor || "System"} · {dateLabel(event.createdAt)}</p>{event.metadata?.reviewNote ? <p className="mt-2 text-sm text-[#52675e]">{String(event.metadata.reviewNote)}</p> : null}{event.metadata?.sourceUrl ? <a href={String(event.metadata.sourceUrl)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[#286d54] underline">Evidence source<ExternalLink className="h-3 w-3" /></a> : null}</div></li>)}</ol> : <EmptyPanel title="No change events yet" detail="Verification decisions and later edits will appear here with the actor, time, reason, and evidence." />}</div>}
          </div>
        </section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
        <form id="verification-form" onSubmit={markVerified} className="rounded-2xl border-2 border-[#176447] bg-[#eaf4ef] p-5 shadow-md sm:p-6">
          <div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#145c42] text-white"><ShieldCheck aria-hidden className="h-5 w-5" /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#145c42]">Primary action</p><h2 className="mt-1 text-lg font-bold text-[#173d2e]">{isVerified ? "Re-verify this institution" : "Verify this institution"}</h2><p className="mt-1 text-sm leading-relaxed text-[#42584e]">Confirm the current record against evidence. This changes verification status, not descriptive fields.</p></div></div>
          <div className="mt-5 space-y-4"><label className="block text-sm font-bold text-[#344b41]">Evidence URL<input type="url" required value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official.example.edu" className="mt-1.5 h-12 w-full rounded-lg border border-[#aebfb5] bg-white px-3.5 text-sm font-medium text-[#20392f] outline-none placeholder:text-[#66766e] focus:border-[#12664f] focus:ring-2 focus:ring-[#b9d9c8]" /></label><label className="block text-sm font-bold text-[#344b41]">Reviewer note<textarea required minLength={8} maxLength={500} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="What did you verify against this source?" rows={3} className="mt-1.5 w-full rounded-lg border border-[#aebfb5] bg-white px-3.5 py-3 text-sm font-medium leading-relaxed text-[#20392f] outline-none placeholder:text-[#66766e] focus:border-[#12664f] focus:ring-2 focus:ring-[#b9d9c8]" /></label></div>
          <label className="mt-4 flex items-start gap-3 rounded-xl border border-[#c3d8cb] bg-white/80 p-3.5 text-sm font-medium leading-relaxed text-[#344b41]"><input type="checkbox" required checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#12664f]" /><span>I checked the current details against this evidence and understand this updates the student-facing verification status.</span></label>
          <button type="submit" disabled={busy || !confirmEvidence || !reviewNote.trim() || !sourceUrl.trim()} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#7b9287]">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{busy ? "Saving decision…" : isVerified ? "Re-verify institution" : "Mark verified"}</button>
          {message && <p role="status" className={`mt-3 rounded-lg bg-white p-3 text-sm font-semibold ${messageError ? "text-[#9b3027]" : "text-[#145c42]"}`}>{message}</p>}
          <p className="mt-3 text-xs font-medium leading-relaxed text-[#53665e]">A successful decision is added to this record’s change history.</p>
        </form>
        {checked && <p className="flex items-start gap-2 rounded-xl border border-[#a9d0b9] bg-[#e6f4eb] px-4 py-3 text-sm font-semibold leading-relaxed text-[#145c42]"><CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Verified on {dateLabel(institution.lastVerifiedAt)}. See History for the evidence and reviewer note.</p>}
        <section className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm" aria-labelledby="verification-status-heading"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#53665d]">Record quality</p><h2 id="verification-status-heading" className="mt-1 text-base font-bold text-[#213c32]">Review checklist</h2></div><span className="rounded-full bg-[#eaf1ed] px-3 py-1.5 text-sm font-bold text-[#344b41]">{completeCount}/{checklist.length}</span></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#e4ebe7]" role="progressbar" aria-label="Record data checks complete" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={completeCount}><div className="h-full rounded-full bg-[#1b7654] transition-all" style={{ width: `${Math.round((completeCount / checklist.length) * 100)}%` }} /></div><p className="mt-2 text-sm leading-relaxed text-[#53665e]">{completeCount === checklist.length ? "All available data checks are complete." : `${checklist.length - completeCount} checks still need attention.`}</p></section>
        <section className="rounded-2xl border border-[#d4dfda] bg-white p-5 shadow-sm" aria-labelledby="source-panel-heading"><div className="flex items-center justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[.1em] text-[#53665d]">Evidence</p><h2 id="source-panel-heading" className="mt-1 text-base font-bold text-[#213c32]">Sources <span className="font-semibold text-[#53665e]">({sources.length})</span></h2></div><Link2 aria-hidden className="h-5 w-5 text-[#145c42]" /></div>
          {sources.length ? <ul className="mt-3 divide-y divide-[#e2e9e5]">{sources.slice(0, 3).map((source) => <li key={source.id} className="py-3"><p className="text-sm font-bold text-[#29483d]">{source.title}</p><p className="mt-1 text-xs font-medium text-[#53665e]">{source.status ? statusLabel(source.status) : "Status not recorded"} · Retrieved {dateLabel(source.retrievedAt)}</p>{safeExternalUrl(source.url) ? <a href={safeExternalUrl(source.url)!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center gap-1 text-sm font-bold text-[#145c42] underline underline-offset-2">Open source<ArrowUpRight className="h-4 w-4" /></a> : <span className="mt-2 block text-sm font-semibold text-[#8d372f]">Invalid source URL</span>}</li>)}</ul> : <div className="mt-3 rounded-lg border border-dashed border-[#cbd8d2] bg-[#f3f6f4] p-3 text-sm leading-relaxed text-[#53665e]">No source catalog record is attached yet.</div>}
          <button type="button" onClick={() => setTab("sources")} className="mt-3 min-h-11 w-full rounded-lg border border-[#9fb8aa] bg-white px-3 py-2.5 text-sm font-bold text-[#145c42] transition hover:bg-[#eef5f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]">Manage and add sources</button>
        </section>
        <section className="rounded-xl border border-[#e4ce96] bg-[#fff8e7] p-4"><div className="flex gap-3"><AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#805b12]" /><p className="text-sm font-medium leading-relaxed text-[#59430f]">Only mark this record verified after checking current details against reliable evidence.</p></div></section>
      </aside>
    </div>

  </>;
}
