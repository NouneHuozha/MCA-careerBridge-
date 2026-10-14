import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account · Admin workspace" };
const roleLabels: Record<string, string> = { admin: "Administrator", content_editor: "Content editor", verifier: "Verifier", viewer: "Viewer" };

export default async function AdminProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/profile"));
  if (user.role !== "admin") redirect("/");
  return <AdminPortalShell active="settings" breadcrumb="Admin / My account"><div className="max-w-2xl space-y-5"><header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Admin workspace</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">My account</h1><p className="mt-2 text-sm text-[#53665e]">Authenticated account details and workspace role.</p></header><section className="rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-sm sm:p-6"><dl className="divide-y divide-[#e5ebe8]"><div className="py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-[#687970]">Name</dt><dd className="mt-1 text-sm font-semibold text-[#263d32]">{user.name || "Name not set"}</dd></div><div className="py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-[#687970]">Email</dt><dd className="mt-1 break-all text-sm font-semibold text-[#263d32]">{user.email}</dd></div><div className="py-4"><dt className="text-xs font-semibold uppercase tracking-wide text-[#687970]">Workspace role</dt><dd className="mt-1 text-sm font-semibold text-[#263d32]">{roleLabels[user.role] ?? "Workspace member"}</dd></div></dl><p className="mt-3 rounded-lg border border-[#d7e1dc] bg-[#f4f7f5] p-3 text-xs leading-relaxed text-[#53665e]">Profile and access details are read-only here. An administrator can review workspace roles in Settings.</p></section></div></AdminPortalShell>;
}
