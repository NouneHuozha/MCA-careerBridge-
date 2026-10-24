"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  HeartPulse,
  Home,
  Leaf,
  LifeBuoy,
  Monitor,
  UserRound,
  X,
  Menu,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { LogoutDialog } from "@/components/auth/logout-dialog";

type GlobalDestination = { href: string; label: string; icon: LucideIcon };
const globalDestinations: GlobalDestination[] = [
  { href: "/guidance", label: "My Guidance", icon: Home },
  { href: "/guidance/explorations", label: "My Explorations", icon: Compass },
  { href: "/explore", label: "Explore Library", icon: BookOpen },
  { href: "/mentor", label: "Help", icon: LifeBuoy },
];

function isDestinationActive(pathname: string, href: string) {
  const isExplorationDetail = pathname.startsWith("/guidance/direction/");
  if (href === "/guidance") return pathname === "/guidance" || (pathname.startsWith("/guidance/") && pathname !== "/guidance/explorations" && !isExplorationDetail);
  if (href === "/guidance/explorations") return pathname === href || isExplorationDetail;
  if (href === "/explore") return pathname === "/explore" || pathname.startsWith("/explore/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DestinationLinks({ pathname, onNavigate, mobile = false }: { pathname: string; onNavigate?: () => void; mobile?: boolean }) {
  const reduceMotion = useReducedMotion();
  return <>
    {globalDestinations.map(({ href, label, icon: Icon }) => {
      const active = isDestinationActive(pathname, href);
      return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={mobile
        ? `cb-guidance-mobile-link flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium ${active ? "is-active" : ""}`
        : `cb-guidance-nav-link inline-flex min-h-11 items-center gap-2 px-3 text-sm font-semibold ${active ? "is-active" : ""}`}>
        {active ? <motion.span aria-hidden className="cb-guidance-nav-active" layoutId={`guidance-nav-active-${mobile ? "mobile" : "desktop"}`} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} /> : null}
        <Icon aria-hidden className="relative z-[1] h-4 w-4 shrink-0" strokeWidth={1.8} /><span className="relative z-[1]">{label}</span>
      </Link>;
    })}
  </>;
}

function ProfileMenu({ account }: { account: { name: string | null; email: string } | null }) {
  return <details className="cb-guidance-profile group relative shrink-0">
    <summary aria-label="Open profile menu" className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-full px-1.5 text-sm font-semibold text-[var(--g-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g-primary)] [&::-webkit-details-marker]:hidden">
      <span aria-hidden className="cb-guidance-profile-avatar grid h-8 w-8 place-items-center rounded-full"><UserRound className="h-4 w-4" strokeWidth={1.8} /></span>
      <span className="hidden xl:inline">Profile</span>
      <ChevronDown aria-hidden className="hidden h-3.5 w-3.5 transition-transform group-open:rotate-180 xl:block" />
    </summary>
    <div className="cb-guidance-profile-menu absolute right-0 top-full z-50 mt-3 w-60 p-2">
      <div className="px-3 pb-2 pt-1">
        <p>{account ? "YOUR ACCOUNT" : "GUEST SESSION"}</p>
        {account ? <><span>{account.name?.trim() || account.email}</span><span>{account.email}</span></> : <span>Sign in to save your progress.</span>}
      </div>
      {account ? <Link href="/guidance/account" className="cb-guidance-profile-item">Account details <UserRound aria-hidden className="h-4 w-4" /></Link> : <Link href="/sign-in?next=%2Fguidance" className="cb-guidance-profile-item">Sign in / Sign up <UserRound aria-hidden className="h-4 w-4" /></Link>}
      <Link href="/guidance/review?mode=correct" className="cb-guidance-profile-item">Review my answers <ChevronDown aria-hidden className="h-4 w-4 -rotate-90" /></Link>
      <Link href="/guidance/explorations" className="cb-guidance-profile-item">My explorations <Compass aria-hidden className="h-4 w-4" /></Link>
      {account ? <LogoutDialog compact /> : null}
    </div>
  </details>;
}

function GuidanceHeader({ account }: { account: { name: string | null; email: string } | null }) {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const mobileOpen = openPathname === pathname;
  if (pathname.startsWith("/guidance/review/")) return null;

  return <header className="cb-guidance-header relative z-40">
    <div className="cb-guidance-header-inner mx-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 sm:px-8 lg:grid-cols-[minmax(190px,1fr)_auto_minmax(190px,1fr)] lg:px-12">
      <Logo size="sm" className="cb-guidance-brand" />
      <LayoutGroup id="guidance-primary-navigation">
        <nav aria-label="Primary" className="cb-guidance-primary hidden min-w-0 items-center lg:flex">
          <DestinationLinks pathname={pathname} />
        </nav>
      </LayoutGroup>
      <div className="ml-auto flex shrink-0 items-center gap-2 lg:justify-self-end lg:gap-3">
        <ProfileMenu account={account} />
        <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="mobile-guidance-menu" onClick={() => setOpenPathname(mobileOpen ? null : pathname)} className="cb-guidance-menu-button grid h-10 w-10 place-items-center rounded-full text-[var(--g-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g-primary)] lg:hidden">
          {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {mobileOpen ? <div id="mobile-guidance-menu" className="cb-guidance-mobile-panel lg:hidden">
      <LayoutGroup id="guidance-mobile-navigation">
        <nav aria-label="Mobile primary" className="mx-auto grid max-h-[70dvh] gap-1 overflow-y-auto px-5 py-3 sm:px-8">
          <DestinationLinks pathname={pathname} onNavigate={() => setOpenPathname(null)} mobile />
        </nav>
      </LayoutGroup>
    </div> : null}
  </header>;
}

function decodeSegment(value: string) {
  try { return decodeURIComponent(value); } catch { return value; }
}

function titleForSlug(value: string) {
  const slug = decodeSegment(value).toLowerCase();
  const aliases: Record<string, string> = {
    technology: "Technology",
    government: "Government service and community",
    "social-sciences": "Social sciences and community",
    healthcare: "Healthcare",
    "agriculture-environment": "Agriculture and environment",
    "class10-science-stream": "Engineering or technical degree",
    "class10-polytechnic-diploma": "Computing-focused diploma route",
    "class10-iti-trade": "Applied diploma or skill route",
    "computing-applications-degree": "Computing and applications degree",
    "class12-computing-applications-degree": "Computing and applications degree",
    bca: "BCA",
    "bachelor-of-computer-applications": "BCA",
    "bsc-computer-science": "B.Sc. Computer Science",
    "b-sc-computer-science": "B.Sc. Computer Science",
  };
  if (aliases[slug]) return aliases[slug];
  return slug.split("-").filter(Boolean).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" ");
}

function currentContext(tail: string[], sourceCheck = false) {
  if (sourceCheck && tail.includes("institutions")) return "Institutions · Source check";
  if (!tail.length) return "Overview";
  if (tail.at(-1) === "explore-another") return "Explore another possibility";
  const routeIndex = tail.indexOf("routes");
  if (tail.at(-1) === "compare" && routeIndex >= 0 && tail[routeIndex + 2] === "courses") return "Courses · Compare courses";
  const courseIndex = tail.indexOf("courses");
  const courseTrail = courseIndex >= 0 && tail[courseIndex + 1]
    ? `Courses · ${titleForSlug(tail[courseIndex + 1])}`
    : null;
  if (tail.at(-1) === "map" && tail.includes("institutions")) return `${courseTrail ? `${courseTrail} · ` : ""}Map and directions`;
  if (tail.at(-2) === "sources" && tail.at(-1) === "official" && courseTrail) return `${courseTrail} · Official source`;
  if (tail.at(-1) === "practical-checks" && courseIndex >= 0 && tail[courseIndex + 1]) return `Practical checks · ${tail[courseIndex + 1] === "bca" ? "BCA" : titleForSlug(tail[courseIndex + 1])}`;
  if (tail.at(-1) === "application") return `${courseTrail ? `${courseTrail} · ` : ""}Application and requirements`;
  if (tail.at(-2) === "exams-scholarships") return `${courseTrail ? `${courseTrail} · ` : ""}Entrance exam`;
  if (tail.at(-1) === "exams-scholarships") return `${courseTrail ? `${courseTrail} · ` : ""}Entrance exams and scholarships`;
  if (tail.at(-1) === "practical-checks") return `${courseTrail ? `${courseTrail} · ` : ""}Practical checks`;
  if (tail.includes("institutions")) return `${courseTrail ? `${courseTrail} · ` : ""}${tail[tail.indexOf("institutions") + 1] ? "Institution details" : "Institutions"}`;
  if (tail[0] === "routes") {
    if (tail.length === 1) return "Routes";
    const route = titleForSlug(tail[1]);
    if (tail[2] === "courses") {
      if (tail.length < 4) return `Routes · ${route} · Courses`;
      const course = titleForSlug(tail[3]);
      if (tail[4] === "institutions") return tail[5] ? `Courses · ${course} · Institution details` : `Courses · ${course} · Institutions`;
      return `Courses · ${course}`;
    }
    return `Routes · ${route}`;
  }
  if (tail[0] === "courses") {
    if (tail.length === 1) return "Courses";
    return `Courses · ${titleForSlug(tail[1])}`;
  }
  return titleForSlug(tail.at(-1) ?? "Overview");
}

type SwitchOption = { slug: string; name: string; tagline: string };

function SwitchDirectionIcon({ slug, className = "h-8 w-8" }: { slug: string; className?: string }) {
  if (slug === "technology") return <Monitor aria-hidden className={className} strokeWidth={1.6} />;
  if (slug === "healthcare") return <HeartPulse aria-hidden className={className} strokeWidth={1.6} />;
  if (slug === "government" || slug === "social-sciences") return <UsersRound aria-hidden className={className} strokeWidth={1.6} />;
  if (slug === "agriculture-environment") return <Leaf aria-hidden className={className} strokeWidth={1.6} />;
  return <Compass aria-hidden className={className} strokeWidth={1.6} />;
}

function switchOptionTitle(option: SwitchOption) {
  if (option.slug === "technology") return "Technology";
  if (option.slug === "healthcare") return "Health and helping people";
  if (option.slug === "government") return "Government service and community";
  return option.name;
}

function ExplorationContextBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceCheck = searchParams.get("view") === "source-check";
  const parts = pathname.split("/").filter(Boolean);
  const directionSlug = parts[0] === "guidance" && parts[1] === "direction" && parts[2] ? decodeSegment(parts[2]) : null;
  const direction = directionSlug ? titleForSlug(directionSlug) : "";
  const tail = directionSlug ? parts.slice(3).map(decodeSegment) : [];
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switchOptions, setSwitchOptions] = useState<SwitchOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState(false);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [saveErrorSlug, setSaveErrorSlug] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const optionsControllerRef = useRef<AbortController | null>(null);

  const closePanel = () => {
    optionsControllerRef.current?.abort();
    setSwitchOpen(false);
  };

  const openPanel = () => {
    if (!directionSlug) return;
    setSwitchOpen(true);
    optionsControllerRef.current?.abort();
    const controller = new AbortController();
    optionsControllerRef.current = controller;
    setOptionsLoading(true);
    setOptionsError(false);
    setSwitchOptions([]);
    setSavingSlug(directionSlug);
    setSaveErrorSlug(null);

    void fetch("/api/exploration/switch-options", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unavailable");
        return response.json() as Promise<{ options?: SwitchOption[] }>;
      })
      .then((data) => {
        if (!controller.signal.aborted) setSwitchOptions((data.options ?? []).filter((option) => option.slug !== directionSlug).slice(0, 2));
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted && (!(error instanceof Error) || error.name !== "AbortError")) setOptionsError(true);
      })
      .finally(() => { if (!controller.signal.aborted) setOptionsLoading(false); });

    void fetch("/api/exploration", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
      keepalive: true,
    })
      .then((response) => {
        if (!response.ok || response.status === 204) throw new Error("Could not save this exploration");
        setSavedSlug(directionSlug);
      })
      .catch(() => setSaveErrorSlug(directionSlug))
      .finally(() => setSavingSlug((current) => current === directionSlug ? null : current));
  };

  useEffect(() => {
    if (!switchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSwitchOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLButtonElement>("[data-switch-close]")?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [switchOpen]);

  useEffect(() => {
    if (wasOpen.current && !switchOpen) triggerRef.current?.focus();
    wasOpen.current = switchOpen;
  }, [switchOpen]);

  useEffect(() => () => optionsControllerRef.current?.abort(), []);

  if (pathname === "/guidance/not-sure") return <div role="region" aria-label="Orientation context" className="cb-exploration-context cb-orientation-context">
      <div className="cb-exploration-context-inner mx-auto grid gap-2 px-5 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-12">
      <Link href="/guidance/possibilities" className="cb-exploration-back inline-flex min-h-9 w-fit items-center gap-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
        <ArrowLeft aria-hidden className="h-4 w-4" />Back to possibilities
      </Link>
      <p className="m-0 font-serif text-[1rem] leading-snug text-[#394c44] lg:text-center">Exploring possibilities<span aria-hidden className="mx-2">·</span>Orientation</p>
      <span aria-hidden className="hidden lg:block" />
    </div>
  </div>;
  if (!directionSlug) return null;

  const isOverview = tail.length === 0;
  const isAnotherPossibilityPage = tail.at(-1) === "explore-another";
  const routeIndex = tail.indexOf("routes");
  const courseIndex = tail.indexOf("courses");
  const courseSlug = courseIndex >= 0 ? tail[courseIndex + 1] : undefined;
  const courseName = courseSlug === "bca" ? "BCA" : titleForSlug(courseSlug ?? "");
  const isPracticalChecks = tail.at(-1) === "practical-checks" && routeIndex >= 0 && tail[routeIndex + 1] && courseSlug;
  const isOfficialSource = tail.at(-2) === "sources" && tail.at(-1) === "official" && routeIndex >= 0 && courseSlug;
  const isInstitutionListing = tail.at(-1) === "institutions" && routeIndex >= 0 && courseSlug === "bca";
  const courseDetailHref = isPracticalChecks || isOfficialSource || isInstitutionListing
    ? `/guidance/direction/${encodeURIComponent(directionSlug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses/${encodeURIComponent(courseSlug)}`
    : null;
  const routeCoursesHref = routeIndex >= 0 && tail[routeIndex + 1]
    ? `/guidance/direction/${encodeURIComponent(directionSlug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses`
    : null;
  const isCourseComparison = tail.at(-1) === "compare" && courseIndex >= 0 && Boolean(routeCoursesHref);
  const courseInstitutionsHref = routeIndex >= 0 && tail[routeIndex + 1] && courseSlug
    ? `/guidance/direction/${encodeURIComponent(directionSlug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses/${encodeURIComponent(courseSlug)}/institutions`
    : null;
  const examsScholarshipsHref = routeIndex >= 0 && tail[routeIndex + 1] && courseSlug
    ? `/guidance/direction/${encodeURIComponent(directionSlug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses/${encodeURIComponent(courseSlug)}/exams-scholarships`
    : null;
  const isEntranceProcessDetail = tail.at(-2) === "exams-scholarships" && Boolean(examsScholarshipsHref);
  const isUnavailableCourseState = tail.includes("institutions") && tail.at(-1) === "unavailable" && courseSlug === "bca" && routeIndex >= 0;
  const isInstitutionMap = tail.includes("institutions") && tail.at(-1) === "map" && Boolean(tail.at(-2));
  const institutionDetailHref = isInstitutionMap ? pathname.replace(/\/map\/?$/, "") : null;
  const backHref = sourceCheck ? pathname : isInstitutionMap && institutionDetailHref ? institutionDetailHref : isEntranceProcessDetail && examsScholarshipsHref ? examsScholarshipsHref : isUnavailableCourseState && courseInstitutionsHref ? courseInstitutionsHref : isCourseComparison && routeCoursesHref ? routeCoursesHref : courseDetailHref ?? (isOverview ? "/guidance/possibilities" : `/guidance/direction/${encodeURIComponent(directionSlug)}`);
  const backLabel = sourceCheck ? "Back to institution details" : isInstitutionMap ? "Back to institution details" : isEntranceProcessDetail ? "Back to exams and scholarships" : isUnavailableCourseState ? `Back to ${courseName} institutions` : isCourseComparison ? "Back to courses in this route" : courseDetailHref ? `Back to ${courseName} course details` : isOverview ? "Back to possibilities" : `Back to ${direction} overview`;
  const contextHeading = isAnotherPossibilityPage ? "Exploring possibilities" : `Exploring ${direction}`;
  const saveNotice = savedSlug === directionSlug || savingSlug === directionSlug || saveErrorSlug === directionSlug;
  const savePending = savingSlug === directionSlug;

  return <>
    <div role="region" aria-label="Exploration context" className="cb-exploration-context">
      <div className="cb-exploration-context-inner mx-auto grid gap-2 px-5 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-12">
        <Link href={backHref} className="cb-exploration-back inline-flex min-h-9 w-fit items-center gap-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
          <ArrowLeft aria-hidden className="h-4 w-4" />{backLabel}
        </Link>
        <p className="m-0 font-serif text-[1rem] leading-snug text-[#394c44] lg:text-center">{contextHeading}<span aria-hidden className="mx-2">·</span>{currentContext(tail, sourceCheck)}</p>
        {isAnotherPossibilityPage ? <span aria-hidden className="hidden lg:block" /> : <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-expanded={switchOpen} onClick={openPanel} className="cb-exploration-switch inline-flex min-h-10 w-fit items-center justify-center gap-2 px-4 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] lg:ml-auto">
          <ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration
        </button>}
      </div>
    </div>

    {saveNotice ? <div className="cb-exploration-notice">
      {savedSlug === directionSlug ? <div role="status" aria-live="polite" className="flex items-center gap-3 rounded-lg border border-[#d7e9de] bg-[#e6f2ea] px-5 py-3 text-[#25483d]">
        <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#2d8063] text-white"><Check className="h-5 w-5" /></span>
        <p className="m-0 text-sm leading-relaxed"><strong>{direction} exploration saved.</strong> You can return to it anytime from <Link href="/guidance/explorations" className="font-semibold underline underline-offset-2">My Explorations</Link>.</p>
      </div> : saveErrorSlug === directionSlug ? <div role="alert" className="rounded-lg border border-[#edd8c7] bg-[#fff4e9] px-5 py-3 text-sm text-[#6d432b]">We couldn’t confirm that this exploration was saved. Your existing work is unchanged; you can still choose another possibility.</div> : <div role="status" aria-live="polite" className="rounded-lg border border-[#d7e9de] bg-[#e6f2ea] px-5 py-3 text-sm text-[#25483d]">Saving your {direction} exploration…</div>}
    </div> : null}

    {switchOpen ? <>
      <button type="button" aria-label="Close switch exploration" onClick={closePanel} className="fixed inset-0 z-[70] cursor-default bg-[#10231d]/35" />
      <aside ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="switch-exploration-title" tabIndex={-1} onKeyDown={(event) => {
        if (event.key !== "Tab" || !panelRef.current) return;
        const focusable = [...panelRef.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }} className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-[500px] flex-col overflow-y-auto border-l border-[#e1e6e0] bg-[#fffefa] px-5 pb-5 pt-6 shadow-2xl sm:px-7">
        <header className="flex items-start justify-between gap-4">
          <div><h2 id="switch-exploration-title" className="font-serif text-[2rem] leading-tight tracking-[-.03em] text-[#102c43]">Switch exploration</h2><p className="mt-2 max-w-[390px] font-serif text-[1.05rem] leading-snug text-[#59645e]">Your saved work stays with each direction. Choose another possibility to look around.</p></div>
          <button type="button" data-switch-close aria-label="Close switch exploration" onClick={closePanel} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[#49625a] hover:bg-[#edf4ef] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]"><X aria-hidden className="h-5 w-5" /></button>
        </header>

        <section aria-label="Current exploration" className="mt-5 flex items-center gap-4 rounded-xl border border-[#dcebe3] bg-[#eef8f2] p-4">
          <span aria-hidden className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-[#dcefe5] text-[#075a58]"><SwitchDirectionIcon slug={directionSlug} /></span>
          <div className="min-w-0 flex-1"><h3 className="font-serif text-xl leading-tight text-[#18364a]">{direction}</h3><p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[#405c50]"><span className="inline-flex items-center gap-2"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#16734f]" />Current exploration</span><span className="inline-flex items-center gap-2"><span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#50a37e]" />{savedSlug === directionSlug ? "Saved exploration" : savingSlug === directionSlug ? "Saving exploration" : "Exploration history"}</span></p></div>
          <button type="button" onClick={closePanel} className="min-h-10 shrink-0 rounded-lg border border-[#8bb3a4] bg-white px-3 text-sm font-medium text-[#286b61] hover:bg-[#f7fbf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">Stay here</button>
        </section>

        <section aria-label="Other possibilities" className="mt-4 space-y-3">
          {optionsLoading ? <p role="status" className="rounded-lg bg-[#f4f7f3] px-4 py-5 text-sm text-[#5e6d64]">Finding other possibilities to explore…</p> : null}
          {optionsError ? <p role="status" className="rounded-lg border border-[#eadfca] bg-[#fff9ef] px-4 py-4 text-sm leading-relaxed text-[#6c5c3c]">Other possibilities couldn’t load right now. You can still browse the possibility map below.</p> : null}
          {!optionsLoading && !optionsError && switchOptions.map((option) => <article key={option.slug} className="rounded-xl border border-[#e5e5dd] bg-white p-4">
            <div className="flex items-center gap-4"><span aria-hidden className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e6f2ed] text-[#176b62]"><SwitchDirectionIcon slug={option.slug} className="h-7 w-7" /></span><div className="min-w-0"><h3 className="font-serif text-[1.25rem] leading-tight text-[#18364a]">{switchOptionTitle(option)}</h3><p className="mt-1 text-sm leading-snug text-[#5d6962]">{option.tagline}</p></div></div>
            {savePending ? <span role="status" className="mt-3 flex min-h-11 items-center justify-center rounded-lg bg-[#e8eeea] px-4 text-center text-sm font-medium text-[#64736a]">Saving current exploration…</span> : <Link href={`/guidance/direction/${encodeURIComponent(option.slug)}`} onClick={closePanel} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#075a58] px-4 text-center text-sm font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">Explore this possibility<ArrowRight aria-hidden className="h-4 w-4" /></Link>}
          </article>)}
          {!optionsLoading && !optionsError && switchOptions.length === 0 ? <p className="rounded-lg bg-[#f4f7f3] px-4 py-5 text-sm text-[#5e6d64]">There are no other suggested directions to show right now.</p> : null}
        </section>

        <div className="mt-5 flex justify-center">{savePending ? <span className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-[#778078]">Saving current exploration…</span> : <Link href="/guidance/possibilities" onClick={closePanel} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm font-medium text-[#286b61] underline decoration-[#b7cfc4] underline-offset-4 hover:text-[#174d42]"><Compass aria-hidden className="h-4 w-4" />Explore another possibility</Link>}</div>
        <button type="button" onClick={closePanel} className="mt-auto min-h-12 w-full rounded-lg border border-[#8bb3a4] bg-white px-4 text-sm font-medium text-[#286b61] hover:bg-[#f7fbf8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#286b61]">Cancel</button>
      </aside>
    </> : null}
  </>;
}

function ExplorationHistoryTracker() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname.startsWith("/guidance/direction/")) return;
    void fetch("/api/exploration", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pathname }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);
  return null;
}

export function GuidanceShell({ children, account }: { children: ReactNode; account: { name: string | null; email: string } | null }) {
  return <div className="cb-guidance min-h-screen bg-[var(--g-ivory)] text-[var(--g-ink)]">
    <ExplorationHistoryTracker />
    <GuidanceHeader account={account} />
    <ExplorationContextBar />
    {children}
  </div>;
}
