import { runPersonaRAG } from '@/lib/personaRagService';
import prisma from '@db';
import { zValidator } from '@hono/zod-validator';
import { layer, visibility } from '@prisma/client';
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
  except(
    [
      '*/*/login',
      '*/*/register',
      '*/guest/chat',
      '*/domain',
      '*/attribute',
      '*/language',
      '*/llm',
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

app.get('/user/profile', async (c) => {
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

app.post(
  '/guest/chat',
  zValidator(
    'json',
    z.object({
      domain: z.object({ key: z.string(), label: z.string() }).required(),
      internal: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one internal factor'),
      external: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one external factor'),
      contentLength: z
        .number()
        .min(50)
        .max(2000, 'Content length must be between 50 and 2000 words'),
      llmModel: z.object({ key: z.string(), label: z.string() }).required(),
      language: z
        .object({ key: z.enum(['en', 'id']), label: z.string() })
        .required(),
      amount: z.coerce
        .number()
        .min(1, 'At least 1 persona')
        .max(3, 'Maximum 3 personas'),
      detail: z.string().optional(),
    }),
  ),
  async (c) => {
    const json = c.req.valid('json');

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

    const result = await runPersonaRAG(json.llmModel.key, construct, 8);

    return c.json(result);
  },
);

app.post(
  '/chat',
  zValidator(
    'json',
    z.object({
      domain: z.object({ key: z.string(), label: z.string() }).required(),
      internal: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one internal factor'),
      external: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one external factor'),
      contentLength: z
        .number()
        .min(50)
        .max(2000, 'Content length must be between 50 and 2000 words'),
      llmModel: z.object({ key: z.string(), label: z.string() }).required(),
      language: z
        .object({ key: z.enum(['en', 'id']), label: z.string() })
        .required(),
      useRAG: z.boolean(),
      detail: z.string().optional(),
    }),
  ),
  async (c) => {
    const jwtPayload = c.get('jwtPayload') as JWTPayload;
    const json = c.req.valid('json');

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
    const result = await runPersonaRAG(json.llmModel.key, construct, 8);

    const domain = await prisma.domain.findUnique({
      where: { key: json.domain.key },
    });

    if (!domain) {
      await prisma.domain.create({
        data: {
          key: json.domain.key,
          label: json.domain.label,
        },
      });
    }

    const language = await prisma.language.findUnique({
      where: { key: json.language.key },
    });

    const llmModel = await prisma.llm.findUnique({
      where: { key: json.llmModel.key },
    });

    const newPersona = await prisma.persona.create({
      data: {
        owner_id: jwtPayload.sub,
        result: result.result,
        max_length: json.contentLength,
        detail: json.detail,
        domain_id: domain!.id,
        visibility: visibility.private,
        llm_id: llmModel!.id,
        language_id: language!.id,
      },
    });

    json.internal.forEach(async (factor) => {
      let attr = await prisma.attribute.findUnique({
        where: { name: factor.name },
      });
      if (!attr) {
        attr = await prisma.attribute.create({
          data: {
            name: factor.name,
            title: factor.title,
            description: factor.description,
            layer: layer.internal,
          },
        });
      }

      await prisma.persona_attribute.create({
        data: {
          persona_id: newPersona.id,
          attribute_id: attr.id,
        },
      });
    });

    json.external.forEach(async (factor) => {
      let attr = await prisma.attribute.findUnique({
        where: { name: factor.name },
      });
      if (!attr) {
        attr = await prisma.attribute.create({
          data: {
            name: factor.name,
            title: factor.title,
            description: factor.description,
            layer: layer.external,
          },
        });
      }
      await prisma.persona_attribute.create({
        data: {
          persona_id: newPersona.id,
          attribute_id: attr.id,
        },
      });
    });

    return c.json({ result, personaId: newPersona.id });
  },
);

app.put(
  '/persona/:id',
  zValidator(
    'json',
    z.object({
      domain: z.object({ key: z.string(), label: z.string() }).required(),
      internal: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one internal factor'),
      external: z
        .array(
          z.object({
            name: z.string(),
            title: z.string(),
            description: z.string(),
          }),
        )
        .min(1, 'Select at least one external factor'),
      contentLength: z
        .number()
        .min(50)
        .max(2000, 'Content length must be between 50 and 2000 words'),
      llmModel: z.object({ key: z.string(), label: z.string() }).required(),
      language: z
        .object({ key: z.enum(['en', 'id']), label: z.string() })
        .required(),
      useRAG: z.boolean(),
      detail: z.string().optional(),
    }),
  ),
  async (c) => {
    const jwtPayload = c.get('jwtPayload') as JWTPayload;
    const id = c.req.param('id');
    const json = c.req.valid('json');

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

    const oldPersona = await prisma.persona.findUnique({
      where: { id: Number(id) },
    });

    const result = await runPersonaRAG(json.llmModel.key, construct, 8);

    const domain = await prisma.domain.findUnique({
      where: { key: json.domain.key },
    });

    if (!domain) {
      await prisma.domain.create({
        data: {
          key: json.domain.key,
          label: json.domain.label,
        },
      });
    }

    const language = await prisma.language.findUnique({
      where: { key: json.language.key },
    });

    const llmModel = await prisma.llm.findUnique({
      where: { key: json.llmModel.key },
    });

    const updatedPersona = await prisma.persona.update({
      where: { id: Number(id) },
      data: {
        owner_id: jwtPayload.sub,
        result: result.result,
        max_length: json.contentLength,
        detail: json.detail,
        domain_id: domain!.id,
        visibility: oldPersona?.visibility || visibility.private,
        llm_id: llmModel!.id,
        language_id: language!.id,
      },
    });

    // const newPersona = await prisma.persona.create({
    //   data: {
    //     owner_id: jwtPayload.sub,
    //     result: result.result,
    //     max_length: json.contentLength,
    //     detail: json.detail,
    //     domain_id: domain!.id,
    //     visibility: visibility.private,
    //     llm_id: llmModel!.id,
    //     language_id: language!.id,
    //   },
    // });

    // clean persona_attribute first
    await prisma.persona_attribute.deleteMany({
      where: { persona_id: updatedPersona.id },
    });

    json.internal.forEach(async (factor) => {
      let attr = await prisma.attribute.findUnique({
        where: { name: factor.name },
      });
      if (!attr) {
        attr = await prisma.attribute.create({
          data: {
            name: factor.name,
            title: factor.title,
            description: factor.description,
            layer: layer.internal,
          },
        });
      }

      await prisma.persona_attribute.create({
        data: {
          persona_id: updatedPersona.id,
          attribute_id: attr.id,
        },
      });
    });

    json.external.forEach(async (factor) => {
      let attr = await prisma.attribute.findUnique({
        where: { name: factor.name },
      });
      if (!attr) {
        attr = await prisma.attribute.create({
          data: {
            name: factor.name,
            title: factor.title,
            description: factor.description,
            layer: layer.external,
          },
        });
      }
      await prisma.persona_attribute.create({
        data: {
          persona_id: updatedPersona.id,
          attribute_id: attr.id,
        },
      });
    });

    return c.json(result);
  },
);

app.put('/persona/:id/visibility', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const id = c.req.param('id');
  const { visibility: newVisibility } = await c.req.json();
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id), owner_id: jwtPayload.sub },
  });
  if (!persona) {
    return c.json({ status: false, message: 'Persona not found' }, 404);
  }

  const updatedPersona = await prisma.persona.update({
    where: { id: Number(id) },
    data: {
      visibility: newVisibility,
    },
  });
  return c.json({ status: true, data: updatedPersona });
});

app.delete('/persona/:id', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const id = c.req.param('id');
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id), owner_id: jwtPayload.sub },
  });
  if (!persona) {
    return c.json({ status: false, message: 'Persona not found' }, 404);
  }
  await prisma.persona_attribute.deleteMany({
    where: { persona_id: Number(id) },
  });
  await prisma.persona.delete({
    where: { id: Number(id) },
  });
  return c.json({ status: true, message: 'Persona deleted successfully' });
});

app.get('/persona', async (c) => {
  const personas = await prisma.persona.findMany({
    where: { visibility: visibility.public },
    select: {
      id: true,
      result: true,
      max_length: true,
      detail: true,
      visibility: true,
      created_at: true,
      updated_at: true,
      domain: {
        select: {
          key: true,
          label: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return c.json({ status: true, data: personas });
});

app.get('/persona/me', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const personas = await prisma.persona.findMany({
    where: { owner_id: jwtPayload.sub },
    select: {
      id: true,
      result: true,
      max_length: true,
      detail: true,
      visibility: true,
      created_at: true,
      updated_at: true,
      domain: {
        select: {
          key: true,
          label: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return c.json({ status: true, data: personas });
});

app.get('/persona/:id', async (c) => {
  const id = c.req.param('id');
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      result: true,
      max_length: true,
      detail: true,
      visibility: true,
      created_at: true,
      updated_at: true,
      persona_attribute: {
        select: {
          attribute: true,
        },
      },
      domain: {
        select: {
          key: true,
          label: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      llm: true,
      language: true,
    },
  });
  if (!persona) {
    return c.json({ status: false, message: 'Persona not found' }, 404);
  }
  return c.json({ status: true, data: persona });
});

app.post('persona/copy/:id', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const id = c.req.param('id');
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id) },
    include: {
      persona_attribute: {
        include: {
          attribute: true,
        },
      },
    },
  });
  if (!persona) {
    return c.json({ status: false, message: 'Persona not found' }, 404);
  }
  const newPersona = await prisma.persona.create({
    data: {
      owner_id: jwtPayload.sub,
      result: persona.result || {},
      max_length: persona.max_length,
      detail: persona.detail,
      domain_id: persona.domain_id,
      visibility: visibility.private,
      llm_id: persona.llm_id,
      language_id: persona.language_id,
    },
  });
  persona.persona_attribute.forEach(async (pa) => {
    await prisma.persona_attribute.create({
      data: {
        persona_id: newPersona.id,
        attribute_id: pa.attribute_id,
      },
    });
  });
  return c.json({ status: true, data: { personaId: newPersona.id } });
});

app.put('/persona/:id/content', async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const id = c.req.param('id');
  const result = await c.req.json();
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id), owner_id: jwtPayload.sub },
  });
  if (!persona) {
    return c.json({ status: false, message: 'Persona not found' }, 404);
  }
  const updatedPersona = await prisma.persona.update({
    where: { id: Number(id) },
    data: {
      result,
    },
  });
  return c.json({ status: true, data: updatedPersona });
});

app.get('/domain', async (c) => {
  const domains = await prisma.domain.findMany();
  return c.json({ status: true, data: domains });
});

app.get('/attribute', async (c) => {
  const attributes = await prisma.attribute.findMany();
  return c.json({
    status: true,
    data: {
      internal: attributes.filter((attr) => attr.layer === 'internal'),
      external: attributes.filter((attr) => attr.layer === 'external'),
    },
  });
});

app.get('/language', async (c) => {
  const languages = await prisma.language.findMany();
  return c.json({ status: true, data: languages });
});

app.get('/llm', async (c) => {
  const llmModels = await prisma.llm.findMany();
  return c.json({ status: true, data: llmModels });
});

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
