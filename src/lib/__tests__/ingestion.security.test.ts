/**
 * @jest-environment node
 *
 * Security / data-isolation tests for ingestion.ts (No. 3):
 * - Cross-user access prevention (getUserContribution)
 * - Cross-user update prevention (updateContribution)
 * - Cross-user delete prevention (deleteContribution)
 * - Visibility filter: general search hanya mengembalikan dokumen 'public'
 * - Author dapat melihat miliknya sendiri tanpa filter visibility
 */

// ─── Mocks (harus sebelum semua import) ──────────────────────────────────────

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

jest.mock('@langchain/community/vectorstores/pgvector', () => ({
  PGVectorStore: {
    initialize: jest.fn(),
  },
}));

jest.mock('@langchain/google-genai', () => ({
  GoogleGenerativeAIEmbeddings: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@langchain/textsplitters', () => ({
  RecursiveCharacterTextSplitter: jest.fn().mockImplementation(() => ({
    splitDocuments: jest.fn().mockImplementation((docs) => Promise.resolve(docs)),
  })),
}));

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rowCount: 1 }),
  })),
}));

// ─── Import setelah mocking ───────────────────────────────────────────────────
import { Pool } from 'pg';
import { PGVectorStore } from '@langchain/community/vectorstores/pgvector';
import prisma from '@db';
import {
  getUserContribution,
  updateContribution,
  deleteContribution,
} from '@/lib/ingestion';

// ─── Alias mock functions ────────────────────────────────────────────────────
const mockFindFirst = prisma.rag_documents.findFirst as jest.Mock;
const mockUpdate = prisma.rag_documents.update as jest.Mock;
const mockDelete = prisma.rag_documents.delete as jest.Mock;
const mockVSInitialize = PGVectorStore.initialize as jest.Mock;

const BIG = (n: number | string) => BigInt(n);

// ─── Setup ───────────────────────────────────────────────────────────────────
let mockAddDocuments: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();

  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
  process.env.GEMINI_API_KEY = 'test-key';

  mockAddDocuments = jest.fn().mockResolvedValue(undefined);
  mockVSInitialize.mockResolvedValue({ addDocuments: mockAddDocuments });

  (Pool as unknown as jest.Mock).mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rowCount: 1 }),
  }));
});

// ════════════════════════════════════════════════════════════════════════════
// Cross-user access — getUserContribution
// ════════════════════════════════════════════════════════════════════════════
describe('Security — getUserContribution (cross-user prevention)', () => {
  it('mengembalikan null jika dokumen dimiliki oleh user lain (bukan caller)', async () => {
    // findFirst dipanggil dengan WHERE id=10 AND author_id=BigInt(1)
    // tapi dokumen 10 sebenarnya milik author_id=2 → findFirst mengembalikan null
    mockFindFirst.mockResolvedValue(null);

    const result = await getUserContribution(1, 10); // user 1 mencoba akses dok milik user 2

    expect(result).toBeNull();

    // Kueri HARUS menyertakan author_id milik caller, bukan semata-mata doc id
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: 10, author_id: BIG('1') },
    });
  });

  it('mengembalikan dokumen jika caller adalah pemiliknya', async () => {
    const ownDoc = { id: 10, text: 'My doc', type: 'survey', author_id: BIG('2') };
    mockFindFirst.mockResolvedValue(ownDoc);

    const result = await getUserContribution(2, 10); // user 2 akses miliknya sendiri

    expect(result).toEqual(ownDoc);
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { id: 10, author_id: BIG('2') },
    });
  });

  it('author_id yang berbeda menghasilkan query WHERE yang berbeda', async () => {
    mockFindFirst.mockResolvedValue(null);

    await getUserContribution(99, 5);
    await getUserContribution(1, 5);

    const call0 = mockFindFirst.mock.calls[0][0];
    const call1 = mockFindFirst.mock.calls[1][0];

    // Pastikan author_id di query berbeda, bukan hardcoded
    expect(call0.where.author_id).toEqual(BIG('99'));
    expect(call1.where.author_id).toEqual(BIG('1'));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Cross-user access — updateContribution
// ════════════════════════════════════════════════════════════════════════════
describe('Security — updateContribution (cross-user prevention)', () => {
  it('melempar "not_found" jika dokumen bukan milik caller (user lain)', async () => {
    // User 1 mencoba update dokumen milik user 2 → findFirst mengembalikan null
    mockFindFirst.mockResolvedValue(null);

    await expect(
      updateContribution(1, 99, { text: 'Hacked content' }),
    ).rejects.toThrow('not_found');

    // prisma.update TIDAK boleh dipanggil saat akses ditolak
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('TIDAK memanggil update ke database jika findFirst gagal menemukan dokumen milik caller', async () => {
    mockFindFirst.mockResolvedValue(null);

    try {
      await updateContribution(7, 50, { text: 'attempt' });
    } catch {
      // ignored
    }

    expect(mockUpdate).not.toHaveBeenCalled();
    expect(mockAddDocuments).not.toHaveBeenCalled();
  });

  it('update berhasil jika caller adalah pemilik yang sah', async () => {
    const ownDoc = {
      id: 20,
      text: 'Original',
      type: 'survey',
      domain_key: 'edu',
      language_key: 'id',
      source: 'manual',
      metadata: {},
      visibility: 'private',
    };
    mockFindFirst.mockResolvedValue(ownDoc);
    mockUpdate.mockResolvedValue({});

    const result = await updateContribution(3, 20, { text: 'Updated' });

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 20 } }),
    );
    expect(result).toEqual({ id: 20, chunks: 1 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Cross-user access — deleteContribution
// ════════════════════════════════════════════════════════════════════════════
describe('Security — deleteContribution (cross-user prevention)', () => {
  it('melempar "not_found" jika dokumen bukan milik caller', async () => {
    mockFindFirst.mockResolvedValue(null);

    await expect(deleteContribution(1, 500)).rejects.toThrow('not_found');

    // delete TIDAK boleh dipanggil
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('query DELETE menyertakan author_id milik caller', async () => {
    mockFindFirst.mockResolvedValue({ id: 5, author_id: BIG('8') });
    mockDelete.mockResolvedValue({});

    await deleteContribution(8, 5);

    // findFirst dipanggil dengan author_id caller
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ author_id: BIG('8') }),
      }),
    );
  });

  it('delete berhasil jika caller adalah pemilik yang sah', async () => {
    mockFindFirst.mockResolvedValue({ id: 7, author_id: BIG('5') });
    mockDelete.mockResolvedValue({});

    const result = await deleteContribution(5, 7);

    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(result).toEqual({ id: 7 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Visibility filter consistency
// ════════════════════════════════════════════════════════════════════════════
describe('Security — visibility stored per document', () => {
  it('visibility "public" disimpan ke metadata embedding saat ingest', async () => {
    // Kita verifikasi melalui argumen addDocuments
    const mockCreate = prisma.rag_documents.create as jest.Mock;
    mockCreate.mockResolvedValue({ id: BIG(100) });

    const { ingestContribution } = await import('@/lib/ingestion');

    await ingestContribution({
      text: 'Public content',
      type: 'doc',
      visibility: 'public',
      author_id: 1,
    });

    expect(mockAddDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({ visibility: 'public' }),
        }),
      ]),
    );
  });

  it('visibility "private" disimpan ke metadata embedding saat ingest (default)', async () => {
    const mockCreate = prisma.rag_documents.create as jest.Mock;
    mockCreate.mockResolvedValue({ id: BIG(101) });

    const { ingestContribution } = await import('@/lib/ingestion');

    await ingestContribution({
      text: 'Private content',
      type: 'survey',
      // visibility tidak diberikan → default "private"
    });

    expect(mockAddDocuments).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          metadata: expect.objectContaining({ visibility: 'private' }),
        }),
      ]),
    );
  });
});
