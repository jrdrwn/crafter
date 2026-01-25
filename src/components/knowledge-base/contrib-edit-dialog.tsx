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
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const EditSchema = z.object({
  text: z.string().min(1, 'Text must not be empty'),
  type: z.enum(['survey', 'interview', 'review', 'doc']),
  visibility: z.enum(['public', 'private']).optional(),
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
  const t = useTranslations('contrib.edit');
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
      visibility: 'private',
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
        if (!res.ok) throw new Error('Failed to load detail');
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

        // extract visibility from metadata if present
        let visibilityVal: 'public' | 'private' | undefined = undefined;
        const nextMeta: Record<string, string> = {};
        if (
          data.metadata &&
          typeof data.metadata === 'object' &&
          !Array.isArray(data.metadata)
        ) {
          const obj = data.metadata as Record<string, unknown>;
          for (const [k, v] of Object.entries(obj)) {
            if (k === 'doc_id' || k === 'chunk_index') continue; // internal keys
            if (k === 'visibility') {
              const vv = String(v).toLowerCase();
              if (vv === 'public' || vv === 'private') visibilityVal = vv;
              continue;
            }
            nextMeta[k] = typeof v === 'string' ? v : JSON.stringify(v);
          }
        }

        reset({
          text: data.text,
          type: data.type,
          domain_key: data.domain_key ?? '',
          language_key: (data.language_key as 'en' | 'id' | null) ?? undefined,
          source: data.source ?? '',
          visibility: visibilityVal ?? 'private',
        });
        setMetaObj(nextMeta);
      } catch (e) {
        toast.error('Failed to load', {
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
          extra: {
            ...(Object.keys(metaObj).length ? metaObj : {}),
            ...(values.visibility ? { visibility: values.visibility } : {}),
          },
        }),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      toast.success('Saved successfully');
      onSavedAction();
      onOpenChangeAction(false);
    } catch (e) {
      toast.error('Failed', {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('desc')}</DialogDescription>
        </DialogHeader>

        {initializing ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> {t('loading')}
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Row 1: Content Type | Visibility | Language */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="type">{t('type.label')}</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="type" className="w-full">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">{t('visibility.label')}</Label>
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
                <Label htmlFor="language_key">{t('language.label')}</Label>
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="domain_key">{t('domain.label')}</Label>
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
              <div className="space-y-2">
                <Label htmlFor="source">{t('source.label')}</Label>
                <Input
                  id="source"
                  placeholder={t('source.placeholder')}
                  {...register('source')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="text">{t('text.label')}</Label>
              <Textarea
                id="text"
                rows={8}
                className="field-sizing-fixed max-h-29 min-h-29 w-full resize-none"
                {...register('text')}
              />
              {errors.text && (
                <p className="text-xs text-destructive">
                  {errors.text.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {charCount} {t('text.chars')} • ~{approxTokens}{' '}
                {t('text.tokens')}
              </p>
            </div>

            {/* Metadata builder */}
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

            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChangeAction(false)}
                className="w-full sm:w-auto"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading || !isDirty}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : null}
                {t('save')}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
