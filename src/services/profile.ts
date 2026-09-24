import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  academicProfiles,
  counsellingResponses,
  counsellingSessions,
  preferences,
  studentGoals,
  studentInterests,
  studentProfiles,
  studentStrengths,
} from "@/db/schema";
import { getCurrentUser, getOrCreateProfileId } from "@/auth";
import {
  ACKNOWLEDGEMENTS,
  GOAL_OPTIONS,
  INTEREST_OPTIONS,
  STRENGTH_OPTIONS,
  SUBJECT_OPTIONS,
  VALUE_OPTIONS,
  findQuestion,
  questionsForStage,
  type CounsellingQuestion,
  type Stage,
} from "@/data/counselling";

const ANON_COOKIE = "cb_journey";
export const EXPLORATION_COOKIE = "cb_exploration";

export type ExplorationState = {
  directionSlug: string;
  selectedAt: string;
  completedSteps: string[];
};

export async function getExplorationState(): Promise<ExplorationState | null> {
  try {
    const value = (await cookies()).get(EXPLORATION_COOKIE)?.value;
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<ExplorationState>;
    if (typeof parsed.directionSlug !== "string") return null;
    return {
      directionSlug: parsed.directionSlug,
      selectedAt: typeof parsed.selectedAt === "string" ? parsed.selectedAt : new Date().toISOString(),
      completedSteps: Array.isArray(parsed.completedSteps) ? parsed.completedSteps.filter((step): step is string => typeof step === "string") : ["reflection", "direction"],
    };
  } catch {
    return null;
  }
}

export type StudentSnapshot = {
  stage: Stage;
  stageDetail: string | null;
  subjectsEnjoy: string[];
  subjectsDifficult: string[];
  performance: string | null;
  stream: string | null;
  interests: string[];
  strengths: string[];
  goals: string[];
  values: string[];
  workStyle: string | null;
  locationPref: string | null;
  district: string | null;
  budget: string | null;
  scholarshipNeed: string | null;
  institutionPref: string | null;
  hostel: string | null;
  notes: string[];
  answeredKeys: string[];
  completion: number;
};

export type SessionState = {
  sessionId: number;
  stage: Stage;
  stageDetail: string | null;
  status: string;
  snapshot: StudentSnapshot;
  answers: Record<string, { values: string[]; text: string | null }>;
};

export function labelFor(kind: "subject" | "interest" | "strength" | "goal" | "value", value: string): string {
  const source =
    kind === "subject"
      ? SUBJECT_OPTIONS
      : kind === "interest"
        ? INTEREST_OPTIONS
        : kind === "strength"
          ? STRENGTH_OPTIONS
          : kind === "goal"
            ? GOAL_OPTIONS
            : VALUE_OPTIONS;
  return source.find((o) => o.value === value)?.label ?? value.replace(/-/g, " ");
}

export function emptySnapshot(stage: Stage = "class10"): StudentSnapshot {
  return {
    stage,
    stageDetail: null,
    subjectsEnjoy: [],
    subjectsDifficult: [],
    performance: null,
    stream: null,
    interests: [],
    strengths: [],
    goals: [],
    values: [],
    workStyle: null,
    locationPref: null,
    district: null,
    budget: null,
    scholarshipNeed: null,
    institutionPref: null,
    hostel: null,
    notes: [],
    answeredKeys: [],
    completion: 0,
  };
}

type ResponseRow = { questionKey: string; answerValues: string[] | null; answerText: string | null };

export function buildSnapshot(stage: Stage, stageDetail: string | null, rows: ResponseRow[]): StudentSnapshot {
  const snap = emptySnapshot(stage);
  snap.stageDetail = stageDetail;
  const byKey = new Map<string, ResponseRow>();
  for (const row of rows) byKey.set(row.questionKey, row);

  const values = (key: string) => byKey.get(key)?.answerValues ?? [];
  const single = (key: string) => values(key)[0] ?? null;
  const text = (key: string) => byKey.get(key)?.answerText ?? null;

  snap.subjectsEnjoy = values("subjects_enjoy");
  snap.subjectsDifficult = values("subjects_difficult");
  snap.performance = single("performance");
  snap.stream = stage === "class10" ? single("stream_intent") : single("stream_current");
  snap.interests = values("interests");
  snap.strengths = values("strengths");
  snap.goals = values("goals");
  snap.values = values("values");
  snap.workStyle = single("work_style");
  snap.locationPref = single("location_pref");
  snap.district = single("home_district");
  snap.budget = single("budget");
  snap.scholarshipNeed = single("scholarship_need");
  snap.institutionPref = single("institution_pref");
  snap.hostel = single("hostel");
  snap.notes = [text("interest_story"), text("anything_else")].filter((v): v is string => Boolean(v && v.trim()));
  snap.answeredKeys = [...byKey.keys()];

  const core = questionsForStage(stage);
  const answeredCore = core.filter((q) => byKey.has(q.key)).length;
  snap.completion = Math.min(100, Math.round((answeredCore / Math.max(1, core.length)) * 100));
  return snap;
}

/* ------------------------------- session I/O ------------------------------- */

async function anonKey(create: boolean): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing) return existing;
  if (!create) return null;
  const key = randomBytes(16).toString("hex");
  jar.set(ANON_COOKIE, key, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return key;
}

export async function findSession(): Promise<typeof counsellingSessions.$inferSelect | null> {
  try {
    const user = await getCurrentUser();
    if (user) {
      const rows = await db
        .select()
        .from(counsellingSessions)
        .where(eq(counsellingSessions.userId, user.id))
        .orderBy(desc(counsellingSessions.updatedAt))
        .limit(1);
      if (rows[0]) return rows[0];
    }
    const key = await anonKey(false);
    if (!key) return null;
    const rows = await db
      .select()
      .from(counsellingSessions)
      .where(and(eq(counsellingSessions.anonymousKey, key), isNull(counsellingSessions.userId)))
      .orderBy(desc(counsellingSessions.updatedAt))
      .limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function startSession(stage: Stage, stageDetail: string | null): Promise<number> {
  const user = await getCurrentUser();
  const key = (await anonKey(true))!;
  const profileId = user ? await getOrCreateProfileId(user.id) : null;

  const existing = await findSession();
  if (existing) {
    await db
      .update(counsellingSessions)
      .set({ stage, stageDetail, userId: user?.id ?? existing.userId, profileId: profileId ?? existing.profileId, updatedAt: new Date() })
      .where(eq(counsellingSessions.id, existing.id));
    if (user) await syncProfileStage(user.id, stage, stageDetail);
    return existing.id;
  }

  const created = await db
    .insert(counsellingSessions)
    .values({
      userId: user?.id ?? null,
      profileId,
      anonymousKey: key,
      stage,
      stageDetail,
      totalSteps: questionsForStage(stage).length,
    })
    .returning({ id: counsellingSessions.id });
  if (user) await syncProfileStage(user.id, stage, stageDetail);
  return created[0].id;
}

async function syncProfileStage(userId: number, stage: Stage, stageDetail: string | null) {
  const profileId = await getOrCreateProfileId(userId);
  await db
    .update(studentProfiles)
    .set({ stage, stageDetail, updatedAt: new Date() })
    .where(eq(studentProfiles.id, profileId));
}

export async function getSessionState(): Promise<SessionState | null> {
  const session = await findSession();
  if (!session) return null;
  const rows = await db
    .select({
      questionKey: counsellingResponses.questionKey,
      answerValues: counsellingResponses.answerValues,
      answerText: counsellingResponses.answerText,
    })
    .from(counsellingResponses)
    .where(eq(counsellingResponses.sessionId, session.id));
  return {
    sessionId: session.id,
    stage: (session.stage as Stage) ?? "class10",
    stageDetail: session.stageDetail,
    status: session.status,
    snapshot: buildSnapshot((session.stage as Stage) ?? "class10", session.stageDetail, rows),
    answers: Object.fromEntries(rows.map((row) => [row.questionKey, { values: row.answerValues ?? [], text: row.answerText }])),
  };
}

export async function saveAnswer(input: {
  sessionId: number;
  questionKey: string;
  values: string[];
  text?: string | null;
}) {
  const question = findQuestion(input.questionKey);
  if (!question) throw new Error("Unknown question");

  await db
    .delete(counsellingResponses)
    .where(
      and(
        eq(counsellingResponses.sessionId, input.sessionId),
        eq(counsellingResponses.questionKey, input.questionKey),
      ),
    );

  await db.insert(counsellingResponses).values({
    sessionId: input.sessionId,
    questionKey: input.questionKey,
    questionText: question.prompt,
    answerType: question.answerType,
    answerValues: input.values,
    answerText: input.text ?? null,
  });

  await db
    .update(counsellingSessions)
    .set({ updatedAt: new Date() })
    .where(eq(counsellingSessions.id, input.sessionId));
}

export function nextQuestion(stage: Stage, answeredKeys: string[]): CounsellingQuestion | null {
  const list = questionsForStage(stage);
  return list.find((q) => !answeredKeys.includes(q.key)) ?? null;
}

export function progressFor(stage: Stage, answeredKeys: string[]) {
  const list = questionsForStage(stage);
  const answered = list.filter((q) => answeredKeys.includes(q.key)).length;
  return { answered, total: list.length };
}

export function acknowledgementFor(questionKey: string) {
  return ACKNOWLEDGEMENTS[questionKey] ?? "Thanks for sharing that.";
}

/* ---------------------- persist structured student profile ---------------------- */

export async function persistSnapshot(snapshot: StudentSnapshot) {
  const user = await getCurrentUser();
  if (!user) return;
  const profileId = await getOrCreateProfileId(user.id);

  await db
    .update(studentProfiles)
    .set({
      stage: snapshot.stage,
      stageDetail: snapshot.stageDetail,
      districtCode: snapshot.district,
      completion: snapshot.completion,
      summary: snapshot as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    })
    .where(eq(studentProfiles.id, profileId));

  await db.delete(academicProfiles).where(eq(academicProfiles.profileId, profileId));
  await db.insert(academicProfiles).values({
    profileId,
    currentClass: snapshot.stage === "class10" ? "Class 10" : "Class 12",
    completedClass: snapshot.stageDetail === "completed" ? (snapshot.stage === "class10" ? "Class 10" : "Class 12") : null,
    stream: snapshot.stream,
    resultsStatus: snapshot.stageDetail === "awaiting_results" ? "awaiting" : snapshot.performance,
    performanceBand: snapshot.performance,
    subjects: snapshot.subjectsEnjoy,
    strongSubjects: snapshot.subjectsEnjoy,
    difficultSubjects: snapshot.subjectsDifficult,
  });

  await db.delete(studentInterests).where(eq(studentInterests.profileId, profileId));
  if (snapshot.interests.length) {
    await db.insert(studentInterests).values(
      snapshot.interests.map((slug) => ({
        profileId,
        interestSlug: slug,
        label: labelFor("interest", slug),
      })),
    );
  }

  await db.delete(studentStrengths).where(eq(studentStrengths.profileId, profileId));
  if (snapshot.strengths.length) {
    await db.insert(studentStrengths).values(
      snapshot.strengths.map((slug) => ({
        profileId,
        strengthSlug: slug,
        label: labelFor("strength", slug),
      })),
    );
  }

  await db.delete(studentGoals).where(eq(studentGoals.profileId, profileId));
  if (snapshot.goals.length) {
    await db.insert(studentGoals).values(
      snapshot.goals.map((slug) => ({ profileId, goalSlug: slug, label: labelFor("goal", slug) })),
    );
  }

  await db.delete(preferences).where(eq(preferences.profileId, profileId));
  const prefRows: (typeof preferences.$inferInsert)[] = [];
  for (const value of snapshot.values) {
    prefRows.push({ profileId, kind: "value", key: value, label: labelFor("value", value) });
  }
  const constraints: [string, string | null][] = [
    ["location_pref", snapshot.locationPref],
    ["district", snapshot.district],
    ["budget", snapshot.budget],
    ["scholarship_need", snapshot.scholarshipNeed],
    ["institution_pref", snapshot.institutionPref],
    ["hostel", snapshot.hostel],
    ["work_style", snapshot.workStyle],
  ];
  for (const [key, value] of constraints) {
    if (value) prefRows.push({ profileId, kind: "constraint", key, value });
  }
  for (const note of snapshot.notes) prefRows.push({ profileId, kind: "other", key: "note", value: note });
  if (prefRows.length) await db.insert(preferences).values(prefRows);
}

export async function completeSession(sessionId: number) {
  await db
    .update(counsellingSessions)
    .set({ status: "completed", completedAt: new Date(), updatedAt: new Date() })
    .where(eq(counsellingSessions.id, sessionId));
}

export async function resetSession(sessionId: number) {
  await db.delete(counsellingResponses).where(eq(counsellingResponses.sessionId, sessionId));
  await db
    .update(counsellingSessions)
    .set({ status: "in_progress", completedAt: null, updatedAt: new Date() })
    .where(eq(counsellingSessions.id, sessionId));
}
