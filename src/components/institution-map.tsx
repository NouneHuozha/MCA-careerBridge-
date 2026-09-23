"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ArrowRight, MapPin, Navigation } from "lucide-react";
import { ButtonLink, SourceLink } from "@/components/ui";
import { distanceLabel, mapSearchUrl, projectToViewBox, type Point } from "@/maps";

export type MapPin = { code: string; name: string; district: string; latitude: number | null; longitude: number | null };
export function InstitutionMap({ pins, origin, originLabel }: { pins: MapPin[]; origin?: Point | null; originLabel?: string | null }) {
  const located = pins.filter((pin) => pin.latitude != null && pin.longitude != null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const unique = useId().replace(/:/g, "");
  const selected = located.find((pin) => pin.code === selectedCode) ?? located[0];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!located.length) return <div className="rounded-xl border border-dashed border-forest-300 bg-forest-50 p-8 text-center"><MapPin aria-hidden className="mx-auto mb-3 h-6 w-6 text-forest-600" /><p className="font-semibold">No locations to show yet</p><p className="mt-2 text-sm text-ink-500">Try another district or clear a filter.</p></div>;
  const googleParams = new URLSearchParams({ size: "640x440", scale: "2", maptype: "roadmap", key: apiKey ?? "" });
  for (const pin of located.slice(0, 40)) googleParams.append("markers", `color:0x277559|${pin.latitude},${pin.longitude}`);
  if (origin) googleParams.append("markers", `color:0x956f20|label:H|${origin.latitude},${origin.longitude}`);
  const selectedPoint = selected ? { latitude: selected.latitude!, longitude: selected.longitude! } : null;
  const distance = distanceLabel(origin ?? null, selectedPoint);
  return <figure className="overflow-hidden rounded-2xl border border-forest-200 bg-white">
    <div className="flex items-center justify-between gap-3 border-b border-forest-200 bg-mint px-5 py-3.5"><span className="flex items-center gap-2 text-sm font-bold text-forest-800"><MapPin aria-hidden className="h-4 w-4" />Explore the map</span><span className="text-xs text-forest-700">{located.length} locations</span></div>
    {apiKey && !mapFailed ? <Image src={`https://maps.googleapis.com/maps/api/staticmap?${googleParams}`} unoptimized width={640} height={440} onError={() => setMapFailed(true)} alt="Google map with institution locations in Nagaland" className="h-auto w-full xl:h-[390px] xl:object-cover" /> : <div className="relative bg-[#eef4e9]">
      <svg viewBox="0 0 400 290" role="group" aria-label="Approximate institution locations. Select a marker to see its details." className="h-64 w-full sm:h-72 xl:h-[390px]">
        <defs><pattern id={`${unique}-grid`} width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0v26" stroke="#cbdbca" strokeWidth=".5" fill="none" /></pattern></defs><rect width="400" height="290" fill={`url(#${unique}-grid)`} />
        <g aria-hidden fill="none" stroke="#d2e3ce" strokeWidth="1.2"><path d="M340-40C130 30 260 110 120 172S100 280 10 310" /><path d="M370-40C160 30 290 140 150 202S130 310 40 340" /><path d="M310-40C100 10 230 80 90 142S70 250-20 280" /></g>
        <g aria-hidden><text x="18" y="26" fill="#59745e" fontSize="10" fontWeight="600" letterSpacing="2">NAGALAND</text><path d="M373 46V22m0 0-4 7m4-7 4 7" stroke="#59745e" fill="none" /><text x="369" y="16" fill="#59745e" fontSize="9">N</text></g>
        {origin && (() => { const pos = projectToViewBox(origin, 340, 230); return <g aria-label={`Distance origin: ${originLabel}`}><circle cx={pos.x + 30} cy={pos.y + 32} r="15" fill="#f9e9b9" stroke="#a88234" strokeDasharray="3 3" /><text x={pos.x + 30} y={pos.y + 36} textAnchor="middle" fontSize="10" fill="#785712">H</text></g>; })()}
        {located.map((pin) => { const pos = projectToViewBox({ latitude: pin.latitude!, longitude: pin.longitude! }, 340, 230); const active = pin.code === selected?.code; return <g key={pin.code} role="button" tabIndex={0} aria-label={`Show ${pin.name} on map`} aria-pressed={active} onClick={() => setSelectedCode(pin.code)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedCode(pin.code); } }} className="cursor-pointer" transform={`translate(${pos.x + 30},${pos.y + 32})`}>
          <circle r="14" fill={active ? "#b9d9bf" : "transparent"} /><circle r={active ? 7 : 5} fill={active ? "#1d634b" : "#67977b"} stroke="white" strokeWidth="2" /><title>{pin.name}</title>
        </g>; })}
      </svg><span className="absolute bottom-3 left-4 rounded-lg border border-ink-200 bg-white/95 px-2.5 py-1 text-[11px] text-ink-500">{mapFailed ? "Live map unavailable · " : ""}Location sketch · select a dot</span>
    </div>}
    <div className="border-t border-ink-200 p-4"><label htmlFor={`${unique}-institution`} className="mb-2 block text-xs font-semibold text-ink-500">Choose a location</label><select id={`${unique}-institution`} value={selected?.code ?? ""} onChange={(e) => setSelectedCode(e.target.value)} className="w-full rounded-lg border border-ink-200 bg-canvas p-2.5 text-sm">{located.map((pin) => <option key={pin.code} value={pin.code}>{pin.name}</option>)}</select>
      {selected && <div aria-live="polite" className="mt-4"><p className="text-sm font-semibold text-ink-900">{selected.name}</p><p className="mt-1 text-xs text-ink-500">{selected.district}{distance ? ` · ${distance}` : ""}</p><div className="mt-3 flex flex-wrap gap-2"><ButtonLink href={`/institutions/${selected.code}`} size="sm">View institution<ArrowRight aria-hidden className="h-3.5 w-3.5" /></ButtonLink><SourceLink href={mapSearchUrl(`${selected.name} ${selected.district} Nagaland`)} variant="secondary"><Navigation aria-hidden className="h-3.5 w-3.5" />Directions</SourceLink></div></div>}
    </div>
    <figcaption className="border-t border-ink-100 bg-canvas px-4 py-3 text-[11px] leading-relaxed text-ink-500">Sample locations. Distances are straight-line estimates, not road travel times.{!apiKey && " Google’s live map is not connected."}</figcaption>
  </figure>;
}
