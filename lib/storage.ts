// localStorage 관리 유틸리티
// 백엔드 연동 전까지 로컬에서 데이터 관리

import type { Team, MatchRequest, MatchedTeam } from '@/types'

// 전체 앱 데이터 구조
export interface AppData {
  user: {
    id: string
    name: string
    currentTeamId?: string // 현재 활성화된 팀
  }
  teams: Team[]
  matchRequests: MatchRequest[]
  matchedTeams: MatchedTeam[] // 매칭 성사된 팀들
}

// 팀원 정보 (Team 타입에 members가 없어서 별도 정의)
export interface TeamMember {
  id: string
  name: string
  kakaoId: string
  position?: string
  isLeader: boolean
}

// localStorage 키
const STORAGE_KEY = 'teamup_app_data'

// 초기 데이터
const getInitialData = (): AppData => ({
  user: {
    id: 'user1',
    name: '사용자', // TODO: 실제 로그인 시 변경
  },
  teams: [],
  matchRequests: [],
  matchedTeams: [],
})

// 데이터 읽기
export const getAppData = (): AppData => {
  if (typeof window === 'undefined') return getInitialData()

  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return getInitialData()
    return JSON.parse(data) as AppData
  } catch (error) {
    console.error('Failed to read app data:', error)
    return getInitialData()
  }
}

// 데이터 쓰기
export const setAppData = (data: AppData): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save app data:', error)
  }
}

// 현재 활성화된 팀 가져오기
export const getCurrentTeam = (): Team | null => {
  const data = getAppData()
  if (!data.user.currentTeamId) return null

  return data.teams.find(t => t.id === data.user.currentTeamId) || null
}

// 팀 추가
export const addTeam = (team: Team): void => {
  const data = getAppData()
  data.teams.push(team)
  data.user.currentTeamId = team.id // 새로 만든 팀을 현재 팀으로 설정
  setAppData(data)
}

// 현재 팀 설정
export const setCurrentTeam = (teamId: string): void => {
  const data = getAppData()
  data.user.currentTeamId = teamId
  setAppData(data)
}

// 매칭 요청 추가
export const addMatchRequest = (request: MatchRequest): void => {
  const data = getAppData()
  data.matchRequests.push(request)
  setAppData(data)
}

// 받은 매칭 요청 가져오기 (최신순)
export const getReceivedMatchRequests = (): MatchRequest[] => {
  const data = getAppData()
  const currentTeam = getCurrentTeam()
  if (!currentTeam) return []

  return data.matchRequests
    .filter(req => req.toTeam.id === currentTeam.id && req.status === 'pending')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// 가장 최근 매칭 요청 1개
export const getLatestMatchRequest = (): MatchRequest | null => {
  const requests = getReceivedMatchRequests()
  return requests.length > 0 ? requests[0] : null
}

// 매칭 요청 상태 변경
export const updateMatchRequestStatus = (
  requestId: string,
  status: 'accepted' | 'rejected'
): void => {
  const data = getAppData()
  const request = data.matchRequests.find(r => r.id === requestId)
  if (request) {
    request.status = status
    request.respondedAt = new Date().toISOString()

    // 수락한 경우 매칭된 팀으로 추가
    if (status === 'accepted') {
      const currentTeam = getCurrentTeam()
      if (currentTeam) {
        // 내 팀 입장에서 매칭된 팀 추가
        const matchedTeam: MatchedTeam = {
          id: `matched_${Date.now()}`,
          myTeamId: currentTeam.id,
          matchedTeam: request.fromTeam, // 요청한 팀이 상대 팀
          matchedAt: new Date().toISOString(),
          requestId: requestId,
        }
        data.matchedTeams.push(matchedTeam)
      }
    }

    setAppData(data)
  }
}

// 매칭된 팀 목록 가져오기
export const getMatchedTeams = (): MatchedTeam[] => {
  const data = getAppData()
  const currentTeam = getCurrentTeam()
  if (!currentTeam) return []

  return data.matchedTeams
    .filter(m => m.myTeamId === currentTeam.id)
    .sort((a, b) => new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime())
}

// 시간 포맷 (2시간 전, 1일 전 등)
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return `${Math.floor(diffDays / 7)}주 전`
}

// Mock 데이터 초기화 (개발용)
export const initMockData = (): void => {
  // 기존 팀 데이터 보존 (이름, 사진 등)
  const existingData = getAppData()
  const existingTeam = existingData?.teams?.find((t) => t.id === '1')

  const mockTeam: Team = {
    id: '1',
    name: existingTeam?.name || '세종 born',
    shortName: 'SB',
    memberCount: 6,
    maxMembers: 10,
    level: 'A',
    region: '광진구 능동',
    totalGames: 18,
    aiReports: 14,
    activeDays: 45,
    isOfficial: true,
    captainId: 'user1',
    description: '주말 오후에 활동하는 친목 위주 팀입니다.',
    logo: existingTeam?.logo, // 기존 사진 보존
  }

  // 매칭 페이지에 표시될 다른 팀들
  const mockTeams: Team[] = [
    mockTeam,
    {
      id: '2',
      name: '강남 Dunkers',
      shortName: 'GD',
      memberCount: 3,
      maxMembers: 10,
      level: 'B+',
      region: '강남구',
      matchScore: 92,
      isOfficial: false,
      captainId: 'user2',
      description: '농구 좋아하는 사람들의 모임! 편하게 함께해요.',
      totalGames: 8,
      aiReports: 5,
      activeDays: 20,
    },
    {
      id: '3',
      name: '서초 Shooters',
      shortName: 'SS',
      memberCount: 7,
      maxMembers: 10,
      level: 'A',
      region: '서초구',
      matchScore: 88,
      isOfficial: true,
      captainId: 'user3',
      description: '주말 아침에 주로 활동합니다.',
      totalGames: 15,
      aiReports: 12,
      activeDays: 40,
    },
    {
      id: '4',
      name: '용산 Ballers',
      shortName: 'YB',
      memberCount: 4,
      maxMembers: 10,
      level: 'B',
      region: '용산구',
      matchScore: 85,
      isOfficial: false,
      captainId: 'user4',
      description: '경기 위주 팀입니다. 실력 향상을 목표로 합니다.',
      totalGames: 12,
      aiReports: 10,
      activeDays: 30,
    },
    {
      id: '5',
      name: '강서 Hoopers',
      shortName: 'GH',
      memberCount: 8,
      maxMembers: 10,
      level: 'A',
      region: '강서구',
      matchScore: 90,
      isOfficial: true,
      captainId: 'user5',
      description: '잠실 코트에서 주로 활동합니다.',
      totalGames: 22,
      aiReports: 18,
      activeDays: 55,
    },
  ]

  const mockRequests: MatchRequest[] = [
    {
      id: 'req1',
      fromTeam: {
        id: 'team_thunder',
        name: '관악 Thunders',
        shortName: 'GT',
        memberCount: 6,
        maxMembers: 10,
        level: 'A',
        region: '관악구',
        totalGames: 20,
        aiReports: 15,
        activeDays: 60,
        isOfficial: true,
        captainId: 'user_thunder',
        description: '승부욕 강한 경쟁 중심 팀',
      },
      toTeam: mockTeam,
      message: '경기 한 번 하실래요? 실력 비슷한 팀 찾고 있습니다!',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2시간 전
    },
    {
      id: 'req2',
      fromTeam: {
        id: 'team_warriors',
        name: '강남 Warriors',
        shortName: 'GW',
        memberCount: 5,
        maxMembers: 10,
        level: 'B+',
        region: '강남구',
        totalGames: 12,
        aiReports: 8,
        activeDays: 30,
        isOfficial: true,
        captainId: 'user_warriors',
        description: '주말 저녁 위주 활동',
      },
      toTeam: mockTeam,
      message: '실력 비슷한 팀 찾습니다. 주말 가능하신가요?',
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5시간 전
    },
    {
      id: 'req3',
      fromTeam: {
        id: 'team_dragons',
        name: '성북 Dragons',
        shortName: 'SD',
        memberCount: 7,
        maxMembers: 10,
        level: 'A',
        region: '성북구',
        totalGames: 25,
        aiReports: 20,
        activeDays: 90,
        isOfficial: true,
        captainId: 'user_dragons',
        description: '실력 향상 중심 팀',
      },
      toTeam: mockTeam,
      message: '주말 매칭 원해요! 친선 경기 하실래요?',
      status: 'pending',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1일 전
    },
  ]

  // 이미 수락된 매칭 (UI 테스트용)
  const mockMatchedTeams: MatchedTeam[] = [
    {
      id: 'matched_1',
      myTeamId: '1', // 세종 born
      matchedTeam: {
        id: 'team_rockets',
        name: '강서 Rockets',
        shortName: 'GR',
        memberCount: 8,
        maxMembers: 10,
        level: 'A',
        region: '강서구 화곡',
        totalGames: 18,
        aiReports: 14,
        activeDays: 50,
        isOfficial: true,
        captainId: 'user_rockets',
        description: '주말 저녁 위주로 활동하는 팀입니다.',
      },
      matchedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      requestId: 'req_accepted_1',
    },
    {
      id: 'matched_2',
      myTeamId: '1', // 세종 born
      matchedTeam: {
        id: 'team_eagles',
        name: '노원 Eagles',
        shortName: 'NE',
        memberCount: 6,
        maxMembers: 10,
        level: 'B+',
        region: '노원구 상계',
        totalGames: 12,
        aiReports: 9,
        activeDays: 35,
        isOfficial: true,
        captainId: 'user_eagles',
        description: '친목 위주로 즐겁게 농구하는 팀!',
      },
      matchedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전 (1주일 전)
      requestId: 'req_accepted_2',
    },
  ]

  const data: AppData = {
    user: {
      id: 'user1',
      name: '홍길동',
      currentTeamId: '1',
    },
    teams: mockTeams,
    matchRequests: mockRequests,
    matchedTeams: mockMatchedTeams, // 이미 수락된 매칭 2개
  }

  setAppData(data)
}
