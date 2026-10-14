import { Info } from "lucide-react";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";

export const metadata = { title: "Profile menu preview · CareerBridge Admin" };

export default function AdminProfileMenuPreviewPage() {
  return <AdminPortalShell active="queue" breadcrumb="Admin / Profile menu preview" profilePreview>
    <div className="space-y-5"><header className="border-b border-[#dce5e0] pb-4"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Admin <span aria-hidden="true">/</span> Profile menu</p><h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Admin profile</h1><p className="mt-2 text-sm text-[#53665e]">Profile menu open · two actionable review items · sample data</p></header><section className="rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-sm"><h2 className="font-bold text-[#263d32]">Review queue</h2><p className="mt-3 rounded-lg border border-[#d7e1dc] bg-[#f7f9f8] px-3 py-3 text-sm text-[#53665e]">Two sample items need admin attention. Routine source checks are not shown in the profile menu.</p></section><section className="max-w-xl rounded-xl border border-[#d7e1dc] bg-white p-5 shadow-sm"><h2 className="font-bold text-[#263d32]">Admin workspace</h2><p className="mt-1 text-sm text-[#53665e]">Search institutions, courses, or sources…</p></section><p className="flex items-start gap-2 rounded-lg border border-[#d8e3e8] bg-[#f1f6f8] px-4 py-3 text-xs leading-relaxed text-[#445c67]"><Info aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Public UI preview only. The account, email, and actionable count are synthetic; no profile data or notification service is exposed. Sign out is disabled.</p></div>
  </AdminPortalShell>;
}
