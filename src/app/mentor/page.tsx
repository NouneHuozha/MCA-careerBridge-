import Image from "next/image";
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
    <div className="mb-6 flex items-center justify-between gap-4 text-sm text-ink-500"><Link href="/" className="hover:text-forest-700">Home</Link><span className="text-ink-300">/</span><span className="font-medium text-ink-800">Talk to Mentor</span></div>
    <div className="grid items-stretch gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(560px,1.05fr)]">
      <section className="relative min-h-[560px] overflow-hidden rounded-[1.75rem] bg-[#eef8f5] p-7 sm:p-10 lg:min-h-[650px]" aria-label="CareerBridge Mentor introduction"><div className="absolute inset-0"><Image src="/images/mentor-hero.png" alt="Student exploring career possibilities with a laptop" fill sizes="700px" className="object-cover object-center" /><div className="absolute inset-0 bg-gradient-to-t from-[#dcefe8] via-[#eef8f5]/55 to-white/20" /></div><div className="relative z-10 max-w-md"><Eyebrow>CareerBridge Mentor</Eyebrow><h1 className="mt-4 text-[clamp(2.3rem,5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-.04em] text-[#073f36]">Let’s talk it through.</h1><p className="mt-5 max-w-sm text-lg leading-relaxed text-ink-600">Ask a question, explore an alternative, or make sense of your options.</p><div className="mt-7 inline-flex rounded-2xl bg-white/85 px-4 py-3 text-sm font-semibold text-forest-800 shadow-sm">Different questions. A brighter you.</div></div></section>
      <section className="min-w-0"><MentorChat key={params.q ?? "mentor"} compact initialMessages={initialMessages} initialQuestion={params.q} providerConfigured={aiStatus().configured} />{!user && <p className="mt-4 text-xs text-ink-500"><Link className="cb-source" href="/sign-in">Sign in to save your conversation</Link>. Guest chats last until you leave or reload this page.</p>}</section>
    </div>
  </div>;
}
