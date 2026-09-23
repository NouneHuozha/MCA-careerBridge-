"use client";

import { useState } from "react";

type Value = { title: string; detail: string };

export function ValuesExplorer({ values }: { values: Value[] }) {
  const [active, setActive] = useState(0);
  const current = values[active];

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 lg:grid-cols-[13rem_1fr]">
      <div className="flex overflow-x-auto bg-white lg:block lg:overflow-visible">
        {values.map((value, index) => {
          const isActive = index === active;
          return (
            <button
              key={value.title}
              type="button"
              onClick={() => setActive(index)}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-left text-sm font-medium transition-colors duration-150 lg:w-full lg:whitespace-normal lg:border-b-0 lg:border-r-2 ${
                isActive
                  ? "border-ink-900 bg-ink-100/50 text-ink-900"
                  : "border-transparent text-ink-500 hover:bg-ink-100/40 hover:text-ink-900"
              }`}
            >
              {value.title}
            </button>
          );
        })}
      </div>
      <div className="bg-white p-6">
        <p className="text-sm font-semibold text-ink-900">{current.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">{current.detail}</p>
      </div>
    </div>
  );
}
