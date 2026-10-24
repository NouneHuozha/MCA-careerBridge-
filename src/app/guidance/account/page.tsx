import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Compass, KeyRound, Mail, UserRound } from "lucide-react";
import { getCurrentUser } from "@/auth";
import { DeleteAccountDialog } from "@/components/auth/delete-account-dialog";
import { LogoutDialog } from "@/components/auth/logout-dialog";

export const dynamic = "force-dynamic";
export const metadata = { title: "Account details · My Guidance" };

export default async function AccountDetailsPage({ searchParams }: { searchParams: Promise<{ deletionError?: string }> }) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?next=%2Fguidance%2Faccount");

  const details = [
    { label: "Name", value: user.name?.trim() || "Not provided", icon: UserRound },
    { label: "Email", value: user.email, icon: Mail },
    { label: "Sign-in method", value: user.authProvider === "google" ? "Google" : "Email and password", icon: KeyRound },
    { label: "Password", value: user.hasPassword ? "Set · hidden for security" : "Managed by your sign-in provider", icon: KeyRound },
  ];

  return (
    <main className="min-h-[calc(100dvh-68px)] px-5 py-8 text-[#26312c] sm:px-8 lg:px-12">
      <section className="mx-auto max-w-3xl">
        <Link href="/guidance" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#35675b] underline decoration-[#a6c5b8] underline-offset-4">
          <ArrowLeft aria-hidden className="h-4 w-4" />Back to My Guidance
        </Link>
        <header className="mt-6">
          <p className="text-sm font-semibold text-[#527165]">Your account</p>
          <h1 className="mt-2 font-serif text-4xl leading-tight tracking-[-.035em] text-[#173344]">Account details</h1>
          <p className="mt-3 text-base leading-relaxed text-[#68756d]">The sign-in details connected to your CareerBridge account.</p>
        </header>
        <dl className="mt-8 divide-y divide-[#e4eae4] rounded-2xl border border-[#dce7df] bg-white px-5 sm:px-7">
          {details.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex min-h-20 items-center gap-4 py-4">
              <span aria-hidden className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e8f3ec] text-[#17614d]"><Icon className="h-5 w-5" strokeWidth={1.8} /></span>
              <div className="min-w-0"><dt className="text-sm text-[#68756d]">{label}</dt><dd title={label === "Password" ? "Passwords are stored as one-way hashes and cannot be viewed." : undefined} className="mt-1 break-all text-base font-semibold text-[#26312c]">{value}</dd>{label === "Password" ? <p className="mt-1 text-xs leading-relaxed text-[#68756d]">Passwords are never shown here.</p> : null}</div>
            </div>
          ))}
        </dl>
        <nav aria-label="Account destinations" className="mt-6 flex flex-wrap gap-3">
          <Link href="/guidance/review?mode=correct" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#e8f3ec] px-4 text-sm font-semibold text-[#17614d]">Review my answers</Link>
          <Link href="/guidance/explorations" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#dce7df] bg-white px-4 text-sm font-semibold text-[#29483c]"><Compass aria-hidden className="h-4 w-4" />My explorations</Link>
          <LogoutDialog />
        </nav>
        <div className="mt-10"><DeleteAccountDialog error={params.deletionError} /></div>
      </section>
    </main>
  );
}
