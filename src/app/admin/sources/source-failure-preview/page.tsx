import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourceFailurePreview } from "@/components/admin/source-failure-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source failure preview · Admin workspace" };

export default async function SourceFailurePreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/sources/source-failure-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="sources" breadcrumb="Sources / Source detail / Failure preview">
    <SourceFailurePreview />
  </AdminPortalShell>;
}
