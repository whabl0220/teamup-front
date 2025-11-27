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
  // User APIs
  getMe: () => fetchAPI('/users/me'),
  getUser: (id: string) => fetchAPI(`/users/${id}`),

  // Team APIs (여러 팀 지원)
  getMyTeams: () => fetchAPI('/teams/my'), // 내가 속한 모든 팀
  getTeam: (id: string) => fetchAPI(`/teams/${id}`),
  searchTeams: (query: string, filters?: { region?: string; level?: string }) =>
    fetchAPI(`/teams/search?q=${query}&region=${filters?.region || ''}&level=${filters?.level || ''}`),

  // 팀 생성 (AI 매칭용 데이터 포함)
  createTeam: (data: {
    name: string;
    region: string;
    level: string;
    preferredTime?: string | null;
    playStyle?: string | null;
    gameFrequency?: string | null;
    teamMood?: string | null;
    travelDistance?: string | null;
    maxMembers?: number;
    description?: string;
  }) => fetchAPI('/teams', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  leaveTeam: (teamId: string) => fetchAPI(`/teams/${teamId}/leave`, {
    method: 'POST',
  }),

  // Team Detail & Join APIs
  getTeamDetail: (teamId: string) => fetchAPI(`/teams/${teamId}/detail`),
  getTeamMembers: (teamId: string) => fetchAPI(`/teams/${teamId}/members`),
  checkTeamMembership: (teamId: string) => fetchAPI(`/teams/${teamId}/is-member`),

  // 팀 참여 요청
  joinTeam: (teamId: string, data?: { message?: string }) =>
    fetchAPI(`/teams/${teamId}/join`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // 팀장 연락처 (참여 승인 후에만)
  getTeamContact: (teamId: string) => fetchAPI(`/teams/${teamId}/contact`),

  // Match Request APIs
  getMatchRequests: () => fetchAPI('/match-requests/received'), // 받은 매칭 요청
  getSentMatchRequests: () => fetchAPI('/match-requests/sent'), // 보낸 매칭 요청
  sendMatchRequest: (toTeamId: string, fromTeamId: string, message: string) =>
    fetchAPI('/match-requests', {
      method: 'POST',
      body: JSON.stringify({ toTeamId, fromTeamId, message }),
    }),
  acceptMatchRequest: (requestId: string) =>
    fetchAPI(`/match-requests/${requestId}/accept`, {
      method: 'PUT',
    }),
  rejectMatchRequest: (requestId: string) =>
    fetchAPI(`/match-requests/${requestId}/reject`, {
      method: 'PUT',
    }),

  // Notification APIs
  getNotifications: () => fetchAPI('/notifications'),
  markNotificationAsRead: (notificationId: string) =>
    fetchAPI(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    }),
  markAllNotificationsAsRead: () =>
    fetchAPI('/notifications/read-all', {
      method: 'PUT',
    }),

  // AI APIs (AI 팀 연동)
  // AI가 유저와 팀 간의 매칭 적합도 분석
  getMatchScore: (userId: string, teamId: string) =>
    fetchAPI('/ai/match-score', {
      method: 'POST',
      body: JSON.stringify({ userId, teamId }),
    }),

  // AI 코칭 리포트 생성
  generateCoachingReport: (gameId: string) =>
    fetchAPI('/ai/coaching-report', {
      method: 'POST',
      body: JSON.stringify({ gameId }),
    }),

  // AI 기반 팀 추천
  getRecommendedTeams: (userId: string) =>
    fetchAPI(`/ai/recommend-teams?userId=${userId}`),
};
