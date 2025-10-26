'use client';

import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Filter, ListFilter } from 'lucide-react';
import { useState } from 'react';

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

export const domainOptions = [
  { value: 'marketing', label: 'Marketing' },
  { value: 'sales', label: 'Sales' },
  { value: 'product', label: 'Product' },
  { value: 'engineering', label: 'Engineering' },
];

export function DomainFilterCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

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
            {value
              ? domainOptions.find((d) => d.value === value)?.label
              : 'Filter by Domain'}
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
              {domainOptions.map((domain) => (
                <CommandItem
                  key={domain.value}
                  value={domain.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
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
  { value: 'popular', label: 'Popular' },
  { value: 'date', label: 'Date' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'recent', label: 'Recently Added' },
  { value: 'updated', label: 'Recently Updated' },
  { value: 'relevance', label: 'Relevance' },
];

export function OrderFilterCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

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
            {value
              ? orderOptions.find((i) => i.value === value)?.label
              : 'Order by'}
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
                    setValue(currentValue === value ? '' : currentValue);
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
