/**
 * @jest-environment node
 *
 * Test untuk src/app/api/[[...route]]/auth.ts
 *
 * Strategi:
 * - Mock prisma dan bcrypt agar test tidak butuh DB sungguhan
 * - Mock hono/jwt sign agar tidak butuh secret key
 * - Test setiap branch: happy path, user not found, wrong password, user exists
 */

// Import AFTER mocks are set up
import { auth } from '@/app/api/[[...route]]/auth';
import prisma from '@db';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { sign } from 'hono/jwt';

// ---------- Mocks ----------

// Mock prisma client
jest.mock('@db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Mock hono/jwt sign
jest.mock('hono/jwt', () => ({
  sign: jest.fn(),
  jwt: jest.fn(() => async (_c: unknown, next: () => Promise<void>) => next()),
}));

// Mock hono/adapter env
jest.mock('hono/adapter', () => ({
  env: jest.fn(() => ({ JWT_SECRET: 'test-secret' })),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockSign = sign as jest.MockedFunction<typeof sign>;

// Wrap auth router in a base Hono app (same as route.ts does)
function buildApp() {
  const app = new Hono().basePath('/api');
  app.route('/', auth);
  return app;
}

// ---------- Tests ----------

describe('POST /api/auth/login - Login Pengguna', () => {
  const app = buildApp();

  afterEach(() => jest.clearAllMocks());

  it('mengembalikan 404 ketika pengguna tidak ditemukan', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'notfound@example.com',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'User not found' });
  });

  it('mengembalikan 401 ketika password tidak cocok', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed',
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user@example.com',
        password: 'wrongpass',
      }),
    });

    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json).toMatchObject({
      status: false,
      message: 'Password not match',
    });
  });

  it('mengembalikan token saat login berhasil', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'user@example.com',
      password: 'hashed',
    });
    (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockSign.mockResolvedValue('jwt-token-abc');

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user@example.com',
        password: 'validpass123',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      status: true,
      data: { token: 'jwt-token-abc' },
    });
  });

  it('mengembalikan 400 untuk schema JSON tidak valid (email salah)', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'not-an-email',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(400);
  });

  it('mengembalikan 400 ketika password terlalu pendek', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'user@example.com',
        password: 'short',
      }),
    });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/register - Registrasi Pengguna', () => {
  const app = buildApp();

  afterEach(() => jest.clearAllMocks());

  it('mengembalikan 409 ketika email sudah terdaftar', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'existing@example.com',
    });
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed');

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'existing@example.com',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json).toMatchObject({
      status: false,
      message: 'User already exists',
    });
  });

  it('membuat pengguna dan mengembalikan user_id saat berhasil', async () => {
    (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (mockBcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    (mockPrisma.user.create as jest.Mock).mockResolvedValue({ id: 42 });

    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New User',
        email: 'new@example.com',
        password: 'securepass123',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: { user_id: 42 } });
    expect(mockBcrypt.hash).toHaveBeenCalledWith('securepass123', 10);
  });

  it('mengembalikan 400 untuk schema tidak valid (nama kosong)', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    expect(res.status).toBe(400);
  });
});
