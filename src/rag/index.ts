/**
 * Retrieval layer.
 * -----------------------------------------------------------------------------
 * Pipeline: trusted source -> document -> cleaning -> chunking -> embedding ->
 * vector store -> retrieval -> mentor answer with citations.
 *
 * The vector store is Postgres. Embeddings use a deterministic hashed
 * bag-of-words representation so retrieval works with zero external services;
 * `EmbeddingProvider` is an interface, so a hosted embedding model (or pgvector)
 * can replace it without touching callers.
 */
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { knowledgeChunks, knowledgeDocuments } from "@/db/schema";

export const EMBEDDING_DIM = 256;

export interface EmbeddingProvider {
  readonly name: string;
  embed(texts: string[]): Promise<number[][]>;
}

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "for", "on", "is", "are", "be", "with", "that", "this",
  "it", "as", "at", "by", "from", "you", "your", "i", "we", "they", "not", "but", "can", "will", "if",
  "do", "does", "what", "which", "how", "should", "my", "me", "about", "into", "than", "then", "there",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s.+-]/g, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.+-]+|[.+-]+$/g, ""))
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function hashToken(token: string): number {
  let h = 2166136261;
  for (let i = 0; i < token.length; i += 1) {
    h ^= token.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % EMBEDDING_DIM;
}

/** Local, deterministic embedding — no network required. */
export class HashingEmbeddingProvider implements EmbeddingProvider {
  readonly name = "hashing-local";

  async embed(texts: string[]): Promise<number[][]> {
    return texts.map((text) => {
      const vector = new Array<number>(EMBEDDING_DIM).fill(0);
      const tokens = tokenize(text);
      for (const token of tokens) {
        vector[hashToken(token)] += 1;
        if (token.length > 5) vector[hashToken(token.slice(0, 5))] += 0.5;
      }
      const norm = Math.sqrt(vector.reduce((acc, v) => acc + v * v, 0)) || 1;
      return vector.map((v) => v / norm);
    });
  }
}

export function getEmbeddingProvider(): EmbeddingProvider {
  // Future: return a hosted provider when an embeddings API key is configured.
  return new HashingEmbeddingProvider();
}

export function cosine(a: number[], b: number[]): number {
  let dot = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) dot += a[i] * b[i];
  return dot;
}

/** Splits a cleaned document into overlapping, sentence-aware chunks. */
export function chunkText(text: string, targetWords = 90, overlapWords = 20): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current: string[] = [];
  let count = 0;
  for (const sentence of sentences) {
    const words = sentence.split(" ");
    current.push(sentence);
    count += words.length;
    if (count >= targetWords) {
      chunks.push(current.join(" "));
      const tail = current.join(" ").split(" ").slice(-overlapWords).join(" ");
      current = tail ? [tail] : [];
      count = current.join(" ").split(" ").length;
    }
  }
  if (current.length) chunks.push(current.join(" "));
  return chunks.filter((c) => c.trim().length > 40);
}

export type RetrievedChunk = {
  content: string;
  score: number;
  documentSlug: string;
  title: string;
  sourceType: string;
  sourceUrl: string | null;
  verificationStatus: string;
  retrievedAt: Date | null;
  scopeType: string | null;
  scopeRef: string | null;
};

export type RetrieveOptions = {
  limit?: number;
  scopeRefs?: string[];
  minScore?: number;
};

/**
 * Hybrid retrieval: keyword pre-filter in SQL, then vector re-ranking in
 * process. Returns [] when the store is empty or unavailable — callers must
 * then tell the student that nothing verified was found.
 */
export async function retrieve(query: string, options: RetrieveOptions = {}): Promise<RetrievedChunk[]> {
  const limit = options.limit ?? 5;
  const minScore = options.minScore ?? 0.08;
  const tokens = tokenize(query).slice(0, 12);
  if (!tokens.length) return [];

  try {
    const provider = getEmbeddingProvider();
    const [queryVector] = await provider.embed([query]);

    const rows = await db
      .select({
        content: knowledgeChunks.content,
        embedding: knowledgeChunks.embedding,
        documentSlug: knowledgeChunks.documentSlug,
        title: knowledgeDocuments.title,
        sourceType: knowledgeDocuments.sourceType,
        sourceUrl: knowledgeDocuments.sourceUrl,
        verificationStatus: knowledgeDocuments.verificationStatus,
        retrievedAt: knowledgeDocuments.retrievedAt,
        scopeType: knowledgeDocuments.scopeType,
        scopeRef: knowledgeDocuments.scopeRef,
      })
      .from(knowledgeChunks)
      .innerJoin(knowledgeDocuments, sql`${knowledgeDocuments.slug} = ${knowledgeChunks.documentSlug}`)
      .limit(4000);

    const scoped = options.scopeRefs?.length
      ? rows.filter((r) => (r.scopeRef ? options.scopeRefs!.includes(r.scopeRef) : false))
      : rows;
    const pool = scoped.length ? scoped : rows;

    const scored = pool.map((row) => {
      const vectorScore = cosine(queryVector, (row.embedding as number[]) ?? []);
      const lower = row.content.toLowerCase();
      const keywordHits = tokens.filter((t) => lower.includes(t)).length / tokens.length;
      const titleHits = tokens.filter((t) => row.title.toLowerCase().includes(t)).length / tokens.length;
      return { row, score: vectorScore * 0.6 + keywordHits * 0.3 + titleHits * 0.1 };
    });

    return scored
      .filter((s) => s.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => ({
        content: s.row.content,
        score: Number(s.score.toFixed(4)),
        documentSlug: s.row.documentSlug,
        title: s.row.title,
        sourceType: s.row.sourceType,
        sourceUrl: s.row.sourceUrl,
        verificationStatus: s.row.verificationStatus,
        retrievedAt: s.row.retrievedAt,
        scopeType: s.row.scopeType,
        scopeRef: s.row.scopeRef,
      }));
  } catch {
    return [];
  }
}

export function citationsFrom(chunks: RetrievedChunk[]) {
  const seen = new Set<string>();
  const citations: { title: string; url?: string | null; sourceType: string; retrievedAt?: string | null }[] = [];
  for (const chunk of chunks) {
    if (seen.has(chunk.documentSlug)) continue;
    seen.add(chunk.documentSlug);
    citations.push({
      title: chunk.title,
      url: chunk.sourceUrl,
      sourceType: chunk.sourceType,
      retrievedAt: chunk.retrievedAt ? chunk.retrievedAt.toISOString() : null,
    });
  }
  return citations;
}
