/* eslint-disable prefer-const */
'use client';

import { Button, Button as UIButton } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/contexts/user-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCookie } from 'cookies-next/client';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  ClipboardList,
  Database,
  FileText,
  Languages,
  PlusCircle,
  Upload,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Spinner } from '../ui/spinner';

const ContributionSchema = z.object({
  text: z.string().optional().default(''),
  type: z.enum(['survey', 'interview', 'review', 'doc'], {
    required_error: 'Type is required',
  }),
  visibility: z.enum(['public', 'private']).optional(),
  domain_key: z.string().optional().or(z.literal('')),
  language_key: z.enum(['en', 'id']).optional(),
  source: z.string().optional().or(z.literal('')),

  extra: z
    .string()
    .optional()
    .transform((v) => (v ? v.trim() : ''))
    .refine(
      (v) => {
        if (!v) return true;
        try {
          const parsed = JSON.parse(v);
          return typeof parsed === 'object' && parsed !== null;
        } catch {
          return false;
        }
      },
      { message: 'Extra must be valid JSON' },
    ),
});

// Use input type for react-hook-form compatibility
// (schema output makes `extra` required after transform)
type ContributionForm = z.input<typeof ContributionSchema>;

// Creatable Domain Combobox
function DomainCombobox({
  value,
  onChange,
}: {
  value?: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [domains, setDomains] = useState<Array<{ key: string; label: string }>>(
    [],
  );
  const [query, setQuery] = useState('');

  const selected = domains.find((d) => d.key === value);

  async function loadDomains() {
    if (domains.length || loadingDomains) return;
    try {
      setLoadingDomains(true);
      const res = await fetch('/api/persona/helper/domain');
      if (!res.ok) throw new Error('Failed to load domains');
      const json = (await res.json()) as {
        status: boolean;
        data: Array<{ key: string; label: string }>;
      };
      setDomains(json.data || []);
    } catch {
      // silent
    } finally {
      setLoadingDomains(false);
    }
  }

  const createLabel =
    query && !domains.some((d) => d.key.toLowerCase() === query.toLowerCase())
      ? `Create new: "${query}"`
      : '';

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) loadDomains();
      }}
    >
      <PopoverTrigger asChild>
        <UIButton
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate text-left">
            {selected
              ? selected.label
              : value
                ? value
                : 'Choose or type a domain'}
          </span>
          <div className="flex items-center gap-1">
            {value ? (
              <X
                className="size-4 opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
              />
            ) : null}
            <ChevronsUpDown className="size-4 opacity-60" />
          </div>
        </UIButton>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder="Search domain or type new..."
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>
              {createLabel ? (
                <button
                  className="flex w-full items-center gap-2 px-2 py-2 text-left text-sm"
                  onClick={() => {
                    onChange(query);
                    setOpen(false);
                  }}
                >
                  <PlusCircle className="size-4" /> {createLabel}
                </button>
              ) : (
                'No domains'
              )}
            </CommandEmpty>
            <CommandGroup heading="Available domains">
              {domains.map((d) => (
                <CommandItem
                  key={d.key}
                  value={`${d.key} ${d.label}`}
                  onSelect={() => {
                    onChange(d.key);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 size-4 ${
                      d.key === value ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="flex flex-col">
                    <span className="text-sm">{d.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {d.key}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {query && (
              <CommandGroup heading="Actions">
                <CommandItem
                  value={`__create__ ${query}`}
                  onSelect={() => {
                    onChange(query);
                    setOpen(false);
                  }}
                >
                  <PlusCircle className="mr-2 size-4" /> Create &quot;{query}
                  &quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function Contrib() {
  const t = useTranslations('contrib');
  const { user, loading } = useUser();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // section toggles
  const [showText, setShowText] = useState(true);
  const [showFile, setShowFile] = useState(false);
  const [showMeta, setShowMeta] = useState(false);

  // metadata builder state
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [metaObj, setMetaObj] = useState<Record<string, string>>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<ContributionForm>({
    resolver: zodResolver(ContributionSchema),
    defaultValues: {
      type: 'review',
      visibility: 'private',
      language_key: 'en',
      domain_key: '',
      source: '',
      text: '',
      extra: '',
    },
  });

  const textValue = watch('text');
  const TOKEN_LIMIT = Number(process.env.NEXT_PUBLIC_RAG_TOKEN_LIMIT ?? 40000);

  const rawText = (textValue ?? '').trim();
  const textTokens = Math.ceil((rawText.length || 0) / 4);
  const fileTokens = file ? Math.ceil(file.size / 4) : 0;
  const activeTokens =
    showFile && file ? fileTokens : showText ? textTokens : 0;

  const hasText = rawText.length > 0;
  const canSubmit =
    ((showText && hasText) || (showFile && !!file)) &&
    activeTokens <= TOKEN_LIMIT;

  function addMetaPair() {
    const k = metaKey.trim();
    if (!k) return;
    setMetaObj((prev) => ({ ...prev, [k]: metaValue }));
    setMetaKey('');
    setMetaValue('');
  }
  function removeMetaKey(k: string) {
    setMetaObj((prev) => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  }

  async function onSubmit(values: ContributionForm) {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    const token = getCookie('token');
    if (!token) {
      toast.error('Token not found');
      return;
    }

    if (!showText && !showFile) {
      toast.error('Select at least one option: text input or upload file');
      return;
    }

    if (activeTokens > TOKEN_LIMIT) {
      toast.error('Token limit exceeded', {
        description: `Estimated tokens ${activeTokens} > limit ${TOKEN_LIMIT}. Reduce input size.`,
      });
      return;
    }

    // Progressive toast timers for long-running RAG creation
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
          'Still working... RAG contribution is taking longer than usual (10s).',
        );
    }, 10000);
    toast20 = window.setTimeout(() => {
      if (!finished)
        toast.info(
          'Still working... RAG contribution is taking over 20 seconds.',
        );
    }, 20000);
    toast30 = window.setTimeout(() => {
      if (!finished)
        toast.warning('This is taking a while (30s+). Please wait.');
    }, 30000);
    toast60 = window.setTimeout(() => {
      if (!finished) toast.error('Contribution is taking more than 1 minute.');
    }, 60000);

    const visibility = values.visibility || 'private';

    // File upload flow
    if (showFile && file) {
      const name = file.name.toLowerCase();
      if (!/[.](txt|docx|xlsx)$/i.test(name)) {
        toast.error('Unsupported format', {
          description: 'Only .txt, .docx, or .xlsx',
        });
        clearTimers();
        return;
      }

      setSubmitting(true);
      try {
        const type = watch('type') || 'doc';
        const domain_key = watch('domain_key') || '';
        const language_key = watch('language_key') || 'en';
        const source = watch('source') || '';

        const fd = new FormData();
        fd.append('file', file);
        fd.append('type', type);
        if (domain_key) fd.append('domain_key', domain_key);
        if (language_key) fd.append('language_key', language_key);
        if (source) fd.append('source', source);
        const extraMerged = { ...metaObj, visibility };
        fd.append('extra', JSON.stringify(extraMerged));

        const res = await fetch('/api/rag/contributions/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        clearTimers();
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(payload?.message || 'Failed to upload file');
        }
        const json = (await res.json()) as {
          status: boolean;
          result?: { chunks: number };
        };
        toast.success('File uploaded', {
          description: `${json?.result?.chunks ?? 0} chunks saved to RAG`,
          icon: <CheckCircle2 className="size-4 text-green-600" />,
        });
        setFile(null);
        return;
      } catch (e) {
        clearTimers();
        toast.error('Failed', {
          description: e instanceof Error ? e.message : 'An error occurred',
          icon: <AlertCircle className="size-4 text-red-600" />,
        });
        return;
      } finally {
        setSubmitting(false);
        // reset file input
        const fileInput = document.getElementById(
          'file',
        ) as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
      }
    }

    // Text flow
    if (showText) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/rag/contributions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: values.text,
            type: values.type,
            domain_key: values.domain_key || undefined,
            language_key: values.language_key,
            source: values.source || undefined,
            extra: { ...metaObj, visibility },
          }),
        });
        clearTimers();
        if (!res.ok) {
          const payload = await res.json().catch(() => ({}));
          throw new Error(
            (payload as { message?: string })?.message ||
              'Failed to save contribution',
          );
        }

        const json = (await res.json()) as {
          status: boolean;
          result?: { chunks: number };
        };
        toast.success('Contribution uploaded', {
          description: `${json?.result?.chunks ?? 0} chunks saved to RAG`,
          icon: <CheckCircle2 className="size-4 text-green-600" />,
        });
        reset({
          type: undefined,
          visibility: 'private',
          language_key: 'en',
          domain_key: '',
          source: '',
          text: '',
          extra: '',
        });
        setMetaObj({});
      } catch (e) {
        clearTimers();
        const message = e instanceof Error ? e.message : 'An error occurred';
        toast.error('Failed', {
          description: message,
          icon: <AlertCircle className="size-4 text-red-600" />,
        });
      } finally {
        setSubmitting(false);

        const fileInput = document.getElementById(
          'file',
        ) as HTMLInputElement | null;
        if (fileInput) fileInput.value = '';
      }
    }
    clearTimers();
  }

  return (
    <section className="container mx-auto max-w-4xl pb-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
            <div>
              <CardTitle className="text-lg sm:text-xl">{t('title')}</CardTitle>
              <CardDescription className="text-sm">{t('desc')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!loading && !user ? (
            <div className="flex flex-col items-start gap-3 rounded-md border p-4 text-sm sm:flex-row sm:items-center">
              <AlertCircle className="size-4 shrink-0 text-amber-600" />
              <p>{t('not-signed-in')}</p>
            </div>
          ) : null}

          {/* Toggles */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">{t('toggle.text.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('toggle.text.desc')}
                </p>
              </div>
              <Switch checked={showText} onCheckedChange={setShowText} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">{t('toggle.file.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('toggle.file.desc')}
                </p>
              </div>
              <Switch checked={showFile} onCheckedChange={setShowFile} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2 lg:col-span-1">
              <div className="text-sm">
                <p className="font-medium">{t('toggle.meta.title')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('toggle.meta.desc')}
                </p>
              </div>
              <Switch checked={showMeta} onCheckedChange={setShowMeta} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            {/* Row 1: Content Type | Visibility | Language */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <ClipboardList className="size-4" /> {t('type.label')}
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id="type"
                        aria-invalid={!!errors.type}
                        className="w-full"
                      >
                        <SelectValue placeholder={t('type.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survey">
                          {t('type.survey')}
                        </SelectItem>
                        <SelectItem value="interview">
                          {t('type.interview')}
                        </SelectItem>
                        <SelectItem value="review">
                          {t('type.review')}
                        </SelectItem>
                        <SelectItem value="doc">{t('type.doc')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-destructive">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility" className="flex items-center gap-2">
                  {t('visibility.label')}
                </Label>
                <Controller
                  name="visibility"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="visibility" className="w-full">
                        <SelectValue
                          placeholder={t('visibility.placeholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">
                          {t('visibility.public')}
                        </SelectItem>
                        <SelectItem value="private">
                          {t('visibility.private')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="language_key"
                  className="flex items-center gap-2"
                >
                  <Languages className="size-4" /> {t('language.label')}
                </Label>
                <Controller
                  name="language_key"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="language_key" className="w-full">
                        <SelectValue placeholder={t('language.placeholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">{t('language.en')}</SelectItem>
                        <SelectItem value="id">{t('language.id')}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Row 2: Domain | Source */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
              <div className="space-y-2">
                <Label htmlFor="domain_key">{t('domain.label')}</Label>
                <Controller
                  name="domain_key"
                  control={control}
                  render={({ field }) => (
                    <DomainCombobox
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.domain_key && (
                  <p className="text-xs text-destructive">
                    {errors.domain_key.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">{t('source.label')}</Label>
                <Input
                  id="source"
                  placeholder={t('source.placeholder')}
                  {...register('source')}
                />
              </div>
            </div>

            {showText ? (
              <div className="space-y-2">
                <Label htmlFor="text" className="flex items-center gap-2">
                  <FileText className="size-4" /> {t('text.label')}
                </Label>
                <Textarea
                  id="text"
                  rows={10}
                  placeholder={t('text.placeholder')}
                  aria-invalid={!!errors.text}
                  className="w-full"
                  {...register('text')}
                />
                {errors.text && (
                  <p className="text-xs text-destructive">
                    {errors.text.message}
                  </p>
                )}
              </div>
            ) : null}

            {showMeta ? (
              <div className="rounded-md border p-4">
                <Label>{t('meta.label')}</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder={t('meta.key-placeholder')}
                    value={metaKey}
                    onChange={(e) => setMetaKey(e.target.value)}
                    className="w-full"
                  />
                  <Input
                    placeholder={t('meta.value-placeholder')}
                    value={metaValue}
                    onChange={(e) => setMetaValue(e.target.value)}
                    className="w-full"
                  />
                  <Button
                    type="button"
                    onClick={addMetaPair}
                    className="w-full sm:w-auto"
                  >
                    {t('meta.add')}
                  </Button>
                </div>
                {Object.keys(metaObj).length ? (
                  <ul className="mt-3 space-y-2">
                    {Object.entries(metaObj).map(([k, v]) => (
                      <li
                        key={k}
                        className="flex flex-col items-start justify-between gap-2 rounded border px-2 py-1 text-sm sm:flex-row sm:items-center"
                      >
                        <span className="truncate break-all">
                          <strong>{k}:</strong> {String(v)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMetaKey(k)}
                          className="w-full sm:w-auto"
                        >
                          {t('meta.remove')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('meta.empty')}
                  </p>
                )}
              </div>
            ) : null}

            {showFile ? (
              <div className="rounded-md border p-4">
                <Label htmlFor="file">{t('file.label')}</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.docx,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="w-full"
                  />
                </div>
                {file ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {t('file.selected', {
                      name: file.name,
                      size: Math.ceil(file.size / 1024),
                    })}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Database className="size-4 shrink-0" />
                <span className="break-all">
                  {activeTokens > 0
                    ? t('tokens.count', {
                        count: activeTokens,
                        limit: TOKEN_LIMIT,
                      })
                    : t('tokens.limit', { limit: TOKEN_LIMIT })}
                </span>
              </span>
              <Button
                type="submit"
                disabled={submitting || loading || !user || !canSubmit}
                aria-disabled={submitting || loading || !user || !canSubmit}
                title={
                  activeTokens > TOKEN_LIMIT
                    ? t('tokens.exceeds')
                    : !((showText && hasText) || (showFile && !!file))
                      ? t('submit.disabled')
                      : undefined
                }
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Spinner className="mr-2 size-4" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                {t('submit.label')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
