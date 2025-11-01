'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import HumanFactorsCard from '@/components/create/cards/human-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCookie } from 'cookies-next/client';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
import type { CreateFormValues } from './types';

const formSchema = z.object({
  domain: z
    .object({
      key: z.string(),
      label: z.string(),
    })
    .required(),
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
  llmModel: z
    .object({
      key: z.string(),
      label: z.string(),
    })
    .required(),
  language: z
    .object({
      key: z.string(),
      label: z.string(),
    })
    .required(),
  useRAG: z.boolean(),
  detail: z.string().optional(),
});

export default function Design() {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain: { key: 'health', label: 'Health' },
      internal: [],
      external: [
        {
          name: 'motivation',
          title: 'Motivation',
          description: 'Primary reasons for using the system',
        },
        {
          name: 'goals',
          title: 'Goals',
          description: 'Objectives the user wants to achieve',
        },
        {
          name: 'pain-points',
          title: 'Pain Points',
          description: 'Key challenges & frustrations',
        },
      ],
      contentLength: 1000,
      llmModel: {
        key: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash Lite',
      },
      language: {
        key: 'en',
        label: 'English',
      },
      useRAG: false,
      detail: '',
    },
  });
  const _cookies = getCookie('token');

  useEffect(() => {
    if (!_cookies) {
      toast.info('You are creating personas as a guest user.');
    }
  }, [_cookies]);

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: CreateFormValues) {
    if (loading) return;
    setLoading(true);
    if (!_cookies) {
      const res = await fetch('/api/persona/generate/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(
          `Failed to create persona(s): ${json.message || 'Unknown error'}`,
        );
        setLoading(false);
        return;
      }
      toast.success('Persona(s) created successfully!');
      try {
        const STORAGE_KEY = 'crafter:personas';
        const entry = {
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          request: data,
          response: json,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
        router.push(`/detail/guest`);
      } catch (err) {
        console.error('Failed to save personas to localStorage:', err);
      }
    } else {
      const res = await fetch('/api/persona/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${_cookies}`,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(
          `Failed to create persona(s): ${json.message || 'Unknown error'}`,
        );
      }
      toast.success('Persona(s) created successfully!');
      router.push(`/detail/${json.personaId}`);
    }
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

        {/* Submit Button */}
        <div>
          {/* LLM Config + Language/Amount */}
          <LLMConfigCard control={form.control} />
          <Button
            className={cn('w-full', loading && 'cursor-not-allowed')}
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner /> Creating...{' '}
              </>
            ) : (
              <>
                <Sparkles />
                Create persona
              </>
            )}
          </Button>
          <p className="mt-2 text-center text-xs text-gray-500">
            By clicking{' '}
            <span className="text-primary">&quot;Create persona&quot;</span>,
            you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Additional details */}
        <AdditionalDetailsCard control={form.control} />
      </form>
    </section>
  );
}
