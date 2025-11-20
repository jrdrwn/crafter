'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import ExternalFactorsCard from '@/components/create/cards/external-factors-card';
import InternalFactorsCard from '@/components/create/cards/internal-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { defineStepper } from '@stepperize/react';
import { getCookie } from 'cookies-next/client';
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
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Spinner } from '../ui/spinner';
import type { CreateFormValues } from './types';

export const createFormSchema = z.object({
  domain: z
    .object({
      key: z.string().min(1, 'Domain is required'),
      label: z.string().min(1, 'Domain is required'),
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

const { useStepper, steps, utils } = defineStepper(
  {
    id: 'domain',
    label: 'Domain',
  },
  {
    id: 'internal',
    label: 'Internal Layer',
  },
  {
    id: 'external',
    label: 'External Layer',
  },
  {
    id: 'additional',
    label: 'Additional Settings',
  },
  {
    id: 'review',
    label: 'Review',
  },
);

export default function Design() {
  const { user } = useUser();
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);

  // Ref for the multi-step form area
  const formSectionRef = useRef<HTMLDivElement>(null);

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    mode: 'onChange',
    defaultValues: {
      domain: { key: '', label: '' },
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
      setLoading(false);
      if (!res.ok) {
        toast.error('Failed to create persona: Unknown error');
        return;
      }
      const json = await res.json();
      toast.success('Persona created successfully!');
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
        toast.error('Failed to save personas to localStorage:', {
          description: (err as any)?.message || 'Please try again later.',
        });
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
      setLoading(false);
      if (!res.ok) {
        toast.error(
          `Failed to create persona: ${user ? 'Unknown error' : 'Please login again'}`,
        );
        return;
      }
      const json = await res.json();

      toast.success('Persona created successfully!');
      router.push(`/detail/${json.personaId}`);
    }
  }

  const stepFields = useMemo(
    () => ({
      domain: ['domain'],
      internal: ['internal'],
      external: ['external'],
      additional: ['contentLength', 'llmModel', 'language', 'useRAG', 'detail'],
      review: [] as (keyof CreateFormValues)[],
    }),
    [],
  );

  const handleNext = async () => {
    const currentId = stepper.current.id as keyof typeof stepFields;
    const fields = stepFields[currentId] as (keyof CreateFormValues)[];
    const ok = fields.length
      ? await form.trigger(fields as Parameters<typeof form.trigger>[0], {
          shouldFocus: true,
        })
      : true;
    if (ok) {
      stepper.next();
      // Scroll to the top of the multi-step form area
      if (formSectionRef.current) {
        formSectionRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  // Handler for Back button with scroll
  const handlePrev = () => {
    stepper.prev();
    if (formSectionRef.current) {
      formSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <section
      ref={formSectionRef}
      className="px-2 py-6 sm:px-4 sm:py-8 md:px-6 md:py-10 lg:py-14 xl:py-16"
    >
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto flex flex-col gap-4 sm:gap-5 md:gap-6"
      >
        {/* Headless navigation */}
        <nav aria-label="Create Steps" className="group my-2">
          <ol className="flex items-center justify-between gap-1 sm:gap-2">
            {steps.map((s, idx, arr) => (
              <Fragment key={s.id}>
                <li
                  key={s.id}
                  className="flex shrink-0 flex-col items-center gap-1 sm:gap-2 md:gap-3 lg:flex-row"
                >
                  <Button
                    type="button"
                    role="tab"
                    variant={idx <= currentIndex ? 'default' : 'secondary'}
                    aria-current={
                      stepper.current.id === s.id ? 'step' : undefined
                    }
                    aria-posinset={idx + 1}
                    aria-setsize={steps.length}
                    aria-selected={stepper.current.id === s.id}
                    className="flex size-8 items-center justify-center rounded-full text-xs sm:size-9 sm:text-sm md:size-10"
                    onClick={async () => {
                      if (idx <= currentIndex) {
                        stepper.goTo(s.id);
                        return;
                      }
                      if (idx - currentIndex > 1) return;
                      const fields = stepFields[
                        stepper.current.id as keyof typeof stepFields
                      ] as (keyof CreateFormValues)[];
                      const valid = fields.length
                        ? await form.trigger(
                            fields as Parameters<typeof form.trigger>[0],
                            { shouldFocus: true },
                          )
                        : true;
                      if (!valid) return;
                      stepper.goTo(s.id);
                    }}
                  >
                    {idx + 1}
                  </Button>
                  <span className="hidden text-xs font-medium sm:inline sm:text-sm md:text-base">
                    {s.label}
                  </span>
                </li>
                {idx < arr.length - 1 && (
                  <Separator
                    className={`${idx < currentIndex ? 'bg-primary' : 'bg-muted'} flex-1`}
                  />
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        <div className="mt-2 sm:mt-4 md:mt-6">
          {stepper.switch({
            domain: () => (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                <DomainCard control={form.control} />
              </div>
            ),
            internal: () => (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                <InternalFactorsCard control={form.control} />
              </div>
            ),
            external: () => (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-3">
                <ExternalFactorsCard control={form.control} />
              </div>
            ),
            additional: () => (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <div>
                  <ContentLengthCard control={form.control} />
                </div>
                <div>
                  <LLMConfigCard control={form.control} />
                </div>
                <div className="md:col-span-2 lg:col-span-1">
                  <AdditionalDetailsCard control={form.control} />
                </div>
              </div>
            ),
            review: () => (
              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <div className="col-span-1 md:col-span-2 lg:col-span-3">
                  <div className="mb-1 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                    <h3 className="text-base font-semibold sm:text-lg">
                      Review your inputs
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Make sure everything looks correct before creating.
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

                <Card className="md:col-span-2 lg:col-span-1">
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
                      <span>{form.getValues('contentLength')} words</span>
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
                        <p className="mt-1 max-h-15 overflow-auto rounded bg-muted/40 p-2 text-xs whitespace-pre-line text-muted-foreground">
                          {form.getValues('detail') || '-'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ),
          })}
        </div>

        {/* Controls */}
        <div
          className={cn(
            'mt-4 flex flex-col items-stretch gap-3 sm:mt-6 sm:flex-row sm:items-center',
            stepper.isLast ? 'sm:justify-between' : 'sm:justify-end sm:gap-4',
          )}
        >
          {stepper.isLast ? (
            <>
              <p className="order-2 text-center text-xs text-muted-foreground sm:order-1">
                By clicking &quot;Create persona&quot;, you agree to our Terms
                of Service and Privacy Policy.
              </p>
              <div className="order-1 flex items-center gap-3 sm:order-2 sm:gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handlePrev}
                  disabled={stepper.isFirst}
                  className="flex-1 sm:flex-none"
                >
                  Back
                </Button>
                <Button
                  className={cn(
                    'flex-1 sm:w-48',
                    loading && 'cursor-not-allowed',
                  )}
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
              </div>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrev}
                disabled={stepper.isFirst}
                className="flex-1 sm:flex-none"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none"
              >
                Next
              </Button>
            </>
          )}
        </div>
      </form>
    </section>
  );
}
