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
  contentLength: z
    .number()
    .min(50)
    .max(2000, 'Content length must be between 50 and 2000 words'),
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
      contentLength: persona?.request?.contentLength ?? 1000,
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
      additional: ['contentLength', 'llmModel', 'language', 'useRAG', 'detail'],
      review: [] as (keyof TCreateForm)[],
    }),
    [],
  );

  async function onSubmit(data: TCreateForm) {
    if (loading) return;
    setLoading(true);
    const res = await fetch('/api/persona/generate/guest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setLoading(false);
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

    function isErrorWithMessage(error: unknown): error is { message: string } {
      return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as { message: unknown }).message === 'string'
      );
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
                      <span>{form.getValues('contentLength')}</span>
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
