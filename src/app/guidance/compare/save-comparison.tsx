"use client";

import { useState } from "react";
import { Check, LoaderCircle, Save } from "lucide-react";

export function SaveGuidanceComparison({ kind, itemRefs, signedIn, signInHref }: {
  kind: string;
  itemRefs: string[];
  signedIn: boolean;
  signInHref: string;
}) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!signedIn || saving || saved || itemRefs.length < 2) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ kind, itemRefs }),
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error ?? "Unable to save");
      setSaved(true);
    } catch {
      setError("We couldn't save this comparison right now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!signedIn) {
    return <a href={signInHref} className="inline-flex min-h-10 items-center rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61] underline underline-offset-4">Sign in to save comparison</a>;
  }

  return <div className="flex flex-col items-start gap-2">
    <button type="button" onClick={save} disabled={saving || saved} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#91b4a7] bg-white px-4 text-sm font-semibold text-[#286b61] transition hover:bg-[#f1f7f3] disabled:cursor-not-allowed disabled:opacity-70">
      {saving ? <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" /> : saved ? <Check aria-hidden className="h-4 w-4" /> : <Save aria-hidden className="h-4 w-4" />}
      {saving ? "Saving…" : saved ? "Comparison saved" : "Save comparison"}
    </button>
    {error ? <p role="status" className="text-sm text-[#a04d35]">{error}</p> : null}
  </div>;
}
