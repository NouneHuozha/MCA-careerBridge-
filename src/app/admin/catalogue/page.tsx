import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ArrowRight, Award, Building2, ChevronRight, FileText, FileUp, GitBranch, GraduationCap, Info, Link2, Plus, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { db } from "@/db";
import { admissionInformation } from "@/db/schema";
import { getAllInstitutionCourseLinks, getCourses, getExams, getInstitutions, getOpportunities, getPathways, getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue · Admin workspace" };

const acceptedVerification = new Set(["verified", "current", "recently_verified", "published_verified", "approved"]);
const countReview = (items: { verificationStatus?: string | null }[]) => items.filter((item) => !acceptedVerification.has(item.verificationStatus ?? "")).length;
const numberLabel = (count: number, noun: string) => `${count} ${noun}${count === 1 ? "" : "s"}`;
type CatalogueItem = { name: string; description: string; count: string; review: number | null; href: string; icon: LucideIcon; emptyAttention?: boolean };
type CatalogueGroup = { title: string; items: CatalogueItem[] };

function AddRecordMenu() {
  const choices = [
    ["Institution", "/admin/catalogue/institutions"],
    ["Course", "/admin/catalogue/courses"],
    ["Institution-course link", "/admin/catalogue/institution-courses"],
    ["Entrance exam", "/admin/catalogue/exams"],
    ["Scholarship", "/admin/catalogue/scholarships"],
    ["Admission information", "/admin/catalogue/admission-information"],
    ["Pathway", "/admin/catalogue/pathways"],
    ["Opportunity", "/admin/catalogue/opportunities"],
  ];
  return <details className="relative"><summary className="inline-flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]"><Plus aria-hidden className="h-4 w-4"/>Add record</summary><div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-[#d4dfda] bg-white p-2 shadow-lg"><p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-[#687970]">Choose a catalogue</p>{choices.map(([label, href]) => <Link key={href} href={href} className="block rounded-lg px-3 py-2 text-sm font-medium text-[#344b41] hover:bg-[#f0f5f2]">{label}<span className="block text-xs font-normal text-[#687970]">Open catalogue to add or review</span></Link>)}</div></details>;
}

export default async function AdminCatalogueOverview({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue"));
  if (user.role !== "admin") redirect("/");
  const { q: rawQuery } = await searchParams;
  const q = rawQuery?.trim().slice(0, 120) ?? "";
  const [institutions, courses, links, exams, scholarships, pathways, opportunities] = await Promise.all([
    getInstitutions({}), getCourses({}), getAllInstitutionCourseLinks(), getExams(), getScholarships(), getPathways(), getOpportunities(),
  ]);
  let admissions: (typeof admissionInformation.$inferSelect)[] = [];
  try { admissions = await db.select().from(admissionInformation); } catch (error) { console.warn("[careerbridge] admission overview query unavailable", error); }

  const groups: CatalogueGroup[] = [
    { title: "Education catalogue", items: [
      { name: "Institutions", description: "Places where students can study.", count: numberLabel(institutions.length, "record"), review: countReview(institutions), href: "/admin/catalogue/institutions", icon: Building2 },
      { name: "Courses", description: "Course details, eligibility, duration, and routes.", count: numberLabel(courses.length, "record"), review: countReview(courses), href: "/admin/catalogue/courses", icon: GraduationCap },
      { name: "Institution-course links", description: "Which courses are currently confirmed at which institutions.", count: numberLabel(links.length, "link"), review: countReview(links), href: "/admin/catalogue/institution-courses", icon: Link2 },
    ] },
    { title: "Application and support", items: [
      { name: "Entrance exams", description: "Eligibility, application periods, cycles, and official dates.", count: numberLabel(exams.length, "exam"), review: countReview(exams), href: "/admin/catalogue/exams", icon: FileText },
      { name: "Scholarships", description: "Eligibility, deadlines, documents, and support information.", count: numberLabel(scholarships.length, "scholarship"), review: countReview(scholarships), href: "/admin/catalogue/scholarships", icon: Award },
      { name: "Admission information", description: "Application windows, process, documents, and fee notes.", count: numberLabel(admissions.length, "record"), review: admissions.filter((item) => !acceptedVerification.has(item.verificationStatus)).length, href: "/admin/catalogue/admission-information", icon: FileText, emptyAttention: admissions.length === 0 },
    ] },
    { title: "Guidance catalogue", items: [
      { name: "Pathways and opportunities", description: "CareerBridge-organized routes, learning options, projects, and early experiences.", count: `${numberLabel(pathways.length, "pathway")} · ${numberLabel(opportunities.length, "opportunity")}`, review: null, href: "/admin/catalogue/pathways", icon: GitBranch },
    ] },
  ];
  const normalized = q.toLowerCase();
  const visibleGroups = groups.map((group) => ({ ...group, items: group.items.filter((item) => !normalized || `${group.title} ${item.name} ${item.description}`.toLowerCase().includes(normalized)) })).filter((group) => group.items.length);

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Catalogue</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#53665e]">Manage the information students explore, with sources and verification status attached.</p></div>
      <div className="flex flex-wrap gap-2"><Link href="/admin/catalogue/network-error-preview" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]">Load-error preview</Link><Link href="/admin/catalogue/offline-preview" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]">Offline preview</Link><Link href="/admin/catalogue/archived" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]">Archived records</Link><Link href="/admin/imports" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#104d38]"><FileUp aria-hidden className="h-4 w-4"/>Import workbook</Link><AddRecordMenu/></div>
    </div>
    <form action="/admin/catalogue" method="get" className="mt-6 rounded-xl border border-[#d7e1dc] bg-white p-3 sm:p-4"><label htmlFor="catalogue-search" className="sr-only">Search catalogue categories</label><div className="relative"><Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]"/><input id="catalogue-search" name="q" type="search" defaultValue={q} placeholder="Search catalogue" className="h-11 w-full rounded-lg border border-[#cbd8d2] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/></div></form>

    <div className="mt-5 space-y-4">{visibleGroups.map((group) => <section key={group.title} className="overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-sm" aria-labelledby={`group-${group.title.replaceAll(" ", "-").toLowerCase()}`}><h2 id={`group-${group.title.replaceAll(" ", "-").toLowerCase()}`} className="px-4 pt-4 text-lg font-bold tracking-tight text-[#172b35] sm:px-5">{group.title}</h2><div className="divide-y divide-[#e5ebe8] px-3 pb-1 sm:px-4">{group.items.map((item) => { const Icon = item.icon; const hasAttention = item.emptyAttention || (item.review !== null && item.review > 0); return <div key={item.name} className="grid gap-3 py-3 sm:grid-cols-[minmax(205px,1fr)_minmax(220px,1.55fr)_minmax(100px,.65fr)_minmax(140px,.7fr)_minmax(142px,.72fr)] sm:items-center sm:gap-4"><div className="flex min-w-0 items-center gap-3"><span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#eaf5ef] text-[#176b5d]"><Icon className="h-5 w-5"/></span><span className="font-semibold text-[#263d32]">{item.name}</span></div><p className="pl-[52px] text-sm leading-relaxed text-[#687970] sm:pl-0">{item.description}</p><p className="pl-[52px] text-sm font-medium text-[#53665e] sm:pl-0">{item.count}</p><div className="pl-[52px] sm:pl-0">{item.review === null ? <span className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5e0] bg-[#f4f7f5] px-2.5 py-1.5 text-xs font-semibold text-[#53665e]">Curated guidance</span> : hasAttention ? <span className="inline-flex items-center gap-1.5 rounded-md border border-[#efdfbd] bg-[#fff5df] px-2.5 py-1.5 text-xs font-bold text-[#94610c]"><AlertCircle aria-hidden className="h-3.5 w-3.5"/>{item.emptyAttention ? "Needs attention" : `${item.review} need review`}</span> : <span className="inline-flex items-center gap-1.5 rounded-md border border-[#dce5e0] bg-[#f4f7f5] px-2.5 py-1.5 text-xs font-semibold text-[#53665e]">No pending review</span>}</div><Link href={item.href} className="ml-[52px] inline-flex min-h-10 items-center justify-between gap-2 rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-bold text-[#344b41] hover:bg-[#f1f6f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176b5d] sm:ml-0"><span>{item.emptyAttention ? "Open review" : "Open catalogue"}</span><ChevronRight aria-hidden className="h-4 w-4"/></Link></div>; })}</div></section>)}
      {!visibleGroups.length && <div className="rounded-xl border border-[#d7e1dc] bg-white px-5 py-12 text-center"><Search aria-hidden className="mx-auto h-8 w-8 text-[#74857c]"/><p className="mt-3 font-semibold text-[#263d32]">No catalogue categories match “{q}”</p><Link href="/admin/catalogue" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-[#145c42] underline">Clear search<ArrowRight aria-hidden className="h-3.5 w-3.5"/></Link></div>}
    </div>
    <p className="mt-4 flex items-start gap-2 rounded-lg border border-[#d8e1dc] bg-[#edf2ef] p-3 text-sm leading-relaxed text-[#53665e]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Catalogue information is reviewed against sources before it becomes current student-facing data.</p>
  </AdminPortalShell>;
}
