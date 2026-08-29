# WAYLOG Codex 개발 지침 v2.0

## 1. 기본 원칙

이 프로젝트는 기존 WAYLOG를 새로 만드는 작업이 아니다.

항상 다음 순서로 진행한다.

1. `WAYLOG_SPEC.md`를 읽는다.
2. 현재 코드베이스를 확인한다.
3. 이미 정상 동작하는 기능을 파악한다.
4. 명세와 코드의 차이를 먼저 보고한다.
5. 이번 요청 범위만 최소 변경한다.
6. 구현 후 lint / build / 관련 기능을 검증한다.

**현재 정상 동작하는 기능을 특별한 이유 없이 다시 만들거나 제거하지 않는다.**

---

## 2. Source of Truth

제품 요구사항의 최신 기준:

`WAYLOG_SPEC.md`

과거 명세는 참고용 archive이며 최신 명세보다 우선하지 않는다.

단, 명세와 실제 코드가 충돌하면 임의로 코드를 대규모 수정하지 않는다.

먼저 다음을 보고한다.

- 현재 구현
- 명세 요구사항
- 차이
- 필요한 변경
- 영향 파일
- 위험 요소

그 후 승인된 범위만 수정한다.

---

## 3. 보호할 기존 기능

현재 정상 동작한다면 유지한다.

- Journey CRUD
- Unsplash Cover
- Days
- Planner
- Google Maps
- Places 기반 좌표
- Moment CRUD
- Moment Photo Upload
- Timeline
- Passport / Country Stamp
- Responsive UI
- 기존 데이터
- 기존 Map loader / cache 구조

새 기능 때문에 기존 기능을 다시 작성하지 않는다.

---

## 4. 현재 제품 방향

WAYLOG의 핵심 흐름:

```text
PLAN
→ TRAVEL
→ REMEMBER
```

현재 개발 우선순위:

```text
Planner / Map 안정화
→ Place Explorer
→ Travel Profile
→ AI Recommendation
→ Content / URL AI Import
→ Bulk Photo Organizer
```

뒤 단계의 기능을 앞 단계 구현 중 임의로 추가하지 않는다.

---

## 5. Place Explorer 개발 원칙

Place Explorer는 기존 Planner 안에 추가한다.

목표:

```text
Journey
→ 장소 찾기
→ Google Places
→ Place Cards ↔ Existing Map
→ Day에 추가
```

초기 카테고리:

- 맛집
- 카페
- 명소
- 숙소

새 Explore 서비스나 자체 여행 장소 DB를 만들지 않는다.

기존 Planner 데이터 구조를 우선 재사용한다.

---

## 6. Google Maps / Places 호출 규칙

API quota와 비용을 중요 요구사항으로 취급한다.

반드시 지킨다.

- Planner 내부 탭 변경만으로 Map을 재로드하지 않는다.
- 가능한 경우 기존 Map instance를 유지한다.
- 카드 hover / marker hover로 API를 호출하지 않는다.
- 지도 이동만으로 Places 검색을 자동 실행하지 않는다.
- 사용자가 검색 또는 `이 지역에서 검색`을 실행했을 때 요청한다.
- 동일 검색은 허용되는 범위에서 cache를 우선 사용한다.
- 장소 상세정보는 필요한 시점에 Lazy Load한다.
- 검색 결과 전체에 상세 요청을 반복하지 않는다.
- 무한 retry / 자동 요청 loop를 만들지 않는다.
- quota/API 오류가 Planner 전체 실패로 이어지지 않게 한다.

Google Maps Platform의 현재 저장·캐싱 정책을 확인해야 하는 구현이라면 임의로 영구 캐시를 만들지 말고 먼저 보고한다.

---

## 7. Planner ↔ Map Interaction

다음 인터랙션은 프런트 상태로 처리한다.

```text
Place Card hover
→ Marker 강조

Place Card click
→ Marker 선택

Marker click
→ Place Card 강조 / 이동
```

이 동작 자체로 추가 Google API 요청을 발생시키지 않는다.

---

## 8. 데이터 변경 원칙

현재 데이터 모델을 먼저 확인한다.

금지:

- 기존 테이블 임의 삭제
- 기존 필드 임의 제거
- 기존 itinerary 구조 폐기
- destructive migration

필요한 경우 additive change를 우선한다.

DB migration이 필요하면 구현 전에 변경 이유와 schema diff를 보고한다.

---

## 9. AI 개발 원칙

현재 Place Explorer 구현 중 AI 기능을 같이 만들지 않는다.

향후 AI 기능에서는 역할을 구분한다.

```text
Google Places
= 실제 장소 / 위치 Grounding

WAYLOG
= Journey / Planner Context

LLM
= 추천 / 해석 / 일정 제안
```

LLM이 생성한 장소를 검증 없이 확정 장소로 저장하지 않는다.

AI 결과:

```text
Generate
→ User Review
→ Approve
→ Apply
```

Human-in-the-Loop을 기본으로 한다.

---

## 10. Provider / Secret

향후 LLM을 붙일 경우 UI에서 Provider API를 직접 호출하지 않는다.

필요한 최소 수준의 Provider Adapter를 사용한다.

API Key:

- Git 커밋 금지
- `.env` 사용
- 서버 전용 Secret Client 노출 금지
- Google Key는 필요한 API / 도메인 restriction 적용
- Supabase Service Role Key Client 노출 금지

---

## 11. UI 변경 원칙

기존 WAYLOG Editorial 디자인을 유지한다.

기능 추가를 이유로 전체 UI를 재설계하지 않는다.

경쟁 서비스는 Workflow 참고만 가능하다.

Wanderlog / Mindtrip 등의 화면을 그대로 복제하지 않는다.

Place Explorer 역시 기존 Planner 디자인 시스템 안에서 구현한다.

---

## 12. 코드 품질

- TypeScript strict 유지
- `any` 최소화
- 기존 lint / formatter 유지
- 기존 dependency 우선 사용
- 불필요한 package 추가 금지
- API 호출 로직과 UI 상태를 가능한 분리
- 기존 loader를 이유 없이 교체하지 않음
- 중복 로직 최소화
- build를 깨뜨리지 않음

---

## 13. 테스트

변경 후 최소 확인:

```text
npm run lint
npm run build
```

그리고 변경 범위에 따라 확인한다.

Place Explorer 작업이라면:

- 기존 Planner
- 기존 Map
- 장소 검색
- Place Card ↔ Marker
- Day 추가
- 동일 검색 중복 호출
- 탭 이동 시 Map 재초기화 여부
- API 오류
- 모바일
- Moment
- Passport 회귀

API 호출 최적화 작업에서는 Network 요청 수를 확인한다.

---

## 14. 작업 단위

한 번에 큰 기능을 구현하지 않는다.

권장:

```text
Step 1 UI shell
Step 2 Places search
Step 3 Map interaction
Step 4 Add to itinerary
Step 5 Cache / quota guard
Step 6 Error state
Step 7 Test
```

각 단계에서 기존 기능을 확인한다.

---

## 15. 금지 사항

사용자 승인 없이 다음을 하지 않는다.

- Production push
- Production deploy
- 대규모 refactor
- 전체 UI redesign
- DB destructive migration
- 기존 기능 제거
- AI / RAG / Agent 동시 도입
- 새로운 인증 구조 도입
- Route Optimization 도입
- Booking 기능 도입

---

## 16. Codex의 첫 응답 형식

개발 요청을 받으면 바로 코드를 수정하지 말고 먼저 짧게 보고한다.

```text
현재 상태:
- ...

이번 변경:
- ...

영향 파일:
- ...

데이터/API 영향:
- ...

구현 순서:
1. ...
2. ...
3. ...

위험 요소:
- ...
```

단순하고 위험이 낮은 수정은 불필요하게 장황하게 분석하지 않는다.

---

## 17. 다음 개발 요청의 기본 범위

현재 다음 작업은 Place Explorer다.

```text
Planner
→ [내 일정] [장소 찾기]
→ Google Places Search
→ Place Cards
↔ Existing Map
→ Add to Day
→ Cache / Quota Guard
```

현재 제외:

```text
AI Recommendation
Travel Profile 구현
URL Import
RAG
Bulk Photo Import
Route Optimization
Booking
SNS
```

**첫 목표는 기존 기능을 깨뜨리지 않고 Place Search → Map → Planner 저장의 End-to-End를 성공시키는 것이다.**
