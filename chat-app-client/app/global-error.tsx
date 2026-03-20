"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const canReset = typeof reset === "function";

  return (
    // `global-error.tsx` replaces the root layout, so it must define its own <html> and <body>.
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-gray-300">
              {error?.message || "Unknown error"}
            </p>
            <button
              onClick={canReset ? () => reset() : undefined}
              disabled={!canReset}
              className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
