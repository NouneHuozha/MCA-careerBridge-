import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/auth";
import { AdminSignInForm } from "@/components/auth/admin-sign-in-form";
import { safeReturnPath } from "@/lib/return-path";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in to CareerBridge Admin" };

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string; next?: string }> }) {
  const params = await searchParams;
  const requestedNext = safeReturnPath(params.next, "/admin");
  const next = requestedNext === "/admin/login" || !(requestedNext === "/admin" || requestedNext.startsWith("/admin/")) ? "/admin" : requestedNext;
  const user = await getCurrentUser();
  if (user?.role === "admin") redirect(next);

  return <div className="grid min-h-[100svh] place-items-center bg-[#f6f8f7] px-4 py-8 sm:px-6">
    <section className="w-full max-w-[440px] rounded-xl border border-[#e0e6e2] bg-white p-7 shadow-[0_12px_35px_-24px_rgba(24,55,43,0.28)] sm:p-9" aria-labelledby="admin-login-title">
      <div className="flex items-center gap-2.5">
        <Image src="/images/logo.png" alt="" width={1466} height={1073} className="h-8 w-auto object-contain" priority />
        <div><p className="text-base font-bold tracking-[-.02em] text-[#1d332b]">CareerBridge</p><p className="text-[10px] leading-tight text-[#738079]">Admin</p></div>
      </div>
      <h1 id="admin-login-title" className="mt-6 text-[20px] font-bold tracking-[-.02em] text-[#243930]">Sign in to CareerBridge Admin</h1>
      <p className="mt-1.5 text-[11px] leading-relaxed text-[#75817b]">Manage catalogue information, sources, and review tasks.</p>
      {user && user.role !== "admin" && <p role="status" className="mt-4 rounded-lg border border-[#efdfbd] bg-[#fff8e8] px-3 py-2 text-xs leading-relaxed text-[#71551d]">You are signed in with a non-admin account. Enter credentials for an authorized CareerBridge administrator to continue.</p>}
      <AdminSignInForm next={next} error={params.error} />
      <p className="mt-5 rounded-md border border-[#e6ebe8] bg-[#f6f8f7] px-3 py-2.5 text-[10px] leading-relaxed text-[#68766f]">This area is for authorized CareerBridge administrators.</p>
    </section>
  </div>;
}
