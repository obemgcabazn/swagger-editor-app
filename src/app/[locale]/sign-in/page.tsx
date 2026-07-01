import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SignInForm } from './sign-in-form';

type SignInPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function SignInPage({ params }: SignInPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Auth');

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">{t('signIn')}</h1>
      <SignInForm />
    </div>
  );
}
