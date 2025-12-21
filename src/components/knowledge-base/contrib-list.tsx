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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
  // offset state removed, use page only
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const pageSize = 5;
  const [fetching, setFetching] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [openEdit, setOpenEdit] = useState(false);

  const token = getCookie('token') as string | undefined;
  const inflightRef = useRef(false);

  const canFetch = !!user && !!token;

  const load = useCallback(
    async (pageNum: number = 1) => {
      if (!canFetch || inflightRef.current) return;
      inflightRef.current = true;
      setFetching(true);
      try {
        const url = new URL('/api/rag/contributions', window.location.origin);
        const useOffset = (pageNum - 1) * pageSize;
        url.searchParams.set('limit', String(pageSize));
        url.searchParams.set('offset', String(useOffset));
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load data');
        const json = (await res.json()) as {
          status: boolean;
          items: ContributionItem[];
          nextOffset: number | null;
          total?: number;
        };
        setItems(json.items || []);
        setPage(pageNum);
        setTotal(json.total ?? 0);
      } catch (e) {
        toast.error('Failed to load', {
          description: e instanceof Error ? e.message : String(e),
        });
      } finally {
        inflightRef.current = false;
        setFetching(false);
      }
    },
    [canFetch, token],
  );

  useEffect(() => {
    if (!canFetch) return;
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch, page]);

  function openEditDialog(id: number) {
    setEditId(id);
    setOpenEdit(true);
  }

  async function onDeleted(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function onSaved() {
    await load(1);
  }

  if (!loading && !user) {
    return (
      <section className="container mx-auto max-w-4xl px-4 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
            <CardDescription>
              Sign in to view and manage your contributions.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-4xl pb-4">
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle className="text-lg sm:text-xl">
              Your Contributions
            </CardTitle>
            <CardDescription className="text-sm">
              Manage surveys, interviews, reviews, and documents you have added.
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => load(1)}
            disabled={fetching}
            className="w-full sm:w-auto"
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
          <ul className="space-y-3">
            {fetching && items.length === 0 ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <li key={idx} className="rounded-md border p-3">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                        <span className="size-3 rounded bg-muted" /> Skeleton
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                        <span className="size-3 rounded bg-muted" /> Skeleton
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                        <span className="size-3 rounded bg-muted" /> Skeleton
                      </span>
                      <Badge variant="outline">Skeleton</Badge>
                      <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] sm:text-xs">
                        <span className="size-3 rounded bg-muted" /> Skeleton
                      </span>
                    </div>
                    <div className="flex flex-1 items-stretch gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className="flex-1 opacity-50"
                      >
                        Skeleton
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled
                        className="flex-1 opacity-50"
                      >
                        Skeleton
                      </Button>
                    </div>
                  </div>
                </li>
              ))
            ) : items.length === 0 ? (
              <li className="text-sm text-muted-foreground">
                No contributions yet.
              </li>
            ) : (
              items.map((it) => {
                const meta =
                  it.metadata && typeof it.metadata === 'object'
                    ? (it.metadata as Record<string, unknown>)
                    : null;
                const visibility =
                  (meta?.visibility as 'public' | 'private' | undefined) ??
                  'private';
                return (
                  <li key={it.id} className="rounded-md border p-3">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                          <FileText className="size-3" /> {it.type}
                        </span>
                        {it.domain_key && (
                          <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                            <Globe className="size-3" />{' '}
                            <span className="max-w-[100px] truncate">
                              {it.domain_key}
                            </span>
                          </span>
                        )}
                        {it.language_key && (
                          <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5">
                            <Languages className="size-3" /> {it.language_key}
                          </span>
                        )}
                        <Badge
                          variant={
                            visibility === 'public' ? 'secondary' : 'outline'
                          }
                        >
                          {visibility === 'public' ? 'Public' : 'Private'}
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] sm:text-xs">
                          <CalendarClock className="size-3 shrink-0" />
                          <span className="hidden sm:inline">
                            {new Date(it.created_at).toLocaleString()}
                          </span>
                          <span className="sm:hidden">
                            {new Date(it.created_at).toLocaleDateString()}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-1 items-stretch gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(it.id)}
                          className="flex-1"
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
                );
              })
            )}
          </ul>
          {/* Pagination controls - always show */}
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (page > 1) load(page - 1);
                    }}
                    aria-disabled={page === 1}
                    style={
                      page === 1 ? { pointerEvents: 'none', opacity: 0.5 } : {}
                    }
                  />
                </PaginationItem>
                {Array.from({
                  length: Math.max(1, Math.ceil(total / pageSize)),
                }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      href="#"
                      isActive={page === idx + 1}
                      onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        load(idx + 1);
                      }}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (page < Math.max(1, Math.ceil(total / pageSize)))
                        load(page + 1);
                    }}
                    aria-disabled={
                      page === Math.max(1, Math.ceil(total / pageSize))
                    }
                    style={
                      page === Math.max(1, Math.ceil(total / pageSize))
                        ? { pointerEvents: 'none', opacity: 0.5 }
                        : {}
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      onDeleted(id);
      setOpen(false);
    } catch (e) {
      toast.error('Failed', {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="flex-1">
          <Trash2 className="mr-2 size-4" /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete contribution?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            This will permanently delete the document and all related
            embeddings. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
