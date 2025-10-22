'use client';

import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { deleteCookie, getCookie } from 'cookies-next/client';
import { LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import Brand from './brand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function Header() {
  const menus = [
    {
      title: 'Home',
      href: '/',
    },
    {
      title: 'Explore',
      href: '/explore',
    },
    {
      title: 'Create',
      href: '/create',
    },
    {
      title: 'History',
      href: '/history',
    },
  ];

  const pathname = usePathname();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const jwtToken = getCookie('token');

  async function fetchUserProfile(token: string) {
    const res = await fetch('/api/user/profile', {
      cache: 'default',
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      setUserProfile(json.data);
    }
  }

  useEffect(() => {
    if (jwtToken) {
      fetchUserProfile(jwtToken.toString());
    }
  }, [jwtToken]);

  return (
    <header className="w-full border-b border-dashed border-primary">
      <div className="container mx-auto flex h-16 items-center justify-between rounded-none px-2">
        <Link
          href="/"
          scroll={false}
          className="flex items-center gap-2"
          prefetch={false}
        >
          <Button variant={'ghost'} className="rounded-full">
            <Brand className="text-muted-foreground" />
            <span className="font-bold text-primary">CRAFTER 2.0</span>
          </Button>
        </Link>
        <NavigationMenu>
          <NavigationMenuList className="hidden items-center gap-2 text-sm font-medium lg:flex lg:gap-2 xl:gap-6">
            {menus.map((menu) => (
              <NavigationMenuItem key={menu.title}>
                <NavigationMenuLink
                  className={navigationMenuTriggerStyle({
                    className: cn(
                      'bg-transparent',
                      pathname === menu.href ? '!text-primary' : '',
                    ),
                  })}
                  active={pathname === menu.href}
                  asChild
                >
                  <Link href={menu.href}>{menu.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
        <div className="flex items-center gap-4">
          {userProfile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  {userProfile.name.charAt(0).toUpperCase()}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                <DropdownMenuItem>{userProfile.name}</DropdownMenuItem>
                <DropdownMenuItem>{userProfile.email}</DropdownMenuItem>
                <DropdownMenuItem>
                  {`Member since: ${new Date(userProfile.created_at).toLocaleDateString()}`}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    deleteCookie('token');
                    location.reload();
                  }}
                >
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="shadow-md shadow-primary/35" asChild>
              <Link href="/login">Login</Link>
            </Button>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full lg:hidden"
              >
                <Menu className="size-5 text-foreground/70" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 lg:hidden">
              <SheetTitle>Menu</SheetTitle>
              <NavigationMenu className="items-start">
                <NavigationMenuList className="grid gap-4">
                  {menus.map((menu) => (
                    <NavigationMenuItem key={menu.title}>
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle()}
                        active={pathname === menu.href}
                        asChild
                      >
                        <Link href={menu.href}>{menu.title}</Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
