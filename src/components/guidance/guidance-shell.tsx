"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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

function GuidanceBrand() {
  return <Link href="/" aria-label="CareerBridge home" className="inline-flex shrink-0 items-center gap-2.5 rounded-md text-[#123f3b]">
    <span aria-hidden className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-t-[1.1rem] border-[5px] border-[#2f6d67] border-b-0 sm:h-10 sm:w-10">
      <span className="absolute bottom-0 h-5 w-5 rounded-t-full border-[4px] border-[#b8c6bc] border-b-0" />
    </span>
    <span className="font-serif text-[1.35rem] font-semibold tracking-[-.045em] sm:text-[1.55rem]">CareerBridge</span>
  </Link>;
}

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
  return <>
    {globalDestinations.map(({ href, label, icon: Icon }) => {
      const active = isDestinationActive(pathname, href);
      return <Link key={href} href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={mobile
        ? `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium ${active ? "bg-[#e8f2ec] text-[#174d42]" : "text-[#26312c] hover:bg-[#f2f6f3] hover:text-[#286b61]"}`
        : `inline-flex min-h-[72px] items-center gap-2 border-b-2 px-1 text-sm font-medium transition-colors ${active ? "border-[#286b61] text-[#174d42]" : "border-transparent text-[#26312c] hover:text-[#286b61]"}`}>
        <Icon aria-hidden className="h-4 w-4 shrink-0" />{label}
      </Link>;
    })}
  </>;
}

function ProfileMenu() {
  return <details className="group relative shrink-0">
    <summary aria-label="Profile menu" className="inline-flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 text-sm font-medium text-[#26312c] hover:bg-[#f4f7f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] [&::-webkit-details-marker]:hidden">
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-[#e5f0eb] text-[#0d5b55]"><UserRound className="h-5 w-5" /></span>
      <span className="hidden lg:inline">Profile</span>
      <ChevronDown aria-hidden className="hidden h-4 w-4 transition-transform group-open:rotate-180 lg:block" />
    </summary>
    <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-[#dfe5df] bg-white p-1.5 shadow-lg">
      <Link href="/guidance/review?mode=correct" className="block rounded-md px-3 py-2.5 text-sm text-[#26312c] hover:bg-[#f1f6f2]">Review and edit profile</Link>
    </div>
  </details>;
}

function GuidanceHeader() {
  const pathname = usePathname();
  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const mobileOpen = openPathname === pathname;

  return <header className="relative z-40 border-b border-[#e5e6e1] bg-white">
    <div className="mx-auto flex min-h-[62px] max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:min-h-[76px] lg:gap-7 lg:px-12">
      <GuidanceBrand />
      <span aria-hidden className="hidden h-8 w-px bg-[#d9ddd7] lg:block" />
      <nav aria-label="Primary" className="hidden min-w-0 flex-1 items-center justify-between gap-4 lg:flex">
        <DestinationLinks pathname={pathname} />
      </nav>
      <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-2 lg:gap-4">
        <ProfileMenu />
        <button type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} aria-controls="mobile-guidance-menu" onClick={() => setOpenPathname(mobileOpen ? null : pathname)} className="grid h-11 w-11 place-items-center rounded-lg text-[#174d42] transition hover:bg-[#f1f6f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] lg:hidden">
          {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {mobileOpen ? <div id="mobile-guidance-menu" className="border-t border-[#e5e6e1] bg-white lg:hidden">
      <nav aria-label="Mobile primary" className="mx-auto grid max-h-[70dvh] max-w-[1500px] gap-1 overflow-y-auto px-5 py-3 sm:px-8">
        <DestinationLinks pathname={pathname} onNavigate={() => setOpenPathname(null)} mobile />
      </nav>
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

  if (pathname === "/guidance/not-sure") return <div role="region" aria-label="Orientation context" className="border-b border-[#dfe8e1] bg-[#edf4ef]">
    <div className="mx-auto grid max-w-[1500px] gap-2 px-5 py-3 sm:px-8 lg:min-h-[64px] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:px-12 lg:py-2">
      <Link href="/guidance/possibilities" className="inline-flex min-h-9 w-fit items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
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
    <div role="region" aria-label="Exploration context" className="border-b border-[#dfe8e1] bg-[#edf4ef]">
      <div className="mx-auto grid max-w-[1500px] gap-2 px-5 py-3 sm:px-8 lg:min-h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:px-12 lg:py-2">
        <Link href={backHref} className="inline-flex min-h-9 w-fit items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
          <ArrowLeft aria-hidden className="h-4 w-4" />{backLabel}
        </Link>
        <p className="m-0 font-serif text-[1rem] leading-snug text-[#394c44] lg:text-center">{contextHeading}<span aria-hidden className="mx-2">·</span>{currentContext(tail, sourceCheck)}</p>
        {isAnotherPossibilityPage ? <span aria-hidden className="hidden lg:block" /> : <button ref={triggerRef} type="button" aria-haspopup="dialog" aria-expanded={switchOpen} onClick={openPanel} className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] lg:ml-auto">
          <ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration
        </button>}
      </div>
    </div>

    {saveNotice ? <div className="mx-auto max-w-[1500px] px-5 pt-3 sm:px-8 lg:px-12">
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

export function GuidanceShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#fcfcfa] text-[#243b32]">
    <ExplorationHistoryTracker />
    <GuidanceHeader />
    <ExplorationContextBar />
    {children}
  </div>;
}
