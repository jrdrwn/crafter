'use client';

import {
  BadgeInfo,
  Bot,
  Brain,
  CircleQuestionMark,
  Plus,
  Sparkles,
  Target,
  Text,
  Users,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Item, ItemContent, ItemDescription, ItemTitle } from '../ui/item';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalTrigger,
} from '../ui/responsive-modal';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Slider } from '../ui/slider';
import { Textarea } from '../ui/textarea';

const formSchema = z.object({
  domain: z.string().min(1, 'Please select a domain'),
  internal: z.array(z.string()).min(1, 'Select at least one internal factor'),
  external: z.array(z.string()).min(1, 'Select at least one external factor'),
  contentLength: z
    .number()
    .min(50)
    .max(2000, 'Content length must be between 50 and 2000 words'),
  llmModel: z.string().nonempty('Please select an LLM model'),
  language: z.string().nonempty('Please select a language'),
  amount: z.coerce
    .number()
    .min(1, 'At least 1 persona')
    .max(3, 'Maximum 3 personas'),
  detail: z.string().optional(),
});

export default function Design() {
  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      domain: '',
      internal: [],
      external: [],
      contentLength: 200,
      llmModel: '',
      language: '',
      amount: 1,
      detail: '',
    },
  });
  const [contentLengthSliderValue, setContentLengthSliderValue] = useState([
    200,
  ]);
  const [contentLengthSliderDisable, setContentLengthSliderDisable] =
    useState(true);

  const [domains, setDomains] = useState([
    'Health',
    'Education',
    'Software Development',
    'E-commerce',
    'Banking & Fintech',
    'Travel & Tourism',
  ]);
  const [domainQuery, setDomainQuery] = useState('');
  const domainInputRef = useRef<HTMLInputElement>(null);

  const [internalFactors, setInternalFactors] = useState([
    { label: 'Demographic Information', desc: 'Age, name, gender' },
    { label: 'Personal Attributes', desc: 'Attitudes, behaviors, personality' },
    { label: 'Physical Condition', desc: 'Health, physical limitations' },
  ]);
  const [internalQuery, setInternalQuery] = useState('');
  const [internalDescCustom, setInternalDescCustom] = useState('');
  const internalInputRef = useRef<HTMLInputElement>(null);
  const internalDescInputRef = useRef<HTMLInputElement>(null);

  const [externalFactors, setExternalFactors] = useState([
    { label: 'Motivation', desc: 'Primary reasons for using the system' },
    { label: 'Goals', desc: 'Objectives the user wants to achieve' },
    { label: 'Pain Points', desc: 'Key challenges & frustrations' },
  ]);
  const [externalQuery, setExternalQuery] = useState('');
  const [externalDescCustom, setExternalDescCustom] = useState('');
  const externalInputRef = useRef<HTMLInputElement>(null);
  const externalDescInputRef = useRef<HTMLInputElement>(null);

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast('You submitted the following values:', {
      description: (
        <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: 'bottom-right',
      classNames: {
        content: 'flex flex-col gap-2',
      },
      style: {
        '--border-radius': 'calc(var(--radius)  + 4px)',
      } as React.CSSProperties,
    });
  }

  return (
    <section className="p-4 py-16">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="container mx-auto grid grid-cols-3 gap-8"
      >
        {/* DOMAIN CARD */}
        <Card className="col-span-1 w-full border border-primary p-2">
          <CardHeader className="p-2">
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Target size={20} className="text-foreground" />
              Choose Domain
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select the domain or industry for the persona you want to create.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <Controller
              name="domain"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <ScrollArea className="h-40">
                    <RadioGroup
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-invalid={fieldState.invalid}
                      defaultValue="health"
                    >
                      {domains
                        .filter((domain) =>
                          domain
                            .toLowerCase()
                            .includes(domainQuery.toLowerCase()),
                        )
                        .map((domain) => (
                          <FieldLabel
                            key={domain}
                            htmlFor={domain
                              .toLowerCase()
                              .replace(/ & /g, '-')
                              .replace(/\s+/g, '-')}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={domain
                                .toLowerCase()
                                .replace(/ & /g, '-')
                                .replace(/\s+/g, '-')}
                              id={domain
                                .toLowerCase()
                                .replace(/ & /g, '-')
                                .replace(/\s+/g, '-')}
                            />
                            {domain}
                          </FieldLabel>
                        ))}
                    </RadioGroup>
                    {domainQuery && !domains.includes(domainQuery) && (
                      <p className="mt-2 text-center text-xs text-gray-500">
                        Add "{domainQuery}" as a new domain if not listed.
                      </p>
                    )}
                  </ScrollArea>
                </Field>
              )}
            />
          </CardContent>
          <CardFooter className="border-t border-dashed px-2 pb-2">
            <div className="flex w-full items-center gap-2">
              <Input
                ref={domainInputRef}
                type="search"
                placeholder="Search or add items..."
                className="border-primary"
                onChange={(e) => setDomainQuery(e.target.value)}
              />
              <Button
                type="button"
                disabled={!domainQuery}
                onClick={() => {
                  if (domainQuery && !domains.includes(domainQuery)) {
                    setDomains((prev) => [domainQuery, ...prev]);
                    setDomainQuery('');
                    if (domainInputRef.current) {
                      domainInputRef.current.value = '';
                    }
                  }
                }}
              >
                <Plus />
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* HUMAN FACTOR CARD */}
        <Card className="col-span-2 w-full border border-primary p-2">
          <CardHeader className="relative p-2">
            <HumanFactorsHelperModal />
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
                <Controller
                  name="internal"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <ScrollArea className="col-span-1 h-33">
                        {internalFactors
                          .filter((val) =>
                            val.label
                              .toLowerCase()
                              .includes(internalQuery.toLowerCase()),
                          )
                          .map((val, idx) => (
                            <FieldLabel
                              key={idx}
                              htmlFor={val.label
                                .toLowerCase()
                                .replace(/ & /g, '-')
                                .replace(/\s+/g, '-')}
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
                                        const value = val.label
                                          .toLowerCase()
                                          .replace(/ & /g, '-')
                                          .replace(/\s+/g, '-');
                                        if (checked) {
                                          field.onChange([
                                            ...field.value,
                                            value,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (item) => item !== value,
                                            ),
                                          );
                                        }
                                      }}
                                      name={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                      aria-invalid={fieldState.invalid}
                                      value={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                      id={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                    />
                                    <Users className="size-4 text-primary" />
                                    {val.label}
                                  </ItemTitle>
                                  <ItemDescription className="ml-6 text-xs">
                                    {val.desc}
                                  </ItemDescription>
                                </ItemContent>
                              </Item>
                            </FieldLabel>
                          ))}
                        {internalQuery &&
                          !internalFactors.some(
                            (factor) =>
                              factor.label.toLowerCase() ===
                              internalQuery.toLowerCase(),
                          ) && (
                            <p className="mt-2 text-center text-xs text-gray-500">
                              Add "{internalQuery}" as a new internal factor if
                              not listed.
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
                <Controller
                  name="external"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <ScrollArea className="col-span-1 h-33">
                        {externalFactors
                          .filter((val) =>
                            val.label
                              .toLowerCase()
                              .includes(externalQuery.toLowerCase()),
                          )
                          .map((val, idx) => (
                            <FieldLabel
                              key={idx}
                              htmlFor={val.label
                                .toLowerCase()
                                .replace(/ & /g, '-')
                                .replace(/\s+/g, '-')}
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
                                        const value = val.label
                                          .toLowerCase()
                                          .replace(/ & /g, '-')
                                          .replace(/\s+/g, '-');
                                        if (checked) {
                                          field.onChange([
                                            ...field.value,
                                            value,
                                          ]);
                                        } else {
                                          field.onChange(
                                            field.value.filter(
                                              (item) => item !== value,
                                            ),
                                          );
                                        }
                                      }}
                                      name={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                      aria-invalid={fieldState.invalid}
                                      value={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                      id={val.label
                                        .toLowerCase()
                                        .replace(/ & /g, '-')
                                        .replace(/\s+/g, '-')}
                                    />
                                    <Users className="size-4 text-primary" />
                                    {val.label}
                                  </ItemTitle>
                                  <ItemDescription className="ml-6 text-xs">
                                    {val.desc}
                                  </ItemDescription>
                                </ItemContent>
                              </Item>
                            </FieldLabel>
                          ))}
                        {externalQuery &&
                          !externalFactors.some(
                            (factor) =>
                              factor.label.toLowerCase() ===
                              externalQuery.toLowerCase(),
                          ) && (
                            <p className="mt-2 text-center text-xs text-gray-500">
                              Add "{externalQuery}" as a new external factor if
                              not listed.
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
                        { label: internalQuery, desc: internalDescCustom },
                        ...prev,
                      ]);
                      setInternalQuery('');
                      setInternalDescCustom('');
                      if (internalInputRef.current) {
                        internalInputRef.current.value = '';
                      }
                      if (internalDescInputRef.current) {
                        internalDescInputRef.current.value = '';
                      }
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
                        { label: externalQuery, desc: externalDescCustom },
                        ...prev,
                      ]);
                      setExternalQuery('');
                      setExternalDescCustom('');
                      if (externalInputRef.current) {
                        externalInputRef.current.value = '';
                      }
                      if (externalDescInputRef.current) {
                        externalDescInputRef.current.value = '';
                      }
                    }
                  }}
                >
                  <Plus />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        {/* CONTENT LENGTH CARD */}
        <Card className="col-span-1 w-full border border-primary p-2">
          <CardHeader className="relative p-2">
            <ContentLengthHelperModal />
            <CardTitle className="flex items-center gap-2 text-xl text-primary">
              <Text size={20} className="text-foreground" />
              Content Length Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Adjust the length of the generated persona description
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <div>
              <Controller
                name="contentLength"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <RadioGroup
                      defaultValue="300"
                      onValueChange={(value) => {
                        if (value === 'custom') {
                          setContentLengthSliderDisable(false);
                        } else {
                          const length = parseInt(value, 10);
                          field.onChange(length);
                          setContentLengthSliderValue([length]);
                          setContentLengthSliderDisable(true);
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
                          Custom{' '}
                          {!contentLengthSliderDisable &&
                            `(${contentLengthSliderValue} words)`}
                        </Label>
                      </div>
                    </RadioGroup>
                  </Field>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t border-dashed px-2 pb-2">
            <div className="flex w-full items-center gap-2">
              <Slider
                max={2000}
                step={50}
                disabled={contentLengthSliderDisable}
                value={contentLengthSliderValue}
                onValueChange={(value) => {
                  form.setValue('contentLength', value[0]);
                  setContentLengthSliderValue(value);
                }}
              />
            </div>
          </CardFooter>
        </Card>
        <div className="">
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
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        className="w-full border-primary"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Select LLM Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5-flash">
                          Gemini 2.5 Flash
                        </SelectItem>
                        <SelectItem value="gemini-2.5-flash-lite">
                          Gemini 2.5 Flash Lite
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
            <Controller
              name="language"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-42">
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
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
              )}
            />
            <Controller
              name="amount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="w-fit">
                  <Label htmlFor={field.name} className="flex items-center">
                    Amount?
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      value={field.value.toString()}
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
          <Button className="w-full" type="submit">
            <Sparkles />
            Create persona
          </Button>
          <p className="mt-2 text-center text-xs text-gray-500">
            By clicking <span className="text-primary">"Create persona"</span>,
            you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
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
          <CardContent className="px-2">
            <Controller
              name="detail"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    className="min-h-39 resize-none"
                    placeholder="Example: Focus on users with visual impairments, or users with minimal technology experience..."
                  />
                </Field>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </section>
  );
}

function HumanFactorsHelperModal() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <CircleQuestionMark className="absolute top-0 right-0 size-5 text-gray-400 hover:text-gray-600" />
      </ResponsiveModalTrigger>
      <ResponsiveModalContent>
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-2xl">
            Helper: Human Factor
          </ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Human factors consist of general attributes (internal) and domain
            context (external) to make the persona more realistic.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="mt-4 space-y-4">
          <ul className="space-y-2">
            <li>
              <span className="font-medium text-primary">Internal layer</span>
              <br />
              <span>Informasi demografis, atribut personal.</span>
            </li>
            <li>
              <span className="font-medium text-primary">External layer</span>
              <br />
              <span>
                Motivasi, tujuan, pain points, cerita personal, interaksi
                teknologi, status pekerjaan, lingkungan keluarga, lokasi
                geografis, hingga gaya komunikasi
              </span>
            </li>
            <li>
              <span className="font-semibold text-primary">Tips</span>
              <br />
              <span>
                Mulai dari internal (wajib), lalu tambahkan eksternal sesuai
                konteks proyek atau domain (misal kesehatan, pendidikan, lansia)
              </span>
            </li>
            <li>
              <span className="font-semibold text-primary">Tujuan</span>
              <br />
              <span>
                Memberikan fleksibilitas yang mana internal untuk reuse,
                eksternal untuk penyesuaian spesifik domain
              </span>
            </li>
          </ul>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
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
                Short (±100–200 kata)
              </span>
              <br />
              <span>
                Cocok untuk brainstorming; berisi inti seperti demografi, tujuan
                utama, dan 1–2 pain points
              </span>
            </li>
            <li>
              <span className="font-medium text-primary">
                Medium (±200–400 kata)
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
