'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpInput } from '@/lib/validation/auth';
import { useTranslations } from 'next-intl';

export function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });
  const t = useTranslations('Auth');

  const onSubmit = (data: SignUpInput) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label className="mb-2 cursor-pointer" htmlFor="sign-up-name">
        {t('name')}
      </Label>
      <Input id="sign-up-name" type="text" placeholder="John" {...register('name')} />
      <p>{errors.name?.message && t(`${errors.name.message}`)}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-up-email">
        Email
      </Label>
      <Input id="sign-up-email" type="email" placeholder="john@email.com" {...register('email')} />
      <p>{errors.email?.message && t(`${errors.email.message}`)}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-up-password">
        {t('password')}
      </Label>
      <Input id="sign-up-password" type="password" {...register('password')} />
      <p>{errors.password?.message && t(`${errors.password.message}`)}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-up-password-confirm">
        {t('passwordConfirm')}
      </Label>
      <Input id="sign-up-password-confirm" type="password" {...register('passwordConfirm')} />
      <p>{errors.passwordConfirm?.message && t(`${errors.passwordConfirm.message}`)}</p>

      <Button type="submit" className="mt-5">
        {t('signUpButton')}
      </Button>
    </form>
  );
}
