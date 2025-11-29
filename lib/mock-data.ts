// Player 타입 정의
export type Player = {
  id: string
  name: string
  profileImage?: string
  position: string
  level: string
  lastActive: string
  bio: string
}

// mock player 데이터
export const mockPlayers: Player[] = [
  {
    id: 'user1',
    name: '김세종',
    profileImage: '/images/profile1.png',
    position: '가드',
    level: 'A',
    lastActive: '2일 전',
    bio: '빠른 돌파와 패스가 장점인 세종대 농구 동호회 팀장입니다.',
  },
  {
    id: 'user2',
    name: '이광진',
    profileImage: '/images/profile2.png',
    position: '포워드',
    level: 'B+',
    lastActive: '5일 전',
    bio: '높은 점프력과 리바운드 능력이 뛰어납니다.',
  },
  {
    id: 'user3',
    name: '박강남',
    profileImage: '/images/profile3.png',
    position: '센터',
    level: 'A+',
    lastActive: '1주 전',
    bio: '팀의 골밑을 책임지는 든든한 센터.',
  },
]

// id로 player 조회
export function getPlayerById(id: string): Player | undefined {
  return mockPlayers.find((p) => p.id === id)
}
import type { Team } from '@/types'

// 모집 중인 팀 (팀원 모집 - 5명 미만)
export const mockJoinTeams: Team[] = [
  {
    id: '3',
    name: '강남 Thunder',
    shortName: 'GT',
    region: '강남구 역삼',
    level: 'A+',
    matchScore: 92,
    memberCount: 4,
    maxMembers: 10,
    isOfficial: false,
    captainId: 'user3',
    description: '1명 모집 중! 가드 포지션 우대합니다.',
    totalGames: 25,
    aiReports: 20,
    activeDays: 80,
  },
  {
    id: '6',
    name: '마포 Ballers',
    shortName: 'MB',
    region: '마포구 합정',
    level: 'B+',
    matchScore: 88,
    memberCount: 3,
    maxMembers: 10,
    isOfficial: false,
    captainId: 'user6',
    description: '2명 모집 중! 평일 저녁에 활동합니다.',
    totalGames: 12,
    aiReports: 10,
    activeDays: 30,
  },
  {
    id: '7',
    name: '용산 Hawks',
    shortName: 'YH',
    region: '용산구 이촌',
    level: 'A',
    matchScore: 85,
    memberCount: 2,
    maxMembers: 10,
    isOfficial: false,
    captainId: 'user7',
    description: '포워드 포지션 모집 중입니다!',
    totalGames: 18,
    aiReports: 15,
    activeDays: 50,
  },
  {
    id: '8',
    name: '성북 Wolves',
    shortName: 'SW',
    region: '성북구 정릉',
    level: 'B',
    matchScore: 82,
    memberCount: 4,
    maxMembers: 10,
    isOfficial: false,
    captainId: 'user8',
    description: '초보 환영! 편하게 농구 즐기실 분 모집합니다.',
    totalGames: 8,
    aiReports: 6,
    activeDays: 20,
  },
]

// 정식 팀 (매칭용 - 5명 이상)
export const mockMatchTeams: Team[] = [
  {
    id: '2',
    name: '세종 Warriors',
    shortName: 'SW',
    region: '광진구 능동',
    level: 'A',
    matchScore: 95,
    memberCount: 7,
    maxMembers: 10,
    isOfficial: true,
    captainId: 'user2',
    description: '주말 오후에 활동하는 친목 위주 팀입니다.',
    totalGames: 20,
    aiReports: 15,
    activeDays: 60,
  },
  {
    id: '4',
    name: '관악 Hoops',
    shortName: 'GH',
    region: '관악구 신림',
    level: 'B+',
    matchScore: 88,
    memberCount: 6,
    maxMembers: 10,
    isOfficial: true,
    captainId: 'user4',
    description: '주 2회 정기 경기를 진행합니다.',
    totalGames: 15,
    aiReports: 12,
    activeDays: 40,
  },
  {
    id: '5',
    name: '송파 Dunk',
    shortName: 'SD',
    region: '송파구 잠실',
    level: 'A',
    matchScore: 90,
    memberCount: 8,
    maxMembers: 10,
    isOfficial: true,
    captainId: 'user5',
    description: '잠실 코트에서 주로 활동합니다.',
    totalGames: 22,
    aiReports: 18,
    activeDays: 55,
  },
  {
    id: '9',
    name: '동작 Phoenix',
    shortName: 'DP',
    region: '동작구 사당',
    level: 'A+',
    matchScore: 93,
    memberCount: 5,
    maxMembers: 10,
    isOfficial: true,
    captainId: 'user9',
    description: '실력 향상을 목표로 하는 팀입니다.',
    totalGames: 28,
    aiReports: 22,
    activeDays: 70,
  },
  {
    id: '10',
    name: '서초 Lions',
    shortName: 'SL',
    region: '서초구 방배',
    level: 'A',
    matchScore: 87,
    memberCount: 9,
    maxMembers: 10,
    isOfficial: true,
    captainId: 'user10',
    description: '주말 위주로 활동하는 팀입니다.',
    totalGames: 16,
    aiReports: 13,
    activeDays: 45,
  },
]

// 내 팀 정보
export const mockMyTeam: Team = {
  id: '1',
  name: '세종 born',
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
  description: '세종대 기반 농구 동호회',
}
