'use client';

import { BadgeInfo } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { TCreateForm } from '../construct';

type Props = {
  control: Control<TCreateForm>;
};

export default function AdditionalDetailsCard({ control }: Props) {
  const t = useTranslations('create');
  return (
    <Card className="col-span-1 w-full border border-primary p-1.5 sm:p-2">
      <CardHeader className="relative p-1.5 sm:p-2">
        <CardTitle className="flex items-center gap-1.5 text-base text-primary sm:gap-2 sm:text-lg md:text-xl">
          <BadgeInfo
            size={16}
            className="text-foreground sm:size-[18px] md:size-5"
          />
          {t('additional-details-title')}
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 sm:text-sm">
          {t('additional-details-desc')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1.5 pb-1 sm:px-2">
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
                    className="max-h-16 min-h-16 resize-none text-xs sm:max-h-18 sm:min-h-18 sm:text-sm md:max-h-20 md:min-h-20"
                    maxLength={500}
                    value={value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={t('additional-details-placeholder')}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="text-xs tabular-nums sm:text-sm">
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
