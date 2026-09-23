import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowRight, Check, ClipboardList, FileText, GraduationCap, ListChecks, Wallet } from "lucide-react";
import { ButtonLink, Callout, Disclosure, Eyebrow } from "@/components/ui";
import { LinkRow } from "@/components/detail-parts";
import { getCurrentUser } from "@/auth";
import { buildChecklist, ensurePlan, listPlans, resolveFocus, setItemStatus } from "@/services/student";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your action plan" };
export default async function ActionPlanPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const { focus: inputFocus } = await searchParams;
  const [focusType, focusRef] = (inputFocus ?? "").split(":");
  const focus = focusType && focusRef ? await resolveFocus(focusType, focusRef) : null;
  const user = await getCurrentUser();
  async function toggle(formData: FormData) {
    "use server";
    const currentUser = await getCurrentUser(); if (!currentUser) return;
    const id = Number(formData.get("itemId"));
    if (Number.isSafeInteger(id) && id > 0) await setItemStatus(currentUser.id, id, formData.get("status") === "done" ? "done" : "todo");
    revalidatePath("/action-plan"); revalidatePath("/dashboard");
  }
  let saveError = false;
  if (user && focus) { try { await ensurePlan(user.id, focusType, focusRef); } catch { saveError = true; } }
  const plans = user ? await listPlans(user.id) : [];
  const preview = !user ? await buildChecklist(focusType || "field", focusRef || "technology") : [];
  return <div className="cb-container cb-page">
    <header className="mb-7 flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-forest-200 bg-mint/60 p-6 sm:p-8"><div><Eyebrow>One step at a time</Eyebrow><h1 className="cb-page-title mt-3">A direction. Now a little action.</h1><p className="mt-3 text-sm text-ink-600">{focus ? focus.title : "A practical checklist to keep you moving, without rushing you."}</p></div><ListChecks aria-hidden className="hidden h-16 w-16 shrink-0 text-forest-600 sm:block" strokeWidth={1.3} /></header>
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5">
        {saveError && <Callout tone="amber" title="We couldn’t save this plan"><p>Please try again. Your other plans are safe.</p></Callout>}
        {!user && <><Callout tone="forest" title="Your checklist preview"><p><Link className="cb-source" href="/sign-in">Sign in</Link> to tick off tasks and keep your progress.</p></Callout><section className="cb-panel"><h2 className="cb-panel-title"><ClipboardList />Your possible next steps</h2><ol className="divide-y divide-ink-100">{preview.map((item, i) => <li key={item.label} className="py-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-butter text-xs font-bold text-butter-ink">{i + 1}</span><h3 className="text-sm font-semibold">{item.label}</h3></div><div className="mt-3 sm:pl-11"><Disclosure summary="How to do this"><p>{item.detail}</p>{item.linkHref && <ButtonLink href={item.linkHref} size="sm" variant="secondary" className="mt-4">Open guidance<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink>}</Disclosure></div></li>)}</ol></section></>}
        {user && !plans.length && <div className="cb-panel"><h2 className="cb-panel-title"><CompassIcon />Start with a direction you’re curious about.</h2><p className="mb-5 text-sm text-ink-500">Open a career, course or pathway and choose “Build an action plan”.</p><ButtonLink href="/pathways">Explore pathways<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink></div>}
        {plans.map(({ plan, items }) => { const done = items.filter((item) => item.status === "done").length; return <section key={plan.id} className="cb-panel"><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="max-w-2xl text-lg font-semibold leading-snug">{plan.title}</h2><span className="rounded-lg bg-mint px-3 py-1.5 text-xs font-bold text-forest-700">{done} of {items.length} done</span></div><div className="mb-3 mt-5 h-2 overflow-hidden rounded-full bg-ink-100" role="progressbar" aria-label={`Progress on ${plan.title}`} aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done}><div className="h-full rounded-full bg-forest-500 transition-all" style={{ width: `${done / Math.max(1, items.length) * 100}%` }} /></div><ol className="divide-y divide-ink-100">{items.map((item) => <li key={item.id} className="py-4"><div className="flex items-start gap-3"><form action={toggle} className="shrink-0"><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="status" value={item.status === "done" ? "todo" : "done"} /><button type="submit" aria-pressed={item.status === "done"} aria-label={`${item.status === "done" ? "Uncheck" : "Complete"} ${item.label}`} className={`grid h-11 w-11 place-items-center rounded-xl border-2 transition-colors ${item.status === "done" ? "border-forest-600 bg-forest-600 text-white" : "border-forest-300 bg-forest-50 text-forest-400 hover:border-forest-600"}`}><Check aria-hidden className="h-5 w-5" /></button></form><div className="min-w-0 flex-1"><div className="flex min-h-11 flex-wrap items-center justify-between gap-3"><h3 className={`text-sm font-semibold ${item.status === "done" ? "text-ink-500 line-through" : "text-ink-900"}`}>{item.label}</h3>{item.linkHref && <Link href={item.linkHref} className="cb-source text-xs">Open guidance<ArrowRight aria-hidden className="h-3.5 w-3.5" /></Link>}</div>{item.detail && <details className="mt-2"><summary className="w-fit cursor-pointer text-xs font-semibold text-forest-700 underline underline-offset-4">What does this involve?</summary><p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-600">{item.detail}</p></details>}</div></div></li>)}</ol></section>; })}
      </div>
      <aside className="space-y-4 lg:sticky lg:top-24">{!user && <section className="rounded-2xl border border-lavender-ink/20 bg-lavender/35 p-6"><h2 className="text-lg font-semibold">Keep your progress.</h2><p className="mt-3 text-sm text-ink-600">Sign in to save your checklist and come back to it later.</p><ButtonLink href="/sign-up" className="mt-5 w-full">Create an account<ArrowRight className="h-4 w-4" /></ButtonLink><ButtonLink href="/sign-in" variant="secondary" className="mt-3 w-full">Sign in</ButtonLink></section>}
        <div className="rounded-2xl border border-butter-ink/20 bg-butter/30 p-5"><h2 className="mb-4 text-base font-semibold">Useful along the way</h2><div className="space-y-3"><LinkRow href="/institutions" title="Find institutions" icon={<GraduationCap className="h-4 w-4" />} accent="sky" /><LinkRow href="/scholarships" title="Check scholarships" icon={<Wallet className="h-4 w-4" />} accent="butter" /><LinkRow href="/exams" title="Check entrance exams" icon={<FileText className="h-4 w-4" />} accent="lavender" /></div></div><Callout title="A checklist, not a countdown"><p>Take one task at a time. Dates and requirements come from the official notices you check.</p></Callout>
      </aside>
    </div>
  </div>;
}
function CompassIcon() { return <ClipboardList className="h-5 w-5 text-forest-700" aria-hidden />; }
