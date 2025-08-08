export default function Loading() {
  // Route-level fallback for app/search.
  // This provides a Suspense boundary for any Client Component using useSearchParams.
  return (
    <main
      className="mx-auto max-w-6xl p-4 md:p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <h1 className="sr-only">Loading search results</h1>

      {/* Filters / search bar skeleton */}
      <section className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="h-10 w-full max-w-md animate-pulse rounded-md bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-10 w-28 animate-pulse rounded-md bg-gray-200" />
            <div className="h-10 w-28 animate-pulse rounded-md bg-gray-200" />
            <div className="hidden h-10 w-28 animate-pulse rounded-md bg-gray-200 md:block" />
          </div>
        </div>
      </section>

      {/* Results grid skeleton */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <article
            key={i}
            aria-label="Loading listing"
            className="overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="h-40 w-full animate-pulse bg-gray-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 flex items-center gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
