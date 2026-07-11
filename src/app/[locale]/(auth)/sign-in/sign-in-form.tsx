'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInAction } from '@/lib/auth/actions';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function SignInForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });
  const t = useTranslations('Auth');

  const onSubmit = async (data: SignInInput) => {
    clearErrors('root');
    const result = await signInAction(data);
    if (result?.error) {
      setError('root', { message: result.error });
      return;
    }

    router.replace('/');
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-email">
        Email
      </Label>
      <Input id="sign-in-email" type="email" placeholder="john@email.com" {...register('email')} />
      <p>{errors.email?.message && t(`${errors.email.message}`)}</p>

      <Label className="mt-5 mb-2 cursor-pointer" htmlFor="sign-in-password">
        {t('password')}
      </Label>
      <Input id="sign-in-password" type="password" {...register('password')} />
      <p>{errors.password?.message && t(`${errors.password.message}`)}</p>

      {errors.root && (
        <p role="alert" className="text-destructive mt-4">
          {t(errors.root.message ?? '')}
        </p>
      )}
      <Button type="submit" className="mt-5" disabled={isSubmitting}>
        {isSubmitting && (
          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <span>{isSubmitting ? t('signInPending') : t('signInButton')}</span>
      </Button>
    </form>
  );
}
