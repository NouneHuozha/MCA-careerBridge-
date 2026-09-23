/**
 * Hand-drawn style decorative marks. Small, sparse, and always aria-hidden —
 * they add human warmth without turning the page into an illustration.
 */

export function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M20 4v8M20 28v8M4 20h8M28 20h8M9 9l5 5M26 26l5 5M31 9l-5 5M14 26l-5 5" />
    </svg>
  );
}

export function CurveLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 140" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path className="animate-draw" d="M4 136C40 96 92 92 132 60c22-18 26-40 10-50-14-9-30 2-26 18 4 15 22 22 42 20 26-3 44-22 58-40" />
    </svg>
  );
}

export function ArrowDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 90" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path className="animate-draw" d="M8 4C2 26 2 52 20 70c14 14 34 16 52 12" />
      <path d="M60 70l12 12-16 6" />
    </svg>
  );
}

export function Ridge({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 140" aria-hidden className={className} preserveAspectRatio="none" fill="currentColor">
      <path d="M0 140h480V96l-58-46-42 30-64-52-52 40-46-26-70 54-48-22-52 34z" opacity="0.55" />
      <path d="M0 140h480v-18l-70-30-56 26-58-38-64 44-52-26-64 34-58-18z" opacity="0.75" />
    </svg>
  );
}

/** Organic soft shape used behind hero photography. */
export function Blob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className={className} fill="currentColor">
      <path d="M46 -62C61 -50 74 -34 79 -15c5 19 2 41 -10 58 -12 17 -33 29 -55 33 -22 4 -44 0 -60 -13C-62 50 -72 29 -73 7c-1 -22 8 -44 23 -60 15 -16 36 -26 55 -24 19 2 26 15 41 15Z" transform="translate(100 100)" />
    </svg>
  );
}

export function DottedGrid({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 60" aria-hidden className={className} fill="currentColor">
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 9 }).map((__, col) => (
          <circle key={`${row}-${col}`} cx={col * 12 + 4} cy={row * 12 + 4} r="1.6" />
        )),
      )}
    </svg>
  );
}
