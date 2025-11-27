# TeamUp API 명세서

백엔드 및 AI 팀과 연동을 위한 API 명세입니다.

## 🔧 환경 변수 설정

```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_AI_API_URL=http://localhost:8001
```

---

## 📋 백엔드 API

### 1. 사용자 (User)

#### GET `/api/users/me`
현재 로그인한 사용자 정보 조회

**Response:**
```json
{
  "id": "user1",
  "name": "홍길동",
  "email": "hong@example.com",
  "kakaoId": "kakao123",
  "teams": ["team1", "team2"]
}
```

---

### 2. 팀 (Team)

#### GET `/api/teams/my`
내가 속한 모든 팀 조회

**Response:**
```json
[
  {
    "id": "team1",
    "name": "세종 born",
    "shortName": "SB",
    "level": "A",
    "region": "광진구 능동",
    "memberCount": 5,
    "maxMembers": 5,
    "totalGames": 18,
    "aiReports": 14,
    "isOfficial": true,
    "captainId": "user1"
  }
]
```

#### GET `/api/teams/search?q={query}&region={region}&level={level}`
팀 검색

**Query Parameters:**
- `q`: 검색어 (팀 이름)
- `region`: 지역 필터 (선택)
- `level`: 레벨 필터 (선택)

**Response:**
```json
[
  {
    "id": "team2",
    "name": "세종 Warriors",
    "shortName": "SW",
    "level": "A",
    "region": "광진구 능동",
    "memberCount": 5,
    "maxMembers": 5,
    "description": "주말 오후에 활동하는 친목 위주 팀",
    "matchScore": 95  // AI가 계산한 매칭 점수
  }
]
```

#### POST `/api/teams`
팀 생성

**Request Body:**
```json
{
  "name": "세종 Warriors",
  "region": "광진구 능동",
  "level": "A",
  "maxMembers": 5,
  "description": "주말 오후에 활동하는 친목 위주 팀",

  // AI 매칭용 선택 데이터
  "preferredTime": "weekend_afternoon",
  "playStyle": "fast_attack",
  "gameFrequency": "week_2_3",
  "teamMood": "friendly",
  "travelDistance": "nearby_5km"
}
```

**Response:**
```json
{
  "id": "team3",
  "name": "세종 Warriors",
  "shortName": "SW",
  "createdAt": "2025-01-20T10:30:00Z"
}
```

---

### 3. 팀 상세 및 참여

#### GET `/api/teams/:teamId/detail`
팀 상세 정보 조회

**Response:**
```json
{
  "id": "team2",
  "name": "세종 Warriors",
  "shortName": "SW",
  "level": "A",
  "region": "광진구 능동",
  "memberCount": 5,
  "maxMembers": 5,
  "totalGames": 18,
  "aiReports": 14,
  "isOfficial": true,
  "description": "주말 오후에 활동하는 친목 위주 팀",
  "preferredTime": "주말 오후 (14:00 - 18:00)",
  "playStyle": "빠른 공격",
  "gameFrequency": "주 2-3회"
}
```

#### GET `/api/teams/:teamId/members`
팀원 목록 조회

**Response:**
```json
[
  {
    "id": "user1",
    "name": "김철수",
    "position": "포워드",
    "isLeader": true,
    "joinedAt": "2025-01-01T00:00:00Z"
  },
  {
    "id": "user2",
    "name": "이영희",
    "position": "가드",
    "isLeader": false,
    "joinedAt": "2025-01-05T00:00:00Z"
  }
]
```

#### GET `/api/teams/:teamId/is-member`
현재 유저가 팀 멤버인지 확인

**Response:**
```json
{
  "isMember": true
}
```

#### POST `/api/teams/:teamId/join`
팀 참여 요청

**Request Body:**
```json
{
  "userId": "user3",
  "message": "참여하고 싶습니다!" // 선택
}
```

**Response:**
```json
{
  "status": "pending",  // pending | approved | rejected
  "requestId": "req123"
}
```

#### GET `/api/teams/:teamId/contact`
팀장 연락처 (참여 승인 후에만)

**Response:**
```json
{
  "kakaoId": "kakao_captain123"
}
```
**Error (403):** 팀 멤버가 아닌 경우
```json
{
  "error": "Not a team member"
}
```

#### POST `/api/teams/:teamId/leave`
팀 탈퇴

---

### 4. 매칭 요청 (Match Request)

#### GET `/api/match-requests/received`
받은 매칭 요청 목록

**Response:**
```json
[
  {
    "id": "req1",
    "fromTeam": {
      "id": "team3",
      "name": "송파 Dunk",
      "level": "A",
      "region": "송파구 잠실"
    },
    "toTeam": {
      "id": "team1",
      "name": "세종 born"
    },
    "message": "이번 주말 경기 어떠신가요?",
    "status": "pending",
    "createdAt": "2025-01-20T10:00:00Z"
  }
]
```

#### GET `/api/match-requests/sent`
보낸 매칭 요청 목록

#### POST `/api/match-requests`
매칭 요청 보내기

**Request Body:**
```json
{
  "fromTeamId": "team1",
  "toTeamId": "team2",
  "message": "경기 한 번 하시죠!"
}
```

#### PUT `/api/match-requests/:requestId/accept`
매칭 요청 수락

**Response:**
```json
{
  "status": "accepted",
  "captainKakaoId": "kakao_captain456"  // 상대 팀장 카카오톡 ID
}
```

#### PUT `/api/match-requests/:requestId/reject`
매칭 요청 거절

---

### 5. 알림 (Notification)

#### GET `/api/notifications`
알림 목록

**Response:**
```json
[
  {
    "id": "noti1",
    "type": "match_request",  // match_request | join_request | game_result
    "title": "새로운 매칭 요청",
    "message": "송파 Dunk 팀이 매칭을 요청했습니다",
    "isRead": false,
    "createdAt": "2025-01-20T10:00:00Z",
    "relatedId": "req1"  // 관련 요청/경기 ID
  }
]
```

#### PUT `/api/notifications/:id/read`
알림 읽음 처리

#### PUT `/api/notifications/read-all`
모든 알림 읽음 처리

---

## 🤖 AI API

### 1. 매칭 점수 계산

#### POST `/api/ai/match-score`
유저와 팀 간의 매칭 적합도 분석

**Request Body:**
```json
{
  "userId": "user1",
  "teamId": "team2"
}
```

**Response:**
```json
{
  "matchScore": 95,  // 0-100 점수
  "reasons": [
    "실력 레벨이 유사합니다 (A ↔ A)",
    "활동 지역이 가깝습니다 (광진구)",
    "플레이 스타일이 일치합니다 (빠른 공격)"
  ],
  "recommendation": "매우 적합한 팀입니다!"
}
```

**AI 계산 로직 (참고용):**
- 실력 레벨 유사도: 30%
- 지역 거리: 25%
- 플레이 스타일 일치: 20%
- 선호 시간대 일치: 15%
- 팀 분위기 일치: 10%

---

### 2. 팀 추천

#### GET `/api/ai/recommend-teams?userId={userId}`
AI 기반 팀 추천

**Response:**
```json
[
  {
    "teamId": "team2",
    "name": "세종 Warriors",
    "matchScore": 95,
    "reason": "실력 레벨과 플레이 스타일이 잘 맞습니다"
  },
  {
    "teamId": "team3",
    "name": "강남 Thunder",
    "matchScore": 92,
    "reason": "활동 지역이 가깝고 선호 시간대가 일치합니다"
  }
]
```

---

### 3. AI 코칭 리포트

#### POST `/api/ai/coaching-report`
경기 영상 분석 후 AI 코칭 리포트 생성

**Request Body:**
```json
{
  "gameId": "game123",
  "videoUrl": "https://example.com/game-video.mp4"  // 선택
}
```

**Response:**
```json
{
  "reportId": "report456",
  "gameId": "game123",
  "summary": "이번 경기는 수비에서 강점을 보였습니다",
  "strengths": [
    "빠른 전환 공격",
    "효과적인 리바운드"
  ],
  "improvements": [
    "3점슛 성공률 개선 필요",
    "턴오버 감소 필요"
  ],
  "stats": {
    "fieldGoalPercentage": 45.2,
    "threePointPercentage": 32.1,
    "rebounds": 38,
    "assists": 22,
    "turnovers": 15
  },
  "createdAt": "2025-01-20T15:00:00Z"
}
```

---

## 📊 데이터 모델

### Team (팀)
```typescript
interface Team {
  id: string
  name: string
  shortName: string          // 2-3자 약칭 (예: "SW")
  level: string              // A+, A, B+, B, C+, C, D
  region: string             // "광진구 능동"
  memberCount: number
  maxMembers: number
  totalGames: number
  aiReports: number
  activeDays: number
  isOfficial: boolean        // 정식 팀 여부
  captainId: string
  description?: string

  // AI 매칭용 데이터 (선택)
  preferredTime?: string     // "weekend_afternoon"
  playStyle?: string         // "fast_attack"
  gameFrequency?: string     // "week_2_3"
  teamMood?: string          // "friendly"
  travelDistance?: string    // "nearby_5km"

  matchScore?: number        // AI 계산 매칭 점수 (0-100)
}
```

### User (사용자)
```typescript
interface User {
  id: string
  name: string
  email: string
  kakaoId: string
  teams: string[]            // 속한 팀 ID 배열
  position?: string          // "포워드", "가드", "센터"
  skillLevel?: string        // "A", "B", "C"
}
```

### MatchRequest (매칭 요청)
```typescript
interface MatchRequest {
  id: string
  fromTeamId: string
  toTeamId: string
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}
```

---

## 🔐 인증

모든 API 요청은 헤더에 인증 토큰이 필요합니다:

```
Authorization: Bearer {token}
```

---

## 🚀 프론트엔드 사용 예시

```typescript
// lib/api.ts 사용
import { api } from '@/lib/api'

// 팀 상세 정보 조회
const teamDetail = await api.getTeamDetail('team2')

// 팀 참여 요청
await api.joinTeam('team2', { message: '참여하고 싶습니다!' })

// AI 매칭 점수 조회
const score = await api.getMatchScore('user1', 'team2')
console.log(score.matchScore) // 95
```

---

## 📝 Mock 데이터 → 실제 API 전환

현재 프론트엔드는 Mock 데이터로 개발되어 있습니다.
백엔드 API가 준비되면 다음 파일들의 주석을 해제하고 연결하세요:

1. `app/(app)/home/page.tsx` - 홈 화면
2. `app/(app)/matching/page.tsx` - 매칭 페이지
3. `app/team/[id]/page.tsx` - 팀 상세 페이지
4. `app/team/create/page.tsx` - 팀 생성

각 파일에 `// TODO: 백엔드 API 호출` 주석으로 표시되어 있습니다.
