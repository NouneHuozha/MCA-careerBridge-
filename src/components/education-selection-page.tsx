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
  firstStep?: boolean;
  returnTo?: string;
};
type PageKind = "class10" | "class12";
type Choice = { value: string; label: string };

const pageConfig: Record<PageKind, {
  questionKey: string;
  stage: PageKind;
  heading: string;
  helper: string;
  afterHelper: string;
  options: Choice[];
  specialOther?: string;
}> = {
  class10: {
    questionKey: "stream_intent",
    stage: "class10",
    heading: "What are you considering after Class 10?",
    helper: "You do not need to have decided yet. Choose what feels true today.",
    afterHelper: "Not sure yet is okay.",
    options: [
      { value: "science", label: "Science" },
      { value: "commerce", label: "Commerce" },
      { value: "arts", label: "Arts / Humanities" },
      { value: "vocational", label: "Vocational, ITI, or polytechnic routes" },
      { value: "not-sure", label: "I’m not sure yet" },
    ],
  },
  class12: {
    questionKey: "stream_current",
    stage: "class12",
    heading: "What did you study in Class 11–12?",
    helper: "Choose the option that feels closest. You can change this later.",
    afterHelper: "Not sure yet is okay.",
    specialOther: "other",
    options: [
      { value: "science-pcm", label: "Science with Mathematics" },
      { value: "science-pcb", label: "Science with Biology" },
      { value: "commerce", label: "Commerce" },
      { value: "arts", label: "Arts / Humanities" },
      { value: "vocational", label: "Vocational" },
      { value: "other", label: "Something else" },
      { value: "not-sure", label: "I’m not sure yet" },
    ],
  },
};

const optionValues: Record<PageKind, Set<string>> = {
  class10: new Set(pageConfig.class10.options.map((option) => option.value)),
  // The generic Science value was used by the first Class 12 rollout; keep it loadable without showing it for new answers.
  class12: new Set([...pageConfig.class12.options.map((option) => option.value), "science"]),
};

function initialChoice(kind: PageKind, answer: Answer | null) {
  const value = answer?.values.find((entry) => optionValues[kind].has(entry));
  if (value) return value;
  return "";
}

function EducationSelectionPage({ kind, sessionId, initialAnswer, editing = false, firstStep = false, returnTo }: Props & { kind: PageKind }) {
  const router = useRouter();
  const config = pageConfig[kind];
  const storageKey = `careerbridge:${sessionId}:${config.questionKey}-draft`;
  const [selected, setSelected] = useState(() => initialChoice(kind, initialAnswer));
  const [text, setText] = useState(initialAnswer?.text ?? "");
  const [expanded, setExpanded] = useState(Boolean(initialAnswer?.text || (config.specialOther && initialAnswer?.values.includes(config.specialOther))));
  const [draftReady, setDraftReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const headingId = `${config.questionKey}-title`;
  const contextId = `${config.questionKey}-context`;
  const textId = `${config.questionKey}-text`;
  const selectionOptions = kind === "class12" && selected === "science"
    ? [{ value: "science", label: "Science" }, ...config.options]
    : config.options;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (raw) {
          const draft = JSON.parse(raw) as { value?: unknown; text?: unknown };
          if (typeof draft.value === "string" && (optionValues[kind].has(draft.value) || draft.value === "")) setSelected(draft.value);
          if (typeof draft.text === "string") {
            setText(draft.text);
            if (draft.text) setExpanded(true);
          }
          if (config.specialOther && draft.value === config.specialOther) setExpanded(true);
        }
      } catch {
        // Continue with the server-provided answer if draft storage is unavailable.
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config.specialOther, kind, storageKey]);

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
            questionKey: config.questionKey,
            values: selected ? [selected] : [],
            text: text.trim() || null,
            stage: config.stage,
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
      } else if (firstStep) {
        router.replace("/counselling");
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
        <section className="min-w-0 self-start py-1 lg:py-0" aria-labelledby={headingId}>
          <p className="inline-flex rounded-full bg-[#eaf4ef] px-4 py-2 text-xs font-bold uppercase tracking-[.14em] text-[#47796d]">Step 1 of 5</p>
          <h1 id={headingId} className="mt-5 max-w-none text-[clamp(2.2rem,3.2vw,3rem)] font-semibold leading-[1.08] tracking-[-.045em] text-[#20272b]">
            {config.heading}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#686e6e] sm:text-lg">{config.helper}</p>

          <form className="mt-7" onSubmit={submit}>
            <fieldset disabled={pending || !draftReady}>
              <legend className="sr-only">{config.heading}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                {selectionOptions.map((option, index) => {
                  const isSelected = selected === option.value;
                  const inlineOther = kind === "class12" && option.value === config.specialOther && isSelected;
                  const fullWidth = kind === "class10" && index === config.options.length - 1;
                  return (
                    <div
                      key={option.value}
                      className={`rounded-xl border transition focus-within:ring-2 focus-within:ring-[#438573] focus-within:ring-offset-2 ${isSelected ? "border-[#438573] bg-[#f4f8f5] shadow-[0_0_0_1px_#438573]" : "border-[#e0e1dc] bg-white hover:border-[#8db3a7]"} ${fullWidth ? "sm:col-span-2" : ""}`}
                    >
                      <label className={`group flex cursor-pointer gap-5 px-5 text-[15px] font-medium text-[#293032] sm:px-6 ${inlineOther ? "items-start pt-4" : "min-h-[76px] items-center py-4"}`}>
                        <input
                          type="radio"
                          name={config.questionKey}
                          value={option.value}
                          checked={isSelected}
                          onChange={() => {
                            setSelected(option.value);
                            setError(null);
                            if (kind === "class10" && config.specialOther === option.value) setExpanded(true);
                            cacheDraft(option.value, text);
                          }}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full border-2 transition ${kind === "class12" ? (isSelected ? "border-[#397e70] bg-white" : "border-[#9da5a3] bg-white") : "border-[#9da5a3] bg-white text-transparent peer-checked:border-[#438573] peer-checked:bg-[#438573] peer-checked:text-white"} ${inlineOther ? "mt-0.5" : ""}`}
                        >
                          {kind === "class12"
                            ? (isSelected && <span className="h-[17px] w-[17px] rounded-full bg-[#397e70]" />)
                            : <Check className="h-[18px] w-[18px]" strokeWidth={2.5} />}
                        </span>
                        <span className="min-w-0 flex-1">{option.label}</span>
                      </label>
                      {inlineOther && (
                        <div className="pb-4 pl-[4.75rem] pr-5 sm:pr-6">
                          <label htmlFor={textId} className="mb-2 block text-sm text-[#747a79]">Tell us what you studied (optional)</label>
                          <input
                            id={textId}
                            type="text"
                            value={text}
                            onChange={(event) => {
                              setText(event.target.value);
                              setError(null);
                              cacheDraft(selected, event.target.value);
                            }}
                            maxLength={600}
                            disabled={pending || !draftReady}
                            placeholder="Your Class 11–12 stream"
                            className="min-h-[48px] w-full rounded-lg border border-[#dfe2dd] bg-white px-4 text-sm text-[#293032] outline-none transition placeholder:text-[#858b89] focus:border-[#438573] focus:ring-2 focus:ring-[#dcebe3] disabled:bg-[#f7f7f5]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </fieldset>

            {kind === "class10" && <div className="mt-8">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={contextId}
                onClick={() => setExpanded((previous) => !previous)}
                disabled={pending || !draftReady}
                className="inline-flex min-h-10 items-center gap-3 rounded-lg text-base font-medium text-[#347966] transition hover:text-[#245f52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2 disabled:opacity-60"
              >
                <Plus aria-hidden="true" className={`h-6 w-6 transition-transform ${expanded ? "rotate-45" : ""}`} strokeWidth={1.8} />
                Tell us more in your own words
              </button>
              <div id={contextId} hidden={!expanded} className="mt-3">
                <label htmlFor={textId} className="sr-only">Tell us more in your own words (optional)</label>
                <textarea
                  id={textId}
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
            </div>}
            <p className="mt-3 text-sm text-[#747a79]">{config.afterHelper}</p>

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

export function Class10EducationPage(props: Props) {
  return <EducationSelectionPage {...props} kind="class10" />;
}

export function Class12EducationPage(props: Props) {
  return <EducationSelectionPage {...props} kind="class12" />;
}
