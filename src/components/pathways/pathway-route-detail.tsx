"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  GraduationCap,
  Route,
  Scale,
  SearchCheck,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { SaveButton } from "@/components/save-button";
import styles from "./pathway-route-detail.module.css";

export type RouteDetailLink = {
  href: string;
  label: string;
  detail?: string | null;
};

export type RouteDetailAlternative = RouteDetailLink & {
  slug: string;
  routeType: string;
  duration?: string | null;
};

export type RouteDetailData = {
  slug: string;
  title: string;
  headline: string;
  continuation?: string;
  entryStage: "class10" | "class12";
  stageLabel: string;
  routeLabel: string;
  description: string;
  typicalDuration?: string | null;
  notes?: string | null;
  field?: RouteDetailLink | null;
  steps: { label: string; detail: string }[];
  courses: RouteDetailLink[];
  exams: RouteDetailLink[];
  institutions: RouteDetailLink[];
  careers: RouteDetailLink[];
  alternatives: RouteDetailAlternative[];
};

type ResourceGroup = {
  id: "courses" | "exams" | "institutions" | "careers";
  label: string;
  icon: typeof GraduationCap;
  intro: string;
  empty: string;
  items: RouteDetailLink[];
};

export function PathwayRouteDetail({ route }: { route: RouteDetailData }) {
  const reduceMotion = useReducedMotion();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeResource, setActiveResource] = useState<ResourceGroup["id"]>("courses");
  const [comparisonSlug, setComparisonSlug] = useState(route.alternatives[0]?.slug ?? "");
  const activeStep = route.steps[activeStepIndex] ?? route.steps[0];
  const resources = useMemo<ResourceGroup[]>(
    () => [
      { id: "courses", label: "Courses to explore", icon: GraduationCap, intro: "These courses are linked to this route in the catalogue. Review each one separately before choosing.", empty: "No courses are linked to this route entry yet.", items: route.courses },
      { id: "exams", label: "Exams to confirm", icon: SearchCheck, intro: "These examinations can matter for parts of this route. Check the current official notice before relying on a requirement.", empty: "No entrance exams are linked to this route entry.", items: route.exams },
      { id: "institutions", label: "Where to study", icon: Building2, intro: "These institutions are connected to courses in this route. Availability and admission details need checking directly with the institution.", empty: "No institutions are connected to the linked courses yet.", items: route.institutions },
      { id: "careers", label: "Career areas", icon: BriefcaseBusiness, intro: "These are related areas of work to investigate. They are examples, not guaranteed outcomes from this route.", empty: "No career areas are linked to this route entry yet.", items: route.careers },
    ],
    [route],
  );
  const availableResources = resources.filter((group) => group.items.length > 0);
  const currentResource = availableResources.find((group) => group.id === activeResource) ?? availableResources[0];
  const comparisonHref = comparisonSlug ? `/compare?type=pathway&a=${route.slug}&b=${comparisonSlug}` : `/pathways?stage=${route.entryStage}`;

  return <div className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <Link href={`/pathways?stage=${route.entryStage}`} className={styles.backLink}><ArrowLeft className="h-4 w-4" /> All routes {route.stageLabel.toLowerCase()}</Link>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.routeMeta}><span>{route.stageLabel}</span><span>{route.routeLabel}</span>{route.field && <Link href={route.field.href}>{route.field.label}</Link>}</p>
            <h1 className={styles.title}>{route.headline}</h1>
            {route.continuation && <p className={styles.continuation}>{route.continuation}</p>}
            <p className={styles.description}>{route.description}</p>
            <dl className={styles.heroFacts}><div><dt>Starts after</dt><dd>{route.stageLabel}</dd></div><div><dt>Typical duration</dt><dd>{route.typicalDuration ?? "Varies by provider"}</dd></div></dl>
            <div className={styles.heroActions}><SaveButton itemType="pathway" itemRef={route.slug} label={route.title} tone="forest" /><a href="#compare" className={styles.compareLink}><Scale className="h-4 w-4" /> Compare routes</a></div>
          </div>
          <aside className={styles.routeSummary} aria-label="Route at a glance">
            <p className={styles.summaryTitle}>The route at a glance</p>
            <ol className={styles.summarySteps}>{route.steps.map((step, index) => <li key={step.label}><span>{index + 1}</span><p>{step.label}</p></li>)}</ol>
          </aside>
        </div>
      </div>
    </header>

    <main className={styles.content}>
      <section aria-labelledby="route-map-title" className={styles.routeMap}>
        <div className={styles.sectionLead}><p className={styles.sectionHint}>Route guide</p><h2 id="route-map-title">Understand this route one step at a time.</h2><p>Select a stage to see what it usually involves. The order explains the route. It is not a checklist or a promise that every provider follows the same process.</p></div>
        {route.steps.length ? <div className={styles.stepExperience}>
          <nav aria-label="Route steps" className={styles.stepRail}><ol>{route.steps.map((step, index) => <li key={step.label}><button type="button" aria-pressed={index === activeStepIndex} onClick={() => setActiveStepIndex(index)} className={styles.stepButton}><span className={styles.stepNumber}>{index + 1}</span><span>{step.label}</span><ChevronRight className="h-4 w-4" /></button></li>)}</ol></nav>
          <AnimatePresence mode="wait" initial={false}>{activeStep && <motion.article key={activeStep.label} className={styles.stepSpotlight} aria-live="polite" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: reduceMotion ? 0 : .28, ease: [0.22, 1, 0.36, 1] }}><p className={styles.spotlightNumber}>Stage {activeStepIndex + 1} of {route.steps.length}</p><h3>{activeStep.label}</h3><p>{activeStep.detail}</p><div className={styles.stepControls}><button type="button" disabled={activeStepIndex === 0} onClick={() => setActiveStepIndex((index) => Math.max(0, index - 1))}><ChevronLeft className="h-4 w-4" /> Previous</button><button type="button" disabled={activeStepIndex === route.steps.length - 1} onClick={() => setActiveStepIndex((index) => Math.min(route.steps.length - 1, index + 1))}>Next stage <ChevronRight className="h-4 w-4" /></button></div></motion.article>}</AnimatePresence>
        </div> : <p className={styles.emptyCopy}>A step-by-step route has not been added to this entry yet.</p>}
        {route.notes && <aside className={styles.routeNote}><CheckCircle2 className="h-5 w-5" /><div><h3>Useful context</h3><p>{route.notes}</p></div></aside>}
      </section>

      <section aria-labelledby="explore-route-title" className={styles.exploreSection}>
        <div className={styles.sectionLead}><p className={styles.sectionHint}>Connected information</p><h2 id="explore-route-title">Explore the parts of this route.</h2><p>Use the links below to research the pieces that matter to you. Facts such as eligibility, openings, fees, and dates can change, so verify them with the provider.</p></div>
        {availableResources.length ? <div className={styles.resourceDock}>
          <div className={styles.resourceTabs} aria-label="Explore information connected to this route">{availableResources.map((group) => { const Icon = group.icon; return <button key={group.id} type="button" aria-pressed={currentResource?.id === group.id} onClick={() => setActiveResource(group.id)}><Icon className="h-4 w-4" /> {group.label}<span>{group.items.length}</span></button>; })}</div>
          <AnimatePresence mode="wait" initial={false}>{currentResource && <motion.div key={currentResource.id} className={styles.resourcePanel} aria-live="polite" initial={reduceMotion ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={reduceMotion ? undefined : { opacity: 0, x: -8 }} transition={{ duration: reduceMotion ? 0 : .24, ease: [0.22, 1, 0.36, 1] }}><p>{currentResource.intro}</p><ul>{currentResource.items.map((item) => <li key={item.href}><Link href={item.href}><span><strong>{item.label}</strong>{item.detail && <small>{item.detail}</small>}</span><ArrowUpRight className="h-4 w-4" /></Link></li>)}</ul></motion.div>}</AnimatePresence>
        </div> : <p className={styles.emptyCopy}>No linked courses, exams, institutions, or career areas have been added to this route yet.</p>}
      </section>

      <section id="compare" aria-labelledby="compare-title" className={styles.compareSection}>
        <div><p className={styles.sectionHint}>Compare, don&apos;t rank</p><h2 id="compare-title">See how another route differs.</h2><p>Compare two routes using their starting point, route type, usual duration, and steps. CareerBridge does not declare a universal winner.</p></div>
        {route.alternatives.length ? <div className={styles.compareControls}><label htmlFor="compare-route">Compare this route with<select id="compare-route" value={comparisonSlug} onChange={(event) => setComparisonSlug(event.target.value)}>{route.alternatives.map((route) => <option key={route.slug} value={route.slug}>{route.label}</option>)}</select></label><Link href={comparisonHref}>Compare routes <ArrowRight className="h-4 w-4" /></Link></div> : <Link href={`/pathways?stage=${route.entryStage}`} className={styles.compareBrowse}>Browse all routes {route.stageLabel.toLowerCase()} <ArrowRight className="h-4 w-4" /></Link>}
      </section>

      <section aria-labelledby="check-title" className={styles.checkSection}><div><p className={styles.sectionHint}>Before you decide</p><h2 id="check-title">What to check next.</h2></div><ol><li><span>1</span><div><strong>Course requirements</strong><p>Requirements can vary by course and institution.</p></div></li><li><span>2</span><div><strong>Current availability</strong><p>Check that the course or entrance process is currently open.</p></div></li><li><span>3</span><div><strong>Official information</strong><p>Use the provider or examination authority for current details.</p></div></li></ol></section>
    </main>
  </div>;
}
