"use client";

import { ErrorFallback } from "@/components/error-fallback";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <ErrorFallback resetErrorBoundary={reset} />
    </div>
  );
}
