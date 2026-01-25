'use client';

import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next/client';
import { Check, ChevronsUpDown, Filter, ListFilter } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();

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
          className="justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <Filter className="text-primary" />
            {selectedLabel || t('explore.persona-domain-filter')}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder={t('explore.persona-domain-search-placeholder')}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{t('explore.persona-domain-empty')}</CommandEmpty>
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
  const t = useTranslations();

  const orderLabels: Record<OrderValue, string> = {
    recent: t('explore.persona-order-recent'),
    updated: t('explore.persona-order-updated'),
    alphabetical: t('explore.persona-order-alphabetical'),
  };

  const currentLabel =
    (value && orderLabels[value]) || t('explore.persona-order-filter');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          className="justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <ListFilter className="text-primary" />
            {currentLabel}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput
            placeholder={t('explore.persona-order-search-placeholder')}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{t('explore.persona-order-empty')}</CommandEmpty>
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
                  {orderLabels[item.value]}
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
