import { Eyebrow } from "@/components/ui";
import { MentorChat, type MentorMessage } from "@/components/mentor-chat";
import { getCurrentUser } from "@/auth";
import { getOrCreateConversation, listMessages } from "@/services/mentor";
import { aiStatus } from "@/ai";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ask the mentor" };

export default async function MentorPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  let initialMessages: MentorMessage[] = [];
  if (user) {
    try {
      const conversation = await getOrCreateConversation(user.id, null);
      const rows = await listMessages(conversation.id);
      initialMessages = rows.slice(-30).map((row) => ({ role: row.role as "student" | "mentor", content: row.content, citations: row.citations ?? [], confidence: row.confidence }));
    } catch { /* The empty conversation remains usable if history is unavailable. */ }
  }
  return <div className="cb-container cb-page">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><Eyebrow>CareerBridge Mentor</Eyebrow><h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Let’s talk it through.</h1></div><p className="max-w-md text-sm text-ink-500">Ask a question. Explore an alternative. The choice stays yours.</p></div>
    <MentorChat key={params.q ?? "mentor"} initialMessages={initialMessages} initialQuestion={params.q} providerConfigured={aiStatus().configured} />
    {!user && <p className="mt-4 text-xs text-ink-500"><Link className="cb-source" href="/sign-in">Sign in to save your conversation</Link>. Guest chats last until you leave or reload this page.</p>}
  </div>;
}
