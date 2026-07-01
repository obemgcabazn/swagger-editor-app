import { getTranslations, setRequestLocale } from 'next-intl/server';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type HomeProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('HomePage');

  return (
    <main className="bg-background flex flex-1 items-center justify-center px-6 py-24">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center gap-8 text-center">
        <div className="space-y-4">
          <h1 className="text-foreground text-4xl font-semibold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-8">
            {t('description')}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className={buttonVariants()} href="/editor">
            {t('primaryAction')}
          </Link>
          <a
            className={buttonVariants({ variant: 'outline' })}
            href="https://swagger.io/specification/"
            rel="noreferrer"
            target="_blank"
          >
            {t('secondaryAction')}
          </a>
          {process.env.NODE_ENV === 'development' ? (
            <Link className={buttonVariants({ variant: 'ghost' })} href="/dev/swagger">
              Dev smoke test
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
