'use client';

import { PersonaCard } from '../shared/persona-card';
import { PersonasToolbar } from '../shared/personas-toolbar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';

export default function PersonaItems() {
  return (
    <section className="p-4 py-8">
      <div className="container mx-auto">
        <Card className="w-full border-primary py-4">
          <CardContent className="px-4">
            <PersonasToolbar />
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Viewing 5 out of 5 personas
          </p>
          <div className="flex items-center gap-2">
            <Switch id="show-my-persona" />
            <Label
              htmlFor="show-my-persona"
              className="text-sm text-muted-foreground"
            >
              Show My Personas Only
            </Label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Demo items replaced with reusable PersonaCard */}
          {Array.from({ length: 7 }).map((_, idx) => (
            <PersonaCard
              key={idx}
              name="Ahmad Rizky"
              subtitle="Product Manager, 28 tahun"
              quote="Saya butuh solusi yang efisien untuk mengautomasi proses bisnis tanpa mengorbankan kualitas."
              tag="Software Engineer"
              date="21 Agustus 2025"
              createdByMe
            />
          ))}
        </div>
        <Button className="mx-auto mt-8 block border-primary">
          Load More Personas
        </Button>
      </div>
    </section>
  );
}
