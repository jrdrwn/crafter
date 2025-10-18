import LoginForm from '@/components/login/login-form';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';

export default function Page() {
  return (
    <>
      <Header />
      <LoginForm />
      <EndCTA />
      <Footer />
    </>
  );
}
