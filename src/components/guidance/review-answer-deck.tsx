"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { BookOpen, ChevronRight, Compass, GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import { ReviewMoreDetailsCard } from "@/components/guidance/review-more-details-card";

export type ReviewDeckItem = { label: string; value: string; href: string };
export type ReviewDeckSection = {
  id: "now" | "interests" | "priorities";
  label: string;
  title: string;
  description: string;
  tone: "mint" | "sky" | "sun";
  items: ReviewDeckItem[];
};

type DetailItem = { label: string; value: string };

const sectionIcons: Record<ReviewDeckSection["id"], LucideIcon> = {
  now: GraduationCap,
  interests: Compass,
  priorities: Sparkles,
};

export function ReviewAnswerDeck({ sections, detail, additional }: { sections: ReviewDeckSection[]; detail: string | null; additional: DetailItem[] }) {
  const [activeId, setActiveId] = useState<ReviewDeckSection["id"] | "details">(sections[0]?.id ?? "details");
  const reduceMotion = useReducedMotion();
  const tabsId = useId().replace(/:/g, "");
  const activeSection = sections.find((section) => section.id === activeId);
  const allTabs: { id: ReviewDeckSection["id"] | "details"; label: string; itemCount: number }[] = [...sections.map((section) => ({ id: section.id, label: section.label, itemCount: section.items.length })), { id: "details", label: "More to share", itemCount: additional.length + Number(Boolean(detail)) }];

  function moveTab(currentIndex: number, direction: number) {
    const nextIndex = (currentIndex + direction + allTabs.length) % allTabs.length;
    const next = allTabs[nextIndex];
    setActiveId(next.id);
    requestAnimationFrame(() => document.getElementById(`${tabsId}-${next.id}-tab`)?.focus());
  }

  return <section className="cb-review-deck" aria-labelledby="answer-deck-title">
    <div className="cb-review-deck-heading">
      <div><p>YOUR EDITABLE PROFILE</p><h2 id="answer-deck-title">Your answers</h2></div>
      <span>{sections.reduce((count, section) => count + section.items.length, 0)} answers captured</span>
    </div>
    <div className="cb-review-tablist" role="tablist" aria-label="Profile sections">
      {allTabs.map((tab, index) => {
        const isActive = activeId === tab.id;
        const Icon = tab.id === "details" ? BookOpen : sectionIcons[tab.id];
        return <button key={tab.id} id={`${tabsId}-${tab.id}-tab`} type="button" role="tab" aria-selected={isActive} aria-controls={`${tabsId}-${tab.id}-panel`} tabIndex={isActive ? 0 : -1} className={`cb-review-tab cb-review-tab-${tab.id} ${isActive ? "is-active" : ""}`} onClick={() => setActiveId(tab.id)} onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); moveTab(index, 1); }
          if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); moveTab(index, -1); }
          if (event.key === "Home") { event.preventDefault(); moveTab(index, -index); }
          if (event.key === "End") { event.preventDefault(); moveTab(index, allTabs.length - index - 1); }
        }}>
          <span aria-hidden="true"><Icon className="h-4 w-4" strokeWidth={1.8} /></span>
          <strong>{tab.label}</strong>
          <em>{tab.itemCount || "Optional"}</em>
          <i aria-hidden="true">{String(index + 1).padStart(2, "0")}</i>
        </button>;
      })}
    </div>

    <AnimatePresence mode="wait" initial={false}>
      {activeSection ? <motion.article key={activeSection.id} id={`${tabsId}-${activeSection.id}-panel`} role="tabpanel" aria-labelledby={`${tabsId}-${activeSection.id}-tab`} className={`cb-review-deck-panel cb-review-deck-panel-${activeSection.tone}`} initial={reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={reduceMotion ? undefined : { opacity: 0, y: -9, filter: "blur(2px)" }} transition={reduceMotion ? { duration: 0 } : { duration: .32, ease: [0.22, 1, 0.36, 1] }}>
        <div className="cb-review-deck-intro">
          <span aria-hidden="true" className="cb-review-deck-icon">{(() => { const Icon = sectionIcons[activeSection.id]; return <Icon className="h-7 w-7" strokeWidth={1.55} />; })()}</span>
          <p>SECTION {String(sections.findIndex((section) => section.id === activeSection.id) + 1).padStart(2, "0")}</p>
          <h3>{activeSection.title}</h3>
          <span>{activeSection.description}</span>
          <div aria-hidden="true" className="cb-review-deck-graphic"><i /><i /><i /></div>
        </div>
        <div className="cb-review-deck-answers">
          <div className="cb-review-deck-answers-heading"><span>YOUR ANSWERS</span><p>Select an answer to update it.</p></div>
          <dl>
            {activeSection.items.map((item, index) => <motion.div key={item.label} initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={reduceMotion ? { duration: 0 } : { delay: .08 + index * .06, duration: .25 }}>
              <dt>{item.label}</dt><dd>{item.value}</dd><dd><Link href={item.href} aria-label={`Change ${item.label.toLowerCase()}`}>Change <ChevronRight aria-hidden="true" className="h-3.5 w-3.5" /></Link></dd>
            </motion.div>)}
          </dl>
          <p className="cb-review-deck-hint">Your previous answers stay saved when you make a change.</p>
        </div>
      </motion.article> : <motion.div key="details" id={`${tabsId}-details-panel`} role="tabpanel" aria-labelledby={`${tabsId}-details-tab`} className="cb-review-deck-extra" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -9 }} transition={reduceMotion ? { duration: 0 } : { duration: .3, ease: [0.22, 1, 0.36, 1] }}><ReviewMoreDetailsCard detail={detail} additional={additional} /></motion.div>}
    </AnimatePresence>
  </section>;
}
