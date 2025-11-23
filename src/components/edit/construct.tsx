'use client';

import AdditionalDetailsCard from '@/components/create/cards/additional-details-card';
import ContentLengthCard from '@/components/create/cards/content-length-card';
import DomainCard from '@/components/create/cards/domain-card';
import ExternalFactorsCard from '@/components/create/cards/external-factors-card';
import InternalFactorsCard from '@/components/create/cards/internal-factors-card';
import LLMConfigCard from '@/components/create/cards/llm-config-card';
import { ConstructStepperForm } from '@/components/shared/construct-stepper-form';
import { useUser } from '@/contexts/user-context';
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
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { TCreateForm } from '../create/construct';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
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
  contentLengthRange: z.array(z.number()).length(2),
  llmModel: z.object({ key: z.string(), label: z.string() }).required(),
  language: z.object({ key: z.string(), label: z.string() }).required(),
  useRAG: z.boolean(),
  detail: z.string().optional(),
});

export interface PersonaData {
  id: number;
  detail: string;
  domain: { key: string; label: string };
  content_length_range: number[];
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

const { useStepper, steps, utils } = defineStepper(
  { id: 'domain', label: 'Domain' },
  { id: 'internal', label: 'Internal Layer' },
  { id: 'external', label: 'External Layer' },
  { id: 'additional', label: 'Additional Settings' },
  { id: 'review', label: 'Review' },
);

export default function Design({
  personaId,
  persona,
}: {
  personaId: string;
  persona: PersonaData;
}) {
  const stepper = useStepper();
  const currentIndex = utils.getIndex(stepper.current.id);
  const { user } = useUser();
  const _cookies = getCookie('token');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm<TCreateForm>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
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
      contentLengthRange: persona.content_length_range ?? [300, 1000],
      llmModel: persona?.llm,
      language: persona?.language,
      useRAG: persona?.useRAG ?? false,
      detail: persona?.detail,
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
    const res = await fetch(`/api/persona/${personaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_cookies}`,
      },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) {
      toast.error(
        `Failed to edit persona: ${user ? 'Unknown error' : 'Please login again'}`,
      );
      return;
    }
    await res.json();

    toast.success('Persona edited successfully!');
    router.push(`/detail/${personaId}`);
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
