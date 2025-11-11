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
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ContributionSchema = z.object({
  text: z.string().min(1, 'Teks tidak boleh kosong'),
  type: z.enum(['survey', 'interview', 'review', 'doc'], {
    required_error: 'Jenis wajib dipilih',
  }),
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
      { message: 'Extra harus berupa JSON valid' },
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
      ? `Buat baru: "${query}"`
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
                : 'Pilih atau ketik domain'}
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
            placeholder="Cari domain atau ketik baru..."
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
                'Tidak ada domain'
              )}
            </CommandEmpty>
            <CommandGroup heading="Domain tersedia">
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
                    className={`mr-2 size-4 ${d.key === value ? 'opacity-100' : 'opacity-0'}`}
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
              <CommandGroup heading="Aksi">
                <CommandItem
                  value={`__create__ ${query}`}
                  onSelect={() => {
                    onChange(query);
                    setOpen(false);
                  }}
                >
                  <PlusCircle className="mr-2 size-4" /> Buat &quot;{query}
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
  const { user, loading } = useUser();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
    setValue,
  } = useForm<ContributionForm>({
    resolver: zodResolver(ContributionSchema),
    defaultValues: {
      type: 'review',
      language_key: 'en',
      domain_key: '',
      source: '',
      text: '',
      extra: '',
    },
  });

  const textValue = watch('text');
  const charCount = textValue?.length ?? 0;
  const approxTokens = useMemo(
    () => Math.ceil((charCount || 0) / 4),
    [charCount],
  );

  async function onSubmit(values: ContributionForm) {
    if (!user) {
      toast.error('Harap login terlebih dahulu');
      return;
    }
    const token = getCookie('token');
    if (!token) {
      toast.error('Token tidak ditemukan');
      return;
    }

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
          extra: values.extra ? JSON.parse(values.extra) : undefined,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          (payload as { message?: string })?.message ||
            'Gagal menyimpan kontribusi',
        );
      }

      const json = (await res.json()) as {
        status: boolean;
        result?: { chunks: number };
      };
      toast.success('Kontribusi berhasil diunggah', {
        description: `${json?.result?.chunks ?? 0} potongan disimpan ke RAG`,
        icon: <CheckCircle2 className="size-4 text-green-600" />,
      });
      reset({
        type: undefined,
        language_key: 'en',
        domain_key: '',
        source: '',
        text: '',
        extra: '',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Terjadi kesalahan';
      toast.error('Gagal', {
        description: message,
        icon: <AlertCircle className="size-4 text-red-600" />,
      });
    } finally {
      setSubmitting(false);
    }
  }

  function fillExample() {
    setValue(
      'text',
      'User interview: The onboarding feels confusing. I expected a guided tour. I love the dashboard charts but exporting to CSV is hidden. I use the product 3x/week for reporting. Biggest pain: permissions settings are hard to find.',
      { shouldDirty: true },
    );
    setValue('type', 'interview', { shouldDirty: true });
    setValue('domain_key', 'analytics', { shouldDirty: true });
    setValue('language_key', 'en', { shouldDirty: true });
    setValue('source', 'UX Research Sprint 12', { shouldDirty: true });
  }

  return (
    <section className="container mx-auto max-w-4xl pb-4">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                Manajemen Pengetahuan RAG
              </CardTitle>
              <CardDescription>
                Kelola pengetahuan dengan mengunggah hasil riset, wawancara,
                ulasan, maupun dokumen. Data akan dipecah menjadi chunk dan
                diindeks ke vektor store.
              </CardDescription>
            </div>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <Database className="size-4" />
              <span>{approxTokens} ~tokens</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!loading && !user ? (
            <div className="flex items-center gap-3 rounded-md border p-4 text-sm">
              <AlertCircle className="size-4 text-amber-600" />
              <p>
                Anda belum masuk. Silakan login untuk mengunggah kontribusi.
              </p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type" className="flex items-center gap-2">
                  <ClipboardList className="size-4" /> Jenis Konten
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="type" aria-invalid={!!errors.type}>
                        <SelectValue placeholder="Pilih jenis" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="survey">Survey</SelectItem>
                        <SelectItem value="interview">Interview</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="doc">Dokumen</SelectItem>
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
                <Label
                  htmlFor="language_key"
                  className="flex items-center gap-2"
                >
                  <Languages className="size-4" /> Bahasa
                </Label>
                <Controller
                  name="language_key"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="language_key">
                        <SelectValue placeholder="Pilih bahasa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain_key">
                  Domain (pilih atau buat baru)
                </Label>
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
                <Label htmlFor="source">Sumber (opsional)</Label>
                <Input
                  id="source"
                  placeholder="mis. Sprint 12 Research"
                  {...register('source')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text" className="flex items-center gap-2">
                <FileText className="size-4" /> Isi Kontribusi
              </Label>
              <Textarea
                id="text"
                rows={10}
                placeholder="Tempel teks mentah dari survey/interview/review/dokumen di sini..."
                aria-invalid={!!errors.text}
                {...register('text')}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {charCount} karakter • ~{approxTokens} token
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fillExample}
                  >
                    Contoh
                  </Button>
                </div>
              </div>
              {errors.text && (
                <p className="text-xs text-destructive">
                  {errors.text.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra">Extra Metadata (JSON opsional)</Label>
              <Textarea
                id="extra"
                rows={4}
                placeholder='{"project":"alpha","priority":"high"}'
                aria-invalid={!!errors.extra}
                {...register('extra')}
              />
              {errors.extra && (
                <p className="text-xs text-destructive">
                  {errors.extra.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Data akan diindeks ke tabel vektor dan digunakan sebagai konteks
                RAG.
              </p>
              <Button
                type="submit"
                disabled={submitting || loading || !user || !isDirty}
              >
                <Upload className="size-4" /> Unggah ke RAG
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
