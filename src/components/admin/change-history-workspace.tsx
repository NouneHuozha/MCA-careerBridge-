"use client";

import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, FileClock, Filter, Info, Search, X } from "lucide-react";

type Metadata = Record<string, unknown>;
export type HistoryEntry = {
  id: number;
  actor: string;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityRef: string;
  entityName: string;
  metadata: Metadata;
  createdAt: string;
};
type Props = { entries: HistoryEntry[]; initialFrom: string; initialTo: string };
type Status = "Approved" | "Rejected" | "Needs review" | "Recorded";

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function actionLabel(action: string) {
  const labels: Record<string, string> = {
    institution_created: "Created institution",
    institution_source_added: "Added institution source",
    institution_marked_verified: "Verified institution",
    course_created: "Created course",
    course_marked_verified: "Verified course",
    course_draft_saved: "Saved course draft",
    institution_course_link_created: "Added institution-course link",
    institution_course_availability_reviewed: "Reviewed course availability",
    source_refresh_settings_updated: "Updated source refresh settings",
    source_record_updated: "Updated source details",
  };
  return labels[action] ?? pretty(action);
}
function eventStatus(entry: HistoryEntry): Status {
  const action = entry.action.toLowerCase();
  const recordedStatus = String(entry.metadata.status ?? entry.metadata.verificationStatus ?? "").toLowerCase();
  const availability = String(entry.metadata.availability ?? "").toLowerCase();
  if (action === "institution_course_availability_reviewed") return ["offered", "not_offered", "historically_offered"].includes(availability) ? "Approved" : "Needs review";
  if (action.includes("reject") || recordedStatus.includes("rejected")) return "Rejected";
  if (action.includes("detected") || action.includes("proposed") || action.includes("needs_review") || recordedStatus.includes("unverified") || recordedStatus.includes("needs_verification") || recordedStatus.includes("needs_review")) return "Needs review";
  if (action.includes("verified") || action.includes("approved") || recordedStatus === "verified") return "Approved";
  return "Recorded";
}
function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  try { return JSON.stringify(value); } catch { return "Recorded"; }
}
function externalUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch { return null; }
}
function statusStyle(status: Status) {
  if (status === "Approved") return "border-[#c8e2d3] bg-[#e9f5ee] text-[#17634b]";
  if (status === "Rejected") return "border-[#f0c9c5] bg-[#fff0ee] text-[#a23e38]";
  if (status === "Needs review") return "border-[#ead8a9] bg-[#fff6df] text-[#805d13]";
  return "border-[#d9e1dd] bg-[#f3f6f4] text-[#53665d]";
}
function eventValues(entry: HistoryEntry) {
  const data = entry.metadata;
  const previousParts = [
    data.previousStatus !== undefined ? `Status: ${pretty(String(data.previousStatus))}` : null,
    data.previousAvailability !== undefined ? `Availability: ${pretty(String(data.previousAvailability))}` : null,
    data.previousSourceUrl ? `Source: ${String(data.previousSourceUrl)}` : null,
  ].filter((value): value is string => Boolean(value));
  const nextParts = [
    data.newStatus !== undefined ? `Status: ${pretty(String(data.newStatus))}` : null,
    data.availability !== undefined ? `Availability: ${pretty(String(data.availability))}` : null,
    data.sourceUrl ? `Source: ${String(data.sourceUrl)}` : null,
  ].filter((value): value is string => Boolean(value));
  const previous = data.previousValue ?? (previousParts.length ? previousParts.join(" · ") : data.oldValue ?? data.previous);
  const next = data.newValue ?? (nextParts.length ? nextParts.join(" · ") : data.title ?? data.name ?? data.url ?? data.status ?? data.next);
  const source = data.sourceUrl ?? data.url ?? data.evidenceSource;
  const sourceType = typeof data.sourceType === "string" ? pretty(data.sourceType) : entry.action === "institution_marked_verified" ? "Official site" : null;
  return { previous: display(previous), next: display(next), source: display(source), sourceHref: externalUrl(source), sourceType };
}
function dateLabel(value: string, includeTime = true) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return date.toLocaleString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric", month: "short", year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}
function dateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function ChangeHistoryWorkspace({ entries, initialFrom, initialTo }: Props) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [actor, setActor] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [action, setAction] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(entries[0]?.id ?? null);

  const actors = useMemo(() => [...new Set(entries.map((entry) => entry.actor))].sort((a, b) => a.localeCompare(b)), [entries]);
  const entityTypes = useMemo(() => [...new Set(entries.map((entry) => entry.entityType))].sort((a, b) => a.localeCompare(b)), [entries]);
  const actions = useMemo(() => [...new Set(entries.map((entry) => entry.action))].sort((a, b) => a.localeCompare(b)), [entries]);
  const statuses = useMemo(() => [...new Set(entries.map(eventStatus))].sort((a, b) => a.localeCompare(b)), [entries]);
  const filtered = useMemo(() => entries.filter((entry) => {
    const eventDay = dateKey(entry.createdAt);
    if (from && eventDay < from) return false;
    if (to && eventDay > to) return false;
    if (actor !== "all" && entry.actor !== actor) return false;
    if (entityType !== "all" && entry.entityType !== entityType) return false;
    if (action !== "all" && entry.action !== action) return false;
    if (status !== "all" && eventStatus(entry) !== status) return false;
    const query = search.trim().toLowerCase();
    if (query && !`${entry.actor} ${entry.actorEmail ?? ""} ${entry.action} ${entry.entityName} ${entry.entityType} ${entry.entityRef} ${JSON.stringify(entry.metadata)}`.toLowerCase().includes(query)) return false;
    return true;
  }), [entries, from, to, actor, entityType, action, status, search]);
  const selected = filtered.find((entry) => entry.id === selectedId) ?? filtered[0] ?? null;

  function clearFilters() {
    setFrom(initialFrom); setTo(initialTo); setActor("all"); setEntityType("all"); setAction("all"); setStatus("all"); setSearch("");
  }
  const anyFilter = from !== initialFrom || to !== initialTo || actor !== "all" || entityType !== "all" || action !== "all" || status !== "all" || search.trim() !== "";

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Admin / Change history</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">See what changed.</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#596a63]">Every recorded admin update keeps its actor, time, and available source evidence.</p>
      </div>
      <label className="relative w-full sm:w-72">
        <span className="sr-only">Search change history</span><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78877f]" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search history…" className="h-11 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]" />
      </label>
    </header>

    <section className="rounded-xl border border-[#d4dfda] bg-white p-4 shadow-sm sm:p-5" aria-label="Filter change history">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
        <fieldset className="min-w-0"><legend className="mb-1.5 text-xs font-semibold text-[#596a63]">Date range</legend><div className="flex items-center gap-2"><input aria-label="From date" type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-[#cbd8d2] px-2 text-sm outline-none focus:border-[#27735c]" /><span className="text-xs text-[#77867f]">to</span><input aria-label="To date" type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} className="h-10 min-w-0 flex-1 rounded-lg border border-[#cbd8d2] px-2 text-sm outline-none focus:border-[#27735c]" /></div></fieldset>
        <label className="text-xs font-semibold text-[#596a63]">Actor<select value={actor} onChange={(event) => setActor(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All actors</option>{actors.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#596a63]">Entity type<select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All entity types</option>{entityTypes.map((value) => <option value={value} key={value}>{pretty(value)}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#596a63]">Action<select value={action} onChange={(event) => setAction(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All actions</option>{actions.map((value) => <option value={value} key={value}>{actionLabel(value)}</option>)}</select></label>
        <label className="text-xs font-semibold text-[#596a63]">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All statuses</option>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></label>
        <button onClick={clearFilters} className="min-h-10 self-end rounded-lg border border-[#cbd8d2] px-4 text-sm font-semibold text-[#344e47] hover:bg-[#f5f8f6]">Clear filters</button>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-[#687970]"><Filter className="h-3.5 w-3.5" />Showing {filtered.length} of {entries.length} recorded event{entries.length === 1 ? "" : "s"}{anyFilter && <button onClick={clearFilters} className="ml-auto font-semibold text-[#17634b] underline">Reset to current month</button>}</div>
    </section>

    <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#e6ece9] px-4 py-3 sm:px-5"><h2 className="font-bold text-[#172b35]">Change history <span className="font-normal text-[#687970]">({filtered.length} {filtered.length === 1 ? "item" : "items"})</span></h2><span className="text-xs text-[#74827c]">Newest first · latest 500 audit events</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Actor</th><th className="px-3 py-3">Action</th><th className="px-3 py-3">Entity</th><th className="px-3 py-3">Previous value</th><th className="px-3 py-3">New value</th><th className="px-3 py-3">Source</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead>
        <tbody className="divide-y divide-[#e7ece9]">
          {filtered.map((entry) => {
            const values = eventValues(entry);
            const currentStatus = eventStatus(entry);
            return <tr key={entry.id} onClick={() => setSelectedId(entry.id)} className={`cursor-pointer transition hover:bg-[#f8fbf9] ${selected?.id === entry.id ? "bg-[#f0f7f3]" : currentStatus === "Needs review" ? "bg-[#fff9eb]" : ""}`}>
              <td className="whitespace-nowrap px-3 py-3 text-[#43574f]">{dateLabel(entry.createdAt, false)}</td>
              <td className="max-w-36 truncate px-3 py-3 text-[#344e47]" title={entry.actorEmail ?? entry.actor}>{entry.actor}</td>
              <td className="max-w-40 px-3 py-3 font-medium text-[#263b33]">{actionLabel(entry.action)}</td>
              <td className="max-w-44 px-3 py-3 text-[#43574f]"><span className="block truncate" title={entry.entityName}>{entry.entityName}</span><span className="mt-0.5 block text-xs text-[#77867f]">{pretty(entry.entityType)}{entry.entityRef && entry.entityRef !== entry.entityName ? ` · ${entry.entityRef}` : ""}</span></td>
              <td className="max-w-36 truncate px-3 py-3 text-[#65756d]" title={values.previous}>{values.previous}</td>
              <td className="max-w-36 truncate px-3 py-3 text-[#43574f]" title={values.next}>{values.next}</td>
              <td className="max-w-40 px-3 py-3 text-[#43574f]">{values.sourceHref ? <a href={values.sourceHref} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1 text-[#286d54] underline">{values.sourceType ?? new URL(values.sourceHref).hostname}<ExternalLink className="h-3 w-3" /></a> : values.source}</td>
              <td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(currentStatus)}`}>{currentStatus === "Approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : currentStatus === "Needs review" ? <Clock3 className="h-3.5 w-3.5" /> : currentStatus === "Rejected" ? <X className="h-3.5 w-3.5" /> : <FileClock className="h-3.5 w-3.5" />}{currentStatus}</span></td>
              <td className="px-3 py-3"><button onClick={(event) => { event.stopPropagation(); setSelectedId(entry.id); }} className="min-h-9 whitespace-nowrap rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-white">View details</button></td>
            </tr>;
          })}
          {filtered.length === 0 && <tr><td colSpan={9} className="px-4 py-14 text-center"><FileClock className="mx-auto h-8 w-8 text-[#9aa8a1]" /><p className="mt-3 font-semibold text-[#344e47]">No history in this date range</p><p className="mt-1 text-sm text-[#718078]">Try a wider date range or clear the filters.</p></td></tr>}
        </tbody>
      </table></div>
    </section>

    <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Selected change detail">
      {selected ? <>
        <header className={`flex flex-wrap items-center gap-3 border-b px-4 py-4 sm:px-5 ${eventStatus(selected) === "Needs review" ? "border-[#efdfa9] bg-[#fff8e9]" : "border-[#e7ece9] bg-[#f9fbfa]"}`}>
          <span className={`grid h-10 w-10 place-items-center rounded-full ${eventStatus(selected) === "Needs review" ? "bg-[#fff0cf] text-[#a66d08]" : "bg-[#e7f2ec] text-[#267253]"}`}>{eventStatus(selected) === "Needs review" ? <Clock3 className="h-5 w-5" /> : <FileClock className="h-5 w-5" />}</span>
          <div className="min-w-0 flex-1"><h2 className="font-bold text-[#172b35]">{actionLabel(selected.action)}</h2><p className="mt-0.5 text-sm text-[#596a63]">Recorded {dateLabel(selected.createdAt)} by {selected.actor}</p>{selected.actorEmail && <p className="mt-0.5 text-xs text-[#77867f]">{selected.actorEmail}</p>}</div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle(eventStatus(selected))}`}>{eventStatus(selected)}</span>
        </header>
        <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-[1fr_1fr_1fr]">
          <div><p className="text-xs font-semibold text-[#687970]">Entity</p><p className="mt-1 font-semibold text-[#263b33]">{selected.entityName}</p><p className="mt-1 text-xs text-[#77867f]">{pretty(selected.entityType)}{selected.entityRef ? ` · ${selected.entityRef}` : ""}</p></div>
          <div><p className="text-xs font-semibold text-[#687970]">Previous / recorded value</p><p className="mt-1 break-words text-sm text-[#263b33]">{eventValues(selected).previous}</p><p className="mt-3 text-xs font-semibold text-[#687970]">New / recorded value</p><p className="mt-1 break-words text-sm text-[#263b33]">{eventValues(selected).next}</p></div>
          <div><p className="text-xs font-semibold text-[#687970]">Evidence source</p>{eventValues(selected).sourceHref ? <a href={eventValues(selected).sourceHref!} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex break-all text-sm text-[#286d54] underline">{eventValues(selected).source}<ExternalLink className="ml-1 mt-0.5 h-3.5 w-3.5 shrink-0" /></a> : <p className="mt-1 text-sm text-[#263b33]">{eventValues(selected).source}</p>}<p className="mt-3 text-xs font-semibold text-[#687970]">Review note</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-[#43574f]">{display(selected.metadata.reviewNote)}</p></div>
          <div className="lg:col-span-3"><details className="rounded-lg border border-[#e5ebe8] bg-[#fbfcfb] px-3 py-2"><summary className="cursor-pointer text-xs font-semibold text-[#53665d]">Show full recorded metadata</summary><dl className="mt-3 grid gap-x-5 gap-y-2 text-xs sm:grid-cols-[160px_1fr]">{Object.entries(selected.metadata).map(([key, value]) => <div key={key} className="contents"><dt className="font-medium text-[#687970]">{pretty(key)}</dt><dd className="break-all text-[#344e47]">{display(value)}</dd></div>)}</dl></details></div>
        </div>
      </> : <div className="px-5 py-8 text-center text-sm text-[#687970]">Choose a history row to inspect the recorded details.</div>}
    </section>

    <aside className="flex items-start gap-2 rounded-lg border border-[#d8e2dd] bg-[#f5f8f6] px-4 py-3 text-xs leading-relaxed text-[#596a63]"><Info className="mt-0.5 h-4 w-4 shrink-0" />This history reflects actions currently written to the audit log. Pending source-change proposals and approve/reject decisions are not yet stored by the application; historical entries are read-only and are never edited here.</aside>
  </div>;
}
