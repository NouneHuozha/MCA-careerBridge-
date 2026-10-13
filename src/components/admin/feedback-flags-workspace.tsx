"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, FileClock, Flag, LoaderCircle, Search, X } from "lucide-react";

export type FeedbackFlagRow = {
  id: number;
  entityType: string;
  entityRef: string;
  entityName: string;
  issueType: string;
  reason: string;
  sourceUrl: string | null;
  status: string;
  assignedTo: string | null;
  resolutionReason: string | null;
  createdAt: string;
  reporter: string;
};
const issueLabels: Record<string, string> = {
  incorrect_detail: "Incorrect detail",
  broken_application_link: "Broken application link",
  outdated_deadline: "Deadline may be outdated",
  wrong_course_availability: "Course availability",
  missing_source: "Missing source",
  other: "Other issue",
};
const entityLabels: Record<string, string> = { institution: "Institution", course: "Course", scholarship: "Scholarship", entrance_exam: "Entrance exam", opportunity: "Opportunity", institution_course: "Institution-course link" };
const statusLabels: Record<string, string> = { open: "Open", in_review: "In review", resolved: "Resolved", dismissed: "Dismissed" };
const statusStyles: Record<string, string> = { open: "border-[#eed8a3] bg-[#fff4d9] text-[#92600c]", in_review: "border-[#efdfbd] bg-[#fff5df] text-[#94610c]", resolved: "border-[#cfe4d8] bg-[#edf8f1] text-[#1d6846]", dismissed: "border-[#dce2df] bg-[#f0f3f2] text-[#687970]" };
const dateTime = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
const dateOnly = (value: string) => new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const catalogueHref = (row: FeedbackFlagRow) => {
  if (row.entityType === "institution") return `/admin/catalogue/institutions/${encodeURIComponent(row.entityRef)}`;
  if (row.entityType === "course") return `/admin/catalogue/courses/${encodeURIComponent(row.entityRef)}`;
  if (row.entityType === "scholarship") return "/admin/catalogue/scholarships";
  if (row.entityType === "entrance_exam") return "/admin/catalogue/exams";
  if (row.entityType === "opportunity") return "/admin/catalogue/opportunities";
  if (row.entityType === "institution_course") return "/admin/catalogue/institution-courses";
  return "/admin/catalogue";
};

export function FeedbackFlagsWorkspace({ rows }: { rows: FeedbackFlagRow[] }) {
  const router = useRouter();
  const [status, setStatus] = useState("all");
  const [issue, setIssue] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(rows[0]?.id ?? null);
  const [selectionClosed, setSelectionClosed] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [resolutionReason, setResolutionReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => rows.filter((row) => {
    const at = new Date(row.createdAt).getTime();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
    const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
    const search = `${row.entityName} ${row.entityRef} ${row.reason} ${row.reporter} ${issueLabels[row.issueType] ?? row.issueType}`.toLowerCase();
    return (status === "all" || row.status === status) && (issue === "all" || row.issueType === issue) && (entityType === "all" || row.entityType === entityType) && at >= fromTime && at <= toTime && (!query.trim() || search.includes(query.trim().toLowerCase()));
  }), [rows, status, issue, entityType, from, to, query]);
  const selected = selectionClosed ? null : filtered.find((row) => row.id === selectedId) ?? filtered[0] ?? null;
  /* eslint-disable react-hooks/set-state-in-effect -- reset editable review drafts when the selected report changes */
  useEffect(() => {
    setAssignedTo(selected?.assignedTo ?? "");
    setResolutionReason("");
    setError(""); setMessage("");
  }, [selected?.id, selected?.assignedTo]);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function act(action: "mark_in_review" | "resolve" | "dismiss_duplicate") {
    if (!selected) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/admin/feedback-flags/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, assignedTo: assignedTo.trim() || undefined, resolutionReason }) });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not update this flag.");
      setMessage(action === "mark_in_review" ? "Flag moved to review." : action === "resolve" ? "Flag resolved; the catalogue was not edited." : "Flag dismissed as a duplicate.");
      router.refresh();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not update this flag."); }
    finally { setBusy(false); }
  }

  function exportCsv() {
    const columns = ["reported_at", "issue_type", "entity_type", "entity_name", "entity_ref", "student_note", "source_url", "status", "assigned_to", "reporter"];
    const quote = (value: string) => { const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value; return `"${safe.replaceAll('"', '""')}"`; };
    const data = [columns, ...filtered.map((row) => [row.createdAt, issueLabels[row.issueType] ?? row.issueType, entityLabels[row.entityType] ?? row.entityType, row.entityName, row.entityRef, row.reason, row.sourceUrl ?? "", statusLabels[row.status] ?? row.status, row.assignedTo ?? "Unassigned", row.reporter])];
    const blob = new Blob([data.map((record) => record.map((value) => quote(String(value))).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "careerbridge-feedback-flags.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  const statusOptions = ["all", "open", "in_review", "resolved", "dismissed"];
  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-sm font-semibold text-[#56695f]"><Link href="/admin" className="hover:text-[#145c42]">Review queue</Link><span aria-hidden>/</span><span>Feedback flags</span></p><h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-[#17392f] sm:text-4xl">Student-reported issues</h1><p className="mt-1 text-sm text-[#596a63]">Review reports about links, dates, course availability, and missing information.</p></div><button type="button" onClick={exportCsv} disabled={!filtered.length} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:opacity-50"><ExternalLink aria-hidden className="h-4 w-4 rotate-[-45deg]"/>Export review list</button></header>
    <section className="grid gap-3 rounded-xl border border-[#d8e1dc] bg-white p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-4" aria-label="Filter student feedback flags">
      <label className="text-xs font-semibold text-[#596a63]">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All statuses</option>{statusOptions.slice(1).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Issue type<select value={issue} onChange={(event) => setIssue(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All issue types</option>{Object.entries(issueLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="text-xs font-semibold text-[#596a63]">Entity type<select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal text-[#263b33]"><option value="all">All entity types</option>{Object.entries(entityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <div className="grid grid-cols-2 gap-2"><label className="text-xs font-semibold text-[#596a63]">Reported from<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-2 text-sm font-normal"/></label><label className="text-xs font-semibold text-[#596a63]">Reported to<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-2 text-sm font-normal"/></label></div>
      <label className="relative text-xs font-semibold text-[#596a63] sm:col-span-2 xl:col-span-3"><span className="sr-only">Search reports</span><Search aria-hidden className="pointer-events-none absolute left-3 top-[2.1rem] h-4 w-4 text-[#78877f]"/><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search entity, reference, student note…" className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white pl-9 pr-3 text-sm font-normal outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/></label>
      <button type="button" onClick={() => { setStatus("all"); setIssue("all"); setEntityType("all"); setFrom(""); setTo(""); setQuery(""); }} className="min-h-10 self-end rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f5f8f6]">Clear filters</button>
      <p className="flex items-center text-xs text-[#687970] sm:col-span-2 xl:col-span-4"><FileClock aria-hidden className="mr-2 h-4 w-4"/>Showing {filtered.length} of {rows.length} recent report{rows.length === 1 ? "" : "s"}</p>
    </section>
    <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1.45fr)_minmax(350px,.75fr)]">
      <section className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm" aria-label="Student reports"><div className="border-b border-[#e6ece9] px-4 py-3 sm:px-5"><h2 className="font-bold text-[#172b35]">Student reports <span className="font-normal text-[#687970]">({filtered.length} {filtered.length === 1 ? "item" : "items"})</span></h2></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th className="px-3 py-3">Reported</th><th className="px-3 py-3">Issue</th><th className="px-3 py-3">Entity</th><th className="px-3 py-3">Student note</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Assigned to</th><th className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-[#e7ece9]">{filtered.map((row) => <tr key={row.id} onClick={() => { setSelectionClosed(false); setSelectedId(row.id); }} className={`cursor-pointer transition hover:bg-[#f8fbf9] ${selected?.id === row.id ? "bg-[#fff9eb]" : ""}`}><td className="whitespace-nowrap px-3 py-3 text-xs text-[#43574f]">{dateOnly(row.createdAt)}</td><td className="max-w-36 px-3 py-3 font-medium text-[#263b33]">{issueLabels[row.issueType] ?? row.issueType}</td><td className="max-w-40 px-3 py-3 text-[#43574f]"><span className="block truncate" title={row.entityName}>{row.entityName}</span><span className="text-xs text-[#77867f]">{entityLabels[row.entityType] ?? row.entityType}</span></td><td className="max-w-48 truncate px-3 py-3 text-[#52645b]" title={row.reason}>“{row.reason}”</td><td className="px-3 py-3"><span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[row.status] ?? statusStyles.open}`}>{statusLabels[row.status] ?? row.status}</span></td><td className="max-w-32 truncate px-3 py-3 text-xs text-[#53665e]">{row.assignedTo ?? "Unassigned"}</td><td className="px-3 py-3"><button type="button" onClick={(event) => { event.stopPropagation(); setSelectionClosed(false); setSelectedId(row.id); }} className="min-h-9 whitespace-nowrap rounded-lg border border-[#cbd8d2] px-3 text-xs font-semibold text-[#344e47] hover:bg-white">{row.status === "resolved" || row.status === "dismissed" ? "View" : row.status === "in_review" ? "Open" : "Review"}</button></td></tr>)}</tbody></table></div>{!filtered.length && <div className="px-4 py-12 text-center"><Flag aria-hidden className="mx-auto h-8 w-8 text-[#9aa8a1]"/><p className="mt-3 font-semibold text-[#344e47]">{rows.length ? "No reports match these filters" : "No student reports yet"}</p><p className="mt-1 text-sm text-[#718078]">{rows.length ? "Clear or adjust the filters to see more." : "Reports submitted from student catalogue pages will appear here."}</p></div>}</section>
      <aside className="overflow-hidden rounded-xl border border-[#d4dfda] bg-white shadow-sm 2xl:sticky 2xl:top-5" aria-label="Selected student report">
        {selected ? <><header className="flex items-start gap-3 border-b border-[#e7ece9] px-4 py-4"><div className="min-w-0 flex-1"><h2 className="text-xl font-bold text-[#172b35]">{issueLabels[selected.issueType] ?? selected.issueType}</h2><div className="mt-2 flex flex-wrap items-center gap-2"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusStyles[selected.status] ?? statusStyles.open}`}>{statusLabels[selected.status] ?? selected.status}</span><span className="text-xs text-[#718078]">Reported {dateOnly(selected.createdAt)}</span></div></div><button type="button" aria-label="Close report details" onClick={() => { setSelectionClosed(true); setSelectedId(null); }} className="grid h-8 w-8 place-items-center rounded-lg text-[#64766d] hover:bg-[#f0f4f2]"><X aria-hidden className="h-4 w-4"/></button></header><div className="space-y-4 p-4"><div><p className="text-xs font-bold text-[#53665e]">Entity</p><p className="mt-1 font-semibold text-[#263b33]">{selected.entityName}</p><p className="mt-0.5 text-xs text-[#718078]">Type: {entityLabels[selected.entityType] ?? selected.entityType} · {selected.entityRef}</p></div><div className="border-t border-[#e7ece9] pt-3"><p className="text-xs font-bold text-[#53665e]">Student note</p><blockquote className="mt-2 text-sm leading-relaxed text-[#344b41]">“{selected.reason}”</blockquote><p className="mt-2 text-xs text-[#718078]">Reported by {selected.reporter} on {dateTime(selected.createdAt)}</p></div>{selected.sourceUrl && <div className="border-t border-[#e7ece9] pt-3"><p className="text-xs font-bold text-[#53665e]">Source URL (as reported)</p><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex break-all text-sm text-[#1768a5] underline">{selected.sourceUrl}<ExternalLink aria-hidden className="ml-1 mt-0.5 h-3.5 w-3.5 shrink-0"/></a></div>}<div className="border-t border-[#e7ece9] pt-3"><p className="text-xs font-bold text-[#53665e]">Current status</p><span className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[selected.status] ?? statusStyles.open}`}>{statusLabels[selected.status] ?? selected.status}</span></div><div><label className="text-xs font-bold text-[#53665e]">Assigned to<input value={assignedTo} onChange={(event) => setAssignedTo(event.target.value)} disabled={selected.status === "resolved" || selected.status === "dismissed"} maxLength={191} placeholder={selected.assignedTo ?? "Unassigned — reviewer will be assigned"} className="mt-1.5 h-10 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-normal disabled:bg-[#f4f6f5]"/></label></div><Link href={catalogueHref(selected)} className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#cbd8d2] px-3 text-sm font-semibold text-[#344b41] hover:bg-[#f5f8f6]">Open catalogue record<ExternalLink aria-hidden className="h-4 w-4"/></Link>
          {selected.status !== "resolved" && selected.status !== "dismissed" ? <><label className="block text-xs font-bold text-[#53665e]">Closure reason (required to resolve or dismiss)<textarea value={resolutionReason} onChange={(event) => setResolutionReason(event.target.value)} maxLength={500} rows={2} placeholder="Record what was checked or why this is a duplicate" className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-normal outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"/><span className="mt-1 block text-right text-xs font-normal text-[#718078]">{resolutionReason.length}/500</span></label><div className="grid gap-2"><button type="button" disabled={busy} onClick={() => act("mark_in_review")} className="min-h-10 rounded-lg border border-[#efdfbd] bg-[#fff4dc] px-3 text-sm font-semibold text-[#875b11] hover:bg-[#ffedc6] disabled:opacity-50">{busy ? <LoaderCircle aria-hidden className="mx-auto h-4 w-4 animate-spin"/> : selected.status === "in_review" ? "Save assignment / keep in review" : "Mark in review"}</button><button type="button" disabled={busy || resolutionReason.trim().length < 8} onClick={() => act("resolve")} className="min-h-10 rounded-lg bg-[#145c42] px-3 text-sm font-bold text-white hover:bg-[#104d38] disabled:opacity-50">Resolve flag</button><button type="button" disabled={busy || resolutionReason.trim().length < 8} onClick={() => act("dismiss_duplicate")} className="min-h-10 rounded-lg border border-[#e2a8a5] bg-white px-3 text-sm font-semibold text-[#a52c39] hover:bg-[#fff4f3] disabled:opacity-50">Dismiss as duplicate</button></div></> : <div className="rounded-lg border border-[#e0e7e3] bg-[#f7faf8] p-3"><p className="text-xs font-bold text-[#53665e]">Closure reason</p><p className="mt-1 text-sm leading-relaxed text-[#344b41]">{selected.resolutionReason || "No closure reason was recorded."}</p></div>}
          {error && <p role="alert" className="rounded-lg border border-[#efc9c4] bg-[#fff2f0] p-3 text-sm text-[#9e4038]">{error}</p>}{message && <p role="status" className="rounded-lg border border-[#cce4d6] bg-[#edf8f1] p-3 text-sm text-[#1d5c3f]">{message}</p>}
          <p className="flex items-start gap-2 rounded-lg border border-[#d8e2dd] bg-[#f5f8f6] p-3 text-xs leading-relaxed text-[#596a63]"><Flag aria-hidden className="mt-0.5 h-4 w-4 shrink-0"/>Student reports create review tasks; they do not directly change catalogue data.</p>
        </div></> : <div className="px-5 py-12 text-center text-sm text-[#687970]">Select a report to review its details.</div>}
      </aside>
    </div>
  </div>;
}
