'use client';

import {
  ChevronLeft,
  ChevronRight,
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
} from '../../ui/alert-dialog';
import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Item, ItemActions, ItemContent, ItemMedia } from '../../ui/item';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import Persona, { PersonaResponse } from './persona';

// Types
type StoredPersona = {
  response?: PersonaResponse;
  created_at?: string | number | Date;
  updated_at?: string | number | Date;
};

// Subcomponents
function BackToHistory() {
  return (
    <Link href={'/history/guest'}>
      <Button variant={'outline'} className="border-primary">
        <ChevronLeft />
        Back to history
      </Button>
    </Link>
  );
}

function TopActions({ refresh }: { refresh: () => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant={'ghost'} className="text-green-500">
        <Wifi />
        Online
      </Button>
      {!searchParams.get('free_edit') ? (
        <>
          <Link href={`?free_edit=true`}>
            <Button
              variant={'outline'}
              className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
            >
              <Edit />
              Edit Result
            </Button>
          </Link>
          <Link href={'/edit/guest'}>
            <Button>
              <Recycle />
              Regenerate
            </Button>
          </Link>
          <DeleteConfirmationDialog />
        </>
      ) : (
        <>
          <Button onClick={() => router.push(`?free_edit=true&save_edit=true`)}>
            <Save />
            Save
          </Button>
          <Button
            onClick={() => {
              router.push(`/detail/guest`);
              // ensure state reloads from localStorage
              setTimeout(() => refresh(), 0);
              toast.success('Saved');
            }}
          >
            <Eye />
            View Mode
          </Button>
        </>
      )}
    </div>
  );
}

function QuickInfoCard({
  createdAt,
  updatedAt,
}: {
  createdAt?: Date;
  updatedAt?: Date;
}) {
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
    <Card className="w-full gap-2 border-foreground py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-2xl text-primary">Quick Info</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div className="mb-4">
          <h3 className="mb-2 font-medium">Created</h3>
          <p>{created}</p>
        </div>
        <div>
          <h3 className="mb-2 font-medium">Updated</h3>
          <p>{updated}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SharePersonaCard() {
  return (
    <Card className="relative w-full py-4">
      <div className="absolute inset-0 z-1 flex items-center justify-center rounded-2xl backdrop-blur-xs">
        <p className="p-4 text-center text-sm">
          You need to log in to access all Share Persona features.
        </p>
      </div>
      <CardHeader className="px-4">
        <CardTitle className="text-2xl text-primary">Share Persona</CardTitle>
        <CardDescription>Make this persona publicly accessible</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <Label htmlFor="private" className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LockKeyhole className="text-primary" /> Private
          </div>
          <Switch id="private" />
        </Label>
      </CardContent>
    </Card>
  );
}

function DownloadPersonaCard() {
  return (
    <Card className="relative w-full py-4">
      <div className="absolute inset-0 z-1 flex items-center justify-center rounded-2xl backdrop-blur-xs">
        <p className="p-4 text-center text-sm">
          You need to log in to access all Share Persona features.
        </p>
      </div>
      <CardHeader className="px-4">
        <CardTitle className="text-2xl text-primary">
          Download Persona
        </CardTitle>
        <CardDescription>Save persona in multiple formats</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 px-4">
        <Item
          size={'sm'}
          variant={'outline'}
          className="border-foreground"
          asChild
        >
          <Link href={'#'}>
            <ItemMedia>
              <FileText className="text-primary" />
            </ItemMedia>
            <ItemContent>Download as PDF</ItemContent>
            <ItemActions>
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>
        <Item
          size={'sm'}
          variant={'outline'}
          className="border-foreground"
          asChild
        >
          <Link href={'#'}>
            <ItemMedia>
              <FileJson className="text-primary" />
            </ItemMedia>
            <ItemContent>Download as JSON</ItemContent>
            <ItemActions>
              <ChevronRight className="size-4" />
            </ItemActions>
          </Link>
        </Item>
      </CardContent>
    </Card>
  );
}

export default function PersonaDetail() {
  const [persona, setPersona] = useState<StoredPersona | null>(null);
  const searchParams = useSearchParams();
  function refreshFromStorage() {
    const STORAGE_KEY = 'crafter:personas';
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || 'null',
    ) as StoredPersona | null;
    setPersona(data ?? null);
  }
  useEffect(() => {
    refreshFromStorage();
  }, []);
  useEffect(() => {
    // When exiting free edit, reload data
    if (!searchParams.get('free_edit')) {
      refreshFromStorage();
    }
  }, [searchParams]);
  return (
    <section className="px-4 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <BackToHistory />
          <TopActions refresh={refreshFromStorage} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-8">
          {persona && <Persona markdown={persona?.response} />}
          <div className="col-span-1 space-y-4">
            <QuickInfoCard
              createdAt={
                persona?.created_at ? new Date(persona.created_at) : undefined
              }
              updatedAt={
                persona?.updated_at ? new Date(persona.updated_at) : undefined
              }
            />
            <SharePersonaCard />
            <DownloadPersonaCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function DeleteConfirmationDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>
          <Trash />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            persona and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              window.location.href = '/create';
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
