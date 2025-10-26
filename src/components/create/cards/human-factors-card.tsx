'use client';

import { slugify } from '@/lib/utils';
import { Brain, Plus, Users } from 'lucide-react';
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
import { Checkbox } from '../../ui/checkbox';
import { Field, FieldLabel } from '../../ui/field';
import { Input } from '../../ui/input';
import { Item, ItemContent, ItemDescription, ItemTitle } from '../../ui/item';
import { ScrollArea } from '../../ui/scroll-area';
import type { CreateFormValues, Factor } from '../types';

type Props = {
  control: Control<CreateFormValues>;
};

export default function HumanFactorsCard({ control }: Props) {
  const [internalFactors, setInternalFactors] = useState<Factor[]>([
    {
      name: 'demographic-information',
      title: 'Demographic Information',
      description: 'Age, name, gender',
    },
    {
      name: 'personal-attributes',
      title: 'Personal Attributes',
      description: 'Attitudes, behaviors, personality',
    },
    {
      name: 'physical-condition',
      title: 'Physical Condition',
      description: 'Health, physical limitations',
    },
  ]);
  const [internalQuery, setInternalQuery] = useState('');
  const [internalDescCustom, setInternalDescCustom] = useState('');
  const internalInputRef = useRef<HTMLInputElement>(null);
  const internalDescInputRef = useRef<HTMLInputElement>(null);

  const [externalFactors, setExternalFactors] = useState<
    (Factor & { disabled?: boolean })[]
  >([
    {
      name: 'motivation',
      title: 'Motivation',
      description: 'Primary reasons for using the system',
      disabled: true,
    },
    {
      name: 'goals',
      title: 'Goals',
      description: 'Objectives the user wants to achieve',
      disabled: true,
    },
    {
      name: 'pain-points',
      title: 'Pain Points',
      description: 'Key challenges & frustrations',
      disabled: true,
    },
  ]);
  const [externalQuery, setExternalQuery] = useState('');
  const [externalDescCustom, setExternalDescCustom] = useState('');
  const externalInputRef = useRef<HTMLInputElement>(null);
  const externalDescInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="col-span-2 w-full border border-primary p-2">
      <CardHeader className="relative p-2">
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <Brain size={20} className="text-foreground" />
          Human Factors
        </CardTitle>
        <CardDescription className="text-gray-400">
          Choose the aspects you want to focus on in your persona.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-2 text-sm font-medium text-primary">
              Internal Layer
            </h3>
            <Controller<CreateFormValues>
              name="internal"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ScrollArea className="col-span-1 h-33">
                    {internalFactors
                      .filter((val) =>
                        val.title
                          .toLowerCase()
                          .includes(internalQuery.toLowerCase()),
                      )
                      .map((val, idx) => (
                        <FieldLabel
                          key={idx}
                          htmlFor={val.name}
                          className="mb-2 w-full"
                        >
                          <Item
                            variant={'outline'}
                            className="mr-4 w-full border-primary p-2"
                          >
                            <ItemContent>
                              <ItemTitle>
                                <Checkbox
                                  onCheckedChange={(checked) => {
                                    const selected = (field.value ||
                                      []) as Factor[];
                                    if (checked) {
                                      field.onChange([...selected, val]);
                                    } else {
                                      field.onChange(
                                        selected.filter(
                                          (item) => item.name !== val.name,
                                        ),
                                      );
                                    }
                                  }}
                                  name={val.name}
                                  aria-invalid={fieldState.invalid}
                                  value={val.name}
                                  defaultChecked={(
                                    field.value as Factor[] | undefined
                                  )?.some((item) => item.name === val.name)}
                                  id={val.name}
                                />
                                <Users className="size-4 text-primary" />
                                {val.title}
                              </ItemTitle>
                              <ItemDescription className="ml-6 text-xs">
                                {val.description}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </FieldLabel>
                      ))}
                    {internalQuery &&
                      !internalFactors.some(
                        (factor) =>
                          factor.title.toLowerCase() ===
                          internalQuery.toLowerCase(),
                      ) && (
                        <p className="mt-2 text-center text-xs text-gray-500">
                          Add &quot;{internalQuery}&quot; as a new internal
                          factor if not listed.
                        </p>
                      )}
                  </ScrollArea>
                </Field>
              )}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-primary">
              External Layer
            </h3>
            <Controller<CreateFormValues>
              name="external"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ScrollArea className="col-span-1 h-33">
                    {externalFactors
                      .filter((val) =>
                        val.title
                          .toLowerCase()
                          .includes(externalQuery.toLowerCase()),
                      )
                      .map((val, idx) => (
                        <FieldLabel
                          key={idx}
                          htmlFor={val.name}
                          className="mb-2 w-full"
                        >
                          <Item
                            variant={'outline'}
                            className="mr-4 w-full border-primary p-2"
                          >
                            <ItemContent>
                              <ItemTitle>
                                <Checkbox
                                  onCheckedChange={(checked) => {
                                    const selected = (field.value ||
                                      []) as Factor[];
                                    if (checked) {
                                      field.onChange([
                                        ...selected,
                                        {
                                          name: val.name,
                                          title: val.title,
                                          description: val.description,
                                        },
                                      ]);
                                    } else {
                                      field.onChange(
                                        selected.filter(
                                          (item) => item.name !== val.name,
                                        ),
                                      );
                                    }
                                  }}
                                  name={val.name}
                                  aria-invalid={fieldState.invalid}
                                  value={val.name}
                                  id={val.name}
                                  defaultChecked={
                                    val.disabled ||
                                    ((
                                      field.value as Factor[] | undefined
                                    )?.some((item) => item.name === val.name) ??
                                      false)
                                  }
                                  disabled={val.disabled}
                                />
                                <Users className="size-4 text-primary" />
                                {val.title}
                              </ItemTitle>
                              <ItemDescription className="ml-6 text-xs">
                                {val.description}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </FieldLabel>
                      ))}
                    {externalQuery &&
                      !externalFactors.some(
                        (factor) =>
                          factor.title.toLowerCase() ===
                          externalQuery.toLowerCase(),
                      ) && (
                        <p className="mt-2 text-center text-xs text-gray-500">
                          Add &quot;{externalQuery}&quot; as a new external
                          factor if not listed.
                        </p>
                      )}
                  </ScrollArea>
                </Field>
              )}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-dashed px-2 pb-2">
        <div className="grid w-full grid-cols-2 gap-8">
          <div className="col-span-1 flex w-full items-center gap-2">
            <Input
              ref={internalInputRef}
              type="search"
              placeholder="Search or add item..."
              className="border-primary"
              onChange={(e) => setInternalQuery(e.target.value)}
            />
            <Input
              ref={internalDescInputRef}
              type="text"
              placeholder="Item description..."
              className="border-primary"
              onChange={(e) => setInternalDescCustom(e.target.value)}
            />
            <Button
              type="button"
              disabled={!internalQuery || !internalDescCustom}
              onClick={() => {
                if (internalQuery && internalDescCustom) {
                  setInternalFactors((prev) => [
                    {
                      name: slugify(internalQuery),
                      title: internalQuery,
                      description: internalDescCustom,
                    },
                    ...prev,
                  ]);
                  setInternalQuery('');
                  setInternalDescCustom('');
                  if (internalInputRef.current)
                    internalInputRef.current.value = '';
                  if (internalDescInputRef.current)
                    internalDescInputRef.current.value = '';
                }
              }}
            >
              <Plus />
            </Button>
          </div>
          <div className="col-span-1 flex w-full items-center gap-2">
            <Input
              ref={externalInputRef}
              type="search"
              placeholder="Search or add item..."
              className="border-primary"
              onChange={(e) => setExternalQuery(e.target.value)}
            />
            <Input
              ref={externalDescInputRef}
              type="text"
              placeholder="Item description..."
              className="border-primary"
              onChange={(e) => setExternalDescCustom(e.target.value)}
            />
            <Button
              type="button"
              disabled={!externalQuery || !externalDescCustom}
              onClick={() => {
                if (externalQuery && externalDescCustom) {
                  setExternalFactors((prev) => [
                    {
                      name: slugify(externalQuery),
                      title: externalQuery,
                      description: externalDescCustom,
                      disabled: false,
                    },
                    ...prev,
                  ]);
                  setExternalQuery('');
                  setExternalDescCustom('');
                  if (externalInputRef.current)
                    externalInputRef.current.value = '';
                  if (externalDescInputRef.current)
                    externalDescInputRef.current.value = '';
                }
              }}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
