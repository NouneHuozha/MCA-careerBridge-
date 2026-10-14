"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";
import { HOSTEL_OPTIONS, type Stage } from "@/data/counselling";

const DETAILS_PATH = "/guidance/review/details";
const DRAFT_KEY = "careerbridge:counselling-draft:hostel";
const PREFER_NOT = "prefer-not";
const SELECTABLE_VALUES = new Set(HOSTEL_OPTIONS.map((option) => option.value));
const RADIO_OPTIONS = HOSTEL_OPTIONS.filter((option) => option.value !== PREFER_NOT);
const PREFER_NOT_OPTION = HOSTEL_OPTIONS.find((option) => option.value === PREFER_NOT)!;

type Answer = { values: string[]; text: string | null };
type Props = {
  stage: Stage;
  initialAnswer: Answer | null;
  answered: number;
  returnTo?: typeof DETAILS_PATH | "/guidance/review";
};
type SaveResponse = { error?: string };

export function HostelRequirementDetail({ stage, initialAnswer, answered, returnTo = DETAILS_PATH }: Props) {
  const router = useRouter();
  const busy = useRef(false);
  const [selected, setSelected] = useState(initialAnswer?.values[0] ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as { selected?: unknown };
        if (typeof draft.selected === "string" && SELECTABLE_VALUES.has(draft.selected)) {
          // Keep an unsaved choice available when Back returns to this screen.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelected(draft.selected);
        }
      }
    } catch {
      // Continue with the saved server answer if local draft storage is unavailable.
    }
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  function choose(value: string) {
    setSelected(value);
    setError(null);
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ selected: value })); } catch { /* Draft storage is optional. */ }
  }

  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* Ignore unavailable browser storage. */ }
  }

  function goBack() {
    router.push(returnTo);
    router.refresh();
  }

  function skip() {
    clearDraft();
    router.push(returnTo);
    router.refresh();
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    if (!navigator.onLine) {
      setError("You’re offline. Reconnect to save this detail. Your earlier answers are safe.");
      return;
    }

    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/counselling", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: selected ? "answer" : "skip",
          questionKey: "hostel",
          values: selected ? [selected] : [],
          text: null,
          stage,
        }),
      });
      const result = await response.json() as SaveResponse;
      if (!response.ok || result.error) throw new Error("save-failed");
      clearDraft();
      router.push(returnTo);
      router.refresh();
    } catch {
      setError(navigator.onLine
        ? "We couldn’t save that detail. Your earlier answers are safe. Try again."
        : "You’re offline. Reconnect to save this detail. Your earlier answers are safe.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const completedSections = counsellingStages
    .filter((item) => item.key !== "reflection")
    .map((item) => item.key);

  return (
    <CounsellingJourneyShell
      currentSection="reflection"
      completedSections={completedSections}
      progress={{ current: answered, total: answered }}
      variant="grouped"
    >
      <main className="flex min-h-[calc(100svh-160px)] min-w-0 flex-col pb-5" aria-labelledby="hostel-requirement-heading">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void save(event)}>
          <header>
            <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">
              Step 5 of 5 · Optional
            </p>
            <h1 id="hostel-requirement-heading" className="mt-4 font-semibold text-[clamp(2rem,3.5vw,3.1rem)] leading-[1.06] tracking-[-.045em] text-[#111827]">
              Would you need a hostel?
            </h1>
            <p className="mt-3 max-w-[900px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">
              This helps us include practical living arrangements when comparing institutions.
            </p>
          </header>

          <fieldset className="mt-5 min-w-0 space-y-2" aria-describedby={error ? "hostel-requirement-error" : undefined}>
            <legend className="sr-only">Would you need a hostel?</legend>
            {RADIO_OPTIONS.map((option) => <label
              key={option.value}
              className={`flex min-h-[76px] cursor-pointer items-center gap-5 rounded-lg border px-4 py-4 transition sm:px-6 ${selected === option.value ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e9ece7] bg-white hover:bg-[#fafbf9]"}`}
            >
              <input
                type="radio"
                name="hostel-requirement"
                value={option.value}
                checked={selected === option.value}
                onChange={() => choose(option.value)}
                className="h-5 w-5 shrink-0 accent-[#287d6c]"
              />
              <span className="font-medium text-[#20272b]">{option.label}</span>
            </label>)}
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md px-0.5 pt-1">
              <input
                type="radio"
                name="hostel-requirement"
                value={PREFER_NOT}
                checked={selected === PREFER_NOT}
                onChange={() => choose(PREFER_NOT)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-10 items-center rounded-md px-2 text-sm font-semibold text-[#287669] transition hover:text-[#14584e] peer-checked:underline peer-checked:decoration-2 peer-checked:underline-offset-4 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#286b61]">
                {PREFER_NOT_OPTION.label}
              </span>
            </label>
          </fieldset>

          {(!online || error) && <p id="hostel-requirement-error" className="mt-4 rounded-lg border border-[#e8d9c8] bg-[#fffaf2] px-4 py-3 text-sm leading-relaxed text-[#665641]" role="alert">
            {!online && !error ? "You’re offline. Reconnect to save this detail. Your earlier answers are safe." : error}
          </p>}

          <nav aria-label="Hostel requirement actions" className="mt-auto flex flex-col gap-3 border-t border-[#e4e8e7] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
            <button
              type="button"
              onClick={goBack}
              disabled={pending}
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-sm font-medium text-[#263b55] transition hover:text-[#176b62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:opacity-50"
            >
              <ArrowLeft aria-hidden className="h-5 w-5" />Back to additional details
            </button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-4">
              <button
                type="button"
                onClick={skip}
                disabled={pending}
                className="inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold text-[#287669] transition hover:text-[#14584e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:opacity-50"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-[#087663] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#066555] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61] disabled:cursor-wait disabled:opacity-70"
              >
                {pending ? "Saving…" : "Save and return"}
                {!pending && <ArrowRight aria-hidden className="h-5 w-5" />}
              </button>
            </div>
          </nav>
        </form>
      </main>
    </CounsellingJourneyShell>
  );
}
