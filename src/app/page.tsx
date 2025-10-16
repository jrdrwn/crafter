import FeatureRevolutionize from '@/components/home/feature-revolutionize';
import FeatureWhy from '@/components/home/feature-why';
import Hero from '@/components/home/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';

import Header from '../components/shared/header';

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <FeatureWhy />
      <FeatureRevolutionize />
      <EndCTA />
      <Footer />
    </>
  );
}
