import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mentorConversations, mentorMessages } from "@/db/schema";
import { MENTOR_SYSTEM_PROMPT, getAIProvider, type AIMessage } from "@/ai";
import { citationsFrom, retrieve, type RetrievedChunk } from "@/rag";
import { labelFor, type StudentSnapshot } from "@/services/profile";

export type Citation = { title: string; url?: string | null; sourceType: string; retrievedAt?: string | null };

export type MentorReply = {
  answer: string;
  citations: Citation[];
  confidence: "grounded" | "general" | "unverified";
  provider: string;
  followUps: string[];
};

const OPENING_QUESTIONS = [
  "What do you enjoy about it — solving problems, building things, working with people, or something else?",
  "Would you like to look at what the day-to-day work actually involves?",
  "Shall we compare two options side by side?",
];

function snapshotContext(snapshot?: StudentSnapshot | null): string {
  if (!snapshot) return "The student has not completed the counselling questions yet.";
  const parts: string[] = [];
  parts.push(`Stage: ${snapshot.stage === "class10" ? "Class 10" : "Class 12"}${snapshot.stageDetail ? ` (${snapshot.stageDetail.replace(/_/g, " ")})` : ""}.`);
  if (snapshot.subjectsEnjoy.length) parts.push(`Enjoys: ${snapshot.subjectsEnjoy.map((s) => labelFor("subject", s)).join(", ")}.`);
  if (snapshot.subjectsDifficult.length) parts.push(`Finds difficult: ${snapshot.subjectsDifficult.map((s) => labelFor("subject", s)).join(", ")}.`);
  if (snapshot.interests.length) parts.push(`Interests: ${snapshot.interests.map((s) => labelFor("interest", s)).join(", ")}.`);
  if (snapshot.strengths.length) parts.push(`Strengths: ${snapshot.strengths.map((s) => labelFor("strength", s)).join(", ")}.`);
  if (snapshot.goals.length) parts.push(`Goals: ${snapshot.goals.map((s) => labelFor("goal", s)).join(", ")}.`);
  if (snapshot.values.length) parts.push(`Values: ${snapshot.values.map((s) => labelFor("value", s)).join(", ")}.`);
  if (snapshot.locationPref) parts.push(`Location preference: ${snapshot.locationPref.replace(/-/g, " ")}.`);
  if (snapshot.district) parts.push(`Closest district: ${snapshot.district}.`);
  if (snapshot.budget) parts.push(`Budget band: ${snapshot.budget}.`);
  return parts.join(" ");
}

function buildContextBlock(chunks: RetrievedChunk[]): string {
  return chunks
    .map((chunk, index) => {
      const source = chunk.sourceUrl ? `source: ${chunk.sourceUrl}` : `source: CareerBridge guidance content`;
      return `[${index + 1}] ${chunk.title} (${source}; status: ${chunk.verificationStatus})\n${chunk.content}`;
    })
    .join("\n\n");
}

/** Retrieval-only answer used when no AI provider is configured, or a call fails. */
function composeGroundedAnswer(question: string, chunks: RetrievedChunk[], snapshot?: StudentSnapshot | null): MentorReply {
  if (!chunks.length) {
    return {
      answer: [
        "I don't have enough verified information to answer that confidently.",
        "",
        "For anything time-sensitive — fees, admission dates, eligibility cut-offs or scholarship deadlines — please check the official institution website or government portal, since those change every cycle.",
        "",
        "If you'd like, ask me about a field, a course, a pathway or an entrance exam and I'll share what we do have, with the source.",
      ].join("\n"),
      citations: [],
      confidence: "unverified",
      provider: "retrieval-only",
      followUps: ["What are my options after Class 10?", "Compare BCA and B.Sc Computer Science", "How do I choose a stream?"],
    };
  }

  const lead = snapshot?.interests.length
    ? "Here's what we have on that, based on what you've told us so far."
    : "Here's what we have on that.";

  const body = chunks
    .slice(0, 3)
    .map((chunk) => `**${chunk.title}**\n${chunk.content}`)
    .join("\n\n");

  return {
    answer: [
      lead,
      "",
      body,
      "",
      "These are starting points for exploration, not conclusions about your future — the decision stays with you. Anything time-sensitive should be confirmed on the official source listed below.",
    ].join("\n"),
    citations: citationsFrom(chunks),
    confidence: "grounded",
    provider: "retrieval-only",
    followUps: OPENING_QUESTIONS,
  };
}

export async function askMentor(input: {
  question: string;
  snapshot?: StudentSnapshot | null;
  history?: { role: "student" | "mentor"; content: string }[];
}): Promise<MentorReply> {
  const question = input.question.trim();
  if (!question) {
    return {
      answer: "What would you like to think through? You can ask about a field, a course, an exam, or simply say you're not sure yet.",
      citations: [],
      confidence: "general",
      provider: "retrieval-only",
      followUps: ["I don't know what to do after Class 10", "What can I do if I don't clear NEET?", "Which courses can I study in Nagaland?"],
    };
  }

  const interestHints = input.snapshot?.interests.join(" ") ?? "";
  const chunks = await retrieve(`${question} ${interestHints}`, { limit: 5 });
  const provider = getAIProvider();

  if (!provider) return composeGroundedAnswer(question, chunks, input.snapshot);

  const messages: AIMessage[] = [
    { role: "system", content: MENTOR_SYSTEM_PROMPT },
    {
      role: "system",
      content: `WHAT THE STUDENT TOLD US (student-provided, not verified fact):\n${snapshotContext(input.snapshot)}`,
    },
    {
      role: "system",
      content: chunks.length
        ? `CONTEXT (use only this for factual claims; cite by name where useful):\n\n${buildContextBlock(chunks)}`
        : "CONTEXT: none retrieved. You must say you don't have enough verified information for factual questions, and point to official sources.",
    },
    ...(input.history ?? []).slice(-6).map<AIMessage>((m) => ({
      role: m.role === "student" ? "user" : "assistant",
      content: m.content,
    })),
    { role: "user", content: question },
  ];

  try {
    const result = await provider.complete({ messages, temperature: 0.3, maxTokens: 700 });
    if (!result.text) return composeGroundedAnswer(question, chunks, input.snapshot);
    return {
      answer: result.text,
      citations: citationsFrom(chunks),
      confidence: chunks.length ? "grounded" : "general",
      provider: result.provider,
      followUps: OPENING_QUESTIONS,
    };
  } catch (error) {
    console.error("[careerbridge] mentor provider failed", error);
    const fallback = composeGroundedAnswer(question, chunks, input.snapshot);
    return {
      ...fallback,
      answer: `${fallback.answer}\n\n_(The AI mentor service is unavailable right now, so this answer comes straight from our verified guidance library.)_`,
    };
  }
}

/* --------------------------- conversation storage --------------------------- */

export async function getOrCreateConversation(userId: number | null, anonymousKey: string | null) {
  if (userId) {
    const rows = await db
      .select()
      .from(mentorConversations)
      .where(eq(mentorConversations.userId, userId))
      .orderBy(desc(mentorConversations.updatedAt))
      .limit(1);
    if (rows[0]) return rows[0];
  }
  const created = await db
    .insert(mentorConversations)
    .values({ userId, anonymousKey, title: "Mentor conversation" })
    .returning();
  return created[0];
}

export async function listMessages(conversationId: number) {
  return db
    .select()
    .from(mentorMessages)
    .where(eq(mentorMessages.conversationId, conversationId))
    .orderBy(mentorMessages.id);
}

export async function appendMessage(input: {
  conversationId: number;
  role: "student" | "mentor";
  content: string;
  citations?: Citation[];
  confidence?: string;
}) {
  await db.insert(mentorMessages).values({
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    citations: input.citations ?? [],
    confidence: input.confidence ?? null,
  });
  await db
    .update(mentorConversations)
    .set({ updatedAt: new Date() })
    .where(eq(mentorConversations.id, input.conversationId));
}
