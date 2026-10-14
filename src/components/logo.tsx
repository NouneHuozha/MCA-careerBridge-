import Image from "next/image";
import Link from "next/link";

type LogoSize = "sm" | "md" | "lg";

const sizeStyles: Record<LogoSize, { mark: string; wordmark: string }> = {
  sm: { mark: "h-8", wordmark: "text-base" },
  md: { mark: "h-10", wordmark: "text-[19px]" },
  lg: { mark: "h-12", wordmark: "text-xl" },
};

export function Logo({
  tone = "dark",
  href = "/",
  size = "md",
  className = "",
  textClassName = "",
}: {
  tone?: "dark" | "light";
  href?: string;
  size?: LogoSize;
  className?: string;
  textClassName?: string;
}) {
  const styles = sizeStyles[size];
  return (
    <Link
      href={href}
      className={`group inline-flex min-w-0 shrink-0 items-center gap-2.5 ${className}`}
      aria-label="CareerBridge home"
    >
      <Image
        src="/images/logo.png"
        alt=""
        width={1466}
        height={1073}
        className={`block w-auto shrink-0 object-contain transition-transform duration-300 group-hover:-rotate-3 ${styles.mark}`}
      />
      <span
        className={`whitespace-nowrap font-bold tracking-[-0.02em] ${styles.wordmark} ${tone === "light" ? "text-white" : "text-ink-900"} ${textClassName}`}
      >
        CareerBridge
      </span>
    </Link>
  );
}
