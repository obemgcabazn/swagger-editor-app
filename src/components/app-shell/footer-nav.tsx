'use client';

import { Link, usePathname } from '@/i18n/navigation';

type FooterNavProps = Readonly<{
  aboutLabel: string;
  mainLabel: string;
}>;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function FooterNav({ aboutLabel, mainLabel }: FooterNavProps) {
  const pathname = usePathname();
  const mainActive = isActive(pathname, '/');
  const aboutActive = isActive(pathname, '/about');

  const baseLinkClass =
    'hover:text-foreground transition-colors aria-[current=page]:text-foreground aria-[current=page]:font-medium';

  return (
    <nav aria-label="Footer" className="flex gap-4">
      <Link aria-current={mainActive ? 'page' : undefined} className={baseLinkClass} href="/">
        {mainLabel}
      </Link>
      <Link aria-current={aboutActive ? 'page' : undefined} className={baseLinkClass} href="/about">
        {aboutLabel}
      </Link>
    </nav>
  );
}
