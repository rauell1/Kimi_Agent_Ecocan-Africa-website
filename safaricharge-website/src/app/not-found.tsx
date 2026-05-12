import Link from 'next/link';
import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-full bg-[var(--secondary)] p-4 text-[var(--primary)]">
        <MapPinned className="h-8 w-8" />
      </div>
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--primary)]">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-3 max-w-xl text-sm text-muted-foreground">
        The page you requested is not available in this SafariCharge deployment.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Go to homepage</Link>
      </Button>
    </main>
  );
}
