"use client";

import { useState } from "react";
import { Heart, Fingerprint, Flag, HandHeart, MapPin, Wallet, Pause, Play, Compass, ArrowUpRight } from "lucide-react";
import { accentSurface, type Accent } from "@/components/ui";

const factors: { name: string; detail: string; icon: typeof Heart; accent: Accent }[] = [
  { name: "Interests", detail: "The things you enjoy are a good place to start.", icon: Heart, accent: "mint" },
  { name: "Strengths", detail: "Notice what comes naturally — in and outside school.", icon: Fingerprint, accent: "butter" },
  { name: "Goals", detail: "Explore the kind of future you want, at your own pace.", icon: Flag, accent: "lavender" },
  { name: "Values", detail: "What matters to you helps you weigh different options.", icon: HandHeart, accent: "peach" },
  { name: "Location", detail: "Find routes that work with where you want to study.", icon: MapPin, accent: "sky" },
  { name: "Budget", detail: "Look into fees and financial support before deciding.", icon: Wallet, accent: "mint" },
];

export function GuidanceCompass() {
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  return <div className="cb-guide relative" data-paused={paused}>
    <div className="mb-5 flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-sm font-semibold text-forest-800"><Compass aria-hidden className="h-4 w-4" />A little more you. A little more clarity.</span>
      <button type="button" aria-label={paused ? "Play guidance animation" : "Pause guidance animation"} aria-pressed={paused} onClick={() => setPaused((v) => !v)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-forest-300 bg-white text-forest-700">{paused ? <Play aria-hidden className="h-3.5 w-3.5" /> : <Pause aria-hidden className="h-3.5 w-3.5" />}</button>
    </div>
    <div className="relative">
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 600 260" preserveAspectRatio="none"><path className="cb-route-flow" d="M30 70C130-15 180 110 280 70S460 15 565 70M35 204C140 260 210 135 295 196S510 246 571 180" stroke="#8eb99b" strokeWidth="2" fill="none" /></svg>
      <div className="relative grid grid-cols-2 gap-4 py-2 sm:grid-cols-3">{factors.map((factor, i) => <button key={factor.name} type="button" aria-pressed={selected === i} onClick={() => setSelected(i)} className={`cb-guide-tile ${accentSurface[factor.accent]}`} style={{ animationDelay: `${-i * .75}s` }}>
        <factor.icon aria-hidden className="mb-3 h-5 w-5" strokeWidth={1.7} /><span className="text-sm font-semibold">{factor.name}</span><ArrowUpRight aria-hidden className="absolute right-3 top-3 h-3.5 w-3.5 opacity-60" />
      </button>)}</div>
    </div>
    <p aria-live="polite" className="mt-4 min-h-12 text-sm leading-relaxed text-ink-600"><span className="font-semibold text-forest-800">{factors[selected].name}:</span> {factors[selected].detail}</p>
  </div>;
}
