/* eslint-disable prefer-const */
'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import ExternalFactorsCard from '@/components/create/cards/external-factors-card';
import InternalFactorsCard from '@/components/create/cards/internal-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import { TCreateForm } from '@/components/create/construct';
import { ConstructStepperForm } from '@/components/shared/construct-stepper-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import {
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  FileText,
  Languages,
  Layers,
  LucideMessageSquareWarning,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Badge } from '../../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Separator } from '../../ui/separator';
import { Spinner } from '../../ui/spinner';

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
  contentLengthRange: z.array(z.number()).length(2),
  llmModel: z.object({ key: z.string(), label: z.string() }).required(),
  language: z
    .object({
      key: z.string(),
      label: z.string(),
    })
    .required(),
  useRAG: z.boolean(),
  detail: z.string().optional(),
});

const { useStepper, steps, utils } = defineStepper(
  { id: 'domain', label: 'Domain' },
  { id: 'internal', label: 'Internal Layer' },
  { id: 'external', label: 'External Layer' },
  { id: 'additional', label: 'Additional Settings' },
  { id: 'review', label: 'Review' },
);

export interface PersonaData {
  created_at: string;
  updated_at: string;
  request: TCreateForm;
  response: unknown;
}

export default function Design({ persona }: { persona: PersonaData | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);
  const form = useForm<TCreateForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      domain: persona?.request?.domain ?? { key: 'health', label: 'Health' },
      internal: persona?.request?.internal ?? [],
      external: persona?.request?.external ?? [
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
      contentLengthRange: persona?.request?.contentLengthRange ?? [300, 1000],
      llmModel: persona?.request?.llmModel ?? {
        key: 'gemini-2.5-flash-lite',
        label: 'Gemini 2.5 Flash Lite',
      },
      language:
        persona?.request?.language ??
        ({ key: 'en', label: 'English' } as const),
      useRAG: persona?.request?.useRAG ?? false,
      detail: persona?.request?.detail ?? '',
    },
  });

  const stepFields = useMemo(
    () => ({
      domain: ['domain'],
      internal: ['internal'],
      external: ['external'],
      additional: [
        'contentLengthRange',
        'llmModel',
        'language',
        'useRAG',
        'detail',
      ],
      review: [] as (keyof TCreateForm)[],
    }),
    [],
  );

  async function onSubmit(data: TCreateForm) {
    if (loading) return;
    setLoading(true);

    // Progressive toast timers
    let toast10: number | undefined,
      toast20: number | undefined,
      toast30: number | undefined,
      toast60: number | undefined;
    let finished = false;
    function clearTimers() {
      finished = true;
      if (toast10) clearTimeout(toast10);
      if (toast20) clearTimeout(toast20);
      if (toast30) clearTimeout(toast30);
      if (toast60) clearTimeout(toast60);
    }
    toast10 = window.setTimeout(() => {
      if (!finished)
        toast.info(
          'Still working... Persona editing is taking longer than usual (10s).',
        );
    }, 10000);
    toast20 = window.setTimeout(() => {
      if (!finished)
        toast.info(
          'Still working... Persona editing is taking over 20 seconds.',
        );
    }, 20000);
    toast30 = window.setTimeout(() => {
      if (!finished) toast.warning('This is taking a while (30s+).');
    }, 30000);
    toast60 = window.setTimeout(() => {
      if (!finished) toast.error('Editing is taking more than 1 minute.');
    }, 60000);

    try {
      const res = await fetch('/api/persona/generate/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setLoading(false);
      clearTimers();
      if (!res.ok) {
        toast.error('Failed to edit persona: Unknown error');
        return;
      }
      const json = await res.json();
      toast.success('Persona edited successfully!');
      try {
        const STORAGE_KEY = 'crafter:personas';
        const entry = {
          created_at: persona?.created_at ?? new Date().toISOString(),
          updated_at: new Date().toISOString(),
          request: data,
          response: json as unknown,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
        router.push(`/detail/guest`);
      } catch (err: unknown) {
        let description = 'Please try again later.';
        if (isErrorWithMessage(err)) {
          description = err.message;
        }
        toast.error('Failed to save personas to localStorage:', {
          description,
        });
      }

      function isErrorWithMessage(
        error: unknown,
      ): error is { message: string } {
        return (
          typeof error === 'object' &&
          error !== null &&
          'message' in error &&
          typeof (error as { message: unknown }).message === 'string'
        );
      }
    } finally {
      clearTimers();
    }
  }

  return (
    <ConstructStepperForm
      steps={steps}
      currentIndex={currentIndex}
      isLast={stepper.isLast}
      isFirst={stepper.isFirst}
      goTo={stepper.goTo as (id: string) => void}
      next={stepper.next}
      prev={stepper.prev}
      stepFields={stepFields}
      form={form}
      onSubmit={onSubmit}
      loading={loading}
      submitLabel="Edit persona"
      submitIcon={<Sparkles />}
      loadingLabel="Editing..."
      loadingIcon={<Spinner />}
      agreementText={
        <>
          By clicking &quot;Edit persona&quot;, you agree to our Terms of
          Service and Privacy Policy.
        </>
      }
      renderStep={(stepId) => {
        switch (stepId) {
          case 'domain':
            return (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <DomainCard control={form.control} />
              </div>
            );
          case 'internal':
            return (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <InternalFactorsCard control={form.control} />
              </div>
            );
          case 'external':
            return (
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <ExternalFactorsCard control={form.control} />
              </div>
            );
          case 'additional':
            return (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <ContentLengthCard control={form.control} />
                </div>
                <div>
                  <LLMConfigCard control={form.control} />
                </div>
                <div>
                  <AdditionalDetailsCard control={form.control} />
                </div>
              </div>
            );
          case 'review':
            return (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">
                      Review your inputs
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Make sure everything looks correct before editing.
                  </p>
                </div>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Overview
                    </CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Domain:</span>
                      <Badge variant="secondary">
                        {form.getValues('domain')?.label || '-'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Model:</span>
                      <span>{form.getValues('llmModel')?.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Language:</span>
                      <span>{form.getValues('language')?.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <LucideMessageSquareWarning className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Note:</span>
                      <span>
                        {form.getValues('useRAG') &&
                        form.getValues('internal').length +
                          form.getValues('external').length >
                          5
                          ? 'RAG is enabled and you have selected many factors. Generation may take up to a minute.'
                          : form.getValues('useRAG')
                            ? 'RAG is enabled. Generation may take a bit longer than usual.'
                            : form.getValues('internal').length +
                                  form.getValues('external').length >
                                5
                              ? 'You have selected many factors. Generation may take longer.'
                              : 'No special notes.'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Factors
                    </CardTitle>
                    <Layers className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium">Internal</span>
                        <span className="text-xs text-muted-foreground">
                          ({form.getValues('internal')?.length || 0})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(form.getValues('internal') || []).map((i) => (
                          <Badge key={i.name} variant="secondary">
                            {i.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-medium">External</span>
                        <span className="text-xs text-muted-foreground">
                          ({form.getValues('external')?.length || 0})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(form.getValues('external') || []).map((e) => (
                          <Badge key={e.name} variant="outline">
                            {e.title}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Generation Settings
                    </CardTitle>
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Content length:</span>
                      <span>
                        {form.getValues('contentLengthRange')[0]} -{' '}
                        {form.getValues('contentLengthRange')[1]} words
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Use RAG:</span>
                      <Badge
                        variant={
                          form.getValues('useRAG') ? 'default' : 'secondary'
                        }
                      >
                        {form.getValues('useRAG') ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-2">
                      <StickyNote className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div className="w-full">
                        <span className="font-medium">Detail</span>
                        <p className="mt-1 max-h-28 overflow-auto rounded bg-muted/40 p-2 text-xs whitespace-pre-line text-muted-foreground">
                          {form.getValues('detail') || '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          default:
            return null;
        }
      }}
    />
  );
}
