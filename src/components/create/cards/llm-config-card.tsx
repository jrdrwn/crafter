'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorMessageButtonRetry } from '@/helpers/error-retry';
import { cn } from '@/lib/utils';
import { language, llm } from '@prisma/client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { Bot, Check, CheckIcon, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';

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
import { TCreateForm } from '../construct';

type Props = {
  form: UseFormReturn<TCreateForm>;
};

export default function LLMConfigCard({ form }: Props) {
  const [providerOpen, setProviderOpen] = useState<boolean>(false);
  const [loadingLlmModels, setLoadingLlmModels] = useState<boolean>(false);
  const [errorLlmModels, setErrorLlmModels] = useState<string | null>(null);
  const [providers, setProviders] = useState<{ key: string; label: string; available: boolean }[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('gemini');
  const [loadingLanguages, setLoadingLanguages] = useState<boolean>(false);
  const [errorLanguages, setErrorLanguages] = useState<string | null>(null);
  const [languages, setLanguages] = useState<language[]>([]);
  const [llmModels, setLlmModels] = useState<llm[]>([]);
  const [ragAvailable, setRagAvailable] = useState<boolean>(false);
  const t = useTranslations('create');
  const selectedProviderData = providers.find((p) => p.key === selectedProvider);

  async function fetchLlmModels() {
    setErrorLlmModels(null);
    setLoadingLlmModels(true);
    const response = await fetch(`/api/persona/helper/llm${selectedProvider ? `?provider=${selectedProvider}` : ''}`);
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

  async function fetchProviders() {
    try {
      const res = await fetch('/api/persona/helper/providers');
      if (!res.ok) return;
      const j = await res.json();
      setProviders(j.data || []);
      const firstAvailable = (j.data || []).find(
        (p: { key: string; label: string; available: boolean }) => p.available,
      )?.key;
      if (firstAvailable) setSelectedProvider(firstAvailable);
    } catch (_e) {
      // ignore
    }
  }

  useEffect(() => {
    fetchLanguages();
    fetchProviders();
  }, []);

  useEffect(() => {
    fetchLlmModels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvider]);

  useEffect(() => {
    if (llmModels.length === 0) return;

    const current = form.getValues('llmModel');
    const hasCurrent = llmModels.some((model) => model.key === current?.key);

    if (!hasCurrent) {
      form.setValue(
        'llmModel',
        {
          key: llmModels[0].key,
          label: llmModels[0].label,
        },
        { shouldDirty: false, shouldTouch: false },
      );
    }
  }, [form, llmModels]);

  // for check avaibility rag based on language selection and domain key
  const checkRagAvailability = useCallback(async () => {
    const selectedLanguageKey = form.getValues('language')?.key;
    const domainKey = form.getValues('domain')?.key || null;
    if (!selectedLanguageKey) return false;

    const response = await fetch(
      `/api/rag/contributions/check?language_key=${selectedLanguageKey}&domain_key=${domainKey}`,
    );
    if (!response.ok) return false;
    const json = await response.json();
    if (json.available) {
      setRagAvailable(true);
    } else {
      setRagAvailable(false);
      form.setValue('useRAG', false, { shouldDirty: true });
    }
  }, [form]);

  useEffect(() => {
    checkRagAvailability();
  }, [checkRagAvailability, languages]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <Card className="col-span-1 w-full border border-primary p-1.5 sm:p-2">
        <CardHeader className="relative p-1.5 sm:p-2">
          <CardTitle className="flex items-center gap-1.5 text-base text-primary sm:gap-2 sm:text-lg md:text-xl">
            <Bot
              size={16}
              className="text-foreground sm:size-[18px] md:size-5"
            />
            {t('llm-config-title')}
          </CardTitle>
          <CardDescription className="text-xs text-gray-400 sm:text-sm">
            {t('llm-config-desc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-1.5 sm:px-2">
          {loadingLlmModels && (
            <div>
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          )}
          {!loadingLlmModels && !errorLlmModels && (
            <Controller
              name="llmModel"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-4">
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t('llm-config-provider-label')}
                      </p>
                      <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={providerOpen}
                            className="w-full justify-between border-primary"
                          >
                            <span className="truncate text-left">
                              {selectedProviderData?.label ||
                                t('llm-config-provider-placeholder')}
                            </span>
                            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-60" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput
                              placeholder={t('llm-config-provider-search-placeholder')}
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                {t('llm-config-provider-empty')}
                              </CommandEmpty>
                              <CommandGroup>
                                {providers.map((p) => (
                                  <CommandItem
                                    key={p.key}
                                    value={`${p.key} ${p.label}`}
                                    disabled={!p.available}
                                    onSelect={() => {
                                      setSelectedProvider(p.key);
                                      setProviderOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 size-4',
                                        selectedProvider === p.key
                                          ? 'opacity-100'
                                          : 'opacity-0',
                                      )}
                                    />
                                    <span>{p.label}</span>
                                    {!p.available && (
                                      <span className="ml-2 text-xs text-muted-foreground">
                                        ({t('llm-config-provider-unavailable')})
                                      </span>
                                    )}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="sm:col-span-8">
                      <p className="mb-1 text-xs text-muted-foreground">
                        {t('construct-model')}
                      </p>
                      <Select
                        name={field.name}
                        value={field.value?.key || ''}
                        onValueChange={(val) =>
                          field.onChange({
                            key: val,
                            label:
                              llmModels.find((model) => model.key === val)
                                ?.label || val,
                          })
                        }
                      >
                        <SelectTrigger
                          className="w-full border-primary"
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue
                            placeholder={t('llm-config-select-placeholder')}
                          />
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
                    </div>
                  </div>
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
        <CardFooter className="flex flex-col items-stretch gap-2 border-t border-dashed px-1.5 pb-1 sm:flex-row sm:items-center sm:justify-between sm:px-2">
          <Controller
            name="useRAG"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="flex items-center">
                  <Checkbox
                    id={field.name}
                    checked={ragAvailable ? field.value : false}
                    aria-invalid={fieldState.invalid}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    disabled={!ragAvailable}
                  />
                  <span
                    className={cn(
                      'text-xs',
                      ragAvailable
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/50',
                    )}
                  >
                    {ragAvailable
                      ? t('llm-config-use-rag')
                      : t('llm-config-rag-unavailable')}
                  </span>
                </FieldLabel>
              </Field>
            )}
          />
          {loadingLanguages && (
            <div className="w-full sm:w-42">
              <Skeleton className="h-9 w-full rounded-md sm:w-32" />
            </div>
          )}
          {!loadingLanguages && !errorLanguages && (
            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="w-full sm:w-42"
                  >
                    <Select
                      name={field.name}
                      value={field.value.key}
                      onValueChange={(value) => {
                        field.onChange({
                          key: value,
                          label:
                            languages.find((lang) => lang.key === value)
                              ?.label || value,
                        });
                        checkRagAvailability();
                      }}
                    >
                      <SelectTrigger className="w-full border-primary sm:w-42">
                        <SelectValue
                          placeholder={t('llm-config-language-placeholder')}
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
