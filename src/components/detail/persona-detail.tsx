/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

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
  return (
    <Link href={'/history'}>
      <Button variant={'outline'} className="border-primary">
        <ChevronLeft />
        Back to history
      </Button>
    </Link>
  );
}

function TopActions({
  persona,
  profile,
  fetchPersona,
}: {
  persona: any;
  profile?: any;
  fetchPersona: (id: string) => void;
}) {
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
        toast.success('Persona copied successfully!');
        router.push('/history');
      }
    } catch (error) {
      console.error('Error copying persona:', error);
    }
  }
  return (
    <div className="flex items-center justify-center gap-4">
      <Button variant={'ghost'} className="text-green-500">
        <Wifi />
        Online
      </Button>
      {profile && persona.user.id === profile.id && (
        <>
          {!searchParams.get('free_edit') ? (
            <Link href={`?free_edit=true`}>
              <Button
                variant={'outline'}
                className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
              >
                <Edit />
                Edit Result
              </Button>
            </Link>
          ) : (
            <>
              <Button
                onClick={() => router.push(`?free_edit=true&save_edit=true`)}
              >
                <Save />
                Save
              </Button>
              <Button
                onClick={() => {
                  router.push(`/detail/${persona.id}`);
                  fetchPersona(persona.id);
                }}
              >
                <Eye />
                View Mode
              </Button>
            </>
          )}
          {!searchParams.get('free_edit') && (
            <>
              <Link href={`/edit/${persona.id}`}>
                <Button>
                  <Recycle />
                  Regenerate
                </Button>
              </Link>

              <DeleteConfirmationDialog personaId={persona.id} />
            </>
          )}
        </>
      )}
      {profile && persona.user.id !== profile.id && (
        <Button onClick={copyThisPersona}>
          <Copy />
          Copy this Persona
        </Button>
      )}
    </div>
  );
}

function AuthorCard({ user }: { user: { name: string; email: string } }) {
  return (
    <Card className="w-full gap-2 border-foreground py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-2xl text-primary">Author</CardTitle>
      </CardHeader>
      <CardContent className="px-4">
        <div>
          <div>
            <h3 className="mb-2 font-medium">Name</h3>
            <p>{user.name}</p>
          </div>
          <div className="mt-4">
            <h3 className="mb-2 font-medium">Email</h3>
            <p>{user.email}</p>
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

function SharePersonaCard({
  persona,
  _visibility,
}: {
  persona?: any;
  _visibility?: 'private' | 'public';
}) {
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
      console.error('Error updating visibility:', error);
    }
  }

  return (
    <Card className="w-full border-foreground py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-2xl text-primary">Share Persona</CardTitle>
        <CardDescription>Make this persona publicly accessible</CardDescription>
      </CardHeader>
      <CardContent className="px-4">
        <Label
          htmlFor="visibility"
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <LockKeyhole className="text-primary" />{' '}
            {visibility === 'private' ? 'Private' : 'Public'}
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

function DownloadPersonaCard() {
  return (
    <Card className="w-full border-foreground py-4">
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

interface Profile {
  id: number;
  name: string;
  email: string;
}

export default function PersonaDetail({ personaId }: { personaId: string }) {
  const [profile, setProfile] = useState<Profile>();
  const _cookies = getCookie('token');
  const [persona, setPersona] = useState<PersonaAPIResponse['data'] | null>(
    null,
  );

  async function fetchProfile() {
    const res = await fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${_cookies}`,
      },
    });
    const data = await res.json();
    setProfile(data.data);
  }

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
      console.error('Error fetching persona:', error);
    }
  }

  useEffect(() => {
    fetchPersona(personaId);
    fetchProfile();
  }, []);

  if (!persona) {
    return null;
  }

  return (
    <section className="px-4 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <BackToHistory />
          <TopActions
            persona={persona}
            profile={profile}
            fetchPersona={fetchPersona}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-8">
          {/* Left: Persona content */}
          <div className="col-span-2 space-y-4">
            <Persona persona={persona} />
          </div>
          {/* Right: Sidebar */}
          <div className="col-span-1 space-y-4">
            <AuthorCard user={persona.user} />
            <QuickInfoCard
              createdAt={
                persona?.created_at ? new Date(persona.created_at) : undefined
              }
              updatedAt={
                persona?.updated_at ? new Date(persona.updated_at) : undefined
              }
            />
            {profile && persona.user.id === profile.id && (
              <SharePersonaCard
                persona={persona}
                _visibility={persona.visibility}
              />
            )}
            <DownloadPersonaCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function DeleteConfirmationDialog({ personaId }: { personaId?: string }) {
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
      console.error('Error deleting persona:', error);
    }
  }
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
          <AlertDialogAction onClick={deletePersona}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
