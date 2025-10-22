import {
  ChevronLeft,
  ChevronRight,
  Edit,
  FileJson,
  FileText,
  LockKeyhole,
  Trash,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Item, ItemActions, ItemContent, ItemMedia } from '../ui/item';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Switch } from '../ui/switch';
import Persona from './persona';

export default async function PersonaDetail() {
  const res = await fetch('http://localhost:3000/api/chat');
  const markdown = await res.json();
  return (
    <section className="px-4 py-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center gap-4">
            <Button variant={'outline'} className="border-primary">
              <ChevronLeft />
              Back to history
            </Button>
            <Select defaultValue="1">
              <SelectTrigger className="w-42 border-primary">
                <SelectValue placeholder="Persona Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Persona #1</SelectItem>
                <SelectItem value="2">Persona #2</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-center gap-4">
            <Button variant={'ghost'} className="text-green-500">
              <Wifi />
              Online
            </Button>
            <Button>
              <Edit />
              Edit
            </Button>
            <DeleteConfirmationDialog />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-8">
          <Persona markdown={markdown} />
          <div className="col-span-1 space-y-4">
            <Card className="w-full gap-2 border-foreground py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-2xl text-primary">
                  Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4">
                <div className="mb-4">
                  <h3 className="mb-2 font-medium">Created</h3>
                  <p>Monday, January 15, 2024</p>
                </div>
                <div>
                  <h3 className="mb-2 font-medium">Updated</h3>
                  <p>Monday, January 15, 2024</p>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full border-foreground py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-2xl text-primary">
                  Share Persona
                </CardTitle>
                <CardDescription>
                  Make this persona publicly accessible
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4">
                <Label
                  htmlFor="private"
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <LockKeyhole className="text-primary" /> Private
                  </div>
                  <Switch id="private" />
                </Label>
              </CardContent>
            </Card>
            <Card className="w-full border-foreground py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-2xl text-primary">
                  Download Persona
                </CardTitle>
                <CardDescription>
                  Save persona in multiple formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 px-4">
                <Item
                  size={'sm'}
                  variant={'outline'}
                  className="border-foreground"
                  asChild
                >
                  <Link href={'#'}>
                    <ItemMedia>
                      <FileText className="text-primary" />
                    </ItemMedia>
                    <ItemContent>Download as PDF</ItemContent>
                    <ItemActions>
                      <ChevronRight className="size-4" />
                    </ItemActions>
                  </Link>
                </Item>
                <Item
                  size={'sm'}
                  variant={'outline'}
                  className="border-foreground"
                  asChild
                >
                  <Link href={'#'}>
                    <ItemMedia>
                      <FileJson className="text-primary" />
                    </ItemMedia>
                    <ItemContent>Download as JSON</ItemContent>
                    <ItemActions>
                      <ChevronRight className="size-4" />
                    </ItemActions>
                  </Link>
                </Item>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeleteConfirmationDialog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>
          <Trash />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            persona and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
