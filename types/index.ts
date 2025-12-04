// Team Member Types
export interface TeamMember {
  id: string;
  name: string;
  kakaoId: string;
  position?: string;
  isLeader: boolean;
}

// Team DNA Types
export type TeamDNA = 'BULLS' | 'WARRIORS' | 'SPURS';

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
  members?: TeamMember[]; // 팀원 목록

  // NBA DNA 시스템
  teamDna?: TeamDNA; // Bulls(수비/투지), Warriors(3점/재미), Spurs(패스/기본)
  teamLevel?: number; // 1-99
  teamExp?: number; // 경험치 (100XP마다 레벨업)
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

// Player Card Types (FIFA Style)
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C'; // Point Guard / Shooting Guard / Small Forward / Power Forward / Center
export type PlayStyle = 'SL' | 'SH' | 'DF' | 'PA'; // Slasher / Shooter / Defender / Passer
export type SkillLevel = 'ROOKIE' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'PRO';
export type CardSkin = 'PG_BLUE' | 'SG_CYAN' | 'SF_GREEN' | 'PF_ORANGE' | 'C_PURPLE';

// Skill Level 점수 매핑
export const SKILL_LEVEL_SCORES: Record<SkillLevel, number> = {
  ROOKIE: 10,      // 입문
  BEGINNER: 30,    // 초보
  INTERMEDIATE: 50, // 중수
  ADVANCED: 70,    // 고수
  PRO: 90          // 선출
};

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  team?: Team; // 한 팀만 소속 가능 (optional - 팀이 없을 수도 있음)

  // Player Card 정보 (FIFA 스타일)
  height?: number; // 키 (cm)
  position?: Position; // 주 포지션
  subPosition?: Position; // 부 포지션
  playStyle?: PlayStyle; // 플레이 스타일
  skillLevel?: SkillLevel; // @deprecated - 더 이상 사용하지 않음 (UI에서 제거됨)
  cardSkin?: CardSkin; // 카드 디자인 등급
  statusMsg?: string; // 한 줄 각오 (20자 이내)
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

// Matched Team Types (수락된 매칭)
export interface MatchedTeam {
  id: string;
  myTeamId: string; // 내 팀 ID
  matchedTeam: Team; // 매칭된 상대 팀
  matchedAt: string; // 매칭 성사 날짜
  requestId: string; // 원본 매칭 요청 ID
}

// Join Request Types (팀 참여 요청)
export interface JoinRequest {
  id: string;
  userId: string; // 요청한 사용자 ID
  userName: string; // 요청한 사용자 이름
  teamId: string; // 참여하려는 팀 ID
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

// Map Types
export interface Court {
  id: string;
  name: string;
  address: string;
  type: '실내' | '실외';
  lat: number;
  lng: number;
  distance?: number; // 사용자로부터의 거리 (km)
}

export interface NearbyTeam {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string; // "광진구 능동로"
  level: 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D';
  isOfficial: boolean; // 정식 팀 여부
  members: number;
  maxMembers: number;
  lat?: number;
  lng?: number;
  distance?: number; // 사용자로부터의 거리 (km)
}

export interface UserLocation {
  lat: number;
  lng: number;
  address?: string;
}

// Post Types (지도 모집글)
export type PostType = 'MATCH' | 'GUEST'; // 팀대결 / 용병

export interface Post {
  id: string;
  type: PostType; // MATCH (팀 경기 모집) / GUEST (용병 모집)
  teamId: string; // 작성한 팀 ID
  teamName: string; // 팀 이름
  latitude: number; // 위도
  longitude: number; // 경도
  gameTime: string; // 경기 시작 시간
  location: string; // 장소명 (예: 광진 농구장)
  kakaoLink: string; // 카카오톡 오픈채팅방 URL
  description?: string; // 모집 제목 (30자 이내)
  additionalDescription?: string; // 상세 설명 (100자 이내)
  createdAt: string; // 작성 시간
  distance?: number; // 사용자로부터의 거리 (km)
}

// Game Record Types (경기 기록 & AI 코칭)
export type GameResult = 'WIN' | 'LOSE' | 'DRAW';
export type FeedbackTag = 'DEFENSE' | 'OFFENSE' | 'MENTAL' | 'TEAMWORK' | 'STAMINA';

export interface GameRecord {
  id: string;
  teamId: string; // 팀 ID
  teamName: string; // 팀 이름
  opponent: string; // 상대팀 이름
  result: GameResult; // 승/패/무
  feedbackTag: FeedbackTag; // 피드백 태그
  aiComment: string; // AI가 생성한 조언
  gameDate: string; // 경기 날짜
  createdAt: string; // 기록 생성 시간
}
