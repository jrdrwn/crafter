/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useUser } from '@/contexts/user-context';
import { getCookie } from 'cookies-next/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { PersonaCard } from '../shared/persona-card';
import { PersonasToolbar } from '../shared/personas-toolbar';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export default function PersonaItems() {
  const token = getCookie('token');
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const [myPersonasOnly, setMyPersonasOnly] = useState(false);

  function toggleMyPersonasOnly() {
    setMyPersonasOnly(!myPersonasOnly);
  }

  async function fetchPersonas() {
    setLoading(true);
    const res = await fetch('/api/persona', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setPersonas(data.data);
    setLoading(false);
  }

  useEffect(() => {
    fetchPersonas();
  }, []);
  return (
    <section className="p-4 py-8">
      <div className="container mx-auto">
        <Card className="w-full border-primary py-4">
          <CardContent className="px-4">
            <PersonasToolbar />
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Viewing {personas.length} out of {personas.length} personas
          </p>
          <div className="flex items-center gap-2">
            <Switch
              id="show-my-persona"
              onCheckedChange={() => toggleMyPersonasOnly()}
            />
            <Label
              htmlFor="show-my-persona"
              className="text-sm text-muted-foreground"
            >
              Show My Personas Only
            </Label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading && (
            <p className="col-span-3 text-center text-muted-foreground">
              Loading personas...
            </p>
          )}
          {!loading && personas.length === 0 && (
            <p className="col-span-3 text-center text-muted-foreground">
              No personas found.
            </p>
          )}
          {!loading &&
            personas.length > 0 &&
            personas
              .filter(
                (persona: any) =>
                  !myPersonasOnly || persona.user.id == user?.id,
              )
              .map((persona: any) => (
                <Link key={persona.id} href={`/detail/${persona.id}`}>
                  <PersonaCard
                    quoteClamp={2}
                    name={persona.result.full_name}
                    subtitle={''}
                    quote={persona.result.quote}
                    tag={persona.domain.label}
                    date={new Date(persona.created_at).toLocaleDateString(
                      'id-ID',
                      {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      },
                    )}
                    createdByMe={persona.user.id == user?.id}
                  />
                </Link>
              ))}
        </div>
        {/* <Button className="mx-auto mt-8 block border-primary">
          Load More Personas
        </Button> */}
      </div>
    </section>
  );
}
