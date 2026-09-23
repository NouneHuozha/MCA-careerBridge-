"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle, X, Maximize2 } from "lucide-react";
import { MentorChat, type MentorMessage } from "@/components/mentor-chat";

export function MentorWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open || loaded) return;
    const controller = new AbortController();
    fetch("/api/mentor", { signal: controller.signal, cache: "no-store" }).then((r) => r.json()).then((data) => { setMessages(data.messages ?? []); setLoaded(true); }).catch(() => { if (!controller.signal.aborted) setLoaded(true); });
    return () => controller.abort();
  }, [open, loaded]);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); launcher.current?.focus(); } };
    window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close);
  }, [open]);
  // These pages already contain a full conversation; don't cover their composer.
  if (pathname === "/mentor" || pathname === "/counselling") return null;
  return <div className="cb-mentor-widget flex flex-col items-end gap-3">
    <div hidden={!open} ref={panel} role="dialog" aria-label="CareerBridge Mentor" tabIndex={-1} className="cb-mentor-popover">
      <div className="flex h-12 items-center justify-between border-b border-forest-200 bg-mint px-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-forest-800"><MessageCircle aria-hidden className="h-4 w-4" />Let’s talk it through</span>
        <span className="flex items-center gap-1"><Link href="/mentor" onClick={() => setOpen(false)} aria-label="Open full mentor page" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white"><Maximize2 className="h-4 w-4" /></Link><button type="button" onClick={() => { setOpen(false); launcher.current?.focus(); }} aria-label="Close mentor chat" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white"><X className="h-4 w-4" /></button></span>
      </div>
      <div className="h-[calc(100%-3rem)] min-h-0">{loaded ? <MentorChat compact initialMessages={messages} providerConfigured={false} /> : <div role="status" className="p-6 text-sm text-ink-500">Opening your conversation…</div>}</div>
    </div>
    <button ref={launcher} type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label={open ? "Hide CareerBridge Mentor" : "Ask CareerBridge Mentor"} className="cb-widget-launcher transition-transform"><MessageCircle aria-hidden className="h-5 w-5" /><span>{open ? "Close chat" : "Ask Mentor"}</span></button>
  </div>;
}
