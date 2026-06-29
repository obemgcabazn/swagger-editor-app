'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';

type ErrorPageProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ reset }: ErrorPageProps) {
  const t = useTranslations('Error');

  return (
    <main className="bg-background flex flex-1 items-center justify-center px-6 py-24">
      <section className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
        <Button onClick={reset} type="button" variant="outline">
          {t('retry')}
        </Button>
      </section>
    </main>
  );
}
