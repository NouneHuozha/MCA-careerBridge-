import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportValidationErrorPreview } from "@/components/admin/import-validation-error-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Import validation error preview · Admin workspace" };

export default async function ImportValidationErrorPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/imports/validation-error-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="imports" breadcrumb="Imports / Validation error preview">
    <ImportValidationErrorPreview />
  </AdminPortalShell>;
}
