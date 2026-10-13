"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

type Props = { fields: { slug: string; name: string }[] };
const levels = [
  { value: "higher_secondary", label: "Higher secondary" },
  { value: "diploma", label: "Diploma" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "certificate", label: "Certificate" },
];
function slugify(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function AddCourseDialog({ fields }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  function beginAdd() {
    setError("");
    setName("");
    setSlug("");
    setSlugTouched(false);
    setOpen(true);
  }

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const result = await response.json().catch(() => ({})) as { error?: string; slug?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not create the course.");
      setOpen(false);
      router.push(`/admin/catalogue/courses/${encodeURIComponent(result.slug ?? slug)}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create the course.");
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" onClick={beginAdd} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#104d38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#145c42] focus-visible:ring-offset-2"><Plus aria-hidden className="h-4 w-4" />Add course</button>
    <dialog ref={dialogRef} aria-labelledby="add-course-title" onClose={() => setOpen(false)} className="m-auto max-h-[92dvh] w-[min(40rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-[#d4dfda] bg-white p-0 text-[#20392f] shadow-2xl backdrop:bg-[#12221c]/45">
      <form onSubmit={createCourse} className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.12em] text-[#53665d]">Catalogue entry</p><h2 id="add-course-title" className="mt-1 text-xl font-bold text-[#17362e]">Add course</h2><p className="mt-1 text-sm leading-relaxed text-[#53665e]">New courses start as needing verification. Institution-specific availability is reviewed separately.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close add course dialog" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[#53665e] hover:bg-[#f0f5f2]"><X aria-hidden className="h-4 w-4" /></button></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Course name<input name="name" required minLength={2} maxLength={160} value={name} onChange={(event) => { setName(event.target.value); if (!slugTouched) setSlug(slugify(event.target.value)); }} autoFocus placeholder="e.g. Bachelor of Computer Applications" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
          <label className="text-sm font-semibold text-[#344b41]">Stable slug<input name="slug" required minLength={2} maxLength={80} pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Use lowercase letters, numbers, and hyphens." value={slug} onChange={(event) => { setSlugTouched(true); setSlug(event.target.value); }} placeholder="bachelor-computer-applications" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
          <label className="text-sm font-semibold text-[#344b41]">Level<select name="level" required defaultValue="undergraduate" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15">{levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</select></label>
          <label className="text-sm font-semibold text-[#344b41]">Field<select name="fieldSlug" defaultValue="" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15"><option value="">Not assigned</option>{fields.map((field) => <option key={field.slug} value={field.slug}>{field.name}</option>)}</select></label>
          <label className="text-sm font-semibold text-[#344b41]">Duration<input name="durationLabel" maxLength={60} placeholder="e.g. 3 years" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">General eligibility<textarea name="eligibility" required minLength={2} maxLength={4000} rows={3} placeholder="What is generally required to apply? Note institution-specific variations." className="mt-1.5 w-full rounded-lg border border-[#cbd8d2] p-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
          <label className="text-sm font-semibold text-[#344b41] sm:col-span-2">Source URL (optional)<input name="sourceUrl" type="url" maxLength={2048} placeholder="https://official.example/course" className="mt-1.5 h-11 w-full rounded-lg border border-[#cbd8d2] px-3 text-sm font-medium outline-none focus:border-[#28765c] focus:ring-2 focus:ring-[#28765c]/15" /></label>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg border border-[#efc9c4] bg-[#fff2f0] px-3 py-2.5 text-sm font-medium text-[#9e4038]">{error}</p>}
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#e7ece9] pt-4"><button type="button" onClick={() => setOpen(false)} disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#cbd8d2] px-4 text-sm font-bold text-[#344b41] hover:bg-[#f5f8f6] disabled:opacity-60">Cancel</button><button type="submit" disabled={busy} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#145c42] px-4 text-sm font-bold text-white hover:bg-[#104d38] disabled:cursor-wait disabled:opacity-65">{busy ? "Adding…" : "Add as unverified"}</button></div>
      </form>
    </dialog>
  </>;
}
