import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  House,
  Landmark,
  MapPin,
  Pencil,
  Star,
  Info,
  type LucideIcon,
} from "lucide-react";
import { CounsellingJourneyShell } from "@/components/counselling-journey";
import { counsellingStages } from "@/data/counselling-journey";

const DETAILS_PATH = "/guidance/review/details";

type OptionalAnswer = { values: string[]; text: string | null };
type OptionalDetail = { key: string; title: string; description: string; questionKey: string; icon: LucideIcon };

const optionalDetails: OptionalDetail[] = [
  {
    key: "subjects-difficult",
    title: "Subjects I find difficult",
    description: "This helps us keep current challenges in mind.",
    questionKey: "subjects_difficult",
    icon: BookOpen,
  },
  {
    key: "recent-enjoyment",
    title: "Something I enjoyed recently",
    description: "A recent activity can add useful context.",
    questionKey: "interest_story",
    icon: Star,
  },
  {
    key: "nearby-district",
    title: "Nearby district",
    description: "Helps us understand nearby study options and travel distance.",
    questionKey: "home_district",
    icon: MapPin,
  },
  {
    key: "scholarship-information",
    title: "Scholarship information",
    description: "Tell us whether scholarship information would be useful.",
    questionKey: "scholarship_need",
    icon: GraduationCap,
  },
  {
    key: "institution-preference",
    title: "Institution preference",
    description: "Government, private, or either is fine.",
    questionKey: "institution_pref",
    icon: Landmark,
  },
  {
    key: "hostel-requirement",
    title: "Hostel requirement",
    description: "Let us know if staying away from home may be needed.",
    questionKey: "hostel",
    icon: House,
  },
  {
    key: "anything-else",
    title: "Anything else",
    description: "Share a situation, concern, hope, or question in your own words.",
    questionKey: "anything_else",
    icon: Pencil,
  },
];

function questionHref(questionKey: string) {
  return `/counselling?edit=${encodeURIComponent(questionKey)}&returnTo=${encodeURIComponent(DETAILS_PATH)}`;
}

export function OptionalDetailsContent({ answers, answered }: { answers: Record<string, OptionalAnswer>; answered: number }) {
  const completedSections = counsellingStages
    .filter((stage) => stage.key !== "reflection")
    .map((stage) => stage.key);

  return (
    <CounsellingJourneyShell
      currentSection="reflection"
      completedSections={completedSections}
      progress={{ current: answered, total: answered }}
      variant="grouped"
    >
      <main className="min-w-0 pb-5" aria-labelledby="optional-details-heading">
        <header>
          <p className="inline-flex rounded-full bg-[#edf6f2] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[.09em] text-[#1b7165]">
            Step 5 of 5 · Optional
          </p>
          <h1 id="optional-details-heading" className="mt-4 font-semibold text-[clamp(2rem,3.5vw,3.1rem)] leading-[1.06] tracking-[-.045em] text-[#111827]">
            Add anything else that may help
          </h1>
          <p className="mt-3 max-w-[900px] text-[clamp(1rem,1.35vw,1.15rem)] leading-relaxed text-[#68758a]">
            You do not need to answer everything. Add only what feels useful, and you can skip anything.
          </p>
        </header>

        <aside role="note" className="mt-4 flex items-start gap-4 rounded-lg border border-[#e7eae5] bg-[#fafbf9] px-4 py-3.5 sm:px-5">
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-[#317b6c]">
            <Info className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold leading-snug text-[#20272b]">We are not asking the same questions again.</p>
            <p className="mt-1 text-sm leading-relaxed text-[#68758a]">This page is only for a few additional details that can help us understand you better.</p>
          </div>
        </aside>

        <section
          role="region"
          aria-label="Optional details list"
          tabIndex={0}
          className="mt-4 max-h-[50vh] overflow-y-auto overscroll-contain rounded-lg border border-[#e7eae5] bg-[#fafbf9] p-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] sm:p-3 md:max-h-[420px]"
        >
        <ul aria-label="Optional details you can add" className="space-y-1.5">
          {optionalDetails.map(({ key, title, description, questionKey, icon: Icon }) => {
            const answer = answers[questionKey];
            const hasAnswer = Boolean(answer && (answer.values.length > 0 || answer.text?.trim()));
            const action = hasAnswer ? "Edit" : "Add";
            return (
              <li key={key} className="flex min-h-[68px] min-w-0 items-center gap-3 rounded-lg border border-[#e9ece7] bg-white/80 px-3.5 py-2.5 sm:gap-4 sm:px-5">
                <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f3ee] text-[#317b6c] sm:h-11 sm:w-11">
                  <Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold leading-snug text-[#20272b]">{title}</h2>
                  <p className="mt-0.5 text-xs leading-snug text-[#68758a] sm:text-sm">{description}</p>
                </div>
                <Link
                  href={questionHref(questionKey)}
                  aria-label={`${action} ${title}`}
                  className="inline-flex min-h-9 w-[76px] shrink-0 items-center justify-center rounded-md border border-[#a9c8bf] bg-white px-3 text-sm font-semibold text-[#287669] transition hover:bg-[#f1f8f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] sm:w-[90px]"
                >
                  {action}
                </Link>
              </li>
            );
          })}
        </ul>
        </section>

        <nav aria-label="Optional detail navigation" className="mt-5 flex flex-col gap-3 border-t border-[#e4e8e7] pt-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/guidance/review" className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-sm font-medium text-[#263b55] transition hover:text-[#176b62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
            <ArrowLeft aria-hidden className="h-5 w-5" />Back to review
          </Link>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Link href="/guidance/review" className="inline-flex min-h-10 items-center justify-center px-3 text-sm font-semibold text-[#287669] transition hover:text-[#14584e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
              Skip for now
            </Link>
            <Link href="/guidance/review" className="inline-flex min-h-[54px] items-center justify-center gap-3 rounded-lg bg-[#087663] px-5 py-3 text-center text-sm font-semibold text-white shadow-[0_4px_10px_-7px_#163c35] transition hover:bg-[#066555] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286b61]">
              Save and return to review<ArrowRight aria-hidden className="h-5 w-5" />
            </Link>
          </div>
        </nav>
      </main>
    </CounsellingJourneyShell>
  );
}
