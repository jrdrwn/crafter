import { BadgeCheck, User, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function FeatureRevolutionize() {
  return (
    <section className="relative px-8 py-8 md:px-12 md:py-12 lg:px-16 lg:py-14 xl:px-24">
      <div className="container mx-auto">
        <div className="absolute inset-x-4 top-0 bottom-1/3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[1px] before:bg-gradient-to-b before:from-primary before:to-transparent before:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] before:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[1px] after:bg-gradient-to-b after:from-primary after:to-transparent after:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] after:content-[''] md:inset-x-8 lg:inset-x-12"></div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="mb-3 max-w-2xl text-2xl font-bold tracking-wide text-primary sm:text-3xl md:mb-4 md:text-4xl">
              Revolutionize the Way You Understand Your Users
            </h2>
            <p className="max-w-3xl text-base md:text-lg">
              With a taxonomy-based methodology, CRAFTER 2.0 generates personas
              that are not only accurate, but also consistent and reliable for a
              wide range of user research needs.
            </p>
            <div className="mt-6 md:mt-8">
              <ul className="mb-6 space-y-2 md:mb-8 md:space-y-3 [&>li]:flex [&>li]:items-center [&>li]:gap-1.5 [&>li]:text-sm [&>li]:md:text-base [&>li>svg]:text-primary">
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  Save time in user research
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  More accurate and detailed personas
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  Consistency through structured methodology
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  Easy to use for any team
                </li>
                <li>
                  <BadgeCheck size={18} className="md:size-5" />
                  Export in multiple formats
                </li>
              </ul>
              <Link href="/create" className="inline-block w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <Zap />
                  Start Creating Personas
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
                      Ahmad Rizky
                    </p>
                    <p className="text-sm font-medium text-card-foreground md:text-base">
                      Product Manager, 28 years old
                    </p>
                  </div>
                </div>
                <p className="text-sm text-card-foreground italic md:text-base">
                  &ldquo;I need an efficient solution to automate business
                  processes without sacrificing quality.&rdquo;
                </p>
                <div className="mt-4 space-y-2 [&>div]:flex [&>div]:justify-between [&>div]:text-xs [&>div]:font-medium [&>div]:text-card-foreground [&>div]:md:text-sm [&>div>:first-child]:text-primary">
                  <div>
                    <span>Motivation:</span>
                    <span>Operational efficiency</span>
                  </div>
                  <div>
                    <span>Pain Point:</span>
                    <span>Complex interface</span>
                  </div>
                  <div>
                    <span>Skill Level:</span>
                    <span>Intermediate</span>
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
