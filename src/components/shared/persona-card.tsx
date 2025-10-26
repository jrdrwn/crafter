'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

interface PersonaCardProps {
  name: string;
  subtitle?: string;
  quote?: string;
  tag?: string;
  date?: string;
  createdByMe?: boolean;
  className?: string;
  quoteClamp?: 2 | 3 | 4;
}

export function PersonaCard({
  name,
  subtitle,
  quote,
  tag,
  date,
  createdByMe,
  className,
  quoteClamp,
}: PersonaCardProps) {
  const clampClass =
    quoteClamp === 2
      ? 'line-clamp-2'
      : quoteClamp === 3
        ? 'line-clamp-3'
        : quoteClamp === 4
          ? 'line-clamp-4'
          : undefined;

  return (
    <Card
      className={cn('w-full gap-4 border-primary bg-primary/5 py-4', className)}
    >
      <CardHeader className="relative gap-0 px-4">
        {createdByMe && (
          <Badge
            variant={'outline'}
            className="absolute -top-2 right-2 rounded-full border-primary text-primary"
          >
            Created by Me
          </Badge>
        )}
        <div className="flex items-center">
          <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User />
          </span>
          <div>
            <p className="text-lg font-semibold text-primary">{name}</p>
            {subtitle && (
              <p className="font-medium text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </CardHeader>
      {quote && (
        <CardContent className="px-4">
          <p className={cn('text-gray-500 italic', clampClass)}>“{quote}”</p>
        </CardContent>
      )}
      {(tag || date) && (
        <CardFooter className="flex items-center justify-between px-4">
          {tag && (
            <Badge
              variant={'outline'}
              className="rounded-full border-primary text-muted-foreground"
            >
              {tag}
            </Badge>
          )}
          {date && (
            <span className="text-sm text-muted-foreground">{date}</span>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
