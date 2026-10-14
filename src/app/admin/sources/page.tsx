import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourcesWorkspace } from "@/components/admin/sources-workspace";
import { getAdminSourceRegistry } from "@/services/admin-sources";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sources · Admin workspace" };

export default async function AdminSourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/sources"));
  if (user.role !== "admin") redirect("/");

  const { sources, institutions } = await getAdminSourceRegistry();
  return <AdminPortalShell active="sources" breadcrumb="Sources">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#d7e1dc] bg-white p-4"><div><p className="text-sm font-bold text-[#263d32]">Failure-state reference</p><p className="mt-1 text-xs text-[#687970]">Inspect how a source outage preserves the last approved value. Preview only.</p></div><Link href="/admin/sources/source-failure-preview" className="inline-flex min-h-10 items-center rounded-lg border border-[#cbd8d2] px-3 text-sm font-bold text-[#145c42] hover:bg-[#f2f7f4]">Open preview</Link></div>
    <SourcesWorkspace sources={sources} institutions={institutions} now={new Date().toISOString()} />
  </AdminPortalShell>;
}
