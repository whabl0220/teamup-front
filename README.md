# TeamUp - 농구 매치 참가/주최 운영 플랫폼

농구 경기를 탐색하고 참가 신청/취소를 관리하며, 주최 경기 생성·신청자 확정·환불 처리까지 한 흐름에서 운영할 수 있는 프론트엔드 앱입니다.

## 주요 기능

### 🏀 인증/프로필
- Clerk 기반 로그인/회원가입
- 기본 정보(닉네임, 성별, 활동 지역, 키) 수정
- 플레이어 카드 정보(포지션/플레이 스타일/한 줄 소개) 관리

### 🤝 참가자 매치 흐름
- 날짜 캐러셀 + 모드(전체/내 경기/오늘/이번주) 필터
- 매치 상세에서 참가 신청/취소 처리
- 로컬 스토어 기반 신청 상태 반영(오프라인/네트워크 불안정 보조)

### 🧭 주최자 매치 운영
- 주최 경기 생성(날짜/정원/참가비/입금 계좌/취소 정책)
- 내 주최 경기 목록/상세 조회
- 신청자 확정/취소/환불 플로우 지원

### 🔔 알림/대시보드
- 로컬 알림 저장소 기반 알림 로그/읽음/전체 삭제
- 홈 대시보드에서 오늘 참가/입금 대기/미확인 알림 요약
- 주요 액션으로 빠른 이동(참가/주최/프로필)

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Auth**: Clerk
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **State Management**: React Hooks + localStorage external store (일부 Zustand)
- **Date Handling**: date-fns
- **Toast Notifications**: Sonner
- **Map**: Kakao Map API (연동 준비)
- **Backend API**: REST API
- **API Mocking**: MSW (Mock Service Worker)

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

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

### 개발 서버 실행

```bash
# 의존성 설치
npm install

# MSW Service Worker 초기화 (최초 1회만)
npm run msw:init

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

#### MSW 사용하기

MSW를 사용하여 백엔드 API 없이도 개발할 수 있습니다:

**개발 환경:**
1. `.env.local`에 `NEXT_PUBLIC_USE_MOCK=true` 설정
2. `npm run dev` 실행
3. 브라우저 콘솔에서 MSW 활성화 메시지 확인

**프로덕션에서 임시 사용 (백엔드 미준비 시):**
```env
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_ALLOW_PRODUCTION_MOCK=true
```

> ⚠️ **주의**: 백엔드 API가 준비되면 즉시 위 환경 변수를 제거하고 실제 API URL을 설정하세요.

**마이그레이션 완료:**
- ✅ 개발 환경에서 MSW를 통한 완전한 API 모킹 지원
- ✅ 프로덕션 환경에서는 기본적으로 MSW 비활성화 (안전장치 포함)

자세한 내용은 [mocks/README.md](./mocks/README.md)를 참고하세요.

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
app/
├── (auth)/              # 인증 관련 페이지
│   ├── login/            # 로그인
│   └── signup/           # 회원가입
├── (app)/              # 메인 앱 페이지
│   ├── home/             # 홈 대시보드
│   ├── matches/          # 참가자 매치 목록/상세
│   ├── host/matches/     # 주최자 매치 운영
│   ├── notifications/    # 알림
│   ├── mypage/           # 마이페이지
│   └── profile/          # 프로필 수정
components/
├── features/           # 기능별 컴포넌트
├── layout/             # 레이아웃 컴포넌트
├── shared/             # 공통 컴포넌트
└── ui/                 # UI 기본 컴포넌트
lib/
├── services/           # API 서비스
├── mappers/            # API -> UI 타입 변환
├── match-*.ts          # 매치 관련 로컬 상태/폼 유틸
└── local-notifications.ts # 알림 로컬 스토어
types/
└── index.ts            # TypeScript 타입 정의
```

## API 엔드포인트

현재 프론트 기준 주요 API 엔드포인트:

- `POST /api/auth/signup` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/users/me` - 내 정보 조회
- `PATCH /api/users/profile` - 내 프로필 수정
- `GET /api/users/{userId}` - 사용자 조회
- `GET /api/users/{userId}/teams` - 사용자 팀 조회
- `GET /api/matches` - 매치 목록 조회
- `GET /api/matches/{matchId}` - 매치 상세 조회
- `POST /api/matches` - 주최 경기 생성
- `POST /api/matches/{matchId}/apply` - 참가 신청
- `PUT /api/matches/{matchId}/applications/{applicationId}/cancel` - 참가 신청 취소

## 개발 정보

- **개발 환경**: Node.js 20+
- **패키지 매니저**: npm
- **코드 스타일**: ESLint
- **Git 브랜치**: main

## 배포

Vercel을 통해 자동 배포됩니다.

### 환경 변수 설정

**프로덕션 (백엔드 준비됨):**
```env
NEXT_PUBLIC_API_URL=https://your-production-api.com
# MSW 관련 변수는 설정하지 않음 (자동 비활성화)
```

**프로덕션 (백엔드 미준비, 임시 데모용):**
```env
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_ALLOW_PRODUCTION_MOCK=true
```

> ⚠️ 프로덕션에서 MSW를 사용하는 것은 임시 조치입니다. 백엔드가 준비되면 즉시 실제 API로 전환하세요.

## 라이선스

MIT License
