import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AdminInvitationPreview } from "@/components/admin/admin-invitation-preview";

export const metadata = { title: "Admin invitation · CareerBridge" };

export default function AdminInvitationPage() {
  return <AdminPortalShell active="settings" breadcrumb="Invitation">
    <AdminInvitationPreview />
  </AdminPortalShell>;
}
