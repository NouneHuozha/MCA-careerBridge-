import Link from "next/link";
import { ArrowRight, LockKeyhole, Sprout, UserRound } from "lucide-react";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Start counselling" };

export default function StartPage() {
  return <div className="min-h-[calc(100dvh-5rem)] bg-[#fcfdfc]">
    <header className="cb-counselling-header"><Logo /><Link href="/profile" className="text-sm font-medium text-[#28775f] hover:underline">Save and return later</Link></header>
    <main className="cb-container py-10 sm:py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1120px] gap-9 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-14">
        <aside className="rounded-3xl border border-[#e1e9e4] bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold tracking-[-.03em] text-[#193a30]">Your counselling journey</h2>
          <ol className="mt-7 space-y-5">
            {["Where you are now", "What interests you", "What you bring", "What matters to you", "What we understood"].map((item, index) => <li key={item} className="flex items-center gap-4"><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${index === 0 ? "border-[#267d69] bg-[#267d69] text-white" : "border-[#dce6e1] bg-white text-[#9aa9a2]"}`}>{index + 1}</span><span className={`text-sm font-semibold ${index === 0 ? "text-[#1c5948]" : "text-[#75817c]"}`}>{item}</span></li>)}
          </ol>
          <div className="mt-8 border-t border-[#edf1ef] pt-5 text-sm text-[#74817b]">This is your progress through the conversation, not a score.</div>
        </aside>
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold text-[#397967]">A short conversation about you</p>
          <h1 className="mt-3 max-w-3xl text-[clamp(2.4rem,5vw,4.2rem)] font-semibold leading-[1.02] tracking-[-.055em] text-[#152d27]">Let’s find a useful starting point.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#5f6d67]">Your answers help CareerBridge show possibilities that are more relevant to you. They do not decide your future, rank you, or lock you into a path.</p>
          <div className="mt-8 space-y-3">
            <InfoCard icon={<Sprout className="h-5 w-5" />} title="You can be unsure" detail="There are no perfect answers." />
            <InfoCard icon={<UserRound className="h-5 w-5" />} title="You stay in control" detail="You can edit or change direction later." />
            <InfoCard icon={<LockKeyhole className="h-5 w-5" />} title="We ask only what helps" detail="We do not need your exact address or family income." />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link href="/counselling" className="inline-flex min-h-14 items-center gap-3 rounded-xl bg-[#267d69] px-6 text-base font-semibold text-white transition hover:bg-[#1e6c5a]">Start counselling<ArrowRight className="h-5 w-5" /></Link>
            <Link href="/profile" className="text-sm font-medium text-[#28775f] hover:underline">Save and return later</Link>
          </div>
        </section>
      </div>
    </main>
  </div>;
}

function InfoCard({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-[#e7ede9] bg-white p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f0f7f3] text-[#347b65]">{icon}</span><span><span className="block font-semibold text-[#2c463c]">{title}</span><span className="mt-0.5 block text-sm text-[#75817c]">{detail}</span></span></div>;
}
