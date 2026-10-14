import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { OfflineInstitutionPreview } from "@/components/admin/offline-institution-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Offline state preview · Admin workspace" };

export default async function OfflineInstitutionPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/offline-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institutions / Offline preview">
    <OfflineInstitutionPreview />
  </AdminPortalShell>;
}
