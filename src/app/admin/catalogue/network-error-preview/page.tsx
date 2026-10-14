import { redirect } from "next/navigation";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { CatalogueNetworkErrorPreview } from "@/components/admin/catalogue-network-error-preview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Catalogue load error preview · Admin workspace" };

export default async function CatalogueNetworkErrorPreviewPage() {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/catalogue/network-error-preview"));
  if (user.role !== "admin") redirect("/");

  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Load error">
    <div className="border-b border-[#dce5e0] pb-4">
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#65776e]">Catalogue</p>
      <h1 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Catalogue</h1>
    </div>
    <CatalogueNetworkErrorPreview />
  </AdminPortalShell>;
}
