/**
 * @jest-environment node
 */
// ─── Env vars harus di-set SEBELUM modul diimport ────────────────────────────
process.env.GEMINI_API_KEY = 'test-key';
process.env.GEMINI_RAG_API_KEY = 'test-rag-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// ─── Stable mocks menggunakan 'var' agar bisa diakses di dalam jest.mock factory ──
/* eslint-disable no-var */
var stableSimilaritySearch = jest.fn().mockResolvedValue([]);
var stableStore = { similaritySearch: stableSimilaritySearch };

var stableInvoke = jest.fn().mockResolvedValue({});
var stableWithStructuredOutput = jest
  .fn()
  .mockReturnValue({ invoke: stableInvoke });
/* eslint-enable no-var */

// ─── Mock dependency sebelum import modul ────────────────────────────────────

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

// Mock PGVectorStore — initialize selalu mengembalikan stable store instance
jest.mock('@langchain/community/vectorstores/pgvector', () => ({
  PGVectorStore: {
    initialize: jest.fn().mockResolvedValue(stableStore),
  },
}));

// Mock ChatGoogleGenerativeAI & GoogleGenerativeAIEmbeddings
jest.mock('@langchain/google-genai', () => ({
  GoogleGenerativeAIEmbeddings: jest.fn().mockImplementation(() => ({})),
  ChatGoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    invoke: stableInvoke,
    withStructuredOutput: stableWithStructuredOutput,
  })),
}));

// ─── Import setelah mocking ───────────────────────────────────────────────────
import fs from 'fs/promises';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import { normalizeToRAGNote, runPersonaRAG } from '@/lib/persona.service';

const mockReadFile = fs.readFile as jest.Mock;
const mockVSInitialize = PGVectorStore.initialize as jest.Mock;

// ─── Helper payload persona output ───────────────────────────────────────────
const validPersonaOutput = {
  result: {
    narative: 'Lorem ipsum narrative',
    bullets: '- Bullet 1\n- Bullet 2',
    mixed: 'Mixed format output',
    quote: '"A great quote"',
    full_name: 'John Doe',
  },
  taxonomy: {
    domain: { key: 'tech', label: 'Technology' },
    detail: 'Software engineering persona',
    internal: [{ name: 'Analytical', description: 'Analytical', title: 'T' }],
    external: [{ name: 'Communicative', description: 'Comm', title: 'T2' }],
  },
};

beforeEach(() => {
  // clearAllMocks mereset mock calls DAN implementations — perlu di-restore
  jest.clearAllMocks();

  // Re-setup PGVectorStore.initialize agar ensureStore() tetap mendapat stable store
  // (modul meng-cache store di module-level var; kalau initialize() undefined, store = undefined)
  mockVSInitialize.mockResolvedValue(stableStore);

  stableSimilaritySearch.mockResolvedValue([]);
  stableInvoke.mockResolvedValue(validPersonaOutput);
  stableWithStructuredOutput.mockReturnValue({ invoke: stableInvoke });
});

// ════════════════════════════════════════════════════════════════════════════
// normalizeToRAGNote
// ════════════════════════════════════════════════════════════════════════════
describe('normalizeToRAGNote', () => {
  it('mengembalikan teks yang sudah dinormalisasi (string response)', async () => {
    stableInvoke.mockResolvedValue({ content: '# Normalized content\n- point 1' });

    const result = await normalizeToRAGNote('raw text here', {
      language: 'en',
      domain: 'tech',
    });

    expect(result).toBe('# Normalized content\n- point 1');
    expect(stableInvoke).toHaveBeenCalledTimes(1);
  });

  it('menggabungkan array content menjadi string', async () => {
    stableInvoke.mockResolvedValue({
      content: [{ text: 'Part 1' }, { text: 'Part 2' }],
    });

    const result = await normalizeToRAGNote('raw');
    expect(result).toBe('Part 1\nPart 2');
  });

  it('menggabungkan item string dalam array content', async () => {
    stableInvoke.mockResolvedValue({
      content: ['String part 1', { text: 'Object part 2' }],
    });

    const result = await normalizeToRAGNote('raw');
    expect(result).toBe('String part 1\nObject part 2');
  });

  it('fallback ke rawText jika LLM mengembalikan string kosong', async () => {
    stableInvoke.mockResolvedValue({ content: '   ' });

    const result = await normalizeToRAGNote('my original text');
    expect(result).toBe('my original text');
  });

  it('fallback ke rawText jika content adalah array kosong', async () => {
    stableInvoke.mockResolvedValue({ content: [] });

    const result = await normalizeToRAGNote('fallback text');
    expect(result).toBe('fallback text');
  });

  it('menggunakan bahasa "id" saat language=id', async () => {
    stableInvoke.mockResolvedValue({ content: 'Konten ternormalisasi' });

    const result = await normalizeToRAGNote('raw teks', { language: 'id' });
    expect(result).toBe('Konten ternormalisasi');
    expect(stableInvoke).toHaveBeenCalledTimes(1);
  });

  it('memotong input panjang ke 120000 karakter', async () => {
    stableInvoke.mockResolvedValue({ content: 'Truncated response' });
    const longText = 'A'.repeat(200000);

    await normalizeToRAGNote(longText);

    expect(stableInvoke).toHaveBeenCalledTimes(1);
    const callArgs = stableInvoke.mock.calls[0][0] as Array<{
      role: string;
      content: string;
    }>;
    const userPart = callArgs.find((m) => m.role === 'user');
    // Pastikan user prompt mengandung tepat 120000 karakter 'A'
    const aCount = (userPart?.content.match(/A+/g) ?? []).join('').length;
    expect(aCount).toBe(120000);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// runPersonaRAG
// ════════════════════════════════════════════════════════════════════════════
describe('runPersonaRAG', () => {
  // Prompt file content stubs — 6 file dibaca per pemanggilan
  const promptFiles = [
    'System message',
    'Task instruction',
    'Output specifications',
    'Persona format',
    'Context title',
    'Construct title',
  ];

  beforeEach(() => {
    let callIndex = 0;
    mockReadFile.mockImplementation(() =>
      Promise.resolve(promptFiles[callIndex++] ?? 'prompt'),
    );
  });

  it('memanggil similaritySearch dan mengembalikan output persona valid', async () => {
    const fakeDoc = {
      pageContent: 'Context content',
      metadata: { source: 'test' },
    };
    stableSimilaritySearch.mockResolvedValue([fakeDoc]);

    const result = await runPersonaRAG('gemini-2.5-flash', 'Build a persona', {
      topK: 2,
      filters: { language_key: 'en' },
    });

    expect(stableSimilaritySearch).toHaveBeenCalledTimes(1);
    expect(stableWithStructuredOutput).toHaveBeenCalledTimes(1);
    expect(stableInvoke).toHaveBeenCalledTimes(1);
    expect(result).toEqual(validPersonaOutput);
  });

  it('skipRAG=true melewati similaritySearch', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'Build persona no rag', {
      skipRAG: true,
      filters: { language_key: 'id' },
    });

    expect(stableSimilaritySearch).not.toHaveBeenCalled();
  });

  it('dengan author_id melakukan personal search + general search', async () => {
    stableSimilaritySearch
      .mockResolvedValueOnce([
        { pageContent: 'Personal doc', metadata: { source: 'personal' } },
      ])
      .mockResolvedValueOnce([
        { pageContent: 'General doc', metadata: { source: 'general' } },
      ]);

    await runPersonaRAG('gemini-2.5-flash', 'Persona with author', {
      topK: 4,
      filters: { author_id: '42', language_key: 'en', domain_key: 'tech' },
    });

    // Dua kali: personal search + general search
    expect(stableSimilaritySearch).toHaveBeenCalledTimes(2);

    // Personal search tidak memfilter visibility
    const personalCallArgs = stableSimilaritySearch.mock.calls[0][2];
    expect(personalCallArgs).not.toHaveProperty('visibility');

    // General search memfilter visibility: 'public'
    const generalCallArgs = stableSimilaritySearch.mock.calls[1][2];
    expect(generalCallArgs).toHaveProperty('visibility', 'public');
  });

  it('topK=0 melewati semua similaritySearch', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'No docs', {
      topK: 0,
      filters: { language_key: 'en' },
    });

    expect(stableSimilaritySearch).not.toHaveBeenCalled();
  });

  it('membaca 6 file prompt dari disk', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'Check prompt files', {
      filters: { language_key: 'en' },
    });

    expect(mockReadFile).toHaveBeenCalledTimes(6);
  });

  it('contentLengthRange bahasa id menghasilkan prompt berbahasa Indonesia', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'Bahasa id', {
      filters: { language_key: 'id' },
      contentLengthRange: [100, 500],
    });

    const invokeCall = stableInvoke.mock.calls[0][0] as Array<{
      lc_kwargs?: { content?: string };
    }>;
    const hasKataPrompt = invokeCall.some((m) =>
      m.lc_kwargs?.content?.includes('kata'),
    );
    expect(hasKataPrompt).toBe(true);
  });

  it('contentLengthRange bahasa en menghasilkan prompt berbahasa Inggris', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'English range', {
      filters: { language_key: 'en' },
      contentLengthRange: [50, 300],
    });

    const invokeCall = stableInvoke.mock.calls[0][0] as Array<{
      lc_kwargs?: { content?: string };
    }>;
    const hasWordsPrompt = invokeCall.some((m) =>
      m.lc_kwargs?.content?.includes('words'),
    );
    expect(hasWordsPrompt).toBe(true);
  });

  it('queryTerms digabungkan ke query string untuk similaritySearch', async () => {
    await runPersonaRAG('gemini-2.5-flash', 'Main construct', {
      topK: 3,
      filters: { language_key: 'en' },
      queryTerms: ['additional term', 'another term'],
    });

    expect(stableSimilaritySearch).toHaveBeenCalledTimes(1);
    const searchQuery = stableSimilaritySearch.mock.calls[0][0] as string;
    expect(searchQuery).toContain('Main construct');
    expect(searchQuery).toContain('additional term');
    expect(searchQuery).toContain('another term');
  });
});
