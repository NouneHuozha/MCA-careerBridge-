import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SafeChangesWorkspace } from "@/components/admin/safe-changes-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Safe changes · Admin workspace" };

export default async function AdminSafeChangesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/safe-changes"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="queue" breadcrumb="Review queue / Safe changes">
    <SafeChangesWorkspace />
  </AdminPortalShell>;
}
