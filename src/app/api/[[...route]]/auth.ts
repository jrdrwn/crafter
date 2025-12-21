import prisma from '@db';
import { zValidator } from '@hono/zod-validator';
import bcrypt from 'bcryptjs';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { sign } from 'hono/jwt';
import z from 'zod';

export const auth = new Hono().basePath('/auth');

auth.post(
  '/login',
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

    const user = await prisma.user.findUnique({
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

auth.post(
  '/register',
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

    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return c.json({ status: false, message: 'User already exists' }, 409);
    }

    const newUser = await prisma.user.create({
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
