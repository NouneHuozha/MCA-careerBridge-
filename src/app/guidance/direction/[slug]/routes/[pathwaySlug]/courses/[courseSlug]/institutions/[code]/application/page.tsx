import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Flag,
  FolderOpen,
  GraduationCap,
  Image as ImageIcon,
  Phone,
  UserRound,
} from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { Logo } from "@/components/logo";
import { getAdmissionInfo, getCourse, getField, getInstitution, getPathway } from "@/services/catalog";
import { formatDate } from "@/components/ui";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application and requirements" };

type CheckItem = { title: string; detail: string; icon: typeof CalendarDays };

const checklist: CheckItem[] = [
  { title: "Current application dates", detail: "Check the start and end dates in the official notice.", icon: CalendarDays },
  { title: "Course availability for this admission cycle", detail: "Confirm that this course is offered in the current cycle.", icon: GraduationCap },
  { title: "Current eligibility and required subjects", detail: "Review the latest eligibility criteria and subject requirements.", icon: FileText },
  { title: "Application fee and payment method", detail: "Check the applicable fee and the available payment method(s).", icon: CreditCard },
  { title: "Official contact for questions", detail: "Note the official contact details for any queries.", icon: Phone },
];

const preparationCards = [
  { title: "Review the current programme notice", detail: "Read the latest information released by the institution for this admission cycle.", icon: FileText },
  { title: "Check eligibility and admission method", detail: "Understand the eligibility criteria, required subjects, and admission method for this course at this institution.", icon: CheckCircle2 },
  { title: "Gather only the documents the official notice requests", detail: "Keep the documents ready as specified in the institution’s official notice.", icon: FolderOpen },
];

const documentLabels = [
  { label: "Identity or age proof", icon: UserRound },
  { label: "Academic records", icon: FileText },
  { label: "Photograph", icon: ImageIcon },
  { label: "Category or support documents if applicable", icon: FileText },
];

function statusLabel(value: string | null | undefined) {
  if (["verified", "current", "recently_verified", "published_verified", "approved"].includes(value ?? "")) return "Verified official source";
  if (value === "unavailable") return "Awaiting official verification";
  if (value === "conflicting") return "Conflicting sources";
  return "Awaiting official verification";
}

function CheckRow({ item }: { item: CheckItem }) {
  const Icon = item.icon;
  return (
    <div className="flex min-h-[68px] items-start gap-4 border-t border-[var(--cb-line)] py-3 first:border-t-0">
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center bg-[var(--cb-surface-soft)] text-[var(--cb-primary)]"><Icon className="h-5 w-5" strokeWidth={1.7} /></span>
      <span className="min-w-0 flex-1"><span className="block font-serif text-base font-semibold leading-snug text-[var(--cb-ink-strong)]">{item.title}</span><span className="mt-1 block text-[15px] leading-relaxed text-[var(--cb-muted)]">{item.detail}</span></span>
    </div>
  );
}

export default async function ApplicationRequirementsPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string; code: string }> }) {
  const { slug, pathwaySlug, courseSlug, code } = await params;
  const [state, field, route, course, institution, admissions] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
    getInstitution(code),
    getAdmissionInfo(code),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || !route.courseSlugs?.includes(course.slug) || !institution) notFound();

  const cycleYear = (label: string | null) => Number(label?.match(/20\d{2}/)?.[0] ?? 0);
  const approvedAdmissions = admissions.filter((item) => ["verified", "current", "recently_verified", "published_verified", "approved"].includes(item.verificationStatus)).sort((a, b) => {
    const yearDiff = cycleYear(b.cycleLabel) - cycleYear(a.cycleLabel);
    if (yearDiff) return yearDiff;
    return (b.lastVerifiedAt?.getTime() ?? b.retrievedAt?.getTime() ?? 0) - (a.lastVerifiedAt?.getTime() ?? a.retrievedAt?.getTime() ?? 0);
  });
  const record = approvedAdmissions.find((item) => item.courseSlug === course.slug) ?? approvedAdmissions.find((item) => item.courseSlug == null);
  const detail = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}/institutions/${encodeURIComponent(code)}`;
  const officialHref = record?.sourceUrl ?? institution.officialWebsite ?? institution.sourceUrl;
  const status = statusLabel(record?.verificationStatus);
  const documents = record?.documents ?? [];
  const retrievedAt = formatDate(record?.retrievedAt);

  return (
    <main className="min-h-[calc(100dvh-62px)] bg-[var(--cb-canvas)] px-5 pb-8 pt-5 text-[var(--cb-ink-strong)] sm:px-8 lg:px-12">
      <section className="mx-auto max-w-[1500px]">


        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,.95fr)] xl:items-start">
          <div className="min-w-0">
            <header>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-serif text-[clamp(2.1rem,4vw,3.45rem)] leading-[1.05] tracking-[-.045em] text-[var(--cb-ink-strong)]">Applying for {course.name} at {institution.name}</h1>
                <span className="inline-flex shrink-0 rounded-full bg-[#fff0cb] px-3 py-1.5 text-sm font-semibold text-[#735b25]">{record ? record.cycleLabel ?? "Verified record" : "Illustrative guidance"}</span>
              </div>
              <p className="mt-2 text-lg text-[var(--cb-ink)]">A clear checklist for preparing, checking, and applying.</p>
            </header>

            <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0d79e] bg-[#fff2d2] px-5 py-4 text-[#4f4a35]">
              <AlertTriangle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 fill-[#c69127] text-white" />
              <div><p className="font-semibold">Institution-specific application instructions are not verified in this sample.</p><p className="mt-1 text-sm text-[#716b55]">Details such as dates, fees, eligibility, and required documents can change. Always refer to the official source of the institution.</p></div>
            </div>

            {record && <section aria-labelledby="cycle-details-title" className="mt-5 rounded-xl border border-[var(--cb-line)] bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="cycle-details-title" className="font-serif text-[1.35rem] font-semibold text-[var(--cb-ink-strong)]">Admission cycle details</h2><p className="mt-1 text-sm text-[var(--cb-muted)]">{record.cycleLabel || "Cycle not specified"}{record.courseSlug ? ` · ${course.name}` : " · Institution-wide"}</p></div><span className="rounded-full bg-[#e7f5ed] px-3 py-1.5 text-sm font-semibold text-[#17634b]">{statusLabel(record.verificationStatus)}</span></div>
              <dl className="mt-4 grid gap-4 border-t border-[#e7ece8] pt-4 sm:grid-cols-2"><div><dt className="text-sm font-semibold uppercase tracking-wide text-[var(--cb-muted)]">Application window</dt><dd className="mt-1 text-sm font-semibold text-[var(--cb-ink-strong)]">{record.applicationWindowStatus === "confirmed" ? `${record.applicationStartDate ? formatDate(new Date(`${record.applicationStartDate}T12:00:00`)) : "Start not specified"} – ${record.applicationEndDate ? formatDate(new Date(`${record.applicationEndDate}T12:00:00`)) : "End not specified"}` : "Not currently confirmed"}</dd></div><div><dt className="text-sm font-semibold uppercase tracking-wide text-[var(--cb-muted)]">Application fee</dt><dd className="mt-1 text-sm font-semibold text-[var(--cb-ink-strong)]">{record.applicationFeeNote || "Not currently confirmed"}</dd></div><div><dt className="text-sm font-semibold uppercase tracking-wide text-[var(--cb-muted)]">Course fee note</dt><dd className="mt-1 text-sm font-semibold text-[var(--cb-ink-strong)]">{record.courseFeeNote || "Not currently confirmed"}</dd></div><div><dt className="text-sm font-semibold uppercase tracking-wide text-[var(--cb-muted)]">Last verified</dt><dd className="mt-1 text-sm font-semibold text-[var(--cb-ink-strong)]">{formatDate(record.lastVerifiedAt)}</dd></div></dl>
              {record.process?.length ? <div className="mt-4 border-t border-[#e7ece8] pt-4"><h3 className="text-sm font-semibold text-[var(--cb-ink-strong)]">Institution-specific process</h3><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[var(--cb-ink)]">{record.process.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}</ol></div> : null}
              {record.importantDates?.some((item) => item.verificationStatus === "verified" || item.verificationStatus === "not_available") && <div className="mt-4 border-t border-[#e7ece8] pt-4"><h3 className="text-sm font-semibold text-[var(--cb-ink-strong)]">Important dates</h3><ul className="mt-2 space-y-2">{record.importantDates.filter((item) => item.verificationStatus === "verified" || item.verificationStatus === "not_available").map((item, index) => <li key={`${index}-${item.label}`} className="flex flex-wrap items-start justify-between gap-2 text-sm"><span className="font-medium text-[var(--cb-ink)]">{item.label}</span><span className="text-right text-[var(--cb-ink-strong)]">{item.verificationStatus === "not_available" ? "Not available in the official source" : item.value}</span></li>)}</ul></div>}
              {record.sourceUrl && /^https?:\/\//i.test(record.sourceUrl) && <a href={record.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cb-primary)] underline">{record.sourceTitle || "Open official source"}<ExternalLink className="h-4 w-4"/></a>}
            </section>}

            <section aria-labelledby="prepare-title" className="mt-5 overflow-hidden rounded-xl border border-[var(--cb-line)] bg-[var(--cb-surface-soft)]">
              <div className="px-6 pb-3 pt-5"><h2 id="prepare-title" className="font-serif text-[1.65rem] font-semibold text-[var(--cb-ink-strong)]">How to prepare</h2><p className="mt-1 text-[1rem] text-[#6b7b73]">Follow these steps to get ready for your application.</p></div>
              <div className="grid gap-3 px-5 pb-5 md:grid-cols-3">
                {preparationCards.map(({ title, detail, icon: Icon }) => <article key={title} className="min-h-[230px] rounded-lg bg-white/90 px-5 py-5 shadow-[0_5px_18px_-18px_rgba(35,74,63,.45)]"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#dff2e9] text-[var(--cb-primary)]"><Icon className="h-6 w-6" strokeWidth={1.7} /></span><h3 className="mt-5 font-serif text-[1.05rem] font-semibold leading-tight text-[var(--cb-ink-strong)]">{title}</h3><p className="mt-4 text-[1rem] leading-relaxed text-[var(--cb-muted)]">{detail}</p></article>)}
              </div>
              <div className="border-t border-[var(--cb-line)] bg-white/55 px-6 pb-4 pt-4"><h2 className="font-serif text-[1.3rem] font-semibold text-[var(--cb-ink-strong)]">Documents that may be requested</h2><p className="mt-1 text-[1rem] text-[#707b75]">The exact list varies by institution and admission cycle.</p><div className="mt-4 flex flex-wrap gap-2.5">{(documents.length ? documents.slice(0, 4).map((label) => ({ label, icon: FileText })) : documentLabels).map(({ label, icon: Icon }) => <span key={label} className="inline-flex items-center gap-2 rounded-full bg-[#e7f4ee] px-4 py-2 text-sm font-medium text-[#32695d]"><Icon aria-hidden className="h-4 w-4" />{label}</span>)}</div></div>
            </section>
            {record?.documentRequirements?.length ? <section className="mt-5 rounded-xl border border-[var(--cb-line)] bg-white p-5"><h2 className="font-serif text-[1.3rem] font-semibold text-[var(--cb-ink-strong)]">Institution document status</h2><ul className="mt-3 divide-y divide-[#e7ece8]">{record.documentRequirements.map((item, index) => <li key={`${index}-${item.label}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"><span className="font-medium text-[#344b41]">{item.label}</span><span className={`rounded-full px-3 py-1 text-sm font-semibold ${item.status === "required" ? "bg-[#e7f5ed] text-[#17634b]" : item.status === "not_required" ? "bg-[#eef1ef] text-[#52645a]" : "bg-[#fff5df] text-[#805d13]"}`}>{item.status === "required" ? "Required" : item.status === "not_required" ? "Not required" : "Not confirmed"}</span>{item.sourceUrl && /^https?:\/\//i.test(item.sourceUrl) ? <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-[var(--cb-primary)] underline">Source</a> : null}</li>)}</ul><p className="mt-3 text-sm leading-relaxed text-[#687970]">Not confirmed means the source did not establish whether the document is required; it does not mean the document is not required.</p></section> : null}
          </div>

          <aside className="rounded-xl border border-[var(--cb-line)] bg-[var(--cb-surface)] px-5 py-4 shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)]">
            <h2 className="font-serif text-[1.5rem] font-semibold leading-tight text-[var(--cb-ink-strong)]">What to check before submitting</h2><p className="mt-1 text-[1rem] text-[var(--cb-muted)]">Use this checklist to avoid missing anything important.</p>
            <div className="mt-3">{checklist.map((item) => <CheckRow key={item.title} item={item} />)}</div>
            {officialHref ? <a href={officialHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#b5c8d1] px-4 text-sm font-semibold text-white transition hover:bg-[#9fb8c4]"><ExternalLink className="h-4 w-4" />Open official application instructions</a> : <span className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#b5c8d1] px-4 text-sm font-semibold text-white/90"><ExternalLink className="h-4 w-4" />Official link not connected in this sample</span>}
            <SaveButton itemType="institution" itemRef={`${code}:application`} label={`${course.name} application checklist at ${institution.name}`} saveText="Save this checklist" savedText="Checklist saved" className="mt-2 w-full [&>button]:min-h-11 [&>button]:w-full [&>button]:justify-center [&>button]:rounded-lg [&>button]:border-[#2d7c78] [&>button]:bg-white [&>button]:text-[var(--cb-primary)]" />
            <section className="mt-4 rounded-xl border border-[#e6e8dd] bg-[#fcfcf6] p-4"><div className="flex items-start gap-3"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#dff2e9] text-[var(--cb-primary)]"><FileText className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-[1.02rem] font-semibold text-[var(--cb-ink-strong)]">Official application source</h3><span className="rounded-full bg-[#fff0cb] px-2.5 py-1 text-[.875rem] font-semibold text-[#735b25]">{status}</span></div><p className="mt-2 text-sm leading-relaxed text-[var(--cb-muted)]">Refer to the institution’s official website for the latest information.</p><p className="mt-2 text-sm text-[var(--cb-muted)]">Source record retrieved: {retrievedAt ?? "date not recorded"}.</p></div></div></section>
          </aside>
        </div>

        <section className="mt-5 flex flex-wrap items-center gap-4 rounded-lg bg-[#e5f4ef] px-6 py-4"><Flag aria-hidden className="h-6 w-6 text-[var(--cb-primary)]" /><div><h2 className="font-serif text-[1.25rem] font-semibold text-[var(--cb-ink-strong)]">After you apply</h2><p className="text-sm text-[var(--cb-muted)]">Save your confirmation, note next steps, and check the official source for updates.</p></div><Link href={`${detail.split("/institutions/")[0]}/exams-scholarships`} className="ml-auto inline-flex min-h-10 items-center gap-2 rounded-lg bg-[var(--cb-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--cb-primary-hover)]">Check exams and scholarships <span aria-hidden>→</span></Link></section>
        <footer className="flex flex-col gap-3 border-t border-[var(--cb-line)] pb-1 pt-4 text-sm text-[var(--cb-muted)] sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><Logo size="sm" /><span aria-hidden className="h-5 w-px bg-[#dfe5df]" /><span>Explore today. A brighter tomorrow.</span></div><p>General preparation guidance is not the same as institution-specific instructions.</p></footer>
      </section>
    </main>
  );
}
