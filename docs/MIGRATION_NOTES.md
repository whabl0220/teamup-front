# localStorage → MSW API 전환 가이드

## ✅ 완료된 페이지

다음 페이지들은 API 호출 방식으로 전환되었습니다:

1. **home/page.tsx** - 완전 전환 완료
2. **matching/page.tsx** - 완전 전환 완료
3. **coaching/page.tsx** - 완전 전환 완료

## 🔄 남은 작업

다음 페이지들은 아직 localStorage를 사용하고 있습니다. 필요시 API 호출 방식으로 전환하세요:

### 우선순위 높음
- `app/(app)/notifications/page.tsx` - 알림 페이지
- `app/(app)/mypage/page.tsx` - 마이페이지
- `app/(app)/profile/edit/page.tsx` - 프로필 수정
- `app/(app)/profile/basic/page.tsx` - 기본 정보 수정

### 우선순위 중간
- `app/(app)/coaching/create/CoachingPageContent.tsx` - 코칭 생성 (일부만 localStorage 사용)
- `app/(app)/coaching/[id]/page.tsx` - 코칭 상세
- `app/team/create/page.tsx` - 팀 생성 (일부만 localStorage 사용)

### 우선순위 낮음
- `app/(app)/map/page.tsx` - 지도 (Post 데이터는 localStorage 사용)
- `app/(app)/mypage/posts/page.tsx` - 내 게시글
- `app/(app)/player/[id]/page.tsx` - 플레이어 상세
- `app/(auth)/login/page.tsx` - 로그인 (setAppData만 사용, 유지 가능)

## 전환 방법

### 예시: localStorage → API 호출

**이전 (localStorage):**
```typescript
import { getCurrentUser, getCurrentTeam } from '@/lib/storage'

const user = getCurrentUser()
const team = getCurrentTeam()
```

**이후 (API 호출):**
```typescript
import { userService, teamService } from '@/lib/services'

const user = await userService.getMe()
const teams = await teamService.getMyTeams()
const team = teams.length > 0 ? teams[0] : null
```

## 주의사항

1. **비동기 처리**: API 호출은 `async/await` 사용
2. **로딩 상태**: `useState`로 로딩 상태 관리
3. **에러 처리**: `try/catch`로 에러 처리
4. **타입 변환**: API 응답을 프론트엔드 타입으로 변환 필요

## storage.ts 정리

`lib/storage.ts`는 다음 용도로만 사용 가능:
- `formatTimeAgo()` → `lib/utils.ts`로 이동 완료
- 임시 데이터 저장 (Post 등, 향후 API로 전환 예정)

`initMockData()`는 더 이상 사용하지 않습니다. MSW가 자동으로 mock 데이터를 제공합니다.

