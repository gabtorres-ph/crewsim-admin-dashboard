const DEFAULT_BATCH_SIZE = 100
const DEFAULT_MAX_RECORDS = 10_000

type OffsetPageFetcher<T> = (params: {
  offset: number
  limit: number
}) => Promise<T[]>

type NumberedPageFetcher<T> = (params: {
  page: number
  limit: number
}) => Promise<{ items: T[]; total: number }>

type FetchAllOptions = {
  batchSize?: number
  maxRecords?: number
}

/**
 * Collects every record from an offset/limit endpoint by requesting batches
 * until one comes back short. Throws once `maxRecords` is exceeded so a
 * dataset that outgrows client-side pagination fails loudly instead of
 * silently truncating.
 */
export async function fetchAllOffsetPages<T>(
  fetchPage: OffsetPageFetcher<T>,
  {
    batchSize = DEFAULT_BATCH_SIZE,
    maxRecords = DEFAULT_MAX_RECORDS,
  }: FetchAllOptions = {},
): Promise<T[]> {
  const records: T[] = []

  while (true) {
    const batch = await fetchPage({ offset: records.length, limit: batchSize })
    records.push(...batch)

    if (batch.length < batchSize) return records

    if (records.length >= maxRecords) {
      throw new RangeError(
        `At least ${maxRecords.toLocaleString("en-US")} records were returned; this list needs server-side pagination.`,
      )
    }
  }
}

/**
 * Collects records from a page/limit endpoint that reports a `total`, up to
 * `maxRecords`. The returned `total` lets callers disclose any truncation.
 */
export async function fetchAllNumberedPages<T>(
  fetchPage: NumberedPageFetcher<T>,
  {
    batchSize = DEFAULT_BATCH_SIZE,
    maxRecords = DEFAULT_MAX_RECORDS,
  }: FetchAllOptions = {},
): Promise<{ items: T[]; total: number }> {
  const firstPage = await fetchPage({ page: 1, limit: batchSize })
  const targetCount = Math.min(firstPage.total, maxRecords)
  const pageCount = Math.ceil(targetCount / batchSize)

  const remainingPages = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, index) =>
      fetchPage({ page: index + 2, limit: batchSize }),
    ),
  )

  const items = [firstPage, ...remainingPages]
    .flatMap((page) => page.items)
    .slice(0, targetCount)

  return { items, total: firstPage.total }
}
