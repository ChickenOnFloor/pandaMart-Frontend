const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const error = await response.json()
        throw new Error(error.message || `API error: ${response.statusText}`)
      } else {
        throw new Error(`API error: ${response.statusText}. Make sure backend server is running.`)
      }
    }

    return response.json()
  } catch (err) {
    // Network error or other fetch failure
    if (err instanceof TypeError) {
      throw new Error('Failed to connect to server. Ensure the backend is running.')
    }
    throw err
  }
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'GET' })
}

export async function post<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function put<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
}

export async function patch<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiCall<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function del<T>(endpoint: string): Promise<T> {
  return apiCall<T>(endpoint, { method: 'DELETE' })
}