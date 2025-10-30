import PersonaDetail from '@/components/detail/persona-detail';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <>
      <Header />
      <PersonaDetail personaId={id} />
      <EndCTA />
      <Footer />
    </>
  );
}
