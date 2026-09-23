"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Info, Scale, ShieldCheck } from "lucide-react";
import { MentorChat } from "@/components/mentor-chat";

export function ContextualMentor({ courseName, sourceUrl }: { courseName: string; sourceUrl?: string | null }) {
  const starters = [`What do I learn in ${courseName}?`, "What should I compare before choosing?", "What if I do not qualify?"];
  return (
    <aside className="overflow-hidden rounded-[1.4rem] border border-[#d4e8df] bg-white shadow-[0_18px_50px_-30px_#1d5a4b66]" aria-label="Contextual mentor">
      <div className="relative min-h-[218px] overflow-hidden bg-[#eaf8f1] px-6 pb-4 pt-6">
        <Image src="/images/students-campus.jpg" alt="Students exploring their study options" fill sizes="380px" className="object-cover object-center opacity-25" />
        <div className="relative z-10 max-w-[245px]">
          <p className="text-[clamp(1.6rem,2.2vw,2.15rem)] font-semibold leading-[1.05] tracking-[-.04em] text-forest-900">Let&apos;s talk it through.</p>
          <p className="mt-3 text-sm leading-relaxed text-ink-600">Ask about this course, compare a route, or check what to verify.</p>
        </div>
        <div className="absolute -bottom-4 -right-3 h-32 w-44 rounded-tl-[5rem] bg-[#d7eee2]/85" />
      </div>
      <div className="border-b border-ink-100 bg-white px-5 py-3 text-sm text-ink-700 shadow-sm">I&apos;ll explain the options clearly. The choice stays yours.</div>
      <div className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-xl bg-[#effaf6] px-3 py-2.5 text-sm text-ink-700"><BookOpen className="h-5 w-5 text-forest-700" />What do I learn in this course?<ArrowRight className="ml-auto h-4 w-4 text-forest-700" /></div>
          <div className="flex items-center gap-3 rounded-xl bg-[#f4f0ff] px-3 py-2.5 text-sm text-ink-700"><Scale className="h-5 w-5 text-[#7252b8]" />What should I compare?<ArrowRight className="ml-auto h-4 w-4 text-[#7252b8]" /></div>
          <div className="flex items-center gap-3 rounded-xl bg-[#fff8e7] px-3 py-2.5 text-sm text-ink-700"><Info className="h-5 w-5 text-[#a77b1c]" />What if I do not qualify?<ArrowRight className="ml-auto h-4 w-4 text-[#a77b1c]" /></div>
        </div>
        <div className="mt-3 h-[430px] overflow-hidden rounded-xl border border-ink-100 bg-[#f4f6ef]">
          <MentorChat compact hideHeader starterQuestions={starters} contextTitle="Course mentor" contextSubtitle="Guidance for your next step" providerConfigured={false} />
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#eff8f4] px-3 py-2.5 text-xs leading-relaxed text-ink-600"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-forest-700" />I&apos;ll use verified CareerBridge information and point you to official sources.</div>
        <div className="mt-3 rounded-xl border border-ink-100 bg-canvas px-3 py-3 text-xs text-ink-600"><p className="font-semibold text-ink-800">Official course source</p>{sourceUrl ? <Link href={sourceUrl} className="cb-source mt-1 text-xs">Check the official course details <ArrowRight className="h-3.5 w-3.5" /></Link> : <p className="mt-1">Check the institution&apos;s official website for current details.</p>}</div>
      </div>
    </aside>
  );
}
