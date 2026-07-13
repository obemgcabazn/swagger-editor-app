import { getTranslations, setRequestLocale } from 'next-intl/server';

import { redirectIfAuthenticated } from '@/lib/auth/require-auth';

import { SignUpForm } from './sign-up-form';

type SignUpPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function SignUpPage({ params }: SignUpPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  await redirectIfAuthenticated();
  const t = await getTranslations('Auth');

  return (
    <>
      <h1 className="text-2xl font-semibold">{t('signUp')}</h1>
      <SignUpForm />
    </>
  );
}
