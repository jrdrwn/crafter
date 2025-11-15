'use client';

import { slugify } from '@/lib/utils';
import { Plus, Target } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field, FieldLabel } from '../../ui/field';
import { Input } from '../../ui/input';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { ScrollArea } from '../../ui/scroll-area';
import type { CreateFormValues } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function DomainCard({ control }: Props) {
  const [domains, setDomains] = useState<{ key: string; label: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const newDomainInputRef = useRef<HTMLInputElement>(null);

  async function fetchDomains() {
    const res = await fetch('/api/persona/helper/domain');
    const json = await res.json();
    setDomains(json.data);
  }

  useEffect(() => {
    fetchDomains();
  }, []);

  return (
    <Card className="col-span-3 w-full border border-primary p-2">
      <CardHeader className="p-2">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Target size={20} className="text-foreground" />
          Choose Domain
        </CardTitle>
        <CardDescription className="text-gray-400">
          Select the domain or industry for the persona you want to create.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <Controller
          name="domain"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="max-w-xs border-primary"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Input
                    ref={newDomainInputRef}
                    type="text"
                    placeholder="Add a new domain..."
                    value={newDomain}
                    className="border-primary"
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                  <Button
                    type="button"
                    disabled={!newDomain}
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
                        newDomainInputRef.current &&
                          (newDomainInputRef.current.value = '');
                      }
                    }}
                  >
                    <Plus />
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
                <ScrollArea className="h-72">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                                  ? 'border-primary bg-primary/5 ring-2 ring-primary'
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
      <CardFooter className="border-t border-dashed px-2 pb-2"></CardFooter>
    </Card>
  );
}
