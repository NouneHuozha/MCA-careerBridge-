/**
 * Small re-export surface so course pages import one module for UI primitives
 * plus the shared level-label formatter.
 */
export { Badge, ButtonLink, Callout, Card, Disclosure, SectionHeading, VerificationBadge, BulletList, cx } from "@/components/ui";

export function levelLabelSafe(level: string) {
  const map: Record<string, string> = {
    higher_secondary: "Higher secondary",
    certificate: "Certificate / ITI",
    diploma: "Diploma",
    undergraduate: "Undergraduate",
    postgraduate: "Postgraduate",
  };
  return map[level] ?? level.replace(/_/g, " ");
}
