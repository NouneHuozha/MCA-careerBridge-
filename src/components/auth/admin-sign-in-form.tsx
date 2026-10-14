"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function AdminSignInForm({ next, error }: { next: string; error?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");

  return <>
    {error && <p role="alert" className="mt-5 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-sm leading-relaxed text-[#963e36]">{error}</p>}
    <form action="/api/auth/sign-in" method="post" className="mt-5 space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="admin-email" className="mb-1.5 block text-[11px] font-medium text-[#63736c]">Email address</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required placeholder="Email address" className="h-10 w-full rounded-md border border-[#d6dfda] bg-white px-3 text-sm text-[#253a32] outline-none placeholder:text-[#87938d] focus:border-[#33755d] focus:ring-2 focus:ring-[#e1f1e8]" />
      </div>
      <div>
        <label htmlFor="admin-password" className="mb-1.5 block text-[11px] font-medium text-[#63736c]">Password</label>
        <div className="relative">
          <input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required placeholder="Password" className="h-10 w-full rounded-md border border-[#d6dfda] bg-white px-3 pr-28 text-sm text-[#253a32] outline-none placeholder:text-[#87938d] focus:border-[#33755d] focus:ring-2 focus:ring-[#e1f1e8]" />
          <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded px-1.5 py-1 text-[10px] font-semibold text-[#39745d] hover:bg-[#f2f7f4]">{showPassword ? <EyeOff aria-hidden className="h-3.5 w-3.5" /> : <Eye aria-hidden className="h-3.5 w-3.5" />}{showPassword ? "Hide password" : "Show password"}</button>
        </div>
        <div className="mt-1.5 flex justify-end"><button type="button" onClick={() => setRecoveryMessage("Password recovery is not enabled here. Please contact your CareerBridge administrator.")} className="text-[10px] font-semibold text-[#39745d] hover:underline">Forgot password?</button></div>
        {recoveryMessage && <p role="status" className="mt-2 rounded-md border border-[#e2e8e4] bg-[#f5f7f6] px-2.5 py-2 text-[11px] leading-relaxed text-[#56665e]">{recoveryMessage}</p>}
      </div>
      <button type="submit" className="min-h-10 w-full rounded-md bg-[#11654e] px-4 text-sm font-bold text-white transition hover:bg-[#0d5742] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7fb59e] focus-visible:ring-offset-2">Sign in</button>
    </form>
  </>;
}
