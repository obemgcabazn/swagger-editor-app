'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInInput } from '@/lib/validation/auth';
import { useTranslations } from 'next-intl';

export function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const t = useTranslations('Auth');

  const onSubmit = (data: SignInInput) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-email">
        Email
      </Label>
      <Input id="sign-in-email" type="email" placeholder="john@email.com" {...register('email')} />
      <p>{errors.email?.message && t(`${errors.email.message}`)}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-up-password">
        {t('password')}
      </Label>
      <Input id="sign-up-password" type="password" {...register('password')} />
      <p>{errors.password?.message && t(`${errors.password.message}`)}</p>

      <Button type="submit" className="mt-5">
        {t('signInButton')}
      </Button>
    </form>
  );
}
