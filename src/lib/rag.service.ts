import fs from 'fs/promises';
import path from 'path';

import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { PoolConfig } from 'pg';
import { z } from 'zod';

const PersonaResultSchema = z.object({
  narative: z.string(),
  bullets: z.string(),
  mixed: z.string(),
  quote: z.string(),
  full_name: z.string(),
});

const InternalLayerSchema = z.object({
  name: z.string(),
  description: z.string(),
  title: z.string(),
});

const ExternalLayerSchema = z.object({
  name: z.string(),
  description: z.string(),
  title: z.string(),
});

const PersonaTaxonomySchema = z.object({
  domain: z
    .object({
      key: z.string(),
      label: z.string(),
    })
    .required(),
  detail: z.string().default(''),
  internal: z.array(InternalLayerSchema),
  external: z.array(ExternalLayerSchema),
});

const PersonaOutputSchema = z.object({
  result: PersonaResultSchema,
  taxonomy: PersonaTaxonomySchema,
});

// ===== Config =====
const API_KEY = process.env.GEMINI_API_KEY; // do not hardcode
if (!API_KEY) throw new Error('Missing GEMINI_API_KEY in environment');

const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: API_KEY,
  model: 'text-embedding-004',
});

const DATABASE_URL = process.env.DATABASE_URL!;
let store: PGVectorStore | null = null;

// Single-file corpus (plaintext). Place it at project root.

async function ensureStore() {
  if (store) return store;
  store = await PGVectorStore.initialize(embeddings, {
    postgresConnectionOptions: { connectionString: DATABASE_URL } as PoolConfig,
    tableName: 'rag_embeddings',
    columns: {
      idColumnName: 'id',
      vectorColumnName: 'embedding',
      contentColumnName: 'content',
      metadataColumnName: 'metadata',
    },
  });
  return store;
}

function joinDocs(docs: Document[]) {
  return docs
    .map(
      (d, i) =>
        `[#${i + 1}] ${d.metadata?.source ?? d.metadata?.type ?? 'rag'}\n${d.pageContent}`,
    )
    .join('\n\n');
}

type RagFilters = {
  domain_key?: string;
  language_key?: 'en' | 'id';
  author_id?: number | string;
};

export async function runPersonaRAG(
  model: string,
  construct: string,
  opts?: {
    topK?: number;
    filters?: RagFilters;
    queryTerms?: string[];
    skipRAG?: boolean;
  },
) {
  const vs = await ensureStore();
  const topK = opts?.topK ?? 8;

  const query = [construct, ...(opts?.queryTerms ?? [])]
    .filter(Boolean)
    .join('\n\n');

  let docs: Document[] = [];
  if (!opts?.skipRAG && topK > 0) {
    let personal: Document[] = [];
    if (opts?.filters?.author_id) {
      personal = await vs.similaritySearch(
        query,
        Math.max(1, Math.floor(topK / 2)),
        {
          author_id: String(opts.filters.author_id),
          ...(opts.filters.domain_key
            ? { domain_key: opts.filters.domain_key }
            : {}),
          ...(opts.filters.language_key
            ? { language_key: opts.filters.language_key }
            : {}),
        },
      );
    }
    const remaining = topK - personal.length;
    const general =
      remaining > 0
        ? await vs.similaritySearch(query, remaining, {
            ...(opts?.filters?.domain_key
              ? { domain_key: opts.filters.domain_key }
              : {}),
            ...(opts?.filters?.language_key
              ? { language_key: opts.filters.language_key }
              : {}),
          })
        : [];
    docs = [...personal, ...general];
  }

  const context = docs.length ? `\n\n[Context]\n${joinDocs(docs)}` : '';
  const promptMd = await fs.readFile(
    path.join(process.cwd(), 'prompt.yaml'),
    'utf-8',
  );

  const finalPrompt = [
    promptMd.trim(),
    context,
    '\n\n[User Construct]\n',
    construct,
  ].join('');

  const llm = new ChatGoogleGenerativeAI({
    model,
    apiKey: API_KEY,
    cache: true,
  });
  return llm.withStructuredOutput(PersonaOutputSchema).invoke(finalPrompt);
}
