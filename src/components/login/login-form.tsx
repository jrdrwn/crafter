'use client';

import { useUser } from '@/contexts/user-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next/client';
import { Eye, EyeOff, LockKeyhole, MailIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('login.form');
  const { refresh } = useUser();
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
      toast.success(t('success'));
      refresh();
      router.push('/');
    } else {
      toast.error(t('failed'), {
        description: json.message,
      });
    }
    setLoading(false);
  }

  return (
    <section className="px-2 py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="mx-auto w-full max-w-md border-primary">
            <CardHeader>
              <CardTitle className="text-center text-xl text-primary sm:text-2xl">
                {t('title')}
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                {t('description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-5">
              <Controller
                name="identifier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="mb-4 w-full gap-2"
                  >
                    <FieldLabel htmlFor={field.name}>{t('email')}</FieldLabel>
                    <InputGroup className="border-primary">
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('emailPlaceholder')}
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
                    <FieldLabel htmlFor={field.name}>
                      {t('password')}
                    </FieldLabel>
                    <InputGroup className="border-primary">
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        placeholder={t('passwordPlaceholder')}
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
                {t('button')}
              </Button>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {t('noAccount')}{' '}
                <Link
                  href="/create-account"
                  className="text-primary hover:underline"
                >
                  {t('createNow')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </form>
      </div>
    </section>
  );
}
