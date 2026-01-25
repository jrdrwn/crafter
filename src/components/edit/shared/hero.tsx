'use client';

import { Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { HeroSidesDecorator } from '../../shared/hero-sides-decorator';
import { Badge } from '../../ui/badge';

export default function Hero() {
  const t = useTranslations('edit');
  return (
    <section className="relative border-b border-dashed border-primary px-2 py-8 md:py-12 lg:py-16">
      <div className="container mx-auto flex flex-col justify-center lg:flex-row lg:justify-between">
        <HeroSidesDecorator />
        <div className="z-1 mx-6 text-center sm:mx-10 lg:mx-auto">
          <Badge
            variant={'outline'}
            className="mb-4 rounded-full border-primary px-3 py-1.5 sm:px-4 sm:py-2"
          >
            <Tags className="h-3 w-3 text-primary sm:h-4 sm:w-4" />
            {t('hero-badge')}
          </Badge>
          <h1
            className="mb-4 max-w-4xl text-2xl leading-tight font-bold tracking-wide sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl"
            style={{
              background:
                'linear-gradient(180deg, var(--primary) 0%, var(--foreground) 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('hero-title')}
          </h1>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground sm:text-lg md:text-xl">
            {t('hero-desc-part1')}{' '}
            <span className="font-medium">{t('hero-desc-part2')} </span>
            {t('hero-desc-part3')}{' '}
            <span className="font-medium">{t('hero-desc-part4')}</span>{' '}
            {t('hero-desc-part5')}{' '}
            <span className="font-medium">{t('hero-desc-part6')}</span>{' '}
            {t('hero-desc-part7')}
          </p>
        </div>
      </div>
    </section>
  );
}
