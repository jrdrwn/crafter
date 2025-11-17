/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next/client';
import parse from 'html-react-parser';
import { Blend, List, Text, User } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { MinimalTiptap } from '../ui/shadcn-io/minimal-tiptap';

// Extracted type for reuse across smaller components
export type PersonaStyle = 'mixed' | 'bullets' | 'narative';

interface PersonaMarkdown {
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

// Smaller component: Header/Profile card
function PersonaHeader({ markdown }: { markdown?: any }) {
  return (
    <Card className="w-full border-primary bg-primary/5">
      <CardContent className="py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
          <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground md:size-30">
            <User className="size-10 md:size-[60px]" />
          </span>
          <p className="text-xl font-bold text-primary md:text-2xl">
            {markdown?.result?.full_name ?? 'Persona Name'}
          </p>
          <p className="text-center text-base text-gray-500 italic md:text-lg">
            {markdown?.result?.quote ?? '—'}
          </p>
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <Badge
              variant={'outline'}
              className="rounded-full border-primary text-xs text-primary md:text-sm"
            >
              {markdown?.domain?.label ?? '—'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Smaller component: Style selector actions
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
          <div className="flex items-center justify-start gap-2 md:justify-center md:gap-4">
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
              <span className="hidden sm:inline">Mixed</span>
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
              <span className="hidden sm:inline">Bullets</span>
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
              <span className="hidden sm:inline">Narrative</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Smaller component: Persona content renderer
function PersonaContent({
  personaStyle,
  markdown,
}: {
  personaStyle: PersonaStyle;
  markdown?: PersonaMarkdown;
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
function PersonaContentEdit({
  personaStyle,
  markdown,
}: {
  personaStyle: PersonaStyle;
  markdown?: any;
}) {
  const token = getCookie('token');
  const router = useRouter();
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

  async function updatePersonaContent() {
    const res = await fetch(`/api/persona/${markdown?.id}/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...markdown?.result,
        mixed: mixedContent,
        bullets: bulletsContent,
        narative: narativeContent,
      }),
    });

    if (res.ok) {
      toast.success('Persona content updated successfully!');
    } else {
      toast.error('Failed to update persona content.');
    }
    router.push(`?free_edit=true`);
  }

  useEffect(() => {
    if (searchParams.get('save_edit')) {
      updatePersonaContent();
    }
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

export default function Persona({ persona }: { persona?: any }) {
  const searchParams = useSearchParams();
  const [personaStyle, setPersonaStyle] = useState<PersonaStyle>('mixed');
  return (
    <>
      <div className="col-span-full space-y-3 md:col-span-2 md:space-y-4">
        <PersonaHeader markdown={persona} />
        <PersonaStyleSelector
          personaStyle={personaStyle}
          setPersonaStyle={setPersonaStyle}
        />
        {searchParams.get('free_edit') ? (
          <PersonaContentEdit personaStyle={personaStyle} markdown={persona} />
        ) : (
          <PersonaContent personaStyle={personaStyle} markdown={persona} />
        )}
      </div>
    </>
  );
}
