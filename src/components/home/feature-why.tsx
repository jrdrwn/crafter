import { Brain, Group, Target } from 'lucide-react';
import { useTranslations } from 'next-intl';

import Brand from '../shared/brand';
import { Card, CardContent } from '../ui/card';

export default function FeatureWhy() {
  const t = useTranslations('home.featureWhy');
  return (
    <section className="relative border-b border-dashed border-primary py-8 md:py-12 lg:py-14">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="absolute inset-x-4 inset-y-0 border-x border-dashed border-primary md:inset-x-8 lg:inset-x-12">
          <Brand className="absolute -right-3 -bottom-3 z-1 size-6 stroke-primary text-primary md:-right-4 md:-bottom-4 md:size-8"></Brand>
          <Brand className="absolute -bottom-3 -left-3 z-1 size-6 stroke-primary text-primary md:-bottom-4 md:-left-4 md:size-8"></Brand>
        </div>
        <div className="text-center">
          <h2 className="mb-3 text-2xl font-bold tracking-wide text-primary sm:text-3xl md:mb-4 md:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-md text-base md:text-lg">{t('desc')}</p>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 md:mt-12 md:gap-6 lg:grid-cols-3 lg:gap-8 lg:px-16">
          <Card className="w-full border-primary bg-primary/5">
            <CardContent className="text-center">
              <span
                style={{
                  borderRadius: '16px',
                  background:
                    'linear-gradient(318deg, var(--accent-foreground) 5.91%, var(--primary) 95.37%)',
                  display: 'inline-flex',
                  padding: '8px',
                }}
              >
                <Brain
                  size={40}
                  className="text-primary-foreground md:size-12"
                />
              </span>
              <h3 className="mt-3 mb-2 text-lg font-bold text-primary md:mt-4 md:text-xl">
                {t('ai.title')}
              </h3>
              <p className="text-xs md:text-sm">{t('ai.desc')}</p>
            </CardContent>
          </Card>
          <Card className="w-full border-none bg-primary/5 shadow-none">
            <CardContent className="text-center">
              <span
                style={{
                  borderRadius: '16px',
                  background:
                    'linear-gradient(318deg, var(--accent-foreground) 5.91%, var(--primary) 95.37%)',
                  display: 'inline-flex',
                  padding: '8px',
                }}
              >
                <Target
                  size={40}
                  className="text-primary-foreground md:size-12"
                />
              </span>
              <h3 className="mt-3 mb-2 text-lg font-bold text-primary md:mt-4 md:text-xl">
                {t('taxonomy.title')}
              </h3>
              <p className="text-xs md:text-sm">{t('taxonomy.desc')}</p>
            </CardContent>
          </Card>
          <Card className="w-full border-none bg-primary/5 shadow-none sm:col-span-2 lg:col-span-1">
            <CardContent className="text-center">
              <span
                style={{
                  borderRadius: '16px',
                  background:
                    'linear-gradient(318deg, var(--accent-foreground) 5.91%, var(--primary) 95.37%)',
                  display: 'inline-flex',
                  padding: '8px',
                }}
              >
                <Group
                  size={40}
                  className="text-primary-foreground md:size-12"
                />
              </span>
              <h3 className="mt-3 mb-2 text-lg font-bold text-primary md:mt-4 md:text-xl">
                {t('multi.title')}
              </h3>
              <p className="text-xs md:text-sm">{t('multi.desc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
