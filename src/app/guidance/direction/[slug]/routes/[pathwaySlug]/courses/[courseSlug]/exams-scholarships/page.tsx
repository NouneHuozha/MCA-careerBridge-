import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Coins,
  ExternalLink,
  FileText,
  Gift,
  GraduationCap,
  MapPin,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getExams, getField, getPathway, getScholarships } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrance exams and scholarships · BCA" };

type OpportunityCardProps = {
  title: string;
  why: string;
  verify: string;
  href: string | null;
  icon: typeof Building2;
};

function SourceStatus() {
  return <span className="inline-flex items-center gap-2 rounded-full bg-[#fff0cb] px-4 py-2 text-xs font-medium text-[#735b25]"><span aria-hidden className="grid h-5 w-5 place-items-center rounded-full border border-[#b88d31] text-[.65rem]">◷</span>Awaiting official verification</span>;
}

function OpportunityCard({ title, why, verify, href, icon: Icon }: OpportunityCardProps) {
  return <article className="rounded-xl border border-[#e6ebe5] bg-white/90 px-5 py-5 shadow-[0_5px_20px_-18px_rgba(40,69,60,.5)]">
    <div className="flex items-start gap-4"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#e6f2ed] text-[#176b5d]"><Icon className="h-6 w-6" strokeWidth={1.6} /></span><div className="min-w-0"><h3 className="font-serif text-[1.15rem] font-semibold leading-tight text-[#26312c]">{title}</h3><p className="mt-4 text-sm leading-relaxed text-[#68746e]"><strong className="font-semibold text-[#26312c]">Why it may matter:</strong> {why}</p><p className="mt-2 text-sm leading-relaxed text-[#68746e]"><strong className="font-semibold text-[#26312c]">What to verify:</strong> {verify}</p></div></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e9e3] pt-4"><SourceStatus />{href ? <a href={href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#176b6b] px-5 text-sm font-semibold text-white transition hover:bg-[#105858]">Check official source <ExternalLink className="h-4 w-4" /></a> : <span className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#b5c8d1] px-5 text-sm font-semibold text-white/90">Official source unavailable</span>}</div>
  </article>;
}

function FilterBar({ label, value, icon: Icon, children }: { label: string; value: string; icon: typeof GraduationCap; children?: React.ReactNode }) {
  return <details className="group relative rounded-xl border border-[#e1e8e2] bg-[#f0f6f1]">
    <summary className="flex min-h-[68px] cursor-pointer list-none items-center gap-3 px-5 text-left [&::-webkit-details-marker]:hidden"><Icon aria-hidden className="h-6 w-6 shrink-0 text-[#176b5d]" /><span className="min-w-0 flex-1"><span className="block text-xs text-[#6e7b73]">{label}</span><span className="mt-1 block font-serif text-[1.02rem] text-[#26312c]">{value}</span></span><ChevronDown aria-hidden className="h-5 w-5 shrink-0 text-[#52665e] transition-transform group-open:rotate-180" /></summary>{children ? <div className="border-t border-[#dce6df] px-5 py-4 text-sm text-[#52665e]">{children}</div> : null}
  </details>;
}

export default async function ExamsScholarshipsPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string }> }) {
  const { slug, pathwaySlug, courseSlug } = await params;
  const [state, field, route, course, exams, scholarships] = await Promise.all([
    getSessionState(),
    getField(slug),
    getPathway(pathwaySlug),
    getCourse(courseSlug),
    getExams(),
    getScholarships(),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || course.slug !== "bca" || !route.courseSlugs?.includes(course.slug)) notFound();

  const courseDetail = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}`;
  const stage = state.stage === "class10" ? "Class 10" : "Class 12";
  const location = state.snapshot.locationPref === "within-nagaland" ? "Within Nagaland" : state.snapshot.locationPref === "outside-open" ? "Open to outside Nagaland" : state.snapshot.district ?? "Not set";
  const cuet = exams.find((exam) => exam.slug === "cuet-ug");
  const genericExamSource = cuet?.officialWebsite ?? cuet?.sourceUrl ?? null;
  const nationalScholarship = scholarships.find((item) => item.slug === "national-scholarship-portal");
  const stateScholarship = scholarships.find((item) => item.slug === "nagaland-state-schemes");

  return <main className="min-h-[calc(100dvh-62px)] bg-[#fcfcfa] px-5 pb-8 pt-5 text-[#26312c] sm:px-8 lg:px-12"><section className="mx-auto max-w-[1500px]">
    <div className="flex flex-wrap items-center justify-between gap-3"><nav aria-label="Exams and scholarships breadcrumb" className="flex flex-wrap items-center gap-3 text-sm text-[#7a837e]"><span>Exploring {field.name}</span><span aria-hidden>›</span><span>Courses</span><span aria-hidden>›</span><span>{course.name}</span><span aria-hidden>›</span><span className="font-semibold text-[#26312c]">Exams and scholarships</span></nav><Link href={courseDetail} className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#236b5d] underline decoration-[#9fc2b5] underline-offset-4"><span aria-hidden>←</span>Back to BCA course details</Link></div>
    <header className="mt-5"><h1 className="font-serif text-[clamp(2.15rem,4vw,3.6rem)] leading-[1.05] tracking-[-.045em] text-[#102c43]">Entrance exams and scholarships to check</h1><p className="mt-2 max-w-[1000px] font-serif text-[1.2rem] leading-[1.35] text-[#596960]">These opportunities may affect how you apply or pay for study. Confirm current rules with official sources.</p></header>
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#f0d79e] bg-[#fff2d2] px-5 py-3.5 text-[#4f4a35]"><span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#c69127] text-sm font-bold text-white">!</span><p className="text-sm">Seeing an opportunity here does not mean you are eligible. Eligibility, dates, fees, and availability can change.</p></div>
    <section aria-label="Guidance filters" className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><FilterBar label="Course" value={course.name} icon={GraduationCap}><p>This page is scoped to the course you opened.</p></FilterBar><FilterBar label="Student stage" value={stage} icon={UserRound}><p>Eligibility and application rules still need checking for the current cycle.</p></FilterBar><FilterBar label="Location" value={location} icon={MapPin}><p>Location is a context signal, not an eligibility decision.</p></FilterBar><FilterBar label="Adjust what matters" value="Review filters" icon={SlidersHorizontal}><label className="flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#176b5d]" /> Keep opportunities with official sources</label><label className="mt-2 flex items-center gap-2"><input type="checkbox" defaultChecked className="accent-[#176b5d]" /> Show support relevant to this stage</label></FilterBar></section>
    <div className="mt-5 grid gap-5 xl:grid-cols-2"><section aria-labelledby="exams-title" className="rounded-xl border border-[#dce6df] bg-[#eff7f3] p-3 sm:p-4"><div className="flex items-start gap-4 px-2 pb-3 pt-2"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dff2e9] text-[#176b5d]"><FileText className="h-7 w-7" /></span><div><h2 id="exams-title" className="font-serif text-[1.55rem] font-semibold text-[#173d4a]">Entrance exams</h2><p className="mt-1 text-sm text-[#6b7b73]">Find entrance processes that may be relevant for BCA.</p></div></div><div className="space-y-3"><OpportunityCard title="Institution or university entrance process" why="It may be used for admission to some BCA programmes." verify="Current notice, eligible courses, subjects, dates, and application method." href={genericExamSource} icon={Building2} /><OpportunityCard title="State or national entrance process" why="It may be used for admission to some BCA programmes." verify="Current notice, eligible courses, subjects, dates, and application method." href={genericExamSource} icon={UserRound} /></div></section><section aria-labelledby="scholarships-title" className="rounded-xl border border-[#dce6df] bg-[#eff7f3] p-3 sm:p-4"><div className="flex items-start gap-4 px-2 pb-3 pt-2"><span aria-hidden className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#dff2e9] text-[#176b5d]"><GraduationCap className="h-7 w-7" /></span><div><h2 id="scholarships-title" className="font-serif text-[1.55rem] font-semibold text-[#173d4a]">Scholarships and support</h2><p className="mt-1 text-sm text-[#6b7b73]">Explore scholarships and other support that may help with your BCA studies.</p></div></div><div className="space-y-3"><OpportunityCard title="State or national scholarship" why="It may help with study costs if current rules apply." verify="Student stage, location, income or category rules, course and institution conditions, deadline." href={nationalScholarship?.officialUrl ?? nationalScholarship?.sourceUrl ?? null} icon={Coins} /><OpportunityCard title="Institution support or fee assistance" why="It may help with study costs if current rules apply." verify="Student stage, location, income or category rules, course and institution conditions, deadline." href={stateScholarship?.officialUrl ?? stateScholarship?.sourceUrl ?? null} icon={Gift} /></div></section></div>
    <div className="mt-5 flex flex-col gap-3 rounded-lg bg-[#176b6b] px-5 py-3.5 text-white sm:flex-row sm:items-center"><SaveButton itemType="course" itemRef={`${course.slug}:exams-scholarships`} label={`${course.name} exams and scholarships`} saveText="Save this page" savedText="Page saved" className="[&>button]:min-h-10 [&>button]:border-0 [&>button]:bg-transparent [&>button]:px-0 [&>button]:font-serif [&>button]:text-white [&>button]:underline [&>button]:decoration-white/60 [&>button]:underline-offset-4" /><span aria-hidden className="hidden h-6 w-px bg-white/50 sm:block" /><p className="text-sm text-white/80">You can return after confirming your profile details.</p><span className="ml-auto hidden text-2xl sm:block" aria-hidden>→</span></div><p className="mt-3 text-sm text-[#718078]">Missing information means it has not been verified here.</p>
  </section></main>;
}
