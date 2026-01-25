'use client';

import { useUser } from '@/contexts/user-context';
import { ChevronRight, History, Sparkles, Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { HeroSidesDecorator } from '../shared/hero-sides-decorator';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

export default function Hero() {
  const t = useTranslations('home.hero');
  const { user } = useUser();
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div>
        <div className="absolute inset-x-4 top-0 bottom-0 bg-[radial-gradient(color-mix(in_oklab,var(--primary)_20%,transparent)_1px,var(--background)_1px)] bg-[size:18px_18px] md:inset-x-8 lg:inset-x-12"></div>
        <div className="absolute inset-x-4 top-0 bottom-0 bg-[radial-gradient(125%_125%_at_50%_10%,color-mix(in_oklab,var(--foreground)_0%,transparent)_55%,color-mix(in_oklab,var(--accent)_100%,transparent)_100%)] md:inset-x-8 lg:inset-x-12"></div>
      </div>
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <HeroSidesDecorator />
        <div className="z-1 mx-auto px-4 text-center md:px-8">
          <Badge
            variant={'outline'}
            className="mb-3 rounded-full border-primary px-3 py-1.5 text-xs md:mb-4 md:px-4 md:py-2 md:text-sm"
          >
            <Tags className="h-3 w-3 text-primary md:h-4 md:w-4" />
            {t('badge')}
          </Badge>
          <h1
            className="mb-4 max-w-5xl text-2xl leading-tight font-bold tracking-wide sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
            style={{
              background:
                'linear-gradient(180deg, var(--primary) 0%, var(--foreground) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg lg:text-xl">
            {t('subtitle')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 md:mt-8 md:gap-4 lg:gap-8">
            {user ? (
              <>
                <Link href="/create" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Sparkles />
                    {t('start')}
                  </Button>
                </Link>
                <Link href="/history" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto" variant={'outline'}>
                    <History />
                    {t('history')}
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/create" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Sparkles />
                    {t('continue')}
                  </Button>
                </Link>
                <Link href="/create-account" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    {t('join')}
                    <ChevronRight />
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="mt-6 md:mt-8">
            <p className="text-xs md:text-sm">{t('trusted')}</p>
            <div className="flex flex-wrap justify-center gap-3 text-muted-foreground *:mt-3 md:gap-4 md:*:mt-4">
              <span className="text-xs md:text-sm">{t('roles.0')}</span>
              <span className="text-xs md:text-sm">{t('roles.1')}</span>
              <span className="text-xs md:text-sm">{t('roles.2')}</span>
              <span className="text-xs md:text-sm">{t('roles.3')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
