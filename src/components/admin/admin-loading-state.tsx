function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded bg-[#edf2ef] motion-reduce:animate-none ${className}`} />;
}

export function AdminLoadingState() {
  return <section aria-busy="true" aria-live="polite" aria-label="Loading catalogue information" className="space-y-5">
    <div className="border-b border-[#dce5e0] pb-5">
      <p className="text-xs text-[#687970]">Catalogue <span aria-hidden="true">/</span> Review queue</p>
      <Bar className="mt-4 h-7 w-56 sm:w-64" />
    </div>

    <div aria-hidden="true" className="flex flex-wrap gap-2">
      <Bar className="h-10 w-64 rounded-lg border border-[#e1e8e4] bg-white p-2" />
      <Bar className="h-10 w-32 rounded-lg border border-[#e1e8e4] bg-white p-2" />
      <Bar className="h-10 w-32 rounded-lg border border-[#e1e8e4] bg-white p-2" />
    </div>

    <div aria-hidden="true" className="overflow-hidden rounded-xl border border-[#e1e8e4] bg-white shadow-sm">
      <div className="h-14 border-b border-[#edf1ef] px-4 py-4 sm:px-5"><Bar className="h-3 w-32" /></div>
      <div className="divide-y divide-[#edf1ef] px-3 sm:px-4">
        {Array.from({ length: 7 }, (_, index) => <div key={index} className="grid min-h-[48px] grid-cols-[minmax(160px,1.5fr)_minmax(90px,.7fr)_minmax(80px,.6fr)_minmax(120px,1fr)_minmax(60px,.5fr)] items-center gap-4 py-3">
          <Bar className={`h-2.5 ${index % 2 === 0 ? "w-full max-w-[390px]" : "w-4/5 max-w-[330px]"}`} />
          <Bar className="h-2.5 w-3/4" />
          <Bar className="h-2.5 w-4/5" />
          <Bar className="h-2.5 w-full max-w-[190px]" />
          <Bar className="h-2.5 w-3/4" />
        </div>)}
      </div>
    </div>
    <p role="status" className="pt-1 text-center text-xs text-[#687970]">Loading catalogue information…</p>
  </section>;
}
