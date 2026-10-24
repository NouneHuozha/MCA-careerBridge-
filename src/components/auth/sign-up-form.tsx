"use client";

import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";

export function SignUpForm({
  next,
  googleConfigured,
  onSwitch,
}: {
  next: string;
  googleConfigured: boolean;
  onSwitch: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#073c32] sm:text-4xl">Create your account.</h1>
      <p className="mt-1 text-sm leading-relaxed text-ink-500">Save your answers, possibilities and next steps in one place.</p>
      <form action="/api/auth/sign-up" method="post" className="mt-4 space-y-2.5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label htmlFor="sign-up-name" className="mb-1 block text-sm font-semibold text-ink-800">First name</label>
          <div className="relative">
            <UserRound aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-up-name" name="fullName" type="text" required autoComplete="name" placeholder="Enter your first name" className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
          </div>
        </div>
        <div>
          <label htmlFor="sign-up-email" className="mb-1 block text-sm font-semibold text-ink-800">Email</label>
          <div className="relative">
            <Mail aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-up-email" name="email" type="email" required autoComplete="email" placeholder="Enter your email" className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-4 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
          </div>
        </div>
        <div>
          <label htmlFor="sign-up-password" className="mb-1 block text-sm font-semibold text-ink-800">Password</label>
          <div className="relative">
            <LockKeyhole aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-up-password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Create a password" className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-14 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} title={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}</button>
          </div>
          <p className="mt-1 text-xs text-ink-500">At least 8 characters.</p>
        </div>
        <div>
          <label htmlFor="sign-up-confirm" className="mb-1 block text-sm font-semibold text-ink-800">Confirm password</label>
          <div className="relative">
            <LockKeyhole aria-hidden className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input id="sign-up-confirm" name="confirm" type={showConfirm ? "text" : "password"} required minLength={8} autoComplete="new-password" placeholder="Confirm your password" className="h-11 w-full rounded-xl border border-ink-200 bg-white pl-12 pr-14 text-base outline-none transition focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
            <button type="button" aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} title={showConfirm ? "Hide confirmation password" : "Show confirmation password"} className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-50 hover:text-ink-800" onClick={() => setShowConfirm((value) => !value)}>{showConfirm ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}</button>
          </div>
        </div>
        <Button type="submit" className="h-11 w-full text-base" size="lg">Create my account <span aria-hidden className="text-xl">→</span></Button>
      </form>
      <div className="my-3 flex items-center gap-3 text-sm text-ink-400"><span className="h-px flex-1 bg-ink-200" />or<span className="h-px flex-1 bg-ink-200" /></div>
      <GoogleAuthButton next={next} form="sign-up" configured={googleConfigured} />
      <p className="mt-3 text-center text-sm text-ink-500">Already have an account? <button type="button" onClick={onSwitch} className="font-medium text-forest-700 underline underline-offset-2 hover:text-forest-900">Sign in</button></p>
    </>
  );
}
