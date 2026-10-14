import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ScheduledJobsWorkspace } from "@/components/admin/scheduled-jobs-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Automatic refresh activity · Admin workspace" };

export default async function AutomaticRefreshActivityPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/sources/activity"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="sources" breadcrumb="Sources / Automatic refresh activity">
    <ScheduledJobsWorkspace />
  </AdminPortalShell>;
}
