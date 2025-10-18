'use client';

import { cn } from '@/lib/utils';
import {
  Check,
  ChevronsUpDown,
  Filter,
  ListFilter,
  SearchIcon,
  User,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';

export default function PersonaItems() {
  return (
    <section className="p-4 py-8">
      <div className="container mx-auto">
        <Card className="w-full border-primary py-4">
          <CardContent className="px-4">
            <div className="flex items-center justify-between">
              <div>
                <InputGroup className="min-w-xs border-primary">
                  <InputGroupInput
                    type="search"
                    placeholder="Search persona or tag..."
                  />
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="flex items-center justify-center gap-4">
                <DomainFilterCombobox />
                <OrderFilterCombobox />
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Viewing 5 out of 5 personas
          </p>
          <div className="flex items-center gap-2">
            <Switch id="show-my-persona" />
            <Label
              htmlFor="show-my-persona"
              className="text-sm text-muted-foreground"
            >
              Show My Personas Only
            </Label>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
          <Card className="w-full gap-4 border-primary bg-primary/5 py-4">
            <CardHeader className="relative gap-0 px-4">
              <Badge
                variant={'outline'}
                className="absolute -top-2 right-2 rounded-full border-primary text-primary"
              >
                Created by Me
              </Badge>
              <div className="flex items-center">
                <span className="mr-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User />
                </span>
                <div>
                  <p className="text-lg font-semibold text-primary">
                    Ahmad Rizky
                  </p>
                  <p className="font-medium text-gray-500">
                    Product Manager, 28 tahun
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4">
              <p className="text-gray-500 italic">
                “Saya butuh solusi yang efisien untuk mengautomasi proses bisnis
                tanpa mengorbankan kualitas.”
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between px-4">
              <Badge
                variant={'outline'}
                className="rounded-full border-primary text-muted-foreground"
              >
                Software Engineer
              </Badge>
              <span className="text-sm text-muted-foreground">
                21 Agustus 2025
              </span>
            </CardFooter>
          </Card>
        </div>
        <Button className="mx-auto mt-8 block border-primary">
          Load More Personas
        </Button>
      </div>
    </section>
  );
}

const domains = [
  {
    value: 'marketing',
    label: 'Marketing',
  },
  {
    value: 'sales',
    label: 'Sales',
  },
  {
    value: 'product',
    label: 'Product',
  },
  {
    value: 'engineering',
    label: 'Engineering',
  },
];

function DomainFilterCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          className="w-48 justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <Filter className="text-primary" />
            {value
              ? domains.find((domain) => domain.value === value)?.label
              : 'Filter by Domain'}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <Command>
          <CommandInput placeholder="Search domains..." className="h-9" />
          <CommandList>
            <CommandEmpty>No domain found.</CommandEmpty>
            <CommandGroup>
              {domains.map((domain) => (
                <CommandItem
                  key={domain.value}
                  value={domain.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {domain.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === domain.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const orderItems = [
  {
    value: 'popular',
    label: 'Popular',
  },
  {
    value: 'date',
    label: 'Date',
  },
  {
    value: 'alphabetical',
    label: 'Alphabetical',
  },
  {
    value: 'recent',
    label: 'Recently Added',
  },
  {
    value: 'updated',
    label: 'Recently Updated',
  },
  {
    value: 'relevance',
    label: 'Relevance',
  },
];

function OrderFilterCombobox() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          role="combobox"
          aria-expanded={open}
          className="w-40 justify-between border-primary"
        >
          <div className="flex items-center gap-2">
            <ListFilter className="text-primary" />
            {value
              ? orderItems.find((item) => item.value === value)?.label
              : 'Order by'}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <Command>
          <CommandInput placeholder="Search order..." className="h-9" />
          <CommandList>
            <CommandEmpty>No order found.</CommandEmpty>
            <CommandGroup>
              {orderItems.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? '' : currentValue);
                    setOpen(false);
                  }}
                >
                  {item.label}
                  <Check
                    className={cn(
                      'ml-auto',
                      value === item.value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
