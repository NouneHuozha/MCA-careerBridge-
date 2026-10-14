import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourceSnapshotWorkspace } from "@/components/admin/source-snapshot-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source snapshot · Admin workspace" };

export default async function AdminSourceSnapshotPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/sources/history/snapshot"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="sources" referenceNav breadcrumb="Sources / National Scholarship Portal / Snapshot">
    <SourceSnapshotWorkspace />
  </AdminPortalShell>;
}
