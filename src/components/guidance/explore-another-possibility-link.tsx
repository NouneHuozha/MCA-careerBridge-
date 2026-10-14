"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function ExploreAnotherPossibilityLink({ directionSlug, directionName }: { directionSlug: string; directionName: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  async function openPossibilities() {
    if (saving) return;
    setSaving(true);
    setSaveFailed(false);

    try {
      const pathname = `/guidance/direction/${encodeURIComponent(directionSlug)}`;
      const response = await fetch("/api/exploration", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pathname }),
        cache: "no-store",
      });
      if (!response.ok || response.status === 204) throw new Error("Could not confirm the saved exploration.");
      router.push(`${pathname}/explore-another`);
    } catch {
      setSaving(false);
      setSaveFailed(true);
    }
  }

  return <>
    <button type="button" onClick={openPossibilities} disabled={saving} aria-busy={saving} className="inline-flex min-h-10 items-center font-serif text-[1rem] text-[#35675b] underline decoration-[#9ebfb2] underline-offset-4 hover:text-[#174d42] disabled:cursor-wait disabled:opacity-60">
      Explore another possibility<ArrowRight aria-hidden className="ml-1 h-4 w-4" />
    </button>
    {saving ? <span role="status" aria-live="polite" className="basis-full text-center text-sm text-[#64736a]">Saving your {directionName} exploration…</span> : null}
    {saveFailed ? <span role="alert" className="basis-full text-center text-sm text-[#8a4c3b]">We couldn’t confirm that your exploration was saved. Your current work is unchanged; please try again.</span> : null}
  </>;
}
