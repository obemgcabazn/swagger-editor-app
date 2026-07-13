'use client';

import { buttonVariants } from '@/components/ui/button';
import { Link, usePathname } from '@/i18n/navigation';

function isHistoryRoute(pathname: string) {
  return pathname === '/history' || pathname.startsWith('/history/');
}

export function HistoryNavButton({ label }: Readonly<{ label: string }>) {
  const pathname = usePathname();
  const active = isHistoryRoute(pathname);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={buttonVariants({ variant: active ? 'secondary' : 'ghost', size: 'sm' })}
      href="/history"
    >
      {label}
    </Link>
  );
}
