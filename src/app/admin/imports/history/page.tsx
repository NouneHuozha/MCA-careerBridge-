import { redirect } from "next/navigation";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportHistoryWorkspace } from "@/components/admin/import-history-workspace";
import { getCurrentUser } from "@/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import history · Admin workspace" };

export default async function AdminImportHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/imports/history")}`);
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="imports" referenceNav breadcrumb="Imports / Import history">
    <ImportHistoryWorkspace />
  </AdminPortalShell>;
}
