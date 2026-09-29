import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardList, ExternalLink, FileCheck2, Info, ShieldCheck } from "lucide-react";
import { getAdmissionInfo, getCourse, getField, getInstitution, getPathway } from "@/services/catalog";
import { getSessionState } from "@/services/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Application and requirements · BCA" };

function verification(status: string | null | undefined) {
  if (status === "verified") return "Verified official source";
  if (status === "unavailable") return "Official source not connected";
  if (status === "conflicting") return "Conflicting sources";
  return "Needs verification";
}

function StatusCard({ title, detail, icon: Icon = Info }: { title: string; detail: string; icon?: typeof Info }) {
  return <div className="flex gap-3 rounded-[.8rem] border border-[#e4e2d9] bg-[#f7faf6] p-4"><Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" /><div><h3 className="font-serif text-[1.05rem] text-[#26312c]">{title}</h3><p className="mt-1 text-sm leading-[1.4] text-[#626b63]">{detail}</p></div></div>;
}

export default async function ApplicationRequirementsPage({ params }: { params: Promise<{ slug: string; pathwaySlug: string; courseSlug: string; code: string }> }) {
  const { slug, pathwaySlug, courseSlug, code } = await params;
  const [state, field, route, course, institution, admissions] = await Promise.all([
    getSessionState(), getField(slug), getPathway(pathwaySlug), getCourse(courseSlug), getInstitution(code), getAdmissionInfo(code),
  ]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!field || !route || !course || course.slug !== "bca" || !route.courseSlugs?.includes(course.slug) || !institution) notFound();

  const record = admissions.find((item) => item.courseSlug === course.slug) ?? admissions.find((item) => item.courseSlug == null);
  const status = verification(record?.verificationStatus);
  const base = `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(pathwaySlug)}/courses/${encodeURIComponent(courseSlug)}/institutions/${encodeURIComponent(code)}`;
  const officialHref = record?.sourceUrl ?? institution.officialWebsite ?? institution.sourceUrl;
  const process = record?.process ?? [];
  const documents = record?.documents ?? [];
  const dates = record?.importantDates ?? [];

  return <main className="min-h-[calc(100dvh-77px)] px-5 pb-12 pt-8 sm:px-8 sm:pt-10 lg:pt-11"><section className="mx-auto max-w-[1180px]">
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#77786f]"><Link href={base} className="text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4">{institution.name}</Link><span aria-hidden>·</span><span>BCA</span><span aria-hidden>·</span><span>Application and requirements</span></div>
    <header className="mt-5 border-b border-[#e5e2d8] pb-6"><p className="font-serif text-[1rem] text-[#77786f]">Exploring {field.name} <span aria-hidden>·</span> Institutions <span aria-hidden>·</span> BCA</p><h1 className="mt-4 max-w-[900px] font-serif text-[clamp(2.25rem,5vw,4rem)] leading-[1.04] tracking-[-.045em] text-[#202522]">Application and requirements</h1><p className="mt-3 max-w-[820px] font-serif text-[clamp(1.05rem,1.8vw,1.3rem)] leading-[1.45] text-[#525950]">What to check before applying to BCA at {institution.name}.</p><div className="mt-4 flex flex-wrap items-center gap-3"><span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-xs font-semibold text-[#7b642b]">{status}</span><span className="text-sm text-[#77786f]">Information changes by institution and admission cycle.</span></div></header>
    <section aria-labelledby="status-title" className="mt-5 rounded-[1rem] border border-[#ead9a8] bg-[#fff5df] px-5 py-5 sm:px-7"><div className="flex gap-3"><AlertTriangle aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-[#b17816]" /><div><h2 id="status-title" className="font-serif text-[1.45rem] text-[#73520f]">Current application information is not confirmed</h2><p className="mt-2 max-w-[850px] text-sm leading-[1.5] text-[#5e533c]">CareerBridge does not have a verified current application notice for BCA at this institution. Use the institution’s official source for the current process, dates, eligibility, and documents.</p>{officialHref ? <a href={officialHref} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#73520f] px-4 text-sm font-semibold text-white hover:bg-[#62450d]">Open official source <ExternalLink aria-hidden className="h-4 w-4" /></a> : null}</div></div></section>
    <div className="mt-5 grid gap-5 lg:grid-cols-2"><section aria-labelledby="application-title" className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-5 sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><ClipboardList className="h-6 w-6" /></span><div><h2 id="application-title" className="font-serif text-[1.55rem] text-[#26312c]">Application process</h2><p className="text-sm text-[#77786f]">Check the current institution notice.</p></div></div><div className="mt-5 space-y-3">{process.length ? process.map((item) => <div key={item} className="flex gap-3 border-t border-[#e7e3da] pt-3"><CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" /><p className="text-sm leading-[1.45] text-[#525950]">{item}</p></div>) : <StatusCard title="Process not provided" detail="The current application steps are not connected. Check the official admission notice before starting an application." />}</div></section>
      <section aria-labelledby="requirements-title" className="rounded-[1rem] border border-[#e4e2d9] bg-[#fffefa] px-6 py-5 sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><FileCheck2 className="h-6 w-6" /></span><div><h2 id="requirements-title" className="font-serif text-[1.55rem] text-[#26312c]">Requirements and documents</h2><p className="text-sm text-[#77786f]">Do not rely on an unverified list.</p></div></div><div className="mt-5 space-y-3">{documents.length ? documents.map((item) => <div key={item} className="flex gap-3 border-t border-[#e7e3da] pt-3"><CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#47766c]" /><p className="text-sm leading-[1.45] text-[#525950]">{item}</p></div>) : <StatusCard title="Document list not provided" detail="The exact documents, subject requirements, and marks requirements must be confirmed from the institution’s current source." />}</div></section></div>
    <section aria-labelledby="dates-title" className="mt-5 rounded-[1rem] border border-[#e4e2d9] bg-[#f7faf6] px-6 py-5 sm:px-7"><div className="flex items-center gap-3"><span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f0ec] text-[#286b61]"><Info className="h-6 w-6" /></span><div><h2 id="dates-title" className="font-serif text-[1.55rem] text-[#26312c]">Dates and fees</h2><p className="text-sm text-[#77786f]">Current values are not available in the connected catalogue.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3">{dates.length ? dates.map((date) => <StatusCard key={`${date.label}-${date.value}`} title={date.label} detail={date.value} />) : <><StatusCard title="Application window" detail="Information not provided" /><StatusCard title="Important dates" detail="Information not provided" /><StatusCard title="Fees" detail={record?.feesNote ?? "Information not provided"} /></>}</div></section>
    <section className="mt-5 rounded-[1rem] border border-[#dce6de] bg-[#eaf2ed] px-5 py-5 sm:px-7"><div className="flex gap-3"><ShieldCheck aria-hidden className="mt-0.5 h-6 w-6 shrink-0 text-[#35675b]" /><div><h2 className="font-serif text-[1.3rem] text-[#26312c]">Before you submit anything</h2><p className="mt-2 text-sm leading-[1.5] text-[#525950]">Confirm the institution name, BCA course availability, eligibility, documents, fees, and closing date on the official notice. Keep a copy of anything you submit.</p></div></div></section>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e2d8] pt-5"><Link href={base} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4"><ArrowLeft aria-hidden className="h-4 w-4" />Back to institution detail</Link><p className="text-sm text-[#77786f]">Source status: {status}</p></div>
  </section></main>;
}
