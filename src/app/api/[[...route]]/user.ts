import prisma from '@db';
import { Hono } from 'hono';

import { JWTPayload } from './types';

export const user = new Hono().basePath('/user');

user.get('/profile', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const user = await prisma.user.findUnique({
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
