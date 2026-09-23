export default function AccountsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading accounts">
      <div className="h-7 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-10 space-y-3">
        <div className="h-8 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-800">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-10 animate-pulse border-b border-gray-200 bg-gray-50 last:border-b-0 dark:border-gray-800 dark:bg-gray-900"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
