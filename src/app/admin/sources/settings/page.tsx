import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getAdminAuthRedirect, getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourceRefreshSettings } from "@/components/admin/source-refresh-settings";
import { db } from "@/db";
import { sourceRefreshSettings } from "@/db/schema";
import { getAdminSourceRegistry, normaliseSourceUrl } from "@/services/admin-sources";

export const dynamic = "force-dynamic";
export const metadata = { title: "Source refresh settings · Admin workspace" };

type Props = { searchParams: Promise<{ sourceKey?: string }> };

export default async function AdminSourceRefreshSettingsPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) redirect(await getAdminAuthRedirect("/admin/sources"));
  if (user.role !== "admin") redirect("/");

  const query = await searchParams;
  let sourceKey = "";
  try { sourceKey = normaliseSourceUrl(query.sourceKey ?? ""); } catch { sourceKey = ""; }
  const { sources } = await getAdminSourceRegistry();
  const source = query.sourceKey
    ? sources.find((item) => item.sourceKey === sourceKey)
    : sources[0];
  if (!source) redirect("/admin/sources");

  let initialEnabled = false;
  let initialFrequency = "manual";
  let initialFetchMethod = "manual";
  let recordedSettingAt: string | null = null;
  try {
    const [setting] = await db.select().from(sourceRefreshSettings).where(eq(sourceRefreshSettings.sourceKey, source.sourceKey)).limit(1);
    if (setting) {
      initialEnabled = setting.refreshEnabled;
      initialFrequency = setting.refreshFrequency;
      initialFetchMethod = setting.fetchMethod;
      recordedSettingAt = setting.updatedAt.toISOString();
    }
  } catch (error) {
    console.warn("[careerbridge] source refresh preference could not be loaded", error);
  }

  return <AdminPortalShell active="sources" breadcrumb={`Sources / ${source.title}`}>
    <SourceRefreshSettings key={source.sourceKey} source={source} initialEnabled={initialEnabled} initialFrequency={initialFrequency} initialFetchMethod={initialFetchMethod} recordedSettingAt={recordedSettingAt} />
  </AdminPortalShell>;
}
