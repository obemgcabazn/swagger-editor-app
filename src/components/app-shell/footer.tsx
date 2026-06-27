import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';

export async function Footer() {
  const navigation = await getTranslations('Navigation');
  const footer = await getTranslations('Footer');

  return (
    <footer className="border-border/60 bg-muted/30 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 text-sm sm:px-6 lg:px-8">
        <div>
          <p className="text-foreground font-medium">{navigation('brand')}</p>
          <p className="mt-1 max-w-2xl">{footer('description')}</p>
        </div>
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <nav aria-label="Footer" className="flex gap-4">
            <Link className="hover:text-foreground transition-colors" href="/">
              {navigation('main')}
            </Link>
            <Link className="hover:text-foreground transition-colors" href="/about">
              {navigation('about')}
            </Link>
          </nav>
          <p>{footer('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
