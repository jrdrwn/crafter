/**
 * @jest-environment node
 *
 * Robustness tests for persona.service.ts (No. 1):
 * - Missing prompt files (ENOENT)
 * - LLM errors: rate limit (429), timeout / overload
 * - similaritySearch failure
 * - Malformed / empty LLM structured output
 */

// ─── Env vars harus di-set SEBELUM modul diimport ────────────────────────────
process.env.GEMINI_API_KEY = 'test-key';
process.env.GEMINI_RAG_API_KEY = 'test-rag-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// ─── Stable mocks ─────────────────────────────────────────────────────────────
/* eslint-disable no-var */
var stableSimilaritySearch = jest.fn().mockResolvedValue([]);
var stableStore = { similaritySearch: stableSimilaritySearch };
var stableInvoke = jest.fn().mockResolvedValue({});
var stableWithStructuredOutput = jest
  .fn()
  .mockReturnValue({ invoke: stableInvoke });
/* eslint-enable no-var */

// ─── Mocks ───────────────────────────────────────────────────────────────────
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
}));

jest.mock('@langchain/community/vectorstores/pgvector', () => ({
  PGVectorStore: {
    initialize: jest.fn().mockResolvedValue(stableStore),
  },
}));

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

// ─── Setup ───────────────────────────────────────────────────────────────────
const promptFiles = [
  'System message',
  'Task instruction',
  'Output specifications',
  'Persona format',
  'Context title',
  'Construct title',
];

function setupPromptFiles() {
  let callIndex = 0;
  mockReadFile.mockImplementation(() =>
    Promise.resolve(promptFiles[callIndex++] ?? 'prompt'),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVSInitialize.mockResolvedValue(stableStore);
  stableSimilaritySearch.mockResolvedValue([]);
  stableInvoke.mockResolvedValue({
    result: {
      narative: 'n',
      bullets: 'b',
      mixed: 'm',
      quote: 'q',
      full_name: 'N',
    },
    taxonomy: {
      domain: { key: 'k', label: 'L' },
      detail: '',
      internal: [],
      external: [],
    },
  });
  stableWithStructuredOutput.mockReturnValue({ invoke: stableInvoke });
});

// ════════════════════════════════════════════════════════════════════════════
// No. 1a — Missing prompt files (ENOENT)
// ════════════════════════════════════════════════════════════════════════════
describe('runPersonaRAG — missing prompt files', () => {
  it('melempar error jika file system_message.txt tidak ada (ENOENT)', async () => {
    const enoentError = Object.assign(new Error('ENOENT: no such file'), {
      code: 'ENOENT',
    });
    mockReadFile.mockRejectedValue(enoentError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        filters: { language_key: 'en' },
      }),
    ).rejects.toThrow('ENOENT');
  });

  it('melempar error jika salah satu file prompt (bukan yang pertama) tidak ada', async () => {
    // File pertama sukses, file kedua gagal
    const enoentError = Object.assign(new Error('ENOENT: task_instruction.txt'), {
      code: 'ENOENT',
    });
    mockReadFile
      .mockResolvedValueOnce('System message OK')
      .mockRejectedValueOnce(enoentError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        filters: { language_key: 'id' },
      }),
    ).rejects.toThrow('ENOENT');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// No. 1b — LLM errors (rate limit, overload, timeout)
// ════════════════════════════════════════════════════════════════════════════
describe('runPersonaRAG — LLM errors', () => {
  beforeEach(setupPromptFiles);

  it('melempar error saat LLM mengembalikan 429 Too Many Requests', async () => {
    const rateLimitError = new Error('429 Too Many Requests');
    stableInvoke.mockRejectedValue(rateLimitError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        filters: { language_key: 'en' },
      }),
    ).rejects.toThrow('429');
  });

  it('melempar error saat LLM overload / 503 Service Unavailable', async () => {
    const overloadError = new Error('503 Service Unavailable: model overloaded');
    stableInvoke.mockRejectedValue(overloadError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        filters: { language_key: 'en' },
      }),
    ).rejects.toThrow('503');
  });

  it('melempar error saat LLM timeout', async () => {
    const timeoutError = new Error('Request timed out after 30000ms');
    stableInvoke.mockRejectedValue(timeoutError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        skipRAG: true,
        filters: { language_key: 'en' },
      }),
    ).rejects.toThrow('timed out');
  });

  it('melempar error saat LLM gagal pada normalizeToRAGNote', async () => {
    const apiError = new Error('API quota exceeded');
    stableInvoke.mockRejectedValue(apiError);

    await expect(normalizeToRAGNote('raw text')).rejects.toThrow('quota');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// No. 1c — similaritySearch failure
// ════════════════════════════════════════════════════════════════════════════
describe('runPersonaRAG — similaritySearch errors', () => {
  beforeEach(setupPromptFiles);

  it('melempar error jika similaritySearch (general) gagal', async () => {
    const dbError = new Error('Connection to vector DB lost');
    stableSimilaritySearch.mockRejectedValue(dbError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        topK: 4,
        filters: { language_key: 'en' },
      }),
    ).rejects.toThrow('vector DB');
  });

  it('melempar error jika similaritySearch personal (author_id) gagal', async () => {
    const dbError = new Error('pg vector query timeout');
    stableSimilaritySearch.mockRejectedValue(dbError);

    await expect(
      runPersonaRAG('gemini-2.5-flash', 'Persona', {
        topK: 4,
        filters: { author_id: '99', language_key: 'en' },
      }),
    ).rejects.toThrow('timeout');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// No. 1d — Malformed / empty structured output
// ════════════════════════════════════════════════════════════════════════════
describe('runPersonaRAG — malformed LLM output', () => {
  beforeEach(setupPromptFiles);

  it('meneruskan output apa adanya jika LLM mengembalikan objek kosong {}', async () => {
    stableInvoke.mockResolvedValue({});

    // Fungsi tidak melempar, tapi output tidak memenuhi schema — diserahkan ke caller
    const result = await runPersonaRAG('gemini-2.5-flash', 'Persona', {
      skipRAG: true,
      filters: { language_key: 'en' },
    });

    // Karena mock bypass Zod validation, result berupa {} kosong
    expect(result).toEqual({});
  });

  it('meneruskan output jika LLM mengembalikan schema yang tidak lengkap', async () => {
    // Hanya ada `result`, tidak ada `taxonomy`
    const partialOutput = {
      result: {
        narative: 'N',
        bullets: '',
        mixed: '',
        quote: '',
        full_name: 'X',
      },
    };
    stableInvoke.mockResolvedValue(partialOutput);

    const result = await runPersonaRAG('gemini-2.5-flash', 'Persona partial', {
      skipRAG: true,
      filters: { language_key: 'en' },
    });

    expect(result).toEqual(partialOutput);
    // `taxonomy` tidak ada — caller bertanggung jawab validasi downstream
    expect((result as Record<string, unknown>).taxonomy).toBeUndefined();
  });
});
