/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { getCookie } from 'cookies-next/client';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { PersonaCard } from '../shared/persona-card';
import { PersonasToolbar } from '../shared/personas-toolbar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';
import { Skeleton } from '../ui/skeleton';

export default function PersonaItems() {
  const token = getCookie('token');
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // init from URL
  const initialOrderParam = (searchParams.get('order') || 'recent') as
    | 'recent'
    | 'updated'
    | 'alphabetical';
  const initialPage = Number(searchParams.get('page') || 1);
  const initialSearch = searchParams.get('search') ?? '';
  const initialDomain = searchParams.get('domain') ?? undefined;

  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [domain, setDomain] = useState<string | undefined>(initialDomain);
  const [order, setOrder] = useState<'recent' | 'updated' | 'alphabetical'>(
    initialOrderParam === 'updated' || initialOrderParam === 'alphabetical'
      ? initialOrderParam
      : 'recent',
  );

  // pagination state
  const [page, setPage] = useState(Math.max(1, initialPage));
  const pageSize = 9;
  const [total, setTotal] = useState(0);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  async function fetchPersonas() {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('page', String(page));
      qs.set('pageSize', String(pageSize));
      if (debouncedSearch) qs.set('search', debouncedSearch);
      if (domain) qs.set('domain', domain);
      if (order) qs.set('order', order);

      const res = await fetch(`/api/persona/me?${qs.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setPersonas(data.data || []);
      setTotal(data.total || 0);
    } catch (_e) {
      setError('Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPersonas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, domain, order]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, domain, order]);

  // persist filters to URL
  useEffect(() => {
    const qs = new URLSearchParams();
    if (debouncedSearch) qs.set('search', debouncedSearch);
    if (domain) qs.set('domain', domain);
    if (order && order !== 'recent') qs.set('order', order);
    if (page > 1) qs.set('page', String(page));

    const query = qs.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, page, debouncedSearch, domain, order]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total],
  );

  function gotoPage(p: number) {
    setPage(Math.max(1, Math.min(p, totalPages)));
  }

  function getPages(): (number | 'ellipsis')[] {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) pages.push('ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
    return pages;
  }

  const SkeletonCard = () => (
    <Card className="h-full w-full gap-4 py-4">
      <CardContent className="px-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="p-4 py-8">
      <div className="container mx-auto">
        <Card className="w-full border-primary py-4">
          <CardContent className="px-4">
            <PersonasToolbar
              searchValue={searchInput}
              onSearchChangeAction={setSearchInput}
              domainValue={domain}
              onDomainChangeAction={setDomain}
              orderValue={order}
              onOrderChangeAction={setOrder}
            />
          </CardContent>
        </Card>

        {error && !loading && (
          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={() => fetchPersonas()}>
              Refresh
            </Button>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: pageSize }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}

          {!loading && !error && personas.length === 0 && (
            <p className="col-span-3 text-center text-muted-foreground">
              No personas found.
            </p>
          )}
          {!loading &&
            !error &&
            personas.length > 0 &&
            personas.map((persona: any) => (
              <Link key={persona.id} href={`/detail/${persona.id}`}>
                <PersonaCard
                  quoteClamp={2}
                  name={persona.result.full_name}
                  subtitle={''}
                  quote={persona.result.quote}
                  tag={persona.domain.label}
                  date={new Date(persona.created_at).toLocaleDateString(
                    'id-ID',
                    {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
                  createdByMe={true}
                />
              </Link>
            ))}
        </div>

        {!error && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    gotoPage(page - 1);
                  }}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {getPages().map((p, idx) => (
                <PaginationItem key={`${p}-${idx}`}>
                  {p === 'ellipsis' ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      href="#"
                      isActive={p === page}
                      onClick={(e) => {
                        e.preventDefault();
                        gotoPage(p as number);
                      }}
                    >
                      {p}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    gotoPage(page + 1);
                  }}
                  className={
                    page === totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </section>
  );
}
