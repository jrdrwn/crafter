'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessageButtonRetry } from '@/helpers/error-retry';
import { cn } from '@/lib/utils';
import { llm } from '@prisma/client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Bot, CheckIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field, FieldLabel } from '../../ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import type { CreateFormValues } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function LLMConfigCard({ control }: Props) {
  const [loadingLlmModels, setLoadingLlmModels] = useState<boolean>(false);
  const [errorLlmModels, setErrorLlmModels] = useState<string | null>(null);
  const [loadingLanguages, setLoadingLanguages] = useState<boolean>(false);
  const [errorLanguages, setErrorLanguages] = useState<string | null>(null);
  const [languages, setLanguages] = useState<CreateFormValues['language'][]>(
    [],
  );
  const [llmModels, setLlmModels] = useState<llm[]>([]);

  async function fetchLlmModels() {
    setErrorLlmModels(null);
    setLoadingLlmModels(true);
    const response = await fetch('/api/persona/helper/llm');
    setLoadingLlmModels(false);
    if (!response.ok) {
      setErrorLlmModels('Failed to fetch LLM models');
      return;
    }
    const json = await response.json();
    setLlmModels(json.data);
    setErrorLlmModels(null);
  }

  async function fetchLanguages() {
    setErrorLanguages(null);
    setLoadingLanguages(true);
    const response = await fetch('/api/persona/helper/language');
    setLoadingLanguages(false);
    if (!response.ok) {
      setErrorLanguages('Failed to fetch languages');
      return;
    }
    const json = await response.json();
    setLanguages(json.data);
  }

  useEffect(() => {
    fetchLanguages();
    fetchLlmModels();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="col-span-1 w-full border border-primary p-2">
        <CardHeader className="relative p-2">
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Bot size={20} className="text-foreground" />
            LLM Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select the AI model used to generate personas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2">
          {loadingLlmModels && (
            <div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          )}
          {!loadingLlmModels && !errorLlmModels && (
            <Controller
              name="llmModel"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Select
                    name={field.name}
                    value={
                      (field.value.key as string) ?? 'gemini-2.5-flash-lite'
                    }
                    onValueChange={(val) =>
                      field.onChange({
                        key: val,
                        label:
                          llmModels.find((model) => model.key === val)?.label ||
                          val,
                      })
                    }
                  >
                    <SelectTrigger
                      className="w-full border-primary"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select LLM Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {llmModels.map((model) => (
                        <LLMSelectItem
                          key={model.key}
                          value={model.key}
                          className="max-w-109 flex-col items-start"
                        >
                          <p>
                            <SelectPrimitive.ItemText>
                              {model.label}
                            </SelectPrimitive.ItemText>{' '}
                            <span className="text-xs text-muted-foreground">
                              ({model.category})
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {model.description}
                          </p>
                        </LLMSelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          )}
          {errorLlmModels && (
            <ErrorMessageButtonRetry
              message={errorLlmModels}
              onRetry={fetchLlmModels}
              className="mb-1 flex-row items-center justify-center"
            />
          )}
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t border-dashed px-2 pb-1">
          <Controller
            name="useRAG"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center">
                  <Checkbox
                    id={field.name}
                    checked={field.value}
                    aria-invalid={fieldState.invalid}
                    onCheckedChange={(checked) => field.onChange(checked)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Use RAG (Retrieval-Augmented Generation)
                  </span>
                </FieldLabel>
              </Field>
            )}
          />
          {loadingLanguages && (
            <div className="w-42">
              <Skeleton className="h-9 w-32 rounded-md" />
            </div>
          )}
          {!loadingLanguages && !errorLanguages && (
            <Controller
              name="language"
              control={control}
              render={({ field, fieldState }) => {
                return (
                  <Field data-invalid={fieldState.invalid} className="w-42">
                    <Select
                      name={field.name}
                      value={field.value.key}
                      onValueChange={(value) =>
                        field.onChange({
                          key: value,
                          label:
                            languages.find((lang) => lang.key === value)
                              ?.label || value,
                        })
                      }
                    >
                      <SelectTrigger className="w-42 border-primary">
                        <SelectValue
                          placeholder="Select Language"
                          aria-invalid={fieldState.invalid}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((language) => (
                          <SelectItem key={language.key} value={language.key}>
                            {language.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                );
              }}
            />
          )}
          {errorLanguages && (
            <ErrorMessageButtonRetry
              message={errorLanguages}
              onRetry={fetchLanguages}
              className="mb-1 w-full flex-row items-center justify-center"
            />
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function LLMSelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className,
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      {children}
    </SelectPrimitive.Item>
  );
}
