import { http, HttpResponse } from 'msw'
import type { Team, MatchRequest, User } from '@/types'
import { mockMatchTeams, mockJoinTeams, mockMyTeam, mockMyTeamMembers, mockTeamMembers } from '@/lib/mock-data'

// Mock 데이터 저장소 (메모리 기반)
const mockData = {
  teams: [...mockMatchTeams, ...mockJoinTeams, mockMyTeam],
  users: [
    {
      id: 'user1',
      name: 'Yoo',
      email: 'Yoo@gmail.com',
      team: mockMyTeam,
      height: 178,
      position: 'FORWARD' as const, // Position: 'GUARD' | 'FORWARD' | 'CENTER'
      subPosition: 'CENTER' as const, // Position: 'GUARD' | 'FORWARD' | 'CENTER'
      playStyle: 'SHOOTER' as const, // PlayStyle: 'SLASHER' | 'SHOOTER' | 'DEFENDER' | 'PASSER'
      statusMsg: 'TeamUp is good!',
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
  matchedTeams: [] as Array<{
    gameId: number
    homeTeamId: number
    awayTeamId: number
    matchedAt: string
  }>,
  gameRecords: [] as Array<{
    gameId: number
    teamId: number
    teamName: string
    result: 'WIN' | 'LOSE' | 'DRAW'
    positionFeedbacksJson: string
    aiComment: string
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

  // 내 팀 목록 조회
  http.get('*/api/teams/my', () => {
    // 현재 사용자의 팀 목록 반환 (팀장인 팀만)
    const currentUser = mockData.users[0]
    const userTeams = mockData.teams
      .filter((team) => Number(team.captainId) === Number(currentUser.id))
      .map((team) => ({
        ...team,
        // Team 타입에 맞게 변환
      }))

    return HttpResponse.json(userTeams.length > 0 ? userTeams : [mockMyTeam])
  }),

  // 팀 상세 조회
  http.get('*/api/teams/:teamId', ({ params }) => {
    const team = mockData.teams.find((t) => t.id === params.teamId)
    if (!team) {
      return HttpResponse.json({ error: 'Team not found' }, { status: 404 })
    }
    return HttpResponse.json(team)
  }),

  // 팀 멤버 목록 조회
  http.get('*/api/teams/:teamId/members', ({ params }) => {
    const teamId = params.teamId as string
    const team = mockData.teams.find((t) => t.id === teamId)

    if (!team) {
      return HttpResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // 세종 born 팀 (id: '1')인 경우 mockMyTeamMembers 사용
    if (teamId === '1' || team.id === '1') {
      const members = mockMyTeamMembers.slice(0, team.memberCount || 6).map((member) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        isLeader: member.isLeader,
        email: member.email,
      }))
      return HttpResponse.json(members)
    }

    // 다른 팀의 경우 mockTeamMembers에서 찾기
    const teamMembers = mockTeamMembers[teamId] || mockTeamMembers[team.id]
    if (teamMembers) {
      const members = teamMembers.slice(0, team.memberCount || teamMembers.length).map((member) => ({
        id: member.id,
        name: member.name,
        position: member.position,
        isLeader: member.isLeader,
        email: member.email,
      }))
      return HttpResponse.json(members)
    }

    // 정의되지 않은 팀의 경우 기본 팀장 정보 반환 (captainId 기반)
    const captainId = team.captainId
    const members: Array<{ id: string; name: string; position: 'GUARD' | 'FORWARD' | 'CENTER'; isLeader: boolean; email: string }> = [
      {
        id: captainId,
        name: captainId === 'user1' ? 'Yoo' : captainId === 'user2' ? '이광진' : captainId === 'user3' ? '박강남' : captainId === 'user4' ? '최민수' : captainId === 'user5' ? '정태영' : '팀장',
        position: 'FORWARD',
        isLeader: true,
        email: `${captainId}@example.com`,
      },
    ]

    // memberCount에 맞춰 추가 멤버 생성
    const memberCount = team.memberCount || 1
    for (let i = 1; i < memberCount; i++) {
      members.push({
        id: `member${i}`,
        name: `멤버${i}`,
        position: (['GUARD', 'FORWARD', 'CENTER'][i % 3] as 'GUARD' | 'FORWARD' | 'CENTER'),
        isLeader: false,
        email: `member${i}@example.com`,
      })
    }

    return HttpResponse.json(members)
  }),

  // 팀의 게임 기록 조회
  http.get('*/api/teams/:teamId/game-records', ({ params }) => {
    const teamId = Number(params.teamId)
    // gameRecords 배열에서 해당 팀의 기록만 반환
    const teamRecords = (mockData.gameRecords || []).filter(
      (record) => record.teamId === teamId
    )

    return HttpResponse.json(teamRecords)
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

      // 매칭된 팀 목록에도 추가
      mockData.matchedTeams.push({
        gameId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        matchedAt: game.createdAt,
      })

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

  // 매칭된 팀 목록 조회
  http.get('*/api/teams/:teamId/matched-teams', ({ params }) => {
    const teamId = Number(params.teamId)
    const matchedGames = mockData.matchedTeams.filter(
      (match) => match.homeTeamId === teamId || match.awayTeamId === teamId
    )

    const matchedTeamsList = matchedGames.map((match) => {
      const opponentTeamId = match.homeTeamId === teamId ? match.awayTeamId : match.homeTeamId
      const opponentTeam = mockData.teams.find((t) => Number(t.id) === opponentTeamId)

      if (!opponentTeam) {
        return null
      }

      return {
        gameId: match.gameId,
        matchedTeam: opponentTeam,
        matchedAt: match.matchedAt,
      }
    }).filter((item): item is NonNullable<typeof item> => item !== null)

    return HttpResponse.json(matchedTeamsList)
  }),

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

    const response = {
      gameId,
      teamId: body.teamId,
      teamName: team.name,
      result: body.result as 'WIN' | 'LOSE' | 'DRAW',
      positionFeedbacksJson: JSON.stringify(body.positionFeedbacks),
      aiComment,
      createdAt: new Date().toISOString(),
    }

    // 게임 기록 저장 (통계 계산용)
    if (!mockData.gameRecords) {
      mockData.gameRecords = []
    }
    mockData.gameRecords.push(response)

    return HttpResponse.json(response)
  }),

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
    const user = mockData.users[0]
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // User 타입에 맞게 변환
    return HttpResponse.json({
      id: user.id,
      email: user.email,
      nickname: user.name,
      mainPosition: user.position || 'GUARD',
      subPosition: undefined,
      gender: 'MALE',
      age: 25,
      address: user.address || '',
      height: user.height,
      playStyle: user.playStyle,
      statusMsg: user.statusMsg,
      Team: user.team ? [user.team] : [],
      createdAt: new Date().toISOString(),
    })
  }),

  // 사용자 정보 수정
  http.put('*/api/users/me', async ({ request }) => {
    const body = (await request.json()) as Partial<{
      nickname: string
      gender: string
      address: string
      height: number
      mainPosition: string
      subPosition: string
      playStyle: string
      statusMsg: string
    }>

    const user = mockData.users[0]
    if (!user) {
      return HttpResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 사용자 정보 업데이트
    if (body.nickname) user.name = body.nickname
    if (body.gender) user.gender = body.gender
    if (body.address) user.address = body.address
    if (body.height !== undefined) user.height = body.height
    if (body.mainPosition) user.position = body.mainPosition as any
    if (body.subPosition) user.subPosition = body.subPosition as any
    if (body.playStyle) user.playStyle = body.playStyle as any
    if (body.statusMsg) user.statusMsg = body.statusMsg

    return HttpResponse.json({
      id: user.id,
      email: user.email,
      nickname: user.name,
      mainPosition: user.position || 'GUARD',
      subPosition: user.subPosition,
      gender: body.gender || 'MALE',
      age: 25,
      address: user.address || '',
      height: user.height,
      playStyle: user.playStyle,
      statusMsg: user.statusMsg,
      Team: user.team ? [user.team] : [],
      createdAt: new Date().toISOString(),
    })
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
    // 현재 사용자의 팀으로 온 매칭 요청만 반환
    const currentUser = mockData.users[0]
    const currentTeam = currentUser?.team

    if (!currentTeam) {
      return HttpResponse.json([])
    }

    const receivedRequests = mockData.matchRequests.filter(
      (req) => req.toTeam.id === currentTeam.id && req.status === 'pending'
    )

    return HttpResponse.json(receivedRequests)
  }),

  // 매칭 요청 수락
  http.put('*/api/match-requests/:requestId/accept', ({ params }) => {
    const requestId = params.requestId as string
    const request = mockData.matchRequests.find((r) => r.id === requestId)

    if (!request) {
      return HttpResponse.json({ error: 'Match request not found' }, { status: 404 })
    }

    request.status = 'accepted'
    request.respondedAt = new Date().toISOString()

    return HttpResponse.json({ success: true })
  }),

  // 매칭 요청 거절
  http.put('*/api/match-requests/:requestId/reject', ({ params }) => {
    const requestId = params.requestId as string
    const request = mockData.matchRequests.find((r) => r.id === requestId)

    if (!request) {
      return HttpResponse.json({ error: 'Match request not found' }, { status: 404 })
    }

    request.status = 'rejected'
    request.respondedAt = new Date().toISOString()

    return HttpResponse.json({ success: true })
  }),

  // 팀 참여 요청 조회
  http.get('*/api/teams/:teamId/join-requests', ({ params }) => {
    const teamId = params.teamId as string
    // Mock 데이터에서 팀 참여 요청 반환 (향후 실제 데이터 구조에 맞게 수정)
    return HttpResponse.json([])
  }),

  // 팀 참여 요청 수락
  http.put('*/api/teams/:teamId/join-requests/:requestId/accept', ({ params }) => {
    // Mock: 팀 참여 요청 수락 처리
    return HttpResponse.json({ success: true })
  }),

  // 팀 참여 요청 거절
  http.put('*/api/teams/:teamId/join-requests/:requestId/reject', ({ params }) => {
    // Mock: 팀 참여 요청 거절 처리
    return HttpResponse.json({ success: true })
  }),

  // 게임 기록 상세 조회
  http.get('*/api/games/:gameId', ({ params }) => {
    const gameId = Number(params.gameId)
    const record = mockData.gameRecords?.find((r) => r.gameId === gameId)

    if (!record) {
      return HttpResponse.json({ error: 'Game record not found' }, { status: 404 })
    }

    return HttpResponse.json(record)
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

