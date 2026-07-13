'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpAction } from '@/lib/auth/actions';
import { signUpSchema, type SignUpInput } from '@/lib/auth/schemas';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

import { AuthField } from '@/components/auth/auth-field';
import { SubmitButton } from '@/components/auth/submit-button';

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
      <AuthField
        error={errors.name?.message && t(errors.name.message)}
        id="sign-up-name"
        label={t('name')}
        placeholder="John"
        register={register('name')}
      />

      <AuthField
        error={errors.email?.message && t(errors.email.message)}
        id="sign-up-email"
        label="Email"
        placeholder="john@email.com"
        register={register('email')}
        type="email"
      />

      <AuthField
        error={errors.password?.message && t(errors.password.message)}
        id="sign-up-password"
        label={t('password')}
        register={register('password')}
        type="password"
      />

      <AuthField
        error={errors.passwordConfirm?.message && t(errors.passwordConfirm.message)}
        id="sign-up-password-confirm"
        label={t('passwordConfirm')}
        register={register('passwordConfirm')}
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
        idleLabel={t('signUpButton')}
        isSubmitting={isSubmitting}
        pendingLabel={t('signUpPending')}
      />
    </form>
  );
}
