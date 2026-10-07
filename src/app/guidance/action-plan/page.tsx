import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ClipboardList, GitCompareArrows, Bookmark, Info } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { buildChecklist, ensurePlan, listPlans, setItemStatus } from "@/services/student";
import { getExplorationState, getSessionState } from "@/services/profile";
import { guidanceHrefForItem } from "@/services/guidance-navigation";

export const dynamic = "force-dynamic";
export const metadata = { title: "Next steps · My Guidance" };

export default async function GuidanceActionPlanPage({ searchParams }: { searchParams: Promise<{ focus?: string }> }) {
  const params = await searchParams;
  const [state, user, active] = await Promise.all([getSessionState(), getCurrentUser(), getExplorationState()]);
  if (!state) redirect("/start");
  if (state.status !== "completed") redirect("/counselling");

  const [focusType, focusRef] = (params.focus ?? "").split(":");
  let saveError = false;
  if (user && focusType && focusRef) {
    try { await ensurePlan(user.id, focusType, focusRef); } catch { saveError = true; }
  }
  const plans = user ? await listPlans(user.id) : [];
  const preview = !user && focusType && focusRef ? await buildChecklist(focusType, focusRef) : [];
  const planEntries = await Promise.all(plans.map(async ({ plan, items }) => ({
    plan,
    items,
    href: await guidanceHrefForItem(plan.focusType, plan.focusRef, active?.directionSlug),
  })));
  const activeHref = active?.directionSlug ? `/guidance/direction/${encodeURIComponent(active.directionSlug)}` : "/guidance/possibilities";
  const previewHref = focusType && focusRef
    ? await guidanceHrefForItem(focusType, focusRef, active?.directionSlug)
    : activeHref;

  async function toggle(formData: FormData) {
    "use server";
    const currentUser = await getCurrentUser();
    if (!currentUser) return;
    const id = Number(formData.get("itemId"));
    if (Number.isSafeInteger(id) && id > 0) {
      await setItemStatus(currentUser.id, id, formData.get("status") === "done" ? "done" : "todo");
    }
    revalidatePath("/guidance/action-plan");
    revalidatePath("/guidance");
  }

  const allItems = planEntries.flatMap(({ items }) => items);
  const completedCount = allItems.filter((item) => item.status === "done").length;
  const progress = Math.round((completedCount / Math.max(1, allItems.length)) * 100);

  return <main className="min-h-[calc(100dvh-76px)] bg-[#fcfcfa] px-5 pb-10 pt-6 text-[#26312c] sm:px-8 lg:px-12">
    <section className="mx-auto max-w-[1120px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm font-semibold uppercase tracking-[.14em] text-[#68786d]">My Guidance · Next steps</p><h1 className="mt-2 font-serif text-[clamp(2.1rem,4vw,3.3rem)] leading-tight tracking-[-.035em] text-[#173344]">A plan you can take one step at a time</h1><p className="mt-2 max-w-3xl text-base leading-relaxed text-[#68756d]">This checklist supports your exploration. It does not decide your direction or restart counselling.</p></div>
        <div className="flex flex-wrap gap-2"><Link href="/guidance/saved" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61]"><Bookmark aria-hidden className="h-4 w-4" />Saved</Link><Link href="/guidance/compare" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61]"><GitCompareArrows aria-hidden className="h-4 w-4" />Compare</Link></div>
      </header>

      {saveError ? <p role="status" className="mt-5 rounded-lg border border-[#f0d6b8] bg-[#fff8ed] px-4 py-3 text-sm text-[#805c27]">We couldn’t save this plan right now. Your other plans are safe.</p> : null}
      {planEntries.length ? <>
        <section className="mt-5 rounded-xl border border-[#dce8df] bg-[#edf6f0] p-5" aria-label="Overall checklist progress"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-xl text-[#173344]">Your progress</h2><p className="mt-1 text-sm text-[#607068]">{completedCount} of {allItems.length} checks completed across your saved plans.</p></div><span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#286b61]">{progress}%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#4b9a75]" style={{ width: `${progress}%` }} /></div></section>
        <div className="mt-5 space-y-4">{planEntries.map(({ plan, items, href }) => <section key={plan.id} className="rounded-xl border border-[#e1e7df] bg-white p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-xl text-[#173344]">{plan.title}</h2><p className="mt-1 text-sm text-[#68756d]">{items.filter((item) => item.status === "done").length} of {items.length} steps complete</p></div><Link href={href} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Return to this exploration<ArrowRight aria-hidden className="h-4 w-4" /></Link></div><ol className="mt-4 divide-y divide-[#e8ece7]">{items.map((item) => <li key={item.id} className="flex items-start gap-3 py-3"><form action={toggle} className="shrink-0"><input type="hidden" name="itemId" value={item.id} /><input type="hidden" name="status" value={item.status === "done" ? "todo" : "done"} /><button type="submit" aria-pressed={item.status === "done"} aria-label={`${item.status === "done" ? "Uncheck" : "Complete"} ${item.label}`} className={`grid h-10 w-10 place-items-center rounded-full border-2 ${item.status === "done" ? "border-[#438768] bg-[#438768] text-white" : "border-[#b7c8bc] bg-white text-transparent hover:border-[#438768]"}`}><Check aria-hidden className="h-5 w-5" /></button></form><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className={`text-sm font-semibold ${item.status === "done" ? "text-[#6b776f] line-through" : "text-[#263b37]"}`}>{item.label}</h3><Link href={href} className="text-xs font-semibold text-[#286b61] underline decoration-[#a6c5b8] underline-offset-4">Open guidance</Link></div>{item.detail ? <details className="mt-1"><summary className="w-fit cursor-pointer text-xs font-semibold text-[#47766c] underline underline-offset-4">What does this involve?</summary><p className="mt-2 text-sm leading-relaxed text-[#68756d]">{item.detail}</p></details> : null}</div></li>)}</ol></section>)}</div>
      </> : preview.length ? <section className="mt-5 rounded-xl border border-[#e1e7df] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f2ec] text-[#286b61]"><ClipboardList aria-hidden className="h-5 w-5" /></span><div><h2 className="font-serif text-xl text-[#173344]">Preview next steps</h2><p className="mt-1 text-sm leading-relaxed text-[#68756d]">Sign in if you want to save and check off steps. The links below stay in My Guidance.</p></div></div><ol className="mt-4 divide-y divide-[#e8ece7]">{preview.map((item, index) => <li key={item.label} className="flex items-start gap-3 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e8f2ec] text-sm font-semibold text-[#286b61]">{index + 1}</span><div className="flex-1"><h3 className="text-sm font-semibold text-[#263b37]">{item.label}</h3><p className="mt-1 text-sm text-[#68756d]">{item.detail}</p></div><Link href={previewHref} className="shrink-0 text-xs font-semibold text-[#286b61] underline underline-offset-4">Open</Link></li>)}</ol><Link href={`/sign-in?next=${encodeURIComponent(`/guidance/action-plan?focus=${focusType}:${focusRef}`)}`} className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Sign in to save these steps<ArrowRight aria-hidden className="h-4 w-4" /></Link></section> : <section className="mt-5 rounded-xl border border-dashed border-[#b8cfc4] bg-[#f4f8f4] px-6 py-9 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-[#286b61]"><Info aria-hidden className="h-6 w-6" /></span><h2 className="mt-3 font-serif text-xl text-[#243e39]">No next-step checklist yet</h2><p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#66736b]">Choose a direction or open a course, route, or institution from your guidance space to build a checklist.</p><Link href="/guidance/possibilities" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white">Explore possibilities<ArrowRight aria-hidden className="h-4 w-4" /></Link></section>}

      <div className="mt-5 border-t border-[#e1e7df] pt-4"><Link href="/guidance" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#a6c5b8] underline-offset-4"><ArrowLeft aria-hidden className="h-4 w-4" />Back to My Guidance</Link></div>
    </section>
  </main>;
}
