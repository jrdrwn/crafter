import Hero from '@/components/explore/hero';
import PersonaItems from '@/components/explore/persona-items';
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
