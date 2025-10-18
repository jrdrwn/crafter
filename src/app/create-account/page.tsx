import CreateAccountForm from '@/components/create-account/create-account-form';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default function Page() {
  return (
    <>
      <Header />
      <CreateAccountForm />
      <EndCTA />
      <Footer />
    </>
  );
}
