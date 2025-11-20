'use client';

import { Tags } from 'lucide-react';

import { HeroSidesDecorator } from '../shared/hero-sides-decorator';
import { Badge } from '../ui/badge';

export default function Hero() {
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <HeroSidesDecorator />
        <div className="z-1 mx-auto px-4 text-center md:px-8">
          <Badge
            variant={'outline'}
            className="mb-3 rounded-full border-primary px-3 py-1.5 text-xs md:mb-4 md:px-4 md:py-2 md:text-sm"
          >
            <Tags className="h-3 w-3 text-primary md:h-4 md:w-4" />
            Define Your Domain and Factors
          </Badge>
          <h1
            className="mb-4 max-w-4xl text-2xl leading-tight font-bold tracking-wide sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
            style={{
              background:
                'linear-gradient(180deg, var(--primary) 0%, var(--foreground) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Create Your Persona with AI
          </h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg lg:text-xl">
            Select a domain or industry, choose{' '}
            <span className="font-medium">
              relevant internal and external factors{' '}
            </span>
            , and let <span className="font-medium">CRAFTER 2.0</span> generate
            a structured <span className="font-medium">persona</span> for your
            research needs.
          </p>
        </div>
      </div>
    </section>
  );
}
