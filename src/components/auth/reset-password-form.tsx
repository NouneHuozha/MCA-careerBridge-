"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function ResetPasswordForm({ token }: { token: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <form action="/api/auth/reset-password" method="post" className="mt-7 space-y-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-semibold text-ink-800">New password</label>
        <div className="relative">
          <input id="password" name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 pr-14 text-base outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-ink-50">
            {showPassword ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-ink-500">Use at least 8 characters.</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-2 block text-sm font-semibold text-ink-800">Confirm new password</label>
        <div className="relative">
          <input id="confirm" name="confirm" type={showConfirm ? "text" : "password"} required minLength={8} autoComplete="new-password" className="h-14 w-full rounded-xl border border-ink-200 bg-white px-4 pr-14 text-base outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-100" />
          <button type="button" aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} onClick={() => setShowConfirm((value) => !value)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-ink-500 hover:bg-ink-50">
            {showConfirm ? <EyeOff aria-hidden className="h-5 w-5" /> : <Eye aria-hidden className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <button type="submit" className="h-14 w-full rounded-xl bg-[#397e70] px-5 text-base font-semibold text-white transition hover:bg-[#2f6d61] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#397e70] focus-visible:ring-offset-2">Save new password</button>
    </form>
  );
}
