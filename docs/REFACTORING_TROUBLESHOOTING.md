# TeamUp Front 리팩토링 트러블슈팅 기록

리팩토링 과정에서 실제로 발생했던 이슈를 증상, 원인, 해결 방법, 재발 방지 관점으로 정리한 문서입니다.

---

## Severity 기준

- `[Critical]`: 권한/보안/데이터 무결성 훼손 가능, 즉시 수정 대상
- `[Major]`: 기능 오동작/접근성/상태 불일치로 사용자 영향이 큰 이슈
- `[Minor]`: 품질 개선/일관성/유지보수성 중심 이슈

---

## 1) [Major] 매치 생성 시 `TypeError: Failed to fetch`

- **증상**
  - 매치 생성 요청 시 `Failed to fetch` 발생
  - 네트워크/응답 실패 시 로컬 fallback으로 내려가지 않음
- **원인**
  - 서비스 레이어 `try/catch` 내부에서 API 호출 Promise를 `await`하지 않아 reject가 catch 경계 밖에서 처리됨
- **해결**
  - `lib/services/match.ts`의 API 호출을 `return await ...` 형태로 통일
  - 예외가 `catch`에서 잡히도록 수정해 로컬/mock 경로로 정상 fallback
- **재발 방지**
  - fallback이 필요한 service 함수에서는 `try` 안의 비동기 호출을 반드시 `await`
  - 에러 핸들링 테스트(네트워크 실패 시나리오) 추가

---

## 2) [Critical] 호스트 권한 누락으로 타인 경기 관리 가능

- **증상**
  - 주최자 화면에서 내 경기가 아닌 데이터 접근/조작 가능성 존재
- **원인**
  - 단일 전역 role 체크만 있고, `match.hostId === currentUserId` 기반의 리소스 단위 검증 부재
- **해결**
  - `lib/services/match.ts`에 `assertLocalHostAccess` 추가
  - 신청 목록 조회/확정/환불/상태 변경/수정에 일괄 적용
  - 호스트 리스트도 `listHostedMatches()`로 현재 사용자 기준 필터링
- **재발 방지**
  - UI 가드 + 서비스 레이어 가드 이중 적용 유지
  - “타인 리소스 접근” 테스트 케이스 고정화

---

## 3) [Critical] 주최자가 자신의 경기에 참가 가능

- **증상**
  - 동일 사용자가 주최자이면서 참가 신청까지 가능
- **원인**
  - 신청 로직에서 host/user 동일성 검증 누락
- **해결**
  - `applyToMatchLocal`, `applyToMatch`에 `SELF_HOST_APPLY_FORBIDDEN` 예외 처리 추가
  - UI 메시지로 명확히 피드백
- **재발 방지**
  - 신청 전 검증 규칙을 서비스 레이어 단일 지점으로 관리

---

## 4) [Minor] 하단 네비게이션이 페이지 전환 시 좌우로 흔들림

- **증상**
  - 탭 이동할 때 네비게이션이 미세하게 오른쪽/왼쪽으로 움직임
- **원인**
  - 페이지별 스크롤바 표시 여부 변화로 viewport 너비가 바뀜
- **해결**
  - `app/globals.css`에 `html { scrollbar-gutter: stable; }` 적용
- **재발 방지**
  - 고정 하단/상단 레이아웃이 있는 앱은 스크롤 거터 안정화 기본 적용

---

## 5) [Minor] 리스트 카드 간격(`space-y`)이 적용되지 않음

- **증상**
  - `space-y-*`를 늘려도 카드 간격이 체감되지 않음
- **원인**
  - 카드 래퍼인 `Link`가 inline 요소라 vertical spacing이 정상 반영되지 않음
- **해결**
  - 리스트의 `Link` 래퍼에 `className="block"` 추가
- **재발 방지**
  - 카드 리스트에서 링크 래퍼는 block/flex 컨테이너로 통일

---

## 6) [Major] 하단 네비게이션 불필요 리렌더/강조 점 로직 혼선

- **증상**
  - 페이지 이동 시 하단 네비게이션 리렌더 체감
  - 주최 아이콘이 비활성 상태에서도 강조(주황 점/틴트)되는 혼선
- **원인**
  - 각 페이지에 네비 중복 렌더
  - `hostedCount` 기반 강조 로직이 route active 상태와 섞여 동작
- **해결**
  - `app/(app)/layout.tsx`로 `BottomNav`를 공통 레이아웃으로 승격
  - 강조 점/`shouldEmphasizeHost` 로직 제거, `isActive` 단일 기준으로 정리
- **재발 방지**
  - 공통 UI는 레이아웃에 배치
  - 시각 상태는 route state 단일 소스로 관리

---

## 7) [Major] 색상 하드코딩 난립(유지보수 어려움)

- **증상**
  - 컴포넌트마다 `hex`, `bg-primary/*`, 그라데이션 불투명도 등이 제각각
  - 다크모드/브랜드 톤 조정 시 파일 다수 수정 필요
- **원인**
  - 색상 규칙이 전역 토큰이 아닌 컴포넌트 로컬 Tailwind 유틸에 분산
- **해결**
  - `app/globals.css`의 CSS 변수/semantic class로 중앙화
  - 예: `teamup-card-soft`, `teamup-icon-soft`, `status-badge-*`, `position-token-*`
  - 강한 오렌지 톤을 `#F2B538` 계열로 조정
- **재발 방지**
  - 신규 UI는 semantic class 우선, raw color/hex 직접 사용 지양
  - 디자인 변경은 `globals.css` 한 곳에서 처리

---

## 8) [Minor] 알림 아이콘 크기 변경이 화면에서 안 보임

- **증상**
  - 아이콘 클래스(`h-7 w-7`)를 키워도 시각적으로 변화 미미
- **원인**
  - `Button` 공통 스타일의 `[_svg:not([class*='size-'])]:size-4` 규칙이 SVG 크기를 덮어씀
- **해결**
  - 아이콘에 `h/w` 대신 `size-*` 사용 (`Bell className="size-7"`)
- **재발 방지**
  - shadcn 계열 버튼 내 SVG는 `size-*` 우선 사용

---

## 9) [Major] TypeScript 빌드 실패: 불가능한 비교 조건

- **증상**
  - `app/(app)/host/matches/[id]/page.tsx`에서
    `types '"CANCELLED" | "CONFIRMED"' and '"REFUNDED"' have no overlap`
- **원인**
  - 선행 조건에서 이미 타입이 좁혀진 뒤, 추가로 불가능한 상태 비교를 수행
- **해결**
  - 중복/불가능 비교(`app.status === 'REFUNDED'`) 제거
- **재발 방지**
  - 복합 조건 작성 시 타입 좁히기 결과를 기준으로 최소 조건만 유지

---

## 10) [Major] TypeScript 빌드 실패: 객체 키 중복(`actor`)

- **증상**
  - `lib/local-notifications.ts`에서 `'actor' is specified more than once`
- **원인**
  - 객체 리터럴에서 `actor` 직접 선언 + `...data` 스프레드로 중복 키 발생
- **해결**
  - `const { actor, ...rest } = data`로 분리 후 `...rest`, `actor` 순서로 단일 선언
- **재발 방지**
  - 스프레드 객체와 동일 키를 함께 선언할 때는 분해 할당으로 충돌 제거

---

## 11) [Critical] 서버 거절(4xx/5xx)까지 로컬 폴백되어 권한 모델 우회

- **증상**
  - API가 401/403/409/422 등으로 거절해도 프론트에서 로컬 fallback으로 “성공처럼” 처리됨
  - 인증/권한/중복 제약이 서버와 불일치
- **원인**
  - `matchService`의 `catch { return local... }`가 모든 예외를 동일 처리
  - 서버 응답 에러와 네트워크 단절/타임아웃을 구분하지 않음
- **해결**
  - `lib/services/client.ts`에 `ApiError` 및 `isNetworkOrTimeoutError` 추가
  - `lib/services/match.ts`에서 네트워크/타임아웃일 때만 로컬 fallback 허용
  - 서버 거절 응답은 그대로 throw
- **재발 방지**
  - fallback 정책은 “서버 미도달” 조건으로만 한정
  - 서비스 레이어에 예외 분류 유틸을 공통 사용

---

## 12) [Critical] 로컬 신청 취소 경로에서 본인 확인 누락

- **증상**
  - 원격 요청 실패 후 로컬 경로로 내려가면, `applicationId`만 알면 타인 신청 취소 가능
- **원인**
  - `cancelApplicationLocal()`에서 신청자 `userId`와 현재 사용자 일치 검증 누락
- **해결**
  - `found.userId !== getLocalUser().userId`면 `FORBIDDEN_APPLICATION_CANCEL` 에러 처리
- **재발 방지**
  - “자기 리소스만 조작 가능” 규칙은 원격/로컬 경로 모두 동일하게 강제

---

## 13) [Critical] 로컬 참가 확정에서 선검증 부족으로 상태 오염 가능

- **증상**
  - 취소/종료 매치에서도 확정 시도 가능
  - 잘못된 신청 ID 처리 시 의도치 않은 상태 변경 위험
  - 정원 체크 누락 시 확정 인원이 capacity를 초과할 수 있음
- **원인**
  - `confirmApplicationLocal()`에서 상태 전이 전에 대상/상태/정원 검증이 불충분
- **해결**
  - 아래 순서로 선검증 추가
    - 대상 신청 존재 여부
    - 매치 상태(`CANCELLED`, `ENDED`) 차단
    - 신청 상태(`PENDING_DEPOSIT`만 허용) 검증
    - `confirmedCount >= capacity` 차단
  - 검증 통과 후에만 `CONFIRMED` 전이
- **재발 방지**
  - 상태 전이 함수는 “검증 완료 후 write” 순서를 강제
  - 전이 전제조건(guard condition) 테스트 케이스 유지

---

## 14) [Critical] 로컬 환불에서 매치 소속 검증 전에 상태 업데이트 수행

- **증상**
  - 잘못된 `applicationId`가 들어오면 다른 매치 신청이 먼저 `REFUNDED`로 바뀔 가능성
- **원인**
  - `refundApplicationLocal()`에서 현재 매치 대상(`target`) 존재 확인 전에 `updateStoredApplicationStatus` 실행
- **해결**
  - `target` 존재 검증 실패 시 즉시 `Application not found` throw
  - 검증 통과한 경우에만 환불 상태 업데이트
- **재발 방지**
  - 식별자 기반 업데이트는 “소속 검증 → 상태 변경” 순서 고정

---

## 15) [Major] 로컬 스토리지 파싱 시 배열 검증 누락(매치 저장소)

- **증상**
  - localStorage 값이 객체/문자열로 손상된 경우 오프라인 매치 흐름에서 런타임 에러 발생 가능
- **원인**
  - `safeParse()`는 JSON 문법만 검증하며, `Match[]` 형태 검증(`Array.isArray`)이 없었음
- **해결**
  - `getStoredMatches()`에 `Array.isArray(parsed)` 가드 추가
- **재발 방지**
  - JSON 파싱 후에는 구조 타입(배열/객체) 검증을 기본 규칙으로 적용

---

## 16) [Major] 로컬 스토리지 파싱 시 배열 검증 누락(신청 저장소)

- **증상**
  - 신청 데이터가 배열이 아니면 `.filter()/.map()` 호출 지점에서 신청 플로우 전체가 실패할 수 있음
- **원인**
  - `getStoredApplications()`에서 `JSON.parse(raw)` 결과를 배열로 검증하지 않음
- **해결**
  - `Array.isArray(parsed) ? parsed : []` 형태로 방어 로직 추가
- **재발 방지**
  - 저장소 read 함수는 파싱 + 구조 검증 + 실패 시 안전 기본값 반환을 세트로 유지

---

## 17) [Major] 매치 수정 후 파생 필드(`status/count`) 재계산 누락

- **증상**
  - 정원 변경 후에도 이전 상태(`FULL` 등)가 남아 실제 인원과 상태가 불일치
- **원인**
  - `updateMatchLocal()`이 `patchStoredMatch()` 결과를 그대로 반환해 파생 필드 재계산 누락
- **해결**
  - `updateMatchLocal()`에서 수정 후 `recalcMatchCounts(updated)`를 반환하도록 변경
- **재발 방지**
  - 도메인 파생 필드가 있는 엔티티는 write 이후 재계산 훅을 표준화

---

## 18) [Major] 선택지 카드의 키보드 접근성 부족(`div` click 기반)

- **증상**
  - 탭 이동/엔터/스페이스 선택 불가, 선택 상태 전달 부족
- **원인**
  - 선택지를 `Card(div)` + `onClick`으로만 구현하여 인터랙션 의미가 누락됨
- **해결**
  - 선택지 요소를 `button`으로 교체
  - `type="button"`, `aria-pressed` 및 `focus-visible` 스타일 적용
- **재발 방지**
  - 선택/토글 UI는 semantic element(`button`/`radio`) 우선 사용

---

## 19) [Major] 취소·환불 이후 오래된 활성 신청이 다시 유효로 오판

- **증상**
  - 신청 취소/환불 후 재신청하지 않았는데도 UI가 "입금 대기 중" 등 활성 상태로 표시
  - `CONFIRMED(오래됨) + REFUNDED(최신)` 이력이 공존하면 활성 신청으로 오판
- **원인**
  - `pickActiveApplicationForUserOnMatch()`에서 활성 상태만 먼저 필터링한 뒤 최신순 정렬  
    → 더 최신인 `CANCELLED`/`REFUNDED`가 있어도 오래된 `CONFIRMED`가 반환될 수 있음
- **해결**
  - 같은 매치/유저의 전체 이력을 **최신순 정렬 먼저** 처리 후, 1건(가장 최신)의 상태만 판정  
    → 최신 건이 활성(`PENDING_DEPOSIT`/`CONFIRMED`)이 아니면 `null` 반환
  - `lib/match-local-store.ts` 수정
- **재발 방지**
  - "상태 판정은 최신 이력 1건 기준" 원칙을 로컬 스토어 유틸에 일관 적용

---

## 20) [Major] 무료 경기(fee=0) 생성 시 빈 `depositAccount`가 API에 전송

- **증상**
  - 참가비를 0원으로 설정하면 폼 제출은 되지만, 빈 문자열 `""` 그대로 API에 전달되어 요청 실패 가능
- **원인**
  - `isMatchFormSubmittable()`은 `fee === 0`일 때 `depositAccount`를 비워도 허용  
    그러나 `toMatchPayload()`는 무조건 `depositAccount: values.depositAccount.trim()` 전송
  - `CreateMatchRequest` / `UpdateMatchRequest` 타입이 `depositAccount: string`(필수)로 선언
- **해결**
  - `types/match.ts`: `depositAccount`를 `string?`(선택적)으로 변경
  - `toMatchPayload()`: `fee === 0`이면 `depositAccount: undefined` (필드 미전송)  
    유료이더라도 빈 값이면 `undefined`로 처리해 `""` 전송 방지
- **재발 방지**
  - 조건부 필수 필드는 타입에서도 optional로 선언하고, payload 변환 함수에서 조건 처리

---

## 21) [Major] HTTP 헬퍼에서 falsy body가 전송 누락

- **증상**
  - `post`/`put`/`patch`/`del`에 `0`, `false`, `""`, `null` 같은 falsy 값을 body로 전달하면 body가 비어 전송됨
- **원인**
  - `body: data ? JSON.stringify(data) : undefined` 조건으로 falsy 값을 `undefined`로 처리
- **해결**
  - `data !== undefined ? JSON.stringify(data) : undefined` 로 변경  
    → `undefined`를 명시적으로 생략한 경우에만 body 미전송
  - `lib/services/client.ts`의 `post` · `put` · `patch` · `del` 모두 일괄 수정
- **재발 방지**
  - HTTP body 생략 조건은 `=== undefined`로만 제한. falsy 전체를 생략 조건에 두지 않는다

---

## 빠른 체크리스트

- 서비스 fallback 함수의 비동기 호출은 `await` 했는가?
- 서버 거절(4xx/5xx)과 네트워크 실패를 구분해 처리하는가?
- 권한 검증이 UI와 서비스 레이어에 모두 있는가?
- 로컬 fallback 경로에도 동일한 권한 검증이 들어가 있는가?
- 공통 네비/헤더가 레이아웃에 배치되어 있는가?
- 카드/리스트 래퍼가 block 레벨인가?
- 색상 값이 전역 토큰/semantic class로 관리되는가?
- TS 복합 조건에서 불가능 비교를 만들고 있지 않은가?
- 객체 스프레드 시 중복 키가 없는가?
- 상태 판정은 최신 이력 1건 기준으로 하는가?
- 조건부 필수 필드는 타입에서 optional이고, payload 변환에서 조건 처리하는가?
- HTTP body 생략 조건이 `=== undefined`로만 되어 있는가?

