"use client";

import { useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronDown, FileSpreadsheet, Info, Save, Upload, X } from "lucide-react";
import * as ExcelJS from "exceljs";

type Dataset = "institutions" | "courses" | "institution_courses" | "pathways" | "entrance_exams" | "scholarships" | "opportunities";
type ColumnMapping = Record<string, string>;
const datasets: { id: Dataset; label: string; fields: { key: string; label: string }[] }[] = [
  { id: "institutions", label: "Institutions", fields: [{ key: "code", label: "Institution code" }, { key: "name", label: "Institution name" }, { key: "type", label: "Institution type" }, { key: "district", label: "District" }, { key: "city", label: "City" }, { key: "state", label: "State" }, { key: "ownership", label: "Ownership" }, { key: "official_website", label: "Official website" }, { key: "source_url", label: "Source URL" }, { key: "verification_status", label: "Verification status" } ] },
  { id: "courses", label: "Courses", fields: [{ key: "slug", label: "Course slug" }, { key: "name", label: "Course name" }, { key: "level", label: "Education level" }, { key: "stream", label: "Stream" }, { key: "description", label: "Description" }, { key: "source_url", label: "Source URL" }] },
  { id: "institution_courses", label: "Institution-course links", fields: [{ key: "institution_code", label: "Institution code" }, { key: "course_slug", label: "Course slug" }, { key: "availability_status", label: "Availability status" }, { key: "source_url", label: "Source URL" }] },
  { id: "pathways", label: "Pathways", fields: [{ key: "slug", label: "Pathway slug" }, { key: "name", label: "Pathway name" }, { key: "description", label: "Description" }, { key: "source_url", label: "Source URL" }] },
  { id: "entrance_exams", label: "Entrance exams", fields: [{ key: "slug", label: "Exam slug" }, { key: "name", label: "Exam name" }, { key: "application_url", label: "Application URL" }, { key: "source_url", label: "Source URL" }] },
  { id: "scholarships", label: "Scholarships", fields: [{ key: "slug", label: "Scholarship slug" }, { key: "name", label: "Scholarship name" }, { key: "deadline", label: "Deadline" }, { key: "source_url", label: "Source URL" }] },
  { id: "opportunities", label: "Opportunities", fields: [{ key: "slug", label: "Opportunity slug" }, { key: "name", label: "Opportunity name" }, { key: "application_url", label: "Application URL" }, { key: "source_url", label: "Source URL" }] },
];
const normalize = (value: string) => value.toLowerCase().trim().replace(/[\s-]+/g, "_");
function parseCsv(text: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell); if (row.some((value) => value.trim())) records.push(row);
      row = []; cell = "";
    } else cell += char;
  }
  row.push(cell); if (row.some((value) => value.trim())) records.push(row);
  return records;
}
const autoMap = (columns: string[], fields: { key: string; label: string }[]): ColumnMapping => Object.fromEntries(columns.map((column) => {
  const candidate = normalize(column);
  const match = fields.find((field) => candidate === field.key || candidate === normalize(field.label) || candidate === field.key.replace(/_name$/, ""));
  return [column, match?.key ?? ""];
}));

export function ImportWorkbench() {
  const [datasetId, setDatasetId] = useState<Dataset>("institutions");
  const dataset = datasets.find((item) => item.id === datasetId)!;
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const mappedCount = Object.values(mapping).filter(Boolean).length;
  const unmapped = columns.filter((column) => !mapping[column]);
  const mergedRows = useMemo(() => rows.map((row) => Object.fromEntries(columns.filter((column) => mapping[column]).map((column) => [mapping[column], row[column]]))), [columns, mapping, rows]);
  const required = datasetId === "institutions" ? ["code", "name"] : datasetId === "courses" ? ["slug", "name"] : [dataset.fields[0].key, dataset.fields[1]?.key].filter(Boolean);
  const missingRequired = required.filter((field) => !Object.values(mapping).includes(field));
  const missingRows = mergedRows.reduce((count, row) => count + (required.some((field) => !String(row[field] ?? "").trim()) ? 1 : 0), 0);

  async function loadFile(file?: File) {
    if (!file) return;
    setMessage("");
    if (!/\.(xlsx|csv)$/i.test(file.name)) { setMessage("Choose an Excel workbook (.xlsx) or CSV file."); return; }
    if (file.size > 20 * 1024 * 1024) { setMessage("The file is larger than the 20 MB limit."); return; }
    try {
      let grid: unknown[][];
      if (file.name.toLowerCase().endsWith(".csv")) {
        grid = parseCsv(await file.text());
      } else {
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(await file.arrayBuffer());
        const sheet = workbook.worksheets[0];
        if (!sheet) throw new Error("This workbook has no readable worksheets.");
        grid = [];
        sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          const values = row.values as unknown as unknown[];
          grid[rowNumber - 1] = values.slice(1).map((value) => value instanceof Date ? value.toISOString().slice(0, 10) : value ?? "");
        });
      }
      const headerRow = grid.findIndex((row) => row.some((cell) => String(cell ?? "").trim()));
      const headers = (grid[headerRow] ?? []).map((cell, index) => String(cell ?? "").trim() || `Column ${index + 1}`);
      const dataRows = grid.slice(headerRow + 1).filter((row) => row.some((cell) => String(cell ?? "").trim())).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
      if (!headers.length || !dataRows.length) throw new Error("No header row and data rows were found in the first worksheet.");
      setFileName(file.name); setFileSize(file.size); setColumns(headers); setRows(dataRows); setMapping(autoMap(headers, dataset.fields)); setStep(2);
    } catch (error) { setMessage(error instanceof Error ? error.message : "The workbook could not be read."); }
  }

  function saveDraft() {
    const draft = { datasetId, fileName, fileSize, columns, rows, mapping, savedAt: new Date().toISOString() };
    try { localStorage.setItem("careerbridge-admin-import-draft", JSON.stringify(draft)); setMessage("Draft saved in this browser. No records have been imported or published."); }
    catch { setMessage("This browser could not save the draft. Try a smaller workbook."); }
  }

  return <div className="space-y-6">
    <header>
      <p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Imports <span className="px-1 text-[#899790]">/</span> New import</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-.04em] text-[#142e27] sm:text-4xl">Upload catalogue data</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[#455b51]">Bring in a workbook, map its columns, and review every change before it reaches students.</p>
    </header>
    <ol className="mx-auto flex max-w-5xl items-center gap-3 px-2 py-1 text-sm" aria-label="Import progress">
      {["Upload", "Map columns", "Review and approve"].map((label, index) => { const n = index + 1; const complete = step > n; const current = step === n; return <li key={label} className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-bold ${complete ? "bg-[#d9efe5] text-[#17634b]" : current ? "bg-[#0e6a53] text-white" : "bg-[#e5e9e7] text-[#66746e]"}`}>{complete ? <Check className="h-4 w-4" /> : n}</span><span className={`${current ? "font-bold text-[#172b35]" : "text-[#596a63]"}`}>{label}</span>{index < 2 && <span className={`h-px min-w-5 flex-1 ${step > n ? "bg-[#75b297]" : "bg-[#d5ddda]"}`} />}</li>; })}
    </ol>
    {message && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#c8ded3] bg-[#eef7f2] px-4 py-3 text-sm text-[#245844]"><Info className="mt-0.5 h-4 w-4 shrink-0" />{message}<button className="ml-auto" onClick={() => setMessage("")} aria-label="Dismiss"><X className="h-4 w-4" /></button></div>}

    {step === 3 ? <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-7">
      <h2 className="text-xl font-bold text-[#142e27]">Validation preview</h2><p className="mt-1 text-sm text-[#596a63]">A first-pass check of the mapped workbook. Nothing is written to the catalogue at this stage.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-lg bg-[#f3f7f5] p-4"><p className="text-xs font-bold uppercase text-[#596a63]">Rows in workbook</p><p className="mt-1 text-2xl font-bold">{rows.length}</p></div><div className="rounded-lg bg-[#f3f7f5] p-4"><p className="text-xs font-bold uppercase text-[#596a63]">Unmapped columns</p><p className="mt-1 text-2xl font-bold">{unmapped.length}</p></div><div className={`rounded-lg p-4 ${missingRows || missingRequired.length ? "bg-[#fff6e4]" : "bg-[#eaf6ef]"}`}><p className="text-xs font-bold uppercase text-[#596a63]">Rows missing required values</p><p className="mt-1 text-2xl font-bold">{missingRows + (missingRequired.length ? rows.length : 0)}</p></div></div>
      {(unmapped.length > 0 || missingRows > 0 || missingRequired.length > 0) && <div className="mt-5 rounded-lg border border-[#ead8a9] bg-[#fff8e7] p-4 text-sm text-[#62430b]"><p className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" />Review needed before this import can proceed</p>{unmapped.length > 0 && <p className="mt-2">Unmapped columns: {unmapped.join(", ")}. They have not been silently discarded.</p>}{missingRequired.length > 0 && <p className="mt-1">Required field mapping is missing: {missingRequired.join(", ")}.</p>}{missingRows > 0 && <p className="mt-1">{missingRows} row(s) are missing at least one mapped required value.</p>}</div>}
      <div className="mt-6 overflow-x-auto rounded-lg border border-[#d9e1dd]"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-[#f4f7f5] text-xs text-[#53665d]"><tr><th className="px-3 py-2">Workbook row</th>{dataset.fields.slice(0, 4).map((field) => <th key={field.key} className="px-3 py-2">{field.label}</th>)}</tr></thead><tbody>{mergedRows.slice(0, 5).map((row, index) => <tr key={index} className="border-t border-[#e4eae7]"><td className="px-3 py-2">{index + 2}</td>{dataset.fields.slice(0, 4).map((field) => <td key={field.key} className="max-w-48 truncate px-3 py-2">{String(row[field.key] ?? "—") || "—"}</td>)}</tr>)}</tbody></table></div>
      <p className="mt-4 flex items-start gap-2 text-sm text-[#53665d]"><Info className="mt-0.5 h-4 w-4 shrink-0" />Approval, audit recording, and publishing happen only in a subsequent review workflow. This preview does not change student-facing data.</p>
      <div className="mt-6 flex flex-wrap justify-between gap-3"><button onClick={() => setStep(2)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344e47]"><ArrowLeft className="h-4 w-4" />Back to mapping</button><button onClick={saveDraft} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] px-4 text-sm font-bold text-[#17634b]"><Save className="h-4 w-4" />Save draft</button></div>
    </section> : <div className="grid gap-4 xl:grid-cols-[minmax(360px,.78fr)_minmax(0,1fr)]">
      <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-xl font-bold tracking-[-.02em] text-[#172b35]">Dataset and file</h2><p className="mt-1 text-sm text-[#596a63]">Choose the dataset you’re importing and upload your Excel file.</p>
        <label className="mt-5 block text-sm font-semibold text-[#344e47]">Dataset<select value={datasetId} onChange={(event) => { const next = event.target.value as Dataset; setDatasetId(next); if (columns.length) setMapping(autoMap(columns, datasets.find((item) => item.id === next)!.fields)); }} className="mt-2 min-h-12 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium text-[#172b35] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]">{datasets.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
        <div className="mt-5 flex items-center justify-between"><span className="text-sm font-semibold text-[#344e47]">Excel file</span><span className="text-xs text-[#687970]">XLSX, XLS, CSV · 20 MB max</span></div>
        <input ref={inputRef} type="file" accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" className="sr-only" onChange={(event) => void loadFile(event.target.files?.[0])} />
        {fileName ? <div className="mt-2 flex items-center gap-3 rounded-lg border border-[#d8e1dd] p-4"><FileSpreadsheet className="h-9 w-9 shrink-0 text-[#16805e]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#172b35]">{fileName}</p><p className="mt-1 text-xs text-[#687970]">{(fileSize / 1024).toFixed(0)} KB · {rows.length} rows · first worksheet</p></div><button onClick={() => inputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#b7cec2] px-3 text-sm font-semibold text-[#17634b]"><Upload className="h-4 w-4" />Replace file</button></div> : <button onClick={() => inputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void loadFile(event.dataTransfer.files[0]); }} className="mt-2 flex min-h-36 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbd8d2] bg-[#fbfcfb] px-4 text-center hover:bg-[#f4f8f6]"><span className="grid h-10 w-10 place-items-center rounded-lg bg-[#e5f2eb] text-[#17634b]"><Upload className="h-5 w-5" /></span><span className="mt-2 text-sm font-bold text-[#344e47]">Choose a workbook or drop it here</span><span className="mt-1 text-xs text-[#687970]">The first worksheet is read locally in your browser.</span></button>}
        {message && <p className="mt-3 text-sm text-[#9c3b31]">{message}</p>}
        {fileName && <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#c7e3d4] bg-[#edf7f1] px-3 py-3 text-sm font-medium text-[#17634b]"><CheckCircle2 className="h-4 w-4 shrink-0" />Workbook read successfully. No data has been imported.</div>}
      </section>
      <section className="rounded-xl border border-[#d4dfda] bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-bold tracking-[-.02em] text-[#172b35]">Map workbook columns</h2><p className="mt-1 text-sm text-[#596a63]">Match each column from your file to the correct CareerBridge field.</p></div><span className="rounded-full bg-[#edf4f0] px-3 py-1 text-xs font-bold text-[#17634b]">{mappedCount} of {columns.length} mapped</span></div>
        {columns.length ? <><div className="mt-5 grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 rounded-t-lg bg-[#f2f6f4] px-3 py-2 text-xs font-bold text-[#53665d]"><span>Workbook column</span><span>CareerBridge field</span></div><div className="divide-y divide-[#e7ece9]">{columns.map((column) => <div key={column} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 py-2"><span className="truncate px-3 text-sm text-[#344e47]" title={column}>{column}</span><span className="relative"><select aria-label={`Map ${column}`} value={mapping[column] ?? ""} onChange={(event) => setMapping((current) => ({ ...current, [column]: event.target.value }))} className="min-h-10 w-full appearance-none rounded-lg border border-[#cbd8d2] bg-white px-3 pr-9 text-sm text-[#344e47] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]"><option value="">Do not map this column</option>{dataset.fields.map((field) => <option key={field.key} value={field.key}>{field.label}</option>)}</select><ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#687970]" /></span></div>)}</div>{unmapped.length > 0 && <div className="mt-4 flex items-start gap-3 rounded-lg border border-[#ead8a9] bg-[#fff8e7] px-4 py-3 text-sm text-[#62430b]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span><strong>{unmapped.length} {unmapped.length === 1 ? "column is" : "columns are"} not mapped:</strong> {unmapped.join(", ")}. Unmapped data will be retained in the draft.</span></div>}</> : <div className="mt-5 grid min-h-64 place-items-center rounded-lg border border-dashed border-[#d4dfda] bg-[#fbfcfb] px-6 text-center"><div><FileSpreadsheet className="mx-auto h-8 w-8 text-[#9aa9a1]" /><p className="mt-3 text-sm font-semibold text-[#52665d]">Upload a workbook to map its columns</p><p className="mt-1 text-xs text-[#77867f]">Column names will be matched to known fields where possible.</p></div></div>}
      </section>
    </div>}
    {step === 2 && <footer className="flex flex-col gap-4 border-t border-[#d7e1dc] pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-[#596a63]"><Info className="mt-0.5 h-4 w-4 shrink-0" />Uploading does not publish records. They remain in review until approved.</p><div className="flex flex-wrap items-center gap-2 sm:justify-end"><a href="/admin" className="inline-flex min-h-11 items-center rounded-lg border border-[#cbd8d2] bg-white px-4 text-sm font-bold text-[#344e47]">Cancel</a><button onClick={saveDraft} disabled={!fileName} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b7cec2] bg-white px-4 text-sm font-bold text-[#17634b] disabled:opacity-50"><Save className="h-4 w-4" />Save draft</button><button onClick={() => { setMessage(""); setStep(3); }} disabled={!fileName} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white shadow-sm hover:bg-[#095640] disabled:cursor-not-allowed disabled:opacity-50">Continue to validation<ArrowRight className="h-4 w-4" /></button></div></footer>}
  </div>;
}
