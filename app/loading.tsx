/**
 * Global loading UI for App Router.
 * This wraps all segments in a Suspense boundary, satisfying
 * the requirement when using useSearchParams in child routes.
 * Docs: loading.tsx creates default Suspense fallback for the segment [^5].
 */

export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Loading...
        </p>
      </div>
    </div>
  )
}
