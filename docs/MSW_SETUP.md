# MSW 설정 가이드

MSW 도입이 완료되었습니다! 다음 단계를 따라 설정을 완료하세요.

## 1. MSW 패키지 설치

터미널에서 다음 명령어를 실행하세요:

```bash
npm install --save-dev msw
```

## 2. Service Worker 초기화

MSW가 작동하려면 Service Worker 파일이 필요합니다:

```bash
npm run msw:init
```

이 명령어는 `public/mockServiceWorker.js` 파일을 생성합니다.

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음을 추가하세요:

```env
# API 설정
NEXT_PUBLIC_API_URL=http://localhost:8080

# MSW Mock 설정 (개발 환경에서만 사용)
# true로 설정하면 MSW를 사용하여 API를 mock합니다
# false 또는 설정하지 않으면 실제 API를 사용합니다
NEXT_PUBLIC_USE_MOCK=true

# Kakao Map API Key
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key
```

## 4. 개발 서버 실행

```bash
npm run dev
```

브라우저 콘솔에서 다음과 같은 메시지를 확인할 수 있습니다:

```
[MSW] Mocking enabled.
```

## 사용 방법

### MSW 활성화 (개발 환경)

- `.env.local`에 `NEXT_PUBLIC_USE_MOCK=true` 설정
- 모든 API 호출이 MSW를 통해 mock됩니다

### 실제 API 사용 (프로덕션)

- `.env.local`에서 `NEXT_PUBLIC_USE_MOCK=false` 또는 삭제
- `NEXT_PUBLIC_API_URL`을 실제 백엔드 서버 주소로 설정
- 모든 API 호출이 실제 백엔드로 전송됩니다

## 지원하는 API

현재 MSW에서 mock하는 API 목록:

### 인증 관련
- ✅ `POST /api/auth/signup` - 회원가입
- ✅ `POST /api/auth/login` - 로그인

### 사용자 관련
- ✅ `GET /api/users/{userId}/teams` - 사용자의 팀 목록 조회
- ✅ `GET /api/users/me` - 현재 사용자 정보
- ✅ `GET /api/users/{userId}` - 사용자 조회

### 팀 관련
- ✅ `POST /api/teams?userId={userId}` - 팀 생성
- ✅ `GET /api/teams/{teamId}/match-suggestions` - 매칭 추천 팀 조회
- ✅ `GET /api/teams/my` - 내 팀 목록 조회
- ✅ `GET /api/teams/{teamId}` - 팀 상세 조회

### 게임 관련
- ✅ `POST /api/games/match` - 게임 생성
- ✅ `POST /api/games/{gameId}/finish-and-feedback` - 피드백 제출
- ✅ `POST /api/games/{gameId}/report?teamId={teamId}` - AI 리포트 생성

### 사용자 관련
- ✅ `GET /api/users/me` - 현재 사용자 정보
- ✅ `GET /api/users/{userId}` - 사용자 조회

### 매칭 요청 관련
- ✅ `GET /api/match-requests/received` - 받은 매칭 요청 목록
- ✅ `POST /api/match-requests` - 매칭 요청 보내기
- ✅ `PUT /api/match-requests/{requestId}/accept` - 매칭 요청 수락
- ✅ `PUT /api/match-requests/{requestId}/reject` - 매칭 요청 거절

### 알림 관련
- ✅ `GET /api/notifications` - 알림 목록
- ✅ `PUT /api/notifications/{id}/read` - 알림 읽음 처리
- ✅ `PUT /api/notifications/read-all` - 모든 알림 읽음 처리

## 파일 구조

```
mocks/
├── handlers.ts      # 모든 API 핸들러 정의
├── browser.ts       # 브라우저 환경용 MSW 설정
├── server.ts        # 서버 환경(테스트)용 MSW 설정
└── README.md        # 상세 문서

components/
└── providers/
    └── MSWProvider.tsx  # MSW 초기화 컴포넌트
```

## 주의사항

1. **프로덕션 빌드**: 프로덕션에서는 `NEXT_PUBLIC_USE_MOCK`을 설정하지 않거나 `false`로 설정하세요.

2. **Service Worker 파일**: `public/mockServiceWorker.js` 파일은 Git에 커밋해야 합니다.

3. **기존 코드**: 기존 API 호출 코드는 수정할 필요가 없습니다. MSW가 자동으로 intercept합니다.

## 문제 해결

### MSW가 작동하지 않는 경우

1. `.env.local`에 `NEXT_PUBLIC_USE_MOCK=true`가 설정되어 있는지 확인
2. `public/mockServiceWorker.js` 파일이 존재하는지 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. 개발 서버를 재시작

### 실제 API로 전환하는 경우

1. `.env.local`에서 `NEXT_PUBLIC_USE_MOCK` 삭제 또는 `false`로 설정
2. `NEXT_PUBLIC_API_URL`을 실제 백엔드 주소로 변경
3. 개발 서버 재시작

## 추가 정보

더 자세한 내용은 [mocks/README.md](./mocks/README.md)를 참고하세요.

