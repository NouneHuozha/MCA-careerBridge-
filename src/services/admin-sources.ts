import { db } from "@/db";
import { institutionSources, sourceRefreshSettings } from "@/db/schema";
import { getCourses, getExams, getInstitutions, getOpportunities, getScholarships } from "@/services/catalog";
import type { SourceItem } from "@/components/admin/sources-workspace";

export type AdminInstitutionOption = { code: string; name: string };
export type AdminSourceRegistry = { sources: SourceItem[]; institutions: AdminInstitutionOption[] };

export function normaliseSourceUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return value.trim();
  }
}

function normaliseSourceStatus(status: string | null | undefined): SourceItem["status"] {
  const value = (status ?? "").toLowerCase().replaceAll(" ", "_");
  if (["unavailable", "blocked", "source_unavailable", "failed"].includes(value)) return "unavailable";
  if (["verified", "current", "active", "healthy", "published_verified", "recently_verified"].includes(value)) return "healthy";
  return "needs_review";
}

export async function getAdminSourceRegistry(): Promise<AdminSourceRegistry> {
  const [catalogueInstitutions, courses, exams, scholarships, opportunities] = await Promise.all([
    getInstitutions({}), getCourses(), getExams(), getScholarships(), getOpportunities(),
  ]);
  const institutions = catalogueInstitutions.map(({ code, name }) => ({ code, name }));
  let attachedSources: (typeof institutionSources.$inferSelect)[] = [];
  try {
    attachedSources = await db.select().from(institutionSources);
  } catch (error) {
    console.warn("[careerbridge] source registry unavailable; showing catalogue source references", error);
  }

  let settings: (typeof sourceRefreshSettings.$inferSelect)[] = [];
  try {
    settings = await db.select().from(sourceRefreshSettings);
  } catch (error) {
    // Keep the catalogue usable while the optional refresh-settings migration is being deployed.
    console.warn("[careerbridge] source refresh settings are unavailable", error);
  }
  const settingsByKey = new Map(settings.map((setting) => [setting.sourceKey, setting]));
  const byCode = new Map(catalogueInstitutions.map((institution) => [institution.code, institution]));
  const grouped = new Map<string, Omit<SourceItem, "organisations" | "recordNames" | "institutionCodes"> & {
    organisations: string[]; recordNames: string[]; institutionCodes: string[]; rank: number;
  }>();

  function add(input: {
    title: string;
    sourceType: string;
    organisation: string;
    url: string | null | undefined;
    status: string | null | undefined;
    checkedAt: Date | null | undefined;
    checkType: "Fetched" | "Verified" | null;
    recordName: string;
    institutionCode?: string;
    rank?: number;
  }) {
    if (!input.url) return;
    let parsed: URL;
    try {
      parsed = new URL(input.url);
      if (!["https:", "http:"].includes(parsed.protocol)) return;
    } catch {
      return;
    }
    const sourceKey = normaliseSourceUrl(input.url);
    const existing = grouped.get(sourceKey);
    if (existing) {
      if (!existing.recordNames.includes(input.recordName)) existing.recordNames.push(input.recordName);
      if (input.organisation && !existing.organisations.includes(input.organisation)) existing.organisations.push(input.organisation);
      if (input.institutionCode && !existing.institutionCodes.includes(input.institutionCode)) existing.institutionCodes.push(input.institutionCode);
      if ((input.rank ?? 0) > existing.rank) {
        existing.title = input.title || existing.title;
        existing.sourceType = input.sourceType || existing.sourceType;
        existing.status = normaliseSourceStatus(input.status);
        existing.lastCheckedAt = input.checkedAt?.toISOString() ?? existing.lastCheckedAt;
        existing.lastCheckType = input.checkType ?? existing.lastCheckType;
        existing.rank = input.rank ?? 0;
      }
      return;
    }
    const saved = settingsByKey.get(sourceKey);
    grouped.set(sourceKey, {
      id: `source-${encodeURIComponent(sourceKey)}`,
      sourceKey,
      title: input.title || parsed.hostname,
      sourceType: input.sourceType || "official_site",
      organisations: input.organisation ? [input.organisation] : [],
      url: input.url,
      status: normaliseSourceStatus(input.status),
      lastCheckedAt: input.checkedAt?.toISOString() ?? null,
      lastCheckType: input.checkType,
      refreshEnabled: saved?.refreshEnabled ?? false,
      refreshFrequency: saved?.refreshEnabled ? `${saved.refreshFrequency} · preference only (scheduler offline)` : null,
      recordNames: [input.recordName],
      institutionCodes: input.institutionCode ? [input.institutionCode] : [],
      rank: input.rank ?? 0,
    });
  }

  for (const source of attachedSources) {
    const institution = byCode.get(source.institutionCode);
    add({
      title: source.title ?? `${institution?.name ?? source.institutionCode} source`,
      sourceType: source.sourceType,
      organisation: institution?.name ?? source.institutionCode,
      url: source.url,
      status: source.status,
      checkedAt: source.retrievedAt,
      checkType: "Fetched",
      recordName: institution?.name ?? `Institution ${source.institutionCode}`,
      institutionCode: source.institutionCode,
      rank: 2,
    });
  }
  for (const institution of catalogueInstitutions) {
    const urls = new Set([institution.sourceUrl, institution.officialWebsite].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({
      title: `${institution.name} official website`, sourceType: "official_site", organisation: institution.name,
      url, status: institution.verificationStatus, checkedAt: institution.lastVerifiedAt,
      checkType: institution.lastVerifiedAt ? "Verified" : null, recordName: institution.name,
      institutionCode: institution.code, rank: 1,
    });
  }
  for (const course of courses) add({ title: `${course.name} source`, sourceType: "official_site", organisation: "Course catalogue", url: course.sourceUrl, status: course.verificationStatus, checkedAt: course.lastVerifiedAt, checkType: "Verified", recordName: `Course: ${course.name}` });
  for (const exam of exams) {
    const urls = new Set([exam.sourceUrl, exam.officialWebsite].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ title: `${exam.name} source`, sourceType: "official_authority", organisation: exam.conductingBody ?? "Examination authority", url, status: exam.verificationStatus, checkedAt: exam.lastVerifiedAt, checkType: "Verified", recordName: `Exam: ${exam.name}` });
  }
  for (const scholarship of scholarships) {
    const urls = new Set([scholarship.sourceUrl, scholarship.officialUrl].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ title: `${scholarship.name} source`, sourceType: "govt_portal", organisation: scholarship.provider ?? "Scholarship provider", url, status: scholarship.verificationStatus, checkedAt: scholarship.lastVerifiedAt, checkType: "Verified", recordName: `Scholarship: ${scholarship.name}` });
  }
  for (const opportunity of opportunities) {
    const urls = new Set([opportunity.sourceUrl, opportunity.url].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ title: `${opportunity.title} source`, sourceType: "secondary", organisation: opportunity.provider ?? "Opportunity provider", url, status: opportunity.verificationStatus, checkedAt: opportunity.lastVerifiedAt, checkType: "Verified", recordName: `Opportunity: ${opportunity.title}` });
  }

  const sources = [...grouped.values()]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(({ rank: _rank, ...source }) => ({
      ...source,
      organisations: source.organisations.sort((a, b) => a.localeCompare(b)),
      recordNames: source.recordNames.sort((a, b) => a.localeCompare(b)),
      institutionCodes: source.institutionCodes.sort(),
    }));
  return { sources, institutions };
}
