import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { actionItems, actionPlans, comparisons, savedItems } from "@/db/schema";
import { getCareer, getCourse, getField, getInstitution, getPathway } from "@/services/catalog";

export type SavedItem = typeof savedItems.$inferSelect;
export type ActionPlan = typeof actionPlans.$inferSelect;
export type ActionItem = typeof actionItems.$inferSelect;

export const SAVEABLE_TYPES = [
  "field",
  "career",
  "course",
  "institution",
  "pathway",
  "scholarship",
  "exam",
  "opportunity",
] as const;
export type SaveableType = (typeof SAVEABLE_TYPES)[number];

export function hrefForItem(type: string, ref: string) {
  switch (type) {
    case "field":
      return `/explore/${ref}`;
    case "career":
      return `/careers/${ref}`;
    case "course":
      return `/courses/${ref}`;
    case "institution":
      return `/institutions/${ref}`;
    case "pathway":
      return `/pathways/${ref}`;
    case "scholarship":
      return `/scholarships#${ref}`;
    case "exam":
      return `/exams#${ref}`;
    case "opportunity":
      return `/opportunities#${ref}`;
    default:
      return "/explore";
  }
}

/* --------------------------------- saved --------------------------------- */

export async function listSaved(userId: number): Promise<SavedItem[]> {
  return db.select().from(savedItems).where(eq(savedItems.userId, userId)).orderBy(desc(savedItems.createdAt));
}

export async function saveItem(userId: number, itemType: SaveableType, itemRef: string, label: string) {
  await db
    .insert(savedItems)
    .values({ userId, itemType, itemRef, label })
    .onConflictDoNothing();
}

export async function unsaveItem(userId: number, itemType: string, itemRef: string) {
  await db
    .delete(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType), eq(savedItems.itemRef, itemRef)));
}

export async function isSaved(userId: number | null, itemType: string, itemRef: string) {
  if (!userId) return false;
  const rows = await db
    .select({ id: savedItems.id })
    .from(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType), eq(savedItems.itemRef, itemRef)))
    .limit(1);
  return rows.length > 0;
}

/* ------------------------------ action plans ------------------------------ */

export type ChecklistItem = { label: string; detail: string; linkHref?: string };

export async function resolveFocus(focusType: string, focusRef: string): Promise<{ title: string; href: string } | null> {
  switch (focusType) {
    case "course": {
      const course = await getCourse(focusRef);
      return course ? { title: course.name, href: `/courses/${course.slug}` } : null;
    }
    case "career": {
      const career = await getCareer(focusRef);
      return career ? { title: career.title, href: `/careers/${career.slug}` } : null;
    }
    case "field": {
      const field = await getField(focusRef);
      return field ? { title: field.name, href: `/explore/${field.slug}` } : null;
    }
    case "pathway": {
      const pathway = await getPathway(focusRef);
      return pathway ? { title: pathway.title, href: `/pathways/${pathway.slug}` } : null;
    }
    case "institution": {
      const institution = await getInstitution(focusRef);
      return institution ? { title: institution.name, href: `/institutions/${institution.code}` } : null;
    }
    default:
      return null;
  }
}

export async function buildChecklist(focusType: string, focusRef: string): Promise<ChecklistItem[]> {
  const focus = await resolveFocus(focusType, focusRef);
  const focusHref = focus?.href ?? "/explore";

  const base: ChecklistItem[] = [
    {
      label: "Check eligibility",
      detail: "Confirm the subject and marks requirements for your chosen route, on the institution's own source.",
      linkHref: focusHref,
    },
    {
      label: "Identify the entrance examination (if any)",
      detail: "Some routes need a national or state entrance test; many do not.",
      linkHref: "/exams",
    },
    {
      label: "Shortlist three institutions",
      detail: "Include at least one you are confident about and one that is a stretch.",
      linkHref: focusType === "course" ? `/institutions?course=${focusRef}` : "/institutions",
    },
    {
      label: "Compare fees and travel costs",
      detail: "Ask each institution directly — hostel, travel and material costs matter as much as tuition.",
      linkHref: "/institutions",
    },
    {
      label: "Check scholarships you may qualify for",
      detail: "Most schemes ask for similar documents, so one preparation covers several applications.",
      linkHref: "/scholarships",
    },
    {
      label: "Collect your documents",
      detail: "Marksheets, certificates, category certificate if applicable, photographs, bank details, identity proof.",
      linkHref: "/scholarships",
    },
    {
      label: "Note the application dates",
      detail: "Write the official notification dates in your own calendar; portals close without reminders.",
      linkHref: "/exams",
    },
    {
      label: "Apply",
      detail: "Apply to more than one option. Applying widely is normal and sensible.",
      linkHref: focusHref,
    },
    {
      label: "Prepare (exam or interview)",
      detail: "Use the official syllabus first; free preparation material exists on government learning portals.",
      linkHref: "/opportunities",
    },
    {
      label: "Plan a second route",
      detail: "Decide now what you will do if the first option does not work out. This is planning, not pessimism.",
      linkHref: "/pathways",
    },
  ];

  if (focusType === "institution") {
    base.splice(2, 1, {
      label: "Read the institution's current admission notice",
      detail: "Notices carry the authoritative dates, forms and document list.",
      linkHref: focusHref,
    });
  }
  return base;
}

export async function ensurePlan(userId: number, focusType: string, focusRef: string) {
  const existing = await db
    .select()
    .from(actionPlans)
    .where(and(eq(actionPlans.userId, userId), eq(actionPlans.focusType, focusType), eq(actionPlans.focusRef, focusRef)))
    .limit(1);
  if (existing[0]) return existing[0];

  const focus = await resolveFocus(focusType, focusRef);
  const created = await db
    .insert(actionPlans)
    .values({
      userId,
      focusType,
      focusRef,
      title: focus ? `Next steps for ${focus.title}` : "Your next steps",
    })
    .returning();

  const checklist = await buildChecklist(focusType, focusRef);
  await db.insert(actionItems).values(
    checklist.map((item, index) => ({
      planId: created[0].id,
      label: item.label,
      detail: item.detail,
      linkHref: item.linkHref ?? null,
      orderIndex: index,
    })),
  );
  return created[0];
}

export async function listPlans(userId: number) {
  const plans = await db.select().from(actionPlans).where(eq(actionPlans.userId, userId)).orderBy(desc(actionPlans.updatedAt));
  if (!plans.length) return [];
  const items = await db.select().from(actionItems);
  return plans.map((plan) => ({
    plan,
    items: items.filter((item) => item.planId === plan.id).sort((a, b) => a.orderIndex - b.orderIndex),
  }));
}

export async function setItemStatus(userId: number, itemId: number, status: "todo" | "done") {
  const rows = await db
    .select({ planId: actionItems.planId, ownerId: actionPlans.userId })
    .from(actionItems)
    .innerJoin(actionPlans, eq(actionPlans.id, actionItems.planId))
    .where(eq(actionItems.id, itemId))
    .limit(1);
  if (!rows[0] || rows[0].ownerId !== userId) return false;
  await db.update(actionItems).set({ status }).where(eq(actionItems.id, itemId));
  await db.update(actionPlans).set({ updatedAt: new Date() }).where(eq(actionPlans.id, rows[0].planId));
  return true;
}

/* ------------------------------- comparisons ------------------------------ */

export async function saveComparison(userId: number, kind: string, itemRefs: string[]) {
  await db.insert(comparisons).values({ userId, kind, itemRefs });
}

export async function listComparisons(userId: number) {
  return db.select().from(comparisons).where(eq(comparisons.userId, userId)).orderBy(desc(comparisons.createdAt)).limit(10);
}
