import Contrib from '@/components/knowledge-base/contrib';
import ContribList from '@/components/knowledge-base/contrib-list';
import Hero from '@/components/knowledge-base/hero';
import EndCTA from '@/components/shared/end-cta';
import Footer from '@/components/shared/footer';
import Header from '@/components/shared/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Page() {
  return (
    <>
      <Header />
      <Hero />
      <section className="container mx-auto mt-2 max-w-4xl px-2">
        <Tabs defaultValue="add" className="">
          <TabsList className="mx-auto flex justify-around">
            <TabsTrigger value="add" className="flex-1">
              Add
            </TabsTrigger>
            <TabsTrigger value="list" className="flex-1">
              List
            </TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <Contrib />
          </TabsContent>
          <TabsContent value="list">
            <ContribList />
          </TabsContent>
        </Tabs>
      </section>
      <EndCTA />
      <Footer />
    </>
  );
}
