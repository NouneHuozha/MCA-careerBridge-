import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Bookmark, GitCompareArrows, Sprout } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { SaveButton } from "@/components/save-button";
import { getExplorationState, getSessionState } from "@/services/profile";
import { guidanceHrefForItem } from "@/services/guidance-navigation";
import { listSaved, type SaveableType } from "@/services/student";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved items · My Guidance" };

const tabs: { value: SaveableType | "all"; label: string }[] = [
  { value: "all", label: "All saved" },
  { value: "field", label: "Directions" },
  { value: "pathway", label: "Routes" },
  { value: "course", label: "Courses" },
  { value: "institution", label: "Institutions" },
  { value: "career", label: "Careers" },
  { value: "exam", label: "Exams" },
  { value: "scholarship", label: "Scholarships" },
  { value: "opportunity", label: "Opportunities" },
];
const labels: Record<SaveableType, string> = {
  field: "Direction",
  pathway: "Route",
  course: "Course",
  institution: "Institution",
  career: "Career",
  exam: "Exam",
  scholarship: "Scholarship",
  opportunity: "Opportunity",
};
const comparableTypes = new Set(["field", "pathway", "course", "institution", "career"]);

export default async function GuidanceSavedPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const [state, user, active] = await Promise.all([getSessionState(), getCurrentUser(), getExplorationState()]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");
  if (!user) redirect("/sign-in?next=%2Fguidance%2Fsaved");

  const saved = await listSaved(user.id).catch(() => []);
  const validType = tabs.some((tab) => tab.value === params.type);
  const selectedType = validType && params.type !== "all" ? params.type as SaveableType : undefined;
  const visible = saved.filter((item) => !selectedType || item.itemType === selectedType);
  const entries = await Promise.all(visible.map(async (item) => ({
    item,
    href: await guidanceHrefForItem(item.itemType, item.itemRef, active?.directionSlug),
  })));
  const comparable = selectedType && comparableTypes.has(selectedType)
    ? visible.filter((item) => item.itemType === selectedType).slice(0, 6)
    : [];
  const compareHref = comparable.length >= 2
    ? `/guidance/compare?type=${encodeURIComponent(selectedType!)}&items=${encodeURIComponent(comparable.map((item) => item.itemRef).join(","))}&returnTo=${encodeURIComponent("/guidance/saved")}`
    : null;
  const planFocusType = selectedType && ["field", "pathway", "course", "institution", "career"].includes(selectedType)
    ? selectedType
    : "field";
  const planFocusRef = selectedType && planFocusType === selectedType && visible[0]
    ? visible[0].itemRef
    : active?.directionSlug ?? "";
  const planHref = planFocusRef ? `/guidance/action-plan?focus=${encodeURIComponent(`${planFocusType}:${planFocusRef}`)}` : "/guidance/action-plan";

  return <main className="min-h-[calc(100dvh-76px)] bg-[#fcfcfa] px-5 pb-10 pt-6 text-[#26312c] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[1180px]">
      <Link href="/guidance/explorations" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#a6c5b8] underline-offset-4"><ArrowLeft aria-hidden className="h-4 w-4" />Back to My Explorations</Link>
      <header className="mt-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.14em] text-[#68786d]">My Guidance · Saved work</p><h1 className="mt-2 font-serif text-[clamp(2.1rem,4vw,3.3rem)] leading-tight tracking-[-.035em] text-[#173344]">Saved items for your exploration</h1><p className="mt-2 max-w-3xl text-base leading-relaxed text-[#68756d]">Return to saved possibilities without losing your place in the post-counselling flow.</p></div><Link href={planHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white"><Sprout aria-hidden className="h-4 w-4" />Next steps</Link></header>

      <nav aria-label="Filter saved items" className="mt-5 flex gap-2 overflow-x-auto pb-1">{tabs.map((tab) => <Link key={tab.value} href={tab.value === "all" ? "/guidance/saved" : `/guidance/saved?type=${encodeURIComponent(tab.value)}`} aria-current={(tab.value === "all" && !selectedType) || tab.value === selectedType ? "page" : undefined} className={`inline-flex min-h-9 shrink-0 items-center rounded-full px-4 text-sm font-medium ${((tab.value === "all" && !selectedType) || tab.value === selectedType) ? "bg-[#dcefe3] text-[#205b4d]" : "border border-[#dfe5df] bg-white text-[#58675e] hover:bg-[#f2f7f3]"}`}>{tab.label}</Link>)}</nav>

      {compareHref ? <section className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dce8df] bg-[#edf6f0] px-4 py-3"><p className="m-0 text-sm text-[#49645a]">Compare two or more saved {labels[selectedType!].toLowerCase()} options.</p><Link href={compareHref} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white"><GitCompareArrows aria-hidden className="h-4 w-4" />Compare saved items<ArrowRight aria-hidden className="h-4 w-4" /></Link></section> : null}

      {entries.length ? <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{entries.map(({ item, href }) => {
        const focusType = ["field", "pathway", "course", "institution", "career"].includes(item.itemType) ? item.itemType : "field";
        const typeLabel = labels[item.itemType as SaveableType] ?? "Item";
        const focusRef = focusType === item.itemType ? item.itemRef : active?.directionSlug;
        const itemPlanHref = focusRef ? `/guidance/action-plan?focus=${encodeURIComponent(`${focusType}:${focusRef}`)}` : "/guidance/action-plan";
        return <article key={item.id} className="flex min-w-0 flex-col rounded-xl border border-[#e1e7df] bg-white p-5"><div className="flex items-start gap-3"><span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#e8f2ec] text-[#286b61]"><Bookmark className="h-5 w-5" /></span><div className="min-w-0 flex-1"><span className="inline-flex rounded-full bg-[#f1f6f1] px-2.5 py-1 text-xs font-medium text-[#527064]">{typeLabel}</span><h2 className="mt-2 break-words font-serif text-lg leading-tight text-[#173344]">{item.label ?? item.itemRef}</h2><p className="mt-1 text-xs text-[#7a827c]">Saved {item.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></div></div><div className="mt-4 flex flex-wrap items-center gap-3"><Link href={href} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Open in My Guidance<ArrowRight aria-hidden className="h-4 w-4" /></Link><Link href={itemPlanHref} className="inline-flex min-h-10 items-center rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61]">Add to next steps</Link></div><div className="mt-3"><SaveButton itemType={item.itemType as SaveableType} itemRef={item.itemRef} label={item.label ?? item.itemRef} initiallySaved className="[&>button]:min-h-9 [&>button]:px-3 [&>button]:text-xs" saveText="Save again" savedText="Saved" /></div></article>;
      })}</div> : <section className="mt-4 rounded-xl border border-dashed border-[#b8cfc4] bg-[#f4f8f4] px-6 py-10 text-center"><span aria-hidden className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#286b61]"><Bookmark className="h-6 w-6" /></span><h2 className="mt-3 font-serif text-xl text-[#243e39]">No saved items in this view</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#66736b]">Save a direction, route, course, institution, or other item as you explore. It will appear here when you return.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></section>}
    </section>
  </main>;
}
