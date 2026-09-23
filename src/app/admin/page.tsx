import { Badge, Callout, Card, SectionHeading, VerificationBadge, formatDate } from "@/components/ui";
import { getCourses, getExams, getInstitutions, getOpportunities, getScholarships } from "@/services/catalog";
import { aiStatus } from "@/ai";
import { authProviderName } from "@/auth";
import { mapsConfigured } from "@/maps";
import { db } from "@/db";
import { dataImports, knowledgeChunks, knowledgeDocuments } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Data & verification" };

async function safeCount(table: "knowledge_documents" | "knowledge_chunks") {
  try {
    const rows =
      table === "knowledge_documents"
        ? await db.select({ n: sql<number>`count(*)::int` }).from(knowledgeDocuments)
        : await db.select({ n: sql<number>`count(*)::int` }).from(knowledgeChunks);
    return rows[0]?.n ?? 0;
  } catch {
    return 0;
  }
}

export default async function AdminPage() {
  const [institutions, courses, exams, scholarships, opportunities, docs, chunks] = await Promise.all([
    getInstitutions({}),
    getCourses({}),
    getExams(),
    getScholarships({}),
    getOpportunities({}),
    safeCount("knowledge_documents"),
    safeCount("knowledge_chunks"),
  ]);

  let imports: (typeof dataImports.$inferSelect)[] = [];
  try {
    imports = await db.select().from(dataImports).orderBy(sql`created_at desc`).limit(5);
  } catch {
    imports = [];
  }

  const statusCounts = institutions.reduce<Record<string, number>>((acc, i) => {
    acc[i.verificationStatus] = (acc[i.verificationStatus] ?? 0) + 1;
    return acc;
  }, {});

  const ai = aiStatus();

  return (
    <div className="cb-container py-12">
      <SectionHeading
        eyebrow="Administration"
        title="Data &amp; verification status"
        description="A read-only view of what the platform holds, where it came from, and what still needs verification. Editing tools sit on top of this same schema."
      />

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Institutions", value: institutions.length },
          { label: "Courses", value: courses.length },
          { label: "Entrance exams", value: exams.length },
          { label: "Scholarships", value: scholarships.length },
          { label: "Opportunities", value: opportunities.length },
          { label: "Knowledge documents", value: docs },
          { label: "Retrieval chunks", value: chunks },
          { label: "Districts covered", value: new Set(institutions.map((i) => i.district)).size },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-2xl font-semibold text-ink-900">{stat.value}</p>
            <p className="text-sm text-ink-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink-900">Verification breakdown — institutions</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {Object.entries(statusCounts).map(([status, count]) => (
              <li key={status} className="flex items-center justify-between gap-3">
                <VerificationBadge status={status} />
                <span className="text-ink-600">{count}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-500">
            Every institution row carries source_url, last_verified_at and a verification status, so the interface can
            distinguish current, recently verified, needs-verification and unavailable data.
          </p>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold text-ink-900">Platform configuration</h2>
          <ul className="mt-3 space-y-3 text-sm">
            <li className="flex items-center justify-between gap-3">
              <span className="text-ink-600">Authentication provider</span>
              <Badge tone={authProviderName() === "clerk" ? "forest" : "neutral"}>{authProviderName()}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-ink-600">AI provider</span>
              <Badge tone={ai.configured ? "forest" : "neutral"}>{ai.provider}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-ink-600">Google Maps Platform</span>
              <Badge tone={mapsConfigured() ? "forest" : "neutral"}>{mapsConfigured() ? "configured" : "not configured"}</Badge>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="text-ink-600">Retrieval store</span>
              <Badge tone="forest">postgres + hashed embeddings</Badge>
            </li>
          </ul>
          <p className="mt-4 text-xs text-ink-500">
            Providers are behind interfaces (AIProvider, EmbeddingProvider, auth module), so swapping any of them is a
            configuration change rather than a rewrite.
          </p>
        </Card>
      </div>

      <Card className="mt-4 p-6">
        <h2 className="text-base font-semibold text-ink-900">Recent data imports</h2>
        {imports.length ? (
          <ul className="mt-3 space-y-3 text-sm">
            {imports.map((entry) => (
              <li key={entry.id} className="rounded-lg border border-ink-100 p-3">
                <p className="font-medium text-ink-800">{entry.datasetLabel}</p>
                <p className="text-xs text-ink-500">
                  {entry.recordCount} records · {entry.fileName} · {formatDate(entry.createdAt)}
                </p>
                {entry.notes ? <p className="mt-1 text-xs text-ink-500">{entry.notes}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-ink-500">No import has been recorded yet.</p>
        )}
      </Card>

      <div className="mt-8 max-w-3xl">
        <Callout tone="amber" title="V1 dataset honesty">
          <p>
            The institution catalogue is a clearly labelled sample dataset used to demonstrate the CSV/Excel → Postgres
            import pipeline. It intentionally contains no fees, seat counts, deadlines or admission dates. Those fields
            are populated only from an official source, together with a source URL and retrieval timestamp.
          </p>
        </Callout>
      </div>
    </div>
  );
}
