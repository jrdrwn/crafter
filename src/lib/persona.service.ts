import fs from 'fs/promises';
import path from 'path';

import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { Document } from '@langchain/core/documents';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
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

export type RagFilters = {
  domain_key?: string;
  language_key?: 'en' | 'id';
  author_id?: number | string;
};

export async function normalizeToRAGNote(
  rawText: string,
  meta?: {
    language?: 'en' | 'id';
    domain?: string;
    source?: string;
    filename?: string;
    format?: string;
  },
) {
  const lang = meta?.language ?? 'en';
  const llm = new ChatGoogleGenerativeAI({
    model: 'gemini-2.5-flash',
    apiKey: process.env.GEMINI_RAG_API_KEY!,
    temperature: 0.2,
    cache: true,
  });

  const sys =
    lang === 'id'
      ? `Anda adalah asisten pembersihan data. Normalisasikan konten yang diberikan pengguna menjadi catatan pengetahuan RAG yang konsisten dalam format Markdown. Pastikan fakta tetap akurat. Jika input berupa data tabel (CSV/Excel), ubah menjadi tabel Markdown yang rapi dan sertakan ringkasan singkat.

Keluaran HARUS mengikuti struktur Markdown berikut:

# Judul

- Sumber: <sumber atau nama file>
- Domain: <domain atau ->
- Bahasa: <id|en>
- Format: <format>

## Ringkasan
<3-6 poin penting yang merangkum konten>

## Wawasan Utama
- <poin>
- <poin>

## Detail
<paragraf yang sudah dibersihkan atau tabel>

Jangan tambahkan komentar tambahan.`
      : `You are a data cleaning assistant. Normalize messy user-provided content into a consistent RAG knowledge note in Markdown. Keep facts faithful. If the input is tabular (CSV/Excel), convert to a clean Markdown table and include a short summary.

Output strictly in this Markdown structure:

# Title

- Source: <source or filename>
- Domain: <domain or ->
- Language: <en|id>
- Format: <format>

## Summary
<3-6 bullet points summarizing the content>

## Key Insights
- <bullet>
- <bullet>

## Details
<cleaned paragraphs or table>

Do not add extra commentary.`;

  const user = [
    `Filename: ${meta?.filename ?? '-'}\nFormat: ${meta?.format ?? '-'}\nDomain: ${meta?.domain ?? '-'}\nSource: ${meta?.source ?? '-'}\nLanguage: ${lang}`,
    '',
    'Content:',
    rawText.slice(0, 120000), // safety cap
  ].join('\n');

  const res = await llm.invoke([
    { role: 'system', content: sys },
    { role: 'user', content: user },
  ]);
  const content = res?.content as unknown;
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (Array.isArray(content)) {
    type Part = string | { text?: string };
    const parts = content as Part[];
    text = parts
      .map((p) => (typeof p === 'string' ? p : (p.text ?? '')))
      .join('\n');
  }
  return text.trim() || rawText;
}

export async function runPersonaRAG(
  model: string,
  construct: string,
  opts?: {
    topK?: number;
    filters?: RagFilters;
    queryTerms?: string[];
    skipRAG?: boolean;
    contentLengthRange?: number[];
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
          // No visibility filter here so the author can see both private and public of their own
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
            visibility: 'public', // only public docs are visible to everyone
          })
        : [];
    docs = [...personal, ...general];
  }

  const langKey = opts?.filters?.language_key;

  const systemMessage = await fs.readFile(
    path.join(process.cwd(), `prompt/${langKey}/system/system_message.txt`),
    'utf-8',
  );

  const task = await fs.readFile(
    path.join(process.cwd(), `prompt/${langKey}/user/task_instruction.txt`),
    'utf-8',
  );

  const outputSpec = await fs.readFile(
    path.join(
      process.cwd(),
      `prompt/${langKey}/user/output_specifications.txt`,
    ),
    'utf-8',
  );
  const personaFormat = await fs.readFile(
    path.join(process.cwd(), `prompt/${langKey}/user/persona_format.txt`),
    'utf-8',
  );
  const contextTitle = await fs.readFile(
    path.join(process.cwd(), `prompt/${langKey}/user/context_title.txt`),
    'utf-8',
  );
  const contructTitle = await fs.readFile(
    path.join(process.cwd(), `prompt/${langKey}/user/construct_title.txt`),
    'utf-8',
  );

  const contentLengthRangePrompt =
    langKey === 'id'
      ? `Sesuaikan panjang persona sesuai dengan rentang jumlah kata berikut untuk mixed, narative, dan bullets: minimal ${opts?.contentLengthRange?.[0] ?? 0} kata dan maksimal ${opts?.contentLengthRange?.[1] ?? 1000} kata.`
      : `Additional Instruction: Adjust the persona length according to the following word count range for mixed, narative, and bullets: minimum ${opts?.contentLengthRange?.[0] ?? 0} words and maximum ${opts?.contentLengthRange?.[1] ?? 1000} words.`;

  const context = docs.length ? `\n\n${contextTitle}\n${joinDocs(docs)}` : '';
  const finalPrompt = [
    new SystemMessage(systemMessage),
    new HumanMessage(task),
    new HumanMessage(contentLengthRangePrompt),
    new HumanMessage(outputSpec),
    new HumanMessage(personaFormat),
    new HumanMessage(context),
    new HumanMessage(`${contructTitle}\n\n${construct}`),
  ];

  const llm = new ChatGoogleGenerativeAI({
    model,
    apiKey: API_KEY,
    cache: true,
  });
  return llm.withStructuredOutput(PersonaOutputSchema).invoke(finalPrompt);
}
