"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Atom,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  HeartPulse,
  Landmark,
  Leaf,
  MapPin,
  Monitor,
  Route,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useId, useState } from "react";

export type DirectionStudioReason = { label: string; detail: string };
export type DirectionStudioOption = {
  slug: string;
  name: string;
  overview: string;
  tagline: string | null;
  headline: string;
  reasons: DirectionStudioReason[];
  caution: string | null;
  whatPeopleDo: string[];
  usefulSubjects: string[];
  skills: string[];
  pros: string[];
  challenges: string[];
  alternatives: string[];
};

function DirectionGlyph({
  slug,
  className = "h-5 w-5",
  strokeWidth = 1.7,
}: {
  slug: string;
  className?: string;
  strokeWidth?: number;
}) {
  if (slug === "technology") return <Monitor aria-hidden className={className} strokeWidth={strokeWidth} />;
  if (slug === "engineering") return <Atom aria-hidden className={className} strokeWidth={strokeWidth} />;
  if (slug === "healthcare") return <HeartPulse aria-hidden className={className} strokeWidth={strokeWidth} />;
  if (slug === "agriculture-environment") return <Leaf aria-hidden className={className} strokeWidth={strokeWidth} />;
  if (slug === "government" || slug === "social-sciences")
    return <Landmark aria-hidden className={className} strokeWidth={strokeWidth} />;
  if (slug === "skilled-trades") return <Wrench aria-hidden className={className} strokeWidth={strokeWidth} />;
  return <BriefcaseBusiness aria-hidden className={className} strokeWidth={strokeWidth} />;
}

export function DirectionStudio({
  options,
  signals,
}: {
  options: DirectionStudioOption[];
  signals: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pathOpen, setPathOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const tabId = useId().replace(/:/g, "");
  const active = options[activeIndex] ?? options[0];

  function choose(index: number) {
    setActiveIndex(index);
    setPathOpen(false);
  }

  function move(index: number, delta: number) {
    const nextIndex = (index + delta + options.length) % options.length;
    choose(nextIndex);
    requestAnimationFrame(() =>
      document.getElementById(`${tabId}-option-${nextIndex}`)?.focus()
    );
  }

  if (!active) return null;

  return (
    <section className="cb-studio-container" aria-labelledby="direction-studio-title">

      {/* ── Top Hero Block ── */}
      <header className="cb-studio-header">
        <div className="cb-studio-header-copy">
          <div className="cb-studio-eyebrow">
            <span className="cb-studio-eyebrow-dot" aria-hidden />
            <span>Personalised exploration · 3 directions to compare</span>
          </div>

          <h1 id="direction-studio-title">Three places to begin</h1>

          <p className="cb-studio-lead">
            Each direction connects to what you shared during counselling. Explore
            more than one — these are possibilities to understand, not decisions
            made for you.
          </p>
        </div>

        {/* ── Your Compass Card ── */}
        <aside className="cb-studio-compass" aria-label="What CareerBridge used to find these directions">
          <div className="cb-studio-compass-head">
            <span className="cb-studio-compass-icon" aria-hidden>
              <Compass className="h-4 w-4" strokeWidth={1.9} />
            </span>
            <p className="cb-studio-compass-label">YOUR COMPASS</p>
          </div>

          <p className="cb-studio-compass-sub">
            Signals that guided these suggestions:
          </p>

          {signals.length > 0 ? (
            <ul className="cb-studio-compass-signals">
              {signals.map((signal, index) => (
                <li key={signal} className="cb-studio-compass-pill">
                  <span className="cb-studio-compass-num" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="cb-studio-compass-empty">
              We&apos;ll use what you choose to share as you explore.
            </p>
          )}

          <Link href="/guidance/review?mode=correct" className="cb-studio-compass-edit">
            Review or update my profile →
          </Link>
        </aside>
      </header>

      {/* ── Direction Tab Selector (3 cards) ── */}
      <LayoutGroup id="direction-studio-picker">
        <div className="cb-studio-selector" role="tablist" aria-label="Suggested directions">
          {options.map((option, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={option.slug}
                id={`${tabId}-option-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tabId}-panel`}
                tabIndex={isActive ? 0 : -1}
                className={`cb-studio-tab ${isActive ? "is-active" : ""}`}
                onClick={() => choose(index)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                    event.preventDefault();
                    move(index, 1);
                  }
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                    event.preventDefault();
                    move(index, -1);
                  }
                  if (event.key === "Home") {
                    event.preventDefault();
                    move(index, -index);
                  }
                  if (event.key === "End") {
                    event.preventDefault();
                    move(index, options.length - index - 1);
                  }
                }}
              >
                {isActive ? (
                  <motion.div
                    layoutId="studio-active-tab-highlight"
                    className="cb-studio-tab-highlight"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 420, damping: 32 }
                    }
                  />
                ) : null}

                <div className="cb-studio-tab-top">
                  <span className="cb-studio-tab-num">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="cb-studio-tab-icon">
                    <DirectionGlyph slug={option.slug} className="h-4.5 w-4.5" />
                  </span>
                </div>

                <div className="cb-studio-tab-body">
                  <h3 className="cb-studio-tab-name">{option.name}</h3>
                  {option.tagline && (
                    <p className="cb-studio-tab-tagline">{option.tagline}</p>
                  )}
                </div>

                <div className="cb-studio-tab-foot">
                  <span>Explore 0{index + 1}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </div>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* ── Active Direction Dossier Stage ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={active.slug}
          id={`${tabId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabId}-option-${activeIndex}`}
          className="cb-studio-stage"
          initial={
            reduceMotion ? false : { opacity: 0, y: 16, filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={
            reduceMotion ? undefined : { opacity: 0, y: -10, filter: "blur(2px)" }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {/* Left Column: Deep Forest Character & Overview */}
          <section className="cb-studio-stage-hero">
            <div className="cb-studio-stage-badge">
              <span>EXPLORATION {String(activeIndex + 1).padStart(2, "0")} OF 03</span>
              <span className="cb-studio-stage-badge-indicator" />
            </div>

            <div className="cb-studio-stage-glyph-wrap" aria-hidden>
              <DirectionGlyph
                slug={active.slug}
                className="h-10 w-10"
                strokeWidth={1.5}
              />
            </div>

            <p className="cb-studio-stage-overline">AREA TO EXPLORE</p>
            <h2 className="cb-studio-stage-name">{active.name}</h2>

            {active.tagline && (
              <p className="cb-studio-stage-tagline">{active.tagline}</p>
            )}

            <div className="cb-studio-stage-headline-box">
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              <p>{active.headline}</p>
            </div>

            {active.whatPeopleDo.length > 0 && (
              <div className="cb-studio-stage-examples">
                <p className="cb-studio-stage-examples-label">
                  WHAT THIS FIELD CAN INCLUDE
                </p>
                <ul className="cb-studio-stage-examples-list">
                  {active.whatPeopleDo.slice(0, 3).map((item) => (
                    <li key={item}>
                      <span className="cb-stage-dot" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              className="cb-studio-brief-toggle"
              aria-expanded={pathOpen}
              aria-controls={`${tabId}-path-brief`}
              onClick={() => setPathOpen((open) => !open)}
            >
              <span>{pathOpen ? "Hide field details" : "About this direction at a glance"}</span>
              <motion.span
                aria-hidden
                animate={{ rotate: pathOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>
          </section>

          {/* Right Column: Connection Points & Next Steps */}
          <section
            className="cb-studio-stage-details"
            aria-label={`Why ${active.name} may connect to your answers`}
          >
            <header className="cb-studio-details-head">
              <div>
                <p className="cb-studio-details-kicker">WHY IT APPEARED</p>
                <h3 className="cb-studio-details-title">What connects here</h3>
              </div>
              <span className="cb-studio-details-counter">
                Direction {String(activeIndex + 1).padStart(2, "0")} / 03
              </span>
            </header>

            {/* Reasons List */}
            {active.reasons.length > 0 ? (
              <ul className="cb-studio-reasons-list">
                {active.reasons.map((reason, index) => (
                  <motion.li
                    key={`${reason.label}-${reason.detail}`}
                    className="cb-studio-reason-item"
                    initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { delay: 0.08 + index * 0.07, duration: 0.25 }
                    }
                  >
                    <span className="cb-studio-reason-icon" aria-hidden>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    <div className="cb-studio-reason-copy">
                      <strong>{reason.label}</strong>
                      <p>{reason.detail}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="cb-studio-broad-note">
                This is a broad field to learn about as you compare what feels right.
              </p>
            )}

            {/* Practical Caution Note */}
            {active.caution && (
              <aside className="cb-studio-caution" aria-label="A practical point to keep in view">
                <span className="cb-studio-caution-icon" aria-hidden>
                  <MapPin className="h-4 w-4" strokeWidth={1.8} />
                </span>
                <div>
                  <strong>A practical point to keep in view</strong>
                  <p>{active.caution}</p>
                </div>
              </aside>
            )}

            {/* Main Action Block */}
            <div className="cb-studio-action-box">
              <Link
                href={`/guidance/direction/${encodeURIComponent(active.slug)}`}
                className="cb-studio-cta-btn"
              >
                <span>Explore {active.name}</span>
                <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden />
              </Link>
              <p className="cb-studio-action-sub">
                See routes, courses, institutions in Nagaland, and practical checks.
              </p>
            </div>
          </section>

          {/* Expandable Brief Drawer */}
          <AnimatePresence initial={false}>
            {pathOpen && (
              <motion.section
                id={`${tabId}-path-brief`}
                key="path-brief"
                className="cb-studio-drawer"
                aria-label={`About ${active.name}`}
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 220, damping: 25 }
                }
              >
                <header className="cb-studio-drawer-header">
                  <div>
                    <p className="cb-studio-drawer-kicker">ABOUT THIS DIRECTION</p>
                    <h4>A clearer path at a glance</h4>
                    <p className="cb-studio-drawer-overview">{active.overview}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPathOpen(false)}
                    className="cb-studio-drawer-close"
                  >
                    Close
                  </button>
                </header>

                <div className="cb-studio-drawer-grid">
                  {active.whatPeopleDo.length > 0 && (
                    <div className="cb-drawer-block">
                      <p className="cb-drawer-block-title">WHAT PEOPLE DO</p>
                      <ul>
                        {active.whatPeopleDo.slice(0, 4).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(active.usefulSubjects.length > 0 || active.skills.length > 0) && (
                    <div className="cb-drawer-block">
                      <p className="cb-drawer-block-title">USEFUL TO BUILD</p>
                      <div className="cb-drawer-chips">
                        {active.usefulSubjects.slice(0, 4).map((item) => (
                          <span key={`sub-${item}`}>{item}</span>
                        ))}
                        {active.skills.slice(0, 4).map((item) => (
                          <span key={`sk-${item}`}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(active.pros.length > 0 || active.challenges.length > 0) && (
                    <div className="cb-drawer-block">
                      <p className="cb-drawer-block-title">WHAT TO EXPECT</p>
                      <ul>
                        {active.pros.slice(0, 2).map((item) => (
                          <li key={`pro-${item}`}>{item}</li>
                        ))}
                        {active.challenges.slice(0, 2).map((item) => (
                          <li key={`chal-${item}`} className="is-caution">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {active.alternatives.length > 0 && (
                    <div className="cb-drawer-block">
                      <p className="cb-drawer-block-title">OTHER WAYS IN</p>
                      <ul>
                        {active.alternatives.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.article>
      </AnimatePresence>

      {/* ── Navigator Controls (Bottom) ── */}
      {options.length > 1 && (
        <div className="cb-studio-controls" aria-label="Move between suggested directions">
          <button
            type="button"
            aria-label="Previous direction"
            onClick={() => choose((activeIndex - 1 + options.length) % options.length)}
            className="cb-studio-control-btn"
          >
            <ChevronLeft className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </button>
          <p className="cb-studio-control-text">
            <span>{String(activeIndex + 1).padStart(2, "0")}</span> of{" "}
            {String(options.length).padStart(2, "0")} directions
          </p>
          <button
            type="button"
            aria-label="Next direction"
            onClick={() => choose((activeIndex + 1) % options.length)}
            className="cb-studio-control-btn"
          >
            <ChevronRight className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}

      {/* ── Reassurance Safety Net Banner ── */}
      <aside className="cb-studio-safety" aria-label="Not ready to choose?">
        <div className="cb-studio-safety-copy">
          <p className="cb-studio-safety-kicker">KEEP EXPLORING</p>
          <h2>Not ready to choose a direction?</h2>
          <span>
            That is completely normal. We can help you explore without committing to
            any single path.
          </span>
        </div>
        <Link href="/guidance/not-sure" className="cb-studio-safety-btn">
          Help me look around
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </aside>

    </section>
  );
}
