import {
  Briefcase,
  Building2,
  Cpu,
  FlaskConical,
  Gavel,
  GraduationCap,
  HeartPulse,
  Leaf,
  Mic,
  Mountain,
  Palette,
  Users,
  Wrench,
  Hammer,
  type LucideIcon,
} from "lucide-react";
import type { Accent } from "@/components/ui";

/**
 * One small visual identity per field: a line icon and a soft accent.
 * Keeps exploration scannable without turning the page into a colour chart.
 */
const MAP: Record<string, { icon: LucideIcon; accent: Accent }> = {
  technology: { icon: Cpu, accent: "mint" },
  engineering: { icon: Wrench, accent: "sky" },
  healthcare: { icon: HeartPulse, accent: "peach" },
  business: { icon: Briefcase, accent: "butter" },
  government: { icon: Building2, accent: "sky" },
  education: { icon: GraduationCap, accent: "lavender" },
  "science-research": { icon: FlaskConical, accent: "mint" },
  "arts-design": { icon: Palette, accent: "peach" },
  media: { icon: Mic, accent: "lavender" },
  "agriculture-environment": { icon: Leaf, accent: "mint" },
  law: { icon: Gavel, accent: "butter" },
  "hospitality-tourism": { icon: Mountain, accent: "peach" },
  "social-sciences": { icon: Users, accent: "sky" },
  "skilled-trades": { icon: Hammer, accent: "butter" },
};

const FALLBACK = { icon: Cpu, accent: "mint" as Accent };

export function fieldVisual(slug: string) {
  return MAP[slug] ?? FALLBACK;
}

export function FieldIcon({ slug, className }: { slug: string; className?: string }) {
  const { icon: Icon } = fieldVisual(slug);
  return <Icon aria-hidden className={className ?? "h-[18px] w-[18px]"} strokeWidth={1.8} />;
}
