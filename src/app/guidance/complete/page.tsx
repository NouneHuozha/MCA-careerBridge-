import Link from "next/link";
import { ArrowRight, Check, Clock, FileText, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Counselling complete — your answers are ready" };

export default function GuidanceCompletionPage() {
  return (
    <main className="cb-transition-page" id="main">
      <div className="cb-transition-wrap">

        {/* ── Ambient background orbs ── */}
        <div aria-hidden className="cb-transition-orbs">
          <span className="cb-orb cb-orb-1" />
          <span className="cb-orb cb-orb-2" />
          <span className="cb-orb cb-orb-3" />
        </div>

        {/* ── Status pill ── */}
        <div className="cb-transition-status" aria-hidden>
          <span className="cb-transition-status-dot" />
          <span>Counselling complete</span>
        </div>

        {/* ── Headline block ── */}
        <header className="cb-transition-hero">
          <div className="cb-transition-checkmark" aria-hidden>
            <Check className="h-7 w-7" strokeWidth={2.5} />
          </div>
          <h1>Your answers are ready<br />for review</h1>
          <p className="cb-transition-lead">
            We&apos;ve organised everything you shared into a starting picture.
            The next step is to check it, correct anything that doesn&apos;t
            feel right, and confirm before exploring possibilities.
          </p>
        </header>

        {/* ── What happens next — 3 signpost cards ── */}
        <section className="cb-transition-steps" aria-label="What happens next">
          <p className="cb-transition-steps-label">WHAT HAPPENS NEXT</p>
          <ol className="cb-transition-steps-list">
            <li className="cb-transition-step cb-transition-step-active">
              <span className="cb-step-icon" aria-hidden>
                <FileText className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <div>
                <strong>Review your answers</strong>
                <span>See what we understood from your counselling session. Nothing is final.</span>
              </div>
            </li>
            <li className="cb-transition-step">
              <span className="cb-step-icon" aria-hidden>
                <Pencil className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <div>
                <strong>Correct anything that feels off</strong>
                <span>Each section has its own edit option. Your earlier answers stay saved.</span>
              </div>
            </li>
            <li className="cb-transition-step">
              <span className="cb-step-icon" aria-hidden>
                <Clock className="h-4.5 w-4.5" strokeWidth={1.7} />
              </span>
              <div>
                <strong>Explore at your own pace</strong>
                <span>Once confirmed, you&apos;ll see directions worth understanding — not decisions made for you.</span>
              </div>
            </li>
          </ol>
        </section>

        {/* ── Reassurance note ── */}
        <aside className="cb-transition-note" aria-label="A note about this picture">
          <p>
            <strong>This is a starting picture, not a final answer.</strong>{" "}
            Your counselling answers are clues to explore, not a label or
            a prediction. You can update them at any time without losing
            your saved explorations.
          </p>
        </aside>

        {/* ── Primary CTA ── */}
        <div className="cb-transition-actions">
          <Link href="/guidance/review" className="cb-transition-cta">
            Review what we understood
            <ArrowRight aria-hidden className="h-4.5 w-4.5" strokeWidth={2} />
          </Link>
          <Link href="/counselling" className="cb-transition-back">
            Go back and change an answer
          </Link>
        </div>

      </div>
    </main>
  );
}
