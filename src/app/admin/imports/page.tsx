import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportWorkbench, type ImportDataset } from "@/components/admin/import-workbench";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Imports · Admin workspace" };

export default async function AdminImportsPage({ searchParams }: { searchParams: Promise<{ dataset?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/imports")}`);
  if (user.role !== "admin") redirect("/");
  const params = await searchParams;
  const datasets: ImportDataset[] = ["institutions", "courses", "institution_courses", "pathways", "entrance_exams", "scholarships", "opportunities"];
  const initialDatasetId = datasets.includes(params.dataset as ImportDataset) ? params.dataset as ImportDataset : "institutions";
  const institutions = await getInstitutions({});
  return <AdminPortalShell active="imports" breadcrumb="Imports / New import"><ImportWorkbench knownInstitutionCodes={institutions.map((institution) => institution.code)} initialDatasetId={initialDatasetId} /></AdminPortalShell>;
}
