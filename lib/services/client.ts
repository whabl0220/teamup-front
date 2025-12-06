// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// 토큰 관리 (localStorage)
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

export const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('access_token', token)
}

export const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

// Fetch 공통 로직 추출
async function baseFetch(endpoint: string, options?: RequestInit, timeout = 30000) {
  const token = getAccessToken();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.statusText}`);
    }
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Fetch wrapper (JSON 응답)
export async function fetchAPI<T = unknown>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await baseFetch(endpoint, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API Error: ${response.statusText}`);
  }
  const contentLength = response.headers.get('content-length');
  if (response.status === 204 || contentLength === '0') {
    return undefined as T;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// Fetch wrapper (Text 응답)
export async function fetchText(endpoint: string, options?: RequestInit): Promise<string> {
  const response = await baseFetch(endpoint, options);
  return response.text();
}


// GET 요청
export async function get<T = unknown>(endpoint: string): Promise<T> {
  return fetchAPI<T>(endpoint, { method: 'GET' })
}

// POST 요청
export async function post<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// PUT 요청
export async function put<T = unknown>(
  endpoint: string,
  data?: unknown
): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

// DELETE 요청
export async function del<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
  return fetchAPI<T>(endpoint, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}
