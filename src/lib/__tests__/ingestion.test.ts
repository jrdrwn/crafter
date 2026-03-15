/**
 * @jest-environment node
 */
// ─── Mock semua dependency eksternal sebelum import modul ──────────────────────

// Mock @db (prisma client)
jest.mock('@db', () => ({
  rag_documents: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock PGVectorStore — initialize mengembalikan mock store yang dikonfigurasi di beforeEach
jest.mock('@langchain/community/vectorstores/pgvector', () => ({
  PGVectorStore: {
    initialize: jest.fn(),
  },
}));

// Mock GoogleGenerativeAIEmbeddings
jest.mock('@langchain/google-genai', () => ({
  GoogleGenerativeAIEmbeddings: jest.fn().mockImplementation(() => ({})),
}));

// Mock RecursiveCharacterTextSplitter — kembalikan docs apa adanya
jest.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitDocuments: jest
      .fn()
      .mockImplementation((docs) => Promise.resolve(docs)),
  })),
}));

// Mock pg Pool
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rowCount: 1 }),
  })),
}));

// ─── Import setelah mocking ─────────────────────────────────────────────────
import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import prisma from '@db';
import {
  ingestContribution,
  listUserContributions,
  getUserContribution,
  updateContribution,
  deleteContribution,
  ContributionPayload,
} from '@/lib/ingestion';

// ─── Alias mock functions ────────────────────────────────────────────────────
const mockCreate = prisma.rag_documents.create as jest.Mock;
const mockFindMany = prisma.rag_documents.findMany as jest.Mock;
const mockCount = prisma.rag_documents.count as jest.Mock;
const mockFindFirst = prisma.rag_documents.findFirst as jest.Mock;
const mockUpdate = prisma.rag_documents.update as jest.Mock;
const mockDelete = prisma.rag_documents.delete as jest.Mock;
const mockVSInitialize = PGVectorStore.initialize as jest.Mock;

// Gunakan BigInt() function, bukan literal nN, agar kompatibel dengan target ES2017
const BIG = (n: number | string) => BigInt(n);

// ─── Setup per test ──────────────────────────────────────────────────────────
let mockAddDocuments: jest.Mock;
let mockPoolQueryFn: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.GEMINI_API_KEY = 'test-key';

  // Buat mock addDocuments baru setiap test
  mockAddDocuments = jest.fn().mockResolvedValue(undefined);
  mockVSInitialize.mockResolvedValue({ addDocuments: mockAddDocuments });

  // Ambil referensi ke pool query mock
  // Pool diinstansiasi sekali (singleton) di ingestion.ts, kita perlu akses ke query-nya
  mockPoolQueryFn = jest.fn().mockResolvedValue({ rowCount: 1 });
  (Pool as unknown as jest.Mock).mockImplementation(() => ({
    query: mockPoolQueryFn,
  }));
});

// ════════════════════════════════════════════════════════════════════════════
// ingestContribution
// ════════════════════════════════════════════════════════════════════════════
describe('ingestContribution', () => {
  const basePayload: ContributionPayload = {
    text: 'Teks kontribusi',
    type: 'survey',
    domain_key: 'education',
    language_key: 'id',
    author_id: 42,
    source: 'manual',
    visibility: 'public',
  };

  it('membuat dokumen di prisma dan mengembalikan id + chunks', async () => {
    mockCreate.mockResolvedValue({ id: BIG(1) });

    const result = await ingestContribution(basePayload);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          text: basePayload.text,
          type: basePayload.type,
          domain_key: basePayload.domain_key,
          language_key: basePayload.language_key,
          author_id: BIG(String(basePayload.author_id!)),
          source: basePayload.source,
          visibility: basePayload.visibility,
        }),
      }),
    );
    expect(mockAddDocuments).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: BIG(1), chunks: 1 });
  });

  it('memakai default visibility "private" bila tidak diberikan', async () => {
    mockCreate.mockResolvedValue({ id: BIG(2) });
    const payload = { text: 'Test', type: 'doc' as const };

    await ingestContribution(payload);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ visibility: 'private' }),
      }),
    );
  });

  it('author_id null jika tidak diberikan', async () => {
    mockCreate.mockResolvedValue({ id: BIG(3) });
    const payload = { text: 'Test', type: 'review' as const };

    await ingestContribution(payload);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ author_id: null }),
      }),
    );
  });

  it('menangani extra sebagai object dan menyebarkan ke baseMeta', async () => {
    mockCreate.mockResolvedValue({ id: BIG(4) });
    const payload: ContributionPayload = {
      text: 'Test extra',
      type: 'interview',
      extra: { custom_field: 'value' },
    };

    const result = await ingestContribution(payload);

    expect(result.id).toEqual(BIG(4));
    expect(mockAddDocuments).toHaveBeenCalledTimes(1);
  });

  it('menangani extra berupa array (bukan object) tanpa error', async () => {
    mockCreate.mockResolvedValue({ id: BIG(5) });
    const payload: ContributionPayload = {
      text: 'Test',
      type: 'doc',
      extra: ['item1', 'item2'] as unknown as ContributionPayload['extra'],
    };

    const result = await ingestContribution(payload);
    expect(result.id).toEqual(BIG(5));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// listUserContributions
// ════════════════════════════════════════════════════════════════════════════
describe('listUserContributions', () => {
  const items = [{ id: BIG(1), type: 'survey', domain_key: 'edu' }];

  it('mengembalikan items, nextOffset, dan total', async () => {
    mockFindMany.mockResolvedValue(items);
    mockCount.mockResolvedValue(1);

    const result = await listUserContributions(42);

    expect(mockFindMany).toHaveBeenCalledTimes(1);
    expect(mockCount).toHaveBeenCalledTimes(1);
    expect(result.items).toEqual(items);
    expect(result.total).toBe(1);
  });

  it('nextOffset null jika items kurang dari limit', async () => {
    mockFindMany.mockResolvedValue(items);
    mockCount.mockResolvedValue(1);

    const result = await listUserContributions(42);
    expect(result.nextOffset).toBeNull();
  });

  it('nextOffset berisi offset + limit jika items penuh', async () => {
    const fullPage = Array.from({ length: 5 }, (_, i) => ({ id: BIG(i) }));
    mockFindMany.mockResolvedValue(fullPage);
    mockCount.mockResolvedValue(10);

    const result = await listUserContributions(42, { limit: 5, offset: 0 });
    expect(result.nextOffset).toBe(5);
  });

  it('membatasi limit maksimal ke 100', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listUserContributions(42, { limit: 999 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it('membatasi limit minimal ke 1', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listUserContributions(42, { limit: 0 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 1 }),
    );
  });

  it('offset negatif dikonversi ke 0', async () => {
    mockFindMany.mockResolvedValue([]);
    mockCount.mockResolvedValue(0);

    await listUserContributions(42, { offset: -5 });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0 }),
    );
  });
});

// ════════════════════════════════════════════════════════════════════════════
// getUserContribution
// ════════════════════════════════════════════════════════════════════════════
describe('getUserContribution', () => {
  it('mengembalikan row jika ditemukan', async () => {
    const row = { id: BIG(1), text: 'Hello', type: 'survey' };
    mockFindFirst.mockResolvedValue(row);

    const result = await getUserContribution(42, 1);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: 1, author_id: BIG('42') },
    });
    expect(result).toEqual(row);
  });

  it('mengembalikan null jika tidak ditemukan', async () => {
    mockFindFirst.mockResolvedValue(null);

    const result = await getUserContribution(42, 999);
    expect(result).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// updateContribution
// ════════════════════════════════════════════════════════════════════════════
describe('updateContribution', () => {
  const existingDoc = {
    id: 1,
    text: 'Old text',
    type: 'survey',
    domain_key: 'edu',
    language_key: 'id',
    source: 'manual',
    metadata: {},
    visibility: 'private',
  };

  it('melempar error "not_found" jika dokumen tidak ada', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(
      updateContribution(42, 1, { text: 'Updated' }),
    ).rejects.toThrow('not_found');
  });

  it('mengupdate dokumen dan re-embed konten baru', async () => {
    mockFindFirst.mockResolvedValue(existingDoc);
    mockUpdate.mockResolvedValue({});

    const result = await updateContribution(42, 1, {
      text: 'New text',
      type: 'doc',
    });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ text: 'New text', type: 'doc' }),
      }),
    );
    expect(mockAddDocuments).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ id: 1, chunks: 1 });
  });

  it('mempertahankan nilai lama jika field tidak diberikan', async () => {
    mockFindFirst.mockResolvedValue(existingDoc);
    mockUpdate.mockResolvedValue({});

    await updateContribution(42, 1, {});

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          text: existingDoc.text,
          type: existingDoc.type,
        }),
      }),
    );
  });

  it('menghapus embeddings lama dari rag_embeddings (query ke pg pool)', async () => {
    mockFindFirst.mockResolvedValue(existingDoc);
    mockUpdate.mockResolvedValue({});

    // Pastikan seluruh siklus update+delete embeddings+re-embed berhasil tanpa error
    const result = await updateContribution(42, 1, { text: 'Updated' });

    // Update harus dipanggil
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1 } }),
    );
    // Re-embed harus dipanggil setelah delete embeddings
    expect(mockAddDocuments).toHaveBeenCalledTimes(1);
    // Hasil akhir harus mengembalikan id
    expect(result).toEqual({ id: 1, chunks: 1 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// deleteContribution
// ════════════════════════════════════════════════════════════════════════════
describe('deleteContribution', () => {
  it('melempar error "not_found" jika dokumen tidak ditemukan', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(deleteContribution(42, 999)).rejects.toThrow('not_found');

    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('menghapus embeddings dan dokumen lalu mengembalikan id', async () => {
    mockFindFirst.mockResolvedValue({ id: 1 });
    mockDelete.mockResolvedValue({});

    const result = await deleteContribution(42, 1);

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ id: 1 });
  });
});
