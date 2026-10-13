"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown, Clock3, Database, LoaderCircle, Plus, Save, Settings2, ShieldCheck } from "lucide-react";

type Role = "admin" | "content_editor" | "verifier" | "viewer";
type TeamMember = { id: number; name: string | null; email: string; role: string; createdAt: string };
type Preferences = { refreshFrequency: string; automaticRefresh: boolean; reviewFields: string[]; retainPreviousValues: boolean };
const defaults: Preferences = { refreshFrequency: "weekly", automaticRefresh: false, reviewFields: ["eligibility", "fees", "deadlines", "course availability"], retainPreviousValues: true };
const tabs = ["Refresh defaults", "Review rules", "Team access", "Audit and storage"] as const;
type Tab = (typeof tabs)[number];
const roles: { key: Role; label: string; permission: string }[] = [
  { key: "admin", label: "Administrator", permission: "Full access" },
  { key: "content_editor", label: "Content editor", permission: "Edit and submit" },
  { key: "verifier", label: "Verifier", permission: "Review and approve" },
  { key: "viewer", label: "Viewer", permission: "Read-only access" },
];
const reviewOptions = ["eligibility", "fees", "deadlines", "course availability"];
const labelClass = "block text-sm font-semibold text-[#263b33]";
const fieldClass = "mt-2 min-h-11 w-full rounded-lg border border-[#cbd8d2] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#27735c] focus:ring-2 focus:ring-[#d4eee2]";

export function AdminSettingsWorkspace({ initialPreferences, team }: { initialPreferences: Preferences; team: TeamMember[] }) {
  const [tab, setTab] = useState<Tab>("Refresh defaults");
  const [preferences, setPreferences] = useState<Preferences>({ ...defaults, ...initialPreferences });
  const [members, setMembers] = useState(team);
  const [saving, setSaving] = useState(false);
  const [savingMember, setSavingMember] = useState<number | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const activeAdmins = useMemo(() => members.filter((member) => member.role === "admin").length, [members]);

  async function savePreferences() {
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(preferences) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not save settings.");
      setNotice("Settings saved. Refresh frequency is stored as a preference; automatic checks are not connected yet.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save settings."); }
    finally { setSaving(false); }
  }

  async function changeRole(memberId: number, role: Role) {
    setSavingMember(memberId); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/team", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: memberId, role }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not update role.");
      setMembers((current) => current.map((item) => item.id === memberId ? { ...item, role } : item));
      setNotice("Team role updated.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update role."); }
    finally { setSavingMember(null); }
  }

  function updateReviewField(value: string) {
    setPreferences((current) => ({ ...current, reviewFields: current.reviewFields.includes(value) ? current.reviewFields.filter((field) => field !== value) : [...current.reviewFields, value] }));
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#e1f3ec] text-[#17634b]"><Settings2 className="h-7 w-7" aria-hidden /></span>
      <div><p className="text-sm font-semibold text-[#607169]">Home <span className="mx-1 text-[#9aa8a1]">/</span> Settings</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-[#172b35]">Admin settings</h1><p className="mt-1 text-sm text-[#596a63]">Control refresh behavior, review rules, and who can publish catalogue changes.</p></div>
    </div>
    <div className="flex gap-1 overflow-x-auto border-b border-[#d7e1dc]" role="tablist" aria-label="Admin settings sections">{tabs.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setError(""); setNotice(""); }} className={`shrink-0 border-b-[3px] px-3 py-3 text-sm font-semibold ${tab === item ? "border-[#12664f] text-[#10573f]" : "border-transparent text-[#64736c] hover:text-[#10573f]"}`}>{item}</button>)}</div>
    {notice && <p role="status" className="rounded-lg border border-[#b6ddc8] bg-[#eff8f2] px-4 py-3 text-sm text-[#175b3d]">{notice}</p>}
    {error && <p role="alert" className="rounded-lg border border-[#efc7bf] bg-[#fff3f0] px-4 py-3 text-sm text-[#9d382d]">{error}</p>}

    {tab === "Refresh defaults" && <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,1fr)]">
      <section className="rounded-xl border border-[#d8e1dd] bg-white p-5 shadow-sm sm:p-6" aria-labelledby="refresh-title"><div className="border-b border-[#e6ece9] pb-4"><h2 id="refresh-title" className="text-xl font-bold text-[#172b35]">Refresh defaults</h2><p className="mt-1 text-sm text-[#596a63]">Configure how often CareerBridge should check approved sources.</p></div>
        <div className="divide-y divide-[#e6ece9]">
          <label className={`${labelClass} flex items-center justify-between gap-5 py-4`}><span>Default refresh frequency<span className="mt-1 block text-xs font-normal text-[#687970]">Default preference for newly tracked sources.</span></span><span className="relative min-w-40"><select aria-label="Default refresh frequency" className={fieldClass + " mt-0 appearance-none pr-9"} value={preferences.refreshFrequency} onChange={(event) => setPreferences({ ...preferences, refreshFrequency: event.target.value })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="manual">Manual</option></select><ChevronDown className="pointer-events-none absolute right-3 top-3 h-4 w-4" /></span></label>
          <div className="flex items-center justify-between gap-5 py-4"><div><p className="text-sm font-semibold text-[#263b33]">Automatic refresh</p><p className="mt-1 text-xs text-[#687970]">Allow CareerBridge to check sources automatically.</p></div><label className="flex items-center gap-3 text-sm font-medium text-[#566a60]"><input type="checkbox" className="peer sr-only" checked={preferences.automaticRefresh} onChange={(event) => setPreferences({ ...preferences, automaticRefresh: event.target.checked })} /><span aria-hidden className={`relative h-7 w-12 rounded-full transition ${preferences.automaticRefresh ? "bg-[#14745a]" : "bg-[#b9c4bf]"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${preferences.automaticRefresh ? "left-6" : "left-1"}`} /></span>{preferences.automaticRefresh ? "Enabled" : "Disabled"}</label></div>
          <div className="py-4"><p className="text-sm font-semibold text-[#263b33]">Require review for</p><p className="mt-1 text-xs text-[#687970]">Selected high-impact fields should be checked before publishing.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{reviewOptions.map((field) => <label key={field} className="flex items-center gap-2 rounded-lg border border-[#e1e9e5] px-3 py-2.5 text-sm capitalize text-[#344e47]"><input type="checkbox" checked={preferences.reviewFields.includes(field)} onChange={() => updateReviewField(field)} className="h-4 w-4 accent-[#14745a]" />{field}</label>)}</div></div>
          <label className="flex items-center justify-between gap-5 py-4"><span className="text-sm font-semibold text-[#263b33]">Retain previous values<span className="mt-1 block text-xs font-normal text-[#687970]">Keep approved data if a source is temporarily unavailable.</span></span><input type="checkbox" checked={preferences.retainPreviousValues} onChange={(event) => setPreferences({ ...preferences, retainPreviousValues: event.target.checked })} className="h-5 w-5 accent-[#14745a]" aria-label="Retain previous values" /></label>
        </div><p className="mt-3 rounded-lg bg-[#f4f7f6] p-3 text-xs leading-relaxed text-[#5b6b64]">Refresh cadence is saved as an admin preference only. Automated fetching and scheduling are not connected; no source checks will run from this setting.</p>
      </section>
      <div className="space-y-5"><section className="rounded-xl border border-[#d8e1dd] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-[#172b35]">Team access</h2><p className="mt-1 max-w-xs text-sm text-[#596a63]">Manage existing accounts and their workspace role.</p></div><button type="button" onClick={() => setInviteOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e6a53] px-3 text-sm font-bold text-white hover:bg-[#0a5945]"><Plus className="h-4 w-4" />Invite admin</button></div>
        <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-[#f3f6f5] text-xs font-bold text-[#596a63]"><tr><th className="px-3 py-3">Name</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Permissions</th></tr></thead><tbody>{members.length ? members.map((member) => <tr key={member.id} className="border-b border-[#e9eeeb] last:border-0"><td className="px-3 py-3"><span className="block font-semibold text-[#263b33]">{member.name || member.email.split("@")[0]}</span><span className="mt-0.5 block text-xs text-[#687970]">{member.email}</span></td><td className="px-3 py-3"><select aria-label={`Role for ${member.name || member.email}`} className="max-w-40 rounded-md border border-[#d3ded8] bg-white px-2 py-2 text-xs font-semibold text-[#344e47]" value={roles.some(({ key }) => key === member.role) ? member.role : "viewer"} disabled={savingMember === member.id || (member.role === "admin" && activeAdmins <= 1)} onChange={(event) => changeRole(member.id, event.target.value as Role)}>{roles.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}</select>{member.role === "admin" && activeAdmins <= 1 && <span className="mt-1 block text-[11px] text-[#74837b]">Last administrator</span>}</td><td className="px-3 py-3 text-xs text-[#53665d]">{roles.find(({ key }) => key === member.role)?.permission ?? "Read-only access"}{savingMember === member.id && <LoaderCircle className="ml-2 inline h-3 w-3 animate-spin" />}</td></tr>) : <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-[#64736c]">No team accounts have been assigned a workspace role yet.</td></tr>}</tbody></table></div>
      </section><div className="flex items-start gap-3 rounded-xl border border-[#f0dfb8] bg-[#fff9ea] p-4"><span className="mt-0.5 text-[#b27b0a]"><AlertTriangle className="h-5 w-5" /></span><div><h3 className="text-sm font-bold text-[#342a16]">Changing permissions affects student-facing data.</h3><p className="mt-1 text-sm leading-relaxed text-[#6c5a36]">Only administrators can manage these settings. Invite delivery is not configured yet; existing accounts can be assigned roles here.</p></div></div></div>
      <div className="flex justify-end gap-3 xl:col-span-2"><button type="button" onClick={() => { setPreferences({ ...defaults, ...initialPreferences }); setNotice(""); setError(""); }} className="min-h-11 rounded-lg border border-[#cbd8d2] bg-white px-5 text-sm font-semibold text-[#344e47]">Reset changes</button><button type="button" onClick={savePreferences} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-5 text-sm font-bold text-white hover:bg-[#0a5945] disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? "Saving…" : "Save settings"}</button></div>
    </div>}

    {tab === "Review rules" && <section className="rounded-xl border border-[#d8e1dd] bg-white p-6 shadow-sm"><div className="flex items-start gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e1f3ec] text-[#17634b]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-[#172b35]">Publishing policy</h2><p className="mt-1 text-sm text-[#596a63]">Important content changes require approval before students see them.</p></div></div><div className="mt-5 rounded-lg bg-[#f4f7f6] p-4 text-sm leading-relaxed text-[#53665d]">Changes to key information such as eligibility, fees, deadlines, and course availability should be reviewed and approved by a verifier or administrator before publication to the student-facing catalogue.</div><div className="mt-5 grid gap-3 sm:grid-cols-2">{reviewOptions.map((field) => <label key={field} className="flex items-center gap-3 rounded-lg border border-[#e1e9e5] p-4 text-sm font-medium capitalize text-[#344e47]"><input type="checkbox" checked={preferences.reviewFields.includes(field)} onChange={() => updateReviewField(field)} className="h-4 w-4 accent-[#14745a]" />{field}</label>)}</div><div className="mt-5 flex justify-end"><button type="button" onClick={savePreferences} disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#0e6a53] px-5 text-sm font-bold text-white disabled:opacity-60">{saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Save review rules</button></div></section>}

    {tab === "Team access" && <section className="rounded-xl border border-[#d8e1dd] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-[#172b35]">Team access</h2><p className="mt-1 text-sm text-[#596a63]">Roles currently assigned to existing accounts.</p></div><button type="button" onClick={() => setInviteOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#0e6a53] px-3 text-sm font-bold text-white"><Plus className="h-4 w-4" />Invite admin</button></div><div className="mt-5 space-y-3">{members.map((member) => <div key={member.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e1e9e5] p-4"><div><p className="font-semibold text-[#263b33]">{member.name || member.email}</p><p className="text-xs text-[#687970]">{member.email}</p></div><select className="rounded-md border border-[#d3ded8] px-3 py-2 text-sm" value={roles.some(({ key }) => key === member.role) ? member.role : "viewer"} disabled={savingMember === member.id || (member.role === "admin" && activeAdmins <= 1)} onChange={(event) => changeRole(member.id, event.target.value as Role)} aria-label={`Role for ${member.email}`}>{roles.map((role) => <option key={role.key} value={role.key}>{role.label}</option>)}</select></div>)}</div></section>}

    {tab === "Audit and storage" && <div className="grid gap-5 md:grid-cols-2"><section className="rounded-xl border border-[#d8e1dd] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Clock3 className="h-5 w-5 text-[#17634b]" /><h2 className="text-lg font-bold text-[#172b35]">Audit history</h2></div><p className="mt-3 text-sm leading-relaxed text-[#596a63]">Administrative catalogue changes and review decisions are available in Change history. Settings preferences record their most recent editor and update time.</p><a href="/admin/change-history" className="mt-4 inline-flex text-sm font-bold text-[#145c42] underline">Open change history</a></section><section className="rounded-xl border border-[#d8e1dd] bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Database className="h-5 w-5 text-[#17634b]" /><h2 className="text-lg font-bold text-[#172b35]">Data retention</h2></div><p className="mt-3 text-sm leading-relaxed text-[#596a63]">Approved catalogue values remain available if a source is temporarily unavailable. The refresh scheduler, run log, and storage-retention controls are not connected.</p><p className="mt-4 rounded-lg bg-[#f4f7f6] p-3 text-xs text-[#53665d]">Settings last save is recorded in the database. Apply migration <code>0003_admin_workspace_settings.sql</code> to enable preference storage.</p></section></div>}

    {inviteOpen && <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-[#10251d]/45 p-4" onClick={() => setInviteOpen(false)}><section role="dialog" aria-modal="true" aria-labelledby="invite-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><h2 id="invite-title" className="text-xl font-bold text-[#172b35]">Invite an administrator</h2><p className="mt-3 text-sm leading-relaxed text-[#596a63]">Email invitations are not configured in this release. Create the account through the current sign-up flow, then assign its role from Team access.</p><div className="mt-5 flex justify-end"><button type="button" onClick={() => setInviteOpen(false)} className="min-h-10 rounded-lg bg-[#0e6a53] px-4 text-sm font-bold text-white">Got it</button></div></section></div>}
  </div>;
}
