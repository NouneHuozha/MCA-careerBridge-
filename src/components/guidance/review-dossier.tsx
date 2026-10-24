"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  GraduationCap,
  HelpCircle,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

/* ─── Types ─────────────────────────────────────────────── */
export type DossierItem = { label: string; value: string; editHref: string };
export type OpenItem = { label: string; note: string };

export interface ReviewDossierProps {
  foundation: {
    stage: string;
    stageDetail: string | null;
    stream: string;
    editHref: string;
    openNotes?: OpenItem[];
  };
  enjoyed: {
    items: DossierItem[];
    openNotes?: OpenItem[];
  };
  matters: {
    items: DossierItem[];
    openNotes?: OpenItem[];
  };
  additional: { label: string; value: string }[];
  anythingElse: string | null;
}

type PillarId = "foundation" | "enjoyed" | "matters" | "details";

/* ─── Tab definitions ────────────────────────────────────── */
const PILLARS: {
  id: PillarId;
  number: string;
  label: string;
  sub: string;
  Icon: typeof GraduationCap;
}[] = [
  {
    id: "foundation",
    number: "01",
    label: "Where you are now",
    sub: "Stage, status & stream",
    Icon: GraduationCap,
  },
  {
    id: "enjoyed",
    number: "02",
    label: "What you enjoy & bring",
    sub: "Interests, strengths, style",
    Icon: Compass,
  },
  {
    id: "matters",
    number: "03",
    label: "What matters to you",
    sub: "Goals, values & realities",
    Icon: Sparkles,
  },
  {
    id: "details",
    number: "04",
    label: "Open details & story",
    sub: "Optional context & words",
    Icon: BookOpen,
  },
];

/* ─── Spring configs ──────────────────────────────────────── */
const TAB_SPRING = { type: "spring" as const, stiffness: 380, damping: 30 };
const PANEL_EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Gold Accent Line (animated on mount) ────────────────── */
function GoldAccentLine() {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className="cb-rev-gold-line"
      initial={reduced ? false : { scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
      }
      style={{
        transformOrigin: "left",
        height: 3,
        width: 48,
        borderRadius: 2,
        background: "rgba(242, 207, 120, 0.6)",
        marginTop: 6,
      }}
      aria-hidden
    />
  );
}

/* ─── Main Dossier Component ──────────────────────────────── */
export function ReviewDossier({
  foundation,
  enjoyed,
  matters,
  additional,
  anythingElse,
}: ReviewDossierProps) {
  const [active, setActive] = useState<PillarId>("foundation");
  const reduced = useReducedMotion();

  return (
    <section className="cb-rev-dossier" aria-label="Profile Review Dossier">
      {/* ── Animated Tab Rail ── */}
      <div className="cb-rev-rail" role="tablist" aria-label="Profile sections">
        {PILLARS.map((pillar) => {
          const isActive = active === pillar.id;
          return (
            <button
              key={pillar.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(pillar.id)}
              className={`cb-rev-tab ${isActive ? "is-active" : ""}`}
            >
              {/* Sliding indicator with spring physics */}
              {isActive && (
                <motion.div
                  layoutId="rev-active-tab-bg"
                  className="cb-rev-tab-indicator"
                  transition={reduced ? { duration: 0 } : TAB_SPRING}
                />
              )}

              <div className="cb-rev-tab-inner">
                <div className="cb-rev-tab-header">
                  <motion.span
                    className="cb-rev-tab-num"
                    key={`num-${pillar.id}-${isActive}`}
                    initial={
                      reduced ? false : isActive ? { scale: 1.2, opacity: 0 } : false
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      reduced
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 500, damping: 25 }
                    }
                  >
                    {pillar.number}
                  </motion.span>
                  <span className="cb-rev-tab-icon" aria-hidden>
                    <pillar.Icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                </div>
                <strong className="cb-rev-tab-title">{pillar.label}</strong>
                <span className="cb-rev-tab-sub">{pillar.sub}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Active Panel with AnimatePresence ── */}
      <div className="cb-rev-panel-wrap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={active}
            role="tabpanel"
            className="cb-rev-panel"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: -10 }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 0.32, ease: PANEL_EASE }
            }
          >
            {active === "foundation" && (
              <FoundationView foundation={foundation} />
            )}
            {active === "enjoyed" && (
              <PillarView
                sectionNum="02"
                title="What you enjoy and bring"
                description="The subjects, interests, and strengths that can help guide which directions make sense to compare."
                editHref="/guidance/review?mode=correct#edit-enjoy"
                items={enjoyed.items}
                openNotes={enjoyed.openNotes}
              />
            )}
            {active === "matters" && (
              <PillarView
                sectionNum="03"
                title="What matters to you"
                description="The goals, career values, and practical considerations that help make each path feel realistic."
                editHref="/guidance/review?mode=correct#edit-matters"
                items={matters.items}
                openNotes={matters.openNotes}
              />
            )}
            {active === "details" && (
              <DetailsView additional={additional} anythingElse={anythingElse} />
            )}
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ─── Foundation Section ─────────────────────────────────── */
function FoundationView({
  foundation,
}: {
  foundation: ReviewDossierProps["foundation"];
}) {
  const reduced = useReducedMotion();
  const rows = [
    { label: "Study stage", value: foundation.stage },
    ...(foundation.stageDetail
      ? [{ label: "Current status", value: foundation.stageDetail }]
      : []),
    { label: "Stream / technical context", value: foundation.stream },
  ];

  return (
    <div className="cb-rev-content">
      {/* Section Header */}
      <header className="cb-rev-content-head">
        <div>
          <span className="cb-rev-section-pill">SECTION 01</span>
          <h2 className="cb-rev-content-title">Where you are now</h2>
          <p className="cb-rev-content-desc">
            Your current education stage provides a solid starting line for
            every direction we look at together.
          </p>
          <GoldAccentLine />
        </div>

        <Link href={foundation.editHref} className="cb-rev-edit-btn">
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span>Edit this section</span>
        </Link>
      </header>

      {/* Part 1: You told us */}
      <section className="cb-rev-block" aria-labelledby="foundation-told-us">
        <div className="cb-rev-block-head">
          <span className="cb-rev-block-badge">YOU TOLD US</span>
          <p className="cb-rev-block-note">Answers from your counselling session</p>
        </div>

        <div className="cb-rev-rows">
          {rows.map((row, idx) => (
            <motion.div
              key={row.label}
              className="cb-rev-row"
              initial={reduced ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: idx * 0.06, duration: 0.35, ease: PANEL_EASE }
              }
            >
              <span className="cb-rev-row-label">{row.label}</span>
              <span className="cb-rev-row-value">{row.value}</span>
              <Link
                href={foundation.editHref}
                className="cb-rev-row-action"
                aria-label={`Change ${row.label}`}
              >
                <span>Change</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Part 2: What remains open */}
      <section
        className="cb-rev-block cb-rev-block-open"
        aria-labelledby="foundation-open"
      >
        <div className="cb-rev-block-head">
          <span className="cb-rev-block-badge cb-rev-badge-open">
            WHAT REMAINS OPEN
          </span>
          <p className="cb-rev-block-note">
            Points that are still developing — completely normal at this stage
          </p>
        </div>

        <ul className="cb-rev-open-list">
          <motion.li
            className="cb-rev-open-item"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced ? { duration: 0 } : { delay: 0.15, duration: 0.4, ease: PANEL_EASE }
            }
          >
            <HelpCircle
              className="h-4 w-4 shrink-0"
              strokeWidth={1.8}
              style={{ color: "#6F887B" }}
              aria-hidden
            />
            <div>
              <strong>Pathways remain flexible</strong>
              <p>
                Whether you continue with standard schooling, technical
                diplomas, or skills courses, you can compare multiple routes
                without being locked in.
              </p>
            </div>
          </motion.li>

          {foundation.stream.toLowerCase().includes("not decided") && (
            <motion.li
              className="cb-rev-open-item"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { delay: 0.25, duration: 0.4, ease: PANEL_EASE }
              }
            >
              <HelpCircle
                className="h-4 w-4 shrink-0"
                strokeWidth={1.8}
                style={{ color: "#6F887B" }}
                aria-hidden
              />
              <div>
                <strong>Stream / specialization is open</strong>
                <p>
                  You haven&apos;t committed to a fixed stream yet. We will
                  highlight directions that welcome multiple backgrounds.
                </p>
              </div>
            </motion.li>
          )}
        </ul>
      </section>
    </div>
  );
}

/* ─── Generic Pillar Section (Enjoyed / Matters) ─────────── */
function PillarView({
  sectionNum,
  title,
  description,
  editHref,
  items,
  openNotes,
}: {
  sectionNum: string;
  title: string;
  description: string;
  editHref: string;
  items: DossierItem[];
  openNotes?: OpenItem[];
}) {
  const reduced = useReducedMotion();

  return (
    <div className="cb-rev-content">
      {/* Section Header */}
      <header className="cb-rev-content-head">
        <div>
          <span className="cb-rev-section-pill">SECTION {sectionNum}</span>
          <h2 className="cb-rev-content-title">{title}</h2>
          <p className="cb-rev-content-desc">{description}</p>
          <GoldAccentLine />
        </div>

        <Link href={editHref} className="cb-rev-edit-btn">
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span>Edit this section</span>
        </Link>
      </header>

      {/* Part 1: You told us */}
      <section className="cb-rev-block">
        <div className="cb-rev-block-head">
          <span className="cb-rev-block-badge">YOU TOLD US</span>
          <p className="cb-rev-block-note">Recorded preferences and answers</p>
        </div>

        <div className="cb-rev-rows">
          {items.map((item, idx) => (
            <motion.div
              key={item.label}
              className="cb-rev-row"
              initial={reduced ? false : { opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduced
                  ? { duration: 0 }
                  : { delay: idx * 0.06, duration: 0.35, ease: PANEL_EASE }
              }
            >
              <span className="cb-rev-row-label">{item.label}</span>
              <span className="cb-rev-row-value">{item.value}</span>
              <Link
                href={item.editHref}
                className="cb-rev-row-action"
                aria-label={`Change ${item.label}`}
              >
                <span>Change</span>
                <ChevronRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Part 2: What remains open */}
      {openNotes && openNotes.length > 0 && (
        <section className="cb-rev-block cb-rev-block-open">
          <div className="cb-rev-block-head">
            <span className="cb-rev-block-badge cb-rev-badge-open">
              WHAT REMAINS OPEN
            </span>
            <p className="cb-rev-block-note">Areas to compare during exploration</p>
          </div>

          <ul className="cb-rev-open-list">
            {openNotes.map((note, idx) => (
              <motion.li
                key={note.label}
                className="cb-rev-open-item"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { delay: 0.1 + idx * 0.1, duration: 0.4, ease: PANEL_EASE }
                }
              >
                <HelpCircle
                  className="h-4 w-4 shrink-0"
                  strokeWidth={1.8}
                  style={{ color: "#6F887B" }}
                  aria-hidden
                />
                <div>
                  <strong>{note.label}</strong>
                  <p>{note.note}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/* ─── Details Section ────────────────────────────────────── */
function DetailsView({
  additional,
  anythingElse,
}: {
  additional: { label: string; value: string }[];
  anythingElse: string | null;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="cb-rev-content">
      <header className="cb-rev-content-head">
        <div>
          <span className="cb-rev-section-pill">SECTION 04</span>
          <h2 className="cb-rev-content-title">Open details & story</h2>
          <p className="cb-rev-content-desc">
            Optional context you shared to give your guidance extra personal
            depth.
          </p>
          <GoldAccentLine />
        </div>

        <Link
          href="/guidance/review?mode=correct#edit-practical"
          className="cb-rev-edit-btn"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
          <span>Edit details</span>
        </Link>
      </header>

      {additional.length > 0 ? (
        <section className="cb-rev-block">
          <div className="cb-rev-block-head">
            <span className="cb-rev-block-badge">ADDITIONAL DETAILS</span>
            <p className="cb-rev-block-note">
              Helpful context for course and college filters
            </p>
          </div>

          <div className="cb-rev-rows">
            {additional.map((item, idx) => (
              <motion.div
                key={item.label}
                className="cb-rev-row"
                initial={reduced ? false : { opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { delay: idx * 0.06, duration: 0.35, ease: PANEL_EASE }
                }
              >
                <span className="cb-rev-row-label">{item.label}</span>
                <span className="cb-rev-row-value">{item.value}</span>
                <Link
                  href="/guidance/review?mode=correct#edit-practical"
                  className="cb-rev-row-action"
                  aria-label={`Change ${item.label}`}
                >
                  <span>Change</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <div className="cb-rev-empty-box">
          <p>
            No additional optional filters were specified. That is completely
            fine.
          </p>
        </div>
      )}

      {anythingElse && (
        <motion.section
          className="cb-rev-quote-card"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: 0.2, duration: 0.5, ease: PANEL_EASE }
          }
        >
          <div className="cb-rev-quote-head">
            <span className="cb-rev-quote-badge">IN YOUR OWN WORDS</span>
            <p>What you wrote during counselling</p>
          </div>
          <blockquote className="cb-rev-quote-text">
            &ldquo;{anythingElse}&rdquo;
          </blockquote>
        </motion.section>
      )}
    </div>
  );
}
