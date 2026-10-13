import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourcesWorkspace } from "@/components/admin/sources-workspace";
import { getAdminSourceRegistry } from "@/services/admin-sources";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sources · Admin workspace" };

export default async function AdminSourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin/sources")}`);
  if (user.role !== "admin") redirect("/");

  const { sources, institutions } = await getAdminSourceRegistry();
  return <AdminPortalShell active="sources" breadcrumb="Sources">
    <SourcesWorkspace sources={sources} institutions={institutions} now={new Date().toISOString()} />
  </AdminPortalShell>;
}
