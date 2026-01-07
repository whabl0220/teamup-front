# TeamUp - AI 기반 농구 팀 매칭 & 코칭 플랫폼

농구 팀을 만들고, AI 추천으로 다른 팀과 매칭하며, 경기 후 AI 코치의 분석을 받을 수 있는 플랫폼입니다.

## 주요 기능

### 🏀 팀 관리
- 팀 생성 및 관리
- 팀 DNA 시스템 (BULLS, WARRIORS, SPURS)
- 팀 레벨 및 경험치 시스템
- 팀원 관리 및 팀장 위임

### 🤝 팀 매칭
- AI 기반 팀 매칭 추천 (90%대 매칭률)
- 팀 DNA 기반 상성 분석
- 팀 레벨 고려한 균형잡힌 매칭
- 실시간 매칭 요청 및 수락

### 🎯 AI 코칭
- 경기 결과 기록
- 5개 포지션별 피드백 시스템
- AI 코치의 맞춤형 분석 리포트
- 팀 DNA별 차별화된 코칭 스타일
- 경기 전적 및 통계 관리

### 🗺️ 지도 기능
- 주변 농구장 검색
- 주변 팀 찾기
- Kakao Map 연동

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: React Hooks (Zustand 준비 중)
- **Date Handling**: date-fns
- **Toast Notifications**: Sonner
- **Map**: Kakao Map API
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
│   ├── login/          # 로그인
│   └── register/       # 회원가입
├── (app)/              # 메인 앱 페이지
│   ├── home/           # 홈
│   ├── team/           # 팀 관리
│   ├── matching/       # 팀 매칭
│   ├── coaching/       # AI 코칭
│   ├── map/            # 지도
│   └── profile/        # 프로필
components/
├── features/           # 기능별 컴포넌트
├── layout/             # 레이아웃 컴포넌트
├── shared/             # 공통 컴포넌트
└── ui/                 # UI 기본 컴포넌트
lib/
├── services/           # API 서비스
├── constants.ts        # 상수
├── mock-data.ts        # 목 데이터
└── storage.ts          # localStorage 유틸
types/
└── index.ts            # TypeScript 타입 정의
```

## API 엔드포인트

주요 API 엔드포인트:

- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/users/{userId}/teams` - 사용자 팀 조회
- `POST /api/teams` - 팀 생성
- `GET /api/teams/{teamId}/match-suggestions` - 매칭 추천
- `POST /api/games/match` - 게임 생성
- `POST /api/games/{gameId}/finish-and-feedback` - 피드백 제출
- `GET /api/reports/games/{gameId}` - AI 리포트 조회

## 팀 DNA 시스템

- **BULLS**: 강력한 수비와 투지 중심의 플레이 스타일
- **WARRIORS**: 빠른 템포와 팀워크 중심의 플레이 스타일
- **SPURS**: 완벽한 조직력과 정교한 플레이 스타일

## 개발 정보

- **개발 환경**: Node.js 18+
- **패키지 매니저**: npm
- **코드 스타일**: ESLint + Prettier
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
