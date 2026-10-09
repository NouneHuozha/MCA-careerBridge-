"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sprout } from "lucide-react";
import type { Stage, StageDetail } from "@/data/counselling";

const draftKey = "careerbridge-current-position-draft";

type SubmitAction = (formData: FormData) => void | Promise<void>;

const stages: { value: Stage; label: string }[] = [
  { value: "class10", label: "I’m currently in Class 10" },
  { value: "class12", label: "I’m currently in Class 12" },
];

const statusOptions: { value: StageDetail; label: string }[] = [
  { value: "studying", label: "I’m still studying" },
  { value: "completed", label: "I’ve completed it" },
  { value: "awaiting_results", label: "I’m waiting for results" },
  { value: "deciding", label: "I’m taking some time to decide what comes next" },
];

export function CurrentPositionForm({
  initialStage,
  initialStageDetail,
  submitAction,
}: {
  initialStage: Stage | null;
  initialStageDetail: string | null;
  submitAction: SubmitAction;
}) {
  const [stage, setStage] = useState<Stage | "">(initialStage ?? "");
  const [stageDetail, setStageDetail] = useState<StageDetail | "">(
    statusOptions.some((option) => option.value === initialStageDetail)
      ? (initialStageDetail as StageDetail)
      : "",
  );
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const hasSavedSession = Boolean(initialStage);
      if (hasSavedSession) {
        window.sessionStorage.removeItem(draftKey);
      } else {
        try {
          const value = window.sessionStorage.getItem(draftKey);
          if (value) {
            const draft = JSON.parse(value) as { stage?: string; stageDetail?: string };
            if (stages.some((option) => option.value === draft.stage)) setStage(draft.stage as Stage);
            if (statusOptions.some((option) => option.value === draft.stageDetail)) setStageDetail(draft.stageDetail as StageDetail);
          }
        } catch {
          window.sessionStorage.removeItem(draftKey);
        }
      }
      setDraftLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialStage, initialStageDetail]);

  useEffect(() => {
    if (!draftLoaded) return;
    if (!stage && !stageDetail) {
      window.sessionStorage.removeItem(draftKey);
      return;
    }
    window.sessionStorage.setItem(draftKey, JSON.stringify({ stage, stageDetail }));
  }, [draftLoaded, stage, stageDetail]);

  function updateStage(value: Stage) {
    setStage(value);
    window.sessionStorage.setItem(draftKey, JSON.stringify({ stage: value, stageDetail }));
  }

  function updateStatus(value: StageDetail) {
    setStageDetail(value);
    window.sessionStorage.setItem(draftKey, JSON.stringify({ stage, stageDetail: value }));
  }

  return (
    <form id="current-position-form" action={submitAction} className="min-w-0" aria-label="Your current position">
      <input type="hidden" name="stage" value={stage} />
      <input type="hidden" name="stageDetail" value={stageDetail} />

      <fieldset>
        <legend className="text-lg font-semibold tracking-[-0.02em] text-[#124339] sm:text-xl">Which stage sounds like you?</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stages.map((option) => (
            <label
              key={option.value}
              className="group relative flex min-h-[76px] cursor-pointer items-center gap-5 rounded-xl border border-[#e0e1dc] bg-white px-5 py-4 text-[15px] font-medium text-[#293032] transition hover:border-[#8db3a7] has-[:checked]:border-[#438573] has-[:checked]:bg-[#f4f8f5] has-[:checked]:shadow-[0_0_0_1px_#438573] focus-within:ring-2 focus-within:ring-[#438573] focus-within:ring-offset-2 sm:px-6"
            >
              <input
                type="radio"
                name="stageChoice"
                value={option.value}
                checked={stage === option.value}
                onChange={() => updateStage(option.value)}
                required
                className="peer sr-only"
                aria-label={option.label}
              />
              <span aria-hidden="true" className="pointer-events-none grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#a5aaa7] bg-white text-transparent transition peer-checked:border-[#397e70] peer-checked:bg-[#397e70] peer-checked:text-white">
                {stage === option.value ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
              </span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-8 sm:mt-9">
        <legend className="text-lg font-semibold tracking-[-0.02em] text-[#124339] sm:text-xl">What describes you right now?</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {statusOptions.map((option) => (
            <label
              key={option.value}
              className="group flex min-h-[68px] cursor-pointer items-center gap-5 rounded-xl border border-[#e0e1dc] bg-white px-5 py-4 text-[15px] leading-snug text-[#293032] transition hover:border-[#8db3a7] has-[:checked]:border-[#438573] has-[:checked]:bg-[#f4f8f5] has-[:checked]:shadow-[0_0_0_1px_#438573] focus-within:ring-2 focus-within:ring-[#438573] focus-within:ring-offset-2 sm:px-6"
            >
              <input
                type="radio"
                name="statusChoice"
                value={option.value}
                checked={stageDetail === option.value}
                onChange={() => updateStatus(option.value)}
                required
                className="peer sr-only"
                aria-label={option.label}
              />
              <span aria-hidden="true" className="pointer-events-none grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-[#a5aaa7] bg-white text-transparent transition peer-checked:border-[#397e70] peer-checked:bg-[#397e70] peer-checked:text-white">
                {stageDetail === option.value ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
              </span>
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 flex items-center gap-4 rounded-xl bg-[#eaf4ee] px-4 py-4 text-sm leading-relaxed text-[#47796d] sm:px-5">
        <Sprout aria-hidden="true" className="h-8 w-8 shrink-0" strokeWidth={1.7} />
        <p>We’ll use this only to show questions and routes that make sense for your stage.</p>
      </div>

      <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#e5e5df] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/start"
          className="inline-flex min-h-11 items-center gap-2 self-start rounded-lg px-1 text-base font-medium text-[#656b6b] transition hover:text-[#273331] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
          Back
        </Link>
        <button
          type="submit"
          name="intent"
          value="continue"
          className="group inline-flex min-h-[58px] items-center justify-center gap-5 rounded-xl bg-[#397e70] px-7 text-base font-semibold text-white transition hover:bg-[#2f6d61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2 sm:min-w-[205px]"
        >
          Continue
          <ArrowRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}
