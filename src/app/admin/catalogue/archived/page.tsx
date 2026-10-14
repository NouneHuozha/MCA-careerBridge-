import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ArchivedRecordsWorkspace } from "@/components/admin/archived-records-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Archived records · Admin workspace" };

export default async function ArchivedRecordsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/archived"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Archived records">
    <ArchivedRecordsWorkspace />
  </AdminPortalShell>;
}
