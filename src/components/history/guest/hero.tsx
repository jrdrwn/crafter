'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../../ui/button';

export default function Hero() {
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-16">
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <div className="absolute inset-x-12 inset-y-0 border-x border-dashed border-primary">
          <span
            className="absolute -top-10 -left-10 size-20 overflow-hidden rounded-full border border-dashed border-primary"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span
            className="absolute -top-10 -right-10 size-20 overflow-hidden rounded-full border border-dashed border-primary"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
        </div>
        <div className="z-1 mx-14 flex w-full items-center justify-between gap-6">
          <div>
            <h1
              className="mb-2 max-w-4xl text-4xl leading-tight font-bold tracking-wide md:text-5xl"
              style={{
                background: 'linear-gradient(180deg, #3A81F6 0%, #404040 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Persona History
            </h1>
            <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
              Manage all the personas you have created
            </p>
          </div>
          <div>
            <Link href={'/create'}>
              <Button size={'lg'}>
                <Plus />
                Create New Persona
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
