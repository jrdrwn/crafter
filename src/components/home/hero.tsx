'use client';

import { useUser } from '@/contexts/user-context';
import { ChevronRight, Sparkles, Tags } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function Hero() {
  const { user } = useUser();
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div className="">
        <div className="absolute inset-x-4 top-0 bottom-0 bg-[radial-gradient(#41894533_1px,#f8f5f0_1px)] bg-[size:18px_18px] md:inset-x-8 lg:inset-x-12"></div>
        <div className="absolute inset-x-4 top-0 bottom-0 bg-[radial-gradient(125%_125%_at_50%_10%,rgba(248,245,240,0)_55%,rgba(212,255,215,1)_100%)] md:inset-x-8 lg:inset-x-12"></div>
      </div>
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <div className="absolute inset-x-4 inset-y-0 border-x border-dashed border-primary md:inset-x-8 lg:inset-x-12">
          <span
            className="absolute -top-6 -left-6 size-12 overflow-hidden rounded-full border border-dashed border-primary md:-top-10 md:-left-10 md:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span
            className="absolute -top-6 -right-6 size-12 overflow-hidden rounded-full border border-dashed border-primary md:-top-10 md:-right-10 md:size-20"
            style={{
              clipPath: 'inset(50% 0 0 0)',
            }}
          ></span>
          <span className="absolute right-0 bottom-0 size-12 overflow-hidden rounded-full border border-dashed border-primary md:size-20"></span>
          <span className="absolute bottom-0 left-0 size-12 overflow-hidden rounded-full border border-dashed border-primary md:size-20"></span>
        </div>
        <div className="z-1 mx-auto px-4 text-center md:px-8">
          <Badge
            variant={'outline'}
            className="mb-3 rounded-full border-primary px-3 py-1.5 text-xs md:mb-4 md:px-4 md:py-2 md:text-sm"
          >
            <Tags className="h-3 w-3 text-primary md:h-4 md:w-4" />
            New in CRAFTER 2.0: Persona Taxonomy
          </Badge>
          <h1
            className="mb-4 max-w-5xl text-2xl leading-tight font-bold tracking-wide sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
            style={{
              background: 'linear-gradient(180deg, #418945 0%, #404040 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Crafting Recommendations and Advice for Tailored, Effective Personas
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg lg:text-xl">
            Stop guessing. Let <span className="font-medium">CRAFTER</span> that
            uncover user goals, motivations, and frustrations in seconds.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row md:mt-8 md:gap-4 lg:gap-8">
            {user ? (
              <Link href="/history" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Sparkles />
                  Go to History
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/create" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Sparkles />
                    Continue as Guest
                  </Button>
                </Link>
                <Link href="/create-account" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Join now!
                    <ChevronRight />
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-6 md:mt-8">
            <p className="text-xs md:text-sm">Trusted by Leading Teams</p>
            <div className="flex flex-wrap justify-center gap-3 text-muted-foreground *:mt-3 md:gap-4 md:*:mt-4">
              <span className="text-xs md:text-sm">UI/UX Teams</span>
              <span className="text-xs md:text-sm">Product Managers</span>
              <span className="text-xs md:text-sm">Developers</span>
              <span className="text-xs md:text-sm">Researchers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
