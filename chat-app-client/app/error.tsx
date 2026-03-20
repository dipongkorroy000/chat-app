"use client";

export const dynamic = "force-dynamic";

export default function ErrorPage({error, reset}: {error: Error; reset: () => void}) {
  return (
    <div className="min-h-screen flex items-center items-center justify-center bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
        <p className="text-sm text-gray-300 mb-4">{error?.message || "Unknown error"}</p>
        <button onClick={() => reset()} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500">
          Try again
        </button>
      </div>
    </div>
  );
}
