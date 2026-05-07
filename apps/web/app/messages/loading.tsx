export default function MessagesLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8" aria-busy="true" aria-label="Loading messages...">
      <div className="mb-6 h-8 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />

      {/* Conversation rows */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-4 rounded-xl bg-gray-200 p-4 dark:bg-gray-700">
            <div className="h-12 w-12 shrink-0 rounded-full bg-gray-300 dark:bg-gray-600" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-gray-300 dark:bg-gray-600" />
              <div className="h-3 w-60 rounded bg-gray-300 dark:bg-gray-600" />
            </div>
            <div className="h-3 w-12 rounded bg-gray-300 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
