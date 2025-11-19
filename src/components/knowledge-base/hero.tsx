'use client';

import { Tags } from 'lucide-react';

import { Badge } from '../ui/badge';

export default function Hero() {
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 sm:py-12 md:py-16">
      <div className="container mx-auto flex flex-col justify-center px-4 lg:flex-row lg:justify-between">
        <div className="absolute inset-x-4 inset-y-0 border-x border-dashed border-primary sm:inset-x-12">
          <span
            className="absolute -top-4 -left-4 size-8 overflow-hidden rounded-full border border-dashed border-primary md:-top-7 md:-left-7 md:size-14 lg:-top-10 lg:-left-10 lg:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span
            className="absolute -top-4 -right-4 size-8 overflow-hidden rounded-full border border-dashed border-primary md:-top-7 md:-right-7 md:size-14 lg:-top-10 lg:-right-10 lg:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span className="absolute right-0 bottom-0 hidden size-20 overflow-hidden rounded-full border border-dashed border-primary sm:block"></span>
          <span className="absolute bottom-0 left-0 hidden size-20 overflow-hidden rounded-full border border-dashed border-primary sm:block"></span>
        </div>
        <div className="z-1 mx-auto text-center">
          <Badge
            variant={'outline'}
            className="mb-4 rounded-full border-primary px-4 py-2"
          >
            <Tags className="h-4 w-4 text-primary" />
            <span className="ml-2 hidden sm:inline">
              RAG Knowledge Contributions
            </span>
            <span className="ml-2 sm:hidden">RAG Knowledge</span>
          </Badge>
          <h1
            className="mb-4 max-w-4xl px-4 text-2xl leading-tight font-bold tracking-wide sm:mb-6 sm:text-3xl md:text-4xl lg:text-5xl"
            style={{
              background: 'linear-gradient(180deg, #418945 0%, #404040 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Manage & Contribute Knowledge
          </h1>
          <p className="mx-auto max-w-3xl px-4 text-base text-muted-foreground sm:text-lg md:text-xl">
            Upload, curate, and sync knowledge sources for Retrieval-Augmented
            Generation (RAG). Keep your team&apos;s data up to date and easy to
            find.
          </p>
        </div>
      </div>
    </section>
  );
}
