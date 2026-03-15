/**
 * @jest-environment node
 *
 * Test untuk src/app/api/[[...route]]/rag.ts
 *
 * Semua endpoint:
 * - GET  /rag/contributions/check
 * - POST /rag/contributions
 * - GET  /rag/contributions
 * - GET  /rag/contributions/:id
 * - PUT  /rag/contributions/:id
 * - DELETE /rag/contributions/:id
 * - POST /rag/contributions/upload
 */

import { Hono } from 'hono';

// ---------- Mocks ----------

jest.mock('@db', () => ({
  __esModule: true,
  default: {
    rag_documents: {
      count: jest.fn(),
    },
  },
}));

jest.mock('@/lib/ingestion', () => ({
  ingestContribution: jest.fn(),
  listUserContributions: jest.fn(),
  getUserContribution: jest.fn(),
  updateContribution: jest.fn(),
  deleteContribution: jest.fn(),
}));

jest.mock('@/lib/persona.service', () => ({
  runPersonaRAG: jest.fn(),
  normalizeToRAGNote: jest.fn(),
}));

// Mock mammoth & xlsx to avoid binary dependencies
jest.mock('mammoth', () => ({
  convertToHtml: jest.fn(),
}));
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: { sheet_to_csv: jest.fn() },
}));

import prisma from '@db';
import {
  ingestContribution,
  listUserContributions,
  getUserContribution,
  updateContribution,
  deleteContribution,
} from '@/lib/ingestion';
import { normalizeToRAGNote } from '@/lib/persona.service';
import { rag } from '@/app/api/[[...route]]/rag';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockIngest = ingestContribution as jest.Mock;
const mockList = listUserContributions as jest.Mock;
const mockGet = getUserContribution as jest.Mock;
const mockUpdate = updateContribution as jest.Mock;
const mockDelete = deleteContribution as jest.Mock;
const mockNormalize = normalizeToRAGNote as jest.Mock;

function buildApp(jwtPayload?: { sub: number; role: string }) {
  const app = new Hono().basePath('/api');
  app.use('/*', async (c, next) => {
    if (jwtPayload) c.set('jwtPayload', jwtPayload);
    await next();
  });
  app.route('/', rag);
  return app;
}

// ---------- GET /contributions/check ----------

describe('GET /api/rag/contributions/check', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns available=true when count > 0', async () => {
    (mockPrisma.rag_documents.count as jest.Mock).mockResolvedValue(5);

    const app = buildApp();
    const res = await app.request('/api/rag/contributions/check?domain_key=tech&language_key=en');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, available: true, count: 5 });
  });

  it('returns available=false when count is 0', async () => {
    (mockPrisma.rag_documents.count as jest.Mock).mockResolvedValue(0);

    const app = buildApp();
    const res = await app.request('/api/rag/contributions/check');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, available: false, count: 0 });
  });
});

// ---------- POST /contributions ----------

describe('POST /api/rag/contributions', () => {
  afterEach(() => jest.clearAllMocks());

  it('ingests contribution and returns result', async () => {
    mockIngest.mockResolvedValue({ id: 1, chunks: 3 });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Sample survey text about user behavior',
        type: 'survey',
        domain_key: 'tech',
        language_key: 'en',
        visibility: 'private',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, result: { id: 1 } });
    expect(mockIngest).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Sample survey text about user behavior', type: 'survey', author_id: 1 }),
    );
  });

  it('returns 400 on invalid type', async () => {
    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'text', type: 'invalid-type' }),
    });

    expect(res.status).toBe(400);
  });

  it('returns 400 when text is empty', async () => {
    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '', type: 'survey' }),
    });

    expect(res.status).toBe(400);
  });
});

// ---------- GET /contributions ----------

describe('GET /api/rag/contributions', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns user contributions list', async () => {
    mockList.mockResolvedValue({ data: [{ id: 1 }], total: 1 });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions?limit=10&offset=0');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, total: 1 });
    expect(mockList).toHaveBeenCalledWith(1, { limit: 10, offset: 0 });
  });

  it('returns 401 when not authenticated', async () => {
    const app = buildApp(); // no jwt
    const res = await app.request('/api/rag/contributions');

    expect(res.status).toBe(401);
  });
});

// ---------- GET /contributions/:id ----------

describe('GET /api/rag/contributions/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns specific contribution when found', async () => {
    mockGet.mockResolvedValue({ id: 5, text: 'hello', type: 'doc' });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/5');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: { id: 5 } });
    expect(mockGet).toHaveBeenCalledWith(1, 5);
  });

  it('returns 404 when contribution not found', async () => {
    mockGet.mockResolvedValue(null);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/99');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'Not found' });
  });
});

// ---------- PUT /contributions/:id ----------

describe('PUT /api/rag/contributions/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('updates contribution and returns result', async () => {
    mockUpdate.mockResolvedValue({ id: 1, text: 'updated text' });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'updated text' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true });
  });

  it('returns 404 when contribution not_found error thrown', async () => {
    mockUpdate.mockRejectedValue(new Error('not_found'));

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/99', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'text' }),
    });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'Not found' });
  });
});

// ---------- DELETE /contributions/:id ----------

describe('DELETE /api/rag/contributions/:id', () => {
  afterEach(() => jest.clearAllMocks());

  it('deletes contribution and returns result', async () => {
    mockDelete.mockResolvedValue({ deleted: true });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/1', { method: 'DELETE' });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true });
    expect(mockDelete).toHaveBeenCalledWith(1, 1);
  });

  it('returns 404 when not_found error thrown', async () => {
    mockDelete.mockRejectedValue(new Error('not_found'));

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/rag/contributions/99', { method: 'DELETE' });

    expect(res.status).toBe(404);
  });

  it('returns 401 when not authenticated', async () => {
    const app = buildApp(); // no jwt
    const res = await app.request('/api/rag/contributions/1', { method: 'DELETE' });

    expect(res.status).toBe(401);
  });
});

// ---------- POST /contributions/upload ----------

describe('POST /api/rag/contributions/upload', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    const app = buildApp();
    const formData = new FormData();
    formData.append('file', new File(['hello'], 'test.txt', { type: 'text/plain' }));

    const res = await app.request('/api/rag/contributions/upload', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(401);
  });

  it('returns 400 when no file is provided', async () => {
    const app = buildApp({ sub: 1, role: 'user' });
    const formData = new FormData();
    formData.append('type', 'doc');

    const res = await app.request('/api/rag/contributions/upload', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'No file uploaded' });
  });

  it('ingests .txt file and returns result', async () => {
    mockNormalize.mockResolvedValue('normalized text content');
    mockIngest.mockResolvedValue({ id: 10 });

    const app = buildApp({ sub: 1, role: 'user' });
    const formData = new FormData();
    formData.append('file', new File(['Hello world text content'], 'notes.txt', { type: 'text/plain' }));
    formData.append('type', 'doc');
    formData.append('domain_key', 'tech');
    formData.append('language_key', 'en');

    const res = await app.request('/api/rag/contributions/upload', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true });
    expect(mockNormalize).toHaveBeenCalledWith(
      'Hello world text content',
      expect.objectContaining({ filename: 'notes.txt' }),
    );
  });

  it('returns 400 on unsupported file type', async () => {
    const app = buildApp({ sub: 1, role: 'user' });
    const formData = new FormData();
    formData.append('file', new File(['data'], 'image.png', { type: 'image/png' }));

    const res = await app.request('/api/rag/contributions/upload', {
      method: 'POST',
      body: formData,
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json).toMatchObject({ status: false });
  });
});
