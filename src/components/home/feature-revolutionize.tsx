import { BadgeCheck, User, Zap } from 'lucide-react';
import Link from 'next/link';

import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

export default function FeatureRevolutionize() {
  return (
    <section className="relative px-24 py-14">
      <div className="container mx-auto">
        <div className="absolute inset-x-12 top-0 bottom-1/3 before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[1px] before:bg-gradient-to-b before:from-primary before:to-transparent before:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] before:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[1px] after:bg-gradient-to-b after:from-primary after:to-transparent after:[mask-image:repeating-linear-gradient(to_bottom,black_0_2.5px,transparent_2.5px_4px)] after:content-['']"></div>
        <div>
          <h2 className="mb-4 max-w-2xl text-4xl font-bold tracking-wide text-primary">
            Revolutionize the Way You Understand Your Users
          </h2>
          <p className="max-w-3xl text-lg">
            With a taxonomy-based methodology, CRAFTER 2.0 generates personas
            that are not only accurate, but also consistent and reliable for a
            wide range of user research needs.
          </p>
        </div>
        <div className="mt-8">
          <ul className="mb-8 space-y-3 [&>li]:flex [&>li]:items-center [&>li]:gap-1.5 [&>li>svg]:text-primary">
            <li>
              <BadgeCheck size={20} />
              Save time in user research
            </li>
            <li>
              <BadgeCheck size={20} />
              More accurate and detailed personas
            </li>
            <li>
              <BadgeCheck size={20} />
              Consistency through structured methodology
            </li>
            <li>
              <BadgeCheck size={20} />
              Easy to use for any team
            </li>
            <li>
              <BadgeCheck size={20} />
              Export in multiple formats
            </li>
          </ul>
          <Link href="/create">
            <Button>
              <Zap />
              Start Creating Personas
            </Button>
          </Link>
        </div>
        <div className="absolute top-30 right-26">
          <Card className="w-full max-w-lg border-primary bg-primary/5">
            <CardContent>
              <div className="mb-4 flex items-center">
                <span className="mr-4 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User size={42} />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
              <div className="mt-4 space-y-2 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-medium [&>div]:text-gray-500 [&>div>:first-child]:text-primary">
                <div>
                  <span>Motivasi:</span>
                  <span>Efisiensi operasional</span>
                </div>
                <div>
                  <span>Pain Point:</span>
                  <span>Interface kompleks</span>
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
    </section>
  );
}
