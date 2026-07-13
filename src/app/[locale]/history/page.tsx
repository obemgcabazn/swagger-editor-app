import dynamic from 'next/dynamic';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { requireAuth } from '@/lib/auth/require-auth';
import { getRequestHistory } from '@/lib/requests/request-history';

const HistoryContent = dynamic(() => import('./history-content').then((mod) => mod.HistoryContent));

type HistoryPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function HistoryPage({ params }: HistoryPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);
  await requireAuth();

  const [t, entries] = await Promise.all([getTranslations('HistoryPage'), getRequestHistory()]);

  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg leading-8">{t('description')}</p>
        </div>
        <HistoryContent entries={entries} />
      </section>
    </main>
  );
}
