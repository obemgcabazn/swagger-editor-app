'use client';

import { usePathname } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';

type HeaderNavProps = Readonly<{
  aboutLabel: string;
  mainLabel: string;
}>;

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function HeaderNav({ aboutLabel, mainLabel }: HeaderNavProps) {
  const pathname = usePathname();

  const mainActive = isActive(pathname, '/');
  const aboutActive = isActive(pathname, '/about');

  const baseLinkClass =
    'text-muted-foreground hover:text-foreground transition-colors aria-[current=page]:text-foreground aria-[current=page]:font-medium';

  return (
    <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
      <Link aria-current={mainActive ? 'page' : undefined} className={baseLinkClass} href="/">
        {mainLabel}
      </Link>
      <Link aria-current={aboutActive ? 'page' : undefined} className={baseLinkClass} href="/about">
        {aboutLabel}
      </Link>
    </nav>
  );
}
