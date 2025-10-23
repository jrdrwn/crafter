import Hero from '@/components/explore/hero';
import PersonaItems from '@/components/explore/persona-items';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default function Page() {
  return (
    <>
      <Header />
      <div className="relative">
        <div className="absolute inset-0 z-2 flex items-center justify-center rounded-2xl backdrop-blur-xs">
          <p className="p-4 text-center text-lg">
            You need to log in to access all Share Persona features.
          </p>
        </div>
        <Hero />
        <PersonaItems />
      </div>
      <EndCTA />
      <Footer />
    </>
  );
}
