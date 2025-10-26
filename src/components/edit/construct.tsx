'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import HumanFactorsCard from '@/components/create/cards/human-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import type { CreateFormValues } from '@/components/create/types';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
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
  llmModel: z.string().nonempty('Please select an LLM model'),
  language: z
    .object({ key: z.enum(['en', 'id']), label: z.string() })
    .required(),
  amount: z.coerce
    .number()
    .min(1, 'At least 1 persona')
    .max(3, 'Maximum 3 personas'),
  detail: z.string().optional(),
});

export default function Design() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      llmModel: 'gemini-2.5-flash-lite',
      language: { key: 'en', label: 'English' },
      amount: 1,
      detail: '',
    },
  });

  async function onSubmit(data: CreateFormValues) {
    if (loading) return;
    setLoading(true);
    const res = await fetch('/api/guest/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        response: json as unknown,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
      router.push(`/detail/guest`);
    } catch (err) {
      console.error('Failed to save personas to localStorage:', err);
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
