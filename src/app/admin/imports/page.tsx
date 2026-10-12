import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { ImportWorkbench } from "@/components/admin/import-workbench";

export const dynamic = "force-dynamic";
export const metadata = { title: "Imports · Admin workspace" };

export default async function AdminImportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/imports")}`);
  if (user.role !== "admin") redirect("/");
  return <AdminPortalShell active="imports" breadcrumb="Imports / New import"><ImportWorkbench /></AdminPortalShell>;
}
