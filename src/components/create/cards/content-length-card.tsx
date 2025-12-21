'use client';

import { Label } from '@/components/ui/label';
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
  CardHeader,
  CardTitle,
} from '../../ui/card';
import { Field } from '../../ui/field';
import { RadioGroup } from '../../ui/radio-group';
import { Slider } from '../../ui/slider';
import { formSchema } from '../construct';

type Props = {
  control: Control<z.infer<typeof formSchema>>;
};

export default function ContentLengthCard({ control }: Props) {
  // Range state: min-max from contentLengthRange array
  const presets = {
    short: [0, 100],
    medium: [100, 200],
    long: [200, 300],
  };
  const initialRange = Array.isArray(control._formValues.contentLengthRange)
    ? control._formValues.contentLengthRange
    : [100, 200];
  // Determine initial radio value
  let initialRadio = 'medium';
  if (
    initialRange[0] === presets.short[0] &&
    initialRange[1] === presets.short[1]
  )
    initialRadio = 'short';
  else if (
    initialRange[0] === presets.medium[0] &&
    initialRange[1] === presets.medium[1]
  )
    initialRadio = 'medium';
  else if (
    initialRange[0] === presets.long[0] &&
    initialRange[1] === presets.long[1]
  )
    initialRadio = 'long';
  const [radioValue, setRadioValue] = useState<string>(initialRadio);
  const [range, setRange] = useState<[number, number]>([
    initialRange[0],
    initialRange[1],
  ]);

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
          name="contentLengthRange"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RadioGroup
                value={radioValue}
                onValueChange={(value) => {
                  setRadioValue(value);
                  if (value === 'short') {
                    setRange(presets.short as [number, number]);
                    field.onChange(presets.short);
                  } else if (value === 'medium') {
                    setRange(presets.medium as [number, number]);
                    field.onChange(presets.medium);
                  } else if (value === 'long') {
                    setRange(presets.long as [number, number]);
                    field.onChange(presets.long);
                  }
                  // custom: do not change range, let slider handle
                }}
                className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3"
              >
                <RadioBoxItem
                  value="short"
                  id="short"
                  className="text-xs sm:text-sm"
                >
                  Short
                </RadioBoxItem>
                <RadioBoxItem
                  value="medium"
                  id="medium"
                  className="text-xs sm:text-sm"
                >
                  Medium
                </RadioBoxItem>
                <RadioBoxItem
                  value="long"
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
                  Custom
                </RadioBoxItem>
              </RadioGroup>
              <Label className="mb-2 flex justify-between border-t border-dashed pt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Min: <span className="font-semibold">{range[0]}</span> words
                </span>
                <span>
                  Max: <span className="font-semibold">{range[1]}</span> words
                </span>
              </Label>
              <Slider
                min={0}
                max={600}
                step={50}
                value={range}
                disabled={radioValue !== 'custom'}
                onValueChange={(value) => {
                  setRange([value[0], value[1]]);
                  field.onChange([value[0], value[1]]);
                }}
                className="my-2"
              />
            </Field>
          )}
        />
      </CardContent>
    </Card>
  );
}

function ContentLengthHelperModal() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <CircleQuestionMark className="absolute top-0 right-0 size-4 text-gray-400 hover:text-gray-600 sm:size-5" />
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
                Short (±0-100 words)
              </span>
              <br />
              <span>
                Suitable for brainstorming; contains essentials like
                demographics, main goal, and 1-2 pain points.
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">
                Medium (±100-200 words)
              </span>
              <br />
              <span>
                Balanced for workshops; includes motivation, several goals, pain
                points, and interaction with technology.
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">
                Long (≥200 words)
              </span>
              <br />
              <span>
                In-depth; adds personal stories, domain context, and more
                complete human factors.
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">Custom</span>
              <br />
              <span>Users can set the word count as needed.</span>
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
