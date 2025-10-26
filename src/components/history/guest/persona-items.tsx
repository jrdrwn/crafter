'use client';

import { SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  DomainFilterCombobox,
  OrderFilterCombobox,
} from '../../shared/domain-order-filters';
import { PersonaCard } from '../../shared/persona-card';
import { Card, CardContent } from '../../ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../../ui/input-group';

export default function PersonaItems() {
  type GuestPersonaStorage = {
    created_at?: string;
    updated_at?: string;
    request?: unknown;
    response?: {
      result?: {
        full_name?: string;
        quote?: string;
      };
      taxonomy?: {
        domain?: {
          label?: string;
        };
      };
    };
  } | null;

  const [persona, setPersona] = useState<GuestPersonaStorage>(null);
  useEffect(() => {
    const STORAGE_KEY = 'crafter:personas';
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    setPersona(data);
  }, []);
  return (
    <section className="p-4 py-8">
      <div className="container mx-auto">
        <Card className="w-full border-primary py-4">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div>
                <InputGroup className="min-w-xs border-primary">
                  <InputGroupInput
                    type="search"
                    placeholder="Search persona or tag..."
                  />
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
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between"></div>
        {!persona && (
          <p className="text-center text-muted-foreground">
            No personas found. Create your first persona!
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {persona && (
            <Link href={'/detail/guest'}>
              <PersonaCard
                name={persona?.response?.result?.full_name ?? 'Unknown Persona'}
                quote={persona?.response?.result?.quote}
                tag={persona?.response?.taxonomy?.domain?.label}
                date={
                  persona?.created_at
                    ? new Date(persona?.created_at).toLocaleDateString(
                        'EN-en',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )
                    : undefined
                }
                quoteClamp={2}
              />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
