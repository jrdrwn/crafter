'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next/client';
import {
  BadgeAlert,
  BadgeCheck,
  Eye,
  EyeOff,
  LockKeyhole,
  MailIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Field, FieldError, FieldLabel } from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group';
import { Spinner } from '../ui/spinner';

const formSchema = z.object({
  identifier: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default function LoginForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (loading) return;
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      status: boolean;
      data: { token: string };
      message: string;
    };
    if (res.status === 200) {
      setCookie('token', json.data.token);
      toast('Login Berhasil', {
        icon: <BadgeCheck />,
      });
      router.push('/');
      router.refresh();
    } else {
      toast('Login Gagal', {
        description: json.message,
        icon: <BadgeAlert />,
      });
    }
    setLoading(false);
  }

  return (
    <section className="py-20">
      <div className="container">
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
              <Controller
                name="identifier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="mb-4 w-full gap-2"
                  >
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <InputGroup className="border-primary">
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="name@email.com"
                        type="email"
                        autoComplete="off"
                      />
                      <InputGroupAddon>
                        <MailIcon className="text-primary" />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="mb-4 w-full gap-2"
                  >
                    <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                    <InputGroup className="border-primary">
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="Enter your password"
                        type={passwordVisible ? 'text' : 'password'}
                        autoComplete="off"
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Spinner />}
                Login
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
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
