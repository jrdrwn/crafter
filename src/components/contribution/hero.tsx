'use client';

import { Tags } from 'lucide-react';

import { Badge } from '../ui/badge';

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
          <span className="absolute right-0 bottom-0 size-20 overflow-hidden rounded-full border border-dashed border-primary"></span>
          <span className="absolute bottom-0 left-0 size-20 overflow-hidden rounded-full border border-dashed border-primary"></span>
        </div>
        <div className="z-1 mx-auto text-center">
          <Badge
            variant={'outline'}
            className="mb-4 rounded-full border-primary px-4 py-2"
          >
            <Tags className="h-4 w-4 text-primary" />
            RAG Knowledge Contributions
          </Badge>
          <h1
            className="mb-6 max-w-4xl text-4xl leading-tight font-bold tracking-wide md:text-5xl"
            style={{
              background: 'linear-gradient(180deg, #3A81F6 0%, #404040 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Manage & Contribute Knowledge
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-muted-foreground">
            Upload, curate, and sync knowledge sources for Retrieval-Augmented
            Generation (RAG). Keep your team&apos;s data up to date and easy to
            find.
          </p>
        </div>
      </div>
    </section>
  );
}
