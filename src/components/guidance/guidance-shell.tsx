"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  BookOpen,
  ChevronDown,
  Compass,
  Home,
  LifeBuoy,
  UserRound,
  X,
  Menu,
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
  const routeIndex = tail.indexOf("routes");
  if (tail.at(-1) === "compare" && routeIndex >= 0 && tail[routeIndex + 2] === "courses") return "Courses · Compare courses";
  const courseIndex = tail.indexOf("courses");
  const courseTrail = courseIndex >= 0 && tail[courseIndex + 1]
    ? `Courses · ${titleForSlug(tail[courseIndex + 1])}`
    : null;
  if (tail.at(-2) === "sources" && tail.at(-1) === "official" && courseTrail) return `${courseTrail} · Official source`;
  if (tail.at(-1) === "practical-checks" && courseIndex >= 0 && tail[courseIndex + 1]) return `Practical checks · ${tail[courseIndex + 1] === "bca" ? "BCA" : titleForSlug(tail[courseIndex + 1])}`;
  if (tail.at(-1) === "application") return `${courseTrail ? `${courseTrail} · ` : ""}Application and requirements`;
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

function ExplorationContextBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sourceCheck = searchParams.get("view") === "source-check";
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "guidance" || parts[1] !== "direction" || !parts[2]) return null;

  const slug = decodeSegment(parts[2]);
  const direction = titleForSlug(slug);
  const tail = parts.slice(3).map(decodeSegment);
  const isOverview = tail.length === 0;
  const routeIndex = tail.indexOf("routes");
  const courseIndex = tail.indexOf("courses");
  const courseSlug = courseIndex >= 0 ? tail[courseIndex + 1] : undefined;
  const courseName = courseSlug === "bca" ? "BCA" : titleForSlug(courseSlug ?? "");
  const isPracticalChecks = tail.at(-1) === "practical-checks" && routeIndex >= 0 && tail[routeIndex + 1] && courseSlug;
  const isOfficialSource = tail.at(-2) === "sources" && tail.at(-1) === "official" && routeIndex >= 0 && courseSlug;
  const courseDetailHref = isPracticalChecks || isOfficialSource
    ? `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses/${encodeURIComponent(courseSlug)}`
    : null;
  const routeCoursesHref = routeIndex >= 0 && tail[routeIndex + 1]
    ? `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses`
    : null;
  const isCourseComparison = tail.at(-1) === "compare" && courseIndex >= 0 && Boolean(routeCoursesHref);
  const courseInstitutionsHref = routeIndex >= 0 && tail[routeIndex + 1] && courseSlug
    ? `/guidance/direction/${encodeURIComponent(slug)}/routes/${encodeURIComponent(tail[routeIndex + 1])}/courses/${encodeURIComponent(courseSlug)}/institutions`
    : null;
  const isUnavailableCourseState = tail.includes("institutions") && tail.at(-1) === "unavailable" && courseSlug === "bca" && routeIndex >= 0;
  const backHref = sourceCheck ? pathname : isUnavailableCourseState && courseInstitutionsHref ? courseInstitutionsHref : isCourseComparison && routeCoursesHref ? routeCoursesHref : courseDetailHref ?? (isOverview ? "/guidance/possibilities" : `/guidance/direction/${encodeURIComponent(slug)}`);
  const backLabel = sourceCheck ? "Back to institution details" : isUnavailableCourseState ? `Back to ${courseName} institutions` : isCourseComparison ? "Back to courses in this route" : courseDetailHref ? `Back to ${courseName} course details` : isOverview ? "Back to possibilities" : `Back to ${direction} overview`;

  return <div role="region" aria-label="Exploration context" className="border-b border-[#dfe8e1] bg-[#edf4ef]">
    <div className="mx-auto grid max-w-[1500px] gap-2 px-5 py-3 sm:px-8 lg:min-h-[72px] lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6 lg:px-12 lg:py-2">
      <Link href={backHref} className="inline-flex min-h-9 w-fit items-center gap-2 text-sm font-medium text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 transition hover:text-[#174d42] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61]">
        <ArrowLeft aria-hidden className="h-4 w-4" />{backLabel}
      </Link>
      <p className="m-0 font-serif text-[1rem] leading-snug text-[#394c44] lg:text-center">Exploring {direction}<span aria-hidden className="mx-2">·</span>{currentContext(tail, sourceCheck)}</p>
      <Link href="/guidance/possibilities" className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[#075a58] px-4 text-sm font-semibold text-white transition hover:bg-[#064a49] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#286b61] lg:ml-auto">
        <ArrowLeftRight aria-hidden className="h-4 w-4" />Switch exploration
      </Link>
    </div>
  </div>;
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
