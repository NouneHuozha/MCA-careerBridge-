import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ConfirmationDialogsPreview } from "@/components/admin/confirmation-dialogs-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirmation patterns · Admin workspace" };

export default async function ConfirmationDialogsPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/confirmation-dialogs-preview"));
  if (user.role !== "admin") redirect("/");
  return <AdminPortalShell active="queue" breadcrumb="Review queue / Confirmation dialogs"><ConfirmationDialogsPreview /></AdminPortalShell>;
}
