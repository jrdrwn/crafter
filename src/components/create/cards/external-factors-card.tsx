'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessageButtonRetry } from '@/helpers/error-retry';
import { attribute } from '@prisma/client';
import { Brain, RotateCcw, Users, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../ui/alert-dialog';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Checkbox } from '../../ui/checkbox';
import { Field, FieldLabel } from '../../ui/field';
import { Input } from '../../ui/input';
import { Item, ItemContent, ItemDescription, ItemTitle } from '../../ui/item';
import { ScrollArea } from '../../ui/scroll-area';
import { TCreateForm } from '../construct';

type Props = {
  control: Control<TCreateForm>;
};

const defaultExplanations: Record<string, string> = {
  'motivation':
    'Explains the main driving forces or underlying reasons that make the persona act or decide.',
  'goals':
    'Specific objectives or outcomes the persona wants to achieve in the context of the product / system.',
  'pain-points':
    'Key challenges, obstacles, or problems frequently experienced by the persona that need to be solved.',
};

export default function ExternalFactorsCard({ control }: Props) {
  const t = useTranslations('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<attribute[]>([]);
  const [query, setQuery] = useState('');
  const [activeName, setActiveName] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  // Scroll to details panel when activeName changes
  useEffect(() => {
    if (activeName && detailsRef.current) {
      detailsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeName]);
  const [tokens, setTokens] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const required = useMemo(
    () => new Set(['motivation', 'goals', 'pain-points']),
    [],
  );

  async function fetchAttributes() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/persona/helper/attribute?layer=external');
    setLoading(false);
    if (!res.ok) {
      setError('Failed to load attributes');
      return;
    }
    const json = await res.json();
    setFactors(json.data as attribute[]);
  }
  useEffect(() => {
    fetchAttributes();
  }, []);

  const filtered = useMemo(
    () =>
      factors.filter((f) =>
        f.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [factors, query],
  );

  const groups = useMemo(() => {
    const normalize = (s: string) => s.toLowerCase().trim();
    const groupDefs = [
      {
        id: 'skill-exp-env',
        label:
          'Skill, experiential or environmental-influenced characteristics',
        items: ['Personal story', 'Interaction with technology'],
      },
      {
        id: 'group-multi-human',
        label: 'Group or multiple human characteristics',
        items: [
          'Work status',
          'Family environment',
          'Geographic location',
          'Collaboration and communication style',
        ],
      },
    ];

    const titleToGroup = new Map<string, string>();
    groupDefs.forEach((g) =>
      g.items.forEach((t) => titleToGroup.set(normalize(t), g.id)),
    );

    const grouped: Array<{ id: string; label: string; factors: attribute[] }> =
      groupDefs.map((g) => ({ id: g.id, label: g.label, factors: [] }));

    const unknown: attribute[] = [];
    for (const f of filtered) {
      const gid = titleToGroup.get(normalize(f.title));
      if (!gid) {
        unknown.push(f);
        continue;
      }
      const bucket = grouped.find((g) => g.id === gid);
      if (bucket) bucket.factors.push(f);
    }

    if (unknown.length) {
      grouped.push({ id: 'other', label: 'Other', factors: unknown });
    }

    return grouped.filter((g) => g.factors.length > 0);
  }, [filtered]);

  return (
    <Card className="col-span-1 w-full border border-primary p-1.5 sm:p-2 lg:col-span-3">
      <CardHeader className="relative p-1.5 sm:p-2">
        <CardTitle className="flex items-center gap-1.5 text-base text-primary sm:gap-2 sm:text-lg md:text-xl">
          <Brain
            size={16}
            className="text-foreground sm:size-[18px] md:size-5"
          />
          {t('external-title')}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {t('external-desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1.5 sm:px-2">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-3">
          {/* Left: Available factors */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-primary sm:text-sm">
              Layer
            </h3>

            {/* CHANGED: search + reset inline */}
            <div className="flex items-center gap-2">
              <Input
                type="search"
                placeholder={t('external-search-placeholder')}
                className="flex-1 border-primary text-sm"
                onChange={(e) => setQuery(e.target.value)}
                aria-label={t('external-search-aria')}
              />
              <Controller
                name="external"
                control={control}
                render={({ field }) => (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        title={t('external-reset-title')}
                        aria-label={t('external-reset-title')}
                      >
                        <RotateCcw className="size-4" />
                        <span className="ml-1 hidden sm:inline">
                          {t('external-reset')}
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('external-reset-dialog-title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('external-reset-dialog-desc')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t('external-cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const selected = (field.value || []) as attribute[];
                            if (!selected.length) return;

                            const defaultByName = new Map<string, string>(
                              factors.map((f) => [f.name, f.description || '']),
                            );

                            const updated = selected.map((s) => {
                              const def = defaultByName.get(s.name) ?? '';
                              const cur = s.description || '';
                              return cur !== def
                                ? { ...s, description: def }
                                : s;
                            });

                            const changed = updated.some(
                              (s, i) =>
                                (s.description || '') !==
                                (selected[i]?.description || ''),
                            );
                            if (!changed) return;

                            field.onChange(updated);

                            if (activeName) {
                              const active = updated.find(
                                (x) => x.name === activeName,
                              );
                              if (active) {
                                const arr = (active.description || '')
                                  .split(',')
                                  .map((t) => t.trim())
                                  .filter(Boolean);
                                setTokens(arr);
                              }
                            }
                            setInputValue('');
                            setEditingIndex(null);
                          }}
                        >
                          {t('external-reset')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              />
            </div>

            <Controller
              name="external"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ScrollArea className="h-56 sm:h-64 md:h-68">
                    {!loading && error && (
                      <ErrorMessageButtonRetry
                        message={error}
                        onRetry={fetchAttributes}
                      />
                    )}
                    {loading && (
                      <div className="space-y-2 p-2">
                        <LayerItemSkeleton />
                        <LayerItemSkeleton />
                        <LayerItemSkeleton />
                      </div>
                    )}
                    {groups.map((group) => (
                      <div key={group.id} className="mb-3">
                        <p className="mb-2 text-xs font-semibold text-muted-foreground">
                          {group.label}
                        </p>
                        {group.factors.map((val) => (
                          <FieldLabel
                            key={val.name}
                            htmlFor={val.name}
                            className="mb-2 w-full"
                          >
                            <Item
                              variant="outline"
                              className={`w-full p-2 ${
                                required.has(val.name)
                                  ? 'border-border'
                                  : 'border-primary'
                              }`}
                            >
                              <ItemContent>
                                <ItemTitle>
                                  <Checkbox
                                    onCheckedChange={(checked) => {
                                      const selected = (field.value ||
                                        []) as attribute[];
                                      if (!checked && required.has(val.name))
                                        return;
                                      if (checked) {
                                        if (
                                          !selected.some(
                                            (s) => s.name === val.name,
                                          )
                                        ) {
                                          field.onChange([...selected, val]);
                                        }
                                      } else {
                                        const next = selected.filter(
                                          (s) => s.name !== val.name,
                                        );
                                        field.onChange(next);
                                        if (activeName === val.name) {
                                          setActiveName(null);
                                          setTokens([]);
                                        }
                                      }
                                    }}
                                    name={val.name}
                                    value={val.name}
                                    id={val.name}
                                    checked={
                                      (
                                        field.value as attribute[] | undefined
                                      )?.some(
                                        (item) => item.name === val.name,
                                      ) || false
                                    }
                                  />
                                  <Users
                                    className={`size-4 ${
                                      required.has(val.name)
                                        ? 'text-primary'
                                        : 'text-primary'
                                    }`}
                                  />
                                  {val.title}
                                  {required.has(val.name) && (
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {t('external-required')}
                                    </Badge>
                                  )}
                                </ItemTitle>
                                <ItemDescription className="ml-6 text-xs">
                                  {val.description}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          </FieldLabel>
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </Field>
              )}
            />
          </div>
          {/* Middle: Selected */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-primary sm:text-sm">
              {t('external-selected')}
            </h3>
            <Controller
              name="external"
              control={control}
              render={({ field }) => (
                <ScrollArea className="h-56 rounded-md border p-2 sm:h-64 md:h-80">
                  <div className="flex flex-col gap-2">
                    {((field.value || []) as attribute[]).map((s) => {
                      const previewArr = (s.description || '')
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      const preview = previewArr.length
                        ? `${previewArr.slice(0, 3).join(', ')}${
                            previewArr.length > 3 ? '…' : ''
                          }`
                        : 'No items';
                      const selectItem = () => {
                        setActiveName(s.name);
                        const arr = (s.description || '')
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean);
                        setTokens(arr);
                        setEditingIndex(null);
                        setInputValue('');
                      };
                      return (
                        <Item
                          key={s.name}
                          variant="outline"
                          className={`w-full p-2 ${
                            required.has(s.name)
                              ? 'border-gray-300 dark:border-gray-500'
                              : 'border-primary'
                          } ${
                            activeName === s.name
                              ? required.has(s.name)
                                ? 'bg-primary/5 ring-1 ring-gray-300 dark:ring-gray-500'
                                : 'ring-1 ring-primary'
                              : ''
                          }`}
                          role="button"
                          tabIndex={0}
                          onClick={selectItem}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              selectItem();
                            }
                          }}
                        >
                          <ItemContent>
                            <ItemTitle className="flex w-full items-center gap-2">
                              <button
                                type="button"
                                className={`flex-1 text-left text-sm ${
                                  activeName === s.name
                                    ? 'font-semibold text-primary'
                                    : ''
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectItem();
                                }}
                              >
                                {s.title}
                              </button>
                              <Button
                                hidden={required.has(s.name)}
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                disabled={required.has(s.name)}
                                title={
                                  required.has(s.name)
                                    ? t('external-required-title')
                                    : undefined
                                }
                                onClick={(e) => {
                                  if (required.has(s.name)) return;
                                  e.stopPropagation();
                                  const next = (
                                    (field.value || []) as attribute[]
                                  ).filter((x) => x.name !== s.name);
                                  field.onChange(next);
                                  if (activeName === s.name) {
                                    setActiveName(null);
                                    setTokens([]);
                                  }
                                }}
                                aria-label={t('external-remove-aria', {
                                  title: s.title,
                                })}
                              >
                                <X className="size-4" />
                              </Button>
                              {required.has(s.name) && (
                                <Badge variant="secondary" className="text-xs">
                                  {t('external-required')}
                                </Badge>
                              )}
                            </ItemTitle>
                            <ItemDescription className="text-xs text-muted-foreground">
                              {preview}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      );
                    })}
                    {((field.value || []) as attribute[]).length === 0 && (
                      <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        {t('external-no-selection')}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            />
          </div>
          {/* Right: Details editor */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-primary sm:text-sm">
              {t('external-details')}
            </h3>
            <Controller
              name="external"
              control={control}
              render={({ field }) => {
                const selected = ((field.value || []) as attribute[]).find(
                  (s) => s.name === activeName,
                );
                const commitTokens = (nextTokens: string[]) => {
                  if (!selected || required.has(selected.name)) return;
                  const next = ((field.value || []) as attribute[]).map((s) =>
                    s.name === selected.name
                      ? { ...s, description: nextTokens.join(', ') }
                      : s,
                  );
                  field.onChange(next);
                };
                return (
                  <div
                    ref={detailsRef}
                    className="h-56 rounded-md border p-2 sm:h-64 md:h-80 md:p-3"
                  >
                    {!selected ? (
                      <p className="text-sm text-muted-foreground">
                        {t('external-details-empty')}
                      </p>
                    ) : required.has(selected.name) ? (
                      <div className="flex h-full flex-col gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {selected.title} ({t('external-required')})
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('external-details-readonly')}
                          </p>
                        </div>
                        <div className="h-32 w-full overflow-auto rounded border border-border bg-muted p-2 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                          {defaultExplanations[selected.name] ||
                            (selected as attribute & { explanation?: string })
                              .explanation ||
                            t('external-no-explanation')}
                        </div>
                        {/* no editing controls for default factors */}
                      </div>
                    ) : (
                      <div className="flex h-full flex-col gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {selected.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t('external-details-desc')}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {tokens.map((tVal, i) => (
                            <Badge
                              key={`${tVal}-${i}`}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIndex(i);
                                  setInputValue(tVal);
                                  inputRef.current?.focus();
                                }}
                                className="text-xs"
                                aria-label={t('external-edit-aria', {
                                  item: tVal,
                                })}
                              >
                                {tVal}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const nextTokens = tokens.filter(
                                    (_, idx) => idx !== i,
                                  );
                                  setTokens(nextTokens);
                                  commitTokens(nextTokens);
                                }}
                                aria-label={t('external-remove-aria', {
                                  title: tVal,
                                })}
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ))}
                          {tokens.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {t('external-no-items')}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                          <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={
                              editingIndex !== null
                                ? t('external-edit-placeholder')
                                : t('external-add-placeholder')
                            }
                            className="border-primary"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!inputValue.trim()) return;
                                if (editingIndex !== null) {
                                  const next = tokens.slice();
                                  next[editingIndex] = inputValue.trim();
                                  setTokens(next);
                                  commitTokens(next);
                                  setEditingIndex(null);
                                  setInputValue('');
                                } else {
                                  const next = [...tokens, inputValue.trim()];
                                  setTokens(next);
                                  commitTokens(next);
                                  setInputValue('');
                                }
                              }
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              if (!inputValue.trim()) return;
                              if (editingIndex !== null) {
                                const next = tokens.slice();
                                next[editingIndex] = inputValue.trim();
                                setTokens(next);
                                commitTokens(next);
                                setEditingIndex(null);
                                setInputValue('');
                              } else {
                                const next = [...tokens, inputValue.trim()];
                                setTokens(next);
                                commitTokens(next);
                                setInputValue('');
                              }
                            }}
                          >
                            {editingIndex !== null
                              ? t('external-save')
                              : t('external-add')}
                          </Button>
                          {editingIndex !== null && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setEditingIndex(null);
                                setInputValue('');
                              }}
                            >
                              {t('external-cancel')}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LayerItemSkeleton() {
  return (
    <div className="animate-pulse">
      <Skeleton className="mb-2 h-4 w-1/2 rounded" />
      <Skeleton className="mb-1 h-3 w-full rounded" />
      <Skeleton className="mb-1 h-3 w-5/6 rounded" />
    </div>
  );
}
