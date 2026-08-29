# WAYLOG 제품·기술명세서 v2.0

> Status: Source of Truth 후보  
> Update strategy: 기존 v1.3을 폐기하지 않고 보존하며, 현재 구현 상태와 다음 제품 방향을 반영한 v2.0  
> Product flow: **Plan → Travel → Remember**

---

# 1. Project Overview

## 프로젝트명
WAYLOG

## 제품 정의
WAYLOG는 여행을 계획하고, 실제 여행 중 일정을 확인·수정하고, 여행 후 사진과 순간을 기록하여 하나의 개인 여행 기록으로 남기는 Travel Journey Assistant다.

기존의 Digital Travel Diary 정체성을 유지하면서 Planner와 Map을 제품의 전반부에 연결한다.

핵심 경험:

Journey 생성  
→ Planner에서 일정 구성  
→ Map에서 장소와 동선 확인  
→ 실제 여행  
→ Moment / Photo / Diary 기록  
→ Travel Passport 자동 반영

핵심 메시지:

**Plan the journey. Remember the story.**

기존 메시지:

**Remember where life took you.**  
**여행이 끝나도, 그날의 기억은 남도록.**

---

# 2. Product Direction

WAYLOG의 핵심 제품 흐름은 다음과 같다.

```text
PLAN
Journey
→ Planner
→ Place Search
→ Map
→ Itinerary

TRAVEL
Itinerary 확인
→ 일정 수정
→ 실제 방문

REMEMBER
Moment
→ Photo
→ Timeline / Diary
→ Passport
```

WAYLOG는 장소 검색 서비스 자체가 목적이 아니다.

외부 장소 데이터는 Google Maps / Places를 활용하고, WAYLOG는 다음을 담당한다.

- Journey Context
- 여행 일정
- 장소 선택
- Day별 계획
- 실제 여행 기록
- Moment / Photo
- Passport
- 향후 AI 개인화

---

# 3. External Discover Layer

WAYLOG 외부에서 여행 콘텐츠를 발견할 수 있다.

예:

```text
MS ON TRIP / Blog / Travel Content
→ WAYLOG
→ Planner
→ Travel
→ Diary
```

향후에는 여행 글 또는 URL을 WAYLOG로 가져와 일정 초안으로 변환하는 AI Import를 검토한다.

단, 현재 Place Explorer 구현과 동시에 AI Import까지 확장하지 않는다.

---

# 4. Target User

주 사용자는 다음과 같다.

- 여행 전 이동 순서와 장소를 직접 정리하는 사용자
- 여행 계획과 지도를 한 화면에서 확인하고 싶은 사용자
- 여행 사진을 많이 찍지만 긴 여행기는 부담스러운 사용자
- 여행 계획을 여행 후 기록으로 자연스럽게 이어가고 싶은 사용자
- SNS보다 개인 여행 기록을 중요하게 생각하는 사용자

---

# 5. Core Concepts

핵심 도메인:

- Journey
- Day
- Place
- Planner
- Moment
- Story / Timeline
- Passport

향후 확장:

- Travel Profile
- AI Import
- AI Recommendation
- Bulk Photo Organizer

Journey 데이터는 여행 전체 Context의 Source of Truth 역할을 한다.

---

# 6. Current Implementation Baseline

v1.3 기준으로 아래 기능은 현재 구현된 것으로 간주하고 보호한다.

- Landing Page
- Dashboard
- Journey 생성 / 수정 / 삭제
- Unsplash Cover 검색 / 선택
- Unsplash Attribution / Download Tracking
- 날짜별 Day 자동 생성
- Moment 추가 / 수정 / 삭제
- Journey Timeline
- Travel Passport
- 방문 국가 / 도시 자동 집계
- Passport Summary
- Country Stamp / Stamp Grid
- 동일 국가 normalize / 중복 병합
- Passport Empty State
- Header / 모바일 Navigation의 Passport 진입
- Google Maps 기반 Journey Map
- Places 기반 좌표 저장
- Moment 사진 업로드
- 현재 정상 동작하는 Planner / Map 관련 구현

위 기능은 특별한 이유 없이 삭제하거나 다시 구현하지 않는다.

현재 코드베이스와 이 문서가 충돌하는 경우:
1. 먼저 실제 코드의 현재 동작을 확인한다.
2. 차이를 보고한다.
3. 사용자 승인 없이 대규모 구조 변경을 하지 않는다.

---

# 7. Current MVP Scope

현재 MVP의 목표는 다음 End-to-End 흐름을 안정적으로 제공하는 것이다.

```text
Create Journey
→ Select Cover
→ Generate Days
→ Plan Places
→ View on Map
→ Add / Edit Moments
→ View Timeline
→ View Passport
```

현재 MVP에 포함:

- Landing
- Dashboard
- Journey CRUD
- Unsplash Cover
- Days
- Planner
- Google Maps
- Places 기반 장소 / 좌표 처리
- Moment
- Moment Photo
- Timeline
- Passport
- Responsive UI
- Empty / Loading / Error State

현재 MVP에서 자동으로 확대하지 않는 범위:

- 완전한 AI 여행 일정 자동 생성
- 실시간 GPS 추적
- GPS 기반 방문 인증
- Google Photos 전체 연동
- SNS
- 댓글 / 좋아요 / 팔로우
- 결제
- Multi-Agent
- 복잡한 추천 엔진
- 대규모 자체 여행 장소 DB
- 원본 사진 Cloud 일괄 업로드

---

# 8. Planner

Planner는 여행 전 PLAN 단계의 핵심 화면이다.

기본 구조:

```text
┌──────────────────────┬─────────────────────────┐
│ Planner Panel        │ Map                     │
│                      │                         │
│ Day / Itinerary      │ Markers                 │
│ Places               │ Selected Place          │
│                      │ Route / Context         │
└──────────────────────┴─────────────────────────┘
```

Planner와 Map은 서로 독립된 제품이 아니라 하나의 작업 화면으로 동작한다.

Planner에서 선택한 장소는 지도에서 확인할 수 있어야 한다.

지도에서 선택한 장소도 Planner Context와 연결할 수 있어야 한다.

---

# 9. Place Explorer — Next MVP Feature

Planner 내부에 장소 탐색 기능을 추가한다.

권장 UI:

```text
[ 내 일정 ] [ 장소 찾기 ]
```

장소 찾기의 목적은 여행지 주변의 모든 정보를 자체 DB로 구축하는 것이 아니다.

Google Places를 활용하여 현재 Journey에 필요한 장소 후보를 탐색하고 기존 Planner 일정에 추가하는 것이 목적이다.

초기 카테고리:

- 맛집
- 카페
- 명소
- 숙소

필요 시 이후 확장한다.

---

# 10. Place Search Flow

```text
Journey Destination
+
Current Map Area
+
User Search / Category
        ↓
Cache 확인
        ↓
Google Places
        ↓
Place Result Cards
        ↕
Map Markers
        ↓
User selects place
        ↓
Add to Day
        ↓
Existing Planner Data
```

검색은 사용자 행동에 의해 명시적으로 실행한다.

지도를 이동했다는 이유만으로 자동 Places 검색을 반복하지 않는다.

권장 버튼:

**이 지역에서 검색**

---

# 11. Place Result Card

장소 검색 결과는 필요한 최소 정보부터 표시한다.

예:

```text
Place Name
Category
Rating
Address

[지도에서 보기]
[DAY 2에 추가]
```

기본 데이터 후보:

- place_id
- name
- category / types
- latitude
- longitude
- rating (available 시)
- address (available 시)

Google API 응답 정책 및 사용 조건에 따라 저장 가능한 데이터 범위를 확인하고 구현한다.

필요 이상의 장소 상세정보를 미리 요청하지 않는다.

---

# 12. Planner ↔ Map Interaction

장소 목록과 Map은 양방향으로 연결한다.

Place Card hover:
→ 해당 Map Marker 강조

Place Card click:
→ 해당 Marker 선택 / 필요 시 지도 이동

Marker click:
→ 해당 Place Card 강조 / 스크롤

중요:

**hover / selection 자체는 Google API 재호출을 발생시키지 않는다.**

이미 메모리에 존재하는 장소 결과와 좌표를 사용한다.

---

# 13. Add Place to Itinerary

사용자가 장소를 선택하면 기존 Planner의 특정 Day에 추가할 수 있다.

예:

```text
Cafe A
[ DAY 1 ]
[ DAY 2 ]
[ DAY 3 ]
```

저장 시 현재 Planner 데이터 모델을 우선 재사용한다.

새로운 테이블 또는 대규모 스키마 변경이 필요하다면 먼저 현재 코드와 데이터 모델을 확인하고 변경안을 보고한다.

임의로 기존 Journey / Day / Entry 구조를 폐기하지 않는다.

---

# 14. Maps / Places Cost & Quota Strategy

Google Maps / Places는 비용과 quota가 발생할 수 있으므로 다음 규칙을 제품 요구사항으로 취급한다.

## Map Loading

1. Planner 진입 시 Google Map을 필요한 시점에 로드한다.
2. Planner 내부 탭 변경 때문에 Map SDK / Map instance를 불필요하게 다시 생성하지 않는다.
3. 가능한 경우 동일 Planner 세션에서 Map instance를 유지한다.
4. 화면 상태 변경은 기존 Map instance의 marker / selection state를 갱신하는 방식으로 처리한다.

## Places Requests

5. 지도 이동만으로 Places 검색을 자동 실행하지 않는다.
6. 사용자가 검색 또는 **이 지역에서 검색**을 실행했을 때 요청한다.
7. 입력 검색에는 debounce를 적용할 수 있다.
8. 동일 조건의 검색은 캐시를 우선 확인한다.
9. 카드 hover / marker hover는 API 요청을 발생시키지 않는다.
10. 장소 상세정보는 사용자가 실제로 선택했을 때 Lazy Load한다.
11. 검색 결과 전체에 대해 상세 요청을 일괄 실행하지 않는다.
12. 이미 Journey / Planner에 저장된 장소는 저장된 식별자와 좌표를 우선 활용한다.

## Cache

초기 MVP에서는 다음 캐시를 사용할 수 있다.

- in-memory cache
- sessionStorage 등 브라우저 세션 캐시

단, Google Maps Platform의 데이터 저장/캐싱 정책을 위반하지 않도록 구현 전 현재 API 약관과 허용 범위를 확인한다.

영구 캐시는 무조건 도입하지 않는다.

## Failure / Quota

Quota 초과 또는 API 오류 시:

- Planner 전체가 실패하지 않아야 한다.
- 기존 저장 일정은 계속 표시한다.
- 지도 또는 장소 검색에 Error State를 제공한다.
- 불필요한 자동 retry loop를 만들지 않는다.

---

# 15. Google Maps / Places Architecture

권장 개념 구조:

```text
Browser
↓
WAYLOG Planner
├─ Existing Journey / Planner Data
├─ Map UI
└─ Place Explorer
       ↓
Server/API Layer where required
       ↓
Google Maps / Places
```

실제 구현은 현재 코드베이스의 Google Maps loader 및 Places 사용 방식을 우선 확인한다.

이미 정상 동작하는 loader를 새 라이브러리로 교체하지 않는다.

API Key는 필요한 Google Maps Platform 보안 권장사항을 적용한다.

- 허용 도메인 제한
- 필요한 API만 허용
- 서버용 Secret은 Client에 노출하지 않음
- 사용량 / quota / billing 모니터링

---

# 16. Grounding Rule

WAYLOG의 장소 정보 Source of Truth는 LLM이 아니다.

향후 AI 기능을 추가하더라도:

```text
Google Places
= 실제 장소 후보 / 위치 정보

WAYLOG
= Journey / Planner Context

LLM
= 해석 / 추천 / 일정 제안
```

AI가 생성한 장소 이름이나 위치를 검증 없이 Planner의 확정 장소로 저장하지 않는다.

---

# 17. Travel Profile — Planned

향후 개인화를 위해 Travel Profile을 도입할 수 있다.

Journey의 `companion`과 Travel Profile의 장기 선호는 구분한다.

예:

Journey companion:
- 이번 여행은 couple

Travel Profile:
- usual companion
- travel pace
- interests
- transport preference

초기 후보:

```text
travelPace:
relaxed | balanced | packed

interests:
food | cafe | nature | culture | shopping

transport:
car | public_transport | walking
```

Travel Profile은 현재 Place Explorer 구현의 필수 선행조건이 아니다.

---

# 18. AI Travel Assistant — Next Phase

AI 기능은 현재 Planner와 Place Explorer가 안정화된 뒤 단계적으로 추가한다.

입력 Context:

```text
Travel Profile
+
Current Journey
+
Current Day
+
Existing Itinerary
+
Validated Place Candidates
```

출력:

- 추천 장소
- 추천 이유
- 일정 순서 제안
- 시간대 제안
- 여행 스타일에 맞춘 일정 조정

AI 출력은 바로 저장하지 않는다.

```text
AI Suggest
→ User Review
→ Approve
→ Planner Apply
```

Human-in-the-Loop을 기본으로 한다.

---

# 19. AI Import — Planned

향후 여행 글 / 블로그 / URL을 일정 초안으로 변환할 수 있다.

권장 흐름:

```text
Travel Content
→ Content Extraction
→ LLM Structured Extraction
→ Place Validation
→ Planning
→ User Review
→ Planner
```

LLM이 원문에 없는 정보를 사실처럼 생성하지 않도록 Source-derived 정보와 AI suggestion을 구분한다.

예:

- Source: 원문에서 추출
- AI Suggestion: WAYLOG가 추가 제안

현재 Place Explorer 작업과 동시에 구현하지 않는다.

---

# 20. Travel Phase

여행 중에는 새롭고 복잡한 UI를 만드는 것보다 현재 Planner를 빠르게 확인할 수 있도록 한다.

핵심:

- Day별 일정 확인
- 장소 확인
- Map 확인
- 일정 순서 수정
- 필요 시 장소 추가 / 제거

실시간 위치 추적은 현재 기본 요구사항이 아니다.

---

# 21. Remember Phase

여행 후 기존 WAYLOG의 강점을 유지한다.

```text
Planner
→ Actual Journey
→ Moment
→ Photo
→ Timeline / Diary
→ Passport
```

계획했던 장소 정보는 Diary 작성 시 재사용할 수 있도록 설계한다.

목표:

사용자가 여행 후 장소명을 처음부터 다시 입력하는 반복 작업을 줄인다.

단, 계획했다고 실제 방문한 것으로 자동 확정하지 않는다.

실제 기록은 사용자의 입력 또는 승인으로 확정한다.

---

# 22. Moment

기존 Moment 추가 / 수정 / 삭제 기능을 유지한다.

Moment는 다음 Context를 가질 수 있다.

- Day
- Place
- Note
- Photo
- Coordinates where already supported

현재 정상 동작하는 단일 사진 업로드 기능은 Bulk Photo Import 때문에 제거하지 않는다.

---

# 23. Travel Passport

기존 Travel Passport 기능을 유지한다.

Passport는 별도의 수동 Stamp 입력을 기본 요구하지 않는다.

Journey 데이터를 Source of Truth로 사용한다.

```text
Journeys
→ country / destination aggregation
→ Passport View Model
→ Country Stamp
```

MVP에서는 별도의 `stamps` 테이블을 만들지 않는다.

---

# 24. Passport Rules

Summary:

- Country Count
- City Count
- Journey Count
- Moment Count

City Count:

`country`가 존재하는 Journey의 `destination`만 집계한다.

Normalize:

- trim
- lowercase 비교
- 표시용 원본 값 유지 가능

예:

Japan  
japan  
JAPAN  
` Japan `

→ 동일 국가

---

# 25. Unsplash

기존 Unsplash 기능과 정책을 유지한다.

- Cover Search
- Cover Select
- Attribution
- Download Tracking
- Hotlinking
- Server-side secret handling

Landing Hero 등 반복 호출이 불필요한 영역에서는 정적 이미지를 사용할 수 있다.

---

# 26. Design System

기존 Editorial Travel Magazine 방향을 유지한다.

YES:

- Editorial
- Travel Magazine
- Photography
- Large Typography
- Whitespace
- Asymmetric Layout
- Cinematic Image
- Minimal UI

NOT:

- 일반 SaaS Dashboard 느낌으로 전체 재설계
- 과도한 gradient
- Glassmorphism
- 과도한 rounded card
- 아이콘 중심 설명

Planner / Place Explorer 역시 기존 WAYLOG 디자인 언어 안에서 구현한다.

Wanderlog 등 경쟁 서비스의 Workflow는 참고할 수 있지만 시각 디자인을 그대로 복제하지 않는다.

---

# 27. Responsive Design

기존 기준 유지:

- Mobile: 360px+
- Tablet: 768px+
- Desktop: 1280px+
- Wide Desktop: 1440px+

Desktop에서는 Planner + Map의 동시 사용성을 우선한다.

Mobile에서는 좁은 화면에 지도와 리스트를 무리하게 동시에 고정하지 않고 탭 / sheet / 전환 UI를 사용할 수 있다.

현재 모바일 구현을 먼저 확인하고 최소 변경한다.

---

# 28. Data Strategy

현재 데이터 저장 방식을 유지한다.

기존 핵심 관계:

```text
Journey
↓
Days
↓
Entries / Moments
```

현재 코드에 별도 itinerary 구조가 존재한다면 그것을 Source of Truth로 문서화한다.

v2 명세만을 이유로 기존 정상 데이터 모델을 임의로 재작성하지 않는다.

Place Explorer를 위해 추가 저장이 필요할 경우 additive change를 우선한다.

Destructive migration 금지.

---

# 29. Security

- API Key를 Git에 커밋하지 않는다.
- Secret은 환경변수로 관리한다.
- 서버 전용 Secret은 Client Component에 노출하지 않는다.
- Google API Key에는 가능한 범위에서 application restriction / API restriction을 적용한다.
- Supabase Service Role Key는 Client에 노출하지 않는다.
- 입력 / API 응답을 validation한다.
- 외부 API 오류를 사용자 데이터 손실로 연결하지 않는다.

---

# 30. Error Handling

다음 오류를 정상적인 제품 상태로 처리한다.

- Auth Error
- Rate Limit
- Quota Exceeded
- Network Error
- Timeout
- Google Maps Load Error
- Places Search Error
- Unsplash Error
- Supabase Error
- Invalid Output
- Photo Upload Error

외부 API 실패 시 기존 Journey / Planner / Diary 데이터는 계속 접근 가능해야 한다.

---

# 31. Privacy-first / Local-first Principle

기존 v1.3의 Privacy-first Photo Organizer 방향을 유지한다.

원칙:

1. 원본 여행사진은 기본적으로 사용자 기기에 유지한다.
2. Cloud 원본 사진 업로드를 기본 요구사항으로 만들지 않는다.
3. EXIF → GPS → Journey Context → On-device Vision을 우선한다.
4. Cloud AI는 optional fallback이다.
5. AI 결과는 사용자 검토 후 적용한다.
6. Cloud Backup은 opt-in 방향을 유지한다.

이 원칙은 현재 Place Explorer 개발 범위를 확대한다는 의미가 아니다.

---

# 32. Bulk Photo Import — Future V2 Feature

기존 로드맵을 유지한다.

```text
Planned Journey
→ Visited Places
→ Bulk Photo Import
→ Metadata Analysis
→ Date Classification
→ Location Matching
→ Optional AI Vision
→ User Review
→ Apply to Timeline
→ Passport Update
```

우선순위:

1. EXIF Date
2. GPS / Planned Places
3. Ambiguous Photos Only
4. AI Vision
5. User Review

모든 사진을 기본적으로 Cloud Vision API에 보내지 않는다.

현재 Place Explorer 구현과 동시에 착수하지 않는다.

---

# 33. Technical Stack

현재 프로젝트 기술 스택을 유지한다.

Frontend:
- Next.js
- React
- TypeScript
- App Router

UI:
- Tailwind CSS

Backend:
- Next.js Route Handlers where required

Database / Storage:
- 현재 구현 방식 우선
- Supabase 사용 영역은 기존 구현 확인 후 유지

External:
- Unsplash
- Google Maps / Places

Deployment:
- Vercel

새 dependency 추가 전 현재 dependency로 구현 가능한지 확인한다.

---

# 34. LLM Architecture — Future

AI 기능 추가 시 특정 Provider에 UI가 직접 종속되지 않도록 한다.

권장:

```text
Application
→ LLM Abstraction
→ Provider Adapter
→ Gemini / Other Provider
```

예:

```ts
llm.generate()
```

AI Import 또는 Recommendation이 실제로 구현될 때 최소 수준의 abstraction을 도입한다.

현재 사용하지 않는 복잡한 Agent framework는 추가하지 않는다.

---

# 35. RAG

현재 단일 Journey / 단일 콘텐츠 기반 작업에는 RAG를 필수로 사용하지 않는다.

향후 다음 상황에서 검토한다.

- MS ON TRIP 콘텐츠가 대량 축적됨
- 여러 여행 글에서 관련 정보를 검색해야 함
- 사용자 과거 Journey / Saved Place를 검색해야 함

필요하기 전 Vector DB를 추가하지 않는다.

---

# 36. Human-in-the-Loop

다음 작업은 사용자 검토를 기본으로 한다.

- AI 일정 생성
- AI 장소 추천 적용
- AI Import 결과
- 사진 자동 분류
- 실제 방문 여부
- Diary 자동 반영

기본 원칙:

```text
AI Generate
→ Review
→ Approve
→ Save / Apply
```

---

# 37. Place Explorer MVP Acceptance Criteria

Place Explorer 구현을 승인했을 때 최소 완료 기준:

1. Planner의 기존 기능이 정상 동작한다.
2. 장소 찾기 UI가 Planner 안에서 접근 가능하다.
3. Journey Context를 기반으로 장소 검색이 가능하다.
4. 최소 카테고리 검색이 가능하다.
5. 검색 결과가 Map Marker와 연결된다.
6. Card hover가 Marker를 강조한다.
7. Marker click이 관련 Card를 찾을 수 있다.
8. hover만으로 API 요청이 발생하지 않는다.
9. 지도 이동만으로 자동 검색하지 않는다.
10. `이 지역에서 검색` 등 명시적 행동으로 새 검색한다.
11. 장소를 기존 Planner Day에 추가할 수 있다.
12. 동일 검색의 불필요한 반복 요청을 줄인다.
13. API 오류 / quota 오류 시 기존 Planner가 유지된다.
14. 모바일에서 핵심 기능 사용 가능하다.
15. lint 성공
16. build 성공
17. 기존 Journey / Map / Moment / Passport 회귀 확인

---

# 38. Testing

기능별 happy path만 확인하지 않는다.

최소 테스트:

- Journey 생성
- Day 생성
- Planner 일정 추가
- 기존 저장 장소 Map 표시
- Place Search
- Place Card ↔ Marker interaction
- Place → Day 추가
- 동일 검색 반복 시 불필요한 재호출 여부
- Map 탭 전환 후 불필요한 재초기화 여부
- Google API 실패
- quota / rate limit 상태
- Moment CRUD
- Moment Photo
- Passport aggregation
- 모바일 레이아웃
- lint
- build

API 호출 수를 개발 중 Network 탭 또는 로깅으로 확인한다.

---

# 39. Code Quality

- TypeScript strict 유지
- `any` 최소화
- 비즈니스 로직과 UI 분리
- API 호출 로직을 UI Component 안에 과도하게 작성하지 않는다.
- 반복 UI는 Component화한다.
- 기존 lint / formatter 규칙 유지
- 기존 build를 깨뜨리지 않는다.
- 불필요한 dependency 추가 금지
- 기존 정상 Google Maps loader를 이유 없이 교체하지 않는다.
- API 호출이 발생하는 위치를 명확하게 추적할 수 있게 한다.

---

# 40. Development Rules

Codex는 새 기능 구현 전에 반드시:

1. `WAYLOG_SPEC.md`를 읽는다.
2. `WAYLOG_CODEX_INSTRUCTIONS.md`를 읽는다.
3. 현재 코드베이스를 확인한다.
4. 현재 구현과 명세 차이를 보고한다.
5. 영향받는 파일을 제시한다.
6. 사용자 승인 전 대규모 변경을 시작하지 않는다.

특히 금지:

- 기존 기능 재구현
- 전체 UI 리디자인
- 기존 Map 제거
- 기존 데이터 모델 임의 폐기
- destructive migration
- API Key 하드코딩
- 자동 API 호출 loop
- Place Explorer를 이유로 AI / RAG / Agent까지 한 번에 구현
- 사용자가 승인하지 않은 Production push / deploy

---

# 41. Development Priority

현재 권장 순서:

```text
Phase 0
현재 Planner / Map 안정화

Phase 1
Place Explorer
- 장소 검색
- Map 연동
- Day 추가
- API quota 최적화

Phase 2
Travel Profile

Phase 3
AI Recommendation

Phase 4
Content / URL AI Import

Phase 5
Bulk Photo Organizer PoC
```

각 Phase는 별도로 승인하고 구현한다.

---

# 42. Product Roadmap

## Current
- Journey
- Planner
- Map
- Moment
- Photo
- Timeline
- Passport

## Next
- Place Explorer
- Map ↔ Place interaction
- Places quota optimization
- Travel Profile

## AI
- AI Place Recommendation
- AI Itinerary Suggestion
- Content / URL Import
- Structured Extraction
- Human Review

## Remember Expansion
- Bulk Photo Import
- EXIF
- GPS / Planned Place Matching
- On-device Vision
- Review / Apply

## Later
- Auth / multi-user production hardening
- Sharing where appropriate
- optional cloud backup
- monetization experiments

---

# 43. Product Success Metric

WAYLOG의 목표는 기능 개수가 아니다.

다음 사용자 작업이 얼마나 빨라지는지 측정한다.

- 여행 장소를 찾고 일정에 넣는 시간
- 지도와 일정 사이를 오가는 횟수
- 여행 후 장소를 다시 입력하는 시간
- Diary 완성률
- Journey → Passport 누적률

향후 AI 도입 시:

- AI 추천 채택률
- AI 일정 수정률
- 사용자 수정 횟수
- 잘못된 장소 추천률

을 측정한다.

---

# 44. README Requirements

README는 실제 구현 상태를 기준으로 유지한다.

권장:

- Overview
- Problem
- Target User
- Product Flow
- Features
- Architecture
- Tech Stack
- Google Maps / Places
- Unsplash
- Database / Data Strategy
- Environment Variables
- Local Development
- Testing
- Deployment
- Screenshots
- Known Limitations
- API Cost / Quota Strategy
- Privacy
- Roadmap
- Lessons Learned

---

# 45. v2.0 Migration Rule

이 문서를 적용할 때 기존 v1.3을 삭제하지 않는다.

권장:

```text
docs/archive/WAYLOG_SPEC_v1.3.md
WAYLOG_SPEC.md
WAYLOG_CODEX_INSTRUCTIONS.md
```

`WAYLOG_SPEC.md`를 최신 Source of Truth로 사용한다.

v1.3은 과거 결정과 기존 요구사항을 확인하기 위한 archive로 보존한다.

Codex 지침은 별도로 유지하며, 다음 개발 작업에서는 이 v2.0 명세와 현재 코드베이스를 함께 비교한다.

---

# 46. Immediate Next Development Boundary

다음 개발 작업으로 Place Explorer를 진행한다면 범위는 다음까지만이다.

```text
Planner
→ 장소 찾기
→ Google Places Search
→ Place Cards
↔ Existing Map
→ Add to Day
→ Cache / Quota Guard
```

이번 작업에서 제외:

```text
AI Recommendation
Travel Profile full implementation
URL Import
RAG
Bulk Photo Import
Route Optimization
Booking
SNS
```

먼저 End-to-End가 정상 동작하는 작은 기능으로 구현하고 검증한다.

---

# 47. Final Product Principle

WAYLOG는 모든 여행 서비스를 한 앱에 복제하지 않는다.

외부 서비스가 잘하는 데이터와 API는 활용하고, WAYLOG는 다음 연결 경험에 집중한다.

```text
PLAN
↓
TRAVEL
↓
REMEMBER
```

장소 탐색은 Planner를 위한 기능이고,
Planner 데이터는 여행 중 Context가 되며,
여행 데이터는 여행 후 Diary와 Passport로 이어진다.

**The plan should not disappear when the trip begins.  
It should become the memory after the trip ends.**
