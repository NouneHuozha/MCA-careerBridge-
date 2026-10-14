"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, CheckCircle2, ExternalLink, FilePlus2, LoaderCircle, Plus, Save, ShieldCheck, Trash2 } from "lucide-react";
import type { AdmissionEditorPayload } from "@/db/schema";

type InstitutionOption = { code: string; name: string; admissionPortal?: string | null };
type CourseOption = { slug: string; name: string };
type ImportantDate = AdmissionEditorPayload["importantDates"][number];
type Requirement = AdmissionEditorPayload["documentRequirements"][number];
type StoredImportantDate = { label: string; value: string; sourceTitle?: string | null; sourceUrl?: string | null; verificationStatus?: string };
type StoredRequirement = { label: string; status: "required" | "not_confirmed" | "not_required"; sourceUrl?: string | null };
type AdmissionRecord = {
  id: number; institutionCode: string | null; courseSlug: string | null; cycleLabel: string | null; applicationWindow: string | null;
  applicationStartDate: string | null; applicationEndDate: string | null; applicationWindowStatus: string;
  importantDates: StoredImportantDate[] | null; process: string[] | null; documents: string[] | null; documentRequirements: StoredRequirement[] | null;
  applicationFeeNote: string | null; courseFeeNote: string | null; feesNote: string | null; sourceTitle: string | null; sourceUrl: string | null;
  retrievedAt: string | null; lastVerifiedAt: string | null; verificationStatus: string;
};
type Draft = { id: number; admissionId: number | null; payload: AdmissionEditorPayload; reviewNote: string | null; updatedAt: string };
type Props = {
  institution: InstitutionOption;
  institutions: InstitutionOption[];
  courses: CourseOption[];
  records: AdmissionRecord[];
  drafts: Draft[];
  initialRecordId: string;
  initialDraftId: number | null;
  draftStorageAvailable: boolean;
};

const exampleProcess = [
  "Check eligibility",
  "Complete the institution application",
  "Upload required documents",
  "Pay the application fee if applicable",
  "Monitor the official notice for next steps",
];
const exampleDocuments = [
  "Class 10 certificate",
  "Class 12 certificate or current result evidence",
  "Identity document",
  "Passport photograph",
  "Category certificate, if applicable",
  "Other institution-specific documents",
];
const checks: { key: keyof AdmissionEditorPayload["confirmations"]; label: string }[] = [
  { key: "cycle", label: "Cycle confirmed" },
  { key: "applicationWindow", label: "Application window confirmed" },
  { key: "process", label: "Process confirmed" },
  { key: "documents", label: "Documents confirmed" },
  { key: "feeNote", label: "Fee note confirmed" },
  { key: "applicationLink", label: "Application link confirmed" },
];
const initialConfirmations = () => ({ cycle: false, applicationWindow: false, process: false, documents: false, feeNote: false, applicationLink: false });
const blankPayload = (): AdmissionEditorPayload => ({
  courseSlug: null, cycleLabel: "", applicationStartDate: "", applicationEndDate: "", applicationWindowStatus: "not_confirmed",
  importantDates: ["Application opens", "Application closes", "Merit list"].map((label) => ({ label, value: "", sourceTitle: "", sourceUrl: "", verificationStatus: "needs_verification" as const })),
  process: exampleProcess.slice(),
  documentRequirements: exampleDocuments.map((label) => ({ label, status: "not_confirmed" as const, sourceUrl: "" })),
  applicationFeeNote: "", courseFeeNote: "", sourceTitle: "", sourceUrl: "", sourceRetrievedAt: "", confirmations: initialConfirmations(),
});
function fromRecord(record: AdmissionRecord | undefined): AdmissionEditorPayload {
  if (!record) return blankPayload();
  const verified = ["verified", "current", "recently_verified", "published_verified", "approved"].includes(record.verificationStatus);
  const requirements = record.documentRequirements?.length
    ? record.documentRequirements.map((row) => ({ label: row.label, status: row.status, sourceUrl: row.sourceUrl ?? "" }))
    : (record.documents ?? []).map((label) => ({ label, status: verified ? "required" as const : "not_confirmed" as const, sourceUrl: record.sourceUrl ?? "" }));
  const importantDates = (record.importantDates ?? []).map((row) => ({
    label: row.label, value: row.value, sourceTitle: row.sourceTitle ?? record.sourceTitle ?? "", sourceUrl: row.sourceUrl ?? record.sourceUrl ?? "",
    verificationStatus: (row.verificationStatus === "verified" || row.verificationStatus === "not_available" ? row.verificationStatus : "needs_verification") as ImportantDate["verificationStatus"],
  }));
  return {
    courseSlug: record.courseSlug,
    cycleLabel: record.cycleLabel ?? "",
    applicationStartDate: record.applicationStartDate ?? "",
    applicationEndDate: record.applicationEndDate ?? "",
    applicationWindowStatus: record.applicationWindowStatus === "confirmed" ? "confirmed" : "not_confirmed",
    importantDates: importantDates.length ? importantDates : blankPayload().importantDates,
    process: record.process?.length ? record.process : [],
    documentRequirements: requirements.length ? requirements : blankPayload().documentRequirements,
    applicationFeeNote: record.applicationFeeNote ?? "",
    courseFeeNote: record.courseFeeNote ?? record.feesNote ?? "",
    sourceTitle: record.sourceTitle ?? "",
    sourceUrl: record.sourceUrl ?? "",
    sourceRetrievedAt: record.retrievedAt ? record.retrievedAt.slice(0, 10) : "",
    confirmations: initialConfirmations(),
  };
}
function statusName(value: string) {
  if (["verified", "current", "recently_verified", "published_verified", "approved"].includes(value)) return "Verified";
  if (["unavailable", "blocked"].includes(value)) return "Unavailable";
  return "Needs verification";
}
function Panel({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[#d7e1dc] bg-white p-5 shadow-sm sm:p-6"><div className="mb-4 border-b border-[#e3eae6] pb-3"><h2 className="text-lg font-bold text-[#203a30]">{title}</h2>{description && <p className="mt-1 text-sm leading-relaxed text-[#64756d]">{description}</p>}</div>{children}</section>;
}
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block text-sm font-semibold text-[#344b41]">{label}{children}<span className="mt-1.5 block">{hint && <span className="text-xs font-normal leading-relaxed text-[#687970]">{hint}</span>}</span></label>;
}
const inputClass = "mt-1.5 min-h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 py-2 text-sm font-medium text-[#263d32] outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15";
const buttonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f3f7f5] disabled:cursor-not-allowed disabled:opacity-50";

export function AdmissionInformationEditor({ institution, institutions, courses, records, drafts, initialRecordId, initialDraftId, draftStorageAvailable }: Props) {
  const router = useRouter();
  const selectedInitialRecord = records.find((record) => String(record.id) === initialRecordId);
  const selectedInitialDraft = drafts.find((draft) => draft.id === initialDraftId) ?? drafts.find((draft) => selectedInitialRecord && draft.admissionId === selectedInitialRecord.id) ?? (!selectedInitialRecord ? drafts.find((draft) => draft.admissionId === null) : undefined);
  const [draftList, setDraftList] = useState(drafts);
  const [recordId, setRecordId] = useState(selectedInitialRecord ? String(selectedInitialRecord.id) : "new");
  const [draftId, setDraftId] = useState<number | null>(selectedInitialDraft?.id ?? null);
  const [payload, setPayload] = useState<AdmissionEditorPayload>(selectedInitialDraft?.payload ?? fromRecord(selectedInitialRecord));
  const [reviewNote, setReviewNote] = useState(selectedInitialDraft?.reviewNote ?? "");
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState(false);
  const [publishedNow, setPublishedNow] = useState(false);
  const selectedRecord = records.find((record) => String(record.id) === recordId);
  const cycles = useMemo(() => [...new Set(records.map((record) => record.cycleLabel).filter((value): value is string => Boolean(value)))], [records]);
  const checklistComplete = checks.every(({ key }) => payload.confirmations[key]);

  function updatePayload<K extends keyof AdmissionEditorPayload>(key: K, value: AdmissionEditorPayload[K]) {
    setPayload((current) => ({ ...current, [key]: value })); setDirty(true); setMessage("");
  }
  function updateDate(index: number, key: keyof ImportantDate, value: string) {
    updatePayload("importantDates", payload.importantDates.map((row, itemIndex) => itemIndex === index ? { ...row, [key]: value } : row));
  }
  function updateDocument(index: number, key: keyof Requirement, value: string) {
    updatePayload("documentRequirements", payload.documentRequirements.map((row, itemIndex) => itemIndex === index ? { ...row, [key]: value } : row));
  }
  function updateConfirmation(key: keyof AdmissionEditorPayload["confirmations"], value: boolean) {
    updatePayload("confirmations", { ...payload.confirmations, [key]: value });
  }
  function switchRecord(value: string) {
    if (dirty && !window.confirm("Discard unsaved changes and open another admission record?")) return;
    const record = records.find((item) => String(item.id) === value);
    const draft = draftList.find((item) => item.admissionId === (record?.id ?? null));
    setRecordId(value); setDraftId(draft?.id ?? null); setPayload(draft?.payload ?? fromRecord(record)); setReviewNote(draft?.reviewNote ?? ""); setDirty(false); setMessage(""); setPublishedNow(false);
  }
  function switchInstitution(nextCode: string) {
    if (nextCode === institution.code) return;
    if (dirty && !window.confirm("Discard unsaved changes and open another institution?")) return;
    router.push(`/admin/catalogue/institutions/${encodeURIComponent(nextCode)}/admission`);
  }
  async function saveDraft() {
    setBusy(true); setMessage(""); setMessageError(false);
    try {
      const response = await fetch(`/api/admin/admissions/${encodeURIComponent(institution.code)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save_draft", admissionId: selectedRecord?.id ?? null, draftId, payload, reviewNote }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not save this draft.");
      setDraftId(body.draftId); setDraftList((current) => [{ id: body.draftId, admissionId: selectedRecord?.id ?? null, payload, reviewNote: reviewNote || null, updatedAt: new Date().toISOString() }, ...current.filter((item) => item.id !== body.draftId)]); setDirty(false); setMessage("Draft saved. The previous approved admission information remains unchanged for students.");
      router.replace(`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}/admission?${selectedRecord ? `recordId=${selectedRecord.id}&` : ""}draftId=${body.draftId}`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save this draft."); setMessageError(true); }
    finally { setBusy(false); }
  }
  async function markVerified() {
    setBusy(true); setMessage(""); setMessageError(false);
    try {
      const response = await fetch(`/api/admin/admissions/${encodeURIComponent(institution.code)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "mark_verified", admissionId: selectedRecord?.id ?? null, draftId, payload, reviewNote }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Could not verify this admission information.");
      setRecordId(String(body.admissionId)); setDraftId(null); setDraftList((current) => current.filter((item) => item.id !== draftId)); setDirty(false); setPublishedNow(true);
      setMessage("Admission information verified. This cycle's approved values are now available to students.");
      router.replace(`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}/admission?recordId=${body.admissionId}`);
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not verify this admission information."); setMessageError(true); }
    finally { setBusy(false); }
  }
  function moveStep(index: number, offset: -1 | 1) {
    const next = payload.process.slice(); const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; updatePayload("process", next);
  }

  return <>
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-sm text-[#53665e]"><Link href="/admin/catalogue" className="hover:text-[#145c42]">Catalogue</Link><span aria-hidden>/</span><Link href="/admin/catalogue/institutions" className="hover:text-[#145c42]">Institutions</Link><span aria-hidden>/</span><Link href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className="hover:text-[#145c42]">{institution.name}</Link><span aria-hidden>/</span><span className="font-semibold text-[#263d32]">Admission information</span></nav>
    <header className="flex flex-col gap-4 border-b border-[#dce5e0] pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue management</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Admission information</h1><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#53665e]">Review application windows, requirements, documents, and source evidence for this institution.</p></div>
      <div className="flex flex-wrap items-center gap-2"><Link href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className={buttonClass}>Back</Link><button type="button" onClick={saveDraft} disabled={busy || !draftStorageAvailable} className={buttonClass}><Save className="h-4 w-4"/>Save draft</button><button type="button" onClick={markVerified} disabled={busy || !checklistComplete} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck className="h-4 w-4"/>Mark verified</button></div>
    </header>

    {!draftStorageAvailable && <div role="alert" className="mt-5 rounded-xl border border-[#efd5a8] bg-[#fff8e8] p-4 text-sm text-[#72571b]">Draft storage is not available yet. Apply database migration <code>0005_admission_information_editor.sql</code> before saving or publishing admission information.</div>}
    {selectedRecord && (selectedRecord.verificationStatus === "verified" || selectedRecord.verificationStatus === "approved" || selectedRecord.verificationStatus === "current" || selectedRecord.verificationStatus === "published_verified") && <div className="mt-5 flex gap-3 rounded-xl border border-[#c6e4d3] bg-[#eef8f2] p-4 text-sm leading-relaxed text-[#315b47]"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0"/><p><strong>Approved information is protected.</strong> Changes in this editor remain unpublished as a draft. The current approved values stay available to students until a reviewer marks the completed record verified.</p></div>}

    <div className="mt-5 grid gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
      <Field label="Institution"><select className={inputClass} value={institution.code} onChange={(event) => switchInstitution(event.target.value)}>{institutions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></Field>
      <Field label="Open admission record"><select className={inputClass} value={recordId} onChange={(event) => switchRecord(event.target.value)}><option value="new">New admission cycle</option>{records.map((record) => <option key={record.id} value={record.id}>{record.cycleLabel || "Cycle not specified"} · {record.courseSlug ? courses.find((course) => course.slug === record.courseSlug)?.name ?? record.courseSlug : "Institution-wide"}</option>)}</select></Field>
      <Field label="Course"><select className={inputClass} value={payload.courseSlug ?? ""} onChange={(event) => updatePayload("courseSlug", event.target.value || null)}><option value="">Institution-wide / not course-specific</option>{courses.map((course) => <option key={course.slug} value={course.slug}>{course.name}</option>)}</select></Field>
      <Field label="Admission cycle" hint="Cycle suggestions come from existing records; enter the current cycle exactly as published."><input className={inputClass} list="admission-cycle-options" value={payload.cycleLabel} onChange={(event) => updatePayload("cycleLabel", event.target.value)} placeholder="e.g. 2026–27" maxLength={80}/><datalist id="admission-cycle-options">{cycles.map((cycle) => <option key={cycle} value={cycle}/>)}</datalist></Field>
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2 xl:col-span-4"><span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${(publishedNow || ["verified", "approved", "current", "published_verified"].includes(selectedRecord?.verificationStatus ?? "")) ? "bg-[#e7f5ed] text-[#17634b]" : "bg-[#fff5df] text-[#805d13]"}`}>{publishedNow ? "Verified" : statusName(selectedRecord?.verificationStatus ?? "needs_verification")}</span>{draftId && <span className="inline-flex rounded-full bg-[#edf2f5] px-3 py-1.5 text-xs font-bold text-[#4c606b]">{dirty ? "Draft has unsaved edits" : "Draft saved"}</span>}{selectedRecord?.lastVerifiedAt && <span className="text-xs text-[#66776e]">Last verified {new Date(selectedRecord.lastVerifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}</div>
    </div>

    <form onSubmit={(event) => { event.preventDefault(); void markVerified(); }} className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,.75fr)]">
      <div className="space-y-5">
        <Panel title="Application window" description="Enter dates only when confirmed against the current official notice.">
          <div className="grid gap-4 md:grid-cols-3"><Field label="Start date"><input className={inputClass} type="date" value={payload.applicationStartDate} onChange={(event) => updatePayload("applicationStartDate", event.target.value)}/></Field><Field label="End date"><input className={inputClass} type="date" value={payload.applicationEndDate} onChange={(event) => updatePayload("applicationEndDate", event.target.value)}/></Field><Field label="Window status"><select className={inputClass} value={payload.applicationWindowStatus} onChange={(event) => updatePayload("applicationWindowStatus", event.target.value as AdmissionEditorPayload["applicationWindowStatus"])}><option value="not_confirmed">Not currently confirmed</option><option value="confirmed">Confirmed from source</option></select></Field></div>
          <div className="mt-4 flex gap-3 rounded-lg border border-[#f0dfb8] bg-[#fff9ea] p-4 text-sm leading-relaxed text-[#6c5a36]"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#b27b0a]"/><p>Dates must be checked against the current official notice before publishing. If dates are not published or cannot be confirmed, keep the status as <strong>Not currently confirmed</strong>.</p></div>
        </Panel>

        <Panel title="Important dates" description="Use the wording and values from the official notice. A blank or unavailable date is not a deadline.">
          <div className="space-y-4">{payload.importantDates.map((row, index) => <article key={`${index}-${row.label}`} className="rounded-xl border border-[#e0e8e3] bg-[#fbfcfb] p-4"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#314b40]">Date {index + 1}</h3><button type="button" aria-label={`Remove important date ${index + 1}`} onClick={() => updatePayload("importantDates", payload.importantDates.filter((_, itemIndex) => itemIndex !== index))} className="rounded-md p-2 text-[#7b5149] hover:bg-[#fff0ee]"><Trash2 className="h-4 w-4"/></button></div><div className="grid gap-3 sm:grid-cols-2"><Field label="Date label"><input className={inputClass} value={row.label} onChange={(event) => updateDate(index, "label", event.target.value)} maxLength={120} placeholder="Application opens"/></Field><Field label="Value"><input className={inputClass} value={row.value} onChange={(event) => updateDate(index, "value", event.target.value)} maxLength={200} placeholder="Not currently confirmed"/></Field><Field label="Source title"><input className={inputClass} value={row.sourceTitle ?? ""} onChange={(event) => updateDate(index, "sourceTitle", event.target.value)} maxLength={200} placeholder="Official admission notice"/></Field><Field label="Source URL"><input className={inputClass} type="url" value={row.sourceUrl ?? ""} onChange={(event) => updateDate(index, "sourceUrl", event.target.value)} placeholder="https://…"/></Field><Field label="Verification status"><select className={inputClass} value={row.verificationStatus} onChange={(event) => updateDate(index, "verificationStatus", event.target.value)}><option value="needs_verification">Needs verification</option><option value="verified">Verified</option><option value="not_available">Not available in source</option></select></Field></div></article>)}</div><button type="button" onClick={() => updatePayload("importantDates", [...payload.importantDates, { label: "", value: "", sourceTitle: "", sourceUrl: "", verificationStatus: "needs_verification" }])} className={`${buttonClass} mt-4`}><Plus className="h-4 w-4"/>Add important date</button>
        </Panel>

        <Panel title="Admission process" description="Institution-specific information. The steps below are an editable, unpublished starter checklist; confirm them against this institution’s instructions before verification.">
          <ol className="space-y-3">{payload.process.map((step, index) => <li key={`${index}-${step}`} className="flex items-center gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e9f3ee] text-sm font-bold text-[#145c42]">{index + 1}</span><input className={inputClass + " mt-0"} value={step} onChange={(event) => updatePayload("process", payload.process.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} maxLength={300} placeholder="Add an institution-specific step" aria-label={`Process step ${index + 1}`}/><button type="button" onClick={() => moveStep(index, -1)} disabled={index === 0} aria-label={`Move step ${index + 1} up`} className="rounded-md p-2 text-[#53665e] hover:bg-[#f0f5f2] disabled:opacity-30"><ArrowUp className="h-4 w-4"/></button><button type="button" onClick={() => moveStep(index, 1)} disabled={index === payload.process.length - 1} aria-label={`Move step ${index + 1} down`} className="rounded-md p-2 text-[#53665e] hover:bg-[#f0f5f2] disabled:opacity-30"><ArrowDown className="h-4 w-4"/></button><button type="button" onClick={() => updatePayload("process", payload.process.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove step ${index + 1}`} className="rounded-md p-2 text-[#7b5149] hover:bg-[#fff0ee]"><Trash2 className="h-4 w-4"/></button></li>)}</ol><button type="button" onClick={() => updatePayload("process", [...payload.process, ""])} className={`${buttonClass} mt-4`}><Plus className="h-4 w-4"/>Add process step</button>
        </Panel>

        <Panel title="Required documents" description="“Not confirmed” means the source did not establish whether a document is required. It does not mean the document is not required.">
          <div className="space-y-3">{payload.documentRequirements.map((row, index) => <article key={`${index}-${row.label}`} className="grid gap-3 rounded-xl border border-[#e0e8e3] p-4 md:grid-cols-[minmax(0,1fr)_170px_minmax(0,1fr)_auto] md:items-end"><Field label="Document"><input className={inputClass} value={row.label} onChange={(event) => updateDocument(index, "label", event.target.value)} maxLength={160}/></Field><Field label="Requirement status"><select className={inputClass} value={row.status} onChange={(event) => updateDocument(index, "status", event.target.value)}><option value="not_confirmed">Not confirmed</option><option value="required">Required</option><option value="not_required">Not required</option></select></Field><Field label="Source URL"><input className={inputClass} type="url" value={row.sourceUrl ?? ""} onChange={(event) => updateDocument(index, "sourceUrl", event.target.value)} placeholder="https://…"/></Field><button type="button" onClick={() => updatePayload("documentRequirements", payload.documentRequirements.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove document ${index + 1}`} className="mb-1 rounded-md p-2 text-[#7b5149] hover:bg-[#fff0ee]"><Trash2 className="h-4 w-4"/></button></article>)}</div><button type="button" onClick={() => updatePayload("documentRequirements", [...payload.documentRequirements, { label: "", status: "not_confirmed", sourceUrl: "" }])} className={`${buttonClass} mt-4`}><Plus className="h-4 w-4"/>Add document</button>
        </Panel>

        <Panel title="Fees" description="Do not invent or infer amounts. Leave a fee note as not confirmed when the source does not state it.">
          <div className="grid gap-4 md:grid-cols-2"><Field label="Application fee note"><textarea className={inputClass} rows={3} maxLength={500} value={payload.applicationFeeNote} onChange={(event) => updatePayload("applicationFeeNote", event.target.value)} placeholder="Not currently confirmed"/></Field><Field label="Course fee note" hint="Existing general fee notes are retained here for review when present."><textarea className={inputClass} rows={3} maxLength={500} value={payload.courseFeeNote} onChange={(event) => updatePayload("courseFeeNote", event.target.value)} placeholder="Not currently confirmed"/></Field></div>
        </Panel>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-5">
        <Panel title="Source evidence" description="Record the official notice used for review. Entering a URL does not fetch or validate the page automatically.">
          <div className="space-y-4"><div className="rounded-lg bg-[#f4f7f5] p-3 text-sm"><p className="font-semibold text-[#344b41]">Application link</p>{institution.admissionPortal && /^https?:\/\//i.test(institution.admissionPortal) ? <a href={institution.admissionPortal} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-[#17634b] underline">{institution.admissionPortal}<ExternalLink className="h-3.5 w-3.5 shrink-0"/></a> : <p className="mt-1 text-[#687970]">Not attached to the institution record</p>}</div><Field label="Source title"><input className={inputClass} value={payload.sourceTitle} onChange={(event) => updatePayload("sourceTitle", event.target.value)} maxLength={200} placeholder="Official admission notice"/></Field><Field label="Official URL"><input className={inputClass} type="url" value={payload.sourceUrl} onChange={(event) => updatePayload("sourceUrl", event.target.value)} maxLength={2048} placeholder="https://institution.edu/admissions"/></Field><Field label="Retrieved date" hint="Optional. Enter only if this source was actually retrieved on that date."><input className={inputClass} type="date" value={payload.sourceRetrievedAt} onChange={(event) => updatePayload("sourceRetrievedAt", event.target.value)}/></Field><div className="grid gap-2 border-t border-[#e4ebe7] pt-3 text-sm"><div className="flex justify-between gap-3"><span className="text-[#687970]">Verification status</span><span className="font-semibold text-[#344b41]">{publishedNow ? "Verified" : statusName(selectedRecord?.verificationStatus ?? "needs_verification")}</span></div><div className="flex justify-between gap-3"><span className="text-[#687970]">Last verified</span><span className="font-semibold text-[#344b41]">{selectedRecord?.lastVerifiedAt ? new Date(selectedRecord.lastVerifiedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : publishedNow ? "Just now" : "Not verified"}</span></div></div>{payload.sourceUrl && /^https?:\/\//i.test(payload.sourceUrl) && <a href={payload.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#17634b] underline">Open source<ExternalLink className="h-4 w-4"/></a>}</div>
        </Panel>

        <Panel title="Verification checklist" description="Check each item only after reviewing it against the selected evidence.">
          <div className="space-y-2">{checks.map(({ key, label }) => <label key={key} className="flex items-center gap-3 rounded-lg border border-[#e5ebe8] p-3 text-sm font-medium text-[#344b41]"><input type="checkbox" checked={payload.confirmations[key]} onChange={(event) => updateConfirmation(key, event.target.checked)} className="h-4 w-4 accent-[#14745a]"/>{label}</label>)}</div><p className="mt-3 text-xs leading-relaxed text-[#64756d]">The checklist is saved with the reviewer audit event. It does not infer that unconfirmed information is required or publish draft values.</p>
        </Panel>

        <Field label="Reviewer note" hint="Required to mark verified; explain what the official source established or what remains unavailable."><textarea className={inputClass} rows={4} maxLength={500} value={reviewNote} onChange={(event) => { setReviewNote(event.target.value); setDirty(true); }} placeholder="Reviewed the current official notice for this admission cycle…"/></Field>
        {message && <p role={messageError ? "alert" : "status"} className={`rounded-lg p-3 text-sm leading-relaxed ${messageError ? "bg-[#fff0ee] text-[#a23e38]" : "bg-[#eaf5ef] text-[#17634b]"}`}>{message}</p>}
        <div className="flex flex-wrap gap-2"><Link href={`/admin/catalogue/institutions/${encodeURIComponent(institution.code)}`} className={buttonClass}>Back</Link><button type="button" onClick={saveDraft} disabled={busy || !draftStorageAvailable} className={buttonClass}>{busy ? <LoaderCircle className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}Save draft</button><button type="submit" disabled={busy || !checklistComplete} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#12664f] px-4 text-sm font-bold text-white hover:bg-[#0d5742] disabled:cursor-not-allowed disabled:opacity-50"><ShieldCheck className="h-4 w-4"/>Mark verified</button></div>
        <p className="flex gap-2 rounded-lg bg-[#f3f6f4] p-3 text-xs leading-relaxed text-[#5e6e66]"><FilePlus2 className="mt-0.5 h-4 w-4 shrink-0"/>If any section is incomplete, save a draft. The previous approved value remains in place for students until this record is verified.</p>
      </aside>
    </form>
  </>;
}
