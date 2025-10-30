import Design from '@/components/edit/construct';
import Hero from '@/components/edit/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { cookies } from 'next/headers';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const _cookies = await cookies();
  const { id } = await params;
  const personaRes = await fetch(`${process.env.APP_URL}/api/persona/${id}`, {
    headers: {
      Authorization: `Bearer ${_cookies.get('token')?.value}`,
    },
  });

  const persona = await personaRes.json();
  return (
    <>
      <Header />
      <Hero />
      <Design persona={persona.data} personaId={id} />
      <EndCTA />
      <Footer />
    </>
  );
}
