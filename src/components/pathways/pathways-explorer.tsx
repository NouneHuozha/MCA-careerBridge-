"use client";

import Link from "next/link";
import { ArrowRight, BookOpenCheck, ChevronRight, CircleHelp, Compass, ExternalLink, Route, SearchCheck } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import styles from "./study-routes-guide.module.css";
import type { ExplorerField, ExplorerPathway } from "./pathway-types";

type Stage = "all" | "class10" | "class12";

const stageOptions: { value: Stage; label: string; note: string }[] = [
  { value: "all", label: "All routes", note: "See both starting points" },
  { value: "class10", label: "After Class 10", note: "Streams, diplomas and trades" },
  { value: "class12", label: "After Class 12", note: "Courses and professional routes" },
];

const routeTypeLabels: Record<string, string> = {
  academic: "Academic route",
  diploma: "Diploma route",
  vocational: "Vocational route",
  professional: "Professional route",
};

function stageTitle(stage: Exclude<Stage, "all">) {
  return stage === "class10" ? "Routes after Class 10" : "Routes after Class 12";
}

export function PathwaysExplorer({ pathways, fields, initialStage, initialField }: { pathways: ExplorerPathway[]; fields: ExplorerField[]; initialStage?: string; initialField?: string }) {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(initialStage === "class10" || initialStage === "class12" ? initialStage : "all");
  const [field, setField] = useState(initialField ?? "");
  const [selectedSlug, setSelectedSlug] = useState(pathways[0]?.slug ?? "");
  const fieldNames = useMemo(() => new Map(fields.map((field) => [field.slug, field.name])), [fields]);
  const visiblePathways = useMemo(
    () => pathways.filter((pathway) => (stage === "all" || pathway.entryStage === stage) && (!field || pathway.fieldSlug === field)),
    [field, pathways, stage],
  );
  const selectedPathway = visiblePathways.find((pathway) => pathway.slug === selectedSlug) ?? visiblePathways[0] ?? null;
  const groupedPathways = useMemo(
    () => (stage === "all" ? (["class10", "class12"] as const).map((entryStage) => ({ entryStage, pathways: visiblePathways.filter((pathway) => pathway.entryStage === entryStage) })).filter((group) => group.pathways.length) : [{ entryStage: stage, pathways: visiblePathways }]),
    [stage, visiblePathways],
  );

  function changeStage(nextStage: Stage) {
    setStage(nextStage);
    setField("");
  }

  return <div className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div>
          <p className={styles.crumb}><Compass className="h-4 w-4" /> Explore Library / Study routes</p>
          <h1 className={styles.title}>Study routes after Class 10 or Class 12</h1>
          <p className={styles.intro}>Explore common ways to continue learning. Choose where you are starting, then read each route step by step before deciding what deserves a closer look.</p>
          <p className={styles.generalNote}><CircleHelp className="h-4 w-4" /> General information only — these routes are examples to investigate, not a recommendation or a promise of admission or employment.</p>
        </div>
        <div className={styles.guideGraphic} aria-hidden="true">
          <div className={styles.guideSheet}>
            <p className={styles.guideSheetTitle}>How to read a route</p>
            <div className={styles.guideRoute}><span className={styles.guideDot}>1</span><span className={styles.guideLine} /><span className={styles.guideDestination}><Route className="h-4 w-4" /></span></div>
            <p className={styles.guideText}>Start with your current class, follow the usual learning steps, then check the specific requirements with the provider.</p>
          </div>
        </div>
      </div>
    </header>

    <section className={styles.stagePanel} aria-labelledby="start-point-title">
      <p id="start-point-title" className={styles.stagePanelHeading}>Start from where you are</p>
      <div className={styles.stageTabs}>
        {stageOptions.map((option) => {
          const active = stage === option.value;
          return <button key={option.value} type="button" className={styles.stageTab} aria-pressed={active} onClick={() => changeStage(option.value)}>{active && <motion.span layoutId="active-study-stage" className={styles.activeStage} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}<span className={styles.stageTabLabel}>{option.label}</span><span className={styles.stageTabNote}>{option.note}</span></button>;
        })}
      </div>
    </section>

    <p className={styles.howTo}><strong>Choose a starting point</strong><ArrowRight className="h-4 w-4" /><strong>Read the route sequence</strong><ArrowRight className="h-4 w-4" /><strong>Check current details before choosing</strong></p>

    <section id="routes" className={styles.content} aria-labelledby="route-guide-title">
      <div className={styles.contentHeader}>
        <div><p className={styles.crumb}><BookOpenCheck className="h-4 w-4" /> Route guide</p><h2 id="route-guide-title" className={styles.sectionTitle}>Pick a route. Understand what comes next.</h2></div>
        <p className={styles.sectionIntro}>The list keeps all routes equally visible. Select one to see its usual sequence, the linked courses and examinations in the catalogue, and what needs checking before you rely on it.</p>
      </div>

      <div className={styles.filterBar}>
        <label className={styles.filterLabel} htmlFor="route-interest">Interested in a particular area? <span>Optional</span><select id="route-interest" className={styles.filterSelect} value={field} onChange={(event) => setField(event.target.value)}><option value="">Show every area</option>{fields.map((field) => <option key={field.slug} value={field.slug}>{field.name}</option>)}</select></label>
        {field && <button type="button" className={styles.clearFilter} onClick={() => setField("")}>Clear interest filter</button>}
        <p className={styles.resultCount} aria-live="polite">{visiblePathways.length} route example{visiblePathways.length === 1 ? "" : "s"}{field ? ` in ${fieldNames.get(field)}` : ""}</p>
      </div>

      {selectedPathway ? <div className={styles.browser}>
        <nav className={styles.routeNav} aria-label="Study routes">
          <p className={styles.routeNavHeading}>Choose a route to understand it</p>
          {groupedPathways.map((group) => <section key={group.entryStage} className={styles.routeGroup} aria-labelledby={`route-group-${group.entryStage}`}><h3 id={`route-group-${group.entryStage}`} className={styles.routeGroupTitle}>{stageTitle(group.entryStage as Exclude<Stage, "all">)}</h3>{group.pathways.map((pathway) => <button key={pathway.slug} type="button" className={styles.routeChoice} aria-pressed={selectedPathway.slug === pathway.slug} onClick={() => setSelectedSlug(pathway.slug)}><span><span className={styles.routeChoiceTitle}>{pathway.title}</span><span className={styles.routeChoiceMeta}>{routeTypeLabels[pathway.routeType] ?? "Study route"}{pathway.typicalDuration ? ` · ${pathway.typicalDuration}` : ""}</span></span><ChevronRight aria-hidden="true" /></button>)}</section>)}
        </nav>
        <AnimatePresence mode="wait" initial={false}>
          <motion.article key={selectedPathway.slug} className={styles.routeDetail} aria-labelledby="selected-route-title" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0 : .28, ease: [0.22, 1, 0.36, 1] }}>
            <p className={styles.detailTopline}><span>{selectedPathway.entryStage === "class10" ? "Begins after Class 10" : "Begins after Class 12"}</span><span>{routeTypeLabels[selectedPathway.routeType] ?? "Study route"}</span>{selectedPathway.fieldSlug && <span>{fieldNames.get(selectedPathway.fieldSlug)}</span>}</p>
            <h2 id="selected-route-title" className={styles.detailTitle}>{selectedPathway.title}</h2>
            <p className={styles.detailDescription}>{selectedPathway.description}</p>
            <dl className={styles.facts}><div><dt>Starts after</dt><dd>{selectedPathway.entryStage === "class10" ? "Class 10" : "Class 12"}</dd></div><div><dt>Route type</dt><dd>{routeTypeLabels[selectedPathway.routeType] ?? "Study route"}</dd></div><div><dt>Typical duration</dt><dd>{selectedPathway.typicalDuration ?? "Varies by provider"}</dd></div></dl>
            <h3 className={styles.stepsTitle}>What this route typically looks like</h3><p className={styles.stepsIntro}>This is a general sequence. Exact eligibility, entrance rules and availability vary by institution and year.</p>
            <ol className={styles.steps}>{selectedPathway.steps.map((step, index) => <motion.li key={`${selectedPathway.slug}-${step.label}`} className={styles.step} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .25, delay: reduceMotion ? 0 : .07 * index }}><span className={styles.stepNumber}>{index + 1}</span><p className={styles.stepLabel}>{step.label}</p><p className={styles.stepDetail}>{step.detail}</p></motion.li>)}</ol>
            <div className={styles.detailFoot}>
              {selectedPathway.notes && <aside className={styles.routeNote}>{selectedPathway.notes}</aside>}
              {(selectedPathway.linkedCourses.length > 0 || selectedPathway.linkedExams.length > 0) && <div className={styles.linkGroups}>{selectedPathway.linkedCourses.length > 0 && <div><p className={styles.linkGroupTitle}>Related courses</p><ul className={styles.linkList}>{selectedPathway.linkedCourses.map((course) => <li key={course.href}><Link href={course.href}>{course.label}</Link></li>)}</ul></div>}{selectedPathway.linkedExams.length > 0 && <div><p className={styles.linkGroupTitle}>Exams to check</p><ul className={styles.linkList}>{selectedPathway.linkedExams.map((exam) => <li key={exam.href}><Link href={exam.href}>{exam.label}</Link></li>)}</ul></div>}</div>}
              <div className={styles.detailActions}><Link href={`/pathways/${selectedPathway.slug}`} className={styles.openRoute}>Understand this route <ArrowRight className="h-4 w-4" /></Link><Link href="/explore" className={styles.exploreLink}>Explore career areas <ExternalLink className="h-3.5 w-3.5" /></Link></div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div> : <div className={styles.empty}><h3>No routes match this interest yet.</h3><p>Clear the interest filter to see every route available from your selected starting point.</p>{field && <button type="button" className={styles.clearFilter} onClick={() => setField("")}>Show all routes</button>}</div>}
    </section>

    <section className={styles.checklist} aria-labelledby="check-title"><div className={styles.checklistInner}><div><p className={styles.crumb}><SearchCheck className="h-4 w-4" /> Before you decide</p><h2 id="check-title" className={styles.checklistTitle}>Use a route to ask better questions.</h2></div><ol className={styles.checklistItems}><li><span>1</span><div><strong>Check entry requirements</strong>Requirements can differ by institution, course and admission year.</div></li><li><span>2</span><div><strong>Check availability and dates</strong>Confirm that the course, entrance process or training route is currently available.</div></li><li><span>3</span><div><strong>Use official sources</strong>Follow the provider or examination authority for the latest details.</div></li></ol></div></section>
  </div>;
}
