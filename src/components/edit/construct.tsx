'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import HumanFactorsCard from '@/components/create/cards/human-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import type { CreateFormValues } from '@/components/create/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCookie } from 'cookies-next/client';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

const formSchema = z.object({
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
  language: z.object({ key: z.string(), label: z.string() }).required(),
  useRAG: z.boolean(),
  detail: z.string().optional(),
});

export interface PersonaData {
  id: number;
  detail: string;
  domain: { key: string; label: string };
  max_length: number;
  persona_attribute: {
    attribute: {
      id: number;
      layer: 'internal' | 'external';
      name: string;
      title: string;
      description: string;
    };
  }[];
  result: {
    full_name: string;
    quote: string;
    mixed: string;
    bullets: string;
    narative: string;
  };
  llm: { key: string; label: string };
  visibility: 'private' | 'public';
  created_at: string;
  updated_at: string;
  useRAG: boolean;
  language: { key: string; label: string };
}

export default function Design({
  personaId,
  persona,
}: {
  personaId: string;
  persona: PersonaData;
}) {
  const _cookies = getCookie('token');
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: persona?.domain ?? { key: 'health', label: 'Health' },
      internal: persona?.persona_attribute
        .filter((attr) => attr.attribute.layer === 'internal')
        .map((attr) => ({
          name: attr.attribute.name,
          title: attr.attribute.title,
          description: attr.attribute.description,
        })),
      external: persona?.persona_attribute
        .filter((attr) => attr.attribute.layer === 'external')
        .map((attr) => ({
          name: attr.attribute.name,
          title: attr.attribute.title,
          description: attr.attribute.description,
        })),
      contentLength: persona?.max_length,
      llmModel: persona?.llm,
      language: persona?.language,
      useRAG: persona?.useRAG ?? false,
      detail: persona?.detail,
    },
  });

  async function onSubmit(data: CreateFormValues) {
    if (loading) return;
    setLoading(true);
    const res = await fetch(`/api/persona/${personaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_cookies}`,
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      toast.error(
        `Failed to edit persona(s): ${json.message || 'Unknown error'}`,
      );
      setLoading(false);
      return;
    }
    toast.success('Persona(s) edited successfully!');
    router.push(`/detail/${personaId}`);
    setLoading(false);
  }

  return (
    <section className="p-4 py-16">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto grid grid-cols-3 gap-8"
      >
        {/* Domain */}
        <DomainCard control={form.control} />
        {/* Human Factors */}
        <HumanFactorsCard control={form.control} />
        {/* Content Length */}
        <ContentLengthCard control={form.control} />
        {/* Submit + LLM */}
        <div>
          <LLMConfigCard control={form.control} />
          <Button
            className={cn('w-full', loading && 'cursor-not-allowed')}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> Editing...{' '}
              </>
            ) : (
              <>
                <Sparkles />
                Edit persona
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-gray-500">
            By clicking{' '}
            <span className="text-primary">&quot;Edit persona&quot;</span>, you
            agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
        {/* Additional details */}
        <AdditionalDetailsCard control={form.control} />
      </form>
    </section>
  );
}
