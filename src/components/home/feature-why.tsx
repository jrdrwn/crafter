import { Brain, Flower, Group, Target } from 'lucide-react';

import { Card, CardContent } from '../ui/card';

export default function FeatureWhy() {
  return (
    <section className="relative container mx-auto border-b border-dashed border-primary py-14">
      <div className="absolute inset-x-12 inset-y-0 border-x border-dashed border-primary">
        <Flower className="absolute -right-4 -bottom-4 size-8 text-primary"></Flower>
        <Flower className="absolute -bottom-4 -left-4 size-8 text-primary"></Flower>
      </div>
      <div className="text-center">
        <h2 className="mb-4 text-4xl font-bold tracking-wide text-primary">
          Why CRAFTER 2.0?
        </h2>
        <p className="mx-auto max-w-md text-lg">
          A complete solution for creating{' '}
          <span className="font-medium">high-quality personas</span> with
          cutting-edge AI technology.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-8 px-16">
        <Card className="w-full max-w-sm border-primary bg-primary/5">
          <CardContent className="text-center">
            <span
              style={{
                borderRadius: '16px',
                background:
                  'linear-gradient(318deg, rgba(207, 225, 255, 0.73) 5.91%, rgba(58, 129, 246, 0.73) 95.37%)',
                display: 'inline-flex',
                padding: '8px',
              }}
            >
              <Brain size={48} className="text-primary-foreground" />
            </span>
            <h3 className="mt-4 mb-2 text-xl font-bold text-primary">
              AI-Powered Generation
            </h3>
            <p className="text-sm">
              Leverage advanced AI to generate accurate and comprehensive user
              personas.
            </p>
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm border-none bg-primary/5 shadow-none">
          <CardContent className="text-center">
            <span
              style={{
                borderRadius: '16px',
                background:
                  'linear-gradient(318deg, rgba(207, 225, 255, 0.73) 5.91%, rgba(58, 129, 246, 0.73) 95.37%)',
                display: 'inline-flex',
                padding: '8px',
              }}
            >
              <Target size={48} className="text-primary-foreground" />
            </span>
            <h3 className="mt-4 mb-2 text-xl font-bold text-primary">
              Taxonomy-Based
            </h3>
            <p className="text-sm">
              A structured taxonomy-driven system that ensures consistent and
              reliable results.
            </p>
          </CardContent>
        </Card>
        <Card className="w-full max-w-sm border-none bg-primary/5 shadow-none">
          <CardContent className="text-center">
            <span
              style={{
                borderRadius: '16px',
                background:
                  'linear-gradient(318deg, rgba(207, 225, 255, 0.73) 5.91%, rgba(58, 129, 246, 0.73) 95.37%)',
                display: 'inline-flex',
                padding: '8px',
              }}
            >
              <Group size={48} className="text-primary-foreground" />
            </span>
            <h3 className="mt-4 mb-2 text-xl font-bold text-primary">
              Multi-Domain Support
            </h3>
            <p className="text-sm">
              Adaptable across diverse domains, from healthcare and education to
              technology
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
