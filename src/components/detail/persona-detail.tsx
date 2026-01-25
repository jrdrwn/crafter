/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useUser } from '@/contexts/user-context';
import { getCookie } from 'cookies-next/client';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit,
  Eye,
  FileJson,
  FileText,
  LockKeyhole,
  Recycle,
  Save,
  Trash,
  Wifi,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Item, ItemActions, ItemContent, ItemMedia } from '../ui/item';
import { Label } from '../ui/label';
import { Skeleton } from '../ui/skeleton';
import { Switch } from '../ui/switch';
import Persona from './persona';

// Types for API response (minimal fields used here)
interface PersonaAPIResponse {
  status: boolean;
  data?: {
    id: number;
    result: {
      full_name: string;
      quote: string;
      mixed: string;
      bullets: string;
      narative: string;
      image_url?: string;
    };
    user: {
      id: number;
      name: string;
      email: string;
    };
    visibility: 'private' | 'public';
    created_at?: string;
    updated_at?: string;
    domain?: { key: string; label: string };
  };
}

// Subcomponents
function BackToHistory() {
  const t = useTranslations('detail');
  return (
    <Link href={'/history'}>
      <Button variant={'outline'} className="border-primary">
        <ChevronLeft />
        {t('back-to-history')}
      </Button>
    </Link>
  );
}

function TopActions({
  persona,
  fetchPersona,
}: {
  persona: any;
  fetchPersona: (id: string) => void;
}) {
  const t = useTranslations('detail');
  const { user } = useUser();
  const searchParams = useSearchParams();

  const router = useRouter();
  async function copyThisPersona() {
    if (!persona?.id) return;
    const token = getCookie('token');
    try {
      const res = await fetch(`/api/persona/copy/${persona.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        toast.success(t('persona-copied-successfully'));
        router.push('/history');
      }
    } catch (error) {
      toast.error(t('error-copying-persona'), {
        description: (error as any)?.message || t('please-try-again-later'),
      });
    }
  }
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
      <Button
        variant={'ghost'}
        size={'sm'}
        className="md:size-default text-green-500"
      >
        <Wifi className="size-4 md:size-5" />
        <span className="hidden sm:inline">{t('online')}</span>
      </Button>
      {user && persona.user.id === user.id && (
        <>
          {!searchParams.get('free_edit') ? (
            <Link href={`?free_edit=true`}>
              <Button
                variant={'outline'}
                size={'sm'}
                className="md:size-default border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Edit className="size-4 md:size-5" />
                <span className="hidden sm:inline">{t('edit-result')}</span>
              </Button>
            </Link>
          ) : (
            <>
              <Button
                size={'sm'}
                onClick={() => router.push(`?free_edit=true&save_edit=true`)}
              >
                <Save className="size-4 md:size-5" />
                <span className="hidden sm:inline">{t('save')}</span>
              </Button>
              <Button
                size={'sm'}
                variant={'outline'}
                onClick={() => {
                  router.push(`/detail/${persona.id}`);
                  fetchPersona(persona.id);
                }}
              >
                <Eye className="size-4 md:size-5" />
                <span className="hidden sm:inline">{t('view-mode')}</span>
              </Button>
            </>
          )}
          {!searchParams.get('free_edit') && (
            <>
              <Link href={`/edit/${persona.id}`}>
                <Button size={'sm'} className="md:size-default">
                  <Recycle className="size-4 md:size-5" />
                  <span className="hidden sm:inline">{t('regenerate')}</span>
                </Button>
              </Link>

              <DeleteConfirmationDialog personaId={persona.id} />
            </>
          )}
        </>
      )}
      {user && persona.user.id !== user.id && (
        <Button
          size={'sm'}
          className="md:size-default"
          onClick={copyThisPersona}
        >
          <Copy className="size-4 md:size-5" />
          <span className="hidden sm:inline">{t('copy-this-persona')}</span>
        </Button>
      )}
    </div>
  );
}

function AuthorCard({ user }: { user: { name: string; email: string } }) {
  const t = useTranslations('detail');
  return (
    <Card className="w-full gap-2 border-foreground py-3 md:py-4">
      <CardHeader className="px-3 md:px-4">
        <CardTitle className="text-xl text-primary md:text-2xl">
          {t('author')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-4">
        <div>
          <div>
            <h3 className="mb-2 text-sm font-medium md:text-base">
              {t('name')}
            </h3>
            <p className="text-sm md:text-base">{user.name}</p>
          </div>
          <div className="mt-3 md:mt-4">
            <h3 className="mb-2 text-sm font-medium md:text-base">
              {t('email')}
            </h3>
            <p className="text-sm md:text-base">{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickInfoCard({
  createdAt,
  updatedAt,
}: {
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const t = useTranslations('detail');
  const created = createdAt
    ? new Date(createdAt).toLocaleString('EN-en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';
  const updated = updatedAt
    ? new Date(updatedAt).toLocaleString('EN-en', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '-';
  return (
    <Card className="w-full gap-2 border-foreground py-3 md:py-4">
      <CardHeader className="px-3 md:px-4">
        <CardTitle className="text-xl text-primary md:text-2xl">
          {t('quick-info')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 md:px-4">
        <div className="mb-3 md:mb-4">
          <h3 className="mb-2 text-sm font-medium md:text-base">
            {t('created')}
          </h3>
          <p className="text-sm md:text-base">{created}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium md:text-base">
            {t('updated')}
          </h3>
          <p className="text-sm md:text-base">{updated}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SharePersonaCard({
  persona,
  _visibility,
}: {
  persona?: any;
  _visibility?: 'private' | 'public';
}) {
  const t = useTranslations('detail');
  const token = getCookie('token');
  const [visibility, setVisibility] = useState<'private' | 'public'>(
    _visibility || 'private',
  );

  async function toggleVisibility(newVisibility: boolean) {
    if (!persona?.id) return;
    try {
      const res = await fetch(`/api/persona/${persona?.id}/visibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          visibility: newVisibility ? 'public' : 'private',
        }),
      });
      if (res.ok) {
        setVisibility(newVisibility ? 'public' : 'private');
      }
    } catch (error) {
      toast.error(t('error-updating-visibility'), {
        description: (error as any)?.message || t('please-try-again-later'),
      });
    }
  }

  return (
    <Card className="w-full border-foreground py-3 md:py-4">
      <CardHeader className="px-3 md:px-4">
        <CardTitle className="text-xl text-primary md:text-2xl">
          {t('share-persona')}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t('share-persona-desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 md:px-4">
        <Label
          htmlFor="visibility"
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <LockKeyhole className="size-4 text-primary md:size-5" />{' '}
            <span className="text-sm md:text-base">
              {visibility === 'private' ? t('private') : t('public')}
            </span>
          </div>
          <Switch
            id="visibility"
            checked={visibility === 'public'}
            onCheckedChange={(checked) => toggleVisibility(checked)}
          />
        </Label>
      </CardContent>
    </Card>
  );
}

function DownloadPersonaCard({ persona }: { persona?: any }) {
  const t = useTranslations('detail');
  const handleDownloadJSON = () => {
    if (!persona?.id) return;
    const dataStr = JSON.stringify(persona, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persona-${persona.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const htmlToPlainText = (html: string) => {
    if (!html) return '';
    // Fast path: strip empty wrappers
    html = html.trim();
    const container = document.createElement('div');
    container.innerHTML = html;

    const lines: string[] = [];
    let listDepth = 0;

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node.textContent || '').replace(/\s+/g, ' ');
        if (text.trim()) lines.push(text);
        return;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      const pushBlank = () => {
        if (lines.length && lines[lines.length - 1] !== '') lines.push('');
      };

      switch (tag) {
        case 'br':
          lines.push('');
          return;
        case 'p':
          pushBlank();
          el.childNodes.forEach(walk);
          pushBlank();
          return;
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          pushBlank();
          lines.push(el.textContent?.trim() || '');
          pushBlank();
          return;
        case 'ul':
        case 'ol':
          listDepth++;
          pushBlank();
          Array.from(el.children).forEach((li, idx) => {
            if (li.tagName.toLowerCase() !== 'li') return;
            const liBuf: string[] = [];
            li.childNodes.forEach((cn) => {
              if (cn.nodeType === Node.TEXT_NODE) {
                const t = (cn.textContent || '').replace(/\s+/g, ' ').trim();
                if (t) liBuf.push(t);
              } else {
                walk(cn);
                // Nested list items appended directly to lines; capture spillover
              }
            });
            const prefix = tag === 'ul' ? '-' : `${idx + 1}.`;
            const indent = '  '.repeat(listDepth - 1);
            const line = `${indent}${prefix} ${liBuf.join(' ')}`.trim();
            if (line) lines.push(line);
          });
          pushBlank();
          listDepth--;
          return;
        case 'li': // In case stray li outside list
          lines.push(`- ${(el.textContent || '').trim()}`);
          return;
        default:
          el.childNodes.forEach(walk);
      }
    };

    container.childNodes.forEach(walk);

    // Merge and normalize
    let text = lines
      .join('\n')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    // Decode basic entities
    const entityDiv = document.createElement('div');
    entityDiv.innerHTML = text;
    text = entityDiv.textContent || text;

    // Final trim of each line
    text = text
      .split('\n')
      .map((l) => l.trimEnd())
      .join('\n')
      .trim();

    return text;
  };
  const addSection = (
    doc: any,
    title: string,
    content: string,
    startY: number,
  ) => {
    let y = startY;
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(title, 40, y);
    y += 18;
    doc.setFontSize(11);
    doc.setTextColor(60);
    const lines: string[] = doc.splitTextToSize(content, 515);
    lines.forEach((line: string) => {
      if (y > 780) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, 40, y);
      y += 14;
    });
    return y + 10;
  };
  const handleDownloadPDF = async () => {
    if (!persona?.id) return;
    // dynamic import (ensure: npm i jspdf)
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 60;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(25);
    doc.text(persona.result.full_name || 'Persona', 40, y);
    y += 26;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(80);
    if (persona.result.quote) {
      const quote = `"${persona.result.quote}"`;
      const quoteLines = doc.splitTextToSize(quote, 515);
      quoteLines.forEach((line: string) => {
        doc.text(line, 40, y);
        y += 16;
      });
      y += 4;
    }
    const metaLines = [
      `Domain: ${persona.domain?.label || '-'}`,
      `Author: ${persona.user?.name || '-'} (${persona.user?.email || '-'})`,
      `Visibility: ${persona.visibility}`,
      `Created: ${persona?.created_at ? new Date(persona.created_at) : '-'}`,
      `Updated: ${persona?.updated_at ? new Date(persona.updated_at) : '-'}`,
    ];
    metaLines.forEach((line) => {
      doc.text(line, 40, y);
      y += 14;
    });
    y += 10;
    y = addSection(
      doc,
      t('mixed-structure'),
      htmlToPlainText(persona.result.mixed),
      y,
    );
    y = addSection(
      doc,
      t('bullets-structure'),
      htmlToPlainText(persona.result.bullets),
      y,
    );
    y = addSection(
      doc,
      t('narrative-structure'),
      htmlToPlainText(persona.result.narative),
      y,
    );
    doc.save(`persona-${persona.id}.pdf`);
  };
  return (
    <Card className="w-full border-foreground py-3 md:py-4">
      <CardHeader className="px-3 md:px-4">
        <CardTitle className="text-xl text-primary md:text-2xl">
          {t('download-persona')}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t('download-persona-desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-3 md:px-4">
        <Item
          size="sm"
          variant="outline"
          className="cursor-pointer border-foreground"
          onClick={handleDownloadPDF}
          role="button"
          tabIndex={0}
        >
          <ItemMedia>
            <FileText className="size-4 text-primary md:size-5" />
          </ItemMedia>
          <ItemContent className="text-sm md:text-base">
            {t('download-as-pdf-full')}
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Item>
        <Item
          size="sm"
          variant="outline"
          className="cursor-pointer border-foreground"
          onClick={handleDownloadJSON}
          role="button"
          tabIndex={0}
        >
          <ItemMedia>
            <FileJson className="size-4 text-primary md:size-5" />
          </ItemMedia>
          <ItemContent className="text-sm md:text-base">
            {t('download-as-json-raw')}
          </ItemContent>
          <ItemActions>
            <ChevronRight className="size-4" />
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}

function PersonaDetailSkeleton() {
  return (
    <section className="px-2 py-3 md:px-4 md:py-4">
      <div className="container mx-auto">
        <div className="flex flex-row items-center justify-between gap-3">
          <Skeleton className="h-9 w-32 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded" />
            <Skeleton className="h-9 w-20 rounded" />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:mt-4 md:gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="col-span-full space-y-3 md:space-y-4 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="col-span-full space-y-3 md:space-y-4 lg:col-span-1">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function PersonaDetail({ personaId }: { personaId: string }) {
  const t = useTranslations('detail');
  const { user } = useUser();
  const _cookies = getCookie('token');
  const [persona, setPersona] = useState<PersonaAPIResponse['data'] | null>(
    null,
  );

  async function fetchPersona(id: string) {
    try {
      const res = await fetch(`/api/persona/${id}`, {
        headers: {
          Authorization: `Bearer ${_cookies}`,
        },
      });
      const data: PersonaAPIResponse = await res.json();
      if (data.status && data.data) {
        setPersona(data.data);
      }
    } catch (error) {
      toast.error(t('error-fetching-persona'), {
        description: (error as any)?.message || t('please-try-again-later'),
      });
    }
  }

  useEffect(() => {
    fetchPersona(personaId);
  }, []);

  if (!persona) {
    return <PersonaDetailSkeleton />;
  }

  return (
    <section className="px-2 py-3 md:px-4 md:py-4">
      <div className="container mx-auto">
        <div className="flex flex-row items-center justify-between gap-3">
          <BackToHistory />
          <TopActions persona={persona} fetchPersona={fetchPersona} />
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 md:mt-4 md:gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Left: Persona content */}
          <div
            id="persona-print-root"
            className="col-span-full space-y-3 md:space-y-4 lg:col-span-2"
          >
            <Persona persona={persona} />
          </div>
          {/* Right: Sidebar */}
          <div className="col-span-full space-y-3 md:space-y-4 lg:col-span-1">
            <AuthorCard user={persona.user} />
            <QuickInfoCard
              createdAt={
                persona?.created_at ? new Date(persona.created_at) : undefined
              }
              updatedAt={
                persona?.updated_at ? new Date(persona.updated_at) : undefined
              }
            />
            {user && persona.user.id === user.id && (
              <SharePersonaCard
                persona={persona}
                _visibility={persona.visibility}
              />
            )}
            <DownloadPersonaCard persona={persona} />
          </div>
        </div>
      </div>
    </section>
  );
}

function DeleteConfirmationDialog({ personaId }: { personaId?: string }) {
  const t = useTranslations('detail');
  const router = useRouter();
  async function deletePersona() {
    if (!personaId) return;
    const _cookies = getCookie('token');
    try {
      const res = await fetch(`/api/persona/${personaId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${_cookies}`,
        },
      });
      if (res.ok) {
        router.push('/history');
      }
    } catch (error) {
      toast.error(t('error-deleting-persona'), {
        description: (error as any)?.message || t('please-try-again-later'),
      });
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} size={'sm'} className="md:size-default">
          <Trash className="size-4 md:size-5" />
          <span className="hidden sm:inline">{t('delete')}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base md:text-lg">
            {t('delete-confirmation-title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm md:text-base">
            {t('delete-confirmation-desc')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={deletePersona}>
            {t('continue')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
