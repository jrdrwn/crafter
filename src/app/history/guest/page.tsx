import Hero from '@/components/history/guest/hero';
import PersonaItems from '@/components/history/guest/persona-items';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <PersonaItems />
      <EndCTA />
      <Footer />
    </>
  );
}
