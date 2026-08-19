const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

// Production API traffic must stay on the frontend origin. The preview server
// proxies /api to CORE_API_URL and adds credentials that must not be exposed to
// the browser. Keeping this relative also prevents cross-origin redirects from
// surfacing as misleading browser CORS failures.
const API_BASE_URL = (
  import.meta.env.PROD ? '/api' : configuredApiBaseUrl || '/api'
).replace(/\/+$/, '')

export async function request<ResponseType>(
  path: string,
  options: RequestInit = {},
): Promise<ResponseType> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const body = await response.json()
      message =
        typeof body.detail === 'string'
          ? body.detail
          : JSON.stringify(body.detail)
    } catch {
      // Keep the status-based message when the response is not JSON.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as ResponseType
  }

  return response.json()
}
