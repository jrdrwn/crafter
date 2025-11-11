'use client';

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
      extra: '',
    },
  });

  const textValue = watch('text');
  const charCount = textValue?.length ?? 0;
  const approxTokens = useMemo(
    () => Math.ceil((charCount || 0) / 4),
    [charCount],
  );

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
          extra:
            data.metadata && typeof data.metadata === 'object'
              ? JSON.stringify(data.metadata)
              : '',
        });
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
          extra: values.extra ? JSON.parse(values.extra) : undefined,
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
                <Input
                  id="domain_key"
                  placeholder="mis. ecommerce"
                  {...register('domain_key')}
                />
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
              <Textarea id="text" rows={8} {...register('text')} />
              {errors.text && (
                <p className="text-xs text-destructive">
                  {errors.text.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {charCount} chars • ~{approxTokens} tokens
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra">Extra Metadata (JSON)</Label>
              <Textarea
                id="extra"
                rows={4}
                placeholder='{"project":"alpha"}'
                {...register('extra')}
              />
              {errors.extra && (
                <p className="text-xs text-destructive">
                  {errors.extra.message}
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
