import { Search } from "lucide-react";

export function LibrarySearch({
  action,
  query = "",
  label,
  placeholder,
  className = "",
}: {
  action: string;
  query?: string;
  label: string;
  placeholder: string;
  className?: string;
}) {
  return (
    <form action={action} role="search" className={`w-full ${className}`}>
      <label htmlFor="library-query" className="sr-only">{label}</label>
      <div className="flex min-h-[56px] items-center gap-3 rounded-full border border-[#c2cfc9] bg-white px-4 transition-colors focus-within:border-[#09332a] focus-within:ring-2 focus-within:ring-[#6f887b]/40 sm:px-5">
        <Search aria-hidden="true" className="h-5 w-5 shrink-0 text-[#6f887b]" />
        <input
          id="library-query"
          type="search"
          name="q"
          defaultValue={query}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#17201b] outline-none placeholder:text-[#6a7c72]"
        />
        <button
          type="submit"
          className="min-h-10 rounded-full bg-[#09332a] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#126048] active:bg-[#051f19]"
        >
          Search
        </button>
      </div>
    </form>
  );
}
