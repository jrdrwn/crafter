import { runPersonaRAG } from '@/lib/persona.service';
import prisma from '@db';
import { zValidator } from '@hono/zod-validator';
import { layer, visibility } from '@prisma/client';
import { Hono } from 'hono';
import YAML from 'yaml';
import z from 'zod';

import { JWTPayload } from './types';

export const persona = new Hono().basePath('/persona');

persona.post(
  '/generate/guest',
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
      contentLengthRange: z.array(z.number()).length(2),
      llmModel: z.object({ key: z.string(), label: z.string() }).required(),
      language: z
        .object({ key: z.enum(['en', 'id']), label: z.string() })
        .required(),
      useRAG: z.boolean(),
      detail: z.string().optional(),
    }),
  ),
  async (c) => {
    const json = c.req.valid('json');

    const construct = YAML.stringify({
      expected_output_structure: {
        json_schema: {
          language: json.language.label,
          content_length_range: {
            min: `${json.contentLengthRange[0]} words`,
            max: `${json.contentLengthRange[1]} words`,
          },
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

    const queryTerms = [
      json.detail ?? '',
      json.domain.key,
      json.domain.label,
      ...json.internal.map((f) => `${f.name} ${f.title} ${f.description}`),
      ...json.external.map((f) => `${f.name} ${f.title} ${f.description}`),
    ].filter(Boolean);

    const result = await runPersonaRAG(json.llmModel.key, construct, {
      topK: json.useRAG ? 8 : 0,
      skipRAG: !json.useRAG,
      filters: {
        domain_key: json.domain.key,
        language_key: json.language.key,
      },
      queryTerms,
      contentLengthRange: json.contentLengthRange,
    });

    return c.json(result);
  },
);

persona.post(
  '/generate',
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
      contentLengthRange: z.array(z.number()).length(2),
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
          content_length_range: {
            min: `${json.contentLengthRange[0]} words`,
            max: `${json.contentLengthRange[1]} words`,
          },
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

    const queryTerms = [
      json.detail ?? '',
      json.domain.key,
      json.domain.label,
      ...json.internal.map((f) => `${f.name} ${f.title} ${f.description}`),
      ...json.external.map((f) => `${f.name} ${f.title} ${f.description}`),
    ].filter(Boolean);

    const result = await runPersonaRAG(json.llmModel.key, construct, {
      topK: json.useRAG ? 8 : 0,
      skipRAG: !json.useRAG,
      filters: {
        domain_key: json.domain.key,
        language_key: json.language.key,
        author_id: jwtPayload.sub,
      },
      queryTerms,
      contentLengthRange: json.contentLengthRange,
    });

    let domain = await prisma.domain.findUnique({
      where: { key: json.domain.key },
    });

    if (!domain) {
      domain = await prisma.domain.create({
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
        content_length_range: json.contentLengthRange,
        detail: json.detail,
        domain_id: domain.id,
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

persona.put(
  '/:id',
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
      contentLengthRange: z.array(z.number()).length(2),
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
          content_length_range: {
            min: `${json.contentLengthRange[0]} words`,
            max: `${json.contentLengthRange[1]} words`,
          },
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

    const queryTerms = [
      json.detail ?? '',
      json.domain.key,
      json.domain.label,
      ...json.internal.map((f) => `${f.name} ${f.title} ${f.description}`),
      ...json.external.map((f) => `${f.name} ${f.title} ${f.description}`),
    ].filter(Boolean);

    const result = await runPersonaRAG(json.llmModel.key, construct, {
      topK: json.useRAG ? 8 : 0,
      skipRAG: !json.useRAG,
      filters: {
        domain_key: json.domain.key,
        language_key: json.language.key,
        author_id: jwtPayload.sub,
      },
      queryTerms,
      contentLengthRange: json.contentLengthRange,
    });

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
        content_length_range: json.contentLengthRange,
        detail: json.detail,
        domain_id: domain!.id,
        visibility: oldPersona?.visibility || visibility.private,
        llm_id: llmModel!.id,
        language_id: language!.id,
        updated_at: new Date(),
      },
    });

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

persona.put('/:id/visibility', async (c) => {
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
      updated_at: new Date(),
    },
  });
  return c.json({ status: true, data: updatedPersona });
});

persona.delete('/:id', async (c) => {
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

// Query schema for pagination/filter/order
const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(9),
  domain: z.string().optional(),
  order: z
    .enum(['recent', 'updated', 'alphabetical'])
    .optional()
    .default('recent'),
  search: z.string().optional(),
  mine: z.coerce.boolean().optional().default(false),
});

persona.get('/', zValidator('query', listQuerySchema), async (c) => {
  const { page, pageSize, domain, order, search, mine } = c.req.valid('query');
  const jwtPayload = c.get('jwtPayload') as JWTPayload | undefined;

  const where = {
    visibility: visibility.public,
    ...(domain ? { domain: { key: domain } } : {}),
    ...(mine && jwtPayload?.sub ? { owner_id: jwtPayload.sub } : {}),
    ...(search
      ? {
          OR: [
            { detail: { contains: search, mode: 'insensitive' as const } },
            {
              domain: {
                label: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {}),
  } as const;

  const total = await prisma.persona.count({ where });

  const orderBy =
    order === 'updated'
      ? { updated_at: 'desc' as const }
      : { created_at: 'desc' as const }; // 'recent' and fallback for 'alphabetical'

  const personas = await prisma.persona.findMany({
    where,
    select: {
      id: true,
      result: true,
      content_length_range: true,
      detail: true,
      visibility: true,
      created_at: true,
      updated_at: true,
      domain: {
        select: { key: true, label: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy,
  });

  return c.json({ status: true, data: personas, total, page, pageSize });
});

persona.get('/me', zValidator('query', listQuerySchema), async (c) => {
  const jwtPayload = c.get('jwtPayload') as JWTPayload;
  const { page, pageSize, domain, order, search } = c.req.valid('query');

  const where = {
    owner_id: jwtPayload.sub,
    ...(domain ? { domain: { key: domain } } : {}),
    ...(search
      ? {
          OR: [
            { detail: { contains: search, mode: 'insensitive' as const } },
            {
              domain: {
                label: { contains: search, mode: 'insensitive' as const },
              },
            },
          ],
        }
      : {}),
  } as const;

  const total = await prisma.persona.count({ where });

  const orderBy =
    order === 'updated'
      ? { updated_at: 'desc' as const }
      : { created_at: 'desc' as const };

  const personas = await prisma.persona.findMany({
    where,
    select: {
      id: true,
      result: true,
      content_length_range: true,
      detail: true,
      visibility: true,
      created_at: true,
      updated_at: true,
      domain: {
        select: { key: true, label: true },
      },
      user: {
        select: { id: true, name: true, email: true },
      },
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy,
  });

  return c.json({ status: true, data: personas, total, page, pageSize });
});

persona.get('/:id', async (c) => {
  const id = c.req.param('id');
  const persona = await prisma.persona.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      result: true,
      content_length_range: true,
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

persona.post('/copy/:id', async (c) => {
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
      content_length_range: persona.content_length_range,
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

persona.put('/:id/content', async (c) => {
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
      updated_at: new Date(),
    },
  });
  return c.json({ status: true, data: updatedPersona });
});

persona.get('/helper/domain', async (c) => {
  const domains = await prisma.domain.findMany();
  return c.json({ status: true, data: domains });
});

persona.get(
  '/helper/attribute',
  zValidator(
    'query',
    z.object({
      layer: z.enum([layer.internal, layer.external]),
    }),
  ),
  async (c) => {
    const validLayerQuery = c.req.valid('query').layer;
    const attributes = await prisma.attribute.findMany({
      where: {
        layer: validLayerQuery,
      },
    });
    return c.json({
      status: true,
      data: attributes,
    });
  },
);

persona.get('/helper/language', async (c) => {
  const languages = await prisma.language.findMany();
  return c.json({ status: true, data: languages });
});

persona.get('/helper/llm', async (c) => {
  const llmModels = await prisma.llm.findMany();
  return c.json({ status: true, data: llmModels });
});
