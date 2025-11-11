import {
  deleteContribution,
  getUserContribution,
  ingestContribution,
  listUserContributions,
  updateContribution,
} from '@/lib/ingestion';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import type { JWTPayload } from './types';

export const rag = new Hono().basePath('/rag');

rag.post(
  '/contributions',
  zValidator(
    'json',
    z.object({
      text: z.string().min(1),
      type: z.enum(['survey', 'interview', 'review', 'doc']),
      domain_key: z.string().optional(),
      language_key: z.enum(['en', 'id']).optional(),
      source: z.string().optional(),
      extra: z.record(z.any()).optional(),
    }),
  ),
  async (c) => {
    const body = c.req.valid('json');
    const jwt = c.get('jwtPayload') as JWTPayload | undefined;

    const result = await ingestContribution({
      text: body.text,
      type: body.type,
      domain_key: body.domain_key,
      language_key: body.language_key,
      author_id: jwt?.sub,
      source: body.source,
      extra: body.extra,
    });

    return c.json({ status: true, result });
  },
);

rag.get('/contributions', async (c) => {
  const jwt = c.get('jwtPayload') as JWTPayload | undefined;
  if (!jwt?.sub) return c.json({ status: false, message: 'Unauthorized' }, 401);
  const limit = Number(c.req.query('limit') ?? '20');
  const cursor = c.req.query('cursor')
    ? Number(c.req.query('cursor'))
    : undefined;
  const result = await listUserContributions(jwt.sub, { limit, cursor });
  return c.json({ status: true, ...result });
});

rag.get('/contributions/:id', async (c) => {
  const jwt = c.get('jwtPayload') as JWTPayload | undefined;
  if (!jwt?.sub) return c.json({ status: false, message: 'Unauthorized' }, 401);
  const id = Number(c.req.param('id'));
  const row = await getUserContribution(jwt.sub, id);
  if (!row) return c.json({ status: false, message: 'Not found' }, 404);
  return c.json({ status: true, data: row });
});

rag.put(
  '/contributions/:id',
  zValidator(
    'json',
    z.object({
      text: z.string().min(1).optional(),
      type: z.enum(['survey', 'interview', 'review', 'doc']).optional(),
      domain_key: z.string().optional(),
      language_key: z.enum(['en', 'id']).optional(),
      source: z.string().optional(),
      extra: z.record(z.any()).optional(),
    }),
  ),
  async (c) => {
    const jwt = c.get('jwtPayload') as JWTPayload | undefined;
    if (!jwt?.sub)
      return c.json({ status: false, message: 'Unauthorized' }, 401);
    const id = Number(c.req.param('id'));
    const body = c.req.valid('json');
    try {
      const result = await updateContribution(jwt.sub, id, body);
      return c.json({ status: true, result });
    } catch (e) {
      if ((e as Error).message === 'not_found')
        return c.json({ status: false, message: 'Not found' }, 404);
      throw e;
    }
  },
);

rag.delete('/contributions/:id', async (c) => {
  const jwt = c.get('jwtPayload') as JWTPayload | undefined;
  if (!jwt?.sub) return c.json({ status: false, message: 'Unauthorized' }, 401);
  const id = Number(c.req.param('id'));
  try {
    const result = await deleteContribution(jwt.sub, id);
    return c.json({ status: true, result });
  } catch (e) {
    if ((e as Error).message === 'not_found')
      return c.json({ status: false, message: 'Not found' }, 404);
    throw e;
  }
});

BigInt.prototype.toJSON = function () {
  return this.toString();
};
