import Design from '@/components/edit/construct';
import Hero from '@/components/edit/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <Design />
      <EndCTA />
      <Footer />
    </>
  );
}
