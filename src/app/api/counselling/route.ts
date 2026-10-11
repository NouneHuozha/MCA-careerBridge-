import { NextResponse } from "next/server";
import { acknowledgementFor, completeSession, emptySnapshot, getSessionState, nextQuestion, persistSnapshot, progressFor, resetSession, saveAnswer, startSession } from "@/services/profile";
import { findQuestion, SECTIONS, type Stage } from "@/data/counselling";

export const dynamic = "force-dynamic";
const VALID_STAGE_DETAILS = ["studying", "completed", "awaiting_results", "deciding"];

async function currentState(focusKey?: string | null, acknowledgement?: string) {
  const state = await getSessionState();
  if (!state) return { started: false, stage: "class10" as Stage, stageDetail: null, status: "in_progress", snapshot: emptySnapshot(), answers: {}, question: null, acknowledgement, progress: { answered: 0, total: 0 }, sections: SECTIONS, completed: false };
  const requested = focusKey ? findQuestion(focusKey) : null;
  const focus = requested && (!requested.stages || requested.stages.includes(state.stage)) ? requested : null;
  const question = focus ?? nextQuestion(state.stage, state.snapshot.answeredKeys);
  return { started: true, stage: state.stage, stageDetail: state.stageDetail, status: state.status, snapshot: state.snapshot, answers: state.answers, question, acknowledgement, progress: progressFor(state.stage, state.snapshot.answeredKeys), sections: SECTIONS, completed: state.status === "completed" };
}

export async function GET(request: Request) {
  try { return NextResponse.json(await currentState(new URL(request.url).searchParams.get("question")), { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return NextResponse.json({ error: "We couldn't load your session right now." }, { status: 503 }); }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error(); }
  catch { return NextResponse.json({ error: "Please try sending your answer again." }, { status: 400 }); }

  const action = String(body.action ?? "answer");
  if (!["context", "answer", "skip", "reset", "complete"].includes(action)) return NextResponse.json({ error: "That action is unavailable." }, { status: 400 });

  if (action === "context") {
    const stage = body.stage === "class12" ? "class12" : body.stage === "class10" ? "class10" : null;
    const stageDetail = String(body.stageDetail ?? "");
    if (!stage || !VALID_STAGE_DETAILS.includes(stageDetail)) return NextResponse.json({ error: "Choose your stage and current situation to continue." }, { status: 400 });
    try {
      await startSession(stage, stageDetail);
      return NextResponse.json(await currentState(), { headers: { "Cache-Control": "private, no-store" } });
    } catch (error) {
      console.error("[careerbridge] counselling context update failed", error);
      return NextResponse.json({ error: "We couldn't save your starting point just now." }, { status: 503 });
    }
  }

  try {
    let state = await getSessionState();
    if (!state) return NextResponse.json({ error: "Start with your current study stage first." }, { status: 400 });
    if (action === "reset") { await resetSession(state.sessionId); const reset = await getSessionState(); if (reset) await persistSnapshot(reset.snapshot); return NextResponse.json(await currentState()); }
    if (action === "complete") {
      if (nextQuestion(state.stage, state.snapshot.answeredKeys)) return NextResponse.json({ error: "Finish the required questions, or choose ‘I’m not sure yet’." }, { status: 400 });
      await completeSession(state.sessionId); await persistSnapshot(state.snapshot); return NextResponse.json(await currentState());
    }
    const questionKey = String(body.questionKey ?? "");
    const question = findQuestion(questionKey);
    if (!question || (question.stages && !question.stages.includes(state.stage))) return NextResponse.json({ error: "Please choose a question for your current stage." }, { status: 400 });
    if (action === "skip" && !question.allowSkip) return NextResponse.json({ error: "This question cannot be skipped here." }, { status: 400 });
    const raw = Array.isArray(body.values) ? body.values : [];
    const values = [...new Set(raw.filter((value): value is string => typeof value === "string").map((value) => value.trim()).filter(Boolean))];
    const text = typeof body.text === "string" ? body.text.trim() : null;
    const allowed = new Set([...(question.options ?? []).map((option) => option.value), "not-sure"]);
    if (values.some((value) => value.length > 80) || values.length > (question.answerType === "single" ? 1 : question.maxSelections ?? 20) || (text?.length ?? 0) > 600 || (!question.allowOther && question.answerType !== "text" && values.some((value) => !allowed.has(value)))) {
      return NextResponse.json({ error: "Please use one of the available options, or the ‘Something else’ field where shown." }, { status: 400 });
    }
    if (action === "answer" && !values.length && !text) return NextResponse.json({ error: "Choose an option, write a short answer, or choose ‘I’m not sure yet’." }, { status: 400 });
    await saveAnswer({ sessionId: state.sessionId, questionKey, values: action === "skip" ? [] : values, text: action === "skip" ? null : text });
    const refreshed = await getSessionState();
    if (refreshed) await persistSnapshot(refreshed.snapshot);
    return NextResponse.json(await currentState(null, action === "skip" ? "Skipped — you can return to this later." : values.includes("not-sure") ? "Not sure is completely okay." : acknowledgementFor(questionKey)));
  } catch (error) {
    console.error("[careerbridge] counselling update failed", error);
    return NextResponse.json({ error: "We couldn't save that just now. Your earlier answers are safe — please try again." }, { status: 503 });
  }
}
