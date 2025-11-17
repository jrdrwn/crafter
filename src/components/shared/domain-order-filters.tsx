'use client';

import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next/client';
import { Check, ChevronsUpDown, Filter, ListFilter } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

type DomainOption = { value: string; label: string };

type DomainFromApi = { key: string; label: string };

export function DomainFilterCombobox({
  value,
  onChangeAction,
}: {
  value?: string;
  onChangeAction?: (value?: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<DomainOption[]>([]);
  const token = getCookie('token');

  useEffect(() => {
    async function fetchDomains() {
      try {
        const res = await fetch('/api/persona/helper/domain', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        const json = await res.json();
        const items: DomainFromApi[] = (json?.data || []) as DomainFromApi[];
        const opts: DomainOption[] = items.map((d) => ({
          value: d.key,
          label: d.label,
        }));
        setOptions(opts);
      } catch {
        // ignore
      }
    }
    fetchDomains();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedLabel = useMemo(
    () => options.find((d) => d.value === value)?.label,
    [options, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <Filter className="text-primary" />
            {selectedLabel || 'Filter by Domain'}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search domains..." className="h-9" />
          <CommandList>
            <CommandEmpty>No domain found.</CommandEmpty>
            <CommandGroup>
              {options.map((domain) => (
                <CommandItem
                  key={domain.value}
                  value={domain.value}
                  onSelect={(currentValue) => {
                    const next =
                      currentValue === value ? undefined : currentValue;
                    onChangeAction?.(next);
                    setOpen(false);
                  }}
                >
                  {domain.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === domain.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const orderOptions = [
  { value: 'recent', label: 'Recently Added' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'alphabetical', label: 'Alphabetical' },
] as const;
export type OrderValue = (typeof orderOptions)[number]['value'];

export function OrderFilterCombobox({
  value,
  onChangeAction,
}: {
  value?: OrderValue;
  onChangeAction?: (value: OrderValue) => void;
}) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(
    () => orderOptions.find((i) => i.value === value)?.label || 'Order by',
    [value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          className="w-40 justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <ListFilter className="text-primary" />
            {currentLabel}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command>
          <CommandInput placeholder="Search order..." className="h-9" />
          <CommandList>
            <CommandEmpty>No order found.</CommandEmpty>
            <CommandGroup>
              {orderOptions.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    const next = (currentValue as OrderValue) || 'recent';
                    onChangeAction?.(next);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === item.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
