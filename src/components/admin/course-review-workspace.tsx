"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CircleAlert, ExternalLink, FileText, GraduationCap, LoaderCircle, ShieldCheck } from "lucide-react";

type Course = {
  slug: string;
  name: string;
  level: string;
  durationLabel: string | null;
  eligibility: string;
  relevantSubjects: string[] | null;
  entranceRequirement: string | null;
  careerDirections: string[] | null;
  furtherStudy: string[] | null;
  feeNote: string | null;
  scholarshipNote: string | null;
  examSlugs: string[] | null;
  sourceUrl: string | null;
  verificationStatus: string;
  lastVerifiedAt: string | null;
  verificationFresh: boolean;
};
type InstitutionLink = { id: number; institutionCode: string; institutionName: string; verificationStatus: string; sourceUrl: string | null; lastVerifiedAt: string | null; verificationFresh: boolean };
type Props = { course: Course; fieldName: string; institutionLinks: InstitutionLink[] };
const levelName = (level: string) => level.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const verifiedStatuses = new Set(["verified", "current", "published_verified", "recently_verified"]);
const statusName = (status: string, verificationFresh: boolean) => {
  if (verifiedStatuses.has(status.toLowerCase())) return verificationFresh ? "Verified" : "Review due";
  return ({ unavailable: "Source unavailable", source_unavailable: "Source unavailable", blocked: "Source unavailable", recently_imported: "Recently imported", imported: "Recently imported", new: "Recently imported" } as Record<string, string>)[status.toLowerCase()] ?? "Needs verification";
};
function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) ? url.toString() : null; } catch { return null; }
}
function dateLabel(value: string | null) {
  if (!value) return "Not checked";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not checked" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function CourseReviewWorkspace({ course, fieldName, institutionLinks }: Props) {
  const router = useRouter();
  const [sourceUrl, setSourceUrl] = useState(course.sourceUrl ?? "");
  const [reviewNote, setReviewNote] = useState("");
  const [confirmEvidence, setConfirmEvidence] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/courses/${encodeURIComponent(course.slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_verified", sourceUrl, reviewNote, confirmEvidence }),
      });
      const result = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not record this review.");
      setMessage("Course marked verified. Institution-specific availability remains a separate review.");
      setReviewNote(""); setConfirmEvidence(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not record this review.");
    } finally {
      setBusy(false);
    }
  }

  const sourceHref = safeHttpUrl(course.sourceUrl);
  const status = course.verificationStatus.toLowerCase();
  const verified = verifiedStatuses.has(status) && course.verificationFresh;
  const statusClass = verified ? "border-[#c6e4d3] bg-[#e8f5ee] text-[#17634b]" : ["unavailable", "source_unavailable", "blocked"].includes(status) ? "border-[#f0c9c5] bg-[#fff0ee] text-[#a23e38]" : ["recently_imported", "imported", "new"].includes(status) ? "border-[#c8dafa] bg-[#eef4ff] text-[#2d5ea3]" : "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";

  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link href="/admin/catalogue/courses" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]"><ArrowLeft className="h-4 w-4" />Back to courses</Link><Link href={`/courses/${encodeURIComponent(course.slug)}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Student preview<ArrowUpRight className="h-4 w-4" /></Link></div>
    <header className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6"><div className="flex min-w-0 gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#e8f5ee] text-[#17634b]"><GraduationCap className="h-6 w-6" /></span><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue / Courses / {course.slug}</p><h1 className="mt-1 text-2xl font-bold tracking-[-.03em] text-[#142e27] sm:text-3xl">{course.name}</h1><p className="mt-2 text-sm text-[#596a63]">{levelName(course.level)}{course.durationLabel ? ` · ${course.durationLabel}` : ""}{fieldName ? ` · ${fieldName}` : ""}</p></div></div><span className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${statusClass}`}><span className="h-2 w-2 rounded-full bg-current" />{statusName(course.verificationStatus, course.verificationFresh)}</span></header>
    {message && <p role="status" className="flex items-start gap-2 rounded-lg border border-[#c8ded3] bg-[#eef7f2] px-4 py-3 text-sm text-[#245844]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</p>}
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(350px,.8fr)]">
      <section className="space-y-4 rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-label="Course details">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-[#172b35]">Course record</h2><p className="mt-1 text-sm text-[#596a63]">Catalogue details are distinct from an institution’s decision to offer the course.</p></div><span className="rounded-md bg-[#f2f5f3] px-2 py-1 text-xs font-semibold text-[#53665d]">{course.slug}</span></div>
        <dl className="grid gap-4 border-t border-[#edf1ef] pt-4 sm:grid-cols-2"><div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">General eligibility</dt><dd className="mt-1 text-sm leading-relaxed text-[#263b33]">{course.eligibility || "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Relevant subjects</dt><dd className="mt-1 text-sm text-[#263b33]">{course.relevantSubjects?.length ? course.relevantSubjects.join(", ") : "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Entrance requirement</dt><dd className="mt-1 text-sm text-[#263b33]">{course.entranceRequirement || "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Career directions</dt><dd className="mt-1 text-sm text-[#263b33]">{course.careerDirections?.length ? course.careerDirections.join(", ") : "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Further study</dt><dd className="mt-1 text-sm text-[#263b33]">{course.furtherStudy?.length ? course.furtherStudy.join(", ") : "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Fee note</dt><dd className="mt-1 text-sm text-[#263b33]">{course.feeNote || "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Scholarship note</dt><dd className="mt-1 text-sm text-[#263b33]">{course.scholarshipNote || "Not recorded"}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Last checked</dt><dd className="mt-1 text-sm text-[#263b33]">{dateLabel(course.lastVerifiedAt)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-[#687970]">Source</dt><dd className="mt-1">{sourceHref ? <a href={sourceHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-[#17634b] underline">Open course source<ExternalLink className="h-3.5 w-3.5" /></a> : <span className="text-sm text-[#596a63]">No source recorded</span>}</dd></div></dl>
      </section>
      <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="verify-title"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e8f5ee] text-[#17634b]"><ShieldCheck className="h-5 w-5" /></span><div><h2 id="verify-title" className="text-lg font-bold text-[#172b35]">Review this course</h2><p className="mt-1 text-sm leading-relaxed text-[#596a63]">Verify the course record against supporting evidence. Availability at an institution is reviewed separately.</p></div></div>
        <form onSubmit={verify} className="mt-5 space-y-4"><label className="block text-sm font-semibold text-[#344e47]">Evidence source URL<input type="url" required maxLength={2048} value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://official.example/course" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-normal outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label><label className="block text-sm font-semibold text-[#344e47]">Review note<textarea required minLength={8} maxLength={500} rows={3} value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="What did you check, and what does the source support?" className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-normal outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" /></label><label className="flex items-start gap-2 text-sm leading-relaxed text-[#344e47]"><input type="checkbox" checked={confirmEvidence} onChange={(event) => setConfirmEvidence(event.target.checked)} className="mt-1 accent-[#0e6a53]" />I checked this course information against the evidence above.</label>{error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#f0c9c5] bg-[#fff0ee] p-3 text-sm text-[#87382e]"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}<button type="submit" disabled={busy || !confirmEvidence} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{verified ? "Record new verification" : "Mark course verified"}</button></form>
      </section>
    </div>
    <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-labelledby="institutions-title"><div className="border-b border-[#dce5e0] px-5 py-4"><h2 id="institutions-title" className="text-lg font-bold text-[#172b35]">Institution availability</h2><p className="mt-1 text-sm text-[#596a63]">{institutionLinks.length} linked institution {institutionLinks.length === 1 ? "record" : "records"}; each link has its own evidence and verification state.</p></div>{institutionLinks.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th className="px-4 py-3">Institution</th><th className="px-4 py-3">Availability verification</th><th className="px-4 py-3">Last checked</th><th className="px-4 py-3">Evidence</th></tr></thead><tbody>{institutionLinks.map((link) => <tr key={link.id} className="border-t border-[#e5ebe8]"><td className="px-4 py-3 font-semibold text-[#263b33]">{link.institutionName}<span className="mt-0.5 block text-xs font-normal text-[#687970]">{link.institutionCode}</span></td><td className="px-4 py-3">{statusName(link.verificationStatus, link.verificationFresh)}</td><td className="px-4 py-3">{dateLabel(link.lastVerifiedAt)}</td><td className="px-4 py-3">{safeHttpUrl(link.sourceUrl) ? <a href={safeHttpUrl(link.sourceUrl)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-[#17634b] underline">Open source<ArrowUpRight className="h-3.5 w-3.5" /></a> : "Not recorded"}</td></tr>)}</tbody></table></div> : <div className="flex items-start gap-3 p-5 text-sm text-[#596a63]"><FileText className="mt-0.5 h-4 w-4 shrink-0" /><p>No institution links are recorded for this course. This does not mean that no institution offers it.</p></div>}</section>
  </div>;
}
