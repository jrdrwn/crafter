'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessageButtonRetry } from '@/helpers/error-retry';
import { slugify } from '@/lib/utils';
import { Plus, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import z from 'zod';

import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field, FieldLabel } from '../../ui/field';
import { Input } from '../../ui/input';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { ScrollArea } from '../../ui/scroll-area';
import { createFormSchema } from '../construct';

type Props = {
  control: Control<z.infer<typeof createFormSchema>>;
};

export default function DomainCard({ control }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domains, setDomains] = useState<{ key: string; label: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newDomainInputRef = useRef<HTMLInputElement>(null);

  async function fetchDomains() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/persona/helper/domain');
    setLoading(false);
    if (!res.ok) {
      setError('Failed to fetch domains.');
      return;
    }
    const json = await res.json();
    setDomains(json.data);
  }

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <Card className="col-span-1 w-full border border-primary p-1.5 sm:p-2 lg:col-span-3">
      <CardHeader className="p-1.5 sm:p-2">
        <CardTitle className="flex items-center gap-1.5 text-base text-primary sm:gap-2 sm:text-lg md:text-xl">
          <Target
            size={16}
            className="text-foreground sm:size-[18px] md:size-5"
          />
          Choose Domain
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 sm:text-sm">
          Select the domain or industry for the persona you want to create.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1.5 sm:px-2">
        <Controller
          name="domain"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="w-full border-primary sm:max-w-xs"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Input
                    ref={newDomainInputRef}
                    type="text"
                    placeholder="Add a new domain..."
                    value={newDomain}
                    className="flex-1 border-primary"
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={!newDomain}
                    size="icon"
                    className="shrink-0"
                    onClick={() => {
                      if (
                        newDomain &&
                        !domains.some(
                          (d) =>
                            d.label.toLowerCase() === newDomain.toLowerCase(),
                        )
                      ) {
                        setDomains((prev) => [
                          { key: slugify(newDomain), label: newDomain },
                          ...prev,
                        ]);
                        setNewDomain('');
                        if (newDomainInputRef.current) {
                          newDomainInputRef.current.value = '';
                        }
                      }
                    }}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <RadioGroup
                name={field.name}
                onValueChange={(value) => {
                  field.onChange({
                    key: value,
                    label: domains.find((d) => d.key === value)?.label || '',
                  });
                }}
                aria-invalid={fieldState.invalid}
                value={field.value.key}
              >
                {!loading && error && (
                  <ErrorMessageButtonRetry
                    message={error}
                    onRetry={fetchDomains}
                  />
                )}
                <ScrollArea className="max-h-60 sm:max-h-72 md:max-h-80">
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {loading && (
                      <>
                        <DomainItemSkeleton />
                        <DomainItemSkeleton />
                        <DomainItemSkeleton />
                      </>
                    )}
                    {domains
                      .filter((d) =>
                        d.label
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map((d) => {
                        const selected = field.value.key === d.key;
                        return (
                          <FieldLabel
                            key={d.key}
                            htmlFor={d.key}
                            className="w-full"
                          >
                            <div
                              className={
                                'flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors ' +
                                (selected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-muted hover:border-primary/50')
                              }
                            >
                              <RadioGroupItem value={d.key} id={d.key} />
                              <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-medium">
                                  {d.label}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Key: {d.key}
                                </span>
                              </div>
                              {selected && <Badge>Selected</Badge>}
                            </div>
                          </FieldLabel>
                        );
                      })}
                  </div>
                </ScrollArea>
              </RadioGroup>

              {searchQuery &&
                !domains.some(
                  (d) => d.label.toLowerCase() === searchQuery.toLowerCase(),
                ) && (
                  <p className="mt-2 text-center text-xs text-gray-500">
                    Add &quot;{searchQuery}&quot; as a new domain if not listed.
                  </p>
                )}
              {fieldState.error?.message && (
                <p className="mt-2 text-xs text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}

function DomainItemSkeleton() {
  return (
    <div className="flex w-full animate-pulse items-center gap-3 rounded-md border p-3">
      <div className="h-4 w-4 rounded-full border bg-muted" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4 rounded-md" />
        <Skeleton className="h-3 w-1/2 rounded-md" />
      </div>
    </div>
  );
}
