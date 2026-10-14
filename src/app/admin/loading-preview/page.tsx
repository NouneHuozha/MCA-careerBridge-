import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Loading state preview · Admin workspace" };

export default async function AdminLoadingPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/loading-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Review queue">
    <AdminLoadingState />
  </AdminPortalShell>;
}
