import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Callout } from "@/components/ui";
import { getCurrentUser } from "@/auth";
import { safeReturnPath } from "@/lib/return-path";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Create your account" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);

  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#eef6fd]">
      <div aria-hidden className="pointer-events-none absolute -right-12 bottom-[-7rem] h-96 w-96 rounded-full bg-[#d8ebe7] blur-3xl" />
      <div className="cb-container relative grid min-h-[calc(100vh-5rem)] items-center gap-8 py-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(500px,0.95fr)] lg:gap-12 lg:py-12">
        <section className="relative flex min-h-[700px] flex-col overflow-hidden rounded-[2rem] bg-[#e6f2fb] p-8 sm:p-10 lg:min-h-[760px]">
          <div className="flex items-center gap-5">
            <Image src="/images/logo.png" alt="CareerBridge Nagaland" width={210} height={76} className="h-auto w-[175px]" />
            <span className="hidden h-12 w-px bg-[#91aabd] sm:block" />
            <p className="hidden max-w-[160px] text-sm leading-relaxed text-[#46627a] sm:block">Explore today.<br />A brighter tomorrow.</p>
          </div>
          <div className="relative z-10 mt-14 max-w-lg">
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#073c32] sm:text-6xl">Your future.<br />Your path.<br />Your way.</h1>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-ink-600">Create your account to save your answers and discover what’s next.</p>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[52%] overflow-hidden">
            <Image src="/images/hero-student.png" alt="Student exploring learning possibilities" fill className="object-cover object-[center_25%]" sizes="(min-width: 1024px) 50vw, 100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#d8edf4]/35 to-transparent" />
            <div className="absolute bottom-8 left-8 rounded-2xl bg-white/75 px-5 py-3 backdrop-blur-sm"><p className="text-sm font-semibold tracking-[0.12em] text-[#46627a]">DREAM · EXPLORE · ACHIEVE</p></div>
          </div>
          <div aria-hidden className="absolute right-[27%] top-[37%] h-7 w-7 rotate-45 bg-[#9a83d1] opacity-80" />
        </section>

        <div>
          <section className="relative rounded-[2rem] border border-white bg-white p-7 shadow-[0_18px_50px_-30px_#1d4f4266] sm:p-10">
            <div className="mx-auto max-w-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#287559]">Sign up</p>
              <h2 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-[#073c32] sm:text-5xl">Start your journey.</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-500">Save your answers, possibilities and next steps in one place.</p>
              {params.error ? <div className="mt-5"><Callout tone="amber" title="We couldn’t create your account"><p>{params.error}</p></Callout></div> : null}
              <SignUpForm next={next} />
              <div className="my-5 flex items-center gap-4 text-sm text-ink-400"><span className="h-px flex-1 bg-ink-200" />or<span className="h-px flex-1 bg-ink-200" /></div>
              <button type="button" disabled title="Google sign-in is not enabled yet" className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white text-base font-semibold text-ink-500 opacity-75"><span className="text-xl font-bold text-[#4285f4]">G</span>Continue with Google</button>
              <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-[#edf7f3] px-4 py-3 text-sm text-ink-500"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-forest-700"><ShieldCheck className="h-5 w-5" /></span>You can browse first and change your answers later.</div>
            </div>
          </section>
          <p className="mt-5 text-center text-sm text-ink-500">Already have an account? <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="font-medium text-[#7054b2] underline underline-offset-2">Sign in</Link></p>
          <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-ink-400"><LockKeyhole className="h-4 w-4" />We never need your exact address.</p>
        </div>
      </div>
    </main>
  );
}
