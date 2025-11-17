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
  type OrderValue,
} from './domain-order-filters';

interface PersonasToolbarProps {
  placeholder?: string;
  className?: string;
  searchValue: string;
  onSearchChangeAction: (value: string) => void;
  domainValue?: string;
  onDomainChangeAction?: (value?: string) => void;
  orderValue?: OrderValue;
  onOrderChangeAction?: (value: OrderValue) => void;
}

export function PersonasToolbar({
  placeholder = 'Search persona or tag...',
  className,
  searchValue,
  onSearchChangeAction,
  domainValue,
  onDomainChangeAction,
  orderValue,
  onOrderChangeAction,
}: PersonasToolbarProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="w-full max-w-md">
        <InputGroup className="min-w-xs border-primary">
          <InputGroupInput
            type="search"
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChangeAction(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex items-center justify-center gap-4">
        <DomainFilterCombobox
          value={domainValue}
          onChangeAction={onDomainChangeAction}
        />
        <OrderFilterCombobox
          value={orderValue}
          onChangeAction={onOrderChangeAction}
        />
      </div>
    </div>
  );
}
