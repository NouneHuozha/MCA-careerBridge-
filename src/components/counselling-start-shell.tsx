import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { Logo } from "@/components/logo";

const steps = [
  "Where you are now",
  "What interests you",
  "What you bring",
  "What matters to you",
  "What we understood",
];

export function CounsellingStartHeader({ rightControl }: { rightControl: ReactNode }) {
  return (
    <header className="flex min-h-[72px] items-center justify-between border-b border-[#e9e8e4] bg-white px-5 sm:px-8 lg:px-16">
      <Logo size="md" />
      {rightControl}
    </header>
  );
}

export function CounsellingJourneyMap({
  activeStep,
  variant = "position",
}: {
  activeStep: number;
  variant?: "orientation" | "position";
}) {
  const orientation = variant === "orientation";
  return (
    <aside
      aria-label="Counselling journey progress"
      className={`self-start rounded-xl border border-[#e7e6e2] bg-white px-6 py-6 ${orientation ? "sm:px-9 sm:py-8 lg:min-h-[680px] lg:px-9 lg:py-9" : "sm:px-8 sm:py-8 lg:min-h-[672px] lg:px-5 lg:py-7"}`}
    >
      <h2 className="text-xl font-semibold tracking-[-0.025em] sm:text-[23px]">Your counselling journey</h2>
      <ol className="mt-6 sm:mt-7" aria-label="Five steps in your counselling journey">
        {steps.map((step, index) => {
          const active = index === activeStep;
          return (
            <li
              key={step}
              className={`relative flex min-h-[72px] items-start gap-5 last:min-h-0 ${orientation ? "sm:gap-7" : "sm:gap-6"} ${active && !orientation ? "rounded-lg bg-[#f2f5f1] px-3 py-1" : ""}`}
            >
              {index < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-[49px] h-[25px] border-l border-dashed border-[#c9d2ce] ${!orientation ? "left-[29px]" : "left-[17px] sm:left-[18px]"}`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative z-10 grid h-[36px] w-[36px] shrink-0 place-items-center rounded-full border text-sm font-semibold ${active ? "border-[#397e70] bg-[#397e70] text-white" : "border-[#e1e2de] bg-white text-[#4c5354]"}`}
              >
                {index + 1}
              </span>
              <span
                aria-current={active ? "step" : undefined}
                className={`pt-[7px] text-[15px] sm:text-base ${active ? "font-semibold text-[#1e2729]" : "text-[#666b6c]"}`}
              >
                {step}
                {active && <span className="sr-only"> — current step</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <div className={`border-t border-[#e8e8e4] pt-5 ${orientation ? "mt-5 sm:mt-7 sm:pt-6" : "mt-4 sm:mt-6 sm:pt-5"}`}>
        <p className="flex items-start gap-3 text-sm leading-relaxed text-[#787d7c]">
          <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#858b89]" strokeWidth={1.8} />
          <span>This is your progress through the conversation, not a score.</span>
        </p>
      </div>
    </aside>
  );
}
