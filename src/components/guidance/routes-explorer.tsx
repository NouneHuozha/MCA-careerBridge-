"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  Clock,
  Code2,
  GraduationCap,
  Layers,
  Route as RouteIcon,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useState } from "react";

/* ─── Types ──────────────────────────────────────────────── */
export interface RouteCardData {
  slug: string;
  name: string;
  description: string;
  routeType: string;
  routeTypeLabel: string;
  duration: string | null;
  studyStyle: string;
  progression: string;
  understandNext: string;
  href: string;
  compareHref: string;
}

export interface RoutesExplorerProps {
  fieldName: string;
  fieldSlug: string;
  displayStage: string;
  routes: RouteCardData[];
}

/* ─── Helpers ────────────────────────────────────────────── */
function TypeIcon({ type, className }: { type: string; className?: string }) {
  const cn = className ?? "h-5 w-5";
  if (type === "diploma" || type === "vocational")
    return <Wrench aria-hidden className={cn} strokeWidth={1.7} />;
  if (type === "academic")
    return <Code2 aria-hidden className={cn} strokeWidth={1.7} />;
  return <GraduationCap aria-hidden className={cn} strokeWidth={1.7} />;
}

function durationToMonths(dur: string | null): number {
  if (!dur) return 36;
  const lower = dur.toLowerCase();
  const yearMatch = lower.match(/(\d+)\s*(?:–|-)\s*(\d+)\s*year/);
  if (yearMatch) return ((parseInt(yearMatch[1]) + parseInt(yearMatch[2])) / 2) * 12;
  const singleYear = lower.match(/(\d+)\s*year/);
  if (singleYear) return parseInt(singleYear[1]) * 12;
  const monthMatch = lower.match(/(\d+)\s*month/);
  if (monthMatch) return parseInt(monthMatch[1]);
  return 36;
}

function typeColorClass(type: string) {
  if (type === "academic") return { bg: "rgba(9,51,42,0.06)", text: "#09332A", border: "rgba(9,51,42,0.12)", accent: "#09332A" };
  if (type === "diploma") return { bg: "rgba(111,136,123,0.08)", text: "#3d6858", border: "rgba(111,136,123,0.18)", accent: "#6F887B" };
  if (type === "vocational") return { bg: "rgba(242,207,120,0.1)", text: "#7a5c12", border: "rgba(242,207,120,0.25)", accent: "#F2CF78" };
  return { bg: "rgba(9,51,42,0.06)", text: "#09332A", border: "rgba(9,51,42,0.12)", accent: "#09332A" };
}

/* ─── Duration Bar (animated) ─────────────────────────────── */
function DurationBar({
  duration,
  maxMonths,
  delay,
}: {
  duration: string | null;
  maxMonths: number;
  delay: number;
}) {
  const reduced = useReducedMotion();
  const months = durationToMonths(duration);
  const pct = Math.min((months / maxMonths) * 100, 100);

  return (
    <div className="cb-routes-duration-bar-wrap">
      <div className="cb-routes-duration-bar-track">
        <motion.div
          className="cb-routes-duration-bar-fill"
          initial={reduced ? { width: `${pct}%` } : { width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: delay + 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }
          }
        />
      </div>
      <span className="cb-routes-duration-label">
        <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        {duration ?? "Duration varies"}
      </span>
    </div>
  );
}

/* ─── Single Route Card ──────────────────────────────────── */
function RouteCard({
  route,
  index,
  maxMonths,
}: {
  route: RouteCardData;
  index: number;
  maxMonths: number;
}) {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const colors = typeColorClass(route.routeType);
  const delay = index * 0.1;

  return (
    <motion.article
      className="cb-routes-card"
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
    >
      {/* Card Top Accent */}
      <div
        className="cb-routes-card-accent"
        style={{ background: colors.accent }}
        aria-hidden
      />

      <div className="cb-routes-card-body">
        {/* Type Badge + Number */}
        <div className="cb-routes-card-topline">
          <span
            className="cb-routes-type-badge"
            style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}
          >
            <TypeIcon type={route.routeType} className="h-4 w-4" />
            {route.routeTypeLabel}
          </span>
          <span className="cb-routes-card-number">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Title */}
        <h3 className="cb-routes-card-title">{route.name}</h3>

        {/* Description */}
        <p className="cb-routes-card-desc">{route.description}</p>

        {/* Animated Duration Bar */}
        <DurationBar
          duration={route.duration}
          maxMonths={maxMonths}
          delay={delay}
        />

        {/* Expandable Details */}
        <button
          type="button"
          className="cb-routes-expand-btn"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <span>
            {expanded ? "Hide details" : "Study style & next steps"}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex" }}
          >
            <ChevronDown className="h-4 w-4" strokeWidth={2} aria-hidden />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              className="cb-routes-details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: "hidden" }}
            >
              <div className="cb-routes-details-inner">
                <div className="cb-routes-detail-row">
                  <dt>Study style</dt>
                  <dd>{route.studyStyle}</dd>
                </div>
                <div className="cb-routes-detail-row">
                  <dt>Possible next steps</dt>
                  <dd>{route.progression}</dd>
                </div>
                <div className="cb-routes-detail-row cb-routes-detail-highlight">
                  <dt>Worth understanding</dt>
                  <dd>{route.understandNext}</dd>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA */}
        <div className="cb-routes-card-actions">
          <Link href={route.href} className="cb-routes-card-cta">
            <span>Explore this route</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ─── Comparison Strip ───────────────────────────────────── */
function ComparisonStrip({ routes }: { routes: RouteCardData[] }) {
  const reduced = useReducedMotion();
  if (routes.length < 2) return null;

  return (
    <motion.section
      className="cb-routes-compare"
      aria-label="Quick comparison"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <div className="cb-routes-compare-header">
        <div>
          <span className="cb-routes-compare-badge">
            <Layers className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            QUICK COMPARE
          </span>
          <h3 className="cb-routes-compare-title">See differences at a glance</h3>
        </div>
        <p className="cb-routes-compare-note">
          These are not ranked. Each route suits different preferences.
        </p>
      </div>

      <div className="cb-routes-compare-grid">
        {/* Header row */}
        <div className="cb-routes-compare-row cb-routes-compare-row-header">
          <div className="cb-routes-compare-cell cb-routes-compare-label" />
          {routes.map((r) => (
            <div key={r.slug} className="cb-routes-compare-cell cb-routes-compare-name">
              <TypeIcon type={r.routeType} className="h-4 w-4" />
              <span>{r.name}</span>
            </div>
          ))}
        </div>

        {/* Duration row */}
        <div className="cb-routes-compare-row">
          <div className="cb-routes-compare-cell cb-routes-compare-label">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            Duration
          </div>
          {routes.map((r) => (
            <div key={r.slug} className="cb-routes-compare-cell">
              <strong>{r.duration ?? "Varies"}</strong>
            </div>
          ))}
        </div>

        {/* Study style row */}
        <div className="cb-routes-compare-row">
          <div className="cb-routes-compare-cell cb-routes-compare-label">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Study style
          </div>
          {routes.map((r) => (
            <div key={r.slug} className="cb-routes-compare-cell">
              {r.studyStyle}
            </div>
          ))}
        </div>

        {/* Next steps row */}
        <div className="cb-routes-compare-row">
          <div className="cb-routes-compare-cell cb-routes-compare-label">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Next steps
          </div>
          {routes.map((r) => (
            <div key={r.slug} className="cb-routes-compare-cell">
              {r.progression}
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ─── Main Routes Explorer ───────────────────────────────── */
export function RoutesExplorer({
  fieldName,
  fieldSlug,
  displayStage,
  routes,
}: RoutesExplorerProps) {
  const reduced = useReducedMotion();
  const maxMonths = Math.max(...routes.map((r) => durationToMonths(r.duration)), 48);

  return (
    <div className="cb-routes-page">
      {/* ── Cinematic Hero ── */}
      <header className="cb-routes-hero">
        {/* Decorative elements */}
        <div className="cb-routes-hero-deco" aria-hidden>
          <motion.div
            className="cb-routes-hero-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          />
          <div className="cb-routes-hero-dots">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{
                  duration: 3,
                  delay: i * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  display: "block",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "rgba(242,207,120,0.5)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="cb-routes-hero-inner">
          <div className="cb-routes-hero-main">
            <motion.div
              className="cb-routes-hero-eyebrow"
              initial={reduced ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={reduced ? { duration: 0 } : { duration: 0.5 }}
            >
              <RouteIcon className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span>Routes to explore</span>
            </motion.div>

            <motion.h1
              className="cb-routes-hero-title"
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { delay: 0.1, duration: 0.6 }
              }
            >
              Ways towards {fieldName}
            </motion.h1>

            <motion.p
              className="cb-routes-hero-lead"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { delay: 0.2, duration: 0.5 }
              }
            >
              There is more than one way forward. These routes are starting
              points to explore — not a ranking. Take your time.
            </motion.p>

            <motion.div
              className="cb-routes-hero-badges"
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduced ? { duration: 0 } : { delay: 0.3, duration: 0.5 }
              }
            >
              <span className="cb-routes-hero-badge">
                <GraduationCap className="h-3.5 w-3.5" strokeWidth={2} />
                Starting from {displayStage}
              </span>
              <span className="cb-routes-hero-badge">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={2} />
                {routes.length} {routes.length === 1 ? "route" : "routes"} to
                compare
              </span>
            </motion.div>
          </div>

          {/* Right-side reassurance card */}
          <motion.aside
            className="cb-routes-hero-aside"
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={
              reduced ? { duration: 0 } : { delay: 0.35, duration: 0.6 }
            }
          >
            <div className="cb-routes-hero-aside-accent" aria-hidden />
            <p className="cb-routes-hero-aside-kicker">Keep in mind</p>
            <p className="cb-routes-hero-aside-text">
              You don&apos;t need to decide now. Explore each route to
              understand what it involves, then compare when you feel ready.
            </p>
            <p className="cb-routes-hero-aside-note">
              Route labels are a guide — not official education categories.
            </p>
          </motion.aside>
        </div>
      </header>

      {/* ── Route Cards ── */}
      <section
        className="cb-routes-content"
        aria-label="Available routes"
      >
        <div className="cb-routes-section-head">
          <div>
            <span className="cb-routes-section-kicker">Choose what to explore</span>
            <h2 className="cb-routes-section-title">Different ways forward</h2>
          </div>
          {routes.length > 1 && (
            <p className="cb-routes-section-note">
              Compare by study style, time, and what may come next.
            </p>
          )}
        </div>

        {routes.length > 0 ? (
          <div
            className={`cb-routes-grid ${
              routes.length === 1
                ? "cb-routes-grid-single"
                : routes.length === 2
                  ? "cb-routes-grid-two"
                  : "cb-routes-grid-multi"
            }`}
          >
            {routes.map((route, index) => (
              <RouteCard
                key={route.slug}
                route={route}
                index={index}
                maxMonths={maxMonths}
              />
            ))}
          </div>
        ) : (
          <div className="cb-routes-empty">
            <h3>Routes are still being added for this stage</h3>
            <p>
              Return to the direction overview to keep exploring while route
              information is checked.
            </p>
            <Link
              href={`/guidance/direction/${encodeURIComponent(fieldSlug)}`}
              className="cb-routes-empty-link"
            >
              Back to {fieldName}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        )}
      </section>

      {/* ── Comparison Strip ── */}
      <div className="cb-routes-content">
        <ComparisonStrip routes={routes.slice(0, 3)} />
      </div>

      {/* ── Footer ── */}
      <footer className="cb-routes-footer">
        <div className="cb-routes-footer-inner">
          <div>
            <p className="cb-routes-footer-title">
              You don&apos;t need to decide now.
            </p>
            <p className="cb-routes-footer-sub">
              Route categories are a guide, not official education labels.
              Details vary by course and institution.
            </p>
          </div>
          <div className="cb-routes-footer-actions">
            {routes.length > 1 && (
              <Link
                href={`/guidance/compare?type=pathway&field=${encodeURIComponent(fieldSlug)}&items=${encodeURIComponent(routes.slice(0, 2).map((r) => r.slug).join(","))}&returnTo=${encodeURIComponent(`/guidance/direction/${fieldSlug}/routes`)}`}
                className="cb-routes-footer-compare"
              >
                Compare routes
                <Layers className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <Link
              href={`/guidance/direction/${encodeURIComponent(fieldSlug)}`}
              className="cb-routes-footer-back"
            >
              Back to {fieldName}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
