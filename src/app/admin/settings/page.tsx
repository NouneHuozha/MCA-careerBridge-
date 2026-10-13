import { redirect } from "next/navigation";
import { inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { AdminSettingsWorkspace } from "@/components/admin/admin-settings-workspace";
import { db } from "@/db";
import { adminWorkspaceSettings, users } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin settings · CareerBridge" };
const settingKey = "workspace_preferences";
const roles = ["admin", "content_editor", "verifier", "viewer"];
const defaults = { refreshFrequency: "weekly", automaticRefresh: false, reviewFields: ["eligibility", "fees", "deadlines", "course availability"], retainPreviousValues: true };

export default async function AdminSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/admin/login?next=${encodeURIComponent("/admin/settings")}`);
  if (user.role !== "admin") redirect("/");
  let initialPreferences = defaults;
  let team: { id: number; name: string | null; email: string; role: string; createdAt: string }[] = [];
  try {
    const [record] = await db.select().from(adminWorkspaceSettings).where(inArray(adminWorkspaceSettings.settingKey, [settingKey])).limit(1);
    if (record?.settingValue) initialPreferences = { ...defaults, ...record.settingValue } as typeof defaults;
  } catch (error) { console.warn("[careerbridge] admin workspace settings could not be loaded", error); }
  try {
    const records = await db.select({ id: users.id, name: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt }).from(users).where(inArray(users.role, roles)).orderBy(users.createdAt);
    team = records.map((member) => ({ ...member, createdAt: member.createdAt.toISOString() }));
  } catch (error) { console.warn("[careerbridge] admin team access could not be loaded", error); }
  return <AdminPortalShell active="settings" breadcrumb="Settings"><AdminSettingsWorkspace initialPreferences={initialPreferences} team={team} /></AdminPortalShell>;
}
