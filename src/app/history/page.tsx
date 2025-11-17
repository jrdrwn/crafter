import Hero from '@/components/history/hero';
import PersonaItems from '@/components/history/persona-items';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Suspense } from 'react';

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
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
        <PersonaItems />
      </Suspense>
      <EndCTA />
      <Footer />
    </>
  );
}
