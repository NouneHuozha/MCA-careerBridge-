"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Check, CheckCircle2, Clock3, ExternalLink, FileText, GraduationCap, Info, Landmark, Link2, LoaderCircle, Plus, ShieldCheck } from "lucide-react";

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
  { id: "details", label: "Institution details" }, { id: "courses", label: "Courses offered" },
  { id: "admission", label: "Admission" }, { id: "sources", label: "Sources" }, { id: "history", label: "Change history" },
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
function FieldRow({ label, value, status, href }: { label: string; value: string | null; status: string; href?: string | null }) {
  const safeHref = safeExternalUrl(href);
  return <div className="grid gap-2 border-b border-[#edf1ef] py-3 sm:grid-cols-[170px_minmax(0,1fr)_150px_74px] sm:items-center">
    <span className="text-sm text-[#687a74]">{label}</span>
    <span className="min-w-0 break-words text-sm font-medium text-[#29483d]">{safeHref && value ? <a href={safeHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#286d54] underline decoration-[#afcdbd] underline-offset-2">{value}<ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0" /><span className="sr-only">(opens in a new tab)</span></a> : value || <span className="font-normal text-[#82908b]">Not currently available</span>}</span>
    <span className="text-[11px] text-[#788780]">Record status applies</span>
    <span className="text-xs text-[#71817c]">{statusLabel(status)}</span>
  </div>;
}
function EmptyPanel({ title, detail }: { title: string; detail: string }) {
  return <div className="rounded-xl border border-dashed border-[#d8e3df] bg-[#f8fbfa] px-5 py-10 text-center"><Info aria-hidden className="mx-auto h-6 w-6 text-[#6d8980]" /><p className="mt-2 font-semibold text-[#29483d]">{title}</p><p className="mt-1 text-sm text-[#71817c]">{detail}</p></div>;
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
    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-[#70817b]"><Link href="/admin/catalogue/institutions" className="hover:text-[#1d7055]">Catalogue</Link><span>/</span><Link href="/admin/catalogue/institutions" className="hover:text-[#1d7055]">Institutions</Link><span>/</span><span className="text-[#29483d]">{institution.name}</span></div>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-semibold tracking-[-.04em] text-[#142e27] sm:text-4xl">{institution.name}</h1><RecordStatus status={checked ? institution.verificationStatus : isVerified ? "needs_verification" : institution.verificationStatus} /></div><p className="mt-2 text-sm text-[#6d7e78]">Institution record · {institution.city ? `${institution.city}, ` : ""}{institution.district}, {institution.state} · Last reviewed {institution.lastVerifiedAt ? dateLabel(institution.lastVerifiedAt) : "not yet"}</p><p className="mt-1 text-xs text-[#89958f]">Record code: {institution.code} · {institution.datasetLabel}</p></div>
    </header>

    <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(310px,.8fr)]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-xl border border-[#dfe7e4] bg-white p-5 sm:p-6" aria-labelledby="details-heading">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8eeeb] pb-3"><div><h2 id="details-heading" className="text-lg font-semibold text-[#213c32]">Institution details</h2><p className="mt-1 text-xs text-[#75847f]">Shown values are read from the current catalogue record.</p></div><Landmark aria-hidden className="h-5 w-5 text-[#528371]" /></div>
          <FieldRow label="Institution name" value={institution.name} status={institution.verificationStatus} />
          <FieldRow label="Type / ownership" value={`${statusLabel(institution.type)} · ${statusLabel(institution.ownership)}`} status={institution.verificationStatus} />
          <FieldRow label="District / city" value={`${institution.district}${institution.city ? ` · ${institution.city}` : ""}, ${institution.state}`} status={institution.verificationStatus} />
          <FieldRow label="Official website" value={institution.officialWebsite} href={institution.officialWebsite} status={institution.verificationStatus} />
          <FieldRow label="Application link" value={institution.admissionPortal} href={institution.admissionPortal} status={institution.verificationStatus} />
          <FieldRow label="Hostel information" value={institution.hostelAvailable === "unknown" ? null : statusLabel(institution.hostelAvailable)} status={institution.verificationStatus} />
          <div className="mt-4 flex gap-2 rounded-lg border border-[#dce8e2] bg-[#f5faf7] p-3 text-xs leading-relaxed text-[#536d62]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0" /><p>Field-level draft editing is not available yet. These values are read-only here so an edit cannot bypass the review and publication workflow.</p></div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#dfe7e4] bg-white">
          <div role="tablist" aria-label="Institution review sections" className="flex gap-1 overflow-x-auto border-b border-[#e5ece9] px-3 pt-2">
            {tabs.map((item) => <button key={item.id} id={`tab-${item.id}`} role="tab" type="button" aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} onClick={() => setTab(item.id)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-semibold transition ${tab === item.id ? "border-[#17745a] text-[#17664f]" : "border-transparent text-[#74827d] hover:text-[#315b4c]"}`}>{item.label}</button>)}
          </div>
          <div id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`} className="p-5 sm:p-6">
            {tab === "details" && <div><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eaf5ef] text-[#28785d]"><ShieldCheck aria-hidden className="h-5 w-5" /></span><div><h2 className="font-semibold text-[#23483a]">Record verification checklist</h2><p className="text-xs text-[#72827b]">{completeCount} of {checklist.length} evidence checks currently satisfied</p></div></div><ul className="mt-4 divide-y divide-[#edf1ef]">{checklist.map(({ label, complete }) => <li key={label} className="flex items-center justify-between gap-4 py-3 text-sm"><span className="text-[#425d52]">{label}</span><span className={`inline-flex items-center gap-1.5 text-xs font-medium ${complete ? "text-[#227452]" : "text-[#926817]"}`}>{complete ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <Clock3 aria-hidden className="h-4 w-4" />}{complete ? "Evidence recorded" : "Needs verification"}</span></li>)}</ul><p className="mt-3 text-[11px] text-[#86938e]">Checklist results are derived from available catalogue fields and linked records; they are not a separately stored checklist.</p></div>}
            {tab === "courses" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Courses offered</h2><p className="mt-1 text-xs text-[#72827b]">Institution-course links are verified independently of the course catalogue.</p></div>{courses.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-[#f4f7f6] text-xs text-[#657670]"><tr><th className="px-3 py-2.5">Course</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5">Last verified</th><th className="px-3 py-2.5">Source</th></tr></thead><tbody>{courses.map((course) => <tr key={course.id} className="border-t border-[#edf1ef]"><td className="px-3 py-3 font-medium text-[#29483d]">{course.courseName}</td><td className="px-3 py-3"><RecordStatus status={course.verificationStatus} /></td><td className="px-3 py-3 text-xs text-[#74827d]">{dateLabel(course.lastVerifiedAt)}</td><td className="px-3 py-3">{safeExternalUrl(course.sourceUrl) ? <a className="inline-flex items-center gap-1 text-xs text-[#286d54] underline" href={safeExternalUrl(course.sourceUrl)!} target="_blank" rel="noopener noreferrer">Open source<ArrowUpRight className="h-3.5 w-3.5" /></a> : <span className="text-xs text-[#82908b]">No source recorded</span>}</td></tr>)}</tbody></table></div> : <EmptyPanel title="No course links recorded" detail="Course availability is not currently connected to this institution in the catalogue." />}</div>}
            {tab === "admission" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Admission information</h2><p className="mt-1 text-xs text-[#72827b]">Cycle-specific requirements and dates, when recorded.</p></div>{admissions.length ? <div className="space-y-4">{admissions.map((entry) => <article key={entry.id} className="rounded-lg border border-[#e5ece9] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold text-[#29483d]">{entry.cycleLabel || "Cycle not specified"}</h3><p className="mt-1 text-sm text-[#64766f]">Application window: {entry.applicationWindow || "Not currently available"}</p></div><RecordStatus status={entry.verificationStatus} /></div>{entry.importantDates?.length ? <dl className="mt-3 grid gap-2 sm:grid-cols-2">{entry.importantDates.map((date) => <div key={`${date.label}-${date.value}`} className="rounded-md bg-[#f7faf8] p-2.5"><dt className="text-xs text-[#74827d]">{date.label}</dt><dd className="mt-1 text-sm font-medium text-[#29483d]">{date.value}</dd></div>)}</dl> : null}{entry.process?.length ? <div className="mt-3"><p className="text-xs font-semibold text-[#687a74]">Process</p><ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-[#52675e]">{entry.process.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></div> : null}<p className="mt-3 text-sm text-[#52675e]">Fees: {entry.feesNote || "Not currently available"}</p><p className="mt-1 text-xs text-[#7a8984]">Retrieved: {dateLabel(entry.retrievedAt)}</p>{safeExternalUrl(entry.sourceUrl) ? <a href={safeExternalUrl(entry.sourceUrl)!} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#286d54] underline">Open admission source<ExternalLink className="h-3.5 w-3.5" /></a> : null}</article>)}</div> : <EmptyPanel title="No admission record" detail="No cycle-specific admission dates or requirements are currently recorded." />}</div>}
            {tab === "sources" && <div><div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-[#23483a]">Sources and evidence</h2><p className="mt-1 text-xs text-[#72827b]">Stored source identity and retrieval information for this record.</p></div><Link2 aria-hidden className="h-5 w-5 text-[#528371]" /></div><form onSubmit={addSource} className="mb-5 rounded-lg border border-[#e2ebe6] bg-[#f8fbf9] p-4"><h3 className="flex items-center gap-2 text-sm font-semibold text-[#315b4c]"><Plus aria-hidden className="h-4 w-4" />Add source</h3><div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-medium text-[#536b60]">Source title<input required minLength={2} maxLength={200} value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Official admissions page" className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]" /></label><label className="text-xs font-medium text-[#536b60]">Source type<select value={sourceType} onChange={(event) => setSourceType(event.target.value)} className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]"><option value="official_site">Official site</option><option value="govt_portal">Government portal</option><option value="official_pdf">Official PDF</option><option value="official_api">Official API</option><option value="secondary">Secondary source</option></select></label><label className="text-xs font-medium text-[#536b60] sm:col-span-2">Source URL<input required type="url" value={sourceUrlDraft} onChange={(event) => setSourceUrlDraft(event.target.value)} placeholder="https://example.edu/admissions" className="mt-1.5 h-10 w-full rounded-md border border-[#cbd9d3] bg-white px-3 text-sm outline-none focus:border-[#4b9876]" /></label></div><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#788780]">New sources are saved as unverified. This does not fetch or publish data.</p><button type="submit" disabled={sourceBusy || !sourceTitle.trim() || !sourceUrlDraft.trim()} className="inline-flex min-h-9 items-center gap-1.5 rounded-md bg-[#12664f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:opacity-50">{sourceBusy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}Add source</button></div>{sourceMessage && <p role="status" className={`mt-3 text-sm ${sourceMessageError ? "text-[#a33e3e]" : "text-[#1e7553]"}`}>{sourceMessage}</p>}</form>{sources.length ? <ul className="divide-y divide-[#edf1ef]">{sources.map((source) => <li key={source.id} className="flex flex-wrap items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="font-medium text-[#29483d]">{source.title}</p><p className="mt-1 text-xs capitalize text-[#75847f]">{source.sourceType.replaceAll("_", " ")} · {source.status ? statusLabel(source.status) : "Status not recorded"}</p>{safeExternalUrl(source.url) ? <a href={safeExternalUrl(source.url)!} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-xs text-[#286d54] underline">{source.url}<ExternalLink aria-hidden className="h-3.5 w-3.5 shrink-0" /></a> : <span className="mt-1 block text-xs text-[#82908b]">Invalid or missing source URL</span>}</div><span className="shrink-0 text-xs text-[#7a8984]">Retrieved {dateLabel(source.retrievedAt)}</span></li>)}</ul> : <EmptyPanel title="No source record attached" detail="A source URL on the institution record is shown above if present, but source type and fetch health are not stored." />}</div>}
            {tab === "history" && <div><div className="mb-4"><h2 className="font-semibold text-[#23483a]">Change history</h2><p className="mt-1 text-xs text-[#72827b]">Administrative events recorded for this institution.</p></div>{history.length ? <ol className="space-y-3">{history.map((event) => <li key={event.id} className="flex gap-3 rounded-lg border border-[#e7eeeb] p-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf6f1] text-[#28785d]"><FileText aria-hidden className="h-4 w-4" /></span><div className="min-w-0"><p className="font-medium capitalize text-[#29483d]">{event.action.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-[#70817b]">{event.actor || "System"} · {dateLabel(event.createdAt)}</p>{event.metadata?.reviewNote ? <p className="mt-2 text-sm text-[#52675e]">{String(event.metadata.reviewNote)}</p> : null}{event.metadata?.sourceUrl ? <a href={String(event.metadata.sourceUrl)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-[#286d54] underline">Evidence source<ExternalLink className="h-3 w-3" /></a> : null}</div></li>)}</ol> : <EmptyPanel title="No change events yet" detail="Verification decisions and later edits will appear here with the actor, time, reason, and evidence." />}</div>}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-xl border border-[#dfe7e4] bg-white p-5" aria-labelledby="verification-status-heading"><div className="flex items-center justify-between gap-2 border-b border-[#e8eeeb] pb-3"><h2 id="verification-status-heading" className="font-semibold text-[#213c32]">Verification</h2><span className="text-xs text-[#71817c]">Record-level</span></div><ul className="mt-1 divide-y divide-[#edf1ef]">{checklist.map(({ label, complete }) => <li key={label} className="flex items-center justify-between gap-3 py-3 text-sm"><span className="text-[#4c6258]">{label}</span><span className={`whitespace-nowrap text-xs ${complete ? "text-[#227452]" : "text-[#8b6b28]"}`}>{complete ? "Evidence recorded" : "Needs verification"}</span></li>)}</ul></section>
        <section className="rounded-xl border border-[#dfe7e4] bg-white p-5" aria-labelledby="source-panel-heading"><div className="flex items-center justify-between gap-2"><h2 id="source-panel-heading" className="font-semibold text-[#213c32]">Sources</h2><span className="rounded-full bg-[#eef5f1] px-2 py-1 text-[10px] text-[#476a5b]">Evidence</span></div>
          {sources.length ? <ul className="mt-3 divide-y divide-[#edf1ef]">{sources.map((source) => <li key={source.id} className="py-3"><p className="text-sm font-medium text-[#29483d]">{source.title}</p><p className="mt-1 text-xs text-[#75847f]">{source.status ? statusLabel(source.status) : "Status not recorded"} · Retrieved {dateLabel(source.retrievedAt)}</p><a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#286d54] underline">Open source<ArrowUpRight className="h-3.5 w-3.5" /></a></li>)}</ul> : <div className="mt-3 rounded-lg border border-dashed border-[#d8e3df] bg-[#f8fbfa] p-3 text-xs leading-relaxed text-[#71817c]">No source catalog record is attached. The institution record URL, if any, remains visible in Institution details.</div>}
          <button type="button" onClick={() => setTab("sources")} className="mt-3 w-full rounded-lg border border-[#d6e1dc] bg-white px-3 py-2.5 text-sm font-semibold text-[#315b4c] hover:bg-[#f7faf8]">View sources</button>
        </section>
        <section className="rounded-xl border border-[#e9ddb9] bg-[#fff9ed] p-4"><div className="flex gap-2"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#a2741d]" /><p className="text-xs leading-relaxed text-[#745c2a]">Unverified information should not be presented as confirmed. Only mark this record verified after checking official evidence.</p></div></section>
      </aside>
    </div>

    <form onSubmit={markVerified} className="mt-5 rounded-xl border border-[#dfe7e4] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eaf5ef] text-[#28785d]"><ShieldCheck aria-hidden className="h-5 w-5" /></span><div className="min-w-0"><h2 className="font-semibold text-[#23483a]">Record a verification decision</h2><p className="mt-1 text-sm leading-relaxed text-[#71817c]">This updates the record-level verification state, preserves the evidence URL and writes an audit event. It does not edit the institution’s descriptive fields.</p></div></div>
      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><label className="block text-sm font-medium text-[#435c51]">Official evidence URL<input type="url" required value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official.example.edu" className="mt-1.5 h-11 w-full rounded-lg border border-[#ccd9d4] bg-white px-3 text-sm text-[#273f35] outline-none focus:border-[#4b9876] focus:ring-2 focus:ring-[#e1f1e8]" /></label><label className="block text-sm font-medium text-[#435c51]">Review note (required)<textarea required minLength={8} maxLength={500} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="What did you verify against this source?" rows={2} className="mt-1.5 w-full rounded-lg border border-[#ccd9d4] bg-white px-3 py-2 text-sm text-[#273f35] outline-none focus:border-[#4b9876] focus:ring-2 focus:ring-[#e1f1e8]" /></label></div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="flex items-start gap-2 text-xs leading-relaxed text-[#62756c]"><input type="checkbox" required checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-0.5 accent-[#17664f]" /><span>I checked the current details against this official source. I understand this decision changes the student-facing record status.</span></label><button type="submit" disabled={busy || !confirmEvidence || !reviewNote.trim() || !sourceUrl.trim()} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#12664f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{isVerified ? "Reverify" : "Mark verified"}</button></div>
      {message && <p role="status" className={`mt-3 text-sm ${messageError ? "text-[#a33e3e]" : "text-[#1e7553]"}`}>{message}</p>}
    </form>
    {checked && <p className="mt-5 flex items-center gap-2 rounded-lg border border-[#cfe4d8] bg-[#eff8f3] px-4 py-3 text-sm text-[#2a634d]"><CheckCircle2 aria-hidden className="h-4 w-4" />Record verified on {dateLabel(institution.lastVerifiedAt)}. See Change history for the evidence and reviewer note.</p>}
  </>;
}
