"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";

export function OpportunityTypeFilters({
  types,
  activeType,
  query,
  field,
}: {
  types: string[];
  activeType?: string;
  query?: string;
  field?: string;
}) {
  const reduceMotion = useReducedMotion();
  const options = [{ value: "", label: "All opportunities" }, ...types.map((type) => ({
    value: type,
    label: type.replaceAll("_", " "),
  }))];

  return (
    <nav aria-label="Filter by activity type" className="w-full pb-2">
      <ul className="flex w-full flex-wrap gap-2">
        {options.map(({ value, label }) => {
          const params = new URLSearchParams();
          if (query) params.set("q", query);
          if (value) params.set("type", value);
          if (field) params.set("field", field);
          const isActive = (activeType ?? "") === value;

          return (
            <li key={value || "all"}>
              <Link
                href={`/opportunities${params.size ? `?${params.toString()}` : ""}`}
                aria-current={isActive ? "page" : undefined}
                className="relative isolate inline-flex min-h-11 items-center justify-center px-4 text-base font-semibold capitalize text-[#36544a] transition-colors hover:text-[#09332a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09332a] aria-[current=page]:text-[#09332a]"
              >
                {isActive && (
                  <motion.span
                    aria-hidden="true"
                    layoutId="opportunity-type-indicator"
                    className="absolute inset-0 -z-10 bg-[#dde4df]"
                    transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
