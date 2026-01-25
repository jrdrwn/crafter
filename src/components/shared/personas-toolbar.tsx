'use client';

import { cn } from '@/lib/utils';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  className,
  searchValue,
  onSearchChangeAction,
  domainValue,
  onDomainChangeAction,
  orderValue,
  onOrderChangeAction,
}: PersonasToolbarProps) {
  const t = useTranslations();
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <div className="w-full sm:max-w-md">
        <InputGroup className="border-primary md:min-w-xs">
          <InputGroupInput
            type="search"
            placeholder={t('explore.persona-search-placeholder')}
            value={searchValue}
            onChange={(e) => onSearchChangeAction(e.target.value)}
          />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
        </InputGroup>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
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
