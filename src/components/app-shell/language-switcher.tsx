'use client';

import { useLocale } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type LanguageSwitcherProps = Readonly<{
  label: string;
}>;

export function LanguageSwitcher({ label }: LanguageSwitcherProps) {
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="bg-background flex items-center rounded-lg border p-0.5">
      {routing.locales.map((locale) => (
        <Link
          aria-current={activeLocale === locale ? 'true' : undefined}
          className="aria-current:bg-primary aria-current:text-primary-foreground text-muted-foreground hover:text-foreground rounded-md px-2 py-1 text-xs font-medium uppercase transition-colors"
          href={pathname}
          key={locale}
          locale={locale}
        >
          {locale}
        </Link>
      ))}
    </nav>
  );
}
