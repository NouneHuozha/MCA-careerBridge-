import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourceFetchHistoryWorkspace } from "@/components/admin/source-fetch-history-workspace";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fetch history · Admin workspace" };

export default async function AdminSourceFetchHistoryPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/sources/history")}`);
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="sources" breadcrumb="Sources / Fetch history" referenceNav>
    <SourceFetchHistoryWorkspace />
  </AdminPortalShell>;
}
