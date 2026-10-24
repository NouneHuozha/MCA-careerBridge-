"use client";

import { motion, useReducedMotion } from "motion/react";
import { Layers, Shield, Unlock } from "lucide-react";

interface ReviewHeroProps {
  interpretation: string;
  sectionCount: number;
}

/* ─── Animated stat badge ─────────────────────────────────────── */
function StatBadge({
  icon: Icon,
  label,
  delay,
}: {
  icon: typeof Layers;
  label: string;
  delay: number;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="cb-rev-stat-badge"
      initial={reduced ? false : { opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduced
          ? { duration: 0 }
          : { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </motion.span>
  );
}

/* ─── Decorative animated shapes ──────────────────────────────── */
function HeroDecoration() {
  return (
    <div className="cb-rev-hero-deco" aria-hidden>
      {/* Floating ring */}
      <motion.div
        className="cb-rev-deco-ring"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
      {/* Subtle dot grid */}
      <div className="cb-rev-deco-dots">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.span
            key={i}
            className="cb-rev-deco-dot"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.15, 0.45, 0.15] }}
            transition={{
              duration: 3,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Hero Export ─────────────────────────────────────────── */
export function ReviewHero({ interpretation, sectionCount }: ReviewHeroProps) {
  const reduced = useReducedMotion();

  return (
    <header className="cb-rev-hero-block">
      <HeroDecoration />

      <div className="cb-rev-hero-inner">
        {/* ── Left: Main Copy ── */}
        <div className="cb-rev-hero-main">
          {/* Step eyebrow */}
          <motion.div
            className="cb-rev-eyebrow"
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
          >
            <span className="cb-rev-eyebrow-dot" aria-hidden />
            <span>After counselling · Step 02 of 03</span>
          </motion.div>

          {/* Headline with staggered word reveal */}
          <motion.h1
            className="cb-rev-headline"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            }
          >
            Check your starting picture
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="cb-rev-lead"
            initial={reduced ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: 0.22, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
          >
            Make sure this reflects who you are. Your answers are starting clues
            to guide possibilities — nothing is locked or decided for you.
          </motion.p>

          {/* Stat badges row */}
          <div className="cb-rev-meta-badges">
            <StatBadge icon={Layers} label={`${sectionCount} Profile Sections`} delay={0.35} />
            <StatBadge icon={Unlock} label="Independently Editable" delay={0.42} />
            <StatBadge icon={Shield} label="No Final Labels" delay={0.49} />
          </div>
        </div>

        {/* ── Right: Insight Quote Card ── */}
        <motion.aside
          className="cb-rev-insight-card"
          aria-label="What CareerBridge understood"
          initial={reduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={
            reduced
              ? { duration: 0 }
              : { delay: 0.3, duration: 0.65, ease: [0.22, 1, 0.36, 1] }
          }
        >
          {/* Animated gold accent line */}
          <motion.div
            className="cb-rev-insight-accent"
            initial={reduced ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={
              reduced
                ? { duration: 0 }
                : { delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }
            }
            style={{ transformOrigin: "left" }}
            aria-hidden
          />

          <div className="cb-rev-insight-badge">
            <span>WHAT WE HEARD · CLUES NOT CONCLUSIONS</span>
          </div>

          <p className="cb-rev-insight-quote">
            &ldquo;{interpretation}&rdquo;
          </p>

          <p className="cb-rev-insight-sub">
            Signals to guide your exploration, not a psychological report or a
            fixed prediction.
          </p>
        </motion.aside>
      </div>
    </header>
  );
}
