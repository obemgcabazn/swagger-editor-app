'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpAction } from '@/lib/auth/actions';
import { signUpSchema, type SignUpInput } from '@/lib/auth/schemas';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function SignUpForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });
  const t = useTranslations('Auth');

  const onSubmit = async (data: SignUpInput) => {
    clearErrors('root');
    const result = await signUpAction(data);
    if (result?.error) {
      setError('root', { message: result.error });
      return;
    }

    router.replace('/');
    router.refresh();
  };

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

      {errors.root && (
        <p role="alert" className="text-destructive mt-4">
          {t(errors.root.message ?? '')}
        </p>
      )}
      <Button type="submit" className="mt-5" disabled={isSubmitting}>
        {isSubmitting && (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <span>{isSubmitting ? t('signUpPending') : t('signUpButton')}</span>
      </Button>
    </form>
  );
}
