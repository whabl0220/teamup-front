# TeamUp Front 리팩토링 트러블슈팅 기록

리팩토링 과정에서 실제로 발생했던 이슈를 증상, 원인, 해결 방법, 재발 방지 관점으로 정리한 문서입니다.

---

## 1) 매치 생성 시 `TypeError: Failed to fetch`

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

## 2) 호스트 권한 누락으로 타인 경기 관리 가능

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

## 3) 주최자가 자신의 경기에 참가 가능

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

## 4) 하단 네비게이션이 페이지 전환 시 좌우로 흔들림

- **증상**
  - 탭 이동할 때 네비게이션이 미세하게 오른쪽/왼쪽으로 움직임
- **원인**
  - 페이지별 스크롤바 표시 여부 변화로 viewport 너비가 바뀜
- **해결**
  - `app/globals.css`에 `html { scrollbar-gutter: stable; }` 적용
- **재발 방지**
  - 고정 하단/상단 레이아웃이 있는 앱은 스크롤 거터 안정화 기본 적용

---

## 5) 리스트 카드 간격(`space-y`)이 적용되지 않음

- **증상**
  - `space-y-*`를 늘려도 카드 간격이 체감되지 않음
- **원인**
  - 카드 래퍼인 `Link`가 inline 요소라 vertical spacing이 정상 반영되지 않음
- **해결**
  - 리스트의 `Link` 래퍼에 `className="block"` 추가
- **재발 방지**
  - 카드 리스트에서 링크 래퍼는 block/flex 컨테이너로 통일

---

## 6) 하단 네비게이션 불필요 리렌더/강조 점 로직 혼선

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

## 7) 색상 하드코딩 난립(유지보수 어려움)

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

## 8) 알림 아이콘 크기 변경이 화면에서 안 보임

- **증상**
  - 아이콘 클래스(`h-7 w-7`)를 키워도 시각적으로 변화 미미
- **원인**
  - `Button` 공통 스타일의 `[_svg:not([class*='size-'])]:size-4` 규칙이 SVG 크기를 덮어씀
- **해결**
  - 아이콘에 `h/w` 대신 `size-*` 사용 (`Bell className="size-7"`)
- **재발 방지**
  - shadcn 계열 버튼 내 SVG는 `size-*` 우선 사용

---

## 9) TypeScript 빌드 실패: 불가능한 비교 조건

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

## 10) TypeScript 빌드 실패: 객체 키 중복(`actor`)

- **증상**
  - `lib/local-notifications.ts`에서 `'actor' is specified more than once`
- **원인**
  - 객체 리터럴에서 `actor` 직접 선언 + `...data` 스프레드로 중복 키 발생
- **해결**
  - `const { actor, ...rest } = data`로 분리 후 `...rest`, `actor` 순서로 단일 선언
- **재발 방지**
  - 스프레드 객체와 동일 키를 함께 선언할 때는 분해 할당으로 충돌 제거

---

## 빠른 체크리스트

- 서비스 fallback 함수의 비동기 호출은 `await` 했는가?
- 권한 검증이 UI와 서비스 레이어에 모두 있는가?
- 공통 네비/헤더가 레이아웃에 배치되어 있는가?
- 카드/리스트 래퍼가 block 레벨인가?
- 색상 값이 전역 토큰/semantic class로 관리되는가?
- TS 복합 조건에서 불가능 비교를 만들고 있지 않은가?
- 객체 스프레드 시 중복 키가 없는가?

