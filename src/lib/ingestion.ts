import prisma from '@db';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import type { Prisma } from '@prisma/client';
import { Pool, PoolConfig } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: GEMINI_API_KEY,
  model: 'text-embedding-004',
});

let pool: Pool | null = null;
function getPg() {
  if (!pool) pool = new Pool({ connectionString: DATABASE_URL });
  return pool;
}

async function getVectorStore() {
  return PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: {
      connectionString: DATABASE_URL,
    } as PoolConfig,
    tableName: 'rag_embeddings',
    // Map PGVectorStore to existing table column names
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  });
}

export type ContributionPayload = {
  text: string;
  type: 'survey' | 'interview' | 'review' | 'doc';
  domain_key?: string;
  language_key?: 'en' | 'id';
  author_id?: number | string | bigint | null;
  source?: string;
  extra?: Prisma.InputJsonValue;
  visibility?: 'public' | 'private';
};

// CREATE
export async function ingestContribution(payload: ContributionPayload) {
  // 1) Simpan raw dokumen ke rag_documents
  const doc = await prisma.rag_documents.create({
    data: {
      text: payload.text,
      type: payload.type,
      domain_key: payload.domain_key ?? null,
      language_key: payload.language_key ?? null,
      author_id: payload.author_id ? BigInt(String(payload.author_id)) : null,
      source: payload.source ?? null,
      metadata: payload.extra ?? ({} as Prisma.InputJsonValue),
      visibility: payload.visibility ?? 'private',
    },
    select: { id: true },
  });

  // 2) Chunk + embed ke rag_embeddings dengan metadata membawa doc_id
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  const extraObject =
    payload.extra &&
    typeof payload.extra === 'object' &&
    !Array.isArray(payload.extra)
      ? (payload.extra as Record<string, unknown>)
      : {};

  const baseMeta = {
    doc_id: String(doc.id),
    type: payload.type,
    domain_key: payload.domain_key,
    language_key: payload.language_key,
    author_id: payload.author_id ? String(payload.author_id) : null,
    source: payload.source ?? 'contribution',
    visibility:
      (extraObject.visibility as 'public' | 'private' | undefined) ??
      payload.visibility ??
      'private',
    ...extraObject,
  } as Record<string, unknown>;

  const docs = (
    await splitter.splitDocuments([
      new Document({ pageContent: payload.text, metadata: baseMeta }),
    ])
  ).map((d, idx) => {
    d.metadata = { ...baseMeta, chunk_index: idx };
    return d;
  });

  const store = await getVectorStore();
  await store.addDocuments(docs);

  return { id: doc.id, chunks: docs.length };
}

// READ: list contributions milik user (pagination sederhana)
export async function listUserContributions(
  authorId: number | string | bigint,
  opts?: { limit?: number; cursor?: number },
) {
  const limit = Math.min(Math.max(opts?.limit ?? 20, 1), 100);
  const cursor = opts?.cursor;
  const where = { author_id: BigInt(String(authorId)) } as const;
  const items = await prisma.rag_documents.findMany({
    where,
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { id: 'asc' },
    select: {
      id: true,
      type: true,
      domain_key: true,
      language_key: true,
      source: true,
      metadata: true,
      created_at: true,
    },
  });
  const nextCursor = items.length === limit ? items[items.length - 1].id : null;
  return { items, nextCursor };
}

// READ: detail milik user
export async function getUserContribution(
  authorId: number | string | bigint,
  id: number,
) {
  const row = await prisma.rag_documents.findFirst({
    where: { id, author_id: BigInt(String(authorId)) },
  });
  return row ?? null;
}

// UPDATE: edit raw + re-embed ulang
export async function updateContribution(
  authorId: number | string | bigint,
  id: number,
  data: Partial<ContributionPayload>,
) {
  // pastikan pemilik
  const existing = await prisma.rag_documents.findFirst({
    where: { id, author_id: BigInt(String(authorId)) },
  });
  if (!existing) throw new Error('not_found');

  const newRaw = data.text ?? existing.text;
  const newType =
    (data.type as ContributionPayload['type']) ??
    (existing.type as ContributionPayload['type']);
  const newDomain = data.domain_key ?? existing.domain_key ?? undefined;
  const newLang =
    (data.language_key as 'en' | 'id' | undefined) ??
    (existing.language_key as 'en' | 'id' | undefined);
  const newSource = data.source ?? existing.source ?? undefined;
  const extra =
    data.extra ?? (existing.metadata as unknown as Prisma.InputJsonValue);

  // update row
  await prisma.rag_documents.update({
    where: { id },
    data: {
      text: newRaw,
      type: newType,
      domain_key: newDomain,
      language_key: newLang,
      source: newSource,
      metadata: extra,
      visibility: data.visibility ?? existing.visibility,
    },
  });

  // hapus embeddings lama
  await getPg().query(
    "DELETE FROM rag_embeddings WHERE metadata->>'doc_id' = $1",
    [String(id)],
  );

  // embed ulang
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });

  const extraObject =
    extra && typeof extra === 'object' && !Array.isArray(extra)
      ? (extra as Record<string, unknown>)
      : {};

  const baseMeta = {
    doc_id: String(id),
    type: newType,
    domain_key: newDomain,
    language_key: newLang,
    author_id: String(authorId),
    source: newSource ?? 'contribution',
    visibility:
      (extraObject.visibility as 'public' | 'private' | undefined) ??
      (existing.visibility as 'public' | 'private'),
    ...extraObject,
  } as Record<string, unknown>;

  const docs = (
    await splitter.splitDocuments([
      new Document({ pageContent: newRaw, metadata: baseMeta }),
    ])
  ).map((d, idx) => {
    d.metadata = { ...baseMeta, chunk_index: idx };
    return d;
  });

  const store = await getVectorStore();
  await store.addDocuments(docs);

  return { id, chunks: docs.length };
}

// DELETE: hapus raw + embeddings
export async function deleteContribution(
  authorId: number | string | bigint,
  id: number,
) {
  const existing = await prisma.rag_documents.findFirst({
    where: { id, author_id: BigInt(String(authorId)) },
    select: { id: true },
  });
  if (!existing) throw new Error('not_found');

  await getPg().query(
    "DELETE FROM rag_embeddings WHERE metadata->>'doc_id' = $1",
    [String(id)],
  );
  await prisma.rag_documents.delete({ where: { id } });

  return { id };
}
