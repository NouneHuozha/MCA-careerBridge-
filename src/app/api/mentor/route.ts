import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/auth";
import { getSessionState } from "@/services/profile";
import { appendMessage, askMentor, getOrCreateConversation, listMessages } from "@/services/mentor";
import { aiStatus } from "@/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ messages: [], ...aiStatus() });
    const conversation = await getOrCreateConversation(user.id, null);
    const messages = await listMessages(conversation.id);
    return NextResponse.json({
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        citations: m.citations ?? [],
        confidence: m.confidence,
      })),
      ...aiStatus(),
    });
  } catch (error) {
    console.error("[careerbridge] mentor GET failed", error);
    return NextResponse.json({ messages: [], ...aiStatus() });
  }
}

export async function POST(request: Request) {
  let body: { question?: unknown; history?: unknown };
  try {
    body = (await request.json()) as { question?: unknown; history?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim().slice(0, 1000) : "";
  if (!question) return NextResponse.json({ error: "Please type a question." }, { status: 400 });

  const history = Array.isArray(body.history)
    ? (body.history as { role?: unknown; content?: unknown }[])
        .filter((m) => (m.role === "student" || m.role === "mentor") && typeof m.content === "string")
        .map((m) => ({ role: m.role as "student" | "mentor", content: String(m.content).slice(0, 2000) }))
        .slice(-6)
    : [];

  try {
    const [user, state] = await Promise.all([getCurrentUser(), getSessionState()]);
    const reply = await askMentor({ question, snapshot: state?.snapshot ?? null, history });

    if (user) {
      const jar = await cookies();
      const conversation = await getOrCreateConversation(user.id, jar.get("cb_journey")?.value ?? null);
      await appendMessage({ conversationId: conversation.id, role: "student", content: question });
      await appendMessage({
        conversationId: conversation.id,
        role: "mentor",
        content: reply.answer,
        citations: reply.citations,
        confidence: reply.confidence,
      });
    }

    return NextResponse.json(reply);
  } catch (error) {
    console.error("[careerbridge] mentor POST failed", error);
    return NextResponse.json(
      {
        answer:
          "The mentor service is unavailable right now. You can still explore fields, courses and institutions — and please check official portals for anything time-sensitive.",
        citations: [],
        confidence: "unverified",
        provider: "unavailable",
        followUps: [],
      },
      { status: 200 },
    );
  }
}
