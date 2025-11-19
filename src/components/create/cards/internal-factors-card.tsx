'use client';

import { ErrorMessageButtonRetry } from '@/helpers/error-retry';
import { Brain, RotateCcw, Users, X } from 'lucide-react';
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
import type { CreateFormValues, Factor } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function InternalFactorsCard({ control }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [factors, setFactors] = useState<Factor[]>([]);
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

  async function fetchAttributes() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/persona/helper/attribute?layer=internal');
    setLoading(false);
    if (!res.ok) {
      setError('Failed to load attributes');
      return;
    }
    const json = await res.json();
    setFactors(json.data as Factor[]);
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
        id: 'personal-characteristics',
        label: 'Personal characteristics',
        items: ['Demographic information', 'Personal attributes'],
      },
    ];

    const titleToGroup = new Map<string, string>();
    groupDefs.forEach((g) =>
      g.items.forEach((t) => titleToGroup.set(normalize(t), g.id)),
    );

    const grouped: Array<{ id: string; label: string; factors: Factor[] }> =
      groupDefs.map((g) => ({ id: g.id, label: g.label, factors: [] }));

    const unknown: Factor[] = [];
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
          Human Factors — Internal Layer
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 sm:text-sm">
          Select available internal factors. Edit the description as a list of
          items.
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
                placeholder="Search..."
                className="flex-1 border-primary text-sm"
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search layer attributes"
              />
              <Controller
                name="internal"
                control={control}
                render={({ field }) => (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        title="Reset edited internal attributes"
                        aria-label="Reset edited internal attributes"
                      >
                        <RotateCcw className="size-4" />
                        <span className="ml-1 hidden sm:inline">Reset</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Reset edited attributes?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This will revert descriptions of selected internal
                          attributes to their defaults. Selection remains
                          unchanged.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            const selected = (field.value || []) as Factor[];
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
                          Reset
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              />
            </div>

            <Controller
              name="internal"
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
                              className="mr-4 w-full border-primary p-2"
                            >
                              <ItemContent>
                                <ItemTitle>
                                  <Checkbox
                                    onCheckedChange={(checked) => {
                                      const selected = (field.value ||
                                        []) as Factor[];
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
                                        field.value as Factor[] | undefined
                                      )?.some(
                                        (item) => item.name === val.name,
                                      ) || false
                                    }
                                  />
                                  <Users className="size-4 text-primary" />
                                  {val.title}
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
              Selected
            </h3>
            <Controller
              name="internal"
              control={control}
              render={({ field }) => (
                <ScrollArea className="h-56 rounded-md border p-2 sm:h-64 md:h-80">
                  <div className="flex flex-col gap-2">
                    {((field.value || []) as Factor[]).map((s) => {
                      const previewArr = (s.description || '')
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      const preview = previewArr.length
                        ? `${previewArr.slice(0, 3).join(', ')}${previewArr.length > 3 ? '…' : ''}`
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
                          className={`w-full border-primary p-2 ${
                            activeName === s.name
                              ? 'bg-primary/5 ring-1 ring-primary'
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
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const next = (
                                    (field.value || []) as Factor[]
                                  ).filter((x) => x.name !== s.name);
                                  field.onChange(next);
                                  if (activeName === s.name) {
                                    setActiveName(null);
                                    setTokens([]);
                                  }
                                }}
                                aria-label={`Remove ${s.title}`}
                              >
                                <X className="size-4" />
                              </Button>
                            </ItemTitle>
                            <ItemDescription className="text-xs text-muted-foreground">
                              {preview}
                            </ItemDescription>
                          </ItemContent>
                        </Item>
                      );
                    })}
                    {((field.value || []) as Factor[]).length === 0 && (
                      <div className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
                        No selection
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
              Details
            </h3>
            <Controller
              name="internal"
              control={control}
              render={({ field }) => {
                const selected = ((field.value || []) as Factor[]).find(
                  (s) => s.name === activeName,
                );

                const commitTokens = (nextTokens: string[]) => {
                  if (!selected) return;
                  const next = ((field.value || []) as Factor[]).map((s) =>
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
                        Select a factor from the middle list to edit details.
                      </p>
                    ) : (
                      <div className="flex h-full flex-col gap-3">
                        <div>
                          <p className="text-sm font-medium">
                            {selected.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Manage description items (comma-separated)
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {tokens.map((t, i) => (
                            <Badge
                              key={`${t}-${i}`}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingIndex(i);
                                  setInputValue(t);
                                  inputRef.current?.focus();
                                }}
                                className="text-xs"
                                aria-label={`Edit ${t}`}
                              >
                                {t}
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
                                aria-label={`Remove ${t}`}
                              >
                                <X className="size-3" />
                              </button>
                            </Badge>
                          ))}
                          {tokens.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              No items
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                          <Input
                            ref={inputRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={
                              editingIndex !== null ? 'Edit item' : 'Add item'
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
                            {editingIndex !== null ? 'Save' : 'Add'}
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
                              Cancel
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
      <div className="mb-2 h-4 w-1/2 rounded bg-gray-300" />
      <div className="mb-1 h-3 w-full rounded bg-gray-200" />
      <div className="mb-1 h-3 w-5/6 rounded bg-gray-200" />
    </div>
  );
}
