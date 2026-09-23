// import Link from "next/link";

// export function Logo({ tone = "dark", href = "/" }: { tone?: "dark" | "light"; href?: string }) {
//   return (
//     <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="CareerBridge home">
//       <span
//         aria-hidden
//         className="grid h-10 w-10 place-items-center rounded-xl bg-forest-700 text-white transition-transform duration-300 group-hover:-rotate-6"
//       >
//         {/* A bridge arc — the mark, not a robot or a spark */}
//         <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
//           <path d="M3 17c4.2 0 4.2-9 9-9s4.8 9 9 9" />
//           <path d="M12 8v9" opacity="0.5" />
//         </svg>
//       </span>
//       <span className={`text-[19px] font-bold tracking-[-0.02em] ${tone === "light" ? "text-white" : "text-ink-900"}`}>
//         CareerBridge
//       </span>
//     </Link>
//   );
// }


import Image from "next/image";
import Link from "next/link";

export function Logo({ tone = "dark", href = "/" }: { tone?: "dark" | "light"; href?: string }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2.5" aria-label="CareerBridge home">
      <Image
        src="/images/logo.png"
        alt="CareerBridge logo"
        width={100}
        height={100}
        className="rounded-xl transition-transform duration-300 group-hover:-rotate-6"
      />

      <span className={`text-[19px] font-bold tracking-[-0.02em] ${tone === "light" ? "text-white" : "text-ink-900"}`}>
        CareerBridge
      </span>
    </Link>
  );
}