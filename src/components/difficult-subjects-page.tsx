"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, ChevronDown, FlaskConical, Laptop, Palette } from "lucide-react";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";
import { SUBJECT_GROUPS, SUBJECT_OPTIONS, type Stage } from "@/data/counselling";

type Answer = { values: string[]; text: string | null };
type GroupKey = (typeof SUBJECT_GROUPS)[number]["key"];
type SubjectGroup = { key: GroupKey; label: string; values: string[]; icon: typeof FlaskConical };

type Props = {
  sessionId: number;
  stage: Stage;
  initialAnswer: Answer | null;
  answered: number;
  returnTo?: string;
};

const groupValues: Record<GroupKey, string[]> = {
  "science-and-mathematics": ["mathematics", "physics", "chemistry", "biology"],
  "technology-and-computing": ["computer-science", "information-technology"],
  "languages-and-society": ["english", "social-science", "history", "political-science", "geography"],
  "business-and-creative-subjects": ["economics", "commerce", "arts"],
};

const difficultyGroups: SubjectGroup[] = SUBJECT_GROUPS.map((group, index) => ({
  key: group.key,
  label: group.label,
  values: groupValues[group.key],
  icon: [FlaskConical, Laptop, BookOpen, Palette][index],
}));

const subjectLabel = new Map(SUBJECT_OPTIONS.map((option) => [option.value, option.label]));
const DRAFT_PREFIX = "careerbridge:counselling-draft:subjects_difficult";
const OPTIONS = new Set([...SUBJECT_OPTIONS.map((option) => option.value), "other", "prefer-not"]);

export function DifficultSubjectsPage({ sessionId, stage, initialAnswer, answered, returnTo }: Props) {
  const router = useRouter();
  const detailsPath = returnTo === "/guidance/review/details" ? returnTo : "/guidance/review/details";
  const [selected, setSelected] = useState<string[]>(() => {
    const values = initialAnswer?.values ?? [];
    if (values.includes("prefer-not") || values.includes("not-sure")) return ["prefer-not"];
    return values;
  });
  const [other, setOther] = useState(initialAnswer?.text ?? "");
  const [openGroups, setOpenGroups] = useState<string[]>([difficultyGroups[0].key]);
  const [draftReady, setDraftReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const draftKey = `${DRAFT_PREFIX}:${sessionId}`;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.sessionStorage.getItem(draftKey) ?? window.sessionStorage.getItem(DRAFT_PREFIX);
        if (raw) {
          const draft = JSON.parse(raw) as { values?: unknown; other?: unknown; text?: unknown };
          if (Array.isArray(draft.values) && draft.values.every((value) => typeof value === "string")) {
            const normalized = draft.values.map((value) => value === "not-sure" ? "prefer-not" : value).filter((value) => OPTIONS.has(value));
            const restored = normalized.includes("prefer-not") ? ["prefer-not"] : normalized;
            setSelected(restored);
            const open = difficultyGroups.filter((group) => group.values.some((value) => restored.includes(value))).map((group) => group.key);
            setOpenGroups(open.length ? open : [difficultyGroups[0].key]);
          }
          if (typeof draft.other === "string") setOther(draft.other);
          else if (typeof draft.text === "string") setOther(draft.text);
        }
      } catch {
        // The server answer remains usable if local draft storage is unavailable or malformed.
      } finally {
        setDraftReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [draftKey]);

  function persistDraft(values: string[], detail: string) {
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify({ values, other: detail }));
    } catch {
      // The answer can still be submitted if browser storage is unavailable.
    }
  }

  function toggle(value: string) {
    setSelected((current) => {
      let next: string[];
      if (value === "prefer-not") {
        next = current.includes(value) ? [] : [value];
      } else {
        const choices = current.filter((item) => item !== "prefer-not");
        next = choices.includes(value) ? choices.filter((item) => item !== value) : [...choices, value];
      }
      persistDraft(next, other);
      setError(null);
      return next;
    });
  }

  async function save(destination: "details" | "review", action: "answer" | "skip" = "answer") {
    if (busy.current || !draftReady) return;
    busy.current = true;
    setPending(true);
    setError(null);
    try {
      const effectiveAction = action === "skip" || selected.length === 0 ? "skip" : "answer";
      const response = await fetch("/api/counselling", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action: effectiveAction,
          questionKey: "subjects_difficult",
          values: effectiveAction === "answer" ? selected : [],
          text: effectiveAction === "answer" && selected.includes("other") ? other.trim() || null : null,
          stage,
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok || result.error) throw new Error(result.error ?? "We couldn’t save that answer. Please try again.");
      try { window.sessionStorage.removeItem(draftKey); window.sessionStorage.removeItem(DRAFT_PREFIX); } catch { /* A successful save remains successful. */ }
      router.push(destination === "details" ? detailsPath : "/guidance/review");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The connection was interrupted. Your earlier answers are safe—please try again.");
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  const headerAction = (
    <button
      type="button"
      onClick={() => void save("review")}
      disabled={pending || !draftReady}
      aria-label="Save and return later"
      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium text-[#263439] transition hover:bg-[#f5f8f6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#397e70] disabled:opacity-60 sm:gap-3 sm:px-3 sm:text-base"
    >
      <Bookmark aria-hidden className="h-5 w-5 text-[#397e70]" strokeWidth={1.8} />
      <span>{pending ? "Saving…" : "Save and return later"}</span>
    </button>
  );

  return (
    <CounsellingJourneyShell
      currentSection="reflection"
      completedSections={counsellingStages.filter((item) => item.key !== "reflection").map((item) => item.key)}
      progress={{ current: answered, total: answered }}
      variant="grouped"
      headerAction={headerAction}
    >
      <main className="min-w-0 pb-5" aria-labelledby="difficult-subjects-heading">
        <header className="mb-5 sm:mb-6">
          <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">Step 5 of 5 · Optional</p>
          <h1 id="difficult-subjects-heading" className="mt-4 font-semibold text-[clamp(1.9rem,3vw,2.8rem)] leading-[1.06] tracking-[-.045em] text-[#111827]">Are there subjects you find difficult right now?</h1>
          <p className="mt-3 max-w-[900px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">This does not judge your ability. It helps us keep current challenges in mind.</p>
        </header>

        <form onSubmit={(event) => { event.preventDefault(); void save("details"); }}>
          <fieldset disabled={pending || !draftReady}>
            <legend className="sr-only">Subjects you find difficult right now</legend>
            <div className="space-y-2">
              {difficultyGroups.map((group) => {
                const Icon = group.icon;
                const expanded = openGroups.includes(group.key);
                const panelId = `difficult-subjects-${group.key}`;
                const values = group.key === "science-and-mathematics" && selected.includes("science")
                  ? [...group.values, "science"]
                  : group.values;
                return (
                  <section key={group.key} className="overflow-hidden rounded-lg border border-[#e8e8e4] bg-white">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setOpenGroups((current) => expanded ? current.filter((key) => key !== group.key) : [...current, group.key])}
                      className="flex min-h-[74px] w-full items-center gap-3 px-3.5 text-left transition hover:bg-[#fafbf9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#397e70] sm:gap-4 sm:px-5"
                    >
                      <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#edf6f2] text-[#287b6b] sm:h-11 sm:w-11"><Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.8} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold leading-snug text-[#20272b]">{group.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-[#68758a] sm:text-sm">Select any subjects you find difficult right now.</span>
                      </span>
                      <ChevronDown aria-hidden className={`h-5 w-5 shrink-0 text-[#4c5556] transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </button>
                    <div id={panelId} hidden={!expanded} role="group" aria-label={group.label} className="border-t border-[#ecebe7] px-4 py-2 sm:pl-[5.6rem] sm:pr-5">
                      {values.map((value) => {
                        const checked = selected.includes(value);
                        return (
                          <label key={value} className={`flex min-h-[36px] cursor-pointer items-center gap-3 rounded-md px-1.5 text-sm text-[#303638] transition hover:bg-[#f7faf8] sm:text-[15px] ${checked ? "bg-[#f0f7f3]" : ""}`}>
                            <input type="checkbox" checked={checked} onChange={() => toggle(value)} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
                            <span>{subjectLabel.get(value) ?? value}</span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <div className={`overflow-hidden rounded-lg border bg-white transition ${selected.includes("other") ? "border-[#7eaa9a] bg-[#f7faf8]" : "border-[#e8e8e4]"}`}>
                <label className="flex min-h-[64px] cursor-pointer items-center gap-3 px-4 text-sm text-[#303638] transition hover:bg-[#fafbf9] sm:px-5 sm:text-[15px]">
                  <input type="checkbox" checked={selected.includes("other")} onChange={() => toggle("other")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">Something else</span>
                    <span className="mt-0.5 block text-xs leading-snug text-[#68758a] sm:text-sm">Tell us about another subject you find difficult.</span>
                  </span>
                </label>
                {selected.includes("other") && <div className="border-t border-[#e4e8e4] px-4 py-3 sm:pl-14 sm:pr-5">
                  <label htmlFor="difficult-subjects-other" className="mb-1.5 block text-sm font-medium text-[#454c4d]">Tell us about another subject you find difficult <span className="font-normal text-[#777d7d]">(optional)</span></label>
                  <input
                    id="difficult-subjects-other"
                    value={other}
                    onChange={(event) => { const value = event.target.value; setOther(value); persistDraft(selected, value); }}
                    maxLength={600}
                    placeholder="Add a subject (optional)"
                    className="min-h-11 w-full rounded-lg border border-[#d9d9d5] bg-white px-3.5 text-sm text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20"
                  />
                </div>}
              </div>

              <label className={`flex min-h-[64px] cursor-pointer items-center gap-3 rounded-lg border px-4 text-sm transition sm:px-5 sm:text-[15px] ${selected.includes("prefer-not") ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e8e8e4] bg-white hover:bg-[#fafbf9]"}`}>
                <input type="checkbox" checked={selected.includes("prefer-not")} onChange={() => toggle("prefer-not")} className="h-5 w-5 shrink-0 accent-[#287d6c]" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-[#303638]">Prefer not to say</span>
                  <span className="mt-0.5 block text-xs leading-snug text-[#68758a] sm:text-sm">You can choose not to answer this question.</span>
                </span>
              </label>
            </div>
          </fieldset>

          <p className="mt-3 flex items-center gap-2 text-sm text-[#68758a]"><span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full border border-[#89939a] text-[11px] font-semibold">i</span>Optional — you can skip this.</p>
          {error && <p role="alert" className="mt-4 rounded-lg border border-[#e7c9be] bg-[#fff4ef] px-4 py-3 text-sm font-medium text-[#8b4431]">{error}</p>}

          <nav aria-label="Difficult subjects navigation" className="mt-5 flex flex-col gap-3 border-t border-[#e4e8e7] pt-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={detailsPath} className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-sm font-medium text-[#263b55] transition hover:text-[#176b62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
              <ArrowLeft aria-hidden className="h-5 w-5" />Back to additional details
            </Link>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-4">
              <button type="button" onClick={() => void save("details", "skip")} disabled={pending || !draftReady} className="inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold text-[#287669] transition hover:text-[#14584e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] disabled:opacity-60">Skip for now</button>
              <button type="submit" disabled={pending || !draftReady} className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-[#087663] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#066555] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61] disabled:opacity-60">
                {pending ? "Saving…" : "Save and return"}<ArrowRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </form>
      </main>
    </CounsellingJourneyShell>
  );
}
