'use client';

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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/user-context';
import { getCookie } from 'cookies-next/client';
import {
  CalendarClock,
  FileText,
  Globe,
  Languages,
  Loader2,
  Pencil,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { ContribEditDialog } from './contrib-edit-dialog';

export type ContributionItem = {
  id: number;
  type: 'survey' | 'interview' | 'review' | 'doc';
  domain_key: string | null;
  language_key: 'en' | 'id' | null;
  source: string | null;
  metadata: unknown;
  created_at: string;
};

export default function ContribList() {
  const { user, loading } = useUser();
  const [items, setItems] = useState<ContributionItem[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [fetching, setFetching] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const token = getCookie('token') as string | undefined;
  const inflightRef = useRef(false);

  const canFetch = !!user && !!token;

  const load = useCallback(
    async (
      mode: 'refresh' | 'more' = 'refresh',
      explicitCursor?: number | null,
    ) => {
      if (!canFetch || inflightRef.current) return;
      inflightRef.current = true;
      setFetching(true);
      try {
        const url = new URL('/api/rag/contributions', window.location.origin);
        if (mode === 'more') {
          const cur = explicitCursor ?? cursor;
          if (cur) url.searchParams.set('cursor', String(cur));
        }
        url.searchParams.set('limit', '20');
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Gagal memuat data');
        const json = (await res.json()) as {
          status: boolean;
          items: ContributionItem[];
          nextCursor: number | null;
        };
        setItems((prev) =>
          mode === 'more' ? [...prev, ...(json.items || [])] : json.items || [],
        );
        setCursor(json.nextCursor ?? null);
      } catch (e) {
        toast.error('Gagal memuat', {
          description: e instanceof Error ? e.message : String(e),
        });
      } finally {
        inflightRef.current = false;
        setFetching(false);
      }
    },
    [canFetch, cursor, token],
  );

  useEffect(() => {
    if (!canFetch) return;
    // initial load only when auth ready
    load('refresh');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch]);

  function openEditDialog(id: number) {
    setEditId(id);
    setOpenEdit(true);
  }

  async function onDeleted(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function onSaved() {
    await load('refresh');
  }

  if (!loading && !user) {
    return (
      <section className="container mx-auto max-w-4xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Kontribusi</CardTitle>
            <CardDescription>
              Masuk untuk melihat dan mengelola kontribusi.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-4xl pb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Kontribusi Anda</CardTitle>
            <CardDescription>
              Kelola hasil survey, interview, review, maupun dokumen.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load('refresh')}
            disabled={fetching}
          >
            {fetching ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              Belum ada kontribusi.
            </div>
          ) : (
            <ScrollArea className="max-h-[540px] pr-4">
              <ul className="space-y-3">
                {items.map((it) => (
                  <li key={it.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                            <FileText className="size-3" /> {it.type}
                          </span>
                          {it.domain_key && (
                            <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                              <Globe className="size-3" /> {it.domain_key}
                            </span>
                          )}
                          {it.language_key && (
                            <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                              <Languages className="size-3" /> {it.language_key}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                            <CalendarClock className="size-3" />
                            {new Date(it.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="line-clamp-3 text-sm whitespace-pre-wrap">
                          {typeof it.metadata === 'object' &&
                          it.metadata !== null
                            ? JSON.stringify(it.metadata)
                            : ''}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(it.id)}
                        >
                          <Pencil className="mr-2 size-4" /> Edit
                        </Button>
                        <DeleteButton
                          id={it.id}
                          token={token!}
                          onDeleted={onDeleted}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {cursor ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="ghost"
                    onClick={() => load('more', cursor)}
                    disabled={fetching}
                  >
                    {fetching ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Muat lebih banyak
                  </Button>
                </div>
              ) : null}
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <ContribEditDialog
        id={editId}
        open={openEdit}
        onOpenChangeAction={setOpenEdit}
        onSavedAction={onSaved}
        token={token || ''}
      />
    </section>
  );
}

function DeleteButton({
  id,
  token,
  onDeleted,
}: {
  id: number;
  token: string;
  onDeleted: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/rag/contributions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Gagal menghapus');
      toast.success('Berhasil dihapus');
      onDeleted(id);
      setOpen(false);
    } catch (e) {
      toast.error('Gagal', {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 size-4" /> Hapus
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kontribusi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus dokumen dan seluruh embeddings terkait.
            Tindakan tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
