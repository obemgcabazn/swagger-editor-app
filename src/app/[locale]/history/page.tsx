import { getTranslations, setRequestLocale } from 'next-intl/server';

import { requireAuth } from '@/lib/auth/require-auth';

type HistoryPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  await requireAuth();

  const t = await getTranslations('HistoryPage');

  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-3xl space-y-4">
        <h1 className="text-foreground text-4xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-lg leading-8">{t('description')}</p>
      </section>
    </main>
  );
}
