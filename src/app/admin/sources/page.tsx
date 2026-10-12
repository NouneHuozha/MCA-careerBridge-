import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminPortalShell } from "@/components/admin/admin-portal-shell";
import { SourcesWorkspace, type SourceItem } from "@/components/admin/sources-workspace";
import { db } from "@/db";
import { institutionSources } from "@/db/schema";
import { getCourses, getExams, getInstitutions, getOpportunities, getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sources · Admin workspace" };

function normaliseUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return value.trim();
  }
}

function sourceStatus(status: string | null | undefined): SourceItem["status"] {
  const value = (status ?? "").toLowerCase().replaceAll(" ", "_");
  if (["unavailable", "blocked", "source_unavailable", "failed"].includes(value)) return "unavailable";
  if (["verified", "current", "active", "healthy", "published_verified", "recently_verified"].includes(value)) return "healthy";
  return "needs_review";
}

export default async function AdminSourcesPage() {
  const user = await getCurrentUser();
  if (!user) redirect(`/sign-in?next=${encodeURIComponent("/admin/sources")}`);
  if (user.role !== "admin") redirect("/");

  const [institutions, courses, exams, scholarships, opportunities] = await Promise.all([
    getInstitutions({}), getCourses(), getExams(), getScholarships(), getOpportunities(),
  ]);
  let attachedSources: (typeof institutionSources.$inferSelect)[] = [];
  try {
    attachedSources = await db.select().from(institutionSources);
  } catch (error) {
    console.warn("[careerbridge] source registry unavailable; showing catalogue source references", error);
  }

  const byCode = new Map(institutions.map((institution) => [institution.code, institution]));
  const grouped = new Map<string, Omit<SourceItem, "id"> & { id: string; rank: number }>();
  function add(input: {
    id: string;
    title: string;
    sourceType: string;
    organisation: string;
    url: string | null | undefined;
    status: string | null | undefined;
    fetchedAt: Date | null | undefined;
    checkType: "Fetched" | "Verified" | null;
    recordName: string;
    institutionCode?: string;
    rank?: number;
  }) {
    if (!input.url) return;
    let parsed: URL;
    try {
      parsed = new URL(input.url);
      if (!(["https:", "http:"].includes(parsed.protocol))) return;
    } catch { return; }
    const key = normaliseUrl(input.url);
    const found = grouped.get(key);
    if (found) {
      if (!found.recordNames.includes(input.recordName)) found.recordNames.push(input.recordName);
      if (input.organisation && !found.organisations.includes(input.organisation)) found.organisations.push(input.organisation);
      if (input.institutionCode && !found.institutionCodes.includes(input.institutionCode)) found.institutionCodes.push(input.institutionCode);
      if (input.rank && input.rank > found.rank) {
        found.title = input.title || found.title;
        found.sourceType = input.sourceType || found.sourceType;
        found.status = sourceStatus(input.status);
        found.lastCheckedAt = input.fetchedAt?.toISOString() ?? found.lastCheckedAt;
        found.lastCheckType = input.checkType ?? found.lastCheckType;
        found.rank = input.rank;
      }
      return;
    }
    grouped.set(key, {
      id: input.id,
      title: input.title || new URL(input.url).hostname,
      sourceType: input.sourceType || "official_site",
      organisations: input.organisation ? [input.organisation] : [],
      url: input.url,
      status: sourceStatus(input.status),
      lastCheckedAt: input.fetchedAt?.toISOString() ?? null,
      lastCheckType: input.checkType,
      refreshFrequency: null,
      recordNames: [input.recordName],
      institutionCodes: input.institutionCode ? [input.institutionCode] : [],
      rank: input.rank ?? 0,
    });
  }

  for (const source of attachedSources) {
    const institution = byCode.get(source.institutionCode);
    add({
      id: `source-${source.id}`,
      title: source.title ?? `${institution?.name ?? source.institutionCode} source`,
      sourceType: source.sourceType,
      organisation: institution?.name ?? source.institutionCode,
      url: source.url,
      status: source.status,
      fetchedAt: source.retrievedAt,
      checkType: "Fetched",
      recordName: institution?.name ?? `Institution ${source.institutionCode}`,
      institutionCode: source.institutionCode,
      rank: 2,
    });
  }
  for (const institution of institutions) {
    const urls = new Set([institution.sourceUrl, institution.officialWebsite].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({
      id: `institution-${institution.code}`,
      title: `${institution.name} official website`,
      sourceType: "official_site",
      organisation: institution.name,
      url,
      status: institution.verificationStatus,
      fetchedAt: institution.lastVerifiedAt,
      checkType: institution.lastVerifiedAt ? "Verified" : null,
      recordName: institution.name,
      institutionCode: institution.code,
      rank: 1,
    });
  }
  for (const course of courses) add({ id: `course-${course.slug}`, title: `${course.name} source`, sourceType: "official_site", organisation: "Course catalogue", url: course.sourceUrl, status: course.verificationStatus, fetchedAt: course.lastVerifiedAt, checkType: "Verified", recordName: `Course: ${course.name}` });
  for (const exam of exams) {
    const urls = new Set([exam.sourceUrl, exam.officialWebsite].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ id: `exam-${exam.slug}`, title: `${exam.name} source`, sourceType: "official_authority", organisation: exam.conductingBody ?? "Examination authority", url, status: exam.verificationStatus, fetchedAt: exam.lastVerifiedAt, checkType: "Verified", recordName: `Exam: ${exam.name}` });
  }
  for (const scholarship of scholarships) {
    const urls = new Set([scholarship.sourceUrl, scholarship.officialUrl].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ id: `scholarship-${scholarship.slug}`, title: `${scholarship.name} source`, sourceType: "govt_portal", organisation: scholarship.provider ?? "Scholarship provider", url, status: scholarship.verificationStatus, fetchedAt: scholarship.lastVerifiedAt, checkType: "Verified", recordName: `Scholarship: ${scholarship.name}` });
  }
  for (const opportunity of opportunities) {
    const urls = new Set([opportunity.sourceUrl, opportunity.url].filter((url): url is string => Boolean(url)));
    for (const url of urls) add({ id: `opportunity-${opportunity.slug}`, title: `${opportunity.title} source`, sourceType: "secondary", organisation: opportunity.provider ?? "Opportunity provider", url, status: opportunity.verificationStatus, fetchedAt: opportunity.lastVerifiedAt, checkType: "Verified", recordName: `Opportunity: ${opportunity.title}` });
  }

  const sources: SourceItem[] = [...grouped.values()]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(({ rank: _rank, organisations, ...item }) => ({ ...item, organisations, recordNames: item.recordNames.sort((a, b) => a.localeCompare(b)), institutionCodes: item.institutionCodes.sort() }));
  return <AdminPortalShell active="sources" breadcrumb="Sources"><SourcesWorkspace sources={sources} institutions={institutions.map(({ code, name }) => ({ code, name }))} now={new Date().toISOString()} /></AdminPortalShell>;
}
