import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { PartialDataStatePreview } from "@/components/admin/partial-data-state-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partial data preview · Admin workspace" };

export default async function PartialDataPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/partial-data-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Institutions / Partial data">
    <PartialDataStatePreview />
  </AdminPortalShell>;
}
