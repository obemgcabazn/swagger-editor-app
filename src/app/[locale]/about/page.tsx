import { getTranslations, setRequestLocale } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type AboutPageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('AboutPage');

  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-3xl space-y-8">
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm font-medium">{t('eyebrow')}</p>
          <h1 className="text-foreground text-4xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg leading-8">{t('description')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="border-border bg-card text-card-foreground rounded-xl border p-5">
            <h2 className="font-semibold">{t('courseTitle')}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{t('courseDescription')}</p>
          </article>
          <article className="border-border bg-card text-card-foreground rounded-xl border p-5">
            <h2 className="font-semibold">{t('techTitle')}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-6">{t('techDescription')}</p>
          </article>
        </div>
        {process.env.NODE_ENV === 'development' ? (
          <Link className={buttonVariants({ variant: 'ghost' })} href="/dev/swagger">
            Dev smoke test
          </Link>
        ) : null}
      </section>
    </main>
  );
}
