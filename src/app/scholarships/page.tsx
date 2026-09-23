import Link from "next/link";
import { ArrowRight, Award, FileCheck2, GraduationCap, Wallet } from "lucide-react";
import { Badge, BulletList, ButtonLink, Callout, Disclosure, Eyebrow, SourceLink, VerificationBadge } from "@/components/ui";
import { SaveButton } from "@/components/save-button";
import { getScholarships } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Scholarships" };

export default async function ScholarshipsPage({ searchParams }: { searchParams: Promise<{ stage?: string }> }) {
  const params = await searchParams;
  const [scholarships, state] = await Promise.all([getScholarships({}), getSessionState()]);
  const stage = ["class10", "class12", "undergraduate"].includes(params.stage ?? "") ? params.stage : null;
  const filtered = scholarships.filter((s) => !stage || (s.appliesToStage ?? []).includes(stage));
  const ordered = state ? [...filtered].sort((a, b) => Number((b.appliesToStage ?? []).includes(state.stage)) - Number((a.appliesToStage ?? []).includes(state.stage))) : filtered;
  return <div className="cb-container cb-page">
    <header className="flex flex-wrap items-center justify-between gap-7 rounded-2xl border border-butter-ink/20 bg-[#fbf3dc] p-6 sm:p-8">
      <div><Eyebrow>A little support goes a long way</Eyebrow><h1 className="cb-page-title mt-3">More possibilities. Less financial worry.</h1><p className="mt-3 max-w-xl text-sm text-ink-600">Explore scholarship schemes, then check the official portal for current details.</p></div><span aria-hidden className="grid h-20 w-20 shrink-0 place-items-center rounded-[1.5rem] border border-butter-ink/15 bg-butter text-butter-ink"><Award className="h-10 w-10" strokeWidth={1.3} /></span>
    </header>
    <nav aria-label="Scholarship study level" className="my-6 flex flex-wrap gap-2">{[{ id: "", label: "All schemes" }, { id: "class10", label: "Class 10" }, { id: "class12", label: "Class 12" }, { id: "undergraduate", label: "Undergraduate" }].map((item) => <Link href={item.id ? `/scholarships?stage=${item.id}` : "/scholarships"} key={item.id} aria-current={(stage ?? "") === item.id ? "page" : undefined} className={`cb-button border px-4 py-2 text-sm ${(stage ?? "") === item.id ? "cb-button-primary" : "border-ink-200 bg-white text-ink-700 hover:bg-butter/40"}`}>{item.label}</Link>)}</nav>
    <p className="mb-5 flex items-center gap-2 text-xs text-ink-500"><FileCheck2 aria-hidden className="h-4 w-4 text-butter-ink" />Current amounts and deadlines are unverified. Use the official links before applying.</p>
    <div className="grid items-start gap-5 xl:grid-cols-2 2xl:grid-cols-3">{ordered.map((scholarship, i) => <article key={scholarship.slug} id={scholarship.slug} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className={`border-b border-ink-100 px-5 py-4 ${i % 3 === 0 ? "bg-butter/30" : i % 3 === 1 ? "bg-lavender/30" : "bg-mint/30"}`}><div className="mb-3 flex flex-wrap gap-2"><Badge tone={i % 3 === 0 ? "amber" : i % 3 === 1 ? "lavender" : "green"}>{scholarship.category ?? "Scholarship scheme"}</Badge></div><h2 className="text-lg font-semibold leading-snug"><Link href={`/scholarships/${scholarship.slug}`} className="hover:text-forest-700">{scholarship.name}</Link></h2><p className="mt-2 text-xs leading-relaxed text-ink-500">{scholarship.provider}</p></div>
      <div className="p-5"><VerificationBadge status={scholarship.verificationStatus} lastVerifiedAt={scholarship.lastVerifiedAt} />
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-ink-100 bg-canvas p-3"><div><p className="text-xs font-semibold text-ink-500">Amount</p><p className="mt-1 text-sm text-ink-800">{scholarship.amountNote ?? "Not yet verified"}</p></div><div><p className="text-xs font-semibold text-ink-500">Deadline</p><p className="mt-1 text-sm text-ink-800">{scholarship.deadlineNote ?? "Check official portal"}</p></div></div>
        <div className="mt-4 flex flex-wrap items-start gap-2.5"><SourceLink href={scholarship.officialUrl}>Visit official portal</SourceLink><SaveButton itemType="scholarship" itemRef={scholarship.slug} label={scholarship.name} /></div>
        <div className="mt-4 space-y-2"><Disclosure summary="Who can apply?"><p>{scholarship.eligibility ?? "CareerBridge could not verify this information from an authoritative source."}</p><div className="mt-3 flex flex-wrap gap-1.5">{(scholarship.appliesToStage ?? []).map((s) => <Badge key={s}>{s === "class10" ? "Class 10" : s === "class12" ? "Class 12" : "Undergraduate"}</Badge>)}</div></Disclosure><Disclosure summary="Documents to keep ready"><BulletList items={scholarship.documents ?? []} /><p className="mt-3 text-xs text-ink-500">The current notification may ask for different documents.</p></Disclosure><Disclosure summary="Source & verification"><VerificationBadge status={scholarship.verificationStatus} lastVerifiedAt={scholarship.lastVerifiedAt} /><div className="mt-3"><SourceLink href={scholarship.sourceUrl ?? scholarship.officialUrl} variant="inline">Open source website</SourceLink></div></Disclosure></div>
      </div>
    </article>)}</div>
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-forest-200 bg-mint/45 p-6"><div><h2 className="flex items-center gap-2 text-lg font-semibold"><Wallet aria-hidden className="h-5 w-5 text-forest-700" />Make support part of your plan.</h2><p className="mt-2 text-sm text-ink-500">Keep scholarship checks beside your course and admission tasks.</p></div><ButtonLink href="/action-plan">View my next steps<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div>
  </div>;
}
