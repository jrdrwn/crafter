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
import { useUser } from '@/contexts/user-context';
import { cn } from '@/lib/utils';
import { LogOut, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { getCookie } from 'cookies-next/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Spinner } from '../ui/spinner';
import Brand from './brand';
import ChangeLanguage from './change-language';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  const _cookies = getCookie('lang');
  const t = useTranslations('shared.header');
  const baseMenus = [
    { title: t('home'), href: '/' },
    { title: t('create'), href: '/create' },
    { title: 'Tutorial', href: `/${_cookies ?? 'en'}-tutorial.pdf` },
  ];

  const pathname = usePathname();
  const { user, logout, loading } = useUser();

  const menus = user
    ? [
        ...baseMenus,
        { title: t('explore'), href: '/explore' },
        { title: t('history'), href: '/history' },
        { title: t('knowledge-base'), href: '/knowledge-base' },
      ]
    : baseMenus;

  const userInitial = (user?.name ?? user?.email ?? '?')
    .charAt(0)
    .toUpperCase();

  return (
    <header className="w-full border-b border-dashed border-primary">
      <div className="container mx-auto flex h-14 items-center justify-between rounded-none px-2 md:h-16 md:px-4">
        <Link
          href="/"
          scroll={false}
          className="flex items-center gap-2"
          prefetch={false}
        >
          <Button variant={'ghost'} className="rounded-full px-2 md:px-4">
            <Brand className="text-muted-foreground" />
            <span className="hidden font-bold text-primary sm:inline">
              CRAFTER 2.0
            </span>
            <span className="font-bold text-primary sm:hidden">CRAFTER</span>
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
                      pathname === menu.href
                        ? 'border-b-2 border-primary !text-primary'
                        : '',
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
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex gap-2">
            <ThemeToggle />
            <ChangeLanguage />
          </div>
          {loading ? (
            <div className="flex h-9 w-9 items-center justify-center">
              <Spinner className="size-6 text-primary" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  {userInitial}
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Profile</DropdownMenuLabel>
                {user.name && <DropdownMenuItem>{user.name}</DropdownMenuItem>}
                <DropdownMenuItem>{user.email}</DropdownMenuItem>
                <DropdownMenuItem>
                  {`Member since: ${new Date(user.created_at).toLocaleDateString()}`}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button className="shadow-md shadow-primary/35" size="sm" asChild>
              <Link href="/login" className="text-xs md:text-sm">
                Login
              </Link>
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
            <SheetContent side="top" className="p-4 lg:hidden">
              <SheetTitle>Menu</SheetTitle>
              <NavigationMenu className="w-full max-w-full flex-1 items-start [&>div]:w-full">
                <NavigationMenuList className="grid w-full justify-stretch gap-4">
                  {menus.map((menu) => (
                    <NavigationMenuItem
                      key={menu.title}
                      className="w-full text-right"
                    >
                      <NavigationMenuLink
                        className={navigationMenuTriggerStyle({
                          className: cn(
                            'w-full bg-transparent',
                            pathname === menu.href
                              ? 'border border-primary !text-primary'
                              : '',
                          ),
                        })}
                        active={pathname === menu.href}
                        asChild
                      >
                        <Link href={menu.href} className="w-full text-right">
                          {menu.title}
                        </Link>
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
