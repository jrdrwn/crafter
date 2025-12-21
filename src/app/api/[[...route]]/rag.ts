import {
  deleteContribution,
  getUserContribution,
  ingestContribution,
  listUserContributions,
  updateContribution,
} from '@/lib/ingestion';
import { normalizeToRAGNote } from '@/lib/persona.service';
import prisma from '@db';
import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import type { JWTPayload } from './types';

export const rag = new Hono().basePath('/rag');

rag.get('/contributions/check', async (c) => {
  // Query params: domain_key, language_key, visibility
  const domain_key = c.req.query('domain_key');
  const language_key = c.req.query('language_key');
  const visibility = c.req.query('visibility'); // 'public' | 'private' | undefined

  // Build Prisma filter
  const where: Record<string, string | undefined> = {};
  if (domain_key) where.domain_key = domain_key;
  if (language_key) where.language_key = language_key;
  if (visibility === 'public' || visibility === 'private')
    where.visibility = visibility;

  // Count matching contributions
  const count = await prisma.rag_documents.count({ where });

  // Check availability
  const available = count > 0;

  return c.json({
    status: true,
    available,
    count,
    domain_key,
    language_key,
    visibility,
  });
});

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
      visibility: z.enum(['public', 'private']).optional(),
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
      visibility: body.visibility,
    });

    return c.json({ status: true, result });
  },
);

rag.get('/contributions', async (c) => {
  const jwt = c.get('jwtPayload') as JWTPayload | undefined;
  if (!jwt?.sub) return c.json({ status: false, message: 'Unauthorized' }, 401);
  const limit = Number(c.req.query('limit') ?? '20');
  const offset = Number(c.req.query('offset') ?? '0');
  const result = await listUserContributions(jwt.sub, { limit, offset });
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
      visibility: z.enum(['public', 'private']).optional(),
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

rag.post('/contributions/upload', async (c) => {
  const jwt = c.get('jwtPayload') as JWTPayload | undefined;
  if (!jwt?.sub) return c.json({ status: false, message: 'Unauthorized' }, 401);

  const form = await c.req.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return c.json({ status: false, message: 'No file uploaded' }, 400);
  }

  const type = (form.get('type') as string) || 'doc';
  const domain_key = (form.get('domain_key') as string) || undefined;
  const language_key = (form.get('language_key') as 'en' | 'id' | null) || null;
  const source = (form.get('source') as string) || undefined;
  const extraStr = (form.get('extra') as string) || '';
  let extra: Record<string, unknown> | undefined;
  try {
    if (extraStr) extra = JSON.parse(extraStr);
  } catch {
    // ignore bad json
  }
  const visibilityStr = (form.get('visibility') as string) || '';
  const visibility =
    visibilityStr === 'public' || visibilityStr === 'private'
      ? (visibilityStr as 'public' | 'private')
      : undefined;

  const name = file.name?.toLowerCase() || 'upload';
  const buf = Buffer.from(await file.arrayBuffer());

  function stripHtmlToText(html: string) {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/(p|div|h\d|li|tr)>/gi, '\n')
      .replace(/<li>/gi, '- ')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  async function extractText(): Promise<string> {
    if (name.endsWith('.txt')) {
      return buf.toString('utf-8');
    }
    if (name.endsWith('.docx')) {
      const { value } = await mammoth.convertToHtml({ buffer: buf });
      return stripHtmlToText(value);
    }
    if (name.endsWith('.xlsx')) {
      const wb = XLSX.read(buf, { type: 'buffer' });
      const parts: string[] = [];
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const csv = XLSX.utils.sheet_to_csv(ws, { FS: ',', RS: '\n' });
        parts.push(`# Sheet: ${sheetName}\n\n${csv}`);
      }
      return parts.join('\n\n---\n\n');
    }
    throw new Error('Unsupported file type. Use .txt, .docx, or .xlsx');
  }

  try {
    const rawText = (await extractText()).trim();
    if (!rawText) throw new Error('File content is empty');

    const normalized = await normalizeToRAGNote(rawText, {
      language: language_key ?? undefined,
      domain: domain_key,
      source,
      filename: file.name,
      format: name.split('.').pop() || 'unknown',
    });

    const allowed: readonly string[] = ['survey', 'interview', 'review', 'doc'];
    const finalType = allowed.includes(type)
      ? (type as 'survey' | 'interview' | 'review' | 'doc')
      : 'doc';

    const result = await ingestContribution({
      text: normalized,
      type: finalType,
      domain_key,
      language_key: language_key ?? undefined,
      author_id: jwt.sub,
      source,
      extra: {
        ...(extra || {}),
        original_filename: file.name,
        original_format: name.split('.').pop() || 'unknown',
        normalized: true,
      },
      visibility: visibility ?? 'private',
    });

    return c.json({ status: true, result });
  } catch (e) {
    return c.json(
      { status: false, message: e instanceof Error ? e.message : String(e) },
      400,
    );
  }
});

BigInt.prototype.toJSON = function () {
  return this.toString();
};
