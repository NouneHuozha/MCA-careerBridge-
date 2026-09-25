"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Bookmark, BookmarkCheck, LoaderCircle } from "lucide-react";
import { cx } from "@/components/ui";

type Item = { itemType: string; itemRef: string };
type SavedContextValue = { keys: Set<string>; ready: boolean; signedIn: boolean; update: (key: string, saved: boolean) => void };
const SavedContext = createContext<SavedContextValue | null>(null);

/** Load saved status once, not once per card; update every matching button together. */
export function SavedProvider({ signedIn, children }: { signedIn: boolean; children: ReactNode }) {
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(!signedIn);
  useEffect(() => {
    if (!signedIn) return;
    const controller = new AbortController();
    fetch("/api/saved", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => { if (!response.ok) throw new Error("Unavailable"); return response.json(); })
      .then((data: { items?: Item[] }) => { setKeys(new Set((data.items ?? []).map((item) => `${item.itemType}:${item.itemRef}`))); setReady(true); })
      .catch(() => { if (!controller.signal.aborted) setReady(true); });
    return () => controller.abort();
  }, [signedIn]);
  const update = useCallback((key: string, saved: boolean) => setKeys((current) => { const next = new Set(current); if (saved) next.add(key); else next.delete(key); return next; }), []);
  return <SavedContext.Provider value={{ keys, ready, signedIn, update }}>{children}</SavedContext.Provider>;
}

export function SaveButton({ itemType, itemRef, label, initiallySaved = false, className, saveText = "Save for later", savedText = "Saved" }: {
  itemType: "field" | "career" | "course" | "institution" | "pathway" | "scholarship" | "exam" | "opportunity";
  itemRef: string; label: string; initiallySaved?: boolean; className?: string; saveText?: string; savedText?: string;
}) {
  const context = useContext(SavedContext);
  const router = useRouter();
  const pathname = usePathname();
  const key = `${itemType}:${itemRef}`;
  const [localSaved, setLocalSaved] = useState(initiallySaved);
  const saved = context?.ready ? context.keys.has(key) : localSaved;
  const [notice, setNotice] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setNotice(null);
    if (context && !context.signedIn) { setNeedsAuth(true); return; }
    setPending(true);
    try {
      const response = await fetch("/api/saved", { method: saved ? "DELETE" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ itemType, itemRef, label }) });
      const data = await response.json();
      if (response.status === 401) { setNeedsAuth(true); return; }
      if (!response.ok || data.error) throw new Error("Unavailable");
      context?.update(key, !saved); setLocalSaved(!saved); router.refresh();
      setNotice(saved ? "Removed from your saved items" : "Added to your shortlist");
    } catch { setNotice("Couldn't save right now. Please try again."); }
    finally { setPending(false); }
  }
  return <span className={cx("inline-flex flex-col items-start gap-2", className)}>
    <button type="button" onClick={toggle} disabled={pending || (context?.signedIn && !context.ready)} aria-pressed={saved} aria-label={`${saved ? "Unsave" : "Save"} ${label}`} className={cx("cb-button border px-4 py-2 text-sm", saved ? "border-forest-500 bg-mint text-forest-800" : "border-lavender-ink/30 bg-lavender text-lavender-ink hover:border-lavender-ink/60")}>
      {pending ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : saved ? <BookmarkCheck aria-hidden className="h-4 w-4" /> : <Bookmark aria-hidden className="h-4 w-4" />}
      {pending ? "Saving…" : saved ? savedText : saveText}
    </button>
    {needsAuth && <span role="status" className="rounded-lg border border-lavender-ink/20 bg-lavender/40 px-3 py-2 text-xs text-ink-700"><Link href={`/sign-in?next=${encodeURIComponent(pathname)}`} className="font-bold text-forest-700 underline underline-offset-4">Sign in</Link> to keep your shortlist.</span>}
    {notice && <span role="status" className="text-xs text-ink-600">{notice}{saved && <Link href="/saved" className="ml-2 font-semibold text-forest-700 underline underline-offset-4">View saved →</Link>}</span>}
  </span>;
}
