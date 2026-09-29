import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, BookOpen, ChevronRight, Link2, MapPin, UserRound } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getField, getInstitutionsForCourse, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";
import { PracticalChecklist } from "./practical-checklist";

export const dynamic = "force-dynamic";
export const metadata = { title: "Practical checks · BCA" };

export default async function PracticalChecksPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string }> }) {
  const { slug, pathwaySlug, courseSlug } = await params;
  const [state, field, route, course, institutions] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
    getInstitutionsForCourse(courseSlug),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || course.slug !== "bca" || !route.courseSlugs?.includes(course.slug)) notFound();

  const courseDetail = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}`;
  const institution = institutions[0] ?? null;
  const items = [
    { title: `Confirm the current ${course.name} offering`, detail: "Check the institution programme page or latest notice.", icon: "document" as const },
    { title: "Review current entry requirements", detail: "Confirm subjects, eligibility, documents, and admission method from the official source.", icon: "graduation" as const },
    { title: "Compare study costs and support", detail: "Check current fees, scholarships, hostel or travel support where relevant.", icon: "coins" as const },
  ];

  return <main className="min-h-[calc(100dvh-62px)] bg-[#fcfcfa] px-5 pb-8 pt-5 text-[#26312c] sm:px-8 lg:px-12"><section className="mx-auto max-w-[1500px]">

    <header className="mt-5 flex flex-wrap items-start justify-between gap-5"><div><h1 className="font-serif text-[clamp(2.15rem,4vw,3.6rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">What would help you decide your next step?</h1><p className="mt-3 max-w-[980px] font-serif text-[1.2rem] leading-[1.35] text-[#596960]">You do not need to decide everything now. Choose a small check that can make your options clearer.</p></div><div className="flex max-w-[340px] items-center gap-3 rounded-xl bg-[#eaf5ee] px-5 py-4"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#d9eee4] text-[#176b5d]"><UserRound className="h-6 w-6" /></span><div><p className="font-serif font-semibold text-[#173d4a]">Example student scenario</p><p className="mt-1 text-sm leading-snug text-[#6b7b73]">Exploring options to understand what might be a good fit.</p></div></div></header>
    <section aria-label="Current exploration context" className="mt-5 grid gap-4 rounded-xl border border-[#e2e7e1] bg-white px-5 py-4 md:grid-cols-3"><div className="flex items-center gap-3 border-b border-[#e1e6df] pb-3 md:border-b-0 md:border-r md:pb-0"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e5f3ee] text-[#176b5d]"><BookOpen className="h-6 w-6" /></span><div><p className="text-sm text-[#6e7973]">Current exploration</p><p className="font-serif text-[1.05rem] text-[#26312c]">{course.name}</p></div></div><div className="flex items-center gap-3 border-b border-[#e1e6df] pb-3 md:border-b-0 md:border-r md:pb-0 md:pl-5"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e5f3ee] text-[#176b5d]"><MapPin className="h-6 w-6" /></span><div><p className="text-sm text-[#6e7973]">Institution</p><p className="font-serif text-[1.05rem] text-[#26312c]">{institution?.name ?? "Not selected"}</p></div></div><div className="flex items-center gap-3 md:pl-5"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#fff0cb] text-[#b07716]"><AlertTriangle className="h-6 w-6" /></span><div><p className="text-sm text-[#6e7973]">Verification status</p><p className="font-serif text-[1.05rem] text-[#26312c]">Several details still need checking.</p></div></div></section>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,.6fr)]"><section className="rounded-xl border border-[#e0e5df] bg-white p-5 sm:p-6"><h2 className="font-serif text-[1.55rem] font-semibold text-[#26312c]">Your practical checks</h2><div className="mt-5"><PracticalChecklist items={items} /></div></section><aside className="rounded-xl border border-[#e0e5df] bg-white p-5 sm:p-6"><h2 className="font-serif text-[1.45rem] font-semibold text-[#26312c]">Choose one next action</h2><div className="mt-4 space-y-2"><span className="flex min-h-14 items-center gap-3 rounded-lg bg-[#f1f2f1] px-4 text-sm text-[#9aa19d]"><Link2 className="h-5 w-5" />Check an official source <span className="ml-auto text-xs">Official source not connected.</span></span><div className="flex items-center justify-between gap-3 rounded-lg border border-[#e1e6df] px-4"><SaveButton itemType="course" itemRef={`${course.slug}:practical-checks`} label={`${course.name} practical checklist`} saveText="Save this exploration" savedText="Exploration saved" className="[&>button]:min-h-12 [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-0 [&>button]:text-[#26312c]" /><ChevronRight className="h-5 w-5 text-[#176b5d]" /></div><Link href="/guidance/possibilities" className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-[#e1e6df] px-4 text-sm font-semibold text-[#26312c] transition hover:bg-[#f0f7f2]"><span className="inline-flex items-center gap-3"><span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-[#e5f3ee] text-[#176b5d]">◈</span>Explore another possibility</span><ChevronRight className="h-5 w-5 text-[#176b5d]" /></Link></div><h3 className="mt-7 border-t border-[#e1e6df] pt-5 font-serif text-[1.25rem] font-semibold text-[#26312c]">What you can do later</h3><div className="mt-3 divide-y divide-[#e7ebe6]"><Link href={`/compare?type=course&a=${encodeURIComponent(course.slug)}`} className="flex min-h-11 items-center justify-between text-sm text-[#46574f]">Compare another course<ChevronRight className="h-5 w-5 text-[#176b5d]" /></Link><Link href="/saved" className="flex min-h-11 items-center justify-between text-sm text-[#46574f]">Revisit saved institutions<ChevronRight className="h-5 w-5 text-[#176b5d]" /></Link><Link href="/mentor" className="flex min-h-11 items-center justify-between text-sm text-[#46574f]">Ask a trusted person<ChevronRight className="h-5 w-5 text-[#176b5d]" /></Link></div></aside></div>
    <div className="mt-5 flex justify-center rounded-lg bg-[#176b6b] px-5 py-2.5"><SaveButton itemType="course" itemRef={`${course.slug}:practical-checks`} label={`${course.name} practical checklist`} saveText="Save my checklist" savedText="Checklist saved" className="[&>button]:min-h-10 [&>button]:border-0 [&>button]:bg-transparent [&>button]:font-serif [&>button]:text-lg [&>button]:font-semibold [&>button]:text-white" /></div><p className="mt-3 text-center text-sm text-[#718078]">A next action is not a commitment. You can change direction or return to this checklist later.</p>
  </section></main>;
}
