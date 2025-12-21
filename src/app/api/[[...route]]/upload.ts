import { zValidator } from '@hono/zod-validator';
import ImageKit, { toFile } from '@imagekit/nodejs';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import z from 'zod';

import { JWTPayload } from './types';

export const upload = new Hono().basePath('/upload');

upload.post(
  '/image',
  zValidator(
    'form',
    z.object({
      file: z
        .any()
        .refine((v): v is File => v instanceof File, {
          message: 'File required',
        })
        .refine((f) => f.size <= 2 * 1024 * 1024, {
          message: 'File exceeds 2MB limit',
        }),
    }),
  ),
  async (c) => {
    const jwtPayload = c.get('jwtPayload') as JWTPayload;
    const { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_FOLDER } = env<{
      IMAGEKIT_PRIVATE_KEY: string;
      IMAGEKIT_FOLDER?: string;
    }>(c);
    const imagekit = new ImageKit({ privateKey: IMAGEKIT_PRIVATE_KEY });

    const { file } = c.req.valid('form');

    // file is of type File (Web API)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    try {
      const uploadResponse = await imagekit.files.upload({
        file: await toFile(buffer, file.name),
        fileName: `${jwtPayload.sub}_${Date.now()}_${file.name}`,
        folder: IMAGEKIT_FOLDER || '/crafter',
      });
      return c.json({ status: true, url: uploadResponse.url });
    } catch (error: unknown) {
      let message = 'Unknown error';
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message?: unknown }).message === 'string'
      ) {
        message = (error as { message: string }).message;
      }
      return c.json({ status: false, message }, 500);
    }
  },
);
