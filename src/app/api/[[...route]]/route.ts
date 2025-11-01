import { Hono } from 'hono';
import { env } from 'hono/adapter';
import { except } from 'hono/combine';
import { jwt, type JwtVariables } from 'hono/jwt';
import { handle } from 'hono/vercel';

import { auth } from './auth';
import { persona } from './persona';
import { user } from './user';

export type Variables = JwtVariables;

const app = new Hono<{ Variables: Variables }>().basePath('/api');

app.get('/', (c) => c.json({ message: 'Hello' }));

app.use(
  '/*',
  except(
    [
      '*/*/login',
      '*/*/register',
      '*/*/generate/guest',
      '*/*/helper/domain',
      '*/*/helper/attribute',
      '*/*/helper/language',
      '*/*/helper/llm',
    ],
    async (c, next) => {
      const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c);
      const jwtMiddleware = jwt({
        secret: JWT_SECRET,
      });
      return jwtMiddleware(c, next);
    },
  ),
);

app.route('/', auth);
app.route('/', persona);
app.route('/', user);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
