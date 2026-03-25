const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number>
}

async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options

  let url = `${API_URL}${endpoint}`
  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    )
    url += `?${qs.toString()}`
  }

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })

  const data = await res.json() as T
  return data
}

export const api = {
  get: <T>(endpoint: string, params?: Record<string, string | number>) =>
    apiFetch<T>(endpoint, { method: 'GET', params }),
  post: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}
