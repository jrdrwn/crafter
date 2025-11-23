/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { cn } from '@/lib/utils';
import { getCookie } from 'cookies-next/client';
import parse from 'html-react-parser';
import { Blend, List, Pencil, Text, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { MinimalTiptap } from '../ui/shadcn-io/minimal-tiptap';
import { Spinner } from '../ui/spinner';

// Extracted type for reuse across smaller components
export type PersonaStyle = 'mixed' | 'bullets' | 'narative';

interface PersonaMarkdown {
  result: {
    full_name: string;
    quote: string;
    mixed: string;
    bullets: string;
    narative: string;
    image_url?: string;
  };
  taxonomy?: {
    domain?: {
      label?: string;
    };
  };
}
function PersonaHeader({
  markdown,
  imageUrl,
  setImageUrl,
}: {
  markdown?: any;
  imageUrl: string;
  setImageUrl: (url: string) => void;
}) {
  const searchParams = useSearchParams();
  const [uploading, setUploading] = useState(false);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload/image', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${getCookie('token') || ''}`,
        },
        body: formData,
      });
      if (!res.ok) {
        toast.error('Image upload failed');
        return;
      }
      const data = await res.json();
      if (data.status && data.url) {
        setImageUrl(data.url);
        toast.success('Image uploaded!');
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className="w-full border-primary bg-primary/5">
      <CardContent className="py-6 md:py-8">
        <div className="flex flex-col items-center justify-center gap-3 md:gap-4">
          {/* Image preview and dropdown edit (edit mode only) */}
          {searchParams.get('free_edit') ? (
            <div className="relative mb-2 flex w-full flex-col items-center">
              {/* Dropdown button at bottom center above image */}
              <div className="absolute -bottom-4 left-1/2 z-10 -translate-x-1/2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    {uploading ? (
                      <Button size="sm" variant="outline" disabled>
                        <Spinner />
                        Uploading...
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        <Pencil />
                        Edit
                      </Button>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center">
                    <DropdownMenuItem asChild>
                      <label
                        htmlFor="persona-upload-input"
                        className="w-full cursor-pointer"
                      >
                        Upload (max 2MB)
                      </label>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setImageUrl('')}
                      variant="destructive"
                    >
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* Hidden file input for upload */}
                <Input
                  id="persona-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>
              {/* Image below dropdown */}
              <div className="flex flex-col items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Persona"
                    width={112}
                    height={112}
                    className="h-28 w-28 rounded-full border border-primary object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="flex size-24 items-center justify-center rounded-full bg-primary text-primary-foreground md:size-30">
                    <User className="size-12 md:size-[60px]" />
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground md:size-30">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Persona"
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded-full border border-primary object-cover"
                  unoptimized
                />
              ) : (
                <User className="size-10 md:size-[60px]" />
              )}
            </span>
          )}
          <p className="text-xl font-bold text-primary md:text-2xl">
            {markdown?.result?.full_name ?? 'Persona Name'}
          </p>
          <p className="text-center text-base text-gray-500 italic md:text-lg dark:text-gray-300">
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

// Smaller component: Persona content renderer
function PersonaContent({
  personaStyle,
  markdown,
}: {
  personaStyle: PersonaStyle;
  markdown?: PersonaMarkdown;
}) {
  if (!markdown) return null;
  let content = '';
  if (personaStyle === 'mixed') content = markdown.result.mixed || '';
  if (personaStyle === 'bullets') content = markdown.result.bullets || '';
  if (personaStyle === 'narative') content = markdown.result.narative || '';
  // Simple word count (strip HTML tags, split by whitespace)
  const wordCount = content
    ? content
        .replace(/<[^>]+>/g, '')
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;
  return (
    <Card className="w-full border-primary p-0">
      <div className="prose prose-sm max-w-full p-3 md:prose-lg md:p-4 dark:prose-invert prose-h2:mb-2 prose-h2:text-primary prose-h3:text-primary prose-h4:text-primary">
        {personaStyle === 'mixed' && parse(markdown.result.mixed)}
        {personaStyle === 'bullets' && parse(markdown.result.bullets)}
        {personaStyle === 'narative' && parse(markdown.result.narative)}
      </div>
      <div className="px-3 pb-2 text-right text-xs text-muted-foreground md:px-4">
        Word count: <span className="font-semibold">{wordCount}</span>
      </div>
    </Card>
  );
}
function PersonaContentEdit({
  personaStyle,
  markdown,
  imageUrl,
}: {
  personaStyle: PersonaStyle;
  markdown?: any;
  imageUrl: string;
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
        image_url: imageUrl,
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
  const [imageUrl, setImageUrl] = useState<string>(
    persona?.result?.image_url || '',
  );
  return (
    <>
      <div className="col-span-full space-y-3 md:col-span-2 md:space-y-4">
        <PersonaHeader
          markdown={persona}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
        />
        <PersonaStyleSelector
          personaStyle={personaStyle}
          setPersonaStyle={setPersonaStyle}
        />
        {searchParams.get('free_edit') ? (
          <PersonaContentEdit
            personaStyle={personaStyle}
            markdown={persona}
            imageUrl={imageUrl}
          />
        ) : (
          <PersonaContent personaStyle={personaStyle} markdown={persona} />
        )}
      </div>
    </>
  );
}
