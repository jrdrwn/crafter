'use client';

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from '@/components/ui/responsive-modal';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { CircleAlertIcon, CircleQuestionMark, Text } from 'lucide-react';
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';
import z from 'zod';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field } from '../../ui/field';
import { Label } from '../../ui/label';
import { RadioGroup } from '../../ui/radio-group';
import { Slider } from '../../ui/slider';
import { createFormSchema } from '../construct';

type Props = {
  control: Control<z.infer<typeof createFormSchema>>;
};

export default function ContentLengthCard({ control }: Props) {
  // Determine initial values
  const initialLength = control._formValues.contentLength || 300;
  const presetValues = [300, 600, 1000];
  const initialIsPreset = presetValues.includes(initialLength);
  const [radioValue, setRadioValue] = useState<string>(
    initialIsPreset ? String(initialLength) : 'custom',
  );
  const [sliderValue, setSliderValue] = useState<number>(
    initialIsPreset ? initialLength : Math.max(initialLength, 1100),
  );
  const isCustom = radioValue === 'custom';

  return (
    <Card className="col-span-1 w-full border border-primary p-1.5 sm:p-2">
      <CardHeader className="relative p-1.5 sm:p-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleAlertIcon className="absolute top-0 right-5 size-4 text-gray-400 hover:text-gray-600 sm:right-7 sm:size-5" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs sm:text-sm">
              if there are too many human factor, the response length can be not
              what you want
            </p>
          </TooltipContent>
        </Tooltip>
        <ContentLengthHelperModal />
        <CardTitle className="flex items-center gap-1.5 text-base text-primary sm:gap-2 sm:text-lg md:text-xl">
          <Text
            size={16}
            className="text-foreground sm:size-[18px] md:size-5"
          />
          Content Length Settings
        </CardTitle>
        <CardDescription className="text-xs text-gray-400 sm:text-sm">
          Adjust the length of the generated persona description
        </CardDescription>
      </CardHeader>
      <CardContent className="px-1.5 sm:px-2">
        <Controller
          name="contentLength"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RadioGroup
                value={radioValue}
                className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
                onValueChange={(value) => {
                  setRadioValue(value);
                  if (value === 'custom') {
                    const next = field.value > 1000 ? field.value : 1100;
                    setSliderValue(next);
                    field.onChange(next);
                  } else {
                    const length = parseInt(value, 10);
                    setSliderValue(length);
                    field.onChange(length);
                  }
                }}
              >
                <RadioBoxItem
                  value="300"
                  id="short"
                  className="text-xs sm:text-sm"
                >
                  Short
                </RadioBoxItem>
                <RadioBoxItem
                  value="600"
                  id="medium"
                  className="text-xs sm:text-sm"
                >
                  Medium
                </RadioBoxItem>
                <RadioBoxItem
                  value="1000"
                  id="long"
                  className="text-xs sm:text-sm"
                >
                  Long
                </RadioBoxItem>
                <RadioBoxItem
                  value="custom"
                  id="custom"
                  className="w-full text-xs sm:flex-1 sm:text-sm"
                >
                  Custom ({sliderValue} words)
                </RadioBoxItem>
              </RadioGroup>
            </Field>
          )}
        />
      </CardContent>
      <CardFooter className="border-t border-dashed px-1.5 pb-2 sm:px-2">
        <div className="flex w-full flex-col gap-2">
          <Label className="text-xs text-gray-500">
            Word count {isCustom ? '(drag to adjust)' : '(preset locked)'}
          </Label>
          <Controller
            name="contentLength"
            control={control}
            render={({ field }) => (
              <Slider
                max={2000}
                step={50}
                disabled={!isCustom}
                value={[sliderValue]}
                onValueChange={(value) => {
                  const next = value[0];
                  setSliderValue(next);
                  field.onChange(next);
                }}
              />
            )}
          />
        </div>
      </CardFooter>
    </Card>
  );
}

function ContentLengthHelperModal() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <CircleQuestionMark className="absolute top-0 right-0 size-5 text-gray-400 hover:text-gray-600" />
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-2xl">
            Helper: Content Length
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            The length of the persona determines the details shown: short for
            quick ideas, medium for balance, long for in-depth analysis.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="mt-4 space-y-4">
          <ul className="space-y-2">
            <li>
              <span className="font-medium text-primary">
                Short (±100-200 kata)
              </span>
              <br />
              <span>
                Cocok untuk brainstorming; berisi inti seperti demografi, tujuan
                utama, dan 1-2 pain points
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">
                Medium (±200-400 kata)
              </span>
              <br />
              <span>
                Seimbang untuk workshop; memuat motivasi, beberapa tujuan, pain
                points, dan interaksi dengan teknologi
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">Long (≥400 kata)</span>
              <br />
              <span>
                Mendalam; menambahkan cerita personal, konteks domain, serta
                faktor manusia lebih lengkap
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">Custom</span>
              <br />
              <span>Pengguna dapat mengatur jumlah kata sesuai kebutuhan</span>
            </li>
          </ul>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}

function RadioBoxItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-box-item"
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-all outline-none select-none hover:border-primary/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary/10 data-[state=checked]:shadow-sm data-[state=checked]:ring-2 data-[state=checked]:ring-primary/30',
        className,
      )}
      {...props}
    >
      {/* Hide default circular indicator if present */}
      <RadioGroupPrimitive.Indicator className="hidden" />
      {children}
    </RadioGroupPrimitive.Item>
  );
}
