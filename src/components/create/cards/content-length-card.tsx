'use client';

import { Text } from 'lucide-react';
import { useState } from 'react';
import { Control, Controller } from 'react-hook-form';

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
import { RadioGroup, RadioGroupItem } from '../../ui/radio-group';
import { Slider } from '../../ui/slider';
import type { CreateFormValues } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function ContentLengthCard({ control }: Props) {
  const [sliderValue, setSliderValue] = useState([
    control._formValues.contentLength || 300,
  ]);
  const [sliderDisabled, setSliderDisabled] = useState(
    control._formValues.contentLength <= 1000,
  );

  return (
    <Card className="col-span-1 w-full border border-primary p-2">
      <CardHeader className="relative p-2">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Text size={20} className="text-foreground" />
          Content Length Settings
        </CardTitle>
        <CardDescription className="text-gray-400">
          Adjust the length of the generated persona description
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <Controller
          name="contentLength"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <RadioGroup
                defaultValue={
                  +field.value > 1000 ? 'custom' : String(field.value)
                }
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setSliderDisabled(false);
                  } else {
                    const length = parseInt(value, 10);
                    field.onChange(length);
                    setSliderValue([length]);
                    setSliderDisabled(true);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="300" id="short" />
                  <Label htmlFor="short">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="600" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1000" id="long" />
                  <Label htmlFor="long">Long</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">
                    Custom {!sliderDisabled && `(${sliderValue} words)`}
                  </Label>
                </div>
              </RadioGroup>
            </Field>
          )}
        />
      </CardContent>
      <CardFooter className="border-t border-dashed px-2 pb-2">
        <div className="flex w-full items-center gap-2">
          <Controller
            name="contentLength"
            control={control}
            render={({ field }) => (
              <Slider
                max={2000}
                step={50}
                disabled={sliderDisabled}
                value={sliderValue}
                onValueChange={(value) => {
                  field.onChange(value[0]);
                  setSliderValue(value);
                }}
              />
            )}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
