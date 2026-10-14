import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { DraftSaveStatusPreview } from "@/components/admin/draft-save-status-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Draft save status preview · Admin workspace" };

export default async function DraftSaveStatusPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/save-status-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Draft editor / Save status">
    <DraftSaveStatusPreview />
  </AdminPortalShell>;
}
