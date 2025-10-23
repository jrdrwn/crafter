import { runPersonaRAG } from '@/lib/personaRagService';
import prisma from '@db';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { except } from 'hono/combine';
import { jwt, sign, type JwtVariables } from 'hono/jwt';
import { handle } from 'hono/vercel';
import YAML from 'yaml';
import z from 'zod';

import { JWTPayload } from './types';

export type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>().basePath('/api');

app.get('/', (c) => c.json({ message: 'Hello' }));

app.use(
  '/*',
  except(['*/*/login', '*/*/register', '*/guest/chat'], async (c, next) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
    const jwtMiddleware = jwt({
      secret: JWT_SECRET,
    });
    return jwtMiddleware(c, next);
  }),
);

app.post(
  '/auth/login',
  zValidator(
    'json',
    z.object({
      identifier: z
        .string()
        .email('Invalid email format')
        .min(1, 'Email is required'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters long'),
    }),
  ),
  async (c) => {
    const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);

    const validated = c.req.valid('json');

    const user = await prisma.users.findUnique({
      where: {
        email: validated.identifier,
      },
    });

    if (!user) {
      return c.json({ status: false, message: 'User not found' }, 404);
    }

    const match = await bcrypt.compare(validated.password, user.password!);

    if (!match) {
      return c.json({ status: false, message: 'Password not match' }, 401);
    }
    const payload = {
      sub: user.id,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    };
    const token = await sign(payload, JWT_SECRET);

    return c.json({
      status: true,
      data: {
        token,
      },
    });
  },
);

app.post(
  '/auth/register',
  zValidator(
    'json',
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      password: z.string().min(8),
    }),
  ),
  async (c) => {
    const validated = c.req.valid('json');
    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const existingUser = await prisma.users.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return c.json({ status: false, message: 'User already exists' }, 409);
    }

    const newUser = await prisma.users.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
      },
    });

    return c.json({
      status: true,
      data: { user_id: newUser.id },
    });
  },
);

app.get('/user/profile', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const user = await prisma.users.findUnique({
    where: { id: jwtPayload.sub },
    select: {
      id: true,
      name: true,
      email: true,
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) {
    return c.json({ status: false, message: 'User not found' }, 404);
  }

  return c.json({ status: true, data: user });
});

app.post('/guest/chat', async (c) => {
  const json = await c.req.json();
  const construct = YAML.stringify({
    expected_output_structure: {
      json_schema: {
        language: json.language.label,
        persona_result_max_length: json.contentLength,
        result: {
          narative: '...',
          bullets: '...',
          mixed: '...',
          quote: '...',
          full_name: '...',
        },
        taxonomy: {
          domain: json.domain,
          detail: json.detail,
          internal: json.internal,
          external: json.external,
        },
      },
    },
  });

  // const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const result = await runPersonaRAG(json.llmModel, construct, 8);
  return c.json(result);
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
