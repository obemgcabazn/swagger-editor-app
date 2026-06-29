'use client';

import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ExecutePayload = {
  body: string | null;
  headers: Record<string, string>;
  method: 'GET';
  url: string;
};

type ActionResult = {
  label: string;
  payload: unknown;
};

const UNAUTHENTICATED_REQUEST: ExecutePayload = {
  body: null,
  headers: {},
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/todos/1',
};

const AUTHENTICATED_REQUEST: ExecutePayload = {
  body: null,
  headers: {},
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
};

export function DevSwaggerPanel() {
  const [isPending, startTransition] = useTransition();
  const [lastActionLabel, setLastActionLabel] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  function runAction(label: string, action: () => Promise<unknown>) {
    setLastActionLabel(label);

    startTransition(async () => {
      try {
        setResult({
          label,
          payload: await action(),
        });
      } catch (error) {
        setResult({
          label,
          payload: {
            error: error instanceof Error ? error.message : 'Action failed',
          },
        });
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <div className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4">
        <Button
          className={getActionButtonClass(lastActionLabel, 'Execute without auth')}
          disabled={isPending}
          onClick={() =>
            runAction('Execute without auth', () => executeRequest(UNAUTHENTICATED_REQUEST))
          }
          type="button"
          variant="outline"
        >
          1. Execute without auth
        </Button>
        <Button
          className={getActionButtonClass(lastActionLabel, 'Development sign-in')}
          disabled={isPending}
          onClick={() => runAction('Development sign-in', devSignIn)}
          type="button"
          variant="outline"
        >
          2. Dev sign-in
        </Button>
        <Button
          className={getActionButtonClass(lastActionLabel, 'Execute with auth')}
          disabled={isPending}
          onClick={() =>
            runAction('Execute with auth', () => executeRequest(AUTHENTICATED_REQUEST))
          }
          type="button"
          variant="outline"
        >
          3. Execute with auth
        </Button>
        <Button
          className={getActionButtonClass(lastActionLabel, 'Development sign-out')}
          disabled={isPending}
          onClick={() => runAction('Development sign-out', devSignOut)}
          type="button"
          variant="outline"
        >
          4. Dev sign-out
        </Button>
      </div>
      <section className="border-border bg-card min-h-96 rounded-xl border p-4">
        <h2 className="text-foreground text-lg font-semibold">
          {result?.label ?? 'No action executed yet'}
        </h2>
        <pre className="bg-muted text-muted-foreground mt-4 max-h-[36rem] overflow-auto rounded-lg p-4 text-xs">
          {result ? JSON.stringify(result.payload, null, 2) : 'Click a button to run a smoke test.'}
        </pre>
      </section>
    </div>
  );
}

function getActionButtonClass(lastActionLabel: string | null, buttonLabel: string) {
  return cn(
    'justify-start',
    lastActionLabel === buttonLabel && 'border-primary bg-muted text-foreground'
  );
}

async function executeRequest(payload: ExecutePayload) {
  return postJson('/api/requests/execute', payload);
}

async function devSignIn() {
  return postJson('/api/dev/sign-in');
}

async function devSignOut() {
  return postJson('/api/dev/sign-out');
}

async function postJson(path: string, body?: unknown) {
  const response = await fetch(path, {
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    method: 'POST',
  });
  const payload = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    payload,
  };
}
