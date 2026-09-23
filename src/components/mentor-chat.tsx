"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, MessageCircle, Send, ShieldCheck, LoaderCircle, RotateCcw } from "lucide-react";
import { Button, Callout, Disclosure, SourceLink, cx } from "@/components/ui";

export type MentorCitation = { title: string; url?: string | null; sourceType: string; retrievedAt?: string | null };
export type MentorMessage = { role: "student" | "mentor"; content: string; citations?: MentorCitation[]; confidence?: string | null };
const STARTERS = ["I’m not sure what to do after Class 10", "Compare BCA and B.Sc Computer Science", "What if I want to study in Nagaland?", "How can I find scholarships?"];

function inlineText(text: string): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part);
}
function Paragraphs({ text }: { text: string }) {
  return <div className="cb-reading whitespace-pre-wrap break-words">{text.split(/\n\s*\n/).filter(Boolean).map((paragraph, i) => <p key={i}>{inlineText(paragraph)}</p>)}</div>;
}
function MessageBody({ message }: { message: MentorMessage }) {
  const long = message.content.length > 850 && message.role === "mentor";
  const paragraphs = message.content.split(/\n\s*\n/);
  let splitAt = long ? message.content.indexOf("\n\n", Math.min(250, message.content.length)) : -1;
  if (long && (splitAt < 0 || splitAt > 700)) splitAt = message.content.indexOf(". ", 320) + 1;
  if (splitAt < 1 || splitAt > 800) splitAt = 0;
  return <>
    <Paragraphs text={splitAt ? message.content.slice(0, splitAt) : paragraphs.join("\n\n")} />
    {splitAt > 0 && <div className="mt-3"><Disclosure summary="Read the details"><Paragraphs text={message.content.slice(splitAt).trim()} /></Disclosure></div>}
    {!!message.citations?.length && <div className="mt-4 border-t border-ink-200 pt-3">
      <details className="group/sources"><summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-bold text-forest-700"><BookOpen aria-hidden className="h-3.5 w-3.5" />View sources ({message.citations.length})<ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-open/sources:rotate-90" /></summary>
        <ul className="mt-3 space-y-3">{message.citations.map((citation, i) => <li key={`${citation.title}-${i}`} className="text-xs">
          {citation.url ? <SourceLink href={citation.url} variant="inline">{citation.title}</SourceLink> : <span className="font-semibold text-ink-700">{citation.title}</span>}
          <span className="mt-1 block text-ink-500">{citation.sourceType === "careerbridge_guidance" ? "CareerBridge guidance" : citation.retrievedAt ? `Source checked ${new Date(citation.retrievedAt).toLocaleDateString("en-GB")}` : "Current details not yet verified"}</span>
        </li>)}</ul>
      </details>
    </div>}
  </>;
}

export function MentorChat({ initialMessages = [], initialQuestion, providerConfigured = false, compact = false, starterQuestions, contextTitle = "CareerBridge Mentor", contextSubtitle, hideHeader = false }: { initialMessages?: MentorMessage[]; initialQuestion?: string; providerConfigured?: boolean; compact?: boolean; starterQuestions?: string[]; contextTitle?: string; contextSubtitle?: string; hideHeader?: boolean }) {
  const [messages, setMessages] = useState<MentorMessage[]>(initialMessages.length ? initialMessages : [{ role: "mentor", content: "Hi, I’m your CareerBridge mentor. What would you like to think through? It’s okay not to know where to start." }]);
  const [input, setInput] = useState(initialQuestion ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const busy = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const starterOptions = starterQuestions?.length ? starterQuestions : STARTERS;
  useEffect(() => () => requestRef.current?.abort(), []);
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTo({ top: node.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, [messages.length, pending]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || busy.current) return;
    busy.current = true; setError(null); setInput(""); setLastQuestion(trimmed); setPending(true);
    const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => prev.at(-1)?.role === "student" && prev.at(-1)?.content === trimmed ? prev : [...prev, { role: "student", content: trimmed }]);
    const controller = new AbortController(); requestRef.current = controller;
    try {
      const response = await fetch("/api/mentor", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: trimmed, history }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok || data.error || typeof data.answer !== "string") throw new Error("Unavailable");
      setMessages((prev) => [...prev, { role: "mentor", content: data.answer, citations: data.citations ?? [], confidence: data.confidence }]);
    } catch { if (!controller.signal.aborted) { setError("The connection was interrupted. Your question is still here."); setInput(trimmed); } }
    finally { busy.current = false; if (!controller.signal.aborted) setPending(false); }
  }
  const conversation = <section className="cb-mentor-shell" data-compact={compact} aria-label="Mentor conversation">
    {!hideHeader && <header className={cx("flex shrink-0 items-center gap-3 border-b border-forest-200 bg-forest-50", compact ? "px-4 py-3" : "px-5 py-4")}>
      <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-forest-700 text-white"><MessageCircle className="h-5 w-5" /></span>
      <div><p className="text-sm font-bold text-ink-900">{contextTitle}</p><p className="text-xs text-ink-500">{contextSubtitle ?? (providerConfigured ? "Here to help you think it through" : "Guidance from our learning library")}</p></div>
    </header>}
    <div ref={scroller} tabIndex={0} role="log" aria-label="Chat messages — scroll to see earlier messages" aria-live="polite" aria-relevant="additions" className={cx("cb-scroll cb-chat-history space-y-4 bg-[#f4f6ef]", compact ? "p-4" : "p-5 sm:p-6")}>
      {messages.map((message, i) => <div key={i} className={cx("flex", message.role === "student" ? "justify-end" : "justify-start")}>
        <div className={cx("max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed", message.role === "student" ? "rounded-br-sm bg-forest-700 text-white" : "rounded-bl-sm border border-ink-200 bg-white text-ink-700")}><span className="sr-only">{message.role === "student" ? "You: " : "Mentor: "}</span><MessageBody message={message} /></div>
      </div>)}
      {pending && <p role="status" className="flex items-center gap-2 text-xs text-ink-500"><LoaderCircle aria-hidden className="h-3.5 w-3.5 animate-spin" />Looking into that…</p>}
    </div>
    <div className="shrink-0 border-t border-ink-200 bg-white p-4">
      {error && <div className="mb-3 rounded-xl bg-peach/60 p-3 text-xs"><p role="alert">{error}</p><button type="button" disabled={pending} onClick={() => void ask(lastQuestion)} className="mt-2 flex items-center gap-1 font-bold text-forest-700 underline"><RotateCcw aria-hidden className="h-3.5 w-3.5" />Retry question</button></div>}
      {messages.length < 2 && <div className="mb-3 flex flex-wrap gap-2">{starterOptions.slice(0, compact ? 3 : 2).map((starter) => <button type="button" key={starter} disabled={pending} onClick={() => void ask(starter)} className="rounded-lg border border-lavender-ink/20 bg-lavender/60 px-2.5 py-2 text-left text-xs font-medium text-lavender-ink">{starter}<ArrowRight aria-hidden className="ml-1 inline h-3 w-3" /></button>)}</div>}
      <form onSubmit={(e) => { e.preventDefault(); void ask(input); }} className="flex items-end gap-2">
        <label htmlFor={inputId} className="sr-only">Your question for the mentor</label>
        <textarea id={inputId} rows={2} value={input} onChange={(e) => setInput(e.target.value)} maxLength={1000} placeholder="What’s on your mind?" className="min-w-0 flex-1 resize-none rounded-xl border border-ink-200 bg-canvas px-3 py-2.5 text-sm outline-none focus:border-forest-500" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void ask(input); } }} />
        <Button type="submit" disabled={pending || !input.trim()} className="h-12 px-4" aria-label="Send question"><Send aria-hidden className="h-4 w-4" />{!compact && <span className="hidden sm:inline">Send</span>}</Button>
      </form>
      <p className="mt-2 text-[11px] text-ink-500">You decide. We help you explore.</p>
    </div>
  </section>;
  if (compact) return conversation;
  return <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
    {conversation}
    <aside className="space-y-4"><section className="rounded-2xl border border-lavender-ink/15 bg-lavender/35 p-5"><h2 className="mb-4 flex items-center gap-2 text-base font-semibold"><Compass aria-hidden className="h-4 w-4 text-lavender-ink" />A few starting points</h2><div className="space-y-2">{STARTERS.map((starter) => <button type="button" key={starter} disabled={pending} onClick={() => void ask(starter)} className="cb-link-row w-full text-left text-sm font-semibold">{starter}<ArrowRight aria-hidden className="link-arrow" /></button>)}</div></section>
      <Callout icon={<ShieldCheck className="h-4 w-4" />} title="No pressure. No predictions." tone="forest"><p>Ask why, explore alternatives, or change your mind.</p></Callout>
      <Link href="/profile" className="cb-source text-sm">Revisit your profile<ArrowRight className="h-4 w-4" /></Link>
    </aside>
  </div>;
}
