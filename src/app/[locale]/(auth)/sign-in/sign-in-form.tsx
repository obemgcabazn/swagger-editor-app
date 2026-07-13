'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInAction } from '@/lib/auth/actions';
import { signInSchema, type SignInInput } from '@/lib/auth/schemas';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { AuthField } from '@/components/auth/auth-field';
import { SubmitButton } from '@/components/auth/submit-button';

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
    <form data-testid="sign-in-form" method="post" onSubmit={handleSubmit(onSubmit)}>
      <AuthField
        error={errors.email?.message && t(errors.email.message)}
        id="sign-in-email"
        label="Email"
        placeholder="john@email.com"
        register={register('email')}
        type="email"
      />

      <AuthField
        error={errors.password?.message && t(errors.password.message)}
        id="sign-in-password"
        label={t('password')}
        register={register('password')}
        type="password"
      />

      <div className="mt-4 min-h-5">
        {errors.root && (
          <p className="text-destructive text-sm" role="alert">
            {t(errors.root.message ?? '')}
          </p>
        )}
      </div>

      <SubmitButton
        data-testid="sign-in-submit"
        idleLabel={t('signInButton')}
        isSubmitting={isSubmitting}
        pendingLabel={t('signInPending')}
      />
    </form>
  );
}
