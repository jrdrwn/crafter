'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PersonaCard } from '../../shared/persona-card';

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
    <section className="p-2 py-6 md:p-4 md:py-8">
      <div className="container mx-auto">
        {!persona && (
          <p className="text-center text-sm text-muted-foreground md:text-base">
            No personas found. Create your first persona!
          </p>
        )}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
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
