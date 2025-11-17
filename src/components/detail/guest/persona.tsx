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
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-4">
          <span className="flex size-30 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User size={60} />
          </span>
          <p className="text-2xl font-bold text-primary">
            {persona?.result?.full_name ?? 'Persona Name'}
          </p>
          <p className="text-center text-lg text-gray-500 italic">
            {persona?.result?.quote ?? '—'}
          </p>
          <div className="flex items-center justify-center gap-8">
            <Badge
              variant={'outline'}
              className="rounded-full border-primary text-primary"
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
      <div className="prose prose-lg max-w-full p-4 dark:prose-invert prose-h2:mb-2 prose-h2:text-primary prose-h3:text-primary prose-h4:text-primary">
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
      <div className="col-span-2 space-y-4">
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
