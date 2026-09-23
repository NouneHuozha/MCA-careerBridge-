/**
 * Location intelligence.
 * -----------------------------------------------------------------------------
 * Google Maps Platform is used when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 * Without a key the app still shows a usable schematic map, straight-line
 * distances and Google Maps directions links (which need no key), and tells the
 * student plainly that the interactive map is unavailable.
 *
 * We never ask for an exact home address — only a district or town.
 */
import { REGION_SEEDS } from "@/data/institutions";

export type Point = { latitude: number; longitude: number };

export function mapsConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
}

export function districtCentre(district?: string | null): Point | null {
  if (!district) return null;
  const region = REGION_SEEDS.find((r) => r.level === "district" && r.name === district);
  if (!region?.latitude || !region?.longitude) return null;
  return { latitude: region.latitude, longitude: region.longitude };
}

export function haversineKm(a: Point, b: Point): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function distanceLabel(from: Point | null, to: Point | null): string | null {
  if (!from || !to) return null;
  const km = haversineKm(from, to);
  if (km < 1) return "Under 1 km away (straight line)";
  return `About ${Math.round(km)} km away (straight line)`;
}

export function directionsUrl(to: Point, label?: string) {
  const destination = label ? encodeURIComponent(label) : `${to.latitude},${to.longitude}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=`;
}

export function mapSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/** Bounds of Nagaland used by the schematic fallback map. */
export const NAGALAND_BOUNDS = {
  minLat: 25.15,
  maxLat: 27.05,
  minLon: 93.3,
  maxLon: 95.3,
};

export function projectToViewBox(point: Point, width = 100, height = 100) {
  const x = ((point.longitude - NAGALAND_BOUNDS.minLon) / (NAGALAND_BOUNDS.maxLon - NAGALAND_BOUNDS.minLon)) * width;
  const y = height - ((point.latitude - NAGALAND_BOUNDS.minLat) / (NAGALAND_BOUNDS.maxLat - NAGALAND_BOUNDS.minLat)) * height;
  return { x: Math.max(2, Math.min(width - 2, x)), y: Math.max(2, Math.min(height - 2, y)) };
}
