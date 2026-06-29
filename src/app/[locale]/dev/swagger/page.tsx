import { notFound } from 'next/navigation';

import { DevSwaggerPanel } from './panel';

export default function DevSwaggerPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <main className="bg-background flex flex-1 px-6 py-10">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">Development tool</p>
          <h1 className="text-foreground text-3xl font-semibold tracking-tight">
            Swagger request smoke test
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Use this temporary page to verify request execution, development sign-in, analytics
            recording, and sign-out before the real Swagger UI and auth screens are implemented.
          </p>
        </div>
        <DevSwaggerPanel />
      </section>
    </main>
  );
}
