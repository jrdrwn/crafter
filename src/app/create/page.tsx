import Design from '@/components/create/construct';
import Hero from '@/components/create/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default async function Page() {
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
