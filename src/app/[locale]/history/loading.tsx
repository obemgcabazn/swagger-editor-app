export default function HistoryLoading() {
  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <div className="bg-muted h-10 w-64 animate-pulse rounded" />
          <div className="bg-muted h-5 w-96 max-w-full animate-pulse rounded" />
        </div>
        <div className="space-y-3" aria-hidden="true">
          <div className="bg-muted h-4 w-40 animate-pulse rounded" />
          <div className="bg-muted h-24 animate-pulse rounded-xl" />
          <div className="bg-muted h-24 animate-pulse rounded-xl" />
        </div>
      </section>
    </main>
  );
}
