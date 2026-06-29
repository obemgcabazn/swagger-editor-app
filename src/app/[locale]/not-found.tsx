import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

export default function NotFoundPage() {
  const t = useTranslations('NotFoundPage');

  return (
    <main className="bg-background flex flex-1 items-center justify-center px-6 py-24">
      <section className="mx-auto max-w-lg space-y-4 text-center">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
        <Link className={buttonVariants({ variant: 'outline' })} href="/">
          {t('homeLink')}
        </Link>
      </section>
    </main>
  );
}
