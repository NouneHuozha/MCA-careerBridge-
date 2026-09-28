"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Laptop, MapPin, Pencil, Sprout } from "lucide-react";
import { PostCounsellingHeader } from "@/components/post-counselling-header";

export type ProfileReviewCard = {
  id: string;
  title: string;
  icon: "education" | "interests" | "priorities" | "practical";
  youTold: string[];
  understood: string;
  stillUnclear?: string;
  editHref: string;
};

function CardIcon({ name }: { name: ProfileReviewCard["icon"] }) {
  const iconClass = "h-[21px] w-[21px]";
  if (name === "education") return <GraduationCap aria-hidden className={iconClass} strokeWidth={1.6} />;
  if (name === "interests") return <Laptop aria-hidden className={iconClass} strokeWidth={1.6} />;
  if (name === "priorities") return <Sprout aria-hidden className={iconClass} strokeWidth={1.6} />;
  return <MapPin aria-hidden className={iconClass} strokeWidth={1.6} />;
}

function ReviewCard({ card }: { card: ProfileReviewCard }) {
  return (
    <article aria-labelledby={`review-${card.id}`} className="rounded-[14px] border border-[#e8e5dc] bg-white/90 px-4 py-4 shadow-[0_3px_14px_-12px_rgba(43,65,52,.28)] sm:px-5 sm:py-[18px]">
      <div className="grid grid-cols-[44px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[60px_minmax(0,1fr)] sm:gap-5">
        <span aria-hidden="true" className="mt-1 grid h-11 w-11 place-items-center rounded-full bg-[#edf3e9] text-[#315f58] sm:h-[54px] sm:w-[54px]">
          <CardIcon name={card.icon} />
        </span>
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h2 id={`review-${card.id}`} className="font-serif text-[19px] leading-[1.2] tracking-[-.025em] text-[#1f2925] sm:text-[21px]">{card.title}</h2>
            <Link href={card.editHref} aria-label={`Edit ${card.title}`} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-[#315f58] underline decoration-[#9bb9aa] underline-offset-4 transition-colors hover:bg-[#f2f6ef] hover:text-[#174d40] focus-visible:outline-offset-2">
              <Pencil aria-hidden className="h-3.5 w-3.5 sm:hidden" />
              <span>Edit</span>
            </Link>
          </div>

          <div className="mt-3 grid gap-3 border-t border-[#eeece5] pt-3 sm:mt-2 sm:grid-cols-2 sm:gap-0 sm:border-t-0 sm:pt-0">
            <section aria-label="You told us" className="min-w-0 sm:pr-6">
              <p className="text-[9px] font-medium uppercase tracking-[.13em] text-[#717770]">You told us</p>
              <ul className="mt-1 space-y-0.5 text-[14px] leading-[1.45] text-[#2c302d]">
                {card.youTold.map((item, index) => <li key={`${card.id}-told-${index}`} className="break-words">{item}</li>)}
              </ul>
            </section>
            <section aria-label="We understood" className="min-w-0 border-t border-[#eeece5] pt-3 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <p className="text-[9px] font-medium uppercase tracking-[.13em] text-[#717770]">We understood</p>
              <p className="mt-1 text-[14px] leading-[1.45] text-[#2c302d]">{card.understood}</p>
            </section>
          </div>

          {card.stillUnclear && (
            <p className="mt-3 border-t border-dashed border-[#e8e5dc] pt-2.5 text-[12px] leading-relaxed text-[#64746c]">
              <span className="mr-1 font-semibold text-[#596b61]">Still to learn:</span>{card.stillUnclear}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProfileReviewExperience({ cards, editAllHref }: { cards: ProfileReviewCard[]; editAllHref: string }) {
  const [reviewed, setReviewed] = useState(false);

  return (
    <div className="min-h-full bg-[#fbfaf4] text-[#26312c]">
      <PostCounsellingHeader activeHref="/profile" />
      <section aria-labelledby="profile-review-title" className="px-4 pb-12 pt-6 sm:px-7 sm:pb-16 sm:pt-8 lg:px-10">
        <div className="mx-auto max-w-[920px]">
          <div className="flex justify-end">
            <Link href={editAllHref} className="inline-flex min-h-10 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-[#315f58] underline decoration-[#a8c0b2] underline-offset-4 transition-colors hover:bg-[#f0f4ec] focus-visible:outline-offset-2">
              <Pencil aria-hidden className="h-3.5 w-3.5" />Edit answers
            </Link>
          </div>

          <header className="mx-auto mt-3 max-w-[760px] text-center">
            <h1 id="profile-review-title" className="font-serif text-[clamp(2.25rem,5vw,3.15rem)] leading-[1.06] tracking-[-.045em] text-[#171d1a]">Here’s what we understood</h1>
            <p className="mx-auto mt-3 max-w-[68ch] text-[14px] leading-relaxed text-[#4c514d] sm:text-[15px]">This is a starting picture, not a final judgement. Check each section and change anything that does not feel right.</p>
          </header>

          <div className="mt-7 space-y-2.5 sm:mt-8 sm:space-y-2.5">
            {cards.map((card) => <ReviewCard key={card.id} card={card} />)}
          </div>

          <div className="mx-auto mt-5 flex max-w-[420px] flex-col items-center">
            <button type="button" onClick={() => setReviewed(true)} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[7px] bg-[#315f58] px-5 py-2.5 font-serif text-[15px] text-white shadow-[0_2px_5px_rgba(29,68,57,.16)] transition-colors hover:bg-[#254f48] focus-visible:outline-offset-4 active:translate-y-px sm:max-w-[318px]">
              This looks right — continue <ArrowRight aria-hidden className="h-4 w-4" />
            </button>
            {reviewed && <p role="status" className="mt-3 max-w-[44ch] text-center text-[13px] leading-relaxed text-[#315f58]">Thanks for checking. Your answers remain editable whenever you need to revisit them.</p>}
            <Link href={editAllHref} className="mt-1 inline-flex min-h-10 items-center justify-center px-3 text-[13px] text-[#315f58] underline decoration-[#a8c0b2] underline-offset-4 transition-colors hover:text-[#174d40] focus-visible:outline-offset-2">Go back and change an answer</Link>
            <p className="mt-1 border-t border-[#e9e6dc] pt-2 text-center text-[11px] leading-relaxed text-[#747970]">You can update this later. Your saved explorations will not be deleted.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
