import { http, HttpResponse } from 'msw'
import type { Team, MatchRequest, User } from '@/types'
import { mockMatchTeams, mockJoinTeams, mockMyTeam } from '@/lib/mock-data'

// Mock 데이터 저장소 (메모리 기반)
const mockData = {
  teams: [...mockMatchTeams, ...mockJoinTeams, mockMyTeam],
  users: [
    {
      id: 'user1',
      name: 'KimB',
      email: 'kimB@example.com',
      team: mockMyTeam,
      height: 178,
      position: 'GUARD' as const,
      playStyle: 'SHOOTER' as const,
      statusMsg: 'TeamUp 3주 연속 출석 중!',
    },
  ] as User[],
  matchRequests: [] as MatchRequest[],
  games: [] as Array<{
    gameId: number
    homeTeamId: number
    awayTeamId: number
    status: string
    createdAt: string
  }>,
}

// 팀 DNA별 AI 코멘트
const getAICoachingComment = (teamDna: string, result: string): string => {
  const comments = {
    BULLS: {
      WIN: '훌륭한 경기였습니다! Bulls DNA답게 강력한 수비와 투지를 보여줬습니다. 특히 리바운드에서의 우위가 승리의 열쇠였습니다.',
      LOSE: '아쉬운 경기였지만, Bulls 정신을 잃지 않았습니다. 수비 집중도를 높이고 팀워크를 강화하면 다음 경기에서 승리할 수 있습니다.',
      DRAW: '치열한 경기였습니다. Bulls의 전통적인 수비 철학을 더욱 강화하면 승리로 이어질 것입니다.',
    },
    WARRIORS: {
      WIN: '환상적인 팀플레이였습니다! Warriors 스타일의 즐거운 농구를 펼쳤네요. 빠른 공격 전환과 3점슛이 승리의 핵심이었습니다.',
      LOSE: '공격적인 플레이는 좋았지만, 수비에서 아쉬웠습니다. Warriors의 빠른 템포를 유지하면서 수비 집중도를 높여보세요.',
      DRAW: '재미있는 경기였습니다! Warriors의 강점인 빠른 공격을 더욱 활용하면 승리로 이어질 수 있습니다.',
    },
    SPURS: {
      WIN: '완벽한 팀워크로 승리했습니다! Spurs의 정신을 제대로 보여줬습니다. 정교한 패스 플레이가 승리의 열쇠였습니다.',
      LOSE: '패스 플레이는 좋았지만, 결정력에서 아쉬웠습니다. Spurs의 기본기를 바탕으로 슛 성공률을 높여보세요.',
      DRAW: '조직적인 플레이가 돋보였습니다. Spurs의 전통적인 패스 중심 플레이를 더욱 강화하면 승리할 수 있습니다.',
    },
  }

  const dna = teamDna as keyof typeof comments
  const gameResult = result as 'WIN' | 'LOSE' | 'DRAW'
  return comments[dna]?.[gameResult] || comments.BULLS[gameResult]
}

export const handlers = [
  // ========== 인증 관련 API ==========

  // 회원가입
  http.post('*/api/auth/signup', async ({ request }) => {
    const body = (await request.json()) as {
      email: string
      password: string
      nickname: string
      gender: string
      address: string
      height: number
      position: string
      subPosition?: string
      playStyle?: string
      statusMsg?: string
    }

    // 이메일 중복 체크
    const existingUser = mockData.users.find((u) => u.email === body.email)
    if (existingUser) {
      return HttpResponse.json({ error: '이미 사용 중인 이메일입니다.' }, { status: 400 })
    }

    // 새 사용자 생성
    const newUser: User = {
      id: String(Date.now()),
      email: body.email,
      name: body.nickname,
      position: body.position as 'GUARD' | 'FORWARD' | 'CENTER',
      playStyle: body.playStyle as 'SLASHER' | 'SHOOTER' | 'DEFENDER' | 'PASSER' | undefined,
      height: body.height,
      address: body.address,
      statusMsg: body.statusMsg,
    }

    mockData.users.push(newUser)

    return HttpResponse.json({
      id: Number(newUser.id),
      email: newUser.email,
      nickname: newUser.name,
      gender: body.gender,
      address: newUser.address || '',
      height: newUser.height || 0,
      position: newUser.position || '',
      subPosition: body.subPosition,
      playStyle: newUser.playStyle,
      statusMsg: newUser.statusMsg,
      createdAt: new Date().toISOString(),
    })
  }),

  // 로그인
  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }

    // 이메일로 사용자 찾기
    const user = mockData.users.find((u) => u.email === body.email)

    if (!user) {
      return HttpResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    // 비밀번호 검증 (실제로는 해시 비교, 여기서는 간단히 체크)
    // Mock에서는 모든 비밀번호를 허용하지만, 실제로는 검증 필요
    if (!body.password || body.password.length < 8) {
      return HttpResponse.json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    // 로그인 성공 - 사용자 정보 반환
    return HttpResponse.json({
      id: Number(user.id),
      email: user.email,
      nickname: user.name,
      gender: 'MALE', // Mock 데이터
      address: user.address || '',
      height: user.height || 0,
      position: user.position || '',
      subPosition: undefined,
      playStyle: user.playStyle,
      statusMsg: user.statusMsg,
      createdAt: new Date().toISOString(),
    })
  }),

  // ========== 팀 관련 API ==========

  // 팀 생성
  http.post('*/api/teams', async ({ request }) => {
    const url = new URL(request.url)
    const userId = Number(url.searchParams.get('userId'))
    const body = (await request.json()) as { name: string; teamDna: string; emblemUrl?: string }

      const newTeam: Team = {
        id: String(Date.now()),
        name: body.name,
        shortName: body.name.substring(0, 2).toUpperCase(),
        memberCount: 1,
        maxMembers: 10,
        level: 'B',
        region: '서울',
        totalGames: 0,
        aiReports: 0,
        activeDays: 0,
        isOfficial: false,
        captainId: String(userId),
        description: '',
        teamDna: body.teamDna as 'BULLS' | 'WARRIORS' | 'SPURS',
        teamLevel: 1,
        teamExp: 0,
        logo: body.emblemUrl,
      }

      mockData.teams.push(newTeam)

      return HttpResponse.json({
        id: Number(newTeam.id),
        name: newTeam.name,
        leaderId: userId,
        leaderNickname: '팀장',
        teamDna: newTeam.teamDna,
        teamLevel: newTeam.teamLevel,
        teamExp: newTeam.teamExp,
        emblemUrl: newTeam.logo || '',
        memberCount: newTeam.memberCount,
        createdAt: new Date().toISOString(),
      })
    }
  ),

  // 매칭 추천 팀 조회
  http.get('*/api/teams/:teamId/match-suggestions', async ({ params }) => {
    const teamId = Number(params.teamId)
    const currentTeam = mockData.teams.find((t) => Number(t.id) === teamId)

    if (!currentTeam) {
      return HttpResponse.json([], { status: 404 })
    }

    // 현재 팀을 제외한 다른 팀들을 추천
    const suggestions = mockData.teams
      .filter((t) => Number(t.id) !== teamId && t.isOfficial)
      .slice(0, 5)
      .map((team) => ({
        teamId: Number(team.id),
        name: team.name,
        teamDna: team.teamDna || 'BULLS',
        teamLevel: team.teamLevel || 1,
        memberCount: team.memberCount,
      }))

    return HttpResponse.json(suggestions)
  }),

  // 내 팀 목록 조회 (향후 사용)
  http.get('*/api/teams/my', () => {
    return HttpResponse.json([mockMyTeam])
  }),

  // 팀 상세 조회 (향후 사용)
  http.get('*/api/teams/:teamId', ({ params }) => {
    const team = mockData.teams.find((t) => t.id === params.teamId)
    if (!team) {
      return HttpResponse.json({ error: 'Team not found' }, { status: 404 })
    }
    return HttpResponse.json(team)
  }),

  // ========== 게임 관련 API ==========

  // 게임 생성
  http.post('*/api/games/match', async ({ request }) => {
    const body = (await request.json()) as { homeTeamId: number; awayTeamId: number }
      const homeTeam = mockData.teams.find((t) => Number(t.id) === body.homeTeamId)
      const awayTeam = mockData.teams.find((t) => Number(t.id) === body.awayTeamId)

      if (!homeTeam || !awayTeam) {
        return HttpResponse.json({ error: 'Team not found' }, { status: 404 })
      }

      const gameId = Date.now()
      const game = {
        gameId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }

      mockData.games.push(game)

      return HttpResponse.json({
        gameId,
        homeTeamId: body.homeTeamId,
        homeTeamName: homeTeam.name,
        awayTeamId: body.awayTeamId,
        awayTeamName: awayTeam.name,
        status: 'PENDING',
        createdAt: game.createdAt,
      })
    }
  ),

  // 게임 종료 및 피드백 제출
  http.post('*/api/games/:gameId/finish-and-feedback', async ({ params, request }) => {
    const gameId = Number(params.gameId)
    const body = (await request.json()) as { teamId: number; result: string; positionFeedbacks: unknown[] }
      const game = mockData.games.find((g) => g.gameId === gameId)
      const team = mockData.teams.find((t) => Number(t.id) === body.teamId)

      if (!game || !team) {
        return HttpResponse.json({ error: 'Game or team not found' }, { status: 404 })
      }

      // 게임 상태 업데이트
      game.status = 'FINISHED'

      const aiComment = getAICoachingComment(team.teamDna || 'BULLS', body.result)

      return HttpResponse.json({
        gameId,
        teamId: body.teamId,
        teamName: team.name,
        result: body.result,
        positionFeedbacksJson: JSON.stringify(body.positionFeedbacks),
        aiComment,
        createdAt: new Date().toISOString(),
      })
    }
  ),

  // AI 리포트 생성
  http.post('*/api/games/:gameId/report', async ({ params, request }) => {
    const gameId = Number(params.gameId)
    const url = new URL(request.url)
    const teamId = Number(url.searchParams.get('teamId'))
    const game = mockData.games.find((g) => g.gameId === gameId)
    const team = mockData.teams.find((t) => Number(t.id) === teamId)

    if (!game || !team) {
      return HttpResponse.json({ error: 'Game or team not found' }, { status: 404 })
    }

    // 게임 결과는 랜덤하게 (실제로는 DB에서 가져옴)
    const result = (['WIN', 'LOSE', 'DRAW'] as const)[Math.floor(Math.random() * 3)]
    const aiComment = getAICoachingComment(team.teamDna || 'BULLS', result)

    return HttpResponse.json({
      gameId,
      teamId,
      teamName: team.name,
      result,
      positionFeedbacksJson: '[]',
      aiComment,
      createdAt: new Date().toISOString(),
    })
  }),

  // ========== 사용자 관련 API ==========

  // 사용자의 팀 목록 조회
  http.get('*/api/users/:userId/teams', ({ params }) => {
    const userId = Number(params.userId)
    const user = mockData.users.find((u) => Number(u.id) === userId)

    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 사용자가 속한 팀 목록 반환 (팀장인 팀만)
    const userTeams = mockData.teams
      .filter((team) => Number(team.captainId) === userId)
      .map((team) => ({
        id: Number(team.id),
        name: team.name,
        leaderId: Number(team.captainId),
        leaderNickname: user.name,
        teamDna: (team.teamDna || 'BULLS') as 'BULLS' | 'WARRIORS' | 'SPURS',
        teamLevel: team.teamLevel || 1,
        teamExp: team.teamExp || 0,
        emblemUrl: team.logo,
        memberCount: team.memberCount,
        createdAt: new Date().toISOString(),
      }))

    return HttpResponse.json(userTeams)
  }),

  // 현재 사용자 정보 조회
  http.get('*/api/users/me', () => {
    return HttpResponse.json(mockData.users[0])
  }),

  // 사용자 조회
  http.get('*/api/users/:userId', ({ params }) => {
    const user = mockData.users.find((u) => u.id === params.userId)
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return HttpResponse.json(user)
  }),

  // ========== 매칭 요청 API (향후 사용) ==========

  // 받은 매칭 요청 목록
  http.get('*/api/match-requests/received', () => {
    return HttpResponse.json(mockData.matchRequests)
  }),

  // 매칭 요청 보내기
  http.post('*/api/match-requests', async ({ request }) => {
    const body = (await request.json()) as { fromTeamId: string; toTeamId: string; message: string }
      const fromTeam = mockData.teams.find((t) => t.id === body.fromTeamId)
      const toTeam = mockData.teams.find((t) => t.id === body.toTeamId)

      if (!fromTeam || !toTeam) {
        return HttpResponse.json({ error: 'Team not found' }, { status: 404 })
      }

      const requestId = `req_${Date.now()}`
      const matchRequest: MatchRequest = {
        id: requestId,
        fromTeam,
        toTeam,
        message: body.message,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }

      mockData.matchRequests.push(matchRequest)

      return HttpResponse.json(matchRequest)
    }
  ),

  // 매칭 요청 수락
  http.put('*/api/match-requests/:requestId/accept', ({ params }) => {
    const request = mockData.matchRequests.find((r) => r.id === params.requestId)
    if (!request) {
      return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    request.status = 'accepted'
    request.respondedAt = new Date().toISOString()

    return HttpResponse.json({
      status: 'accepted',
      captainKakaoId: 'kakao_captain123',
    })
  }),

  // 매칭 요청 거절
  http.put('*/api/match-requests/:requestId/reject', ({ params }) => {
    const request = mockData.matchRequests.find((r) => r.id === params.requestId)
    if (!request) {
      return HttpResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    request.status = 'rejected'
    request.respondedAt = new Date().toISOString()

    return HttpResponse.json({ status: 'rejected' })
  }),

  // ========== 알림 API (향후 사용) ==========

  // 알림 목록 조회
  http.get('*/api/notifications', () => {
    return HttpResponse.json([])
  }),

  // 알림 읽음 처리
  http.put('*/api/notifications/:id/read', () => {
    return HttpResponse.json({ success: true })
  }),

  // 모든 알림 읽음 처리
  http.put('*/api/notifications/read-all', () => {
    return HttpResponse.json({ success: true })
  }),
]

