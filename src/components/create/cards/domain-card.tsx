'use client';

import { slugify } from '@/lib/utils';
import { Plus, Target } from 'lucide-react';
import { useRef, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field, FieldLabel } from '../../ui/field';
import { Input } from '../../ui/input';
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { ScrollArea } from '../../ui/scroll-area';
import type { CreateFormValues } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function DomainCard({ control }: Props) {
  const [domains, setDomains] = useState<{ key: string; label: string }[]>([
    { key: 'health', label: 'Health' },
    { key: 'education', label: 'Education' },
    { key: 'software-development', label: 'Software Development' },
    { key: 'e-commerce', label: 'E-commerce' },
    { key: 'banking-fintech', label: 'Banking & Fintech' },
    { key: 'travel-tourism', label: 'Travel & Tourism' },
  ]);
  const [domainQuery, setDomainQuery] = useState('');
  const domainInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="col-span-1 w-full border border-primary p-2">
      <CardHeader className="p-2">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Target size={20} className="text-foreground" />
          Choose Domain
        </CardTitle>
        <CardDescription className="text-gray-400">
          Select the domain or industry for the persona you want to create.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <Controller
          name="domain"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <ScrollArea className="h-40">
                <RadioGroup
                  name={field.name}
                  onValueChange={(value) => {
                    field.onChange({
                      key: value,
                      label: domains.find((d) => d.key === value)?.label || '',
                    });
                  }}
                  aria-invalid={fieldState.invalid}
                  defaultValue={field.value.key}
                >
                  {domains
                    .filter((domain) =>
                      domain.label
                        .toLowerCase()
                        .includes(domainQuery.toLowerCase()),
                    )
                    .map((domain) => (
                      <FieldLabel
                        key={domain.key}
                        htmlFor={domain.key}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem value={domain.key} id={domain.key} />
                        {domain.label}
                      </FieldLabel>
                    ))}
                </RadioGroup>
                {domainQuery &&
                  !domains.some(
                    (d) => d.label.toLowerCase() === domainQuery.toLowerCase(),
                  ) && (
                    <p className="mt-2 text-center text-xs text-gray-500">
                      Add &quot;{domainQuery}&quot; as a new domain if not
                      listed.
                    </p>
                  )}
              </ScrollArea>
            </Field>
          )}
        />
      </CardContent>
      <CardFooter className="border-t border-dashed px-2 pb-2">
        <div className="flex w-full items-center gap-2">
          <Input
            ref={domainInputRef}
            type="search"
            placeholder="Search or add items..."
            className="border-primary"
            onChange={(e) => setDomainQuery(e.target.value)}
          />
          <Button
            type="button"
            disabled={!domainQuery}
            onClick={() => {
              if (
                domainQuery &&
                !domains.some(
                  (d) => d.label.toLowerCase() === domainQuery.toLowerCase(),
                )
              ) {
                setDomains((prev) => [
                  {
                    key: slugify(domainQuery),
                    label: domainQuery,
                  },
                  ...prev,
                ]);
                setDomainQuery('');
                if (domainInputRef.current) {
                  domainInputRef.current.value = '';
                }
              }
            }}
          >
            <Plus />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
