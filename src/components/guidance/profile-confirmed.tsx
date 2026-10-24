"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";

export interface ProfileDossierData {
  stage: string;
  stageDetail?: string | null;
  signals: string[];
  priorities: string[];
  location?: string | null;
  financial?: string | null;
}

export interface ProfileConfirmedProps {
  dossier: ProfileDossierData;
  nextHref: string;
}

export function ProfileConfirmed({ dossier, nextHref }: ProfileConfirmedProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="cb-confirmed-fullscreen">
      {/* ── Ambient Decorative Geometry ── */}
      <div className="cb-confirmed-ambient-bg" aria-hidden>
        <div className="cb-confirmed-ambient-orb-1" />
        <div className="cb-confirmed-ambient-orb-2" />
        <div className="cb-confirmed-ambient-grid" />
      </div>

      <div className="cb-confirmed-container">
        {/* ── Left Column: Main Confirmation Hero ── */}
        <section className="cb-confirmed-main-column" aria-labelledby="confirmed-heading">
          {/* Animated Verification Seal */}
          <motion.div
            className="cb-confirmed-badge-row"
            initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="cb-confirmed-seal">
              <span className="cb-confirmed-seal-ring" />
              <div className="cb-confirmed-seal-icon">
                <Check className="h-4 w-4" strokeWidth={3} />
              </div>
            </div>
            <span className="cb-confirmed-status-pill">
              <span className="cb-confirmed-status-dot" />
              PROFILE CONFIRMED · EXPLORATION READY
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            id="confirmed-heading"
            className="cb-confirmed-title"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.55 }}
          >
            Your starting picture is confirmed
          </motion.h1>

          {/* Lead Copy */}
          <motion.p
            className="cb-confirmed-lead"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.55 }}
          >
            Your answers have been synthesized into your personalized exploration profile. We&apos;ll
            use these signals to illuminate matching career directions, academic routes, and
            institutions—giving you clarity to discover possibilities at your own pace.
          </motion.p>

          {/* Forward Momentum Action (Primary CTA) */}
          <motion.div
            className="cb-confirmed-action-row"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26, duration: 0.55 }}
          >
            <Link href={nextHref} className="cb-confirmed-cta-btn">
              <span>Explore possible directions</span>
              <motion.span
                className="cb-confirmed-cta-arrow"
                whileHover={shouldReduceMotion ? {} : { x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <ArrowRight className="h-5 w-5" strokeWidth={2.4} />
              </motion.span>
            </Link>
          </motion.div>

          {/* Reassurance Assurance Note */}
          <motion.div
            className="cb-confirmed-reassurance-box"
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            <ShieldCheck className="h-5 w-5 text-[#6F887B] shrink-0" strokeWidth={2} />
            <p>
              <strong>Exploration is open & non-binding.</strong> These signals are starting clues
              to guide discovery—they do not lock you into any single decision or limit what you can
              explore.
            </p>
          </motion.div>
        </section>

        {/* ── Right Column: Verified Profile Dossier (Data Display) ── */}
        <motion.aside
          className="cb-confirmed-dossier-column"
          aria-labelledby="dossier-title"
          initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cb-confirmed-dossier-card">
            {/* Top gold hairline */}
            <div className="cb-confirmed-dossier-hairline" aria-hidden />

            {/* Dossier Header */}
            <header className="cb-confirmed-dossier-header">
              <div className="cb-confirmed-dossier-top">
                <span className="cb-confirmed-dossier-eyebrow">VERIFIED DOSSIER</span>
                <span className="cb-confirmed-dossier-stamp">
                  <Check className="h-3 w-3" strokeWidth={3} />
                  CONFIRMED RECORD
                </span>
              </div>
              <h2 id="dossier-title" className="cb-confirmed-dossier-title">
                What we&apos;re keeping in view
              </h2>
              <p className="cb-confirmed-dossier-sub">
                Official signal baseline powering your upcoming direction matches.
              </p>
            </header>

            {/* Dossier Sections */}
            <div className="cb-confirmed-dossier-body">
              {/* Section 1: Foundation */}
              <div className="cb-dossier-entry">
                <div className="cb-dossier-entry-header">
                  <span className="cb-dossier-icon cb-icon-mint">
                    <GraduationCap className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="cb-dossier-entry-title">Academic Stage</h3>
                    <span className="cb-dossier-entry-desc">Your active foundation</span>
                  </div>
                </div>
                <div className="cb-dossier-tags">
                  <span className="cb-dossier-tag cb-tag-primary">{dossier.stage}</span>
                  {dossier.stageDetail && (
                    <span className="cb-dossier-tag">{dossier.stageDetail}</span>
                  )}
                </div>
              </div>

              {/* Section 2: Curiosity & Strengths */}
              <div className="cb-dossier-entry">
                <div className="cb-dossier-entry-header">
                  <span className="cb-dossier-icon cb-icon-amber">
                    <Sparkles className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="cb-dossier-entry-title">Interests & Strengths</h3>
                    <span className="cb-dossier-entry-desc">Curiosity signals from counselling</span>
                  </div>
                </div>
                <div className="cb-dossier-tags">
                  {dossier.signals.length > 0 ? (
                    dossier.signals.map((signal) => (
                      <span key={signal} className="cb-dossier-tag">
                        {signal}
                      </span>
                    ))
                  ) : (
                    <span className="cb-dossier-tag-muted">Open to explore all areas</span>
                  )}
                </div>
              </div>

              {/* Section 3: Priorities & Work Style */}
              <div className="cb-dossier-entry">
                <div className="cb-dossier-entry-header">
                  <span className="cb-dossier-icon cb-icon-sage">
                    <Sprout className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="cb-dossier-entry-title">Priorities & Approach</h3>
                    <span className="cb-dossier-entry-desc">Values shaping your decisions</span>
                  </div>
                </div>
                <div className="cb-dossier-tags">
                  {dossier.priorities.length > 0 ? (
                    dossier.priorities.map((item) => (
                      <span key={item} className="cb-dossier-tag">
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="cb-dossier-tag-muted">Priorities remain flexible</span>
                  )}
                </div>
              </div>

              {/* Section 4: Geographic & Scope */}
              <div className="cb-dossier-entry">
                <div className="cb-dossier-entry-header">
                  <span className="cb-dossier-icon cb-icon-lavender">
                    <MapPin className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="cb-dossier-entry-title">Study Scope & Location</h3>
                    <span className="cb-dossier-entry-desc">Practical geographic preference</span>
                  </div>
                </div>
                <div className="cb-dossier-tags">
                  <span className="cb-dossier-tag">
                    {dossier.location ?? "Location open to compare"}
                  </span>
                  {dossier.financial && (
                    <span className="cb-dossier-tag">{dossier.financial}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dossier Footer / Imprint */}
            <footer className="cb-confirmed-dossier-footer">
              <Compass className="h-3.5 w-3.5 text-[#6F887B]" strokeWidth={2} />
              <span>CareerBridge Guidance System · Ready for Exploration</span>
            </footer>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
