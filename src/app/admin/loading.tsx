import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AdminLoadingState } from "@/components/admin/admin-loading-state";

export default function AdminLoading() {
  return <AdminPortalShell active="catalogue" breadcrumb="Catalogue / Review queue">
    <AdminLoadingState />
  </AdminPortalShell>;
}
