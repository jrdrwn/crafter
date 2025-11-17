'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui/button';

export default function Hero() {
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <div className="absolute inset-x-4 inset-y-0 border-x border-dashed border-primary sm:inset-x-8 lg:inset-x-12">
          <span
            className="absolute -top-6 -left-6 size-12 overflow-hidden rounded-full border border-dashed border-primary sm:-top-8 sm:-left-8 sm:size-16 lg:-top-10 lg:-left-10 lg:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span
            className="absolute -top-6 -right-6 size-12 overflow-hidden rounded-full border border-dashed border-primary sm:-top-8 sm:-right-8 sm:size-16 lg:-top-10 lg:-right-10 lg:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
        </div>
        <div className="z-1 flex w-full flex-col items-start gap-4 sm:mx-8 sm:gap-6 md:flex-row md:items-center md:justify-between lg:mx-14">
          <div className="w-full md:w-auto">
            <h1
              className="mb-2 max-w-4xl text-2xl leading-tight font-bold tracking-wide sm:text-3xl md:text-4xl lg:text-5xl"
              style={{
                background: 'linear-gradient(180deg, #418945 0%, #404040 100%)',
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
              <Button size={'lg'} className="md:w-auto">
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
