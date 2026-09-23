import Link from "next/link";
import { ArrowRight, BarChart3, BookOpenCheck, Building2, CheckCircle2, ClipboardList, CloudUpload, Eye, FileCheck2, Gift, HelpCircle, Home, Landmark, MoreVertical, Settings, ShieldCheck, UploadCloud } from "lucide-react";
import { Badge, Callout, Card, VerificationBadge, formatDate } from "@/components/ui";
import { getCourses, getExams, getInstitutions, getOpportunities, getScholarships } from "@/services/catalog";
import { aiStatus } from "@/ai";
import { authProviderName } from "@/auth";
import { mapsConfigured } from "@/maps";
import { db } from "@/db";
import { dataImports, knowledgeChunks, knowledgeDocuments } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin dashboard" };

async function safeCount(table: "knowledge_documents" | "knowledge_chunks") {
  try {
    const rows = table === "knowledge_documents" ? await db.select({ n: sql<number>`count(*)::int` }).from(knowledgeDocuments) : await db.select({ n: sql<number>`count(*)::int` }).from(knowledgeChunks);
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

const navItems = [
  { label: "Dashboard", href: "/admin", icon: Home },
  { label: "Imports", href: "/admin?view=imports", icon: CloudUpload },
  { label: "Institutions", href: "/institutions", icon: Landmark },
  { label: "Entrance tests", href: "/exams", icon: ClipboardList },
  { label: "Scholarships", href: "/scholarships", icon: Gift },
  { label: "Audit log", href: "/admin?view=audit", icon: FileCheck2 },
  { label: "Settings", href: "/admin?view=settings", icon: Settings },
];

export default async function AdminPage() {
  const [institutions, courses, exams, scholarships, opportunities, docs, chunks] = await Promise.all([getInstitutions({}), getCourses({}), getExams(), getScholarships({}), getOpportunities({}), safeCount("knowledge_documents"), safeCount("knowledge_chunks")]);
  let imports: (typeof dataImports.$inferSelect)[] = [];
  try {
    imports = await db.select().from(dataImports).orderBy(sql`created_at desc`).limit(5);
  } catch {
    imports = [];
  }
  const statusCounts = institutions.reduce<Record<string, number>>((acc, institution) => { acc[institution.verificationStatus] = (acc[institution.verificationStatus] ?? 0) + 1; return acc; }, {});
  const verified = Object.entries(statusCounts).filter(([status]) => ["verified", "current", "recently_verified"].includes(status)).reduce((sum, [, count]) => sum + count, 0);
  const needsReview = Object.entries(statusCounts).filter(([status]) => status.includes("verification") || status.includes("review")).reduce((sum, [, count]) => sum + count, 0);
  const imported = Math.max(institutions.length - verified - needsReview, 0);
  const total = Math.max(institutions.length, 1);
  const verifiedPct = Math.round((verified / total) * 1000) / 10;
  const ai = aiStatus();
  const stats = [
    { label: "Institutions", value: institutions.length, note: "Active in catalogue", icon: Building2, tone: "bg-[#e8f6f0] text-[#287f68]" },
    { label: "Entrance tests", value: exams.length, note: "Active in catalogue", icon: ClipboardList, tone: "bg-[#f0eaff] text-[#7054b2]" },
    { label: "Scholarships", value: scholarships.length, note: "Active in catalogue", icon: Gift, tone: "bg-[#e8f6f0] text-[#287f68]" },
    { label: "Imports awaiting review", value: imports.length, note: "Requires your attention", icon: UploadCloud, tone: "bg-[#eaf3ff] text-[#3f70b1]" },
  ];

  return <div className="min-h-screen bg-[#fbfcfe] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
    <aside className="hidden border-r border-[#e1e8f0] bg-[#f7f9fc] lg:flex lg:min-h-screen lg:flex-col lg:justify-between"><div><div className="flex h-20 items-center gap-2 border-b border-[#e1e8f0] px-6"><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#4e9ee9] text-xl font-black italic text-white">A</span><span className="text-xl font-semibold tracking-[-0.04em] text-[#182f56]">CareerBridge <em className="font-medium not-italic text-[#4b9d7f]">Admin</em></span></div><nav className="space-y-1 px-4 py-6" aria-label="Admin navigation">{navItems.map(({ label, href, icon: Icon }, index) => <Link key={label} href={href} className={`flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition ${index === 0 ? "bg-[#e8f6f0] text-[#287f68]" : "text-[#284263] hover:bg-white hover:text-[#287f68]"}`}><Icon className="h-5 w-5" />{label}</Link>)}</nav></div><div className="m-5 rounded-2xl border border-[#d3eee4] bg-[#eaf8f3] p-5"><div className="flex items-center gap-3"><HelpCircle className="h-6 w-6 text-[#3c9678]" /><p className="font-semibold text-[#234f46]">Need help?</p></div><Link href="/about" className="mt-3 block text-sm font-medium text-[#2870aa] underline underline-offset-2">Talk to support <ArrowRight className="ml-1 inline h-3.5 w-3.5" /></Link></div></aside>
    <main className="min-w-0 overflow-hidden"><header className="flex h-20 items-center justify-between border-b border-[#e1e8f0] bg-white px-5 sm:px-8 lg:px-10"><div className="flex items-center gap-3 text-sm font-semibold text-[#243b5b]"><span className="lg:hidden grid h-8 w-8 place-items-center rounded-md bg-[#4e9ee9] text-sm font-black italic text-white">A</span>Nagaland catalogue<span className="text-ink-400">⌄</span></div><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#f0eaff] text-sm font-semibold text-[#7054b2]">AR</span><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-[#243b5b]">Aarav Rao</p><p className="text-xs text-ink-500">Admin</p></div><span className="text-ink-400">⌄</span></div></header>
      <div className="px-5 py-8 sm:px-8 lg:px-10 lg:py-12"><div className="mx-auto max-w-[1500px]"><div className="flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#071533] sm:text-5xl">Keep the catalogue trustworthy.</h1><p className="mt-3 text-lg text-ink-500">Review, approve and maintain the information students use.</p></div><div className="hidden items-center gap-2 rounded-full bg-[#edf5ff] px-4 py-2 text-sm font-medium text-[#3f70b1] lg:flex"><BarChart3 className="h-4 w-4" />{courses.length + opportunities.length} learning records</div></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(({ label, value, note, icon: Icon, tone }) => <Card key={label} className="p-5"><div className="flex items-start gap-4"><span className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${tone}`}><Icon className="h-6 w-6" /></span><div><p className="text-3xl font-semibold text-[#1d765f]">{value}</p><p className="mt-1 font-semibold text-[#172b49]">{label}</p><p className="mt-2 text-sm text-ink-500">{note}</p></div></div></Card>)}</div>
        <div className="mt-7 flex flex-wrap gap-3"><Link href="/admin?view=imports" className="inline-flex items-center gap-2 rounded-lg bg-[#2f9b76] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#287f68]"><UploadCloud className="h-4 w-4" />Upload workbook</Link><Link href="/institutions" className="inline-flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-[#243b5b] transition hover:border-[#8fb8d8]"><Eye className="h-4 w-4" />View catalogue</Link></div>
        <div className="mt-7 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.7fr)]"><Card className="overflow-hidden p-0"><div className="flex items-center justify-between border-b border-ink-100 px-5 py-4"><div><h2 className="font-semibold text-[#172b49]">Recent imports</h2><p className="mt-1 text-xs text-ink-500">Review the latest catalogue workbooks.</p></div><Link href="/admin?view=imports" className="text-sm font-medium text-[#2870aa] hover:underline">View all imports <ArrowRight className="ml-1 inline h-4 w-4" /></Link></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f8fafc] text-xs text-ink-500"><tr><th className="px-5 py-3 font-medium">Dataset</th><th className="px-5 py-3 font-medium">File</th><th className="px-5 py-3 font-medium">Rows</th><th className="px-5 py-3 font-medium">Status</th><th className="px-5 py-3 font-medium">Last reviewed</th><th className="px-5 py-3 font-medium">Actions</th></tr></thead><tbody>{imports.length ? imports.map((entry) => <tr key={entry.id} className="border-t border-ink-100"><td className="px-5 py-4 font-medium text-[#243b5b]">{entry.datasetLabel}</td><td className="px-5 py-4 text-ink-600">{entry.fileName ?? "Workbook"}</td><td className="px-5 py-4 text-ink-600">{entry.recordCount}</td><td className="px-5 py-4"><Badge tone="neutral">Imported</Badge></td><td className="px-5 py-4 text-ink-500">—</td><td className="px-5 py-4"><Link href={`/admin?review=${entry.id}`} className="rounded-md border border-ink-200 px-3 py-1.5 text-xs font-medium text-[#243b5b] hover:border-[#7ca8d0]">Review</Link><MoreVertical className="ml-2 inline h-4 w-4 text-ink-400" /></td></tr>) : <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-ink-500">No imports have been recorded yet. Upload a workbook to start a review queue.</td></tr>}</tbody></table></div></Card><Card className="p-6"><h2 className="font-semibold text-[#172b49]">Catalogue trust</h2><p className="mt-2 text-sm leading-relaxed text-ink-500">Overview of the verification status across the Nagaland catalogue.</p><div className="mt-6 flex items-center gap-5"><div className="grid h-36 w-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#2f9b76 0 ${verifiedPct}%, #f1bf4a ${verifiedPct}% ${Math.min(verifiedPct + (needsReview / total) * 100, 100)}%, #4f9adb ${Math.min(verifiedPct + (needsReview / total) * 100, 100)}% 100%)` }}><div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center"><span className="text-xl font-semibold text-[#172b49]">{verifiedPct}%</span><span className="text-[10px] text-ink-500">verified</span></div></div><ul className="space-y-3 text-sm">{Object.entries(statusCounts).slice(0, 4).map(([status, count]) => <li key={status} className="flex items-center justify-between gap-4"><span className="flex items-center gap-2 text-ink-600"><span className="h-2.5 w-2.5 rounded-full bg-[#2f9b76]" />{status.replaceAll("_", " ")}</span><span className="font-semibold text-[#172b49]">{count}</span></li>)}{!Object.keys(statusCounts).length ? <li className="text-ink-500">No verification data yet.</li> : null}</ul></div><div className="mt-6 flex gap-3 rounded-xl bg-[#eef8f5] p-4"><ShieldCheck className="h-6 w-6 shrink-0 text-[#2f9b76]" /><div><p className="font-semibold text-[#234f46]">Trust drives impact</p><p className="mt-1 text-sm leading-relaxed text-ink-600">Keeping data accurate ensures students can make confident decisions.</p></div></div></Card></div>
        <div className="mt-6 grid gap-6 lg:grid-cols-2"><Card className="p-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-[#172b49]">Platform configuration</h2><Settings className="h-5 w-5 text-ink-400" /></div><ul className="mt-4 space-y-3 text-sm"><li className="flex justify-between gap-3"><span className="text-ink-600">Authentication provider</span><Badge tone={authProviderName() === "clerk" ? "forest" : "neutral"}>{authProviderName()}</Badge></li><li className="flex justify-between gap-3"><span className="text-ink-600">AI provider</span><Badge tone={ai.configured ? "forest" : "neutral"}>{ai.provider}</Badge></li><li className="flex justify-between gap-3"><span className="text-ink-600">Google Maps Platform</span><Badge tone={mapsConfigured() ? "forest" : "neutral"}>{mapsConfigured() ? "configured" : "not configured"}</Badge></li><li className="flex justify-between gap-3"><span className="text-ink-600">Retrieval store</span><Badge tone="forest">postgres + hashed embeddings</Badge></li></ul></Card><Card className="p-6"><div className="flex items-center gap-3"><BookOpenCheck className="h-5 w-5 text-[#3f70b1]" /><h2 className="font-semibold text-[#172b49]">Data coverage</h2></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-2xl font-semibold text-[#172b49]">{docs}</p><p className="text-ink-500">Knowledge documents</p></div><div><p className="text-2xl font-semibold text-[#172b49]">{chunks}</p><p className="text-ink-500">Retrieval chunks</p></div><div><p className="text-2xl font-semibold text-[#172b49]">{opportunities.length}</p><p className="text-ink-500">Opportunities</p></div><div><p className="text-2xl font-semibold text-[#172b49]">{new Set(institutions.map((institution) => institution.district)).size}</p><p className="text-ink-500">Districts covered</p></div></div></Card></div>
        <div className="mt-6"><Callout tone="amber" title="V1 dataset honesty"><p>The institution catalogue is a clearly labelled sample dataset used to demonstrate the import pipeline. Fees, seat counts, deadlines and admission dates are populated only from official sources with a source URL and retrieval timestamp.</p></Callout></div>
      </div></div>
    </main>
  </div>;
}
