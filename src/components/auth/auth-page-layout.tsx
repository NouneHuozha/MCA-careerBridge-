"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Callout } from "@/components/ui";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";

type AuthMode = "sign-in" | "sign-up";

export function AuthPageLayout({
  initialMode,
  next,
  googleConfigured,
  errorMessage,
  deleted,
  reset,
}: {
  initialMode: AuthMode;
  next: string;
  googleConfigured: boolean;
  errorMessage?: string;
  deleted?: boolean;
  reset?: boolean;
}) {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const syncMode = () => setMode(window.location.pathname === "/sign-up" ? "sign-up" : "sign-in");
    window.addEventListener("popstate", syncMode);
    return () => window.removeEventListener("popstate", syncMode);
  }, []);

  function switchMode(nextMode: AuthMode) {
    if (nextMode === mode) return;
    const url = new URL(window.location.href);
    url.pathname = `/${nextMode}`;
    url.search = new URLSearchParams({ next }).toString();
    window.history.pushState(null, "", url);
    setMode(nextMode);
  }

  const signingUp = mode === "sign-up";
  const signInError = !signingUp && errorMessage ? errorMessage : undefined;
  const signUpError = signingUp && errorMessage ? errorMessage : undefined;

  return (
    <div className="cb-container py-5 sm:py-8">
      <div data-auth-card className="relative mx-auto grid w-full max-w-[1080px] grid-cols-1 overflow-hidden rounded-[28px] border border-[#dce5df] bg-white shadow-[0_28px_80px_-30px_rgba(5,31,25,0.28)] lg:h-[680px] lg:grid-cols-2">
        <section
          aria-label="Switch between sign in and sign up"
          data-auth-slider
          className={`relative z-10 row-start-1 h-64 overflow-hidden bg-[#073c32] text-white transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none after:absolute after:bottom-[-30px] after:left-[-8%] after:z-10 after:h-14 after:w-[116%] after:rounded-[50%] after:bg-white after:content-[''] sm:h-56 lg:absolute lg:inset-y-0 lg:h-auto lg:w-1/2 lg:rounded-[40px] lg:will-change-transform lg:after:hidden ${signingUp ? "lg:translate-x-0" : "lg:translate-x-full"}`}
        >
          <div aria-hidden className="absolute -right-14 -top-36 size-80 rounded-full border-[30px] border-[#155344]" />
          <div aria-hidden className="absolute -bottom-28 -left-14 size-52 rounded-full bg-[#155344]" />
          <div aria-hidden className="absolute right-[18%] top-[20%] size-4 rounded-full bg-[#8caa9a]" />
          <div className="relative z-20 flex h-full items-center justify-center px-5 pb-5 text-center sm:px-10 lg:px-12 lg:pb-0">
            <div className="max-w-[340px]">
              <h2 className="text-[2rem] font-extrabold leading-[1.1] tracking-[-0.035em] text-white sm:text-[2.5rem]">
                Welcome to CareerBridge.
              </h2>
              <p className="mx-auto mt-5 max-w-[32ch] text-base leading-relaxed text-white/90 sm:mt-6">
                {signingUp
                  ? "Sign in to pick up where you left off."
                  : "Create an account to keep your plans in one place."}
              </p>
              <button
                type="button"
                data-auth-panel-switch
                onClick={() => switchMode(signingUp ? "sign-in" : "sign-up")}
                className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-white/80 px-6 text-base font-semibold text-white transition-colors hover:bg-white hover:text-forest-900 focus-visible:outline-white"
              >
                {signingUp ? "Sign in" : "Create account"}
              </button>
            </div>
          </div>
        </section>
        <div className="relative min-h-[560px] lg:col-span-2 lg:min-h-0">
          <div
            data-auth-panel="sign-in"
            aria-hidden={signingUp}
            inert={signingUp}
            className={`absolute inset-0 overflow-y-auto transition-opacity duration-200 motion-reduce:transition-none lg:w-1/2 ${signingUp ? "pointer-events-none opacity-0" : "opacity-100"}`}
          >
            <div className="flex min-h-full items-center px-5 py-6 sm:px-10 lg:px-12">
              <div className="mx-auto w-full max-w-[420px]">
                {deleted ? <p role="status" className="mb-4 rounded-xl bg-[#edf7f0] px-4 py-3 text-sm text-[#286b61]">Your account and its personal data have been deleted.</p> : null}
                {reset ? <p role="status" className="mb-4 rounded-xl bg-[#edf7f0] px-4 py-3 text-sm text-[#286b61]">Your password was reset. Sign in with your new password.</p> : null}
                {signInError ? <div className="mb-4"><Callout tone="amber" title="We couldn’t sign you in"><p>{signInError}</p></Callout></div> : null}
                <SignInForm next={next} googleConfigured={googleConfigured} onSwitch={() => switchMode("sign-up")} />
                <div className="mt-5 flex items-center justify-center gap-3 text-sm text-ink-600"><span className="grid h-9 w-9 place-items-center rounded-full bg-[#edf7f3] text-forest-700"><ShieldCheck aria-hidden className="h-5 w-5" /></span>Your journey and saved options stay private.</div>
              </div>
            </div>
          </div>
          <div
            data-auth-panel="sign-up"
            aria-hidden={!signingUp}
            inert={!signingUp}
            className={`absolute inset-0 overflow-y-auto transition-opacity duration-200 motion-reduce:transition-none lg:left-1/2 lg:w-1/2 ${signingUp ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <div className="flex min-h-full items-center px-5 py-5 sm:px-10 lg:px-12">
              <div className="mx-auto w-full max-w-[420px]">
                {signUpError ? <div className="mb-3"><Callout tone="amber" title="We couldn’t create your account"><p>{signUpError}</p></Callout></div> : null}
                <SignUpForm next={next} googleConfigured={googleConfigured} onSwitch={() => switchMode("sign-in")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
