import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Building2, ExternalLink, GraduationCap, Info, MapPin, ShieldCheck } from "lucide-react";
import { SaveButton } from "@/components/save-button";
import { getCourse, getField, getInstitution, getInstitutionLinks, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Selected institution · BCA" };

function verification(status: string | null | undefined) {
  if (status === "verified") return "Verified official source";
  if (status === "unavailable") return "Official source not connected";
  if (status === "conflicting") return "Conflicting sources";
  return "Needs verification";
}

function Fact({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return <div className="flex gap-3 border-t border-[#e7e3da] pt-3 first:border-0 first:pt-0"><Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#35675b]" /><div><dt className="font-semibold text-[#424a43]">{label}</dt><dd className="mt-0.5 text-sm leading-[1.35] text-[#77786f]">{children}</dd></div></div>;
}

export default async function SelectedInstitutionDetail({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string; code: string }> }) {
  const { slug, pathwaySlug, courseSlug, code } = await params;
  const [state, field, route, course, institution, links] = await Promise.all([
    getSessionState(), getField(slug), getPathway(pathwaySlug), getCourse(courseSlug), getInstitution(code), getInstitutionLinks(code),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || course.slug !== "bca" || !route.courseSlugs?.includes(course.slug) || !institution) notFound();

  const courseLink = links.find((link) => link.courseSlug === course.slug);
  const institutionStatus = verification(institution.verificationStatus);
  const courseStatus = verification(courseLink?.verificationStatus);
  const base = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}`;
  const institutionsHref = `${base}/institutions`;
  const applicationHref = `${base}/institutions/${encodeURIComponent(code)}/application`;
  const officialHref = institution.officialWebsite ?? institution.sourceUrl;

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1400px]">
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#77786f]"><Link href={base} className="text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4">BCA course</Link><span aria-hidden>·</span><Link href={institutionsHref} className="text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4">Institutions</Link><span aria-hidden>·</span><span>{institution.name}</span></div>
    <header className="mt-5 flex flex-wrap items-end justify-between gap-5 border-b border-[#e5e2d8] pb-6"><div><p className="font-serif text-[1rem] text-[#77786f]">Exploring {field.name} <span aria-hidden>·</span> Institutions <span aria-hidden>·</span> BCA</p><h1 className="mt-4 max-w-[1000px] font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-[-.045em] text-[#202522]">{institution.name}</h1><p className="mt-3 flex items-center gap-2 text-base text-[#626b63]"><MapPin aria-hidden className="h-4 w-4 text-[#35675b]" />{institution.city ?? institution.district}, {institution.district}</p><div className="mt-4 flex flex-wrap gap-2"><span className="rounded-full bg-[#e8f0ec] px-3 py-1.5 text-xs font-semibold capitalize text-[#35675b]">{institution.ownership}</span><span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-xs font-semibold text-[#7b642b]">{institutionStatus}</span></div></div><div className="flex flex-wrap gap-3"><SaveButton itemType="institution" itemRef={institution.code} label={institution.name} saveText="Save for later" savedText="Saved" className="[&>button]:min-h-11 [&>button]:rounded-xl [&>button]:border-[#9ebfb2] [&>button]:bg-transparent [&>button]:font-serif [&>button]:text-[#35675b]" />{officialHref ? <a href={officialHref} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#286b61] px-4 text-sm font-semibold text-white hover:bg-[#1f5b53]">Official source <ExternalLink aria-hidden className="h-4 w-4" /></a> : null}</div></header>
    <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(330px,.8fr)]"><div className="min-w-0 space-y-5">
      <section className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-5 sm:px-7"><div className="flex gap-4"><span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Building2 className="h-7 w-7" /></span><div><h2 className="font-serif text-[1.55rem] text-[#26312c]">About this institution</h2><p className="mt-3 font-serif text-[1.05rem] leading-[1.45] text-[#525950]">{institution.about ?? "Institution information is not provided in the connected catalogue."}</p></div></div><dl className="mt-6 grid gap-4 border-t border-[#e7e3da] pt-5 sm:grid-cols-2"><Fact icon={Building2} label="Institute type">{institution.type}</Fact><Fact icon={MapPin} label="Location">{institution.city ?? institution.district}, {institution.district}</Fact><Fact icon={ShieldCheck} label="Institution source status">{institutionStatus}</Fact><Fact icon={Info} label="Campus details">Information not provided</Fact></dl></section>
      <section className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-5 sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><GraduationCap className="h-6 w-6" /></span><div><h2 className="font-serif text-[1.55rem] text-[#26312c]">BCA at this institution</h2><p className="text-sm text-[#77786f]">Selected course context</p></div></div><div className="mt-5 rounded-[.8rem] border border-[#e7e3da] bg-[#f7faf6] p-4"><div className="flex gap-3"><BookOpen aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#35675b]" /><div><h3 className="font-serif text-[1.15rem] text-[#26312c]">{course.name}</h3><p className="mt-1 text-sm text-[#626b63]">Course availability: <strong className="text-[#424a43]">{courseStatus}</strong></p></div></div></div><p className="mt-4 flex items-start gap-2 text-sm leading-[1.4] text-[#626b63]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-[#47766c]" />Confirm that BCA is offered in the current cycle on the institution’s official source.</p></section>
    </div><aside className="space-y-5"><section className="rounded-[1rem] border border-[#e4e2d9] bg-[#f7faf6] px-5 py-5"><h2 className="font-serif text-[1.55rem] text-[#26312c]">Where it is</h2><div className="mt-4 grid min-h-[210px] place-items-center rounded-[.8rem] border border-[#dce6de] bg-[#e9f1ec] p-5 text-center"><MapPin aria-hidden className="h-10 w-10 text-[#47766c]" /><p className="mt-3 font-serif text-[1.05rem] text-[#424a43]">{institution.city ?? institution.district}, {institution.district}</p><p className="mt-1 text-sm text-[#77786f]">Approximate catalogue location</p></div><dl className="mt-4 space-y-4"><Fact icon={MapPin} label="Address">{institution.city ?? institution.district} · {institution.district}</Fact><Fact icon={Info} label="Connectivity">Information not provided</Fact><Fact icon={Building2} label="Nearest city">{institution.city ?? "Information not provided"}</Fact></dl></section><section className="rounded-[1rem] border border-[#ead9a8] bg-[#fff5df] px-5 py-5"><h2 className="flex items-center gap-2 font-serif text-[1.35rem] text-[#73520f]"><ShieldCheck aria-hidden className="h-5 w-5" />Before you apply</h2><p className="mt-4 text-sm leading-relaxed text-[#5e533c]">Confirm current details on the official admission notice.</p><p className="mt-3 text-sm leading-relaxed text-[#5e533c]">Fees, eligibility, scholarships, course intake, and important dates are not confirmed here.</p><Link href={applicationHref} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#73520f] px-4 text-sm font-semibold text-white hover:bg-[#62450d]">Application and requirements <span aria-hidden>→</span></Link>{officialHref ? <a href={officialHref} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#73520f] underline underline-offset-4">Check official source <ExternalLink aria-hidden className="h-4 w-4" /></a> : null}</section></aside></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e2d8] pt-5"><Link href={institutionsHref} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4"><ArrowLeft aria-hidden className="h-4 w-4" />Back to institutions</Link><p className="text-sm text-[#77786f]">Institution information is a starting point. Verify before applying.</p></div>
  </section></main>;
}
