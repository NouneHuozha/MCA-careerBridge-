import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ReviewQueueEmptyState } from "@/components/admin/review-queue-empty-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review queue empty state · Admin workspace" };

export default async function AdminEmptyQueuePreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/empty-queue-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="queue" breadcrumb="Review queue">
    <ReviewQueueEmptyState />
  </AdminPortalShell>;
}
