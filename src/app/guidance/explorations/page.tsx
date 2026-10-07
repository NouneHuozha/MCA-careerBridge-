import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarCheck2,
  Check,
  Clock3,
  GitCompareArrows,
  GraduationCap,
  Landmark,
  Monitor,
  Route as RouteIcon,
  Sprout,
  UsersRound,
} from "lucide-react";
import { getCurrentUser } from "@/auth";
import { getCareers, getCourses, getField, getInstitutions, getPathways } from "@/services/catalog";
import { findSession, getExplorationHistory, getExplorationState, getSessionState } from "@/services/profile";
import { getExam, getInstitution, getCourse, getOpportunities, getScholarships } from "@/services/catalog";
import { listComparisons, listPlans, listSaved } from "@/services/student";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My explorations · CareerBridge" };

type HistoryRecord = Awaited<ReturnType<typeof getExplorationHistory>>[number];
type SavedRows = Awaited<ReturnType<typeof listSaved>>;
type ComparisonRows = Awaited<ReturnType<typeof listComparisons>>;
type PlanRows = Awaited<ReturnType<typeof listPlans>>;
type VerificationInfo = { status: string; checkedAt: Date | null } | null;
type Activity = { id: string; title: string; detail: string; occurredAt: Date };

function relativeDate(value: Date | string | null | undefined) {
  if (!value) return "Date not recorded";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not recorded";
  const days = Math.floor(Math.max(0, Date.now() - date.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 14) return `${days} days ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

const directionIcons: Record<string, LucideIcon> = {
  technology: Monitor,
  government: UsersRound,
  "social-sciences": UsersRound,
  healthcare: Building2,
};

function locationLabel(record: HistoryRecord | undefined) {
  const path = record?.lastLocation;
  if (!path) return null;
  const section = path.replace(`/guidance/direction/${encodeURIComponent(record.directionSlug)}`, "");
  if (!section) return "Direction overview";
  if (section.endsWith("/practical-checks")) return "Practical checks";
  if (section.endsWith("/exams-scholarships")) return "Exams and scholarships";
  if (section.endsWith("/application")) return "Application and requirements";
  if (/\/institutions\/[^/]+$/.test(section)) return "Institution details";
  if (section.includes("/institutions")) return "Institutions";
  if (/\/courses\/[^/]+$/.test(section)) return "Course details";
  if (section.endsWith("/courses")) return "Courses in this route";
  if (/\/routes\/[^/]+$/.test(section)) return "Route details";
  if (section.endsWith("/routes")) return "Routes";
  return "Direction overview";
}

function matchesDirection(item: SavedRows[number], slug: string, related: { careers: Set<string>; pathways: Set<string>; courses: Set<string>; institutions: Set<string> }) {
  if (item.itemType === "field") return item.itemRef === slug;
  if (item.itemType === "career") return related.careers.has(item.itemRef);
  if (item.itemType === "pathway") return related.pathways.has(item.itemRef);
  if (item.itemType === "course") return related.courses.has(item.itemRef);
  if (item.itemType === "institution") return related.institutions.has(item.itemRef);
  return false;
}

function comparisonMatches(comparison: ComparisonRows[number], slug: string, related: { careers: Set<string>; pathways: Set<string>; courses: Set<string>; institutions: Set<string> }) {
  const refs = comparison.itemRefs ?? [];
  if (comparison.kind === "field") return refs.includes(slug);
  if (comparison.kind === "career") return refs.some((ref) => related.careers.has(ref));
  if (comparison.kind === "pathway") return refs.some((ref) => related.pathways.has(ref));
  if (comparison.kind === "course") return refs.some((ref) => related.courses.has(ref));
  if (comparison.kind === "institution") return refs.some((ref) => related.institutions.has(ref));
  return false;
}

function planMatches(plan: PlanRows[number]["plan"], slug: string, related: { careers: Set<string>; pathways: Set<string>; courses: Set<string>; institutions: Set<string> }) {
  if (plan.focusType === "field") return plan.focusRef === slug;
  if (plan.focusType === "career") return related.careers.has(plan.focusRef);
  if (plan.focusType === "pathway") return related.pathways.has(plan.focusRef);
  if (plan.focusType === "course") return related.courses.has(plan.focusRef);
  if (plan.focusType === "institution") return related.institutions.has(plan.focusRef);
  return false;
}

async function verificationFor(item: SavedRows[number]): Promise<VerificationInfo> {
  try {
    if (item.itemType === "course") {
      const record = await getCourse(item.itemRef);
      return record ? { status: record.verificationStatus, checkedAt: record.lastVerifiedAt } : null;
    }
    if (item.itemType === "institution") {
      const record = await getInstitution(item.itemRef);
      return record ? { status: record.verificationStatus, checkedAt: record.lastVerifiedAt } : null;
    }
    if (item.itemType === "exam") {
      const record = await getExam(item.itemRef);
      return record ? { status: record.verificationStatus, checkedAt: record.lastVerifiedAt } : null;
    }
    if (item.itemType === "scholarship") {
      const records = await getScholarships();
      const record = records.find((candidate) => candidate.slug === item.itemRef);
      return record ? { status: record.verificationStatus, checkedAt: record.lastVerifiedAt } : null;
    }
    if (item.itemType === "opportunity") {
      const records = await getOpportunities();
      const record = records.find((candidate) => candidate.slug === item.itemRef);
      return record ? { status: record.verificationStatus, checkedAt: record.lastVerifiedAt } : null;
    }
  } catch {
    return null;
  }
  return null;
}

function verificationLabel(info: VerificationInfo) {
  if (!info) return null;
  if (info.status === "verified" || info.status === "recently_verified") {
    return info.checkedAt ? `Verified ${relativeDate(info.checkedAt)}` : "Needs verification";
  }
  if (info.status === "needs_verification" || info.status === "unverified") return "Needs verification";
  if (info.status === "unavailable") return "Information not provided";
  if (info.status === "sample") return "Sample data";
  return null;
}

async function DirectionCard({
  field,
  record,
  current,
  savedDirection,
  saved,
  comparisons,
  plans,
  savedHref,
}: {
  field: NonNullable<Awaited<ReturnType<typeof getField>>>;
  record?: HistoryRecord;
  current: boolean;
  savedDirection: boolean;
  saved: SavedRows;
  comparisons: ComparisonRows;
  plans: PlanRows;
  savedHref: string;
}) {
  const [careers, pathways, courses, institutions] = await Promise.all([
    getCareers(field.slug),
    getPathways({ fieldSlug: field.slug }),
    getCourses({ fieldSlug: field.slug }),
    getInstitutions({ fieldSlug: field.slug }),
  ]);
  const courseSlugs = new Set([...courses.map((course) => course.slug), ...pathways.flatMap((pathway) => pathway.courseSlugs ?? [])]);
  const related = {
    careers: new Set(careers.map((career) => career.slug)),
    pathways: new Set(pathways.map((pathway) => pathway.slug)),
    courses: courseSlugs,
    institutions: new Set(institutions.map((institution) => institution.code)),
  };
  const directionSaved = saved.filter((item) => matchesDirection(item, field.slug, related));
  const directionComparisons = comparisons.filter((comparison) => comparisonMatches(comparison, field.slug, related));
  const directionPlans = plans.filter(({ plan }) => planMatches(plan, field.slug, related));
  const nextCheck = directionPlans.flatMap(({ items }) => items).find((item) => item.status !== "done");
  const completedChecks = directionPlans.flatMap(({ items }) => items).filter((item) => item.status === "done").length;
  const Icon = directionIcons[field.slug] ?? BriefcaseBusiness;
  const lastLocation = locationLabel(record);
  const statusLabel = current ? "Active exploration" : savedDirection ? "Saved exploration" : "Saved direction";
  const statusTone = current ? "bg-[#e0f4e5] text-[#27713d]" : "bg-[#fff0cb] text-[#806315]";
  const trail = lastLocation ? `${field.name}  ›  ${lastLocation}` : `${field.name}  ›  Location not recorded yet`;
  const savedSummary = directionSaved.length ? directionSaved.map((item) => `${directionSaved.filter((entry) => entry.itemType === item.itemType).length} ${item.itemType}${directionSaved.filter((entry) => entry.itemType === item.itemType).length === 1 ? "" : "s"}`).filter((value, index, all) => all.indexOf(value) === index).join(" · ") : "None saved yet";
  const planSummary = nextCheck?.label ?? (completedChecks ? "Saved checks are marked checked" : "No next check saved yet");
  const directionHref = `/guidance/direction/${encodeURIComponent(field.slug)}`;
  const storedLocation = record?.lastLocation;
  const isSafeResumeLocation = Boolean(storedLocation && (storedLocation === directionHref || storedLocation.startsWith(`${directionHref}/`)) && !/[?#\\]/.test(storedLocation));
  const resumeHref = isSafeResumeLocation ? storedLocation! : directionHref;

  return <article className="overflow-hidden rounded-xl border border-[#e2e5df] bg-[#fffefa] shadow-[0_5px_22px_-20px_rgba(40,69,60,.45)]">
    <div className={`relative flex min-h-[104px] items-center gap-4 overflow-hidden px-5 py-4 ${current ? "bg-[#edf4ef]" : "bg-[#f7f5e9]"}`}>
      <span aria-hidden className="z-10 grid h-[62px] w-[62px] shrink-0 place-items-center rounded-full bg-white/70 text-[#145c57]"><Icon className="h-8 w-8" strokeWidth={1.6} /></span>
      <div className="relative z-10 min-w-0"><h2 className="font-serif text-[1.35rem] leading-tight text-[#173344]">{field.name}</h2><span className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${statusTone}`}><span aria-hidden className={`h-2 w-2 rounded-full ${current ? "bg-[#218a48]" : "bg-[#c28b16]"}`} />{statusLabel}</span></div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-[38%] overflow-hidden opacity-75"><span className="absolute -bottom-10 right-6 h-24 w-40 rotate-[-16deg] rounded-[60%] bg-[#d7e4d8]" /><span className="absolute -bottom-12 right-20 h-24 w-32 rotate-[16deg] rounded-[60%] bg-[#c4d7ce]" /><span className="absolute bottom-2 right-5 text-[#83a99b]">{field.slug === "government" ? <Landmark className="h-12 w-12" /> : <Sprout className="h-11 w-11" />}</span></div>
    </div>
    <div className="px-5 pb-4 pt-3 sm:px-6">
      <dl className="divide-y divide-[#e9ebe5]">
        <div className="grid grid-cols-[24px_104px_minmax(0,1fr)] items-start gap-2 py-2.5 text-sm"><dt className="contents"><Clock3 aria-hidden className="mt-0.5 h-4 w-4 text-[#176b62]" /><span className="text-[#68746d]">Last visited</span></dt><dd className="m-0 text-[#3f4b45]">{lastLocation ?? "Not recorded yet"}</dd></div>
        <div className="grid grid-cols-[24px_104px_minmax(0,1fr)] items-start gap-2 py-2.5 text-sm"><dt className="contents"><RouteIcon aria-hidden className="mt-0.5 h-4 w-4 text-[#176b62]" /><span className="text-[#68746d]">Exploration trail</span></dt><dd className="m-0 text-[#3f4b45]">{trail}</dd></div>
        <div className="grid grid-cols-[24px_104px_minmax(0,1fr)] items-start gap-2 py-2.5 text-sm"><dt className="contents"><Bookmark aria-hidden className="mt-0.5 h-4 w-4 text-[#176b62]" /><span className="text-[#68746d]">Saved items</span></dt><dd className="m-0 text-[#3f4b45]">{savedSummary}</dd></div>
        <div className="grid grid-cols-[24px_104px_minmax(0,1fr)] items-start gap-2 py-2.5 text-sm"><dt className="contents"><GitCompareArrows aria-hidden className="mt-0.5 h-4 w-4 text-[#176b62]" /><span className="text-[#68746d]">Comparison</span></dt><dd className="m-0 text-[#3f4b45]">{directionComparisons.length ? `${directionComparisons.length} saved comparison${directionComparisons.length === 1 ? "" : "s"}` : "No comparison saved yet"}</dd></div>
        <div className="grid grid-cols-[24px_104px_minmax(0,1fr)] items-start gap-2 py-2.5 text-sm"><dt className="contents"><CalendarCheck2 aria-hidden className="mt-0.5 h-4 w-4 text-[#176b62]" /><span className="text-[#68746d]">Next check</span></dt><dd className="m-0 text-[#3f4b45]">{planSummary}</dd></div>
      </dl>
      <div className="mt-3 flex flex-wrap gap-3 border-t border-[#e5e8e1] pt-3"><Link href={resumeHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white transition hover:bg-[#064a49]">Resume {field.name}<ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href={savedHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#9baea3] bg-white px-4 text-sm font-semibold text-[#264d47] transition hover:bg-[#f2f8f4]"><Bookmark aria-hidden className="h-4 w-4" />View saved items</Link></div>
    </div>
  </article>;
}

export default async function MyExplorationsPage() {
  const [sessionState, user, active, history] = await Promise.all([
    getSessionState(),
    getCurrentUser(),
    getExplorationState(),
    getExplorationHistory(),
  ]);
  if (!sessionState) redirect("/start");
  if (sessionState.status !== "completed") redirect("/counselling");

  const [session, saved, comparisons, plans] = await Promise.all([
    findSession().catch(() => null),
    user ? listSaved(user.id).catch((): SavedRows => []) : Promise.resolve([] as SavedRows),
    user ? listComparisons(user.id).catch((): ComparisonRows => []) : Promise.resolve([] as ComparisonRows),
    user ? listPlans(user.id).catch((): PlanRows => []) : Promise.resolve([] as PlanRows),
  ]);

  const recordMap = new Map<string, HistoryRecord>();
  for (const record of history) recordMap.set(record.directionSlug, record);
  if (active) {
    const old = recordMap.get(active.directionSlug);
    recordMap.set(active.directionSlug, {
      directionSlug: active.directionSlug,
      selectedAt: active.selectedAt,
      lastLocation: old?.lastLocation ?? null,
      lastMeaningfulAt: old?.lastMeaningfulAt ?? null,
      completedSteps: active.completedSteps,
    });
  }

  const savedFields = saved.filter((item) => item.itemType === "field");
  const savedOnly = new Map<string, Date>();
  for (const item of savedFields) {
    if (!recordMap.has(item.itemRef)) savedOnly.set(item.itemRef, item.createdAt);
  }
  const candidateSlugs = [...new Set([...recordMap.keys(), ...savedOnly.keys()])];
  const loadedFields = await Promise.all(candidateSlugs.map((slug) => getField(slug)));
  const fieldBySlug = new Map(loadedFields.filter((field): field is NonNullable<typeof field> => Boolean(field)).map((field) => [field.slug, field]));
  const directionEntries = candidateSlugs
    .map((slug) => ({
      field: fieldBySlug.get(slug),
      record: recordMap.get(slug),
      savedAt: savedOnly.get(slug),
    }))
    .filter((entry): entry is { field: NonNullable<typeof entry.field>; record: HistoryRecord | undefined; savedAt: Date | undefined } => Boolean(entry.field))
    .sort((a, b) => {
      const aActive = a.field.slug === active?.directionSlug;
      const bActive = b.field.slug === active?.directionSlug;
      if (aActive !== bActive) return aActive ? -1 : 1;
      const aTime = new Date(a.record?.lastMeaningfulAt ?? a.record?.selectedAt ?? a.savedAt ?? 0).getTime();
      const bTime = new Date(b.record?.lastMeaningfulAt ?? b.record?.selectedAt ?? b.savedAt ?? 0).getTime();
      return bTime - aTime;
    })
    .slice(0, 4);

  const recentSaved = saved.slice(0, 3);
  const verification = await Promise.all(recentSaved.map((item) => verificationFor(item)));
  const activities: Activity[] = [];
  if (session?.status === "completed" && session.completedAt) {
    activities.push({ id: `profile-${session.id}`, title: "Profile confirmed", detail: "Your counselling profile is ready to use.", occurredAt: session.completedAt });
  }
  for (const entry of directionEntries) {
    if (entry.record) activities.push({ id: `direction-${entry.field.slug}`, title: `${entry.field.name} opened`, detail: "You started exploring this direction.", occurredAt: new Date(entry.record.selectedAt) });
  }
  for (const item of saved.slice(0, 8)) {
    activities.push({ id: `saved-${item.id}`, title: `${item.label ?? item.itemRef} saved`, detail: "You saved this item to revisit.", occurredAt: item.createdAt });
  }
  for (const comparison of comparisons.slice(0, 8)) {
    activities.push({ id: `compare-${comparison.id}`, title: "Comparison saved", detail: `${comparison.itemRefs?.length ?? 0} ${comparison.kind} options`, occurredAt: comparison.createdAt });
  }
  for (const { plan, items } of plans.slice(0, 5)) {
    activities.push({ id: `plan-${plan.id}`, title: "Practical checklist started", detail: plan.title, occurredAt: plan.createdAt });
    if (items.some((item) => item.status === "done")) {
      activities.push({ id: `checked-${plan.id}`, title: "A practical check marked checked", detail: items.find((item) => item.status === "done")?.label ?? plan.title, occurredAt: plan.updatedAt });
    }
  }
  activities.sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  const savedHref = user ? "/guidance/saved" : "/sign-in?next=%2Fguidance%2Fsaved";

  return <main className="min-h-[calc(100dvh-62px)] bg-[#fcfcfa] px-5 pb-8 pt-5 text-[#26312c] sm:px-8 lg:px-12"><section className="mx-auto max-w-[1380px]">
    <header className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-[780px]"><h1 className="font-serif text-[clamp(2.25rem,4vw,3.55rem)] leading-[1.04] tracking-[-.045em] text-[#102c43]">My explorations</h1><p className="mt-2 font-serif text-[1.18rem] leading-[1.4] text-[#4d5d55]">Pick up where you left off, revisit a direction, or return to something you saved.</p><p className="mt-2 text-sm leading-relaxed text-[#6f7771]">Your counselling profile is shared across explorations. Each direction keeps its own saved work.</p></div><div className="flex flex-wrap items-center gap-3"><span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#e8f2ec] px-4 text-sm text-[#355e53]"><span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-white text-[#176b62]"><UsersRound className="h-4 w-4" /></span>Profile confirmed</span><Link href="/guidance/possibilities" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#075a58] px-5 text-sm font-semibold text-white transition hover:bg-[#064a49]"><ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration</Link></div></header>

    {directionEntries.length ? <section aria-label="Your directions" className="mt-6 grid gap-4 lg:grid-cols-2">{directionEntries.map(({ field, record, savedAt }) => <DirectionCard key={field.slug} field={field} record={record} current={field.slug === active?.directionSlug} savedDirection={Boolean(savedAt) && !record} saved={saved} comparisons={comparisons} plans={plans} savedHref={savedHref} />)}</section> : <section className="mt-6 rounded-xl border border-dashed border-[#b8cfc4] bg-[#f4f8f4] px-6 py-9 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#176b62]"><RouteIcon aria-hidden className="h-6 w-6" /></div><h2 className="mt-3 font-serif text-xl text-[#243e39]">No direction history recorded yet</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#66736b]">Choose a possibility to begin. Your meaningful locations will appear here as you explore.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></section>}

    <div className="mt-4 grid gap-4 xl:grid-cols-2"><section aria-labelledby="recent-saved-heading" className="rounded-xl border border-[#e2e5df] bg-[#fffefa] px-5 py-4 sm:px-6"><h2 id="recent-saved-heading" className="font-serif text-[1.4rem] text-[#173344]">Recently saved</h2>{recentSaved.length ? <ul className="mt-2 divide-y divide-[#e9ebe5]">{recentSaved.map((item, index) => { const status = verificationLabel(verification[index]); const Icon = item.itemType === "institution" ? Landmark : item.itemType === "course" ? GraduationCap : item.itemType === "pathway" ? RouteIcon : Bookmark; return <li key={item.id} className="flex min-h-[62px] items-center gap-3 py-2.5"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#e4f2ec] text-[#176b62]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="truncate font-serif text-[1rem] text-[#263b37]">{item.label ?? item.itemRef}</p><p className="text-xs text-[#777f79]">{item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} · {relativeDate(item.createdAt)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${status === "Needs verification" ? "bg-[#fff0cb] text-[#806315]" : status === "Sample data" ? "bg-[#e7edf0] text-[#596c75]" : "bg-[#dff1e4] text-[#317747]"}`}>{status ?? "Saved"}</span></li>; })}</ul> : <p className="mt-3 rounded-lg bg-[#f7f8f4] px-4 py-5 text-sm text-[#727b74]">Nothing saved yet. When you save a course, institution, or direction, it will appear here.</p>}<Link href={savedHref} className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">View all saved items<ArrowRight aria-hidden className="h-4 w-4" /></Link></section>

      <section aria-labelledby="exploration-history-heading" className="rounded-xl border border-[#e2e5df] bg-[#fffefa] px-5 py-4 sm:px-6"><h2 id="exploration-history-heading" className="font-serif text-[1.4rem] text-[#173344]">Your exploration history</h2>{activities.length ? <ol className="mt-2 space-y-0.5">{activities.slice(0, 4).map((activity, index) => <li key={activity.id} className="relative flex gap-3 py-2"><span aria-hidden className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e6f2ed] text-[#176b62]">{index === 0 ? <Check className="h-4 w-4" /> : index === 1 ? <Monitor className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}{index < Math.min(activities.length, 4) - 1 ? <span className="absolute left-1/2 top-9 h-5 w-px -translate-x-1/2 bg-[#d6e2da]" /> : null}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-x-3"><h3 className="font-serif text-[1rem] leading-tight text-[#263b37]">{activity.title}</h3><time className="text-[11px] text-[#7b837d]" dateTime={activity.occurredAt.toISOString()} title={activity.occurredAt.toLocaleString("en-IN")}>{relativeDate(activity.occurredAt)}</time></div><p className="mt-1 text-xs leading-snug text-[#778078]">{activity.detail}</p></div></li>)}</ol> : <p className="mt-3 rounded-lg bg-[#f7f8f4] px-4 py-5 text-sm text-[#727b74]">Meaningful activity will appear here when it is recorded. Page views are not listed as a click log.</p>}<Link href="/guidance/possibilities" className="mt-3 inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Explore another possibility<ArrowRight aria-hidden className="h-4 w-4" /></Link></section></div>

    <div className="relative mt-4 flex min-h-[58px] items-center gap-3 overflow-hidden rounded-lg bg-[#e3efeb] px-5 py-3"><span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d1e6dc] text-[#176b62]"><Sprout className="h-5 w-5" /></span><p className="relative z-10 font-serif text-[1rem] text-[#344b43]">You can change direction without losing your saved work.</p><span aria-hidden className="absolute -bottom-8 right-10 h-16 w-64 rounded-[55%] bg-[#c8ddd2]" /><span className="absolute right-5 hidden text-[11px] text-[#607b70] sm:block">Your exploration can change as you learn.</span></div>
    <p className="mt-2 text-center text-xs text-[#808780]">Only saved work and recorded checks appear here; earlier activity that was not recorded is not reconstructed.</p>
  </section></main>;
}
