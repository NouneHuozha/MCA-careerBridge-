/**
 * AI provider abstraction.
 * -----------------------------------------------------------------------------
 * Application code depends on `AIProvider` only. Swapping OpenAI for Anthropic,
 * Google or a local model is a configuration change, not a code change.
 *
 * If no provider is configured, `getAIProvider()` returns null and the mentor
 * falls back to a retrieval-only, source-grounded composer. That keeps the
 * product honest: no provider means no generated prose, only retrieved text.
 */

export type AIMessage = { role: "system" | "user" | "assistant"; content: string };

export type AICompletionRequest = {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type AICompletionResult = {
  text: string;
  provider: string;
};

export interface AIProvider {
  readonly name: string;
  isConfigured(): boolean;
  complete(request: AICompletionRequest): Promise<AICompletionResult>;
}

const TIMEOUT_MS = 20_000;

async function postJson(url: string, headers: Record<string, string>, body: unknown) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`Provider responded with ${response.status}`);
    }
    return (await response.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

export class OpenAIProvider implements AIProvider {
  readonly name = "openai";

  isConfigured() {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    const data = await postJson(
      "https://api.openai.com/v1/chat/completions",
      { authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      {
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: request.messages,
        temperature: request.temperature ?? 0.3,
        max_tokens: request.maxTokens ?? 700,
      },
    );
    const choices = data.choices as { message?: { content?: string } }[] | undefined;
    return { text: choices?.[0]?.message?.content?.trim() ?? "", provider: this.name };
  }
}

export class AnthropicProvider implements AIProvider {
  readonly name = "anthropic";

  isConfigured() {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    const system = request.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const messages = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));
    const data = await postJson(
      "https://api.anthropic.com/v1/messages",
      { "x-api-key": process.env.ANTHROPIC_API_KEY as string, "anthropic-version": "2023-06-01" },
      {
        model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest",
        system,
        messages,
        max_tokens: request.maxTokens ?? 700,
        temperature: request.temperature ?? 0.3,
      },
    );
    const content = data.content as { text?: string }[] | undefined;
    return { text: content?.map((c) => c.text ?? "").join("").trim() ?? "", provider: this.name };
  }
}

export class GoogleProvider implements AIProvider {
  readonly name = "google";

  isConfigured() {
    return Boolean(process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY);
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    const key = process.env.GOOGLE_AI_API_KEY ?? process.env.GEMINI_API_KEY;
    const model = process.env.GOOGLE_AI_MODEL ?? "gemini-1.5-flash";
    const systemInstruction = request.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
    const contents = request.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
    const data = await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {},
      {
        systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
        contents,
        generationConfig: { temperature: request.temperature ?? 0.3, maxOutputTokens: request.maxTokens ?? 700 },
      },
    );
    const candidates = data.candidates as { content?: { parts?: { text?: string }[] } }[] | undefined;
    const text = candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return { text: text.trim(), provider: this.name };
  }
}

const PROVIDERS: AIProvider[] = [new OpenAIProvider(), new AnthropicProvider(), new GoogleProvider()];

export function getAIProvider(): AIProvider | null {
  const preferred = process.env.AI_PROVIDER;
  if (preferred) {
    const match = PROVIDERS.find((p) => p.name === preferred);
    if (match?.isConfigured()) return match;
  }
  return PROVIDERS.find((p) => p.isConfigured()) ?? null;
}

export function aiStatus() {
  const provider = getAIProvider();
  return {
    configured: Boolean(provider),
    provider: provider?.name ?? "retrieval-only",
  };
}

/** Guardrails applied to every mentor call, regardless of provider. */
export const MENTOR_SYSTEM_PROMPT = `You are CareerBridge Mentor, a careful career and education counsellor for students in Nagaland, India.

Principles you must follow:
- GUIDE, DON'T DECIDE. Never tell a student what their career will be or should be. Offer areas to explore and explain your reasoning.
- Never give percentages, probabilities, match scores or guarantees of admission, selection or income.
- Use only the CONTEXT provided for factual claims about courses, eligibility, fees, dates, institutions, scholarships and exams. If the context does not contain the answer, say clearly: "I don't have enough verified information to answer that confidently," and point the student to the official source.
- Never invent institution names, fees, deadlines, seat numbers or cut-offs.
- Distinguish clearly between (a) what the student told you, (b) general guidance, and (c) verified information from a source.
- Be warm, plain-spoken and brief. Prefer short paragraphs. Ask one thoughtful follow-up question when it would genuinely help.
- Respect that the student may be a minor. Do not ask for addresses, income figures, phone numbers or any identifying details.
- Remind the student that the final decision is theirs.`;
