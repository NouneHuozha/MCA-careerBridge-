"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Atom,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleAlert,
  Compass,
  Hammer,
  HeartPulse,
  Landmark,
  Leaf,
  Monitor,
  Route,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { useId, useState } from "react";
import { ExploreAnotherPossibilityLink } from "@/components/guidance/explore-another-possibility-link";

type Connection = { label: string; detail: string };
type FieldGuide = {
  slug: string;
  name: string;
  tagline: string | null;
  overview: string;
  imageSrc: string;
  connections: Connection[];
  whatPeopleDo: string[];
  usefulSubjects: string[];
  skills: string[];
  pros: string[];
  challenges: string[];
  alternatives: string[];
};

type GuideTab = "inside" | "build" | "realities";

function FieldGlyph({
  slug,
  className = "h-6 w-6",
  strokeWidth = 1.6,
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

const tabs: { id: GuideTab; label: string; description: string; Icon: typeof BriefcaseBusiness }[] = [
  {
    id: "inside",
    label: "Inside the field",
    description: "The work, environments, and day-to-day activities you may encounter.",
    Icon: BriefcaseBusiness,
  },
  {
    id: "build",
    label: "What to build",
    description: "Useful subjects and practical skills that can support your start.",
    Icon: BookOpen,
  },
  {
    id: "realities",
    label: "Keep in view",
    description: "Rewarding moments, honest tradeoffs, and alternative pathways.",
    Icon: ShieldCheck,
  },
];

export function DirectionFieldGuide({ field }: { field: FieldGuide }) {
  const [activeTab, setActiveTab] = useState<GuideTab>("inside");
  const reduceMotion = useReducedMotion();
  const tabId = useId().replace(/:/g, "");
  const activeTabIndex = tabs.findIndex((tab) => tab.id === activeTab);

  function selectTab(next: GuideTab) {
    setActiveTab(next);
  }

  function moveTab(index: number, delta: number) {
    const nextIndex = (index + delta + tabs.length) % tabs.length;
    const next = tabs[nextIndex];
    selectTab(next.id);
    requestAnimationFrame(() =>
      document.getElementById(`${tabId}-${next.id}`)?.focus()
    );
  }

  return (
    <main className="cb-guide-page" id="main">
      <div className="cb-guide-wrap">

        {/* ── Top Overview: Identity Hero + Connection Sidebar ── */}
        <header className="cb-guide-hero" aria-labelledby="field-guide-title">

          {/* Left: Deep Forest Field Identity Card */}
          <section className="cb-guide-identity">
            <div className="cb-guide-image-frame">
              <Image
                src={field.imageSrc}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 38vw, 100vw"
                className="object-cover"
              />
              <span className="cb-guide-image-scrim" aria-hidden />
              <div className="cb-guide-identity-mark" aria-hidden>
                <FieldGlyph slug={field.slug} className="h-6 w-6" />
              </div>
            </div>

            <div className="cb-guide-identity-copy">
              <div className="cb-guide-eyebrow">
                <Route className="h-3.5 w-3.5" aria-hidden />
                <span>FIELD GUIDE · DEEP DIVE</span>
              </div>

              <h1 id="field-guide-title">Inside {field.name}</h1>

              {field.tagline && (
                <p className="cb-guide-tagline">{field.tagline}</p>
              )}

              <p className="cb-guide-overview">{field.overview}</p>
            </div>
          </section>

          {/* Right: Pale Sage Connection Points Card */}
          <aside className="cb-guide-connection" aria-labelledby="connection-title">
            <div className="cb-guide-connection-head">
              <span className="cb-guide-connection-icon" aria-hidden>
                <Compass className="h-4 w-4" strokeWidth={1.8} />
              </span>
              <p className="cb-guide-connection-kicker">WHY THIS FIELD APPEARED</p>
            </div>

            <h2 id="connection-title">Your connection points</h2>

            {field.connections.length > 0 ? (
              <ul className="cb-guide-connections-list">
                {field.connections.map((connection) => (
                  <li key={`${connection.label}-${connection.detail}`} className="cb-guide-connection-item">
                    <span className="cb-guide-check" aria-hidden>
                      <Check className="h-3.5 w-3.5" strokeWidth={2.4} />
                    </span>
                    <div>
                      <strong>{connection.label}</strong>
                      <p>{connection.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cb-guide-connection-empty">
                This is one area to understand while you work out what matters to you.
              </p>
            )}

            <Link href="/guidance/review?mode=correct" className="cb-guide-review-link">
              Review my answers →
            </Link>
          </aside>
        </header>

        {/* ── Exploration Deck: 3 Tabs + Interactive Panel ── */}
        <section className="cb-guide-deck" aria-labelledby="guide-title">
          <div className="cb-guide-deck-head">
            <div>
              <p className="cb-guide-deck-kicker">EXPLORE THE FIELD</p>
              <h2 id="guide-title">A closer look, at your pace</h2>
            </div>
            <span className="cb-guide-deck-tip">Choose a section to learn more</span>
          </div>

          <LayoutGroup id={`field-guide-${field.slug}`}>
            <div className="cb-guide-tablist" role="tablist" aria-label={`Explore ${field.name}`}>
              {tabs.map((tab, index) => {
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    id={`${tabId}-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tabId}-${tab.id}-panel`}
                    tabIndex={isActive ? 0 : -1}
                    className={`cb-guide-tab ${isActive ? "is-active" : ""}`}
                    onClick={() => selectTab(tab.id)}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                        event.preventDefault();
                        moveTab(index, 1);
                      }
                      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                        event.preventDefault();
                        moveTab(index, -1);
                      }
                      if (event.key === "Home") {
                        event.preventDefault();
                        moveTab(index, -index);
                      }
                      if (event.key === "End") {
                        event.preventDefault();
                        moveTab(index, tabs.length - index - 1);
                      }
                    }}
                  >
                    {isActive ? (
                      <motion.div
                        layoutId="guide-active-tab-highlight"
                        className="cb-guide-tab-highlight"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 420, damping: 34 }
                        }
                      />
                    ) : null}
                    <span className="cb-guide-tab-icon" aria-hidden>
                      <tab.Icon className="h-4 w-4" strokeWidth={1.8} />
                    </span>
                    <span className="cb-guide-tab-label">
                      <strong>{tab.label}</strong>
                    </span>
                    <span className="cb-guide-tab-num" aria-hidden>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <AnimatePresence mode="wait" initial={false}>
            <motion.article
              key={activeTab}
              id={`${tabId}-${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${tabId}-${activeTab}`}
              className="cb-guide-panel"
              initial={
                reduceMotion ? false : { opacity: 0, y: 14, filter: "blur(3px)" }
              }
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={
                reduceMotion ? undefined : { opacity: 0, y: -8, filter: "blur(2px)" }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
              }
            >
              {/* Left Column: Panel Overview & Intro */}
              <aside className="cb-guide-panel-intro">
                <span className="cb-guide-panel-icon" aria-hidden>
                  {activeTab === "inside" ? (
                    <BriefcaseBusiness className="h-6 w-6" strokeWidth={1.8} />
                  ) : activeTab === "build" ? (
                    <BookOpen className="h-6 w-6" strokeWidth={1.8} />
                  ) : (
                    <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
                  )}
                </span>
                <p className="cb-guide-panel-section-num">
                  SECTION {String(activeTabIndex + 1).padStart(2, "0")}
                </p>
                <h3 className="cb-guide-panel-title">
                  {tabs[activeTabIndex].label}
                </h3>
                <p className="cb-guide-panel-desc">
                  {tabs[activeTabIndex].description}
                </p>
              </aside>

              {/* Right Column: Tab Content */}
              {activeTab === "inside" && (
                <section className="cb-guide-panel-content">
                  <div className="cb-guide-content-head">
                    <p className="cb-guide-content-kicker">WHAT THIS CAN LOOK LIKE</p>
                    <h3 className="cb-guide-content-title">Work that shapes the field</h3>
                  </div>
                  <div className="cb-guide-work-grid">
                    {field.whatPeopleDo.slice(0, 6).map((item, index) => (
                      <motion.article
                        key={item}
                        className="cb-guide-work-card"
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { delay: 0.06 + index * 0.05, duration: 0.24 }
                        }
                      >
                        <span className="cb-guide-work-num" aria-hidden>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p>{item}</p>
                      </motion.article>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === "build" && (
                <section className="cb-guide-panel-content">
                  <div className="cb-guide-content-head">
                    <p className="cb-guide-content-kicker">BUILD A FOUNDATION</p>
                    <h3 className="cb-guide-content-title">Useful subjects and strengths</h3>
                  </div>
                  <div className="cb-guide-build-grid">
                    <div className="cb-guide-build-card">
                      <div className="cb-guide-build-card-head">
                        <BookOpen className="h-4.5 w-4.5" aria-hidden />
                        <h4>Subjects that help</h4>
                      </div>
                      <div className="cb-guide-chips">
                        {field.usefulSubjects.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>

                    <div className="cb-guide-build-card">
                      <div className="cb-guide-build-card-head">
                        <Hammer className="h-4.5 w-4.5" aria-hidden />
                        <h4>Skills to practise</h4>
                      </div>
                      <div className="cb-guide-chips">
                        {field.skills.map((item) => (
                          <span key={item}>{item}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="cb-guide-build-note">
                    You do not need every skill before you begin. The goal is to
                    notice which ones you would enjoy practising.
                  </p>
                </section>
              )}

              {activeTab === "realities" && (
                <section className="cb-guide-panel-content">
                  <div className="cb-guide-content-head">
                    <p className="cb-guide-content-kicker">SEE THE WHOLE PICTURE</p>
                    <h3 className="cb-guide-content-title">Benefits, tradeoffs, and options</h3>
                  </div>
                  <div className="cb-guide-realities-grid">
                    <div className="cb-guide-reality-card cb-reality-upside">
                      <div className="cb-guide-reality-head">
                        <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                        <h4>What may feel rewarding</h4>
                      </div>
                      <ul>
                        {field.pros.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="cb-guide-reality-card cb-reality-watch">
                      <div className="cb-guide-reality-head">
                        <CircleAlert className="h-4 w-4" strokeWidth={2} aria-hidden />
                        <h4>What to keep in view</h4>
                      </div>
                      <ul>
                        {field.challenges.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="cb-guide-reality-card cb-reality-alt">
                      <div className="cb-guide-reality-head">
                        <Compass className="h-4 w-4" strokeWidth={2} aria-hidden />
                        <h4>Other ways in</h4>
                      </div>
                      <ul>
                        {field.alternatives.slice(0, 3).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}
            </motion.article>
          </AnimatePresence>
        </section>

        {/* ── Footer CTA Banner ── */}
        <footer className="cb-guide-footer">
          <div className="cb-guide-footer-copy">
            <p className="cb-guide-footer-kicker">READY FOR THE NEXT LAYER?</p>
            <h2>See how you could move toward {field.name}</h2>
            <span>
              Compare routes, then look at courses and practical details at your own pace.
            </span>
          </div>

          <div className="cb-guide-footer-actions">
            <Link
              href={`/guidance/direction/${encodeURIComponent(field.slug)}/routes`}
              className="cb-guide-cta-primary"
            >
              <span>Explore possible routes</span>
              <ArrowRight className="h-4.5 w-4.5" strokeWidth={2.2} aria-hidden />
            </Link>

            <Link
              href={`/guidance/direction/${encodeURIComponent(field.slug)}/courses`}
              className="cb-guide-cta-secondary"
            >
              See courses
            </Link>

            <ExploreAnotherPossibilityLink
              directionSlug={field.slug}
              directionName={field.name}
            />
          </div>
        </footer>

      </div>
    </main>
  );
}
