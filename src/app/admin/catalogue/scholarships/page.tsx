import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AddScholarshipDialog } from "@/components/admin/add-scholarship-dialog";
import { ScholarshipsCatalogueWorkspace } from "@/components/admin/scholarships-catalogue-workspace";
import { getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Scholarships · Admin catalogue" };

export default async function AdminScholarshipsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/catalogue/scholarships")}`);
  if (user.role !== "admin") redirect("/");
  const scholarships = await getScholarships();
  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Scholarships">
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Catalogue sections">
      <Link href="/admin/catalogue" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">All catalogues</Link>
      <Link href="/admin/catalogue/institutions" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Institutions</Link>
      <Link href="/admin/catalogue/courses" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Courses</Link>
      <Link href="/admin/catalogue/exams" className="rounded-lg border border-[#d5dfda] bg-white px-3 py-2 text-sm font-semibold text-[#455b51] hover:bg-[#f0f5f2]">Entrance exams</Link>
      <span aria-current="page" className="rounded-lg border border-[#b8d8c8] bg-[#e3f1e9] px-3 py-2 text-sm font-bold text-[#145c42]">Scholarships</span>
    </div>
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue management</p><h1 className="mt-1 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Scholarships</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#455b51]">Keep eligibility, support details, deadlines, documents, and official links current.</p></div><div className="flex flex-wrap items-center gap-2"><AddScholarshipDialog/><Link href="/admin/imports?dataset=scholarships" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] bg-white px-4 text-sm font-bold text-[#17634b] transition hover:bg-[#f0f7f3]"><span aria-hidden>↑</span>Import workbook</Link></div></header>
    <ScholarshipsCatalogueWorkspace records={scholarships.map((item) => ({
      slug: item.slug, name: item.name, provider: item.provider ?? "", category: item.category ?? "", eligibility: item.eligibility ?? "", amountNote: item.amountNote ?? "", deadlineNote: item.deadlineNote ?? "", cycleLabel: item.cycleLabel ?? "", documents: item.documents ?? [], officialUrl: item.officialUrl ?? "", sourceUrl: item.sourceUrl ?? "", appliesToStage: item.appliesToStage ?? [], verificationStatus: item.verificationStatus, lastVerifiedAt: item.lastVerifiedAt?.toISOString() ?? null,
    }))}/>
  </AdminPortalShell>;
}
