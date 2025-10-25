export async function apiFetch<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
  }

  // IMPORTANT: include credentials so browser sends cookies
  const res = await fetch(url, { ...options, headers, credentials: 'include' })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    throw new Error((errorData as { error?: string }).error || `Request failed: ${res.status}`)
  }

  return res.json() as Promise<T>
}
