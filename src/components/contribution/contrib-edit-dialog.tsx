'use client';

import DomainCombobox from '@/components/shared/domain-combobox';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const EditSchema = z.object({
  text: z.string().min(1, 'Teks tidak boleh kosong'),
  type: z.enum(['survey', 'interview', 'review', 'doc']),
  domain_key: z.string().optional().or(z.literal('')),
  language_key: z.enum(['en', 'id']).optional(),
  source: z.string().optional().or(z.literal('')),
});

type EditForm = z.input<typeof EditSchema>;

export function ContribEditDialog({
  id,
  open,
  onOpenChangeAction,
  onSavedAction,
  token,
}: {
  id: number | null;
  open: boolean;
  onOpenChangeAction: (v: boolean) => void;
  onSavedAction: () => void;
  token: string;
}) {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // metadata builder state (key-value)
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [metaObj, setMetaObj] = useState<Record<string, string>>({});

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<EditForm>({
    resolver: zodResolver(EditSchema),
    defaultValues: {
      text: '',
      type: 'review',
      language_key: 'en',
      domain_key: '',
      source: '',
    },
  });

  const textValue = watch('text');
  const charCount = textValue?.length ?? 0;
  const approxTokens = useMemo(
    () => Math.ceil((charCount || 0) / 4),
    [charCount],
  );

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

  useEffect(() => {
    async function loadDetail() {
      if (!id || !open) return;
      setInitializing(true);
      try {
        const res = await fetch(`/api/rag/contributions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Gagal memuat detail');
        const json = (await res.json()) as {
          status: boolean;
          data?: {
            text: string;
            type: 'survey' | 'interview' | 'review' | 'doc';
            domain_key: string | null;
            language_key: 'en' | 'id' | null;
            source: string | null;
            metadata: unknown;
          };
        };
        const data = json.data!;
        reset({
          text: data.text,
          type: data.type,
          domain_key: data.domain_key ?? '',
          language_key: (data.language_key as 'en' | 'id' | null) ?? undefined,
          source: data.source ?? '',
        });
        // preload metadata builder
        if (
          data.metadata &&
          typeof data.metadata === 'object' &&
          !Array.isArray(data.metadata)
        ) {
          const obj = data.metadata as Record<string, unknown>;
          const initial: Record<string, string> = {};
          for (const [k, v] of Object.entries(obj)) {
            if (k === 'doc_id' || k === 'chunk_index') continue; // internal keys
            initial[k] = typeof v === 'string' ? v : JSON.stringify(v);
          }
          setMetaObj(initial);
        } else {
          setMetaObj({});
        }
      } catch (e) {
        toast.error('Gagal memuat', {
          description: e instanceof Error ? e.message : String(e),
        });
        onOpenChangeAction(false);
      } finally {
        setInitializing(false);
      }
    }
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, open]);

  async function onSubmit(values: EditForm) {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/rag/contributions/${id}`, {
        method: 'PUT',
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
      if (!res.ok) throw new Error('Gagal menyimpan perubahan');
      toast.success('Berhasil disimpan');
      onSavedAction();
      onOpenChangeAction(false);
    } catch (e) {
      toast.error('Gagal', {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Kontribusi</DialogTitle>
          <DialogDescription>
            Perbarui isi dan metadata. Sistem akan re-index embeddings.
          </DialogDescription>
        </DialogHeader>

        {initializing ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Memuat...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Jenis</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="type">
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="language_key">Bahasa</Label>
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
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="domain_key">Domain</Label>
                <Controller
                  name="domain_key"
                  control={control}
                  render={({ field }) => (
                    <DomainCombobox
                      value={field.value}
                      onChangeAction={field.onChange}
                    />
                  )}
                />
                {errors.domain_key && (
                  <p className="text-xs text-destructive">
                    {errors.domain_key.message as string}
                  </p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="source">Sumber</Label>
                <Input
                  id="source"
                  placeholder="opsional"
                  {...register('source')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">Isi</Label>
              <Textarea
                id="text"
                rows={8}
                className="field-sizing-fixed max-h-29 min-h-29 resize-none"
                {...register('text')}
              />
              {errors.text && (
                <p className="text-xs text-destructive">
                  {errors.text.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {charCount} chars • ~{approxTokens} tokens
              </p>
            </div>

            {/* Metadata builder */}
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

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChangeAction(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading || !isDirty}>
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
