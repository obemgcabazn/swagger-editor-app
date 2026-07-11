import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { requireAuth } from '@/lib/auth/require-auth';
import {
  formatBytes,
  formatDurationMs,
  formatRequestSize,
  formatStatusCode,
  formatTimestamp,
} from '@/lib/requests/format-analytics';
import { getRequestHistoryEntry } from '@/lib/requests/request-history';
import { cn } from '@/lib/utils';

type HistoryDetailPageProps = Readonly<{
  params: Promise<{ id: string; locale: string }>;
}>;

type AnalyticsFieldProps = Readonly<{
  label: string;
  value: string;
  valueClassName?: string;
}>;

function AnalyticsField({ label, value, valueClassName }: AnalyticsFieldProps) {
  return (
    <div className="border-border grid gap-1 border-b py-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-6">
      <dt className="text-muted-foreground text-sm font-medium">{label}</dt>
      <dd className={cn('text-foreground text-sm break-all', valueClassName)}>{value}</dd>
    </div>
  );
}

function formatHeaders(headers: unknown): string | null {
  if (headers === null || headers === undefined) {
    return null;
  }

  return JSON.stringify(headers, null, 2);
}

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { id, locale } = await params;

  setRequestLocale(locale);
  await requireAuth();

  const [t, entry] = await Promise.all([
    getTranslations('HistoryPage'),
    getRequestHistoryEntry(id),
  ]);

  if (!entry) {
    notFound();
  }

  const requestHeaders = formatHeaders(entry.request_headers);
  const responseHeaders = formatHeaders(entry.response_headers);
  const statusTone =
    entry.status_code === null
      ? 'text-muted-foreground'
      : entry.status_code >= 500
        ? 'text-destructive'
        : entry.status_code >= 400
          ? 'text-amber-600 dark:text-amber-400'
          : 'text-emerald-600 dark:text-emerald-400';

  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-4">
          <Link className={buttonVariants({ size: 'sm', variant: 'ghost' })} href="/history">
            ← {t('backToHistory')}
          </Link>
          <div className="space-y-2">
            <h1 className="text-foreground text-4xl font-semibold tracking-tight">
              {t('detailTitle')}
            </h1>
            <p className="text-muted-foreground font-mono text-sm break-all">
              {entry.endpoint_url}
            </p>
          </div>
        </div>

        <dl className="border-border rounded-xl border px-4 sm:px-6">
          <AnalyticsField label={t('method')} value={entry.method} valueClassName="font-mono" />
          <AnalyticsField
            label={t('endpoint')}
            value={entry.endpoint_url}
            valueClassName="font-mono"
          />
          <AnalyticsField
            label={t('statusCode')}
            value={formatStatusCode(entry.status_code)}
            valueClassName={cn('font-mono font-medium', statusTone)}
          />
          <AnalyticsField
            label={t('timestamp')}
            value={formatTimestamp(entry.request_timestamp, locale)}
          />
          <AnalyticsField
            label={t('duration')}
            value={formatDurationMs(entry.duration_ms)}
            valueClassName="font-mono"
          />
          <AnalyticsField
            label={t('requestSize')}
            value={formatRequestSize(entry.request_size_bytes, t('noBody'))}
            valueClassName={
              entry.request_size_bytes === null ? 'text-muted-foreground' : 'font-mono'
            }
          />
          <AnalyticsField
            label={t('responseSize')}
            value={formatBytes(entry.response_size_bytes)}
            valueClassName="font-mono"
          />
          <AnalyticsField
            label={t('errorDetails')}
            value={entry.error_details ?? t('noError')}
            valueClassName={entry.error_details ? 'text-destructive' : 'text-muted-foreground'}
          />
        </dl>

        {requestHeaders ? (
          <div className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">{t('requestHeaders')}</h2>
            <pre className="border-border bg-muted/30 overflow-x-auto rounded-xl border p-4 font-mono text-xs">
              {requestHeaders}
            </pre>
          </div>
        ) : null}

        {responseHeaders ? (
          <div className="space-y-2">
            <h2 className="text-foreground text-lg font-semibold">{t('responseHeaders')}</h2>
            <pre className="border-border bg-muted/30 overflow-x-auto rounded-xl border p-4 font-mono text-xs">
              {responseHeaders}
            </pre>
          </div>
        ) : null}
      </section>
    </main>
  );
}
