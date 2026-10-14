"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound, ClipboardCheck, Settings, ShieldCheck } from "lucide-react";

type Profile = { name: string | null; email: string; role: string; roleLabel: string; actionableCount: number | null };

function initials(profile: Profile | null) {
  const value = profile?.name?.trim() || profile?.email?.split("@")[0] || "AD";
  const parts = value.split(/[\s._-]+/).filter(Boolean);
  return (parts.length > 1 ? `${parts[0][0]}${parts.at(-1)?.[0]}` : value.slice(0, 2)).toUpperCase();
}

export function AdminProfileMenu() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/profile", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Profile unavailable");
        return await response.json() as Profile;
      })
      .then(setProfile)
      .catch((error: unknown) => { if (!(error instanceof DOMException && error.name === "AbortError")) setLoadFailed(true); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => { if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onPointer); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const displayName = profile?.name?.trim() || (profile?.email ? profile.email.split("@")[0] : "Admin");
  return <div className="relative shrink-0" ref={rootRef}>
    <button type="button" aria-label="Open administrator profile menu" aria-haspopup="true" aria-expanded={open} onClick={() => setOpen((value) => !value)} className="flex h-10 items-center gap-2 rounded-full border border-[#d7e1dc] bg-white p-1 pr-2 text-sm font-semibold text-[#344d43] hover:bg-[#f5f8f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12664f]">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e0efe8] text-xs font-bold text-[#245844]">{initials(profile)}</span><span className="hidden max-w-28 truncate lg:inline">{displayName}</span><ChevronDown aria-hidden className={`hidden h-3.5 w-3.5 transition-transform lg:block ${open ? "rotate-180" : ""}`}/>
    </button>
    {open && <section className="absolute right-0 top-[calc(100%+8px)] z-[70] w-[min(88vw,300px)] overflow-hidden rounded-xl border border-[#d7e1dc] bg-white shadow-xl" aria-label="Administrator profile menu">
      <div className="flex items-center gap-3 border-b border-[#e5ebe8] px-4 py-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e0efe8] text-xs font-bold text-[#245844]">{initials(profile)}</span><span className="min-w-0"><strong className="block truncate text-sm text-[#263d32]">{displayName}</strong><span className="block truncate text-xs text-[#687970]">{profile?.email ?? (loadFailed ? "Account details unavailable" : "Loading account…")}</span>{profile && <span className="mt-0.5 block text-[11px] text-[#687970]">{profile.roleLabel}</span>}</span></div>
      <div className="p-2"><Link href="/admin/profile" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-[#344b41] hover:bg-[#f3f7f5]"><CircleUserRound aria-hidden className="h-4 w-4 text-[#65776e]"/>My account</Link><Link href="/admin/settings?tab=team" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-[#344b41] hover:bg-[#f3f7f5]"><ShieldCheck aria-hidden className="h-4 w-4 text-[#65776e]"/>Role and permissions</Link><Link href="/admin" onClick={() => setOpen(false)} className="flex min-h-10 items-center justify-between gap-3 rounded-lg px-3 text-sm text-[#344b41] hover:bg-[#f3f7f5]"><span className="flex items-center gap-3"><ClipboardCheck aria-hidden className="h-4 w-4 text-[#65776e]"/>Review center</span>{profile?.actionableCount !== null && profile?.actionableCount !== undefined && profile.actionableCount > 0 && <span className="rounded-full bg-[#fff2d8] px-2 py-0.5 text-[10px] font-bold text-[#875c12]">{profile.actionableCount} actionable</span>}</Link><p className="px-3 pb-1 text-[10px] leading-relaxed text-[#7b8982]">The count reflects pending institution reviews and reports; routine source checks are excluded.</p><Link href="/admin/settings" onClick={() => setOpen(false)} className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-[#344b41] hover:bg-[#f3f7f5]"><Settings aria-hidden className="h-4 w-4 text-[#65776e]"/>Settings</Link></div>
      <div className="border-t border-[#e5ebe8] p-2"><form action="/api/auth/sign-out" method="post"><button type="submit" className="flex min-h-10 w-full items-center rounded-lg px-3 text-left text-sm font-semibold text-[#a13e3e] hover:bg-[#fff3f1]">Sign out</button></form></div>
    </section>}
  </div>;
}
