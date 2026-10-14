import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportRollbackWorkspace } from "@/components/admin/import-rollback-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rollback import · Admin workspace" };

export default async function AdminImportRollbackPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/imports/history/rollback"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="imports" referenceNav breadcrumb="Imports / Import history / Rollback">
    <ImportRollbackWorkspace />
  </AdminPortalShell>;
}
