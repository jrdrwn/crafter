'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import Image from 'next/image';

import { Badge } from '../ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

interface PersonaCardProps {
  name: string;
  photoUrl?: string;
  subtitle?: string;
  quote?: string;
  tag?: string;
  date?: string;
  createdByMe?: boolean;
  className?: string;
  quoteClamp?: 2 | 3 | 4;
  authorName?: string;
  authorEmail?: string;
}

export function PersonaCard({
  name,
  subtitle,
  photoUrl,
  quote,
  tag,
  date,
  createdByMe,
  className,
  quoteClamp,
  authorName,
  authorEmail,
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
      className={cn(
        'h-full w-full gap-4 py-4 hover:border-primary hover:bg-primary/5',
        className,
      )}
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
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={`${name}'s photo`}
                className="h-14 w-14 rounded-full object-cover"
                width={56}
                height={56}
              />
            ) : (
              <User />
            )}
          </span>
          <div>
            <p className="text-lg font-semibold text-primary">{name}</p>
            {subtitle && (
              <p className="font-medium text-gray-500 dark:text-gray-300">
                {subtitle}
              </p>
            )}
            {(authorName || authorEmail) && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {createdByMe
                  ? 'by You'
                  : `by ${authorName || (authorEmail ? authorEmail.split('@')[0] : '')}`}
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      {quote && (
        <CardContent className="px-4">
          <p
            className={cn(
              'text-gray-500 italic dark:text-gray-300',
              clampClass,
            )}
          >
            “{quote}”
          </p>
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
