import { BadgeCheck, User, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function FeatureRevolutionize() {
  const t = useTranslations('home.featureRevolutionize');
  return (
    <section className="relative px-8 py-8 md:px-12 md:py-12 lg:px-16 lg:py-14 xl:px-24">
      <div className="container mx-auto">
        <div className="absolute inset-x-4 top-0 bottom-1/3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[1px] before:bg-gradient-to-b before:from-primary before:to-transparent before:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] before:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[1px] after:bg-gradient-to-b after:from-primary after:to-transparent after:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] after:content-[''] md:inset-x-8 lg:inset-x-12"></div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-3 max-w-2xl text-2xl font-bold tracking-wide text-primary sm:text-3xl md:mb-4 md:text-4xl">
              {t('title')}
            </h2>
            <p className="max-w-3xl text-base md:text-lg">{t('desc')}</p>
            <div className="mt-6 md:mt-8">
              <ul className="mb-6 space-y-2 md:mb-8 md:space-y-3 [&>li]:flex [&>li]:items-center [&>li]:gap-1.5 [&>li]:text-sm [&>li]:md:text-base [&>li>svg]:text-primary">
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  {t('points.0')}
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  {t('points.1')}
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  {t('points.2')}
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  {t('points.3')}
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  {t('points.4')}
                </li>
              </ul>
              <Link href="/create" className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Zap />
                  {t('cta')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center lg:justify-end">
            <Card className="w-full max-w-lg border-primary bg-primary/5">
              <CardContent className="p-4 md:p-6">
                <div className="mb-4 flex items-center">
                  <span className="mr-3 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary md:mr-4 md:size-20">
                    <User size={28} className="md:size-10" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-primary md:text-lg">
                      {t('persona.name')}
                    </p>
                    <p className="text-sm font-medium text-card-foreground md:text-base">
                      {t('persona.role')}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-card-foreground italic md:text-base">
                  &ldquo;{t('persona.quote')}&rdquo;
                </p>
                <div className="mt-4 space-y-2 [&>div]:flex [&>div]:justify-between [&>div]:text-xs [&>div]:font-medium [&>div]:text-card-foreground [&>div]:md:text-sm [&>div>:first-child]:text-primary">
                  <div>
                    <span>{t('motivation')}</span>
                    <span>{t('persona.motivation')}</span>
                  </div>
                  <div>
                    <span>{t('pain')}</span>
                    <span>{t('persona.pain')}</span>
                  </div>
                  <div>
                    <span>{t('skill')}</span>
                    <span>{t('persona.skill')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
