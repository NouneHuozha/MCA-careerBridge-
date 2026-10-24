"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export function SignInForm({
  next,
  googleConfigured,
  onSwitch,
}: {
  next: string;
  googleConfigured: boolean;
  onSwitch: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#073c32] sm:text-4xl">Welcome back.</h1>
      <p className="mt-1.5 text-base text-ink-500">Pick up where you left off.</p>
      <form action="/api/auth/sign-in" method="post" className="mt-5 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="sign-in-email" className="mb-1.5 block text-sm font-semibold text-ink-800">Email</label>
          <div className="relative">
            <Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-in-email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <label htmlFor="sign-in-password" className="block text-sm font-semibold text-ink-800">Password</label>
            <Link href="/forgot-password" className="text-sm font-medium text-forest-700 underline underline-offset-2">Forgot password?</Link>
          </div>
          <div className="relative">
            <LockKeyhole aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-in-password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" className="h-12 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-14 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="h-12 w-full text-base" size="lg">Sign in <span aria-hidden className="text-xl">→</span></Button>
      </form>
      <div className="my-4 flex items-center gap-4 text-sm text-ink-400"><span className="h-px flex-1 bg-ink-200" />or<span className="h-px flex-1 bg-ink-200" /></div>
      <GoogleAuthButton next={next} form="sign-in" configured={googleConfigured} />
      <p className="mt-4 text-center text-sm text-ink-500">New to CareerBridge? <button type="button" onClick={onSwitch} className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900">Create an account.</button></p>
    </>
  );
}
