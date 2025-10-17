'use client';

import {
  BadgeInfo,
  Bot,
  Brain,
  CircleQuestionMark,
  Heart,
  Plus,
  Sparkles,
  Target,
  Text,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

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
import { Input } from '../ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from '../ui/item';
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

export default function Design() {
  const [customSliderValue, setCustomSliderValue] = useState([200]);
  const [customSliderDisable, setCustomSliderDisable] = useState(true);

  return (
    <section className="p-4 py-16">
      <div className="grid grid-cols-3 gap-8">
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
            <ScrollArea className="h-40">
              <RadioGroup defaultValue="health">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="health" id="health" />
                  <Label htmlFor="health">Health</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="education" id="education" />
                  <Label htmlFor="education">Education</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="software-development"
                    id="software-development"
                  />
                  <Label htmlFor="software-development">
                    Software Development
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="e-commerce" id="e-commerce" />
                  <Label htmlFor="e-commerce">E-commerce</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="banking-fintech"
                    id="banking-fintech"
                  />
                  <Label htmlFor="banking-fintech" className="w-full">
                    Banking & Fintech
                  </Label>

                  <X className="mr-3 size-4 text-gray-400 hover:text-red-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="travel-tourism" id="travel-tourism" />
                  <Label htmlFor="travel-tourism" className="w-full">
                    Travel & Tourism
                  </Label>
                  <X className="mr-3 size-4 text-gray-400 hover:text-red-500" />
                </div>
              </RadioGroup>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t border-dashed px-2 pb-2">
            <div className="flex w-full items-center gap-2">
              <Input
                type="search"
                placeholder="Search or add items..."
                className="border-primary"
              />
              <Button type="button">
                <Plus />
              </Button>
            </div>
          </CardFooter>
        </Card>
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
                <ScrollArea className="col-span-1 h-33">
                  <Label
                    htmlFor="demographic-information"
                    className="mb-2 w-full"
                  >
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox
                            value="demographic-information"
                            id="demographic-information"
                          />
                          <Users className="size-4 text-primary" />
                          Demographic Information
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Age, name, gender
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </Label>
                  <Label htmlFor="personal-attributes" className="mb-2 w-full">
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox
                            value="personal-attributes"
                            id="personal-attributes"
                          />
                          <Users className="size-4 text-primary" />
                          Personal Attributes
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Attitudes, behaviors, personality, preferences
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </Label>
                  <Label htmlFor="physical-condition" className="mb-2 w-full">
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox
                            value="physical-condition"
                            id="physical-condition"
                          />
                          <Heart className="size-4 text-primary" />
                          Physical Condition
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Health, physical limitations
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button size={'icon'} variant={'ghost'}>
                          <X />
                        </Button>
                      </ItemActions>
                    </Item>
                  </Label>
                </ScrollArea>
              </div>
              <div>
                <h3 className="mb-2 text-sm font-medium text-primary">
                  External Layer
                </h3>
                <ScrollArea className="col-span-1 h-33">
                  <Label htmlFor="motivation" className="mb-2 w-full">
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox value="motivation" id="motivation" />
                          <Users className="size-4 text-primary" />
                          Motivation
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Primary reasons for using the system
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </Label>
                  <Label htmlFor="goals" className="mb-2 w-full">
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox value="goals" id="goals" />
                          <Users className="size-4 text-primary" />
                          Goals
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Objectives the user wants to achieve
                        </ItemDescription>
                      </ItemContent>
                    </Item>
                  </Label>
                  <Label htmlFor="pain-points" className="mb-2 w-full">
                    <Item
                      variant={'outline'}
                      className="mr-4 w-full border-primary p-2"
                    >
                      <ItemContent>
                        <ItemTitle>
                          <Checkbox value="pain-points" id="pain-points" />
                          <Heart className="size-4 text-primary" />
                          Pain Points
                        </ItemTitle>
                        <ItemDescription className="ml-6 text-xs">
                          Key challenges & frustrations
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button size={'icon'} variant={'ghost'}>
                          <X />
                        </Button>
                      </ItemActions>
                    </Item>
                  </Label>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-dashed px-2 pb-2">
            <div className="grid w-full grid-cols-2 gap-8">
              <div className="col-span-1 flex w-full items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search or add item..."
                  className="border-primary"
                />
                <Input
                  type="text"
                  placeholder="Item description..."
                  className="border-primary"
                />
                <Button type="button">
                  <Plus />
                </Button>
              </div>
              <div className="col-span-1 flex w-full items-center gap-2">
                <Input
                  type="search"
                  placeholder="Search or add item..."
                  className="border-primary"
                />
                <Input
                  type="text"
                  placeholder="Item description..."
                  className="border-primary"
                />
                <Button type="button">
                  <Plus />
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
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
              <RadioGroup
                defaultValue="short"
                onValueChange={(value) => {
                  if (value === 'custom') {
                    setCustomSliderDisable(false);
                  } else {
                    setCustomSliderDisable(true);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="short" id="short" />
                  <Label htmlFor="short">Short</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="long" id="long" />
                  <Label htmlFor="long">Long</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">
                    Custom{' '}
                    {!customSliderDisable && `(${customSliderValue} words)`}
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter className="border-t border-dashed px-2 pb-2">
            <div className="flex w-full items-center gap-2">
              <Slider
                max={2000}
                step={50}
                disabled={customSliderDisable}
                value={customSliderValue}
                onValueChange={setCustomSliderValue}
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
              <Select>
                <SelectTrigger className="w-full border-primary">
                  <SelectValue placeholder="Select LLM Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash">
                    Gemini 2.5 Flash
                  </SelectItem>
                  <SelectItem value="gemini-2.5-flash-lite">
                    Gemini 2.5 Flash Lite
                  </SelectItem>
                  <SelectItem value="gemini-2.5-pro">Gemini 2.5 Pro</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <div className="my-4 flex justify-between">
            <Select>
              <SelectTrigger className="w-42 border-primary">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="id">Indonesia</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="amount" className="flex items-center">
              Amount?
              <Input
                name="amount"
                id="amount"
                type="number"
                className="ml-2 w-16 border-primary"
              />
            </Label>
          </div>
          <Button className="w-full">
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
            <Textarea
              className="min-h-39 resize-none"
              placeholder="Example: Focus on users with visual impairments, or users with minimal technology experience..."
            />
          </CardContent>
        </Card>
      </div>
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
