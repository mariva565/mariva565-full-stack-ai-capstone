export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" aria-busy="true" aria-label="Loading admin panel...">
      <div className="mb-8 h-8 w-44 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Stats cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700">
        <div className="h-12 rounded-t-2xl bg-gray-300 dark:bg-gray-600" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-t border-gray-300 p-4 dark:border-gray-600">
            <div className="h-4 w-3/4 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
