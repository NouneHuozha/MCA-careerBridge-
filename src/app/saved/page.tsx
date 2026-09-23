import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, Building2, Compass, FileText, GraduationCap, Award, Route, BriefcaseBusiness, PencilRuler } from "lucide-react";
import { ButtonLink, EmptyState, Eyebrow, accentSurface, type Accent } from "@/components/ui";
import { LinkRow } from "@/components/detail-parts";
import { SaveButton } from "@/components/save-button";
import { getCurrentUser } from "@/auth";
import { hrefForItem, listSaved, type SaveableType } from "@/services/student";

export const dynamic = "force-dynamic";
export const metadata = { title: "Saved" };
const groups: { type: SaveableType; label: string; icon: typeof Compass; accent: Accent }[] = [
  { type: "field", label: "Fields", icon: Compass, accent: "mint" }, { type: "career", label: "Careers", icon: BriefcaseBusiness, accent: "butter" }, { type: "course", label: "Courses", icon: GraduationCap, accent: "lavender" }, { type: "pathway", label: "Pathways", icon: Route, accent: "sky" }, { type: "institution", label: "Institutions", icon: Building2, accent: "peach" }, { type: "scholarship", label: "Scholarships", icon: Award, accent: "mint" }, { type: "exam", label: "Exams", icon: FileText, accent: "sky" }, { type: "opportunity", label: "Skills", icon: PencilRuler, accent: "butter" },
];
export default async function SavedPage() {
  const user = await getCurrentUser(); if (!user) redirect("/sign-in?next=/saved");
  const saved = await listSaved(user.id).catch(() => []);
  const populated = groups.map((g) => ({ ...g, items: saved.filter((i) => i.itemType === g.type) })).filter((g) => g.items.length);
  return <div className="cb-container cb-page"><header className="flex items-center justify-between gap-5 rounded-2xl border border-lavender-ink/20 bg-lavender/30 p-6 sm:p-8"><div><Eyebrow>Your shortlist</Eyebrow><h1 className="cb-page-title mt-3">Keep what makes you curious.</h1><p className="mt-3 text-sm text-ink-500">{saved.length} saved {saved.length === 1 ? "item" : "items"} · Open, compare, or remove anything.</p></div><Bookmark aria-hidden className="hidden h-14 w-14 shrink-0 text-lavender-ink sm:block" strokeWidth={1.4} /></header>
    {!saved.length ? <div className="mt-8"><EmptyState icon={<Bookmark className="h-5 w-5" />} title="Your shortlist starts here." description="Use Save for later on any field, career, course or institution." action={<ButtonLink href="/explore">Start exploring<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>} /></div> : <div className="mt-8 space-y-8">{populated.map((g) => <section key={g.type} aria-label={g.label}><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-3 text-lg font-semibold"><span className={`grid h-9 w-9 place-items-center rounded-xl ${accentSurface[g.accent]}`}><g.icon aria-hidden className="h-4 w-4" /></span>{g.label}<span className="text-sm text-ink-500">{g.items.length}</span></h2>{["course", "career", "institution", "pathway"].includes(g.type) && g.items.length >= 2 && <ButtonLink href={`/compare?type=${g.type}&a=${g.items[0].itemRef}&b=${g.items[1].itemRef}`} size="sm">Compare saved {g.label.toLowerCase()}<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>}</div><div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">{g.items.map((item) => <article key={item.id} className="rounded-xl border border-ink-200 bg-white p-4"><LinkRow href={hrefForItem(item.itemType, item.itemRef)} title={item.label ?? item.itemRef} action="Open" /><div className="mt-3"><SaveButton itemType={g.type} itemRef={item.itemRef} label={item.label ?? item.itemRef} initiallySaved /></div></article>)}</div></section>)}</div>}
  </div>;
}
