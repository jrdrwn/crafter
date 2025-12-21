import PersonaDetail from '@/components/detail/guest/persona-detail';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

export default async function Page() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="bg-base-200 min-h-[300px]">
            Error,{' '}
            <Button asChild>
              <Link href={'/'}>Back to Home</Link>
            </Button>
          </div>
        }
      >
        <PersonaDetail />
      </Suspense>
      <EndCTA />
      <Footer />
    </>
  );
}
