export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')

  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error((errorData as { error?: string }).error || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}
