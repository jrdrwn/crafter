'use client';

import { cn } from '@/lib/utils';
import parse from 'html-react-parser';
import { Blend, List, Text, User } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { MinimalTiptap } from '../../ui/shadcn-io/minimal-tiptap';
import { PersonaStyle } from '../persona';

// Types
export interface PersonaResponse {
  result: {
    full_name: string;
    quote: string;
    mixed: string;
    bullets: string;
    narative: string;
  };
  taxonomy?: {
    domain?: {
      label?: string;
    };
  };
}

// Header/Profile card
function PersonaHeader({
  personaResponse: persona,
}: {
  personaResponse?: PersonaResponse;
}) {
  return (
    <Card className="w-full border-primary bg-primary/5">
      <CardContent className="py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground md:size-30">
            <User className="size-10 md:size-[60px]" />
          </span>
          <p className="text-xl font-bold text-primary md:text-2xl">
            {persona?.result?.full_name ?? 'Persona Name'}
          </p>
          <p className="text-center text-base text-gray-500 italic md:text-lg dark:text-gray-300">
            {persona?.result?.quote ?? '—'}
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <Badge
              variant={'outline'}
              className="rounded-full border-primary text-xs text-primary md:text-sm"
            >
              {persona?.taxonomy?.domain?.label ?? '—'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Style selector actions
function PersonaStyleSelector({
  personaStyle,
  setPersonaStyle,
}: {
  personaStyle: PersonaStyle;
  setPersonaStyle: (style: PersonaStyle) => void;
}) {
  return (
    <Card className="w-full border-primary bg-primary/5 py-3 md:py-4">
      <CardContent className="px-3 md:px-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="px-0 text-base font-bold text-primary md:text-xl">
            Select Naration & Structure
          </h2>
          <div className="flex flex-wrap items-center justify-start gap-2 md:justify-center md:gap-4">
            <Button
              variant={'outline'}
              size={'sm'}
              className={cn(
                'flex-1 md:flex-none',
                personaStyle === 'mixed'
                  ? 'border-primary text-primary'
                  : 'text-border',
              )}
              onClick={() => setPersonaStyle('mixed')}
            >
              <Text className="size-4" />
              <span className="text-xs sm:text-sm">Mixed</span>
            </Button>
            <Button
              variant={'outline'}
              size={'sm'}
              className={cn(
                'flex-1 md:flex-none',
                personaStyle === 'bullets'
                  ? 'border-primary text-primary'
                  : 'text-border',
              )}
              onClick={() => setPersonaStyle('bullets')}
            >
              <List className="size-4" />
              <span className="text-xs sm:text-sm">Bullets</span>
            </Button>
            <Button
              variant={'outline'}
              size={'sm'}
              className={cn(
                'flex-1 md:flex-none',
                personaStyle === 'narative'
                  ? 'border-primary text-primary'
                  : 'text-border',
              )}
              onClick={() => setPersonaStyle('narative')}
            >
              <Blend className="size-4" />
              <span className="text-xs sm:text-sm">Narrative</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Persona content renderer
function PersonaContent({
  personaStyle,
  markdown,
}: {
  personaStyle: PersonaStyle;
  markdown?: PersonaResponse;
}) {
  if (!markdown) return null;
  return (
    <Card className="w-full border-primary p-0">
      <div className="prose prose-sm max-w-full p-3 md:prose-lg md:p-4 dark:prose-invert prose-h2:mb-2 prose-h2:text-primary prose-h3:text-primary prose-h4:text-primary">
        {personaStyle === 'mixed' && parse(markdown.result.mixed)}
        {personaStyle === 'bullets' && parse(markdown.result.bullets)}
        {personaStyle === 'narative' && parse(markdown.result.narative)}
      </div>
    </Card>
  );
}

// Persona content editor (guest)
function PersonaContentEdit({
  personaStyle,
  markdown,
}: {
  personaStyle: PersonaStyle;
  markdown?: PersonaResponse;
}) {
  const searchParams = useSearchParams();
  const [mixedContent, setMixedContent] = useState<string>(
    markdown?.result?.mixed || '',
  );
  const [bulletsContent, setBulletsContent] = useState<string>(
    markdown?.result?.bullets || '',
  );
  const [narativeContent, setNarativeContent] = useState<string>(
    markdown?.result?.narative || '',
  );

  function saveToLocalStorage() {
    try {
      const STORAGE_KEY = 'crafter:personas';
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored);
      const updated = {
        ...data,
        response: {
          ...data?.response,
          result: {
            ...data?.response?.result,
            mixed: mixedContent,
            bullets: bulletsContent,
            narative: narativeContent,
          },
        },
        updated_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      toast.success('Persona content updated successfully!');
    } catch (_e) {
      toast.error('Failed to save changes.');
    }
  }

  useEffect(() => {
    if (searchParams.get('save_edit')) {
      saveToLocalStorage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!markdown) return null;
  return (
    <Card className="w-full border-primary p-0">
      <div className="prose prose-lg max-w-full p-0 dark:prose-invert prose-headings:text-primary prose-h2:mb-2">
        {personaStyle === 'mixed' && (
          <MinimalTiptap content={mixedContent} onChange={setMixedContent} />
        )}
        {personaStyle === 'bullets' && (
          <MinimalTiptap
            content={bulletsContent}
            onChange={setBulletsContent}
          />
        )}
        {personaStyle === 'narative' && (
          <MinimalTiptap
            content={narativeContent}
            onChange={setNarativeContent}
          />
        )}
      </div>
    </Card>
  );
}

export default function Persona({ markdown }: { markdown?: PersonaResponse }) {
  const searchParams = useSearchParams();
  const [personaStyle, setPersonaStyle] = useState<PersonaStyle>('mixed');
  return (
    <>
      <div className="col-span-full space-y-3 md:col-span-2 md:space-y-4">
        <PersonaHeader personaResponse={markdown} />
        <PersonaStyleSelector
          personaStyle={personaStyle}
          setPersonaStyle={setPersonaStyle}
        />
        {searchParams.get('free_edit') ? (
          <PersonaContentEdit personaStyle={personaStyle} markdown={markdown} />
        ) : (
          <PersonaContent personaStyle={personaStyle} markdown={markdown} />
        )}
      </div>
    </>
  );
}
