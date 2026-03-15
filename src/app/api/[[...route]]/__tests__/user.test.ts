/**
 * @jest-environment node
 *
 * Test untuk src/app/api/[[...route]]/user.ts
 *
 * Route: GET /api/user/profile (protected — butuh jwtPayload di context)
 */

import { Hono } from 'hono';

// ---------- Mocks ----------

jest.mock('@db', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

import prisma from '@db';
import { user } from '@/app/api/[[...route]]/user';

const mockFindUnique = prisma.user.findUnique as jest.Mock;

// Build app dengan inject jwtPayload manual ke context
function buildApp(jwtPayload?: { sub: number; role: string }) {
  const app = new Hono().basePath('/api');

  // Middleware untuk inject jwtPayload (simulasi JWT middleware passed)
  app.use('/*', async (c, next) => {
    if (jwtPayload) c.set('jwtPayload', jwtPayload);
    await next();
  });

  app.route('/', user);
  return app;
}

// ---------- Tests ----------

describe('GET /api/user/profile', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns user data on success', async () => {
    const fakeUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      created_at: new Date('2024-01-01'),
      updated_at: new Date('2024-01-02'),
    };
    mockFindUnique.mockResolvedValue(fakeUser);

    const app = buildApp({ sub: 1, role: 'user' });
    const res = await app.request('/api/user/profile');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ status: true, data: { id: 1, name: 'John Doe', email: 'john@example.com' } });
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.objectContaining({ id: true, name: true, email: true }),
    });
  });

  it('returns 404 when user not found in database', async () => {
    mockFindUnique.mockResolvedValue(null);

    const app = buildApp({ sub: 99, role: 'user' });
    const res = await app.request('/api/user/profile');

    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json).toMatchObject({ status: false, message: 'User not found' });
  });
});
