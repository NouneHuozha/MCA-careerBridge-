"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Check, CheckCircle2, Clock3, ExternalLink, FileCheck2, Landmark, Save, ShieldCheck } from "lucide-react";
import type { ScholarshipEditorPayload } from "@/db/schema";

const inputClass = "min-h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 py-2 text-sm text-[#273c33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]";
const DOCUMENTS = ["Academic record", "Identity document", "Income certificate, if applicable", "Category certificate, if applicable", "Bank details, if applicable", "Institution verification, if applicable"] as const;
const STAGES: { key: string; label: string }[] = [
  { key: "class10", label: "School stage" }, { key: "class12", label: "Class 11–12" },
  { key: "undergraduate", label: "Undergraduate" }, { key: "postgraduate", label: "Postgraduate" }, { key: "certificate", label: "Certificate" },
];
function prettyDate(value: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(date);
}
function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <section className="rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:p-5"><div className="mb-4"><h2 className="text-lg font-bold text-[#19372d]">{title}</h2>{description && <p className="mt-1 text-sm leading-relaxed text-[#687970]">{description}</p>}</div>{children}</section>;
}
function FieldStatus({ value, pending, verified }: { value: string; pending: boolean; verified: boolean }) {
  const label = !value.trim() ? "Not currently confirmed" : pending ? "Draft · needs checking" : verified ? "Verified" : "Needs checking";
  const color = !value.trim() || pending || !verified ? "text-[#96600c]" : "text-[#176b52]";
  return <span className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${color}`}><Clock3 aria-hidden className="h-3 w-3" />{label}</span>;
}
function TextField({ label, value, onChange, placeholder, pending, verified, multiline = false, type = "text", id }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; pending: boolean; verified: boolean; multiline?: boolean; type?: string; id?: string }) {
  return <label className="block text-sm font-semibold text-[#344b41]">{label}{multiline ? <textarea id={id} rows={3} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} mt-1.5 min-h-24 resize-y leading-relaxed`} /> : <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${inputClass} mt-1.5`} />}<FieldStatus value={value} pending={pending} verified={verified} /></label>;
}
function CheckStatus({ label, value, verified, pending }: { label: string; value: boolean; verified: boolean; pending: boolean }) {
  const confirmed = value && verified && !pending;
  return <li className="flex items-center justify-between gap-2 border-t border-[#e8eeeb] py-2.5 first:border-0"><span className="text-sm text-[#344b41]">{label}</span><span className={`inline-flex items-center gap-1 text-xs font-semibold ${confirmed ? "text-[#176b52]" : "text-[#94610c]"}`}>{confirmed ? <CheckCircle2 aria-hidden className="h-3.5 w-3.5" /> : <Clock3 aria-hidden className="h-3.5 w-3.5" />}{confirmed ? "Verified" : "Needs checking"}</span></li>;
}

export function ScholarshipReviewWorkspace({ slug, initialPayload, savedDraft, verificationStatus, lastVerifiedAt, migrationAvailable }: {
  slug: string; initialPayload: ScholarshipEditorPayload; savedDraft: ScholarshipEditorPayload | null;
  verificationStatus: string; lastVerifiedAt: string | null; migrationAvailable: boolean;
}) {
  const router = useRouter();
  const [payload, setPayload] = useState<ScholarshipEditorPayload>(savedDraft ?? initialPayload);
  const [baseline, setBaseline] = useState(() => JSON.stringify(savedDraft ?? initialPayload));
  const [hasSavedDraft, setHasSavedDraft] = useState(Boolean(savedDraft));
  const [verified, setVerified] = useState(verificationStatus === "verified");
  const [verifiedAt, setVerifiedAt] = useState(lastVerifiedAt);
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(payload) !== baseline;
  const pending = hasSavedDraft || dirty;
  function setField<K extends Exclude<keyof ScholarshipEditorPayload, "documents" | "appliesToStage">>(key: K, value: ScholarshipEditorPayload[K]) {
    setPayload((current) => ({ ...current, [key]: value }));
  }
  function setDocumentStatus(label: string, status: "required" | "not_confirmed" | "not_required") {
    setPayload((current) => ({ ...current, documents: current.documents.map((item) => item.label === label ? { ...item, status } : item) }));
  }
  function setStage(key: string, checked: boolean) {
    setPayload((current) => ({ ...current, appliesToStage: checked ? [...new Set([...current.appliesToStage, key])] : current.appliesToStage.filter((item) => item !== key) }));
  }
  async function submit(action: "save_draft" | "mark_verified") {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/scholarships/${encodeURIComponent(slug)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, scholarship: payload, reviewNote, confirmEvidence }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; lastVerifiedAt?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save the scholarship review.");
      setBaseline(JSON.stringify(payload));
      if (action === "save_draft") {
        setHasSavedDraft(true);
        setNotice("Draft saved privately. Approved catalogue values are unchanged.");
      } else {
        setHasSavedDraft(false);
        setVerified(true);
        setVerifiedAt(result.lastVerifiedAt ?? new Date().toISOString());
        setNotice("Scholarship cycle verified and published. The draft has been cleared.");
        setReviewNote("");
        setConfirmEvidence(false);
      }
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save the scholarship review.");
    } finally { setBusy(false); }
  }
  const documentReviewed = payload.documents.length === DOCUMENTS.length && DOCUMENTS.every((label) => payload.documents.some((item) => item.label === label));
  const supportExists = Boolean(payload.amountNote.trim() || payload.tuitionSupport.trim() || payload.maintenanceSupport.trim() || payload.renewalNote.trim());
  const eligibilityExists = Boolean(payload.eligibility.trim());
  const providerExists = Boolean(payload.provider.trim());
  const stageExists = payload.appliesToStage.length > 0;
  const deadlineExists = Boolean(payload.cycleLabel.trim() && payload.deadlineNote.trim());
  const sourceExists = Boolean(payload.sourceTitle.trim() && payload.sourceUrl.trim());
  return <div className="mx-auto max-w-[1240px]">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/catalogue/scholarships" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f0f5f2]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to scholarships</Link>
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${verified && !pending ? "border-[#c9e8dc] bg-[#e3f4ed] text-[#176c53]" : "border-[#f2dfb9] bg-[#fff5df] text-[#99620c]"}`}>{verified && !pending ? <CheckCircle2 aria-hidden className="h-4 w-4" /> : <AlertTriangle aria-hidden className="h-4 w-4" />}{pending ? "Needs verification" : verified ? "Verified" : "Needs verification"}</span>
    </div>
    <header className="flex flex-col justify-between gap-4 border-b border-[#dce5e0] pb-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue / Scholarships / {payload.name}</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">{payload.name}</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#53665e]">Review eligibility, support details, deadlines, and official evidence for this cycle.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void submit("save_draft")} disabled={busy || !migrationAvailable} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#344b41] hover:bg-[#f0f5f2] disabled:opacity-50"><Save aria-hidden className="h-4 w-4" />{busy ? "Saving…" : "Save draft"}</button><a href="#verification" className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-semibold text-[#17634b] underline underline-offset-2">More</a></div></header>
    {!migrationAvailable && <div role="alert" className="mt-5 rounded-lg border border-[#f1dfb6] bg-[#fff8e8] px-4 py-3 text-sm leading-relaxed text-[#71551d]">Scholarship detail storage is not available yet. Apply <code>src/db/migrations/0006_scholarship_detail_review.sql</code> before saving drafts or verifying records.</div>}
    {notice && <p role="status" className="mt-4 rounded-lg border border-[#c9e8dc] bg-[#e3f4ed] px-4 py-3 text-sm text-[#176c53]">{notice}</p>}
    <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <Section title="Scholarship identity" description="Keep the provider and applicable stage tied to this scholarship cycle.">
          <div className="grid gap-3 sm:grid-cols-2"><TextField label="Scholarship name" value={payload.name} onChange={(value) => setField("name", value)} pending={pending} verified={verified} placeholder="Scholarship name" /><TextField label="Provider" value={payload.provider} onChange={(value) => setField("provider", value)} pending={pending} verified={verified} placeholder="Provider not currently confirmed" /><label className="block text-sm font-semibold text-[#344b41]">Category<input value={payload.category} onChange={(event) => setField("category", event.target.value)} placeholder="Not currently confirmed" className={`${inputClass} mt-1.5`} /><FieldStatus value={payload.category} pending={pending} verified={verified} /></label><div><p className="text-sm font-semibold text-[#344b41]">Applicable education stage</p><div className="mt-2 grid gap-2 sm:grid-cols-2">{STAGES.map((item) => <label key={item.key} className="flex items-center gap-2 rounded-lg border border-[#e3eae6] px-3 py-2 text-sm text-[#344b41]"><input type="checkbox" checked={payload.appliesToStage.includes(item.key)} onChange={(event) => setStage(item.key, event.target.checked)} className="accent-[#145c42]" />{item.label}</label>)}</div><FieldStatus value={payload.appliesToStage.join(", ")} pending={pending} verified={verified} /></div><TextField label="Cycle" value={payload.cycleLabel} onChange={(value) => setField("cycleLabel", value)} pending={pending} verified={verified} placeholder="Use the cycle printed on the official notice" /></div>
        </Section>
        <section className="rounded-xl border border-[#ead9b4] bg-[#fffaf0] p-4 shadow-sm sm:p-5" aria-labelledby="deadline-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-[#91620f]">Cycle deadline</p><h2 id="deadline-heading" className="mt-1 text-lg font-bold text-[#362e1c]">Application deadline</h2><p className="mt-2 text-2xl font-semibold text-[#17392f]">{payload.deadlineNote.trim() || "Not currently confirmed"}</p><p className="mt-1 text-sm text-[#687970]">Cycle: {payload.cycleLabel.trim() || "Not currently confirmed"}</p></div><span className="rounded-full border border-[#f2dfb9] bg-white px-3 py-1.5 text-xs font-bold text-[#99620c]">{verified && !pending ? "Verified" : "Needs verification"}</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><TextField label="Deadline or honest status" value={payload.deadlineNote} onChange={(value) => setField("deadlineNote", value)} pending={pending} verified={verified} placeholder="As published / Not currently confirmed — never guess a date" /><div className="rounded-lg border border-[#efdfbf] bg-white p-3"><p className="text-xs text-[#687970]">Last checked</p><p className="mt-1 font-semibold text-[#344b41]">{prettyDate(verifiedAt)}</p></div></div></section>
        <Section title="Eligibility" description="Record only conditions supported by the current official notice. Empty sections remain explicitly unconfirmed.">
          <div className="grid gap-3">{([ ["eligibility", "Who can apply", "Summary from the current notice"], ["academicConditions", "Academic conditions", "Marks, subjects, enrollment or academic-year conditions"], ["incomeCategoryConditions", "Income or category conditions", "Income ceilings or eligible categories, if confirmed"], ["residencyConditions", "State or residency conditions", "Residency requirements, if confirmed"], ["otherConditions", "Other conditions", "Any additional eligibility conditions"]] as const).map(([key, label, placeholder]) => <TextField key={key} label={label} value={payload[key]} onChange={(value) => setField(key, value)} pending={pending} verified={verified} multiline placeholder="Not currently confirmed" />)}</div>
        </Section>
        <Section title="Support" description="Support details vary by cycle and should be checked in the official notice.">
          <div className="grid gap-3 sm:grid-cols-2"><TextField label="Amount or support note" value={payload.amountNote} onChange={(value) => setField("amountNote", value)} pending={pending} verified={verified} multiline placeholder="Not currently confirmed" /><TextField label="Tuition support" value={payload.tuitionSupport} onChange={(value) => setField("tuitionSupport", value)} pending={pending} verified={verified} multiline placeholder="Not currently confirmed" /><TextField label="Maintenance support" value={payload.maintenanceSupport} onChange={(value) => setField("maintenanceSupport", value)} pending={pending} verified={verified} multiline placeholder="Not currently confirmed" /><TextField label="Renewal note" value={payload.renewalNote} onChange={(value) => setField("renewalNote", value)} pending={pending} verified={verified} multiline placeholder="Not currently confirmed" /></div>
        </Section>
        <Section title="Required documents" description="Choose Required, Not required, or Not currently confirmed for each item. Unknown does not mean not required.">
          <div className="divide-y divide-[#e5ebe8]">{DOCUMENTS.map((label) => { const row = payload.documents.find((item) => item.label === label); const status = row?.status ?? "not_confirmed"; return <div key={label} className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center"><div className="flex items-start gap-2 text-sm font-medium text-[#344b41]"><FileCheck2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#17634b]" />{label}</div><select aria-label={`${label} status`} value={status} onChange={(event) => setDocumentStatus(label, event.target.value as "required" | "not_confirmed" | "not_required")} className={inputClass}><option value="not_confirmed">Not currently confirmed</option><option value="required">Required</option><option value="not_required">Not required</option></select></div>; })}</div>
        </Section>
      </div>
      <aside className="space-y-5 xl:sticky xl:top-5">
        <Section title="Official source" description="Keep the evidence title, link and retrieved date with the record.">
          <div className="space-y-3"><TextField label="Provider source / notice title" value={payload.sourceTitle} onChange={(value) => setField("sourceTitle", value)} pending={pending} verified={verified} placeholder="Official notice title" /><TextField id="source-url" type="url" label="Official evidence URL" value={payload.sourceUrl} onChange={(value) => setField("sourceUrl", value)} pending={pending} verified={verified} placeholder="https://…" /><TextField label="Official scholarship URL" value={payload.officialUrl} onChange={(value) => setField("officialUrl", value)} pending={pending} verified={verified} placeholder="May match the official evidence URL" /><TextField label="Retrieved date" type="date" value={payload.sourceRetrievedAt} onChange={(value) => setField("sourceRetrievedAt", value)} pending={pending} verified={verified} /><div className="rounded-lg bg-[#f4f7f5] p-3 text-sm"><p className="text-xs text-[#687970]">Last verified</p><p className="mt-1 font-semibold text-[#344b41]">{prettyDate(verifiedAt)}</p><p className="mt-2 text-xs text-[#687970]">Source status: {verified && !pending ? "Verified" : "Needs checking"}</p></div><a href="#source-url" className="mr-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-bold text-[#17634b] hover:bg-[#f0f5f2]">Add source</a>{payload.sourceUrl && <a href={payload.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-bold text-[#17634b] hover:bg-[#f0f5f2]">Open source <ExternalLink aria-hidden className="h-4 w-4" /></a>}</div>
        </Section>
        <Section title="Verification checklist" description="Unconfirmed information remains visible; a checked source does not fill missing details.">
          <ul><CheckStatus label="Provider" value={providerExists} verified={verified} pending={pending} /><CheckStatus label="Applicable stage" value={stageExists} verified={verified} pending={pending} /><CheckStatus label="Eligibility" value={eligibilityExists} verified={verified} pending={pending} /><CheckStatus label="Deadline and cycle" value={deadlineExists} verified={verified} pending={pending} /><CheckStatus label="Support details" value={supportExists} verified={verified} pending={pending} /><CheckStatus label="Documents reviewed" value={documentReviewed} verified={verified} pending={pending} /><CheckStatus label="Official source" value={sourceExists} verified={verified} pending={pending} /></ul>
        </Section>
        <Section title="Reviewer decision" description="Verify only after checking the current official source and cycle context.">
          <label className="block text-sm font-semibold text-[#344b41]">Review note<textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} rows={4} maxLength={500} placeholder="What did you check, and for which cycle?" className={`${inputClass} mt-1.5 min-h-24 resize-y`} /></label>
          <label className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[#344b41]"><input type="checkbox" checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-1 accent-[#145c42]" />I checked this cycle’s eligibility, support, deadline and document statuses against the official notice.</label>
          {error && <p role="alert" className="mt-3 rounded-lg border border-[#efc9c4] bg-[#fff2f0] p-3 text-sm text-[#9e4038]">{error}</p>}
          <button id="verification" type="button" onClick={() => void submit("mark_verified")} disabled={busy || !migrationAvailable || !confirmEvidence || reviewNote.trim().length < 8} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck aria-hidden className="h-4 w-4" />{busy ? "Saving…" : "Mark verified"}</button>
          <p className="mt-3 text-xs leading-relaxed text-[#687970]">Saving a draft does not change student-facing values. Verification publishes this cycle and records an audit event.</p>
        </Section>
      </aside>
    </div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4"><p className="text-sm text-[#687970]">{pending ? "Unpublished draft changes" : verified ? `Last verified ${prettyDate(verifiedAt)}` : "Needs verification"}</p><div className="flex gap-2"><Link href="/admin/catalogue/scholarships" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41]">Back</Link><button type="button" onClick={() => void submit("save_draft")} disabled={busy || !migrationAvailable} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] disabled:opacity-50"><Save aria-hidden className="h-4 w-4" />Save draft</button><button type="button" onClick={() => void submit("mark_verified")} disabled={busy || !migrationAvailable || !confirmEvidence || reviewNote.trim().length < 8} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white disabled:opacity-50"><Check aria-hidden className="h-4 w-4" />Mark verified</button></div></div>
    <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#687970]"><Landmark aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />Never publish an old deadline without a cycle, invent an award amount, claim a scholarship is open without evidence, or hide missing eligibility details.</p>
  </div>;
}
