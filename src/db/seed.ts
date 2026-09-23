/**
 * Idempotent catalogue seeding.
 *
 * The student-generated tables (profiles, counselling, saved items…) are never
 * touched here. Only the reference catalogue and the retrieval corpus are
 * (re)loaded, which mirrors how a real CSV/Excel import from the master dataset
 * would work.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  admissionInformation,
  careerFields,
  careerSkills,
  careers,
  courses,
  dataImports,
  entranceExams,
  goals as goalsTable,
  institutionCourses,
  institutionSources,
  institutions,
  interests as interestsTable,
  knowledgeChunks,
  knowledgeDocuments,
  opportunities,
  pathways,
  regions,
  scholarships,
  seedMeta,
  strengths as strengthsTable,
} from "@/db/schema";
import { CAREER_SEEDS, CAREER_SKILL_SEEDS, FIELD_SEEDS } from "@/data/fields";
import { COURSE_SEEDS, EXAM_SEEDS, OPPORTUNITY_SEEDS, PATHWAY_SEEDS, SCHOLARSHIP_SEEDS } from "@/data/learning";
import {
  ADMISSION_INFO_SEEDS,
  DATASET_LABEL,
  INSTITUTION_COURSE_SEEDS,
  INSTITUTION_SEEDS,
  INSTITUTION_SOURCE_SEEDS,
  REGION_SEEDS,
} from "@/data/institutions";
import { GOAL_OPTIONS, INTEREST_OPTIONS, STRENGTH_OPTIONS } from "@/data/counselling";
import { buildCorpus } from "@/rag/corpus";
import { chunkText, getEmbeddingProvider } from "@/rag";

export const SEED_VERSION = 4;

const globalForSeed = globalThis as typeof globalThis & { __careerbridgeSeed?: Promise<boolean> };

async function insertInBatches<T>(rows: T[], insert: (batch: T[]) => Promise<unknown>, size = 100) {
  for (let i = 0; i < rows.length; i += size) {
    await insert(rows.slice(i, i + size));
  }
}

async function runSeed(): Promise<boolean> {
  // Serialise across server instances.
  await db.execute(sql`select pg_advisory_lock(918273645)`);
  try {
    const existing = await db
      .select({ version: seedMeta.version })
      .from(seedMeta)
      .where(sql`${seedMeta.key} = 'catalog'`)
      .limit(1);
    if (existing[0]?.version === SEED_VERSION) return true;

    await db.delete(regions);
    await db.delete(careerFields);
    await db.delete(careers);
    await db.delete(careerSkills);
    await db.delete(pathways);
    await db.delete(courses);
    await db.delete(institutions);
    await db.delete(institutionCourses);
    await db.delete(institutionSources);
    await db.delete(admissionInformation);
    await db.delete(entranceExams);
    await db.delete(scholarships);
    await db.delete(opportunities);
    await db.delete(interestsTable);
    await db.delete(strengthsTable);
    await db.delete(goalsTable);
    await db.delete(knowledgeChunks);
    await db.delete(knowledgeDocuments);

    await insertInBatches(REGION_SEEDS, (b) => db.insert(regions).values(b));
    await insertInBatches(FIELD_SEEDS, (b) => db.insert(careerFields).values(b));
    await insertInBatches(CAREER_SEEDS, (b) => db.insert(careers).values(b));
    await insertInBatches(CAREER_SKILL_SEEDS, (b) => db.insert(careerSkills).values(b));
    await insertInBatches(PATHWAY_SEEDS, (b) => db.insert(pathways).values(b));
    await insertInBatches(COURSE_SEEDS, (b) => db.insert(courses).values(b));
    await insertInBatches(INSTITUTION_SEEDS, (b) => db.insert(institutions).values(b));
    await insertInBatches(INSTITUTION_COURSE_SEEDS, (b) => db.insert(institutionCourses).values(b));
    await insertInBatches(INSTITUTION_SOURCE_SEEDS, (b) => db.insert(institutionSources).values(b));
    await insertInBatches(ADMISSION_INFO_SEEDS, (b) => db.insert(admissionInformation).values(b));
    await insertInBatches(EXAM_SEEDS, (b) => db.insert(entranceExams).values(b));
    await insertInBatches(SCHOLARSHIP_SEEDS, (b) => db.insert(scholarships).values(b));
    await insertInBatches(OPPORTUNITY_SEEDS, (b) => db.insert(opportunities).values(b));

    await insertInBatches(
      INTEREST_OPTIONS.map((o) => ({ slug: o.value, label: o.label, category: "interest" })),
      (b) => db.insert(interestsTable).values(b),
    );
    await insertInBatches(
      STRENGTH_OPTIONS.map((o) => ({ slug: o.value, label: o.label })),
      (b) => db.insert(strengthsTable).values(b),
    );
    await insertInBatches(
      GOAL_OPTIONS.map((o) => ({ slug: o.value, label: o.label })),
      (b) => db.insert(goalsTable).values(b),
    );

    // ---- RAG corpus: extract -> clean -> chunk -> embed -> store ----------
    const corpus = buildCorpus();
    await insertInBatches(corpus, (b) => db.insert(knowledgeDocuments).values(b));

    const provider = getEmbeddingProvider();
    const chunkRows: (typeof knowledgeChunks.$inferInsert)[] = [];
    for (const doc of corpus) {
      const pieces = chunkText(doc.body);
      const vectors = await provider.embed(pieces.map((p) => `${doc.title}. ${p}`));
      pieces.forEach((content, index) => {
        chunkRows.push({
          documentSlug: doc.slug,
          chunkIndex: index,
          content,
          keywords: [],
          embedding: vectors[index],
        });
      });
    }
    await insertInBatches(chunkRows, (b) => db.insert(knowledgeChunks).values(b), 50);

    await db.insert(dataImports).values({
      datasetLabel: DATASET_LABEL,
      fileName: "src/data/*.ts (sample master dataset)",
      recordCount: INSTITUTION_SEEDS.length,
      importedBy: "system-seed",
      notes:
        "Sample dataset for demonstration. Institution names/locations require verification; no fees, dates or seat counts are included.",
    });

    await db
      .insert(seedMeta)
      .values({ key: "catalog", version: SEED_VERSION })
      .onConflictDoUpdate({ target: seedMeta.key, set: { version: SEED_VERSION } });

    return true;
  } finally {
    await db.execute(sql`select pg_advisory_unlock(918273645)`).catch(() => undefined);
  }
}

/**
 * Called by data-reading services. Runs at most once per process and never
 * throws — if the database is unavailable the caller falls back to static
 * content and the UI shows an honest "data unavailable" state.
 */
export function ensureSeeded(): Promise<boolean> {
  if (!globalForSeed.__careerbridgeSeed) {
    globalForSeed.__careerbridgeSeed = runSeed().catch((error) => {
      console.error("[careerbridge] seed failed", error);
      globalForSeed.__careerbridgeSeed = undefined;
      return false;
    });
  }
  return globalForSeed.__careerbridgeSeed;
}
