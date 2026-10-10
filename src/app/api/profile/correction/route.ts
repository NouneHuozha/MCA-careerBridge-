import { NextResponse } from "next/server";
import { findQuestion, isStageDetail, type Stage } from "@/data/counselling";
import { getSessionState, persistSnapshot, saveAnswer, startSession } from "@/services/profile";

export const dynamic = "force-dynamic";

const editableKeys = new Set([
  "subjects_enjoy",
  "interests",
  "strengths",
  "work_style",
  "goals",
  "values",
  "budget",
  "scholarship_need",
  "location_pref",
]);
const stages = new Set<Stage>(["class10", "class12"]);

type CorrectionBody = { stage?: unknown; stageDetail?: unknown; answers?: unknown };

export async function POST(request: Request) {
  let body: CorrectionBody;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed as CorrectionBody;
  } catch {
    return NextResponse.json({ error: "Please try sending your profile changes again." }, { status: 400 });
  }

  const stage = body.stage;
  const stageDetail = body.stageDetail;
  if (typeof stage !== "string" || !stages.has(stage as Stage) || typeof stageDetail !== "string" || !isStageDetail(stageDetail)) {
    return NextResponse.json({ error: "Choose an available study stage and results status." }, { status: 400 });
  }
  if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
    return NextResponse.json({ error: "Your profile changes could not be read." }, { status: 400 });
  }

  const answerEntries = Object.entries(body.answers as Record<string, unknown>);
  const validated: { key: string; values: string[]; text?: string | null }[] = [];
  for (const [key, raw] of answerEntries) {
    const answerObject = raw && typeof raw === "object" && !Array.isArray(raw) ? raw as { values?: unknown; text?: unknown } : null;
    const rawValues = Array.isArray(raw) ? raw : answerObject?.values;
    if (!editableKeys.has(key) || !Array.isArray(rawValues) || rawValues.some((value) => typeof value !== "string")) {
      return NextResponse.json({ error: "One of the profile fields is not available to edit here." }, { status: 400 });
    }
    const question = findQuestion(key);
    if (!question) return NextResponse.json({ error: "One of the profile fields is not available to edit here." }, { status: 400 });
    const values = [...new Set((rawValues as string[]).map((value) => value.trim()).filter(Boolean))];
    const allowed = new Set([...(question.options ?? []).map((option) => option.value), "not-sure"]);
    const max = question.answerType === "single" ? 1 : question.maxSelections ?? 20;
    if (values.some((value) => value.length > 80 || (!allowed.has(value) && !question.allowOther)) || values.length > max) {
      return NextResponse.json({ error: "Please use the available answers for each profile field." }, { status: 400 });
    }
    const includesText = answerObject !== null && Object.prototype.hasOwnProperty.call(answerObject, "text");
    if (includesText && answerObject?.text !== null && typeof answerObject?.text !== "string") {
      return NextResponse.json({ error: "Please check the written detail and try again." }, { status: 400 });
    }
    const text = typeof answerObject?.text === "string" ? answerObject.text.trim() : answerObject?.text as null | undefined;
    if ((text?.length ?? 0) > 600) return NextResponse.json({ error: "Please keep written details to 600 characters or fewer." }, { status: 400 });
    validated.push({ key, values, ...(includesText ? { text: text ?? null } : {}) });
  }

  try {
    const current = await getSessionState();
    if (!current) return NextResponse.json({ error: "Your counselling profile is not available. Please return to counselling." }, { status: 404 });
    if (current.status !== "completed") return NextResponse.json({ error: "Finish your counselling reflection before correcting this profile." }, { status: 409 });

    if (current.stage !== stage || current.stageDetail !== stageDetail) await startSession(stage as Stage, stageDetail);
    const session = await getSessionState();
    if (!session) throw new Error("Session unavailable");
    for (const answer of validated) {
      await saveAnswer({ sessionId: session.sessionId, questionKey: answer.key, values: answer.values, text: answer.text === undefined ? session.answers[answer.key]?.text ?? null : answer.text });
    }
    const updated = await getSessionState();
    if (updated) await persistSnapshot(updated.snapshot);
    return NextResponse.json({ ok: true, stage, stageDetail, updatedAnswers: validated.length }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[careerbridge] profile correction failed", error);
    return NextResponse.json({ error: "We couldn't save those changes just now. Your earlier answers are safe—please try again." }, { status: 503 });
  }
}
