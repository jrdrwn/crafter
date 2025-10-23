'use client';

import Design from '@/components/edit/guest/construct';
import Hero from '@/components/edit/guest/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { useEffect, useState } from 'react';

export default function Page() {
  const [persona, setPersona] = useState<any>(null);
  useEffect(() => {
    const STORAGE_KEY = 'crafter:personas';
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    setPersona(data);
  }, []);
  return (
    <>
      <Header />
      <Hero />
      {persona && <Design persona={persona} />}
      <EndCTA />
      <Footer />
    </>
  );
}
