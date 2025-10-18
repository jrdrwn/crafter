import fs from 'fs/promises';
import path from 'path';

import {
  ChatGoogleGenerativeAI,
  GoogleGenerativeAIEmbeddings,
} from '@langchain/google-genai';
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { z } from 'zod';

const PersonaResultSchema = z.object({
  narative: z.string(),
  bullets: z.string(),
  mixed: z.string(),
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
  domain: z.string(),
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
if (!API_KEY) throw new Error('Missing GOOGLE_API_KEY in environment');

const llm = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash-lite',
  apiKey: API_KEY,
  cache: true,
});
const embeddings = new GoogleGenerativeAIEmbeddings({
  apiKey: API_KEY,
  model: 'text-embedding-004',
});

// Single-file corpus (plaintext). Place it at project root.
const CORPUS_FILE = path.resolve(process.cwd(), 'persona_refs.txt');
let store: MemoryVectorStore | null = null;

async function ensureStore() {
  if (store) return store;
  const raw = await fs.readFile(CORPUS_FILE, 'utf-8').catch(() => '');
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 150,
  });
  const chunks = await splitter.splitDocuments([
    new Document({
      pageContent: raw,
      metadata: { source: 'persona_refs.txt' },
    }),
  ]);
  store = await MemoryVectorStore.fromDocuments(chunks, embeddings);
  return store;
}

function joinDocs(docs: Document[]) {
  return docs
    .map((d, i) => `[#${i + 1}] ${d.metadata?.source}\n${d.pageContent}`)
    .join('\n\n');
}

export async function runPersonaRAG(topK = 8) {
  const vs = await ensureStore();
  const retriever = vs.asRetriever(topK);
  const docs = null; // await retriever.invoke('anna'); // TODO: nanti pake detail dari user
  const context = null; // joinDocs(docs);

  const promptMd = await fs.readFile('./prompt.yaml', 'utf-8');
  const finalPrompt = context ? `${promptMd}` : promptMd;

  return llm.withStructuredOutput(PersonaOutputSchema).invoke(finalPrompt);
}

export async function generatePersona() {
  return runPersonaRAG(8);
}
