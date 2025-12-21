'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, MailIcon, User } from 'lucide-react';
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
import { Checkbox } from '../ui/checkbox';
import { Field, FieldError, FieldLabel } from '../ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group';
import { Spinner } from '../ui/spinner';

const formSchema = z.object({
  name: z.string().min(1, 'Name must be at least 1 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z
    .string()
    .min(8, 'Confirm Password must be at least 8 characters long'),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

export default function CreateAccountForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [loading, setLoading] = useState(false);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (loading) return;
    setLoading(true);
    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      });
      return;
    }
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
      }),
    });

    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(json.message || 'Something went wrong. Please try again.');
      return;
    }

    toast.success('Account created successfully! Please log in.');
    router.push('/login');
    form.reset();
  }

  return (
    <section className="px-2 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mx-auto w-full max-w-md border-primary">
            <CardHeader>
              <CardTitle className="text-center text-xl text-primary sm:text-2xl">
                Create a New Account
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                Sign up to save your persona history and access advanced
                features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="mb-4 w-full gap-2"
                  >
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <InputGroup className="border-primary">
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder="John Doe"
                        type="text"
                        autoComplete="off"
                      />
                      <InputGroupAddon>
                        <User className="text-primary" />
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
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

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="mb-4 w-full gap-2"
                  >
                    <FieldLabel htmlFor={field.name}>
                      Confirm Password
                    </FieldLabel>
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
              <Controller
                name="terms"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="mb-4">
                    <FieldLabel className="flex items-center">
                      <Checkbox
                        id={field.name}
                        checked={field.value}
                        aria-invalid={fieldState.invalid}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
                      <span className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <Link href="#" className="text-primary hover:underline">
                          Terms and Conditions
                        </Link>
                        .
                      </span>
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Button className="w-full" type="submit" disabled={loading}>
                {loading && <Spinner />}
                Create Account
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
