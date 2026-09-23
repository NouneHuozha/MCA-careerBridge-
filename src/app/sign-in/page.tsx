import Image from "next/image";
import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { Callout } from "@/components/ui";
import { getCurrentUser } from "@/auth";
import { safeReturnPath } from "@/lib/return-path";
import { SignInForm } from "@/components/auth/sign-in-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const next = safeReturnPath(params.next);
  const user = await getCurrentUser();
  if (user) redirect(next);

  return <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#f3faf8]"><div aria-hidden className="pointer-events-none absolute -right-16 bottom-[-5rem] h-72 w-72 rounded-full bg-[#eee6ff] blur-3xl" /><div aria-hidden className="pointer-events-none absolute right-[-5rem] top-[-5rem] h-72 w-72 rounded-full bg-[#e4f4ff] blur-3xl" /><div className="cb-container relative grid min-h-[calc(100vh-5rem)] items-center gap-8 py-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] lg:gap-12 lg:py-14"><section className="hidden min-h-[650px] flex-col justify-between rounded-[2rem] bg-[#eef8f6] p-8 sm:p-10 lg:flex"><div><Image src="/images/logo.png" alt="CareerBridge Nagaland" width={250} height={90} className="h-auto w-[230px]" /><p className="mt-7 max-w-[250px] text-2xl font-semibold leading-tight text-[#123f38]">Explore today.<br />A brighter tomorrow.</p></div><div className="relative -mx-10 -mb-10 min-h-[390px] overflow-hidden rounded-b-[2rem]"><Image src="/images/possibilities-landscape.png" alt="A scenic path representing learning and opportunity" fill className="object-cover" sizes="(min-width: 1024px) 45vw, 100vw" /><div className="absolute inset-x-8 bottom-8 rounded-2xl bg-white/75 p-4 backdrop-blur-sm"><p className="text-sm font-semibold text-[#123f38]">Skills · Growth · Opportunities</p><p className="mt-1 text-xs text-ink-600">Take one thoughtful step at a time.</p></div></div></section><section className="relative rounded-[2rem] border border-white bg-white p-7 shadow-[0_18px_50px_-30px_#1d4f4266] sm:p-10"><div className="mb-8 flex items-center justify-end gap-2 text-sm font-medium text-ink-600"><MapPin className="h-4 w-4 text-[#60798a]" />Nagaland, India<span aria-hidden className="ml-1 text-ink-400">⌄</span></div><div className="mx-auto max-w-xl"><h1 className="text-4xl font-semibold tracking-[-0.035em] text-[#073c32] sm:text-5xl">Welcome back.</h1><p className="mt-2 text-lg text-ink-500">Pick up where you left off.</p>{params.error ? <div className="mt-5"><Callout tone="amber" title="We couldn’t sign you in"><p>{params.error}</p></Callout></div> : null}<SignInForm next={next} /><div className="my-6 flex items-center gap-4 text-sm text-ink-400"><span className="h-px flex-1 bg-ink-200" />or<span className="h-px flex-1 bg-ink-200" /></div><button type="button" disabled title="Google sign-in is not enabled yet" className="flex h-14 w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-ink-200 bg-white text-base font-semibold text-ink-500 opacity-75"><span className="text-xl font-bold text-[#4285f4]">G</span>Continue with Google</button><p className="mt-6 text-center text-sm text-ink-500">New to CareerBridge? <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-[#7054b2] underline underline-offset-2">Create an account.</Link></p><div className="mt-8 flex items-center justify-center gap-3 text-sm text-ink-500"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf7f3] text-forest-700"><ShieldCheck className="h-5 w-5" /></span>Your journey and saved options stay private.</div></div></section></div></main>;
}
