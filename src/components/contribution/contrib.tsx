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
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const ContributionSchema = z.object({
  text: z.string().optional().default(''),
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
  const TOKEN_LIMIT = Number(process.env.NEXT_PUBLIC_RAG_TOKEN_LIMIT ?? 10000);

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
      toast.error('Harap login terlebih dahulu');
      return;
    }
    const token = getCookie('token');
    if (!token) {
      toast.error('Token tidak ditemukan');
      return;
    }

    if (!showText && !showFile) {
      toast.error('Pilih minimal satu opsi: isi teks atau unggah file');
      return;
    }

    if (activeTokens > TOKEN_LIMIT) {
      toast.error('Melebihi batas token', {
        description: `Perkiraan token ${activeTokens} > limit ${TOKEN_LIMIT}. Kurangi ukuran input.`,
      });
      return;
    }

    // Jika ada file dan toggle file aktif, pakai alur upload file
    if (showFile && file) {
      const name = file.name.toLowerCase();
      if (!/[.](txt|docx|xlsx)$/i.test(name)) {
        toast.error('Format tidak didukung', {
          description: 'Hanya .txt, .docx, atau .xlsx',
        });
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
        if (Object.keys(metaObj).length)
          fd.append('extra', JSON.stringify(metaObj));

        const res = await fetch('/api/rag/contributions/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) {
          const payload = (await res.json().catch(() => ({}))) as {
            message?: string;
          };
          throw new Error(payload?.message || 'Gagal mengunggah file');
        }
        const json = (await res.json()) as {
          status: boolean;
          result?: { chunks: number };
        };
        toast.success('File terunggah', {
          description: `${json?.result?.chunks ?? 0} potongan disimpan ke RAG`,
          icon: <CheckCircle2 className="size-4 text-green-600" />,
        });
        setFile(null);
        return;
      } catch (e) {
        toast.error('Gagal', {
          description: e instanceof Error ? e.message : 'Terjadi kesalahan',
          icon: <AlertCircle className="size-4 text-red-600" />,
        });
        return;
      } finally {
        setSubmitting(false);
      }
    }

    // Jika tidak ada file, gunakan alur teks
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
            extra: Object.keys(metaObj).length ? metaObj : undefined,
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
        setMetaObj({});
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

          {/* Toggles */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">Isi teks</p>
                <p className="text-xs text-muted-foreground">
                  Tulis/Tempel konten manual
                </p>
              </div>
              <Switch checked={showText} onCheckedChange={setShowText} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">Unggah file</p>
                <p className="text-xs text-muted-foreground">TXT/DOCX/XLSX</p>
              </div>
              <Switch checked={showFile} onCheckedChange={setShowFile} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="text-sm">
                <p className="font-medium">Tambahkan metadata</p>
                <p className="text-xs text-muted-foreground">
                  Key-Value untuk konteks
                </p>
              </div>
              <Switch checked={showMeta} onCheckedChange={setShowMeta} />
            </div>
          </div>

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

            {showText ? (
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
                  <span></span>
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
            ) : null}

            {showMeta ? (
              <div className="rounded-md border p-4">
                <Label>Extra Metadata</Label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    placeholder="key (mis. project)"
                    value={metaKey}
                    onChange={(e) => setMetaKey(e.target.value)}
                  />
                  <Input
                    placeholder="value (mis. alpha)"
                    value={metaValue}
                    onChange={(e) => setMetaValue(e.target.value)}
                  />
                  <Button type="button" onClick={addMetaPair}>
                    Tambah
                  </Button>
                </div>
                {Object.keys(metaObj).length ? (
                  <ul className="mt-3 space-y-2">
                    {Object.entries(metaObj).map(([k, v]) => (
                      <li
                        key={k}
                        className="flex items-center justify-between rounded border px-2 py-1 text-sm"
                      >
                        <span className="truncate">
                          <strong>{k}:</strong> {String(v)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMetaKey(k)}
                        >
                          Hapus
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Belum ada metadata ditambahkan.
                  </p>
                )}
              </div>
            ) : null}

            {showFile ? (
              <div className="rounded-md border p-4">
                <Label htmlFor="file">Unggah file (.txt, .docx, .xlsx)</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Input
                    id="file"
                    type="file"
                    accept=".txt,.docx,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {file ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Dipilih: {file.name} ({Math.ceil(file.size / 1024)} KB)
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Database className="size-4" />
                {activeTokens > 0
                  ? `Perkiraan ${activeTokens}/${TOKEN_LIMIT} tokens`
                  : `Batas ${TOKEN_LIMIT} tokens`}
              </span>
              <Button
                type="submit"
                disabled={submitting || loading || !user || !canSubmit}
                aria-disabled={submitting || loading || !user || !canSubmit}
                title={
                  activeTokens > TOKEN_LIMIT
                    ? 'Melebihi batas token'
                    : !((showText && hasText) || (showFile && !!file))
                      ? 'Isi teks atau pilih file terlebih dahulu'
                      : undefined
                }
              >
                {submitting ? (
                  <Upload className="mr-2 size-4 animate-pulse" />
                ) : (
                  <Upload className="mr-2 size-4" />
                )}
                Unggah ke RAG
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
