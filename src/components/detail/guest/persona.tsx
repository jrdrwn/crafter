'use client';

import { cn } from '@/lib/utils';
import parse from 'html-react-parser';
import { Blend, List, Text, User } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';

export default function Persona({ markdown }: { markdown: any }) {
  const [personaStyle, setPersonaStyle] = useState<
    'mixed' | 'bullets' | 'narative'
  >('mixed');
  return (
    <>
      <div className="col-span-2 space-y-4">
        <Card className="w-full border-primary bg-primary/5">
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              <span className="flex size-30 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User size={60} />
              </span>
              <p className="text-2xl font-bold text-primary">
                {markdown.result.full_name}
              </p>
              <p className="text-center text-lg text-gray-500 italic">
                {markdown.result.quote}
              </p>
              <div className="flex items-center justify-center gap-8">
                <Badge
                  variant={'outline'}
                  className="rounded-full border-primary text-primary"
                >
                  {markdown.taxonomy.domain.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full border-primary bg-primary/5 py-4">
          <CardContent>
            <div className="flex items-center justify-between">
              <h2 className="px-0 text-xl font-bold text-primary">
                Select Naration & Structure
              </h2>
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant={'outline'}
                  className={cn(
                    personaStyle === 'mixed'
                      ? 'border-primary text-primary'
                      : 'text-border',
                  )}
                  onClick={() => setPersonaStyle('mixed')}
                >
                  <Text />
                  Mixed
                </Button>
                <Button
                  variant={'outline'}
                  className={cn(
                    personaStyle === 'bullets'
                      ? 'border-primary text-primary'
                      : 'text-border',
                  )}
                  onClick={() => setPersonaStyle('bullets')}
                >
                  <List />
                  Bullets
                </Button>
                <Button
                  variant={'outline'}
                  className={cn(
                    personaStyle === 'narative'
                      ? 'border-primary text-primary'
                      : 'text-border',
                  )}
                  onClick={() => setPersonaStyle('narative')}
                >
                  <Blend />
                  Narrative
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full border-primary p-0">
          <div className="prose prose-lg max-w-full p-4 dark:prose-invert prose-h2:mb-2 prose-h2:text-primary prose-h3:text-primary prose-h4:text-primary">
            {personaStyle === 'mixed' && parse(markdown.result.mixed)}
            {personaStyle === 'bullets' && parse(markdown.result.bullets)}
            {personaStyle === 'narative' && parse(markdown.result.narative)}
          </div>
        </Card>
      </div>
    </>
  );
}
