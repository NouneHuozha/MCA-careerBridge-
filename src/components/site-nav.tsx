"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Award, Bookmark, Building2, ChevronDown, CircleHelp, Compass, FileText, GraduationCap, LayoutDashboard, MessageCircle, Route, PencilRuler, User, Menu, X, ArrowRight, BookOpen, Info } from "lucide-react";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { ButtonLink, cx } from "@/components/ui";

type NavUser = { name: string | null; email: string } | null;

const exploreMenu = [
  { href: "/explore", label: "Areas to explore", detail: "Start with something that interests you", icon: Compass, color: "bg-mint text-mint-ink" },
  { href: "/pathways", label: "Ways to get there", detail: "Compare different routes", icon: Route, color: "bg-butter text-butter-ink" },
  { href: "/courses", label: "Courses", detail: "Degrees, diplomas and trades", icon: GraduationCap, color: "bg-lavender text-lavender-ink" },
  { href: "/institutions", label: "Schools and colleges", detail: "Find places to study in Nagaland", icon: Building2, color: "bg-sky text-sky-ink" },
  { href: "/exams", label: "Entrance exams", detail: "Requirements and official sources", icon: FileText, color: "bg-sky text-sky-ink" },
  { href: "/scholarships", label: "Scholarships", detail: "Help with study costs", icon: Award, color: "bg-peach text-peach-ink" },
  { href: "/opportunities", label: "Skills and opportunities", detail: "Small steps you can start now", icon: PencilRuler, color: "bg-mint text-mint-ink" },
];

const secondaryLinks = [
  { href: "/how-it-works", label: "How it works", icon: BookOpen },
  { href: "/about", label: "About", icon: Info },
];

const homeNavPill = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/35 bg-[#103f35]/60 px-5 text-sm font-semibold text-white shadow-sm transition hover:border-white/60 hover:bg-[#103f35]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2cf78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#123f34] xl:px-6 xl:text-[15px]";

export function SiteNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);
  const exploreButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) setExploreOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setExploreOpen(false);
        setMobileOpen(false);
        if (exploreOpen) {
          const homeTriggerId = pathname === "/" ? (window.matchMedia("(min-width: 1280px)").matches ? "home-explore-trigger" : "home-explore-trigger-mobile") : null;
          (homeTriggerId ? document.getElementById(homeTriggerId) : exploreButton.current)?.focus();
        }
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [exploreOpen, pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const closeAll = () => { setMobileOpen(false); setExploreOpen(false); };
  const isHome = pathname === "/";
  const progressHref = user ? "/guidance" : "/guidance/review";
  const progressLabel = user ? "My Guidance" : "My journey";
  const homeAccountHref = user ? "/guidance" : "/sign-in";
  const homeAccountLabel = user ? "My account" : "Sign in / Sign up";

  if (isHome) return <header ref={exploreRef} className="absolute inset-x-0 top-0 z-50 border-0 bg-transparent text-white">
    <div className="cb-container flex h-[84px] items-center justify-between gap-5 pt-2">
      <Logo tone="light" size="md" textClassName="font-serif text-xl sm:text-[1.5rem]" />
      <nav aria-label="Main" className="hidden items-center gap-2 xl:flex 2xl:gap-3">
        <div className="relative">
          <button id="home-explore-trigger" ref={exploreButton} type="button" onClick={() => setExploreOpen((open) => !open)} aria-expanded={exploreOpen} aria-controls="home-explore-menu" className={cx(homeNavPill, exploreOpen && "border-white/60 bg-[#103f35]/80")}>
            Explore<ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
          </button>
          {exploreOpen && <div id="home-explore-menu" className="animate-rise absolute left-1/2 top-[calc(100%+1rem)] z-[60] max-h-[min(70dvh,34rem)] w-[min(36rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-2xl border border-[#dce6dd] bg-[#fffefa] p-3 text-[#18352d] shadow-[0_20px_60px_-25px_rgba(8,39,31,.5)] sm:p-4">
            <p className="px-2 pb-2 text-xs font-bold uppercase tracking-[.14em] text-[#36654f]">Choose what you want to explore</p>
            <div className="grid gap-1 sm:grid-cols-2">{exploreMenu.map((item) => <Link key={item.href} href={item.href} onClick={closeAll} className="flex min-w-0 items-start gap-3 rounded-xl p-3 transition hover:bg-[#edf5ee]">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.color}`}><item.icon aria-hidden className="h-4 w-4" /></span>
              <span className="min-w-0"><span className="block text-sm font-semibold text-[#17382e]">{item.label}</span><span className="mt-1 block text-xs leading-relaxed text-[#637168]">{item.detail}</span></span>
            </Link>)}</div>
          </div>}
        </div>
        <Link href="/how-it-works" className={homeNavPill}>How it works</Link>
        <Link href="/about" className={homeNavPill}>About</Link>
        <Link href="/mentor" className={homeNavPill}><MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor</Link>
      </nav>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link href={homeAccountHref} className="hidden min-h-12 items-center justify-center rounded-full border border-white/60 bg-[#e7f1e9] px-5 text-sm font-semibold text-[#173e32] shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2cf78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#123f34] xl:inline-flex xl:text-[15px]">{homeAccountLabel}</Link>
        <Link href="/start" className="hidden min-h-12 items-center gap-2 whitespace-nowrap rounded-full bg-[#f2cf78] px-4 text-sm font-bold text-[#263b2e] shadow-[0_5px_18px_-9px_rgba(9,39,30,.5)] transition hover:-translate-y-0.5 hover:bg-[#ebc45e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123f34] xl:inline-flex xl:px-6 xl:text-[15px]">Start counselling<ArrowRight aria-hidden className="h-4 w-4" /></Link>
        <button type="button" aria-expanded={mobileOpen} aria-controls="home-mobile-nav" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[#103f35]/60 text-white transition hover:bg-[#103f35]/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2cf78] focus-visible:ring-offset-2 focus-visible:ring-offset-[#123f34] xl:hidden">
          {mobileOpen ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </div>
    </div>
    {mobileOpen && <nav id="home-mobile-nav" aria-label="Mobile" className="absolute inset-x-0 top-full border-t border-white/15 bg-[#123f34] px-4 py-3 shadow-lg xl:hidden">
      <div className="cb-container grid gap-1">
        <button id="home-explore-trigger-mobile" type="button" onClick={() => setExploreOpen((open) => !open)} aria-expanded={exploreOpen} aria-controls="home-explore-menu-mobile" className="flex min-h-11 items-center justify-between rounded-lg px-3 text-left text-sm font-semibold text-white hover:bg-white/10">
          Explore<ChevronDown aria-hidden className={`h-4 w-4 transition-transform ${exploreOpen ? "rotate-180" : ""}`} />
        </button>
        {exploreOpen && <div id="home-explore-menu-mobile" className="grid gap-1 border-l border-white/20 pl-3">
          {exploreMenu.map((item) => <Link key={item.href} href={item.href} onClick={closeAll} className="rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/10">{item.label}</Link>)}
        </div>}
        <Link href="/how-it-works" onClick={closeAll} className="rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/10">How it works</Link>
        <Link href="/about" onClick={closeAll} className="rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/10">About</Link>
        <Link href="/mentor" onClick={closeAll} className="rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/10">Ask Mentor</Link>
        <Link href={homeAccountHref} onClick={closeAll} className="rounded-lg px-3 py-2.5 text-sm text-white/90 hover:bg-white/10">{homeAccountLabel}</Link>
        <Link href="/start" onClick={closeAll} className="mt-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#f2cf78] px-5 text-sm font-bold text-[#263b2e] transition hover:bg-[#ebc45e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#123f34]">Start counselling<ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </div>
    </nav>}
  </header>;

  return <header className="sticky top-0 z-50 border-b border-ink-200 bg-canvas shadow-[0_2px_8px_#23453305]">
    <div className="cb-container flex h-[76px] items-center justify-between gap-5">
      <div className="flex min-w-0 items-center gap-6 2xl:gap-12">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex 2xl:gap-2">
          <div ref={exploreRef} className="relative">
            <button ref={exploreButton} type="button" onClick={() => setExploreOpen((v) => !v)} aria-expanded={exploreOpen} aria-controls="explore-menu" className={cx("inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-[15px] font-semibold transition-colors", exploreOpen || isActive("/explore") || isActive("/pathways") || isActive("/courses") || isActive("/institutions") ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:border-forest-200 hover:bg-forest-50")}>
              <Compass aria-hidden className="h-4 w-4" />Explore<ChevronDown aria-hidden className={cx("h-4 w-4 transition-transform", exploreOpen && "rotate-180")} />
            </button>
            {exploreOpen && <div id="explore-menu" className="animate-rise absolute left-0 top-[calc(100%+1rem)] w-[34rem] rounded-2xl border border-forest-200 bg-white p-3 shadow-xl shadow-forest-900/10">
              <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[.14em] text-forest-700">Choose what you want to look at</p>
              <div className="grid grid-cols-2 gap-1">{exploreMenu.map((item) => <Link key={item.href} href={item.href} onClick={closeAll} className="flex items-start gap-3 rounded-xl p-3 hover:bg-forest-50">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.color}`}><item.icon aria-hidden className="h-4 w-4" /></span>
                <span><span className="block text-sm font-semibold text-ink-900">{item.label}</span><span className="mt-1 block text-xs leading-relaxed text-ink-500">{item.detail}</span></span>
              </Link>)}</div>
              <Link href="/mentor" onClick={closeAll} className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-forest-200 bg-mint p-3 text-sm font-semibold text-forest-800">Need help choosing a direction? Talk it through<ArrowRight aria-hidden className="h-4 w-4" /></Link>
            </div>}
          </div>
          <Link href={progressHref} aria-current={isActive(progressHref) ? "page" : undefined} className={cx("inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-[15px] font-semibold transition-colors", isActive(progressHref) ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:border-forest-200 hover:bg-forest-50")}>
            {user ? <LayoutDashboard aria-hidden className="h-4 w-4" /> : <Bookmark aria-hidden className="h-4 w-4" />}{progressLabel}
          </Link>
          <Link href="/mentor" aria-current={isActive("/mentor") ? "page" : undefined} className={cx("inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-[15px] font-semibold transition-colors", isActive("/mentor") ? "border-forest-300 bg-mint text-forest-800" : "border-transparent text-ink-700 hover:border-forest-200 hover:bg-forest-50")}>
            <MessageCircle aria-hidden className="h-4 w-4" />Ask Mentor
          </Link>
        </nav>
      </div>
      <div className="hidden shrink-0 items-center gap-3 xl:flex">
        {user ? <><Link href="/guidance/review" className="cb-button border border-forest-200 bg-mint/60 px-3 py-2 text-sm text-forest-800"><User aria-hidden className="h-4 w-4" /><span className="max-w-24 truncate">{user.name?.split(" ")[0] ?? "My profile"}</span></Link><SignOutButton /></> : <><ButtonLink href="/sign-in" variant="ghost">Sign in</ButtonLink>{!isHome && <ButtonLink href="/start">Begin your journey<ArrowRight aria-hidden className="h-4 w-4" /></ButtonLink>}</>}
      </div>
      <div className="flex items-center gap-2 xl:hidden">
        {!user && !isHome && <ButtonLink href="/start" size="sm" className="hidden sm:inline-flex">Begin your journey</ButtonLink>}
        <button type="button" aria-expanded={mobileOpen} aria-controls="mobile-nav" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} onClick={() => setMobileOpen((v) => !v)} className="cb-button cb-button-secondary h-11 w-11">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </div>
    {mobileOpen && <div id="mobile-nav" className="animate-rise border-t border-ink-200 bg-white xl:hidden"><nav aria-label="Mobile" className="cb-container cb-scroll max-h-[75dvh] py-5">
      <p className="cb-eyebrow mb-3">Your next step</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {!isHome && <Link href="/start" onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-forest-200 bg-mint p-3 text-sm font-semibold text-forest-800"><CircleHelp aria-hidden className="h-4 w-4" />Begin your journey</Link>}
        <Link href={progressHref} onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm font-semibold"><Bookmark aria-hidden className="h-4 w-4 text-forest-700" />{progressLabel}</Link>
        <Link href="/mentor" onClick={closeAll} className="flex items-center gap-3 rounded-xl border border-ink-200 bg-ink-50 p-3 text-sm font-semibold"><MessageCircle aria-hidden className="h-4 w-4 text-forest-700" />Ask Mentor</Link>
      </div>
      <details className="mt-5 rounded-xl border border-ink-200 bg-white">
        <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-ink-800">Browse all options<ChevronDown aria-hidden className="h-4 w-4" /></summary>
        <div className="grid grid-cols-2 gap-2 border-t border-ink-100 p-3">{exploreMenu.map((item) => <Link key={item.href} href={item.href} onClick={closeAll} className="flex items-center gap-2 rounded-xl border border-ink-200 p-3 text-[13px] font-semibold"><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.color}`}><item.icon aria-hidden className="h-4 w-4" /></span>{item.label}</Link>)}</div>
      </details>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 px-1 text-sm">{secondaryLinks.map((link) => <Link key={link.href} href={link.href} onClick={closeAll} className="cb-source"><link.icon aria-hidden className="h-4 w-4" />{link.label}</Link>)}</div>
      <div className="mt-5 flex flex-wrap gap-3 border-t border-ink-100 pt-4">{user ? <SignOutButton className="w-full" /> : <><ButtonLink href="/sign-in" onClick={closeAll} variant="secondary">Sign in</ButtonLink></>}</div>
    </nav></div>}
  </header>;
}
