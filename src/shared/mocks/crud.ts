import { delay, http, HttpResponse } from 'msw'

type Entity = {
  id: number
}

type CrudHandlersOptions<TRead extends Entity, TCreate, TUpdate> = {
  collectionPath: string
  itemPath: string
  notFoundMessage: string
  getItems: () => TRead[]
  setItems: (items: TRead[]) => void
  defaultItem: (input: TCreate) => Omit<TRead, 'id'>
  validateCreate?: (input: TCreate) => Response | null
  validateUpdate?: (input: TUpdate) => Response | null
  filterList?: (items: TRead[], request: Request) => TRead[]
}

const MOCK_DELAY_MS = 250

function parseId(value: string | readonly string[] | undefined) {
  const id = Number(value)
  return Number.isInteger(id) ? id : null
}

function paginate<TItem>(items: TItem[], request: Request) {
  const url = new URL(request.url)
  const offset = Number(url.searchParams.get('offset') ?? 0)
  const limit = Number(url.searchParams.get('limit') ?? 100)

  return items.slice(offset, offset + limit)
}

async function readJson<TInput>(request: Request) {
  try {
    return (await request.json()) as TInput
  } catch {
    return null
  }
}

export function createCrudHandlers<TRead extends Entity, TCreate, TUpdate>({
  collectionPath,
  itemPath,
  notFoundMessage,
  getItems,
  setItems,
  defaultItem,
  validateCreate,
  validateUpdate,
  filterList,
}: CrudHandlersOptions<TRead, TCreate, TUpdate>) {
  return [
    http.get(collectionPath, async ({ request }) => {
      await delay(MOCK_DELAY_MS)
      const items = filterList ? filterList(getItems(), request) : getItems()
      return HttpResponse.json(paginate(items, request).map((item) => ({ ...item })))
    }),

    http.get(itemPath, async ({ params }) => {
      await delay(MOCK_DELAY_MS)
      const id = parseId(params.id)
      const item = id === null
        ? undefined
        : getItems().find((candidate) => candidate.id === id)

      if (!item) {
        return HttpResponse.json({ detail: notFoundMessage }, { status: 404 })
      }

      return HttpResponse.json({ ...item })
    }),

    http.post(collectionPath, async ({ request }) => {
      await delay(MOCK_DELAY_MS)
      const input = await readJson<TCreate>(request)

      if (!input) {
        return HttpResponse.json({ detail: 'Invalid request body.' }, { status: 422 })
      }

      const validationError = validateCreate?.(input)

      if (validationError) {
        return validationError
      }

      const items = getItems()
      const item = {
        ...defaultItem(input),
        id: Math.max(0, ...items.map(({ id }) => id)) + 1,
      } as TRead

      setItems([...items, item])
      return HttpResponse.json({ ...item }, { status: 201 })
    }),

    http.patch(itemPath, async ({ params, request }) => {
      await delay(MOCK_DELAY_MS)
      const id = parseId(params.id)
      const items = getItems()
      const itemIndex = id === null
        ? -1
        : items.findIndex((candidate) => candidate.id === id)

      if (itemIndex === -1 || id === null) {
        return HttpResponse.json({ detail: notFoundMessage }, { status: 404 })
      }

      const input = await readJson<TUpdate>(request)

      if (!input) {
        return HttpResponse.json({ detail: 'Invalid request body.' }, { status: 422 })
      }

      const validationError = validateUpdate?.(input)

      if (validationError) {
        return validationError
      }

      const updatedItem = { ...items[itemIndex], ...input, id } as TRead
      const nextItems = [...items]
      nextItems[itemIndex] = updatedItem
      setItems(nextItems)

      return HttpResponse.json({ ...updatedItem })
    }),

    http.delete(itemPath, async ({ params }) => {
      await delay(MOCK_DELAY_MS)
      const id = parseId(params.id)
      const items = getItems()
      const itemIndex = id === null
        ? -1
        : items.findIndex((candidate) => candidate.id === id)

      if (itemIndex === -1 || id === null) {
        return HttpResponse.json({ detail: notFoundMessage }, { status: 404 })
      }

      const nextItems = [...items]
      nextItems.splice(itemIndex, 1)
      setItems(nextItems)

      return new HttpResponse(null, { status: 204 })
    }),
  ]
}
