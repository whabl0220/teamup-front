// Team Types
export interface Team {
  id: string;
  name: string;
  shortName: string;
  memberCount: number;
  maxMembers: number; // 최대 인원 (보통 5명)
  level: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  region: string; // 활동 지역
  totalGames: number;
  aiReports: number;
  activeDays: number;
  logo?: string;
  description?: string;
  isOfficial: boolean; // 정식 팀 여부 (5명 모집 완료)
  captainId: string; // 팀장 ID
  matchScore?: number; // AI 매칭 점수 (0-100)
}

// AI Coaching Types
export interface AICoaching {
  id: string;
  date: string;
  matchTitle: string;
  opponent: string;
  result: 'win' | 'lose' | 'draw';
  strength: string;
  improvement: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'message' | 'match' | 'report' | 'member';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  teams: Team[]; // 여러 팀 소속 가능
  currentTeamId?: string; // 현재 활성화된 팀
}

// Match Request Types
export interface MatchRequest {
  id: string;
  fromTeam: Team; // 요청한 팀
  toTeam: Team; // 요청받은 팀
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  respondedAt?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'match_request' | 'match_accepted' | 'match_rejected' | 'team_invite';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // 관련 매칭 요청 ID 등
}

// Team Creation Types (AI 매칭용)
export interface TeamCreationData {
  // 필수 항목
  name: string;
  region: string;
  level: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';

  // 선택 항목 (null = 상관없음)
  preferredTime?: 'weekday_morning' | 'weekday_afternoon' | 'weekday_evening'
                | 'weekend_morning' | 'weekend_afternoon' | 'weekend_evening' | null;
  playStyle?: 'fast_attack' | 'defense' | 'balanced' | 'three_point' | 'inside' | null;
  gameFrequency?: 'week_1' | 'week_2_3' | 'week_4_plus' | 'month_1_2' | null;
  teamMood?: 'competitive' | 'friendly' | 'improvement' | 'casual' | null;
  travelDistance?: 'local_only' | 'nearby_5km' | 'seoul_all' | 'metropolitan' | null;

  // 기타
  logo?: string;
  description?: string;
  maxMembers?: number;
}
