// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch wrapper with error handling
async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// API 함수들 (백엔드 연동 시 사용)
export const api = {
  // Team APIs
  getTeam: (id: string) => fetchAPI(`/teams/${id}`),
  getMyTeam: () => fetchAPI('/teams/my'),

  // Matching APIs
  getMatches: () => fetchAPI('/matches'),
  createMatch: (data: any) => fetchAPI('/matches', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // User APIs
  getUser: (id: string) => fetchAPI(`/users/${id}`),
  getMe: () => fetchAPI('/users/me'),
};
