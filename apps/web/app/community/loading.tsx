export default function CommunityLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8" aria-busy="true" aria-label="Loading community...">
      {/* Header + new post button */}
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Post cards */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-gray-200 p-6 dark:bg-gray-700">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="h-4 w-32 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="mb-2 h-5 w-3/4 rounded bg-gray-300 dark:bg-gray-600" />
            <div className="h-4 w-full rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
