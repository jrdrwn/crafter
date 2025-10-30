'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Bot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Control, Controller } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
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
  const [languages, setLanguages] = useState<CreateFormValues['language'][]>(
    [],
  );
  const [llmModels, setLlmModels] = useState<CreateFormValues['llmModel'][]>(
    [],
  );

  async function fetchLlmModels() {
    try {
      const response = await fetch('/api/llm');
      const data = await response.json();
      if (data.status) {
        setLlmModels(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch LLM models:', error);
    }
  }

  async function fetchLanguages() {
    try {
      const response = await fetch('/api/language');
      const data = await response.json();
      if (data.status) {
        setLanguages(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    }
  }

  useEffect(() => {
    fetchLanguages();
    fetchLlmModels();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="col-span-1 w-full gap-2 border border-primary p-2">
        <CardHeader className="relative p-2">
          <CardTitle className="flex items-center gap-2 text-xl text-primary">
            <Bot size={20} className="text-foreground" />
            LLM Configuration
          </CardTitle>
          <CardDescription className="text-gray-400">
            Select the AI model used to generate personas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-2">
          <Controller
            name="llmModel"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Select
                  name={field.name}
                  value={(field.value.key as string) ?? 'gemini-2.5-flash-lite'}
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
                      <SelectItem key={model.key} value={model.key}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="my-4 flex items-center justify-between">
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
                        languages.find((lang) => lang.key === value)?.label ||
                        value,
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
      </div>
    </div>
  );
}
