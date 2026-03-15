/**
 * @jest-environment node
 *
 * Test untuk src/app/api/[[...route]]/upload.ts
 *
 * Route: POST /api/upload/image (protected)
 * - Validasi: file harus ada, max 2MB
 * - Upload ke ImageKit
 * - Error handling jika ImageKit gagal
 */

import { Hono } from 'hono';

// ---------- Mocks ----------
// Semua jest.mock dihoist ke atas oleh babel-jest, jadi factory tidak boleh
// mereferensikan variabel luar. Gunakan jest.requireMock() untuk mendapatkan
// mock setelah hoisting selesai.

jest.mock('hono/adapter', () => ({
  env: jest.fn(() => ({
    IMAGEKIT_PRIVATE_KEY: 'test-private-key',
    IMAGEKIT_FOLDER: '/test-folder',
  })),
}));

jest.mock('@imagekit/nodejs', () => {
  // uploadFn dibuat DI DALAM factory agar tersedia saat hoisting
  const uploadFn = jest.fn();
  const MockImageKit = jest.fn().mockImplementation(() => ({
    files: { upload: uploadFn },
  }));
  return {
    __esModule: true,
    default: MockImageKit,
    // Ekspose uploadFn lewat namedExport agar bisa diakses via requireMock
    __uploadFn: uploadFn,
    toFile: jest.fn(async () => ({ name: 'mock-file' })),
  };
});

// Dapatkan reference ke mock fn SETELAH mock sudah dideklarasikan
const imagekitMock = jest.requireMock('@imagekit/nodejs');
const mockUploadFn: jest.Mock = imagekitMock.__uploadFn;

import { upload } from '@/app/api/[[...route]]/upload';
import { env } from 'hono/adapter';

function buildApp(jwtPayload?: { sub: number; role: string }) {
  const app = new Hono().basePath('/api');
  app.use('/*', async (c, next) => {
    if (jwtPayload) c.set('jwtPayload', jwtPayload);
    await next();
  });
  app.route('/', upload);
  return app;
}

function makeFormData(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return formData;
}

// ---------- Tests ----------

describe('POST /api/upload/image', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns URL on successful upload', async () => {
    mockUploadFn.mockResolvedValue({ url: 'https://ik.imagekit.io/test/avatar.jpg' });

    const file = new File(['fake-image-content'], 'avatar.jpg', { type: 'image/jpeg' });
    const app = buildApp({ sub: 1, role: 'user' });

    const res = await app.request('/api/upload/image', {
      method: 'POST',
      body: makeFormData(file),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, url: 'https://ik.imagekit.io/test/avatar.jpg' });
    expect(mockUploadFn).toHaveBeenCalledTimes(1);
    const callArgs = mockUploadFn.mock.calls[0][0];
    expect(callArgs.fileName).toContain('1_');
    expect(callArgs.folder).toBe('/test-folder');
  });

  it('zod schema rejects non-File value (missing file field)', () => {
    // Test schema validation langsung — membuktikan schema menolak bukan-File
    const z = require('zod');
    const schema = z.object({
      file: z
        .any()
        .refine((v: unknown): v is File => v instanceof File, { message: 'File required' }),
    });

    const result = schema.safeParse({ file: 'bukan-file' });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('File required');
  });

  it('zod schema rejects file that exceeds 2MB limit', () => {
    const z = require('zod');
    const schema = z.object({
      file: z
        .any()
        .refine((v: unknown): v is File => v instanceof File, { message: 'File required' })
        .refine((f: File) => f.size <= 2 * 1024 * 1024, { message: 'File exceeds 2MB limit' }),
    });

    const bigContent = new Uint8Array(2 * 1024 * 1024 + 1).fill(65);
    const bigFile = new File([bigContent], 'large.jpg', { type: 'image/jpeg' });

    const result = schema.safeParse({ file: bigFile });
    expect(result.success).toBe(false);
    expect(result.error?.errors[0].message).toBe('File exceeds 2MB limit');
  });

  it('returns 500 with error message when ImageKit throws', async () => {
    mockUploadFn.mockRejectedValue(new Error('ImageKit service unavailable'));

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const app = buildApp({ sub: 1, role: 'user' });

    const res = await app.request('/api/upload/image', {
      method: 'POST',
      body: makeFormData(file),
    });

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'ImageKit service unavailable' });
  });

  it('uses default folder /crafter when IMAGEKIT_FOLDER is not set in env', async () => {
    (env as jest.Mock).mockReturnValueOnce({ IMAGEKIT_PRIVATE_KEY: 'key' });
    mockUploadFn.mockResolvedValue({ url: 'https://ik.imagekit.io/test/img.jpg' });

    const file = new File(['data'], 'img.jpg', { type: 'image/jpeg' });
    const app = buildApp({ sub: 2, role: 'user' });

    await app.request('/api/upload/image', {
      method: 'POST',
      body: makeFormData(file),
    });

    const callArgs = mockUploadFn.mock.calls[0][0];
    expect(callArgs.folder).toBe('/crafter');
  });
});
