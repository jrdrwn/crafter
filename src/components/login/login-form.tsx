'use client';

import { Eye, EyeOff, LockKeyhole, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';

export default function LoginForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <section className="py-20">
      <div className="container">
        <form>
          <Card className="mx-auto max-w-sm border-primary">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Login to Your Account
              </CardTitle>
              <CardDescription className="text-center">
                Log in to access your persona history and advanced features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid w-full items-center gap-2">
                <Label htmlFor="email">Email</Label>
                <InputGroup className="border-primary">
                  <InputGroupInput
                    id="email"
                    type="email"
                    placeholder="name@email.com"
                  />
                  <InputGroupAddon>
                    <MailIcon className="text-primary" />
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="mb-4 grid w-full items-center gap-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <InputGroup className="border-primary">
                  <InputGroupInput
                    id="password"
                    type={passwordVisible ? 'text' : 'password'}
                    placeholder="Enter your password"
                  />
                  <InputGroupAddon>
                    <LockKeyhole className="text-primary" />
                  </InputGroupAddon>
                  <InputGroupAddon align={'inline-end'}>
                    <InputGroupButton
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? (
                        <EyeOff className="text-primary" />
                      ) : (
                        <Eye className="text-primary" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <Button className="w-full">
                <Link href="/create">Login</Link>
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  href="/create-account"
                  className="text-primary hover:underline"
                >
                  Create now.
                </Link>
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
}
