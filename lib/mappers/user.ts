import type { User as ApiUser, UserTeamResponse } from '@/lib/services/user'
import type { PlayStyle, Position, Team, User } from '@/types'

export const mapApiUserToUser = (userData: ApiUser): User => ({
  id: userData.id,
  name: userData.nickname,
  email: userData.email,
  gender: userData.gender,
  address: userData.address,
  height: userData.height,
  position: userData.mainPosition
    ? (userData.mainPosition as Position)
    : undefined,
  subPosition: userData.subPosition
    ? (userData.subPosition as Position)
    : undefined,
  playStyle: userData.playStyle as PlayStyle | undefined,
  statusMsg: userData.statusMsg,
})

export const mapUserTeamResponseToTeam = (team: UserTeamResponse): Team => ({
  id: team.id.toString(),
  name: team.name,
  shortName: team.name.substring(0, 2).toUpperCase(),
  memberCount: team.memberCount,
  maxMembers: 10,
  level: 'B',
  region: '',
  totalGames: 0,
  aiReports: 0,
  activeDays: 0,
  isOfficial: team.memberCount >= 5,
  captainId: team.leaderId.toString(),
  description: '',
  matchScore: 0,
  teamDna: team.teamDna,
  teamLevel: team.teamLevel,
  teamExp: team.teamExp,
})
