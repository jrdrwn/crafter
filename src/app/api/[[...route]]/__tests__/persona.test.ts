/**
 * @jest-environment node
 *
 * Test untuk src/app/api/[[...route]]/persona.ts
 *
 * Semua endpoint:
 * - POST /persona/generate/guest
 * - POST /persona/generate
 * - PUT  /persona/:id
 * - PUT  /persona/:id/visibility
 * - DELETE /persona/:id
 * - GET  /persona/
 * - GET  /persona/me
 * - GET  /persona/:id
 * - POST /persona/copy/:id
 * - PUT  /persona/:id/content
 * - GET  /persona/helper/domain
 * - GET  /persona/helper/attribute
 * - GET  /persona/helper/language
 * - GET  /persona/helper/llm
 */

import { persona } from '@/app/api/[[...route]]/persona';
import { runPersonaRAG } from '@/lib/persona.service';
import prisma from '@db';
import { Hono } from 'hono';

// ---------- Mocks ----------

jest.mock('@db', () => ({
  __esModule: true,
  default: {
    persona: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    persona_attribute: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    domain: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    language: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    llm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    attribute: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

jest.mock('@/lib/persona.service', () => ({
  runPersonaRAG: jest.fn(),
  normalizeToRAGNote: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRunPersonaRAG = runPersonaRAG as jest.Mock;

// Base valid payload for generate endpoints
const baseGenerateBody = {
  domain: { key: 'tech', label: 'Technology' },
  internal: [
    { name: 'introvert', title: 'Introvert', description: 'Prefers solitude' },
  ],
  external: [
    {
      name: 'social-media',
      title: 'Social Media',
      description: 'Active online',
    },
  ],
  contentLengthRange: [100, 300],
  llmModel: { key: 'gemini-pro', label: 'Gemini Pro' },
  language: { key: 'en', label: 'English' },
  useRAG: false,
  detail: 'Millennial tech user',
};

// Build app with optional jwt payload
function buildApp(jwtPayload?: { sub: number; role: string }) {
  const app = new Hono().basePath('/api');
  app.use('/*', async (c, next) => {
    if (jwtPayload) c.set('jwtPayload', jwtPayload);
    await next();
  });
  app.route('/', persona);
  return app;
}

const fakeRAGResult = {
  result: {
    narative: 'A tech persona',
    bullets: '...',
    mixed: '...',
    quote: '...',
    full_name: 'Alex',
  },
};

// ---------- generate/guest ----------

describe('POST /api/persona/generate/guest - Generate Persona Guest', () => {
  afterEach(() => jest.clearAllMocks());

  it('mengembalikan hasil RAG untuk request guest yang valid', async () => {
    mockRunPersonaRAG.mockResolvedValue(fakeRAGResult);

    const app = buildApp(); // no jwt needed
    const res = await app.request('/api/persona/generate/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baseGenerateBody),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject(fakeRAGResult);
    expect(mockRunPersonaRAG).toHaveBeenCalledTimes(1);
  });

  it('mengembalikan 400 ketika array internal kosong', async () => {
    const app = buildApp();
    const res = await app.request('/api/persona/generate/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...baseGenerateBody, internal: [] }),
    });

    expect(res.status).toBe(400);
  });

  it('mengembalikan 400 ketika key bahasa tidak valid', async () => {
    const app = buildApp();
    const res = await app.request('/api/persona/generate/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...baseGenerateBody,
        language: { key: 'fr', label: 'French' },
      }),
    });

    expect(res.status).toBe(400);
  });
});

// ---------- generate (authenticated) ----------

describe('POST /api/persona/generate - Generate Persona (Autentikasi)', () => {
  afterEach(() => jest.clearAllMocks());

  it('membuat persona dan mengembalikan hasil + personaId', async () => {
    mockRunPersonaRAG.mockResolvedValue(fakeRAGResult);
    (mockPrisma.domain.findUnique as jest.Mock).mockResolvedValue({
      id: 10,
      key: 'tech',
      label: 'Technology',
    });
    (mockPrisma.language.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      key: 'en',
    });
    (mockPrisma.llm.findUnique as jest.Mock).mockResolvedValue({
      id: 2,
      key: 'gemini-pro',
    });
    (mockPrisma.persona.create as jest.Mock).mockResolvedValue({ id: 99 });
    (mockPrisma.attribute.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      name: 'introvert',
    });
    (mockPrisma.persona_attribute.create as jest.Mock).mockResolvedValue({});

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baseGenerateBody),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ personaId: 99 });
  });

  it('membuat domain jika belum ada', async () => {
    mockRunPersonaRAG.mockResolvedValue(fakeRAGResult);
    (mockPrisma.domain.findUnique as jest.Mock).mockResolvedValue(null);
    (mockPrisma.domain.create as jest.Mock).mockResolvedValue({
      id: 11,
      key: 'tech',
      label: 'Technology',
    });
    (mockPrisma.language.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
    (mockPrisma.llm.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
    (mockPrisma.persona.create as jest.Mock).mockResolvedValue({ id: 100 });
    (mockPrisma.attribute.findUnique as jest.Mock).mockResolvedValue({
      id: 5,
      name: 'introvert',
    });
    (mockPrisma.persona_attribute.create as jest.Mock).mockResolvedValue({});

    const app = buildApp({ sub: 1, role: 'user' });
    await app.request('/api/persona/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(baseGenerateBody),
    });

    expect(mockPrisma.domain.create).toHaveBeenCalledWith({
      data: { key: 'tech', label: 'Technology' },
    });
  });
});

// ---------- GET /persona/:id ----------

describe('GET /api/persona/:id - Ambil Detail Persona', () => {
  afterEach(() => jest.clearAllMocks());

  it('mengembalikan data persona saat ditemukan', async () => {
    const fakePersona = {
      id: 1,
      result: {},
      detail: 'test',
      visibility: 'public',
      domain: { key: 'tech', label: 'Technology' },
      user: { id: 1, name: 'John', email: 'j@e.com' },
      persona_attribute: [],
      content_length_range: [100, 300],
      created_at: new Date(),
      updated_at: new Date(),
      llm: {},
      language: {},
    };
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(fakePersona);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/1');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: { id: 1 } });
  });

  it('mengembalikan 404 ketika persona tidak ditemukan', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(null);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/999');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'Persona not found' });
  });
});

// ---------- GET /persona/ (list) ----------

describe('GET /api/persona/ - Daftar Persona', () => {
  afterEach(() => jest.clearAllMocks());

  it('mengembalikan daftar terpaginasi dengan parameter default', async () => {
    (mockPrisma.persona.count as jest.Mock).mockResolvedValue(2);
    (mockPrisma.persona.findMany as jest.Mock).mockResolvedValue([
      {
        id: 1,
        result: {},
        detail: 'p1',
        visibility: 'public',
        domain: { key: 'tech', label: 'Technology' },
        user: { id: 1, name: 'John', email: 'j@e.com' },
        content_length_range: [100, 300],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const app = buildApp({ sub: 1, role: 'user' });
    // Note: use empty query params to hit the base GET / handler
    const res = await app.request('/api/persona');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      status: true,
      total: 2,
      page: 1,
      pageSize: 9,
    });
    expect(json.data).toHaveLength(1);
  });

  it('meneruskan filter pencarian dan domain ke query', async () => {
    (mockPrisma.persona.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.persona.findMany as jest.Mock).mockResolvedValue([]);

    const app = buildApp({ sub: 1, role: 'user' });
    await app.request('/api/persona?search=test&domain=tech&page=2&pageSize=5');

    expect(mockPrisma.persona.count).toHaveBeenCalled();
    expect(mockPrisma.persona.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
  });
});

// ---------- GET /persona/me ----------

describe('GET /api/persona/me - Persona Saya', () => {
  afterEach(() => jest.clearAllMocks());

  it('mengembalikan persona yang dimiliki oleh pengguna saat ini', async () => {
    (mockPrisma.persona.count as jest.Mock).mockResolvedValue(1);
    (mockPrisma.persona.findMany as jest.Mock).mockResolvedValue([
      {
        id: 5,
        result: {},
        detail: 'mine',
        visibility: 'private',
        domain: { key: 'tech', label: 'Technology' },
        user: { id: 2, name: 'Me', email: 'me@e.com' },
        content_length_range: [100, 200],
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    const app = buildApp({ sub: 2, role: 'user' });
    const res = await app.request('/api/persona/me');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, total: 1 });
    // Verify owner_id filter was used
    expect(mockPrisma.persona.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ owner_id: 2 }),
      }),
    );
  });
});

// ---------- DELETE /persona/:id ----------

describe('DELETE /api/persona/:id - Hapus Persona', () => {
  afterEach(() => jest.clearAllMocks());

  it('menghapus persona dan atribut-atributnya', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue({
      id: 3,
      owner_id: 1,
    });
    (mockPrisma.persona_attribute.deleteMany as jest.Mock).mockResolvedValue(
      {},
    );
    (mockPrisma.persona.delete as jest.Mock).mockResolvedValue({});

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/3', { method: 'DELETE' });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      status: true,
      message: 'Persona deleted successfully',
    });
    expect(mockPrisma.persona_attribute.deleteMany).toHaveBeenCalledWith({
      where: { persona_id: 3 },
    });
    expect(mockPrisma.persona.delete).toHaveBeenCalledWith({
      where: { id: 3 },
    });
  });

  it('mengembalikan 404 ketika persona tidak ditemukan atau bukan milik pengguna', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(null);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/999', { method: 'DELETE' });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'Persona not found' });
  });
});

// ---------- PUT /persona/:id/visibility ----------

describe('PUT /api/persona/:id/visibility - Ubah Visibilitas', () => {
  afterEach(() => jest.clearAllMocks());

  it('memperbarui visibilitas dan mengembalikan persona yang diperbarui', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      owner_id: 1,
    });
    (mockPrisma.persona.update as jest.Mock).mockResolvedValue({
      id: 1,
      visibility: 'public',
    });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/1/visibility', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'public' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true });
  });

  it('mengembalikan 404 ketika persona tidak ditemukan', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(null);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/999/visibility', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visibility: 'public' }),
    });

    expect(res.status).toBe(404);
  });
});

// ---------- PUT /persona/:id/content ----------

describe('PUT /api/persona/:id/content - Ubah Konten', () => {
  afterEach(() => jest.clearAllMocks());

  it('memperbarui hasil konten dan mengembalikan persona yang diperbarui', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      owner_id: 1,
    });
    (mockPrisma.persona.update as jest.Mock).mockResolvedValue({
      id: 1,
      result: { narative: 'updated' },
    });

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/1/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ narative: 'updated' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true });
  });

  it('mengembalikan 404 ketika persona bukan milik pengguna', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(null);

    const app = buildApp({ sub: 2, role: 'user' });
    const res = await app.request('/api/persona/1/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ narative: 'updated' }),
    });

    expect(res.status).toBe(404);
  });
});

// ---------- POST /persona/copy/:id ----------

describe('POST /api/persona/copy/:id - Duplikat Persona', () => {
  afterEach(() => jest.clearAllMocks());

  it('membuat salinan persona dan mengembalikan id baru', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      result: {},
      content_length_range: [100, 300],
      detail: 'Original',
      domain_id: 1,
      llm_id: 1,
      language_id: 1,
      persona_attribute: [{ attribute_id: 5 }],
    });
    (mockPrisma.persona.create as jest.Mock).mockResolvedValue({ id: 200 });
    (mockPrisma.persona_attribute.create as jest.Mock).mockResolvedValue({});

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/copy/1', { method: 'POST' });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: { personaId: 200 } });
  });

  it('mengembalikan 404 ketika persona sumber tidak ditemukan', async () => {
    (mockPrisma.persona.findUnique as jest.Mock).mockResolvedValue(null);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/copy/999', { method: 'POST' });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'Persona not found' });
  });
});

// ---------- Helper endpoints ----------

describe('GET /api/persona/helper/* - Helper Endpoint', () => {
  afterEach(() => jest.clearAllMocks());

  it('GET /helper/domain mengembalikan daftar domain', async () => {
    (mockPrisma.domain.findMany as jest.Mock).mockResolvedValue([
      { id: 1, key: 'tech', label: 'Technology' },
    ]);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/helper/domain');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: [{ key: 'tech' }] });
  });

  it('GET /helper/language mengembalikan daftar bahasa', async () => {
    (mockPrisma.language.findMany as jest.Mock).mockResolvedValue([
      { id: 1, key: 'en', label: 'English' },
    ]);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/helper/language');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: [{ key: 'en' }] });
  });

  it('GET /helper/llm mengembalikan daftar model LLM', async () => {
    (mockPrisma.llm.findMany as jest.Mock).mockResolvedValue([
      { id: 1, key: 'gemini-pro', label: 'Gemini Pro' },
    ]);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/persona/helper/llm');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: [{ key: 'gemini-pro' }] });
  });

  it('GET /helper/attribute?layer=internal mengembalikan atribut internal', async () => {
    (mockPrisma.attribute.findMany as jest.Mock).mockResolvedValue([
      { id: 1, name: 'introvert', layer: 'internal' },
    ]);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request(
      '/api/persona/helper/attribute?layer=internal',
    );

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: [{ name: 'introvert' }] });
    expect(mockPrisma.attribute.findMany).toHaveBeenCalledWith({
      where: { layer: 'internal' },
    });
  });

  it('GET /helper/attribute?layer=invalid mengembalikan 400', async () => {
    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request(
      '/api/persona/helper/attribute?layer=invalid',
    );

    expect(res.status).toBe(400);
  });
});
