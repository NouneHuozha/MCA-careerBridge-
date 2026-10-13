import type { SourceConflictRecord } from "@/db/schema";

export const AVAILABILITY_OPTIONS = [
  { value: "offered", label: "Offered" },
  { value: "not_currently_confirmed", label: "Not currently confirmed" },
  { value: "historically_offered", label: "Historically offered" },
  { value: "not_offered", label: "Not offered" },
  { value: "unknown", label: "Unknown" },
] as const;

export function availabilityLabel(value: string | null | undefined) {
  if (!value) return "Not recorded";
  if (value === "not_listed") return "Not listed";
  return AVAILABILITY_OPTIONS.find((item) => item.value === value)?.label ?? value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const sampleDetectedAt = new Date("2026-10-13T00:00:00.000Z");
export const sampleSourceConflict: SourceConflictRecord = {
  caseKey: "sample-bca-modern-college",
  entityType: "institution_course",
  entityRef: "sample-only",
  entityName: "Bachelor of Computer Applications at Modern College, Kohima",
  fieldName: "Availability",
  currentApprovedValue: "offered",
  resolvedValue: null,
  detectedAt: sampleDetectedAt,
  status: "needs_decision",
  sources: [
    {
      sourceTitle: "Official institution website",
      sourceType: "Official site",
      checkedAt: "2026-10-13T00:00:00.000Z",
      valueFound: "not_listed",
      evidenceExcerpt: "No current course listing appears in this sample excerpt. A missing listing is not proof that the course is not offered.",
      authorityLevel: "primary",
      sourceUrl: null,
      sourceReference: null,
    },
    {
      sourceTitle: "Uploaded workbook",
      sourceType: "Excel import",
      checkedAt: "2026-10-12T00:00:00.000Z",
      valueFound: "offered",
      evidenceExcerpt: "The synthetic workbook example records BCA as offered; the source file itself is not attached.",
      authorityLevel: "internal",
      sourceUrl: null,
      sourceReference: "Sample import · row 9",
    },
    {
      sourceTitle: "Older directory",
      sourceType: "Secondary reference",
      checkedAt: "2026-08-03T00:00:00.000Z",
      valueFound: "offered",
      evidenceExcerpt: "The synthetic legacy-directory example says offered; it is older and secondary evidence.",
      authorityLevel: "secondary",
      sourceUrl: null,
      sourceReference: null,
    },
  ],
  isSample: true,
  reviewNote: null,
  reviewedBy: null,
  reviewedAt: null,
  decisionHistory: [],
  createdAt: sampleDetectedAt,
  updatedAt: sampleDetectedAt,
};
