import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { PermissionErrorPreview } from "@/components/admin/permission-error-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Permission-limited preview · Admin workspace" };

export default async function PermissionErrorPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/change-history/permission-error-preview"));
  if (user.role !== "admin") redirect("/");
  return <AdminPortalShell active="proposals" breadcrumb="Change history / Proposed change / Access preview"><PermissionErrorPreview /></AdminPortalShell>;
}
