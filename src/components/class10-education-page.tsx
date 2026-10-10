"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Bookmark, Check, Plus } from "lucide-react";
import { CounsellingJourneyMap, CounsellingStartHeader } from "@/components/counselling-start-shell";

type Answer = { values: string[]; text: string | null };
type Props = {
  sessionId: number;
  initialAnswer: Answer | null;
  editing?: boolean;
  returnTo?: string;
};

const streamOptions = [
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts / Humanities" },
  { value: "vocational", label: "Vocational, ITI, or polytechnic routes" },
  { value: "not-sure", label: "I’m not sure yet" },
] as const;

const optionValues = new Set<string>(streamOptions.map((option) => option.value));

export function Class10EducationPage({ sessionId, initialAnswer, editing = false, returnTo }: Props) {
  const router = useRouter();
  const storageKey = `careerbridge:${sessionId}:stream-intent-draft`;
  const [selected, setSelected] = useState(() => initialAnswer?.values.find((value) => optionValues.has(value)) ?? "");
  const [text, setText] = useState(initialAnswer?.text ?? "");
  const [expanded, setExpanded] = useState(Boolean(initialAnswer?.text));
  const [draftReady, setDraftReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw) {
          const draft = JSON.parse(raw) as { value?: unknown; text?: unknown };
          if (typeof draft.value === "string" && (optionValues.has(draft.value) || draft.value === "")) setSelected(draft.value);
          if (typeof draft.text === "string") {
            setText(draft.text);
            if (draft.text) setExpanded(true);
          }
        }
      } catch {
        // Continue with the server-provided answer if draft storage is unavailable.
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);

  function cacheDraft(value: string, nextText: string) {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify({ value, text: nextText }));
    } catch {
      // The current form remains usable if browser storage is unavailable.
    }
  }

  async function save(intent: "continue" | "return") {
    if (busy.current || !draftReady) return;
    if (intent === "continue" && !selected && !text.trim()) {
      setError("Choose an option, write a short answer, or choose ‘Not sure yet.’");
      return;
    }

    setError(null);
    busy.current = true;
    setPending(true);
    try {
      if (selected || text.trim()) {
        const response = await fetch("/api/counselling", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            action: "answer",
            questionKey: "stream_intent",
            values: selected ? [selected] : [],
            text: text.trim() || null,
            stage: "class10",
          }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok || result.error) {
          setError(result.error ?? "We couldn’t save that answer. Your earlier answers are safe. Try again.");
          return;
        }
      }

      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        // A successful API save must not be reported as failed if storage is unavailable.
      }
      if (intent === "return") {
        router.push("/start?counsellingSaved=1");
        router.refresh();
      } else if (editing) {
        router.push(returnTo === "/guidance/review" ? "/guidance/review" : "/counselling");
        router.refresh();
      } else {
        router.refresh();
      }
    } catch {
      setError("We couldn’t save that answer. Your earlier answers are safe. Try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save("continue");
  }

  const headerAction = (
    <button
      type="button"
      onClick={() => void save("return")}
      disabled={pending || !draftReady}
      aria-label="Save and return later"
      className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-1 text-xs font-medium text-[#47796d] transition hover:bg-[#f0f6f2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397c6e] focus-visible:ring-offset-2 disabled:opacity-60 sm:gap-3 sm:px-3 sm:text-sm"
    >
      <Bookmark aria-hidden="true" className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={1.8} />
      <span>{pending ? "Saving…" : "Save and return later"}</span>
    </button>
  );

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-[#fbfaf8] text-[#20272b]">
      <CounsellingStartHeader rightControl={headerAction} />
      <main className="mx-auto grid w-full max-w-[1472px] gap-7 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[386px_minmax(0,1fr)] lg:gap-12 lg:px-11 lg:py-10">
        <CounsellingJourneyMap activeStep={0} />
        <section className="min-w-0 self-start py-1 lg:py-0" aria-labelledby="class10-stream-title">
          <p className="inline-flex rounded-full bg-[#eaf4ef] px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#47796d]">Step 1 of 5</p>
          <h1 id="class10-stream-title" className="mt-5 max-w-none text-[clamp(2.2rem,3.2vw,3rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#20272b]">
            What are you considering after Class 10?
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#686e6e] sm:text-lg">You do not need to have decided yet. Choose what feels true today.</p>

          <form className="mt-7" onSubmit={submit}>
            <fieldset disabled={pending || !draftReady}>
              <legend className="sr-only">Choose what you are considering after Class 10</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {streamOptions.map((option, index) => (
                  <label
                    key={option.value}
                    className={`group relative flex min-h-[76px] cursor-pointer items-center gap-5 rounded-xl border border-[#e0e1dc] bg-white px-5 py-4 text-[15px] font-medium text-[#293032] transition hover:border-[#8db3a7] has-[:checked]:border-[#438573] has-[:checked]:bg-[#f4f8f5] has-[:checked]:shadow-[0_0_0_1px_#438573] focus-within:ring-2 focus-within:ring-[#438573] focus-within:ring-offset-2 sm:px-6 ${index === streamOptions.length - 1 ? "sm:col-span-2" : ""}`}
                  >
                    <input
                      type="radio"
                      name="stream_intent"
                      value={option.value}
                      checked={selected === option.value}
                      onChange={() => {
                        setSelected(option.value);
                        setError(null);
                        cacheDraft(option.value, text);
                      }}
                      className="peer sr-only"
                    />
                    <span aria-hidden="true" className="pointer-events-none grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 border-[#9da5a3] bg-white text-transparent transition peer-checked:border-[#438573] peer-checked:bg-[#438573] peer-checked:text-white">
                      <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />
                    </span>
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-8">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls="class10-stream-context"
                onClick={() => setExpanded((previous) => !previous)}
                disabled={pending || !draftReady}
                className="inline-flex min-h-10 items-center gap-3 rounded-lg text-base font-medium text-[#347966] transition hover:text-[#245f52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2"
              >
                <Plus aria-hidden="true" className={`h-6 w-6 transition-transform ${expanded ? "rotate-45" : ""}`} strokeWidth={1.8} />
                Tell us more in your own words
              </button>
              <div id="class10-stream-context" hidden={!expanded} className="mt-3">
                  <label htmlFor="class10-stream-text" className="sr-only">Tell us more in your own words (optional)</label>
                  <textarea
                    id="class10-stream-text"
                    value={text}
                    onChange={(event) => {
                      setText(event.target.value);
                      setError(null);
                      cacheDraft(selected, event.target.value);
                    }}
                    maxLength={600}
                    rows={3}
                    disabled={pending || !draftReady}
                    placeholder="A few words are enough. You can leave this blank."
                    className="w-full resize-y rounded-xl border border-[#dfe2dd] bg-white px-4 py-3 text-sm leading-relaxed text-[#293032] outline-none transition placeholder:text-[#858b89] focus:border-[#438573] focus:ring-2 focus:ring-[#dcebe3] disabled:bg-[#f7f7f5]"
                  />
              </div>
            </div>
            <p className="mt-3 text-sm text-[#747a79]">Not sure yet is okay.</p>

            {error && <p role="alert" className="mt-4 rounded-xl border border-[#e7c9be] bg-[#fff4ef] px-4 py-3 text-sm font-medium text-[#8b4431]">{error}</p>}

            <div className="mt-8 flex flex-col gap-3 border-t border-[#e8e8e4] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/start/current-position" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-medium text-[#535c5d] transition hover:text-[#253638] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2">
                <ArrowLeft aria-hidden="true" className="h-5 w-5" />Back
              </Link>
              <button
                type="submit"
                disabled={pending || !draftReady}
                className="group inline-flex min-h-[62px] w-full items-center justify-center gap-4 rounded-xl bg-[#397e70] px-7 text-base font-semibold text-white transition hover:bg-[#2f6d61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:min-w-[210px]"
              >
                {pending ? "Saving…" : "Continue"}
                <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
