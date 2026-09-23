import Link from "next/link";
import { BookOpenCheck, CalendarDays, ClipboardCheck, FileText } from "lucide-react";
import { Badge, BulletList, Disclosure, Eyebrow, SourceLink, VerificationBadge } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { getExams } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrance examinations" };
export default async function ExamsPage() {
  const exams = await getExams();
  return <div className="cb-container cb-page">
    <header className="flex items-center justify-between gap-6 rounded-2xl border border-sky-ink/20 bg-sky/40 p-6 sm:p-8"><div><Eyebrow>Entrance examinations</Eyebrow><h1 className="cb-page-title mt-3">Know the next requirement.</h1><p className="mt-3 max-w-xl text-sm text-ink-600">Find the exam, understand what it opens, and check the current official notice.</p></div><BookOpenCheck aria-hidden className="hidden h-16 w-16 shrink-0 text-sky-ink sm:block" strokeWidth={1.3} /></header>
    <div className="my-6 flex items-center gap-2 text-xs text-ink-500"><CalendarDays aria-hidden className="h-4 w-4 text-sky-ink" />Dates change each cycle. Unverified dates are not displayed as current.</div>
    <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">{exams.map((exam, i) => <article key={exam.slug} id={exam.slug} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <header className={`border-b border-ink-100 p-5 ${i % 2 === 0 ? "bg-sky/30" : "bg-lavender/25"}`}><div className="mb-3 flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sky-ink"><FileText aria-hidden className="h-4 w-4" /></span><Badge tone={i % 2 === 0 ? "forest" : "lavender"}>{exam.shortName ?? "Entrance exam"}</Badge></div><h2 className="text-lg font-semibold leading-snug"><Link href={`/exams/${exam.slug}`} className="hover:text-forest-700">{exam.name}</Link></h2><p className="mt-2 text-xs text-ink-500">{exam.conductingBody}</p></header>
      <div className="p-5"><VerificationBadge status={exam.verificationStatus} lastVerifiedAt={exam.lastVerifiedAt} /><p className="mt-4 text-sm leading-relaxed text-ink-600">{(exam.appliesTo ?? []).join(" · ")}</p>
        <div className="mt-4 rounded-xl border border-ink-100 bg-canvas p-3 text-sm"><p className="flex flex-wrap justify-between gap-2"><span className="font-semibold text-ink-500">Applications</span><span>{exam.applicationPeriod ?? "Not yet verified"}</span></p><p className="mt-2 flex flex-wrap justify-between gap-2"><span className="font-semibold text-ink-500">Exam date</span><span>{exam.examDate ?? "Not yet verified"}</span></p></div>
        <div className="mt-4 flex flex-wrap items-start gap-2.5"><SourceLink href={exam.officialWebsite}>Open official exam site</SourceLink><SaveButton itemType="exam" itemRef={exam.slug} label={exam.shortName ?? exam.name} /></div>
        <div className="mt-4 space-y-2"><Disclosure summary="Eligibility & documents"><h3 className="mb-2 flex items-center gap-2 font-semibold"><ClipboardCheck aria-hidden className="h-4 w-4" />General requirements</h3><p>{exam.eligibility ?? "Currently unavailable."}</p><h3 className="mb-2 mt-4 font-semibold">Documents commonly requested</h3><BulletList items={exam.documents ?? []} /><p className="mt-3 text-xs text-ink-500">The current official notification takes priority over this outline.</p></Disclosure><Disclosure summary="How to start preparing"><BulletList items={exam.preparation ?? []} /></Disclosure><Disclosure summary="Source & verification"><VerificationBadge status={exam.verificationStatus} lastVerifiedAt={exam.lastVerifiedAt} /><div className="mt-3"><SourceLink href={exam.sourceUrl ?? exam.officialWebsite} variant="inline">Check source information</SourceLink></div></Disclosure></div>
      </div>
    </article>)}</div>
  </div>;
}
