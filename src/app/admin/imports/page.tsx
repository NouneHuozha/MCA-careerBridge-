import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportWorkbench } from "@/components/admin/import-workbench";
import { getInstitutions } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Imports · Admin workspace" };

export default async function AdminImportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/imports")}`);
  if (user.role !== "admin") redirect("/");
  const institutions = await getInstitutions({});
  return <AdminPortalShell active="imports" breadcrumb="Imports / New import"><ImportWorkbench knownInstitutionCodes={institutions.map((institution) => institution.code)} /></AdminPortalShell>;
}
