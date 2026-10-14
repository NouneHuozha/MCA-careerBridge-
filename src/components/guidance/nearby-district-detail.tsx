"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";
import { NAGALAND_DISTRICTS } from "@/data/institutions";
import type { Stage } from "@/data/counselling";

const DETAILS_PATH = "/guidance/review/details";
const DRAFT_KEY = "careerbridge:counselling-draft:home_district";
const NOT_SURE = "not-sure";
const PREFER_NOT = "prefer-not";

// Keep the reference order for the districts pictured in Drive; remaining current districts
// stay available below them so the visual matches without making the list incomplete.
const REFERENCE_ORDER = [
  "Dimapur",
  "Kohima",
  "Mokokchung",
  "Mon",
  "Peren",
  "Phek",
  "Tuensang",
  "Wokha",
  "Zunheboto",
  "Chümoukedima",
  "Niuland",
  "Tseminyü",
];
const REFERENCE_DISTRICTS = REFERENCE_ORDER.filter((district) => NAGALAND_DISTRICTS.includes(district));
const OTHER_DISTRICTS = NAGALAND_DISTRICTS
  .filter((district) => !REFERENCE_DISTRICTS.includes(district))
  .sort((left, right) => left.localeCompare(right));
const DISTRICTS = [...REFERENCE_DISTRICTS, ...OTHER_DISTRICTS];
const SELECTABLE_VALUES = new Set([...DISTRICTS, NOT_SURE, PREFER_NOT]);

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
}

function districtLabel(district: string) {
  // Match the spelling shown in the Drive reference while retaining the stored catalogue value.
  return district === "Tseminyü" ? "Tseminyu" : district;
}

type Answer = { values: string[]; text: string | null };
type Props = {
  stage: Stage;
  initialAnswer: Answer | null;
  answered: number;
  returnTo?: typeof DETAILS_PATH | "/guidance/review";
};
type SaveResponse = { error?: string };

export function NearbyDistrictDetail({ stage, initialAnswer, answered, returnTo = DETAILS_PATH }: Props) {
  const router = useRouter();
  const busy = useRef(false);
  const [selected, setSelected] = useState(initialAnswer?.values[0] ?? "");
  const [search, setSearch] = useState("");
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

  const searchTerm = normalizeSearch(search);
  const filteredDistricts = DISTRICTS.filter((district) => normalizeSearch(district).includes(searchTerm));

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
          questionKey: "home_district",
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
      <main className="flex min-h-[calc(100svh-160px)] min-w-0 flex-col pb-5" aria-labelledby="nearby-district-heading">
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={(event) => void save(event)}>
          <header>
            <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">
              Step 5 of 5 · Optional
            </p>
            <h1 id="nearby-district-heading" className="mt-4 font-semibold text-[clamp(2rem,3.5vw,3.1rem)] leading-[1.06] tracking-[-.045em] text-[#111827]">
              Which district are you closest to?
            </h1>
            <p className="mt-3 max-w-[900px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">
              This helps us understand nearby study options and travel distance. We do not need your exact address.
            </p>
          </header>

          <fieldset className="mt-5 min-w-0 rounded-lg border border-[#e4e3df] bg-white p-4 sm:p-5" aria-describedby={error ? "district-error" : undefined}>
            <legend className="px-1 text-base font-semibold text-[#20272b] sm:text-lg">Choose your district</legend>
            <label htmlFor="district-search" className="sr-only">Search districts</label>
            <div className="relative mt-2">
              <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#717a79]" />
              <input
                id="district-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search districts"
                className="min-h-[52px] w-full rounded-md border border-[#c9ccca] bg-white py-2 pl-12 pr-4 text-base text-[#20272b] outline-none transition placeholder:text-[#858a89] focus:border-[#397e70] focus:ring-2 focus:ring-[#397e70]/20"
              />
            </div>

            {filteredDistricts.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {filteredDistricts.map((district) => <label
                key={district}
                className={`flex min-h-12 cursor-pointer items-center gap-4 rounded-md border px-3.5 text-sm transition sm:text-base ${selected === district ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e9ece7] bg-white hover:bg-[#fafbf9]"}`}
              >
                <input
                  type="radio"
                  name="home-district"
                  value={district}
                  checked={selected === district}
                  onChange={() => choose(district)}
                  className="h-5 w-5 shrink-0 accent-[#287d6c]"
                />
                <span className="font-medium text-[#20272b]">{districtLabel(district)}</span>
              </label>)}
            </div> : <p className="mt-4 rounded-md bg-[#fafbf9] px-4 py-5 text-sm text-[#68758a]" role="status">No districts match that search. Try another name.</p>}

            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                { value: NOT_SURE, label: "I’m not sure" },
                { value: PREFER_NOT, label: "Prefer not to say" },
              ].map((option) => <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center gap-4 rounded-md border px-3.5 text-sm transition sm:text-base ${selected === option.value ? "border-[#76ad9b] bg-[#f0f7f3]" : "border-[#e9ece7] bg-white hover:bg-[#fafbf9]"}`}
              >
                <input
                  type="radio"
                  name="home-district"
                  value={option.value}
                  checked={selected === option.value}
                  onChange={() => choose(option.value)}
                  className="h-5 w-5 shrink-0 accent-[#287d6c]"
                />
                <span className="font-medium text-[#20272b]">{option.label}</span>
              </label>)}
            </div>
          </fieldset>

          {(!online || error) && <p id="district-error" className="mt-4 rounded-lg border border-[#e8d9c8] bg-[#fffaf2] px-4 py-3 text-sm leading-relaxed text-[#665641]" role="alert">
            {!online && !error ? "You’re offline. Reconnect to save this detail. Your earlier answers are safe." : error}
          </p>}

          <nav aria-label="Nearby district actions" className="mt-auto flex flex-col gap-3 border-t border-[#e4e8e7] pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
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
