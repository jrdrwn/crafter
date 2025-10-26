'use client';

import { Bot } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field } from '../../ui/field';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
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
                  value={(field.value as string) ?? 'gemini-2.5-flash-lite'}
                  onValueChange={(val) => field.onChange(val)}
                >
                  <SelectTrigger
                    className="w-full border-primary"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select LLM Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-flash-lite">
                      Gemini 2.5 Flash Lite
                    </SelectItem>
                    <SelectItem value="gemini-2.5-flash">
                      Gemini 2.5 Flash
                    </SelectItem>
                    <SelectItem value="gemini-2.5-pro">
                      Gemini 2.5 Pro
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </CardContent>
      </Card>

      <div className="my-4 flex justify-between">
        <Controller<CreateFormValues>
          name="language"
          control={control}
          render={({ field, fieldState }) => {
            const lang = field.value as
              | CreateFormValues['language']
              | undefined;
            return (
              <Field data-invalid={fieldState.invalid} className="w-42">
                <Select
                  name={field.name}
                  value={(lang?.key ?? 'en') as 'en' | 'id'}
                  onValueChange={(value) =>
                    field.onChange({
                      key: value as 'en' | 'id',
                      label: value === 'en' ? 'English' : 'Indonesia',
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
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="id">Indonesia</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            );
          }}
        />
        <Controller<CreateFormValues>
          name="amount"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="w-fit">
              <Label htmlFor={field.name} className="flex items-center">
                Amount?
                <Input
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  value={String(field.value ?? 1)}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  type="number"
                  min={1}
                  max={3}
                  className="ml-2 w-16 border-primary"
                />
              </Label>
            </Field>
          )}
        />
      </div>
    </div>
  );
}
