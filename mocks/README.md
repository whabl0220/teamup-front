# MSW (Mock Service Worker) 설정

이 프로젝트는 MSW를 사용하여 백엔드 API가 없을 때도 프론트엔드 개발을 진행할 수 있도록 구성되어 있습니다.

## 설정 방법

### 1. MSW 패키지 설치

```bash
npm install --save-dev msw
```

### 2. Service Worker 초기화

```bash
npm run msw:init
```

이 명령어는 `public/mockServiceWorker.js` 파일을 생성합니다.

### 3. 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 추가하세요:

```env
NEXT_PUBLIC_USE_MOCK=true
```

- `NEXT_PUBLIC_USE_MOCK=true`: MSW를 사용하여 API를 mock합니다 (개발 환경)
- `NEXT_PUBLIC_USE_MOCK=false` 또는 미설정: 실제 백엔드 API를 사용합니다 (프로덕션)

## 사용 방법

### 개발 환경에서 MSW 사용

1. `.env.local`에 `NEXT_PUBLIC_USE_MOCK=true` 설정
2. `npm run dev` 실행
3. 브라우저 콘솔에서 MSW 활성화 메시지 확인

### 실제 API로 전환

1. `.env.local`에서 `NEXT_PUBLIC_USE_MOCK=false` 또는 삭제
2. `NEXT_PUBLIC_API_URL`을 실제 백엔드 서버 주소로 설정
3. 재시작

## Mock 핸들러 구조

- `mocks/handlers.ts`: 모든 API 핸들러 정의
- `mocks/browser.ts`: 브라우저 환경용 MSW 설정
- `mocks/server.ts`: 서버 환경(테스트)용 MSW 설정

## 지원하는 API

### 인증 관련
- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인

### 사용자 관련
- `GET /api/users/{userId}/teams` - 사용자의 팀 목록 조회
- `GET /api/users/me` - 현재 사용자 정보
- `GET /api/users/{userId}` - 사용자 조회

### 팀 관련
- `POST /api/teams?userId={userId}` - 팀 생성
- `GET /api/teams/{teamId}/match-suggestions` - 매칭 추천 팀 조회
- `GET /api/teams/my` - 내 팀 목록 조회
- `GET /api/teams/{teamId}` - 팀 상세 조회

### 게임 관련
- `POST /api/games/match` - 게임 생성
- `POST /api/games/{gameId}/finish-and-feedback` - 피드백 제출
- `POST /api/games/{gameId}/report?teamId={teamId}` - AI 리포트 생성

### 사용자 관련
- `GET /api/users/me` - 현재 사용자 정보
- `GET /api/users/{userId}` - 사용자 조회

### 매칭 요청 관련
- `GET /api/match-requests/received` - 받은 매칭 요청 목록
- `POST /api/match-requests` - 매칭 요청 보내기
- `PUT /api/match-requests/{requestId}/accept` - 매칭 요청 수락
- `PUT /api/match-requests/{requestId}/reject` - 매칭 요청 거절

### 알림 관련
- `GET /api/notifications` - 알림 목록
- `PUT /api/notifications/{id}/read` - 알림 읽음 처리
- `PUT /api/notifications/read-all` - 모든 알림 읽음 처리

## Mock 데이터

Mock 데이터는 `lib/mock-data.ts`에서 관리되며, MSW 핸들러에서 사용됩니다.

## 주의사항

- MSW는 개발 환경에서만 사용해야 합니다
- 프로덕션 빌드에서는 `NEXT_PUBLIC_USE_MOCK`을 설정하지 않거나 `false`로 설정하세요
- Service Worker 파일(`public/mockServiceWorker.js`)은 Git에 커밋해야 합니다

