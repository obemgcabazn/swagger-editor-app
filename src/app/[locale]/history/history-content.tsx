'use client';

import { useLocale, useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import {
  formatDurationMs,
  formatStatusCode,
  formatTimestamp,
} from '@/lib/requests/format-analytics';
import type { RequestHistoryRow } from '@/lib/requests/request-history';
import { cn } from '@/lib/utils';

type HistoryContentProps = Readonly<{
  entries: RequestHistoryRow[];
}>;

function MethodBadge({ method }: Readonly<{ method: string }>) {
  return (
    <span className="bg-muted text-foreground rounded px-2 py-0.5 font-mono text-xs font-semibold">
      {method}
    </span>
  );
}

function StatusBadge({ statusCode }: Readonly<{ statusCode: number | null }>) {
  const label = formatStatusCode(statusCode);
  const tone =
    statusCode === null
      ? 'text-muted-foreground'
      : statusCode >= 500
        ? 'text-destructive'
        : statusCode >= 400
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-emerald-600 dark:text-emerald-400';

  return <span className={cn('font-mono text-sm font-medium', tone)}>{label}</span>;
}

function EmptyHistoryState() {
  const t = useTranslations('HistoryPage');

  return (
    <div className="border-border bg-muted/20 rounded-xl border px-6 py-8 text-center">
      <p className="text-foreground text-lg font-medium">{t('emptyMessage')}</p>
      <p className="text-muted-foreground mt-2 text-sm">{t('emptyHint')}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link className={buttonVariants({ variant: 'outline' })} href="/#editor">
          {t('editorLink')}
        </Link>
        <Link className={buttonVariants({ variant: 'outline' })} href="/#viewer">
          {t('viewerLink')}
        </Link>
      </div>
    </div>
  );
}

function HistoryEntryRow({ entry }: Readonly<{ entry: RequestHistoryRow }>) {
  const locale = useLocale();
  const t = useTranslations('HistoryPage');

  return (
    <li className="border-border hover:bg-muted/30 rounded-xl border transition-colors">
      <Link
        className="flex flex-col gap-3 px-4 py-4 sm:grid sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
        href={`/history/${entry.id}`}
      >
        <div className="flex items-center gap-3">
          <MethodBadge method={entry.method} />
          <StatusBadge statusCode={entry.status_code} />
        </div>

        <div className="min-w-0">
          <p className="text-foreground truncate font-mono text-sm">{entry.endpoint_url}</p>
          <p className="text-muted-foreground mt-1 text-xs">
            {formatTimestamp(entry.request_timestamp, locale)}
            <span className="mx-2">·</span>
            {formatDurationMs(entry.duration_ms)}
          </p>
        </div>

        <span className="text-primary text-sm font-medium sm:justify-self-end">
          {t('viewDetails')}
        </span>
      </Link>
    </li>
  );
}

export function HistoryContent({ entries }: HistoryContentProps) {
  const t = useTranslations('HistoryPage');

  if (entries.length === 0) {
    return <EmptyHistoryState />;
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">{t('listSummary', { count: entries.length })}</p>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <HistoryEntryRow entry={entry} key={entry.id} />
        ))}
      </ul>
    </div>
  );
}
