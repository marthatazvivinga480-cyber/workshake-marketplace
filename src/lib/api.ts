export type ApiCategory = { slug: string; name: string; short: string }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}

export const api = {
  health: () => request<{ ok: boolean; service: string }>('/api/health'),
  categories: () => request<{ categories: ApiCategory[] }>('/api/categories'),
  searchSuggestions: (query: string) =>
    request<{ suggestions: string[] }>(`/api/search-suggestions?q=${encodeURIComponent(query)}`),
}
