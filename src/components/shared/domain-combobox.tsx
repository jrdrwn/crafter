'use client';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, PlusCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function DomainCombobox({
  value,
  onChangeAction,
}: {
  value?: string;
  onChangeAction: (v: string) => void;
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
        <Button
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
                  onChangeAction('');
                }}
              />
            ) : null}
            <ChevronsUpDown className="size-4 opacity-60" />
          </div>
        </Button>
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
                    onChangeAction(query);
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
                    onChangeAction(d.key);
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
                    onChangeAction(query);
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
