'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('Unhandled application error', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-4 text-red-700">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-semibold text-foreground">Something went wrong</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        SafariCharge hit an unexpected error. The issue has been logged so we can investigate it.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.assign('/')}>
          Return home
        </Button>
      </div>
    </main>
  );
}
