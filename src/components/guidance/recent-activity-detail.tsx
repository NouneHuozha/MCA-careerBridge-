"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";
import type { Stage } from "@/data/counselling";

const DRAFT_KEY = "careerbridge:counselling-draft:interest_story";
const DETAILS_PATH = "/guidance/review/details";

type Answer = { values: string[]; text: string | null };

type Props = {
  stage: Stage;
  initialAnswer: Answer | null;
  answered: number;
  returnTo?: typeof DETAILS_PATH | "/guidance/review";
};

type SaveResponse = { error?: string };

export function RecentActivityDetail({ stage, initialAnswer, answered, returnTo = DETAILS_PATH }: Props) {
  const router = useRouter();
  const [text, setText] = useState(initialAnswer?.text ?? "");
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
        const draft = JSON.parse(raw) as { text?: unknown };
        if (typeof draft.text === "string") {
          // A local draft lets Back preserve a long response without claiming it was saved.
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setText(draft.text);
        }
      }
    } catch {
      // Keep the saved server answer if draft storage is unavailable or malformed.
    }
    return () => {
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  function updateText(value: string) {
    setText(value);
    setError(null);
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ values: [], other: "", text: value }));
    } catch {
      // The field remains editable; session storage is only a convenience for Back navigation.
    }
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
    if (pending) return;
    if (!navigator.onLine) {
      setError("You’re offline. Reconnect to save this detail. Your earlier answers are safe.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/counselling", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: text.trim() ? "answer" : "skip",
          questionKey: "interest_story",
          values: [],
          text: text.trim() ? text.trim() : null,
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
      <main className="flex min-h-[calc(100svh-160px)] min-w-0 flex-col pb-5" aria-labelledby="recent-activity-heading">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void save(event)}>
          <header>
            <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">
              Step 5 of 5 · Optional
            </p>
            <h1 id="recent-activity-heading" className="mt-4 font-semibold text-[clamp(2rem,3.5vw,3.1rem)] leading-[1.06] tracking-[-.045em] text-[#111827]">
              What is something you enjoyed doing recently?
            </h1>
            <p className="mt-3 max-w-[900px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">
              It could be making something, helping someone, fixing something, reading, organising, or learning.
            </p>
          </header>

          <section className="mt-5 rounded-lg border border-[#e4e3df] bg-white px-4 py-4 sm:px-6 sm:py-5" aria-label="Recent activity response">
            <label htmlFor="recent-activity-text" className="block text-base font-semibold text-[#20272b] sm:text-lg">
              Write in your own words
            </label>
            <textarea
              id="recent-activity-text"
              name="interest_story"
              rows={6}
              maxLength={600}
              value={text}
              onChange={(event) => updateText(event.target.value)}
              aria-describedby={error ? "recent-activity-help recent-activity-error" : "recent-activity-help"}
              className="mt-4 min-h-40 w-full resize-y rounded-md border border-[#c9ccca] bg-white px-3.5 py-3 text-base leading-relaxed text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20"
              placeholder="For example: I enjoyed helping my cousin repair a phone."
            />
            <p id="recent-activity-help" className="mt-3 text-sm text-[#68758a]">Optional — a short answer is enough.</p>
          </section>

          {(!online || error) && <p id="recent-activity-error" className="mt-4 rounded-lg border border-[#e8d9c8] bg-[#fffaf2] px-4 py-3 text-sm leading-relaxed text-[#665641]" role="alert">
            {!online && !error ? "You’re offline. Reconnect to save this detail. Your earlier answers are safe." : error}
          </p>}

          <nav aria-label="Recent activity actions" className="mt-auto flex flex-col gap-3 border-t border-[#e4e8e7] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
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
