"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, CheckCircle2, Clock3, FileText, LoaderCircle, ShieldCheck } from "lucide-react";

type DocumentState = "required" | "not_confirmed";
type ExamDraft = {
  name: string;
  shortName: string;
  conductingBody: string;
  levelStage: string;
  appliesTo: string[];
  cycleLabel: string;
  applicationPeriod: string;
  examDate: string;
  correctionWindow: string;
  resultDate: string;
  eligibility: string;
  requiredSubjects: string[];
  minimumAcademicCondition: string;
  ageAttemptNotes: string;
  documentStatus: Record<string, DocumentState>;
  preparation: string[];
  sourceUrl: string;
};
type Props = {
  slug: string;
  exam: ExamDraft;
  verificationStatus: string;
  lastVerifiedAt: string | null;
  savedReviewDraft: boolean;
  studentHref: string;
};

const DOCUMENTS = ["Photograph", "Signature", "Identity document", "Academic details", "Category certificate, if applicable"] as const;
const VERIFIED_STATUSES = new Set(["verified", "current", "published_verified", "recently_verified"]);
const inputClass = "mt-1.5 min-h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 py-2 text-sm text-[#263b33] outline-none transition placeholder:text-[#819087] focus:border-[#176b52] focus:ring-2 focus:ring-[#d9eee3]";
const labelClass = "block text-sm font-semibold text-[#344b41]";
const dateLabel = (value: string | null) => {
  if (!value) return "Not checked";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not checked" : date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
};
const safeHttpUrl = (value: string) => {
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.toString() : null; }
  catch { return null; }
};
const asLines = (items: string[]) => items.join("\n");
const fromLines = (value: string) => [...new Set(value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean))];

function FieldStatus({ value, verified, draftActive }: { value: string; verified: boolean; draftActive: boolean }) {
  const text = !value.trim() ? "Not currently confirmed" : draftActive ? "Draft · needs checking" : verified ? "Verified against source" : "Needs verification";
  const className = !value.trim() ? "text-[#9a6a12]" : draftActive || !verified ? "text-[#94610c]" : "text-[#176b52]";
  return <span className={`inline-flex items-center gap-1 text-xs font-semibold ${className}`}><Clock3 aria-hidden className="h-3.5 w-3.5" />{text}</span>;
}

function Field({ label, value, onChange, verified, draftActive, placeholder, multiline = false, rows = 3, hint }: {
  label: string; value: string; onChange: (value: string) => void; verified: boolean; draftActive: boolean;
  placeholder?: string; multiline?: boolean; rows?: number; hint?: string;
}) {
  return <div className="grid gap-2 border-t border-[#edf1ef] py-3 sm:grid-cols-[minmax(145px,.55fr)_minmax(0,1fr)] sm:items-start">
    <div className="pt-2"><p className="text-sm font-medium text-[#34443c]">{label}</p><FieldStatus value={value} verified={verified} draftActive={draftActive} /></div>
    <div>{multiline ? <textarea aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} className={`${inputClass} min-h-24 resize-y leading-relaxed`} /> : <input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={inputClass} />}{hint && <p className="mt-1.5 text-xs leading-relaxed text-[#687970]">{hint}</p>}</div>
  </div>;
}

function Section({ title, description, icon, children, className = "" }: { title: string; description?: string; icon: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5 ${className}`}>
    <div className="mb-2 flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#edf6f1] text-[#176b52]">{icon}</span><div><h2 className="text-lg font-bold text-[#172b35]">{title}</h2>{description && <p className="mt-0.5 text-sm leading-relaxed text-[#68756d]">{description}</p>}</div></div>
    {children}
  </section>;
}

export function ExamReviewWorkspace({ slug, exam, verificationStatus, lastVerifiedAt, savedReviewDraft, studentHref }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExamDraft>(exam);
  const [draftActive, setDraftActive] = useState(savedReviewDraft);
  const [baseline, setBaseline] = useState(() => JSON.stringify(exam));
  const hasPendingDraft = draftActive || JSON.stringify(draft) !== baseline;
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const verified = VERIFIED_STATUSES.has(verificationStatus.toLowerCase());
  const officialUrl = safeHttpUrl(draft.sourceUrl);
  const hasRequiredDetails = Boolean(
    draft.name.trim() && draft.conductingBody.trim() && draft.levelStage && draft.cycleLabel.trim() &&
    draft.applicationPeriod.trim() && draft.examDate.trim() && draft.eligibility.trim() && officialUrl,
  );
  const checklist = useMemo(() => [
    { label: "Identity and conducting body", ok: Boolean(draft.name.trim() && draft.conductingBody.trim()) },
    { label: "Education stage", ok: Boolean(draft.levelStage) },
    { label: "Eligibility", ok: Boolean(draft.eligibility.trim()) },
    { label: "Application period", ok: Boolean(draft.cycleLabel.trim() && draft.applicationPeriod.trim()) },
    { label: "Exam date", ok: Boolean(draft.cycleLabel.trim() && draft.examDate.trim()) },
    { label: "Documents", ok: DOCUMENTS.every((label) => draft.documentStatus[label] === "required" || draft.documentStatus[label] === "not_confirmed") },
    { label: "Official source", ok: Boolean(officialUrl) },
  ], [draft, officialUrl]);
  const completeCount = checklist.filter((item) => item.ok).length;
  const setValue = (key: keyof Omit<ExamDraft, "appliesTo" | "requiredSubjects" | "preparation" | "documentStatus">, value: string) => setDraft((current) => ({ ...current, [key]: value }));
  const setList = (key: "appliesTo" | "requiredSubjects" | "preparation", value: string) => setDraft((current) => ({ ...current, [key]: fromLines(value) }));
  const setDocumentStatus = (label: string, value: DocumentState) => setDraft((current) => ({ ...current, documentStatus: { ...current.documentStatus, [label]: value } }));

  async function submit(action: "save_draft" | "mark_verified", event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/exams/${encodeURIComponent(slug)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, exam: draft, ...(action === "mark_verified" ? { reviewNote, confirmEvidence } : {}) }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; verificationStatus?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not save the exam review.");
      if (action === "save_draft") {
        setBaseline(JSON.stringify(draft));
        setDraftActive(true);
        setMessage("Draft saved privately for review. Published exam details and verification status have not changed.");
      } else {
        setBaseline(JSON.stringify(draft));
        setDraftActive(false);
        setReviewNote(""); setConfirmEvidence(false);
        setMessage("Exam details verified and published for this cycle. The review is recorded in change history.");
      }
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the exam review."); }
    finally { setBusy(false); }
  }

  return <div className="space-y-5 pb-16">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/admin/catalogue/exams" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><ArrowLeft aria-hidden className="h-4 w-4" />Back to entrance exams</Link>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void submit("save_draft")} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6] disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}Save draft</button>
        <button type="submit" form="exam-verify-form" disabled={busy || !hasRequiredDetails || !confirmEvidence || reviewNote.trim().length < 8} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#087663] px-4 text-sm font-bold text-white hover:bg-[#066450] disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck className="h-4 w-4" />Mark verified</button>
        <Link href={studentHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">More <ArrowUpRight aria-hidden className="h-4 w-4" /></Link>
      </div>
    </div>

    <header className="rounded-xl border border-[#d9e3de] bg-white px-5 py-5 shadow-sm sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue / Entrance exams / {exam.shortName || exam.name}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">{draft.name || exam.name}</h1>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${verified ? "border-[#c9e8dc] bg-[#e3f4ed] text-[#176c53]" : "border-[#f2dfb9] bg-[#fff5df] text-[#99620c]"}`}>{verified ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}{verified ? "Verified" : "Needs verification"}</span>
        {draftActive && <span className="rounded-full border border-[#d8d1ef] bg-[#f3f0fc] px-3 py-1.5 text-xs font-bold text-[#625390]">Unpublished draft</span>}
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#53665e]">Review eligibility and cycle-specific dates before this exam is shown to students. Saved edits remain unpublished until the review is verified.</p>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#53665e]"><span className="rounded-md bg-[#f1f5f3] px-2.5 py-1.5">Cycle: {draft.cycleLabel || "Not recorded"}</span><span className="rounded-md bg-[#f1f5f3] px-2.5 py-1.5">Last checked: {dateLabel(lastVerifiedAt)}</span><span className="rounded-md bg-[#f1f5f3] px-2.5 py-1.5">Source status: {verified ? "Verified" : "Needs verification"}</span></div>
    </header>

    <div role="note" className="flex items-start gap-3 rounded-lg border border-[#f1dfb6] bg-[#fff8e8] px-4 py-3 text-sm leading-relaxed text-[#71551d]"><AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#b07813]" /><p><strong>Dates are cycle-specific.</strong> Verify the active official notice before publishing. Never copy dates from an older cycle; use “Not currently confirmed” if the notice was checked but does not confirm a detail.</p></div>

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,.85fr)]">
      <div className="space-y-5">
        <Section title="Exam identity" description="The exam name, conducting authority, stage, and programmes it applies to." icon={<BookOpen aria-hidden className="h-5 w-5" />}>
          <Field label="Exam name" value={draft.name} onChange={(value) => setValue("name", value)} verified={verified} draftActive={hasPendingDraft} />
          <Field label="Short name" value={draft.shortName} onChange={(value) => setValue("shortName", value)} verified={verified} draftActive={hasPendingDraft} placeholder="Optional" />
          <Field label="Conducting body" value={draft.conductingBody} onChange={(value) => setValue("conductingBody", value)} verified={verified} draftActive={hasPendingDraft} placeholder="Not currently confirmed" />
          <div className="grid gap-2 border-t border-[#edf1ef] py-3 sm:grid-cols-[minmax(145px,.55fr)_minmax(0,1fr)] sm:items-start"><div className="pt-2"><p className="text-sm font-medium text-[#34443c]">Education stage</p><FieldStatus value={draft.levelStage} verified={verified} draftActive={hasPendingDraft} /></div><select aria-label="Education stage" value={draft.levelStage} onChange={(event) => setValue("levelStage", event.target.value)} className={inputClass}><option value="">Select stage</option><option value="after_class10">After Class 10</option><option value="after_class12">After Class 12</option></select></div>
          <Field label="Applies to" value={asLines(draft.appliesTo)} onChange={(value) => setList("appliesTo", value)} verified={verified} draftActive={hasPendingDraft} multiline placeholder="List applicable programmes, one per line" />
        </Section>

        <Section title="Cycle and dates" description="Keep each exam record anchored to one cycle. Do not combine separate years." icon={<CalendarDays aria-hidden className="h-5 w-5" />}>
          <Field label="Cycle" value={draft.cycleLabel} onChange={(value) => setValue("cycleLabel", value)} verified={verified} draftActive={hasPendingDraft} placeholder="Enter cycle from the current official notice" />
          <Field label="Application period" value={draft.applicationPeriod} onChange={(value) => setValue("applicationPeriod", value)} verified={verified} draftActive={hasPendingDraft} placeholder="As published / Not currently confirmed" />
          <Field label="Exam date" value={draft.examDate} onChange={(value) => setValue("examDate", value)} verified={verified} draftActive={hasPendingDraft} placeholder="As published / Not currently confirmed" />
          <Field label="Correction window" value={draft.correctionWindow} onChange={(value) => setValue("correctionWindow", value)} verified={verified} draftActive={hasPendingDraft} placeholder="Not currently confirmed" />
          <Field label="Result date" value={draft.resultDate} onChange={(value) => setValue("resultDate", value)} verified={verified} draftActive={hasPendingDraft} placeholder="Not currently confirmed" />
        </Section>

        <Section title="Eligibility" description="Separate the summary from individual rules. Only include statements supported by the official source." icon={<ShieldCheck aria-hidden className="h-5 w-5" />}>
          <Field label="Eligibility summary" value={draft.eligibility} onChange={(value) => setValue("eligibility", value)} verified={verified} draftActive={hasPendingDraft} multiline placeholder="Not currently confirmed" />
          <Field label="Required subjects" value={asLines(draft.requiredSubjects)} onChange={(value) => setList("requiredSubjects", value)} verified={verified} draftActive={hasPendingDraft} multiline placeholder="List subjects only when confirmed; one per line" />
          <Field label="Minimum academic condition" value={draft.minimumAcademicCondition} onChange={(value) => setValue("minimumAcademicCondition", value)} verified={verified} draftActive={hasPendingDraft} multiline placeholder="Not currently confirmed" />
          <Field label="Age or attempt notes" value={draft.ageAttemptNotes} onChange={(value) => setValue("ageAttemptNotes", value)} verified={verified} draftActive={hasPendingDraft} multiline placeholder="Not currently confirmed" />
        </Section>

        <Section title="Documents" description="Absence of a document entry does not mean it is not required. Mark each item only as required or not currently confirmed." icon={<FileText aria-hidden className="h-5 w-5" />}>
          <div className="mt-3 overflow-hidden rounded-lg border border-[#e2e9e5]"><div className="grid grid-cols-[minmax(0,1fr)_170px] bg-[#f4f7f5] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-[#53665e]"><span>Document</span><span>Status</span></div>
            {DOCUMENTS.map((label) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_170px] items-center gap-2 border-t border-[#edf1ef] px-3 py-2.5"><span className="text-sm text-[#34443c]">{label}</span><select aria-label={`${label} status`} value={draft.documentStatus[label] ?? "not_confirmed"} onChange={(event) => setDocumentStatus(label, event.target.value as DocumentState)} className="min-h-10 rounded-md border border-[#cbd8d2] bg-white px-2 text-xs font-semibold text-[#344b41]"><option value="not_confirmed">Not confirmed</option><option value="required">Required</option></select></div>)}
          </div>
        </Section>

        <Section title="Preparation notes" description="Add only official or evidence-backed preparation details; no unsupported claims." icon={<BookOpen aria-hidden className="h-5 w-5" />}>
          <label className={labelClass}>Notes<textarea aria-label="Preparation notes" value={asLines(draft.preparation)} onChange={(event) => setList("preparation", event.target.value)} placeholder="Add verified notes, one per line" rows={4} className={`${inputClass} resize-y leading-relaxed`} /></label>
          <p className="mt-1.5 text-xs text-[#687970]">Leave blank when no preparation guidance has been confirmed.</p>
        </Section>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-5">
        <Section title="Official source" description="Evidence behind the active cycle and eligibility details." icon={<FileText aria-hidden className="h-5 w-5" />}>
          <div className="mt-2 rounded-lg border border-[#e2e9e5] bg-[#fbfcfb] p-3.5">
            <p className="text-xs font-bold uppercase tracking-wide text-[#687970]">Official examination authority</p>
            <p className="mt-1 text-sm font-semibold text-[#263b33]">{draft.conductingBody || "Not currently confirmed"}</p>
            <p className="mt-3 text-xs font-semibold text-[#53665e]">Official website / source URL</p>
            {officialUrl ? <a href={officialUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 break-all text-sm text-[#176b52] underline">{draft.sourceUrl}<ArrowUpRight aria-hidden className="h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-1 text-sm text-[#9a6a12]">Not attached</p>}
            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[#e3e9e5] pt-3 text-xs"><div><p className="text-[#68756d]">Last checked</p><p className="mt-1 font-semibold text-[#263b33]">{dateLabel(lastVerifiedAt)}</p></div><div><p className="text-[#68756d]">Source status</p><p className={`mt-1 font-semibold ${verified && !hasPendingDraft ? "text-[#176b52]" : "text-[#94610c]"}`}>{verified && !hasPendingDraft ? "Verified" : "Needs verification"}</p></div></div>
          </div>
          <label className={`${labelClass} mt-3`}>Add or update official source<input aria-label="Official source URL" type="url" inputMode="url" value={draft.sourceUrl} onChange={(event) => setValue("sourceUrl", event.target.value)} placeholder="https://official.example/exams" className={inputClass} /></label>
          <p className="mt-1.5 text-xs leading-relaxed text-[#687970]">Saving a draft does not change the published source. Mark verified only after checking the current official notice.</p>
          <p className="mt-3 text-xs font-medium text-[#53665e]">Last verified: {dateLabel(lastVerifiedAt)} · Current status: {verified ? "Verified" : "Needs verification"}</p>
        </Section>

        <Section title="Verification checklist" description="Cycle and evidence must be clear before publishing." icon={<CheckCircle2 aria-hidden className="h-5 w-5" />}>
          <div className="mt-2 flex items-center justify-between text-xs text-[#53665e]"><span>Record readiness</span><strong>{completeCount}/{checklist.length}</strong></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#e4ebe7]" role="progressbar" aria-label="Verification checklist complete" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={completeCount}><div className="h-full rounded-full bg-[#1b7654] transition-all" style={{ width: `${Math.round(completeCount / checklist.length * 100)}%` }} /></div>
          <ul className="mt-3 divide-y divide-[#edf1ef]">{checklist.map((item) => <li key={item.label} className="flex items-center justify-between gap-2 py-2.5 text-sm"><span className="flex items-center gap-2 text-[#34443c]">{item.ok ? <Check className="h-4 w-4 text-[#176b52]" /> : <Clock3 className="h-4 w-4 text-[#a46d0c]" />}{item.label}</span><span className={`text-xs font-semibold ${item.ok ? "text-[#176b52]" : "text-[#94610c]"}`}>{item.ok ? "Ready to review" : "Needs checking"}</span></li>)}</ul>
        </Section>

        <form id="exam-verify-form" onSubmit={(event) => void submit("mark_verified", event)} className="rounded-xl border-2 border-[#176447] bg-[#eaf4ef] p-5 shadow-sm">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#145c42] text-white"><ShieldCheck aria-hidden className="h-5 w-5" /></span><div><p className="text-xs font-bold uppercase tracking-wide text-[#145c42]">Publish after review</p><h2 className="mt-1 text-base font-bold text-[#173d2e]">Mark exam verified</h2><p className="mt-1 text-xs leading-relaxed text-[#42584e]">This applies the current draft to the student-facing catalogue and records the reviewer and evidence.</p></div></div>
          <label className={`${labelClass} mt-4`}>Review note<textarea required minLength={8} maxLength={500} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="What did you confirm against the official notice?" rows={3} className="mt-1.5 w-full rounded-lg border border-[#aebfb5] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#12664f] focus:ring-2 focus:ring-[#b9d9c8]" /></label>
          <label className="mt-3 flex items-start gap-2 rounded-lg border border-[#c3d8cb] bg-white/80 p-3 text-xs leading-relaxed text-[#344b41]"><input type="checkbox" checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#12664f]" /><span>I checked this record against the current official source and confirmed the selected cycle. Any unknown values are labelled honestly.</span></label>
          <button type="submit" disabled={busy || !hasRequiredDetails || !confirmEvidence || reviewNote.trim().length < 8} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:bg-[#7b9287]">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}Mark verified</button>
          {(!hasRequiredDetails || !officialUrl) && <p className="mt-2 text-xs leading-relaxed text-[#765913]">Add the cycle, application period, exam date, eligibility summary, conducting body, and valid official source before verification.</p>}
        </form>

        <Link href="/admin/change-history" className="flex items-center justify-between rounded-xl border border-[#d4dfda] bg-white p-4 text-sm font-semibold text-[#263b33] shadow-sm hover:bg-[#f8faf9]"><span>Change history<span className="mt-0.5 block text-xs font-normal text-[#68756d]">Review recorded drafts and verification decisions.</span></span><ArrowUpRight aria-hidden className="h-4 w-4" /></Link>
      </aside>
    </div>
    {(error || message) && <p role={error ? "alert" : "status"} className={`fixed bottom-4 right-4 z-50 max-w-xl rounded-lg border p-4 text-sm font-semibold shadow-lg ${error ? "border-[#e4b6b1] bg-[#fff0ef] text-[#9b3027]" : "border-[#a9d0b9] bg-[#e6f4eb] text-[#145c42]"}`}>{error || message}</p>}
  </div>;
}
