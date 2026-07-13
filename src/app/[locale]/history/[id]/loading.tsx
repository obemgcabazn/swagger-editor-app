export default function HistoryDetailLoading() {
  return (
    <main className="bg-background flex flex-1 px-6 py-16">
      <section className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-4">
          <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          <div className="space-y-2">
            <div className="bg-muted h-10 w-72 animate-pulse rounded" />
            <div className="bg-muted h-5 w-full max-w-xl animate-pulse rounded" />
          </div>
        </div>
        <div className="border-border space-y-4 rounded-xl border px-4 py-2 sm:px-6">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="border-border grid gap-2 border-b py-4 sm:grid-cols-[12rem_1fr]"
              key={index}
            >
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
