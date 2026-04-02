# API 명세 정합성 (기존 `API_SPEC.md` 대비)

백엔드가 작성한 [API_SPEC.md](./API_SPEC.md)와 **현재 프론트엔드 구현**(`lib/services/match-api.ts`, `lib/services/user.ts`, `lib/services/auth.ts`)을 맞추기 위한 분류입니다.
추가·수정 요청 시 이 문서를 기준으로 협의하면 됩니다.

---

## 1. 그대로 사용해도 되는 것

기존 명세와 경로·역할이 크게 맞고, 프론트도 동일하게 호출하거나(또는 백엔드만 구현하면 바로 연동 가능한) 항목입니다.

| 기존 명세 | 비고 |
|-----------|------|
| `GET /api/users/me` | 마이페이지 등에서 사용 중. 응답 스키마는 명세가 더 넓을 수 있음(추가 필드는 무시 가능). |
| `GET /api/matches` | 목록 조회. **쿼리 파라미터만** 아래 [수정 필요](#2-수정-합의가-필요한-것)와 정렬 필요. |
| `GET /api/matches/{matchId}` | 매치 상세. |
| `POST /api/matches` | 주최 매치 생성. |
| `PATCH /api/users/profile` | 프로필 수정. 프론트 `userService.updateMe`와 일치. |
| `PATCH /api/matches/{matchId}/status` | 매치 상태 변경. 프론트 `matchApi.updateMatchStatus`와 일치. |
| `GET /api/courts` | 매치 생성 시 구장 검색(프론트는 추후 연동 예정이어도 명세와 일치). |
| `GET /api/courts/{courtId}` | 구장 상세(동일). |
| `POST /api/users/sync` | Clerk 웹훅용. **프론트 직접 호출 아님** — 백엔드·인프라 설정 영역. |
| `POST /api/matches/{matchId}/evaluations` | 평가(프론트 미구현·추후 기능). 명세 유지 가능. |
| `POST /api/matches/{matchId}/no-shows` | 노쇼 신고(동일). |

---

## 2. 수정 합의가 필요한 것

명세와 **쿼리**가 아직 맞지 않거나 보류 중인 항목입니다.

| 구분 | 기존 `API_SPEC.md` | 현재 프론트 구현 | 합의 포인트 |
|------|-------------------|------------------|-------------|
| 매치 목록 필터 | `date`, `regionId` 쿼리 | `from`, `to`, `status`, `level` (`buildMatchListQuery`) | **임시 보류.** 홈 UX 확정 후 `API_SPEC.md`와 정렬. |

프로필 수정(`PATCH /api/users/profile`)과 매치 상태 변경(`PATCH /api/matches/{matchId}/status`)은 백엔드 명세에 맞춰 프론트를 반영함.

---

## 3. 새로 개설(또는 명세에 명시)이 필요한 것

기존 `API_SPEC.md`에 없지만 **현재 프론트가 이미 호출하도록 구현된** 엔드포인트입니다. 백엔드에 **신규 추가**하거나, 명세에 **누락분으로 보강**해 주시면 됩니다.

### 매치 신청·주최자 운영 (필수)

| 메서드 | 경로 | 용도 (프론트) |
|--------|------|----------------|
| `POST` | `/api/matches/{matchId}/applications` | 참가 신청 |
| `DELETE` | `/api/matches/{matchId}/applications/{applicationId}` | 신청 취소 |
| `GET` | `/api/matches/{matchId}/applications` | 주최자: 신청자 목록 |
| `PUT` | `/api/matches/{matchId}/applications/{applicationId}/confirm` | 입금 확인 후 확정 |
| `PUT` | `/api/matches/{matchId}/applications/{applicationId}/refund` | 환불 처리 |
| `PUT` | `/api/matches/{matchId}` | 주최자: 매치 정보 수정 |

### 사용자·레거시 인증 (프론트 코드 상 존재)

| 메서드 | 경로 | 비고 |
|--------|------|------|
| `GET` | `/api/users/{userId}/teams` | 팀 목록(마이페이지 등에서 사용 가능). 명세에 없음. |
| `POST` | `/api/auth/signup` | `authService`에 정의. **Clerk 전환 후 미사용**일 수 있음 — 백엔드 정책에 따라 유지/제거 결정. |
| `POST` | `/api/auth/login` | 동일. |

---

## 참고: 프론트 소스 위치

- 매치 API 래퍼: `lib/services/match-api.ts`
- 유저 API: `lib/services/user.ts`
- 레거시 auth: `lib/services/auth.ts`

이 문서는 협업 시 스냅샷이므로, 최종 계약은 OpenAPI 또는 공용 스펙 저장소와 함께 갱신하는 것을 권장합니다.
