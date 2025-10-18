'use client';

import { Eye, EyeOff, LockKeyhole, MailIcon, User } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group';
import { Label } from '../ui/label';

export default function CreateAccountForm() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <section className="py-20">
      <div className="container">
        <form>
          <Card className="mx-auto max-w-sm border-primary">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Create a New Account
              </CardTitle>
              <CardDescription className="text-center">
                Sign up to save your persona history and access advanced
                features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 grid w-full items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <InputGroup className="border-primary">
                  <InputGroupInput
                    id="name"
                    type="text"
                    placeholder="John Doe"
                  />
                  <InputGroupAddon>
                    <User className="text-primary" />
                  </InputGroupAddon>
                </InputGroup>
              </div>
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
                <Label htmlFor="password">Password</Label>
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
              <div className="mb-4 grid w-full items-center gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <InputGroup className="border-primary">
                  <InputGroupInput
                    id="confirm-password"
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
              <div className="mb-4">
                <Label className="flex items-center">
                  <Checkbox id="terms" />
                  <span className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link href="#" className="text-primary hover:underline">
                      Terms and Conditions
                    </Link>
                    .
                  </span>
                </Label>
              </div>
              <Button className="w-full">
                <Link href="/create">Create Account</Link>
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline">
                  Login.
                </Link>
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
}
