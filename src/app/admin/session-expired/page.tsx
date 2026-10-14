import Image from "next/image";
import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { safeReturnPath } from "@/lib/return-path";

export const dynamic = "force-dynamic";
export const metadata = { title: "Session expired · CareerBridge Admin" };

export default async function AdminSessionExpiredPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const requestedNext = safeReturnPath(params.next, "/admin");
  const next = requestedNext === "/admin/session-expired" || requestedNext === "/admin/login" || !(requestedNext === "/admin" || requestedNext.startsWith("/admin/")) ? "/admin" : requestedNext;
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect(next);

  const signInAgainHref = `/admin/login?next=${encodeURIComponent(next)}`;
  const returnToAdminHref = "/admin/login?next=%2Fadmin";

  return <div className="grid min-h-[100svh] place-items-center bg-[#f6f8f7] px-4 py-8 sm:px-6">
    <section className="w-full max-w-[464px] rounded-xl border border-[#e0e6e2] bg-white px-6 py-7 shadow-[0_12px_35px_-24px_rgba(24,55,43,0.28)] sm:px-8 sm:py-8" aria-labelledby="session-expired-title">
      <div className="flex items-center justify-center gap-2">
        <Image src="/images/logo.png" alt="" width={1466} height={1073} className="h-7 w-auto object-contain" priority />
        <div className="text-left"><p className="text-sm font-bold tracking-[-.02em] text-[#1d332b]">CareerBridge</p><p className="text-[9px] leading-tight text-[#738079]">Admin</p></div>
      </div>
      <div className="mx-auto mt-4 grid h-10 w-10 place-items-center rounded-full bg-[#e9f5ee] text-[#39745d]"><LockKeyhole aria-hidden className="h-4 w-4" /></div>
      <h1 id="session-expired-title" className="mt-3 text-center text-[19px] font-bold tracking-[-.02em] text-[#263d32]">Your session has expired</h1>
      <p className="mt-1.5 text-center text-[11px] leading-relaxed text-[#75817b]">For your security, please sign in again to continue.</p>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <Link href={signInAgainHref} className="inline-flex min-h-9 items-center justify-center rounded-md bg-[#11654e] px-4 text-[11px] font-bold text-white transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb59e] focus-visible:ring-offset-2">Sign in again</Link>
        <Link href={returnToAdminHref} className="inline-flex min-h-9 items-center justify-center rounded-md border border-[#d8e0dc] bg-white px-3.5 text-[11px] font-semibold text-[#344b41] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb59e] focus-visible:ring-offset-2">Return to CareerBridge Admin</Link>
      </div>
      <p className="mt-3 rounded-md border border-[#e6ebe8] bg-[#f6f8f7] px-3 py-2.5 text-center text-[10px] leading-relaxed text-[#68766f]">Any saved changes were not published.</p>
    </section>
  </div>;
}
