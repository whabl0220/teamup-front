# Clerk 인증 전환 및 운영 설정 가이드

## 목적

이 문서는 TeamUp 프론트엔드에서 Clerk 인증을 사용하는 현재 상태와, 운영 환경에서 필요한 설정 절차를 정리합니다.

- 로그인/회원가입 UI는 기존 화면을 최대한 유지
- 이메일/비밀번호 + Google + Apple 소셜 로그인 지원
- 백엔드 완전 연동 전 단계에서 프론트 인증을 안정적으로 운영

---

## 현재 적용 상태 (프론트)

다음 항목이 이미 코드에 반영되어 있습니다.

- `ClerkProvider` 적용 (`app/layout.tsx`) — `signInFallbackRedirectUrl`·`signUpFallbackRedirectUrl` 포함
- 로그인 페이지 Clerk 전환 (`app/(auth)/login/page.tsx`)
- 회원가입 페이지 Clerk 전환 + 이메일 코드 인증 분기 (`app/(auth)/signup/page.tsx`)
- Google/Apple 소셜 버튼 추가 (로그인/회원가입)
- SSO 콜백 라우트 추가 (`app/sso-callback/[[...sso-callback]]/page.tsx`)
- 라우트 보호 추가 (`proxy.ts`) — Next.js 16 규칙
  - `/home`, `/matches`, `/host`, `/notifications`, `/mypage`, `/profile`, `/about`
- 랜딩 페이지 서버 리다이렉트 (`app/page.tsx`) — 로그인 상태면 `/home`으로
- Clerk 로그아웃 적용 (`app/(app)/mypage/page.tsx`)
- Clerk 사용자 식별 동기화 (`components/providers/ClerkIdentitySync.tsx`)
  - `teamup_identity_v1` 키에 최소 사용자 식별 정보 저장

---

## 환경 변수 설정

`.env.local`에 아래 값을 설정합니다.

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxx
```

설정 후 개발 서버를 재시작합니다.

```bash
npm run dev
```

---

## 리다이렉트 URL 설정 (Clerk Core 2)

Clerk Core 2 (`@clerk/nextjs` v5+)에서 `afterSignInUrl` / `afterSignUpUrl`은 **deprecated**되었습니다.  
아래 두 방식 중 하나를 선택해 설정합니다. **환경 변수 방식을 권장합니다.**

### 방법 1 — 환경 변수 (권장)

`.env.local`에 추가합니다.

```env
# 로그인·가입 페이지 경로 (proxy.ts auth.protect() 리다이렉트 대상)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup

# 로그인·가입 완료 후 이동 경로
# FALLBACK: redirect_url 파라미터가 없을 때만 사용 (일반적으로 이걸로 충분)
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/home
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/home

# FORCE: 항상 강제로 이동 (redirect_url 파라미터도 무시, 필요한 경우에만)
# NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/home
# NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/home
```

### 방법 2 — `ClerkProvider` props

현재 `app/layout.tsx`에 적용된 방식입니다. 환경 변수 없이 코드 안에서 관리할 때 씁니다.

```tsx
<ClerkProvider
  signInUrl="/login"
  signUpUrl="/signup"
  signInFallbackRedirectUrl="/home"
  signUpFallbackRedirectUrl="/home"
>
```

> **두 방식을 동시에 쓰면 `ClerkProvider` props가 우선**합니다. 한 곳에서만 관리하는 것을 권장합니다.

---

## Clerk 대시보드 기본 설정

Clerk Dashboard에서 프로젝트를 선택한 뒤 아래 항목을 확인합니다.

- Sign-in URL: `/login`
- Sign-up URL: `/signup`

> **Clerk Core 2 주의**: Dashboard의 "After sign-in / After sign-up URL" 항목은 Core 2에서 제거되었습니다.  
> 로그인·가입 후 이동 경로는 아래 "리다이렉트 URL 설정" 섹션의 환경 변수 또는 `ClerkProvider` props로 관리합니다.

인증 방식:

- Email + Password: Enabled
- Google: Enabled (아래 연동 절차 참고)
- Apple: Enabled (아래 연동 절차 참고)

---

## Google 소셜 로그인 설정

### 1) Google Cloud Console

- API 및 서비스 > 사용자 인증 정보
- OAuth 클라이언트 ID 생성 (애플리케이션 유형: 웹 애플리케이션)
- Authorized JavaScript origins
  - `http://localhost:3000`
  - (배포 도메인 추가 예정 시 함께 등록)
- Authorized redirect URI
  - Clerk에서 제공하는 Google Redirect URL을 그대로 등록

### 2) Clerk Dashboard

- User & Authentication > Social Connections > Google
- Google Client ID / Client Secret 입력
- 저장 후 활성화

---

## Apple 소셜 로그인 설정

### 1) Apple Developer

- Certificates, IDs & Profiles
- Services ID 생성 후 Sign in with Apple 활성화
- Return URL에 Clerk에서 제공하는 Apple Redirect URL 등록
- Key(`.p8`) 생성 후 아래 값 확보
  - Key ID
  - Team ID
  - Services ID (Client ID)
  - Private Key 내용

### 2) Clerk Dashboard

- Social Connections > Apple
- Key ID, Team ID, Services ID, Private Key 입력
- 저장 후 활성화

---

## 동작 확인 체크리스트

- `/login`
  - 이메일/비밀번호 로그인 성공
  - Google 로그인 성공
  - Apple 로그인 성공
- `/signup`
  - 이메일/비밀번호 회원가입 성공
  - 이메일 인증 코드 입력 분기 정상 동작
  - Google/Apple 가입 경로 정상 동작
- 보호 라우트 직접 접근 시 비로그인 상태에서 인증 유도
- `/mypage` 로그아웃 시 세션 종료 + 홈 이동

---

## 트러블슈팅

### 1) `middleware` deprecate 경고

Next.js 16에서는 `middleware` 컨벤션이 `proxy`로 전환되는 경고가 표시될 수 있습니다.
현재 동작에는 영향이 없지만, 추후 `proxy.ts`로 마이그레이션을 권장합니다.

### 2) 소셜 로그인 버튼 클릭 후 실패

- Clerk Social Connection 활성화 여부 확인
- Google/Apple 콘솔의 Redirect URL 오탈자 확인
- 로컬 도메인(`http://localhost:3000`) 등록 여부 확인

### 3) 회원가입 후 인증 코드 단계에서 실패

- Clerk Email verification 정책 확인 (email_code 사용 가능 여부)
- 스팸함 확인
- 코드 만료 시 재시도

### 4) 소셜 로그인 직후 랜딩(`/`)으로만 돌아오는 경우

- Clerk Dashboard **Paths**에서 **Sign-in URL**이 `/login`, **Sign-up URL**이 `/signup`인지 확인합니다.  
  루트 `/`로 두면 `auth.protect()`가 비로그인 사용자를 보낼 때 **로그인 화면이 아니라 랜딩**으로만 보일 수 있습니다.
- **After sign-in / After sign-up**은 Clerk Core 2에서 Dashboard에서 설정하지 않습니다.  
  위 "리다이렉트 URL 설정" 섹션의 **환경 변수 또는 `ClerkProvider` props**(`signInFallbackRedirectUrl` 등)로 설정합니다.
- 랜딩 페이지는 서버에서 `auth()`로 이미 로그인된 사용자를 `/home`으로 보냅니다(세션은 있는데 URL만 `/`인 경우 보완).

---

## 백엔드 연동 전제 참고

현재는 프론트 중심 Clerk 인증 전환 상태입니다.
백엔드 통합 시에는 다음이 필요합니다.

- 백엔드에서 Clerk JWT 검증
- `clerk_user_id` 기반 사용자 매핑
- 프론트 API 요청 시 Clerk 세션 토큰 전달 방식 정리

이 문서는 프론트 운영 설정을 우선으로 관리합니다.
