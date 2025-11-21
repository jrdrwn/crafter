'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { HeroSidesDecorator } from '../../shared/hero-sides-decorator';
import { Button } from '../../ui/button';

export default function Hero() {
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <HeroSidesDecorator />
        <div className="z-1 flex w-full flex-col items-start gap-4 px-4 sm:mx-0 sm:px-8 md:flex-row md:items-center md:justify-between md:px-0 lg:mx-14">
          <div className="w-full md:w-auto">
            <h1
              className="mb-2 max-w-4xl text-2xl leading-tight font-bold tracking-wide sm:text-3xl md:text-4xl lg:text-5xl"
              style={{
                background:
                  'linear-gradient(180deg, var(--primary) 0%, var(--foreground) 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Persona History
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
              Manage all the personas you have created
            </p>
          </div>
          <div className="w-full md:w-auto">
            <Link href="/create" className="block md:w-auto">
              <Button size={'lg'} className="hidden md:flex md:w-auto">
                <Plus />
                <span className="sm:inline">Create New Persona</span>
              </Button>
              <Button className="flex md:hidden md:w-auto">
                <Plus />
                <span className="sm:inline">Create New Persona</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
