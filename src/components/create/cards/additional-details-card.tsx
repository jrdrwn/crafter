'use client';

import { BadgeInfo } from 'lucide-react';
import { Control, Controller } from 'react-hook-form';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field } from '../../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from '../../ui/input-group';
import type { CreateFormValues } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function AdditionalDetailsCard({ control }: Props) {
  return (
    <Card className="col-span-1 w-full border border-primary p-2">
      <CardHeader className="relative p-2">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <BadgeInfo size={20} className="text-foreground" />
          Additional Details
        </CardTitle>
        <CardDescription className="text-gray-400">
          Specific aspects you want to focus on (optional).
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 pb-1">
        <Controller
          name="detail"
          control={control}
          render={({ field, fieldState }) => {
            const value = typeof field.value === 'string' ? field.value : '';
            const count = value.length;
            return (
              <Field data-invalid={fieldState.invalid}>
                <InputGroup>
                  <InputGroupTextarea
                    name={field.name}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                    className="max-h-20 min-h-20 resize-none"
                    maxLength={500}
                    value={value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="Example: Focus on users with visual impairments, or users with minimal technology experience..."
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {count}/500
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
