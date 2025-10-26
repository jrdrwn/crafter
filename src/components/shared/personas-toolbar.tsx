'use client';

import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import {
  DomainFilterCombobox,
  OrderFilterCombobox,
} from './domain-order-filters';

interface PersonasToolbarProps {
  placeholder?: string;
  className?: string;
}

export function PersonasToolbar({
  placeholder = 'Search persona or tag...',
  className,
}: PersonasToolbarProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div>
        <InputGroup className="min-w-xs border-primary">
          <InputGroupInput type="search" placeholder={placeholder} />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center justify-center gap-4">
        <DomainFilterCombobox />
        <OrderFilterCombobox />
      </div>
    </div>
  );
}
