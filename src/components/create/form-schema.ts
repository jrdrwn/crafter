import z from 'zod';

export const formSchema = z.object({
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
});

export type FormSchema = z.infer<typeof formSchema>;
