"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { ArrowRight, ChevronDown, Plus } from "lucide-react";

type DetailItem = { label: string; value: string };

export function ReviewMoreDetailsCard({ detail, additional }: { detail: string | null; additional: DetailItem[] }) {
  const [expanded, setExpanded] = useState(false);
  const reduceMotion = useReducedMotion();
  const detailId = `review-details-${useId().replace(/:/g, "")}`;
  const detailCount = additional.length + Number(Boolean(detail));
  const expandTransition = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 28 };

  return <motion.article
    className="cb-review-extra"
    initial={reduceMotion ? false : { opacity: 0, y: 18, scale: .985 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 250, damping: 25, delay: .22 }}
    whileHover={reduceMotion ? undefined : { y: -4 }}
  >
    <div className="cb-review-extra-art" aria-hidden="true"><span /><span /><span /></div>
    <header className="cb-review-extra-heading">
      <span aria-hidden="true" className="cb-review-extra-icon"><Plus className="h-5 w-5" strokeWidth={1.8} /></span>
      <p className="cb-review-extra-kicker">OPTIONAL · YOUR WORDS</p>
    </header>
    <h2>Add more details</h2>
    <p className="cb-review-extra-copy">A little more context can help us understand what matters to you. Only add what feels useful.</p>
    {detailCount ? <div className="cb-review-extra-saved">
      <button
        type="button"
        className="cb-review-extra-toggle"
        aria-expanded={expanded}
        aria-controls={detailId}
        onClick={() => setExpanded((isExpanded) => !isExpanded)}
      >
        <span>{detailCount} optional {detailCount === 1 ? "answer" : "answers"} already shared</span>
        <ChevronDown aria-hidden="true" className="h-4 w-4" />
      </button>
      <motion.div
          id={detailId}
          role="region"
          aria-label="Optional details you shared"
          aria-hidden={!expanded}
          inert={!expanded}
          initial={false}
          animate={expanded ? { height: "auto", opacity: 1, y: 0 } : { height: 0, opacity: 0, y: reduceMotion ? 0 : -6 }}
          transition={expandTransition}
          className="cb-review-extra-reveal"
        >
          <ul className="cb-review-extra-list">
            {detail ? <li><strong>Extra detail</strong><span>{detail}</span></li> : null}
            {additional.map((item) => <li key={item.label}><strong>{item.label}</strong><span>{item.value}</span></li>)}
          </ul>
        </motion.div>
    </div> : <p className="cb-review-extra-empty">Nothing extra yet — that&apos;s completely okay.</p>}
    <div className="cb-review-extra-actions">
      <Link href="/guidance/review/details" className="cb-review-extra-add">{detailCount ? "Review or add details" : "Add more detail"}<ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
      <Link href="/guidance/confirm" className="cb-review-extra-skip">Continue without adding</Link>
    </div>
  </motion.article>;
}
