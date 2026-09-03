const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const accessClientId = import.meta.env.CF_ACCESS_CLIENT_ID?.trim()
const accessClientSecret = import.meta.env.CF_ACCESS_CLIENT_SECRET?.trim()

if (Boolean(accessClientId) !== Boolean(accessClientSecret)) {
  throw new Error(
    'CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET must be configured together',
  )
}

const accessHeaders: Record<string, string> =
  accessClientId && accessClientSecret
    ? {
        'CF-Access-Client-Id': accessClientId,
        'CF-Access-Client-Secret': accessClientSecret,
      }
    : {}

// Same-origin /api remains the default for local and proxy-based deployments.
// Static deployments can point directly at a separately hosted API by setting
// VITE_API_BASE_URL at build time.
const API_BASE_URL = (configuredApiBaseUrl || '/api').replace(/\/+$/, '')

export async function request<ResponseType>(
  path: string,
  options: RequestInit = {},
): Promise<ResponseType> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...accessHeaders,
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
