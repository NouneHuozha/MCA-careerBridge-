import { Search } from "lucide-react";

export function SearchEverythingForm({ query }: { query: string }) {
  return (
    <form action="/explore" role="search" className="w-full max-w-[640px]">
      <label htmlFor="explore-query" className="sr-only">
        Search careers, courses and places to study
      </label>
      <div className="flex min-h-[58px] items-center gap-3 rounded-full border border-white/35 bg-white px-5 text-[#17201b] transition-colors focus-within:border-[#f2cf78] focus-within:ring-2 focus-within:ring-[#f2cf78]/50">
        <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6f887b]" />
        <input
          id="explore-query"
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search careers, courses, exams…"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-[#6f887b]"
        />
        <button type="submit" className="min-h-10 rounded-full bg-[#f2cf78] px-5 text-sm font-bold text-[#17201b] transition-colors hover:bg-[#e8bc50]">
          Search
        </button>
      </div>
    </form>
  );
}
