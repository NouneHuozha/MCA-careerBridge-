"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Bookmark, Check, ChevronDown, Info, Pencil } from "lucide-react";
import { Logo } from "@/components/logo";
import { INTEREST_GROUPS, INTEREST_OPTIONS, type Stage } from "@/data/counselling";

type Answer = { values: string[]; text: string | null };
type Answers = Record<string, Answer>;

type Props = {
  stage: Stage;
  stageDetail: string | null;
  answers: Answers;
};

const summaryHref = "/guidance/review";
const fullCorrectionHref = "/guidance/review?mode=correct";
const correctionInterestGroups = [...INTEREST_GROUPS].sort((left, right) => Number(left.key !== "technology-engineering-making") - Number(right.key !== "technology-engineering-making"));
const makingOptionOrder = ["engineering", "arts", "technology", "research"];

const journeyItems = [
  { label: "Where you are now", href: fullCorrectionHref },
  { label: "What interests you", href: "/guidance/review?mode=correct&section=interests" },
  { label: "What you bring", href: fullCorrectionHref },
  { label: "What matters to you", href: fullCorrectionHref },
  { label: "What we understood", href: summaryHref },
];

export function InterestCorrectionPage({ stage, stageDetail, answers }: Props) {
  const router = useRouter();
  const initial = answers.interests ?? { values: [], text: null };
  const [values, setValues] = useState<string[]>(() => [...initial.values]);
  const [otherText, setOtherText] = useState(initial.text ?? "");
  const [expandedGroups, setExpandedGroups] = useState<string[]>(() =>
    INTEREST_GROUPS.filter((group) => group.values.some((value) => initial.values.includes(value))).map((group) => group.key),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCount = values.filter((value) => value !== "other" && value !== "not-sure").length;
  const hasSomethingElse = values.includes("other") || values.some((value) => !INTEREST_OPTIONS.some((option) => option.value === value) && value !== "not-sure");
  const isNotSure = values.includes("not-sure");

  function toggleValue(value: string) {
    setValues((current) => current.includes(value)
      ? current.filter((item) => item !== value && item !== "not-sure")
      : [...current.filter((item) => item !== "not-sure"), value]);
    setError(null);
  }

  function toggleNotSure() {
    setValues((current) => current.includes("not-sure") ? [] : ["not-sure"]);
    setError(null);
  }

  async function saveChanges(destination = summaryHref) {
    if (pending) return;
    if (!values.length) {
      setError("Choose an option, write a short answer, or choose ‘Not sure yet’.");
      return;
    }
    if (!navigator.onLine) {
      setError("You’re offline. Your earlier answers are safe. Reconnect to save these changes.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/correction", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          stage,
          stageDetail: stageDetail ?? "studying",
          answers: {
            interests: {
              values,
              text: hasSomethingElse && !isNotSure ? otherText.trim() || null : null,
            },
          },
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "We couldn’t save that answer. Your earlier answers are safe. Try again.");
      router.push(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn’t save that answer. Your earlier answers are safe. Try again.");
      setPending(false);
    }
  }

  return <div className="min-h-screen bg-[#fbfcfa] text-[#152c2a]">
    <header className="sticky top-0 z-50 flex min-h-[70px] items-center justify-between gap-4 border-b border-[#dce8e5] bg-white px-5 sm:min-h-[76px] sm:px-8 lg:px-16">
      <Logo size="md" />
      <button type="button" onClick={() => void saveChanges("/start?counsellingSaved=1")} disabled={pending} aria-label="Save and return later" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#263439] transition hover:bg-[#f5f8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287d6c] disabled:cursor-wait disabled:opacity-70 sm:gap-3 sm:px-3 sm:text-base">
        <Bookmark aria-hidden className="h-5 w-5 text-[#287d6c]" strokeWidth={1.8} />
        <span>{pending ? "Saving…" : "Save and return later"}</span>
      </button>
    </header>

    <div className="mx-auto grid w-full max-w-[1472px] grid-cols-1 gap-5 px-5 py-6 sm:gap-7 sm:px-8 sm:py-8 lg:grid-cols-[386px_minmax(0,1fr)] lg:gap-12 lg:px-11 lg:py-10">
      <aside aria-label="Counselling journey" className="h-fit rounded-xl border border-[#dce8e5] bg-white px-5 py-6 sm:px-7">
        <h2 className="text-[1.35rem] font-semibold tracking-[-.035em] text-[#172b2b]">Your counselling journey</h2>
        <ol className="mt-5 space-y-1">
          {journeyItems.map((item, index) => {
            const active = index === journeyItems.length - 1;
            return <li key={item.label} aria-current={active ? "step" : undefined} className={`relative flex min-h-[66px] items-center gap-3 rounded-lg px-2 ${active ? "bg-[#e8f4f0]" : ""}`}>
              {index < journeyItems.length - 1 && <span aria-hidden className="absolute left-[18px] top-[43px] h-[34px] w-px bg-[#8bc5b4]" />}
              <span aria-hidden className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ${active ? "bg-[#087c6b] text-white" : "bg-[#e1f1ec] text-[#12806d]"}`}>
                {active ? index + 1 : <Check className="h-5 w-5" strokeWidth={2.5} />}
              </span>
              <Link href={item.href} aria-current={active ? "step" : undefined} className={`min-w-0 flex-1 text-sm sm:text-base ${active ? "font-semibold text-[#173b35]" : "text-[#506974] hover:text-[#087c6b]"}`}>
                {item.label}
              </Link>
              {!active && <Link href={item.href} aria-label={`Edit ${item.label}`} className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-md px-1.5 text-sm font-medium text-[#087c6b] hover:bg-[#f0f7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287d6c]">
                <Pencil aria-hidden className="h-4 w-4" strokeWidth={1.8} />Edit
              </Link>}
            </li>;
          })}
        </ol>
        <div className="mt-5 flex gap-2.5 border-t border-[#e4ece8] pt-4 text-xs leading-relaxed text-[#637471] sm:text-[13px]">
          <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[#477c70]" />
          <p className="m-0">This is your progress through the conversation, not a score.</p>
        </div>
      </aside>

      <main className="min-w-0" aria-labelledby="correction-title">
        <header className="mb-5 sm:mb-6">
          <p className="inline-flex rounded-full bg-[#e8f4f0] px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#087c6b]">Editing your starting picture</p>
          <h1 id="correction-title" className="mt-4 text-[clamp(2rem,3.2vw,3.25rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#111b1e]">Change anything that no longer feels right.</h1>
          <p className="mt-2 text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed text-[#68758a]">Your guidance can change as your thinking changes.</p>
        </header>

        <div role="note" className="mb-3 flex items-center gap-3 rounded-lg border border-[#d9e8ef] bg-[#f4f9fc] px-4 py-3 text-sm text-[#536783]">
          <Info aria-hidden className="h-5 w-5 shrink-0 text-[#607494]" />
          <p className="m-0">You’re editing: <strong className="text-[#263c55]">What interests you</strong></p>
        </div>

        <form onSubmit={(event) => { event.preventDefault(); void saveChanges(); }}>
          <section aria-labelledby="interests-heading" className="rounded-xl border border-[#dce8e5] bg-white px-4 py-4 sm:px-5 sm:py-5">
            <h2 id="interests-heading" className="text-[1.5rem] font-semibold tracking-[-.03em] text-[#172b2b] sm:text-[1.75rem]">What kinds of things genuinely interest you?</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#68758a] sm:text-base">Choose what feels true today. You can change this later.</p>

            <div className="mt-4 space-y-2" aria-label="Interest groups">
              {correctionInterestGroups.map((group) => {
                const groupSelected = group.values.filter((value) => values.includes(value)).length;
                const expanded = expandedGroups.includes(group.key);
                const panelId = `edit-interest-group-${group.key}`;
                const groupValues = group.key === "technology-engineering-making"
                  ? [...group.values].sort((left, right) => makingOptionOrder.indexOf(left) - makingOptionOrder.indexOf(right))
                  : group.values;
                return <section key={group.key} className="overflow-hidden rounded-lg border border-[#e1e4df] bg-white">
                  <button type="button" aria-expanded={expanded} aria-controls={panelId} onClick={() => setExpandedGroups((current) => expanded ? current.filter((key) => key !== group.key) : [...current, group.key])} className={`flex min-h-[54px] w-full items-center gap-3 px-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#287d6c] sm:px-5 ${groupSelected ? "bg-[#f1f8f5]" : "bg-white hover:bg-[#fafcfb]"}`}>
                    <span className="min-w-0 flex-1 text-sm font-semibold text-[#172b2b] sm:text-base">{group.label}</span>
                    <span className="whitespace-nowrap text-xs text-[#68758a] sm:text-sm">{groupSelected} selected</span>
                    <ChevronDown aria-hidden className={`h-5 w-5 shrink-0 text-[#4c5556] transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                  <div id={panelId} hidden={!expanded} role="group" aria-label={group.label} className="space-y-1 border-t border-[#e6ebe7] px-3 py-2 sm:px-4">
                    {groupValues.map((value) => {
                      const option = INTEREST_OPTIONS.find((item) => item.value === value);
                      if (!option) return null;
                      const checked = values.includes(value);
                      return <label key={value} className={`flex min-h-[40px] cursor-pointer items-center gap-3 rounded-md border px-2 text-sm transition sm:text-[15px] ${checked ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-transparent hover:bg-[#f7faf8]"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleValue(value)} disabled={pending} className="h-5 w-5 shrink-0 accent-[#087c6b]" />
                        <span className="flex-1 text-[#303638]">{option.label}</span>
                        {checked && <Check aria-hidden className="h-4 w-4 shrink-0 text-[#087c6b]" strokeWidth={2.5} />}
                      </label>;
                    })}
                  </div>
                </section>;
              })}
            </div>

            <p className="mt-3 text-sm text-[#68758a]" role="status" aria-live="polite">{selectedCount} {selectedCount === 1 ? "interest" : "interests"} selected</p>

            <div className={`mt-2 overflow-hidden rounded-lg border ${hasSomethingElse ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e1e4df] bg-white"}`}>
              <label className="flex min-h-[54px] cursor-pointer items-center gap-3 px-4 text-sm text-[#303638] transition hover:bg-[#fafcfb] sm:px-5 sm:text-base">
                <input type="checkbox" checked={hasSomethingElse && !isNotSure} onChange={() => toggleValue("other")} disabled={pending} className="h-5 w-5 shrink-0 accent-[#087c6b]" />
                <span className="font-medium">Something else</span>
              </label>
              {hasSomethingElse && !isNotSure && <div className="border-t border-[#e1e9e4] px-4 py-3 sm:px-5">
                <label htmlFor="interest-other-text" className="mb-2 block text-sm font-medium text-[#454c4d]">Tell us more, if you’d like. <span className="font-normal text-[#777d7d]">Optional.</span></label>
                <textarea id="interest-other-text" aria-describedby="interest-other-help" value={otherText} onChange={(event) => setOtherText(event.target.value)} maxLength={600} rows={3} disabled={pending} placeholder="Share an interest in your own words (optional)" className="min-h-20 w-full resize-y rounded-lg border border-[#bfc3c5] bg-white px-3.5 py-2.5 text-base text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20 disabled:opacity-70" />
                <p id="interest-other-help" className="mt-2 text-sm text-[#777d7d]">Your own words can help us understand what the list cannot capture.</p>
              </div>}
            </div>

            <label className={`mt-2 flex min-h-[54px] cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm transition sm:px-5 sm:text-base ${isNotSure ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e1e4df] bg-white hover:bg-[#fafcfb]"}`}>
              <input type="checkbox" checked={isNotSure} onChange={toggleNotSure} disabled={pending} className="h-5 w-5 shrink-0 accent-[#087c6b]" />
              <span className="font-medium text-[#303638]">I’m not sure yet</span>
            </label>
            {isNotSure && <p role="status" className="mt-2 text-sm text-[#397e70]">That’s okay. You can explore possibilities before deciding.</p>}
          </section>

          {error && <p role="alert" className="mt-3 rounded-lg border border-[#e8c8bc] bg-[#fff5f0] px-4 py-3 text-sm text-[#8a3926]">{error}</p>}

          <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#e3e9e5] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href={summaryHref} className="inline-flex min-h-12 items-center gap-2 self-start rounded-lg px-1 text-base font-medium text-[#263b55] transition hover:text-[#087c6b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#287d6c]">
              <ArrowLeft aria-hidden className="h-5 w-5" />Cancel and return to summary
            </Link>
            <button type="submit" disabled={pending} className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-[#087663] px-6 py-3 text-base font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#066555] disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61]">
              {pending ? "Saving…" : "Save changes"}
              {!pending && <Check aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </form>
      </main>
    </div>
  </div>;
}
