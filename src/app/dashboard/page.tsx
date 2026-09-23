import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowRight, Bookmark, Check, ClipboardList, Compass, FileText, MessageCircle, Route, Scale, User, Wallet } from "lucide-react";
import { Badge, ButtonLink, Disclosure, Eyebrow, ProgressDots } from "@/components/ui";
import { LinkRow } from "@/components/detail-parts";
import { FieldIcon, fieldVisual } from "@/components/field-visuals";
import { getCurrentUser } from "@/auth";
import { getSessionState, progressFor } from "@/services/profile";
import { hrefForItem, listPlans, listSaved } from "@/services/student";
import { suggestFields, suggestPathways } from "@/recommendation/engine";
import { getScholarships } from "@/services/catalog";

export const dynamic = "force-dynamic";
export const metadata = { title: "My plan" };

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=/dashboard");
  const [state, saved, plans, scholarships] = await Promise.all([getSessionState(), listSaved(user.id).catch(() => []), listPlans(user.id).catch(() => []), getScholarships({})]);
  const fields = state ? await suggestFields(state.snapshot, 3) : [];
  const paths = state ? await suggestPathways(state.snapshot, 2) : [];
  const progress = state ? progressFor(state.stage, state.snapshot.answeredKeys) : { answered: 0, total: 8 };
  const savedCourses = saved.filter((item) => item.itemType === "course");
  const activePlan = plans.flatMap(({ plan, items }) => [{ plan, items, done: items.filter((item) => item.status === "done").length }]).find((item) => item.done < item.items.length);
  const next = !state ? { eyebrow: "Start with yourself", title: "Find a direction that feels worth exploring.", text: "Answer a few friendly questions and we’ll help you notice some possibilities.", href: "/start", cta: "Start here" } : progress.answered < progress.total ? { eyebrow: "Continue where you left off", title: "A few answers will make your plan more useful.", text: `${progress.total - progress.answered} short question${progress.total - progress.answered === 1 ? "" : "s"} left. You can skip anything and change answers later.`, href: "/counselling", cta: "Continue" } : activePlan ? { eyebrow: "Your next small step", title: activePlan.items.find((item) => item.status !== "done")?.label ?? "Continue your plan", text: "You do not need to complete everything today. Pick one task and take it at your pace.", href: "/action-plan", cta: "Open my checklist" } : { eyebrow: "Your next small step", title: saved.length ? "Keep exploring what made you curious." : "Choose something to explore.", text: saved.length ? "Open a saved item, compare two options, or turn a direction into a checklist." : "Your profile is ready. Start with a possibility that interests you.", href: saved.length ? hrefForItem(saved[0].itemType, saved[0].itemRef) : "/profile", cta: saved.length ? "Open my shortlist" : "See my possibilities" };
  const compareHref = savedCourses.length >= 2 ? `/compare?type=course&a=${savedCourses[0].itemRef}&b=${savedCourses[1].itemRef}` : "/compare";

  return <div className="cb-container cb-page">
    {/* Header: one line, one clear action */}
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><Eyebrow>My plan</Eyebrow><h1 className="cb-page-title mt-2">Welcome back{user.name ? `, ${user.name.split(" ")[0]}` : ""}.</h1></div>
      <ButtonLink href="/mentor" variant="secondary"><MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor</ButtonLink>
    </header>

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,.85fr)]">
      <main className="space-y-6">
        {/* 1. Next step — the single thing to look at first */}
        <section className="grid overflow-hidden rounded-[1.5rem] border border-forest-300 bg-mint/65 md:grid-cols-[minmax(0,1fr)_minmax(0,.5fr)]">
          <div className="p-6 sm:p-8">
            <span className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700"><Compass aria-hidden className="h-4 w-4" />{next.eyebrow}</span>
            <h2 className="max-w-xl text-2xl font-semibold leading-tight sm:text-3xl">{next.title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-600">{next.text}</p>
            <div className="mt-5 flex flex-wrap items-center gap-4">
              <ProgressDots total={progress.total} current={progress.answered} label="Profile questions completed" />
              {state && <Badge tone="green">{state.stage === "class10" ? "Class 10" : "Class 12"}</Badge>}
            </div>
            <ButtonLink href={next.href} className="mt-6">{next.cta}<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>
          </div>
          <div className="relative hidden min-h-56 md:block"><Image src="/images/nagaland-hills.jpg" alt="A quiet view of green hills" fill sizes="(max-width: 1024px) 30vw, 22vw" className="object-cover" /></div>
        </section>

        {/* 2. Your active checklist — only when it exists, otherwise this whole block is simply absent */}
        {activePlan && <section className="rounded-2xl border border-forest-200 bg-forest-50/60 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><Eyebrow>Your active checklist</Eyebrow><h2 className="mt-2 text-xl font-semibold">{activePlan.plan.title}</h2></div><Badge tone="green">{activePlan.done} of {activePlan.items.length} done</Badge></div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white" role="progressbar" aria-label="Checklist progress" aria-valuemin={0} aria-valuemax={activePlan.items.length} aria-valuenow={activePlan.done}><div className="h-full rounded-full bg-forest-600" style={{ width: `${activePlan.done / Math.max(1, activePlan.items.length) * 100}%` }} /></div>
          <div className="mt-4 space-y-2">{activePlan.items.filter((item) => item.status !== "done").slice(0, 2).map((item) => <LinkRow key={item.id} href={item.linkHref ?? "/action-plan"} title={item.label} description={item.detail} icon={<Check className="h-4 w-4" />} accent="mint" action="Take step" />)}</div>
          <ButtonLink href="/action-plan" variant="secondary" className="mt-4">Open full checklist<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>
        </section>}

        {/* 3. Quick links — everything else you'd want to jump to, in one row instead of three separate cards */}
        <section className="rounded-2xl border border-ink-200 bg-white p-5 sm:p-6">
          <Eyebrow>Jump to</Eyebrow>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <LinkRow href="/saved" title={`${saved.length} saved`} description="Things that made you curious" icon={<Bookmark className="h-4 w-4" />} accent="lavender" action="Open" />
            <LinkRow href="/action-plan" title={`${plans.length} checklist${plans.length === 1 ? "" : "s"}`} description="Small actions you can take" icon={<ClipboardList className="h-4 w-4" />} accent="butter" action="Open" />
            <LinkRow href={compareHref} title="Compare options" description="See two choices side by side" icon={<Scale className="h-4 w-4" />} accent="sky" action="Open" />
            <LinkRow href="/counselling" title="Change my answers" description="Update your profile anytime" icon={<User className="h-4 w-4" />} accent="mint" action="Open" />
          </div>
        </section>
      </main>

      <aside className="space-y-4 lg:sticky lg:top-24">
        {/* Possibilities + shortlist merged into one card, instead of two separate cards */}
        <section className="rounded-2xl border border-forest-200 bg-white p-5 sm:p-6">
          <Eyebrow>Keep exploring</Eyebrow>
          <h2 className="mt-2 text-lg font-semibold">Possibilities for you</h2>
          <div className="mt-4 space-y-2">
            {fields.map((suggestion) => <LinkRow key={suggestion.field.slug} href={`/explore/${suggestion.field.slug}`} title={suggestion.field.name} icon={<FieldIcon slug={suggestion.field.slug} className="h-4 w-4" />} accent={fieldVisual(suggestion.field.slug).accent} action="Explore" />)}
            {!fields.length && <p className="text-sm text-ink-500">Complete your profile to see starting points.</p>}
          </div>
          {!!saved.length && <>
            <p className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-400">Your shortlist</p>
            <div className="space-y-2">{saved.slice(0, 3).map((item) => <LinkRow key={item.id} href={hrefForItem(item.itemType, item.itemRef)} title={item.label ?? item.itemRef} description={item.itemType} action="Open" />)}</div>
          </>}
        </section>

        {/* Routes + funding + exams folded into one disclosure group instead of two disclosures + a standalone callout */}
        <Disclosure summary="Routes, funding & exam dates" hint="Optional — check when relevant">
          <div className="space-y-4">
            {!!paths.length && <div className="space-y-2">{paths.map(({ pathway }) => <LinkRow key={pathway.slug} href={`/pathways/${pathway.slug}`} title={pathway.title} icon={<Route className="h-4 w-4" />} accent="butter" action="View" />)}</div>}
            <div className="space-y-2">{scholarships.slice(0, 2).map((scholarship) => <LinkRow key={scholarship.slug} href={`/scholarships#${scholarship.slug}`} title={scholarship.name} icon={<Wallet className="h-4 w-4" />} accent="butter" action="Check" />)}<LinkRow href="/exams" title="Entrance examinations" icon={<FileText className="h-4 w-4" />} accent="sky" action="See dates" /></div>
            <p className="text-xs leading-relaxed text-ink-500">Deadlines can change — check the official source before relying on any date.</p>
          </div>
        </Disclosure>
      </aside>
    </div>
  </div>;
}
