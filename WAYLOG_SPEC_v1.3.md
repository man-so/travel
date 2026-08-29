# WAYLOG 여행 다이어리 웹앱 기술명세서

## 1. Project Overview

### 프로젝트명
WAYLOG

### 프로젝트 목표
사용자가 여행지와 여행 기간을 입력하고, Unsplash API를 통해 여행 대표 이미지를 선택한 뒤, 날짜별 장소·사진·메모를 기록하여 하나의 감성적인 여행 다이어리를 만들 수 있는 웹앱을 개발한다.

앱의 핵심 경험은 다음과 같다.

User → Create Journey → Unsplash Cover 선택 → 날짜별 기록 → 여행 타임라인 완성 → Travel Passport 자동 반영

단순 여행 사진 검색 서비스가 아니라 사용자의 여행 기록을 중심으로 하는 Digital Travel Diary 서비스로 만든다.

또한 사용자가 어떤 국가와 도시를 여행했는지 자동으로 누적해 보여주는 Travel Passport 기능을 제공한다. 여행을 생성하면 Journey의 country / destination 정보를 기준으로 방문 국가와 방문 도시가 자동 집계되며, 사용자는 자신의 여행 이력을 스탬프 형태로 확인할 수 있다.

---


# Current Implementation Baseline

현재 코드베이스는 기존 MVP 명세보다 일부 기능이 먼저 구현된 상태다.

현재 구현된 것으로 간주하고 보호해야 하는 기능:
- Landing Page
- Dashboard
- Journey 생성 / 수정 / 삭제
- Unsplash Cover 검색 / 선택 / Attribution / Download Tracking
- 날짜별 Day 자동 생성
- Moment 추가 / 수정 / 삭제
- Journey Timeline
- Travel Passport
- 방문 국가 / 도시 자동 집계
- Passport Summary
- Country Stamp / Stamp Grid
- 동일 국가 normalize 및 중복 병합
- Passport Empty State
- Header / 모바일 Navigation의 Passport 진입
- Google Maps 기반 Journey Map
- Places 기반 좌표 저장
- Moment 사진 업로드

위 기능들은 특별한 이유 없이 삭제하거나 재구현하지 않는다.
현재 데이터 저장 방식은 기존 구현을 유지하며, Supabase 전체 전환은 별도 승인된 작업으로 진행한다.

---

# 2. Target User

주 사용자는 다음과 같다.

- 여행 사진을 많이 찍지만 여행기를 길게 작성하지 않는 사용자
- 여행별 기록을 깔끔하게 정리하고 싶은 사용자
- 여행 사진, 장소, 간단한 감정을 한곳에 보관하고 싶은 사용자
- SNS보다 개인 기록 중심의 서비스를 원하는 사용자

---

# 3. Core Concept

서비스 핵심 메시지:

"Remember where life took you."

한국어 메시지:

"여행이 끝나도, 그날의 기억은 남도록."

서비스의 핵심 요소는 아래 6개다.

Journey
Day
Place
Moment
Story
Passport

Passport는 사용자의 Journey 데이터를 바탕으로 방문 국가와 도시를 자동 집계하는 기능이다.

좋아요, 댓글, 팔로워, 피드 같은 SNS 요소는 MVP에 포함하지 않는다.

---

# 4. MVP Scope

이번 개발에서는 아래 기능까지만 구현한다.

1. 랜딩 페이지
2. 여행 목록 Dashboard
3. 새 여행 생성
4. Unsplash 여행 이미지 검색
5. Unsplash Cover 선택
6. 여행 상세 페이지
7. 날짜별 Day 자동 생성
8. Day별 Entry 작성
9. 장소 입력
10. 한 줄 메모 입력
11. 사진 URL 등록
12. 여행 타임라인 표시
13. 데이터 저장 및 수정
14. 기본적인 반응형 UI
15. Empty / Loading / Error 상태
16. Travel Passport
17. 방문 국가 자동 집계
18. 방문 도시 자동 집계
19. 국가별 Stamp 표시
20. Passport 요약 통계 표시

이번 MVP에서 제외한다.

- AI 여행기 생성
- Google Maps
- 실시간 GPS
- Google Photos 연동
- SNS 기능
- 다른 사용자 팔로우
- 댓글
- 좋아요
- 결제
- 모바일 네이티브 앱
- Multi-Agent
- 복잡한 인증 시스템

우선 End-to-End 정상 작동을 가장 중요한 완료 조건으로 한다.

---

# 5. Tech Stack

다음 기술을 기본으로 사용한다.

Frontend:
- Next.js
- React
- TypeScript
- App Router

UI:
- Tailwind CSS

Backend:
- Next.js Route Handlers

Database:
- Supabase PostgreSQL

Storage:
- Supabase Storage

External API:
- Unsplash API

Deployment:
- Vercel

환경변수:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
UNSPLASH_ACCESS_KEY=

Unsplash Access Key와 Supabase Service Role Key는 절대로 Client Component에서 직접 사용하지 않는다.

---

# 6. Application Architecture

기본 구조:

Browser
↓
Next.js UI
↓
Next.js Route Handler
├─ Supabase
└─ Unsplash API

Unsplash API는 반드시 서버 측 API Route를 거쳐 호출한다.

금지:

Browser
→ Unsplash API 직접 호출

허용:

Browser
→ /api/unsplash/search
→ Unsplash API

---

# 7. Suggested File Structure

프로젝트 구조는 다음을 기준으로 한다.

app/
  page.tsx

  dashboard/
    page.tsx

  passport/
    page.tsx

  journeys/
    new/
      page.tsx

    [journeyId]/
      page.tsx

      edit/
        page.tsx

  api/
    unsplash/
      search/
        route.ts

      download/
        route.ts

    journeys/
      route.ts

      [journeyId]/
        route.ts

    entries/
      route.ts

      [entryId]/
        route.ts

components/
  layout/
    Header.tsx
    Footer.tsx

  landing/
    HeroSection.tsx
    FeatureSection.tsx
    JourneyPreview.tsx
    CTASection.tsx

  journey/
    JourneyCard.tsx
    JourneyHeader.tsx
    JourneyTimeline.tsx
    DaySection.tsx
    EntryCard.tsx
    JourneyForm.tsx

  passport/
    PassportSummary.tsx
    StampGrid.tsx
    CountryStamp.tsx
    CountryDetail.tsx

  unsplash/
    UnsplashSearch.tsx
    UnsplashGrid.tsx
    UnsplashPhotoCard.tsx
    UnsplashAttribution.tsx

  ui/
    Button.tsx
    Input.tsx
    Textarea.tsx
    Modal.tsx
    EmptyState.tsx
    LoadingState.tsx

lib/
  supabase/
    client.ts
    server.ts

  unsplash/
    client.ts
    types.ts

  validation/
    journey.ts
    entry.ts

  passport/
    aggregate.ts

types/
  journey.ts
  passport.ts
  unsplash.ts

---

# 8. Landing Page

랜딩 페이지는 https://www.heynoah.io/ 의 레이아웃과 시각적 분위기를 참고한다.

단, 디자인을 그대로 복제하지 않는다.

참고 요소:

- 여백이 큰 레이아웃
- 매우 큰 Hero Typography
- 이미지 중심 구성
- 짧은 텍스트
- 섹션별 명확한 메시지
- 부드러운 스크롤 경험
- 제품을 직접 보여주는 Preview Section
- 최소한의 Navigation

전체적으로 여행 잡지와 Editorial Website를 결합한 느낌으로 디자인한다.

---

# 9. Landing Header

왼쪽:

WAYLOG

오른쪽:

Journeys
Passport
About
Start

모바일에서는 Hamburger 또는 간소화된 메뉴를 사용한다.

Header는 Hero 위에 겹쳐지는 transparent 형태 또는 밝은 배경의 minimal header로 구성한다.

---

# 10. Hero Section

Hero는 브라우저 첫 화면의 약 85~100vh를 사용한다.

배경에는 여행 사진을 크게 사용한다.

Hero Text:

WAYLOG

Remember
where life took you.

한국어 Subcopy:

여행이 끝나도,
그날의 기억은 남도록.

Primary CTA:

Start your journey →

CTA 클릭:

/dashboard 또는 /journeys/new

로 이동한다.

Hero 사진은 기본 static image를 사용해도 된다.

랜딩 Hero까지 매번 Unsplash API 호출을 발생시키지 않아도 된다.

---

# 11. Landing Feature Section

다음 메시지를 사용한다.

Your trips.
Your places.
Your memories.

3개의 Feature Card:

01 CAPTURE

여행 중 느꼈던 순간을
사진과 한 줄로 기록하세요.

02 REMEMBER

시간이 지나도
그날의 장소와 감정을 다시 꺼내보세요.

03 RELIVE

여행 전체가 하나의
이야기가 됩니다.

Desktop에서는 3-column.

Mobile에서는 1-column.

---

# 12. Journey Preview Section

실제 여행 상세 페이지와 비슷한 mockup을 랜딩 페이지에 보여준다.

예:

KYOTO
Japan

April 1 — April 5, 2026
5 Days

DAY 01

Fushimi Inari

[Travel Photo]

Thousands of red gates.

생각보다 사람이 많았지만
올라갈수록 조용해졌다.

DAY 02

Arashiyama

[Travel Photo]

아침 일찍 가길 잘했다.

이 영역은 랜딩 페이지의 핵심 제품 소개 영역이다.

---

# 13. Landing Final CTA

텍스트:

Every journey becomes a story.

버튼:

Create your first journey →

---

# 14. Design System

전체 UI는 화려한 SaaS Dashboard보다 Editorial Travel Magazine 분위기를 우선한다.

Color:

Background:
#F6F4EF

Primary Text:
#111111

Secondary Text:
#6F6F6F

Card:
#FFFFFF

Border:
rgba(17,17,17,0.12)

Accent:
#FF5A36

Accent 색상은 매우 제한적으로 사용한다.

주로:

- Primary CTA
- 작은 indicator
- 선택 상태

에 사용한다.

---

# 15. Typography

기본 Sans Serif:

Inter

한글:

Pretendard

Editorial Heading:

Instrument Serif

폰트를 사용할 수 없다면 fallback을 적절히 설정한다.

예:

font-family:
"Instrument Serif", Georgia, serif

큰 여행지 Title은 Serif.

본문과 UI 요소는 Sans Serif를 사용한다.

---

# 16. Responsive Design

필수 지원:

Mobile:
360px 이상

Tablet:
768px 이상

Desktop:
1280px 이상

Wide Desktop:
1440px 이상

사진 Grid와 Dashboard Card가 화면 크기에 따라 자연스럽게 변하도록 한다.

Mobile First 방식으로 구현한다.

---

# 17. Dashboard

경로:

/dashboard

화면 상단:

Good evening.

Where have you been?

버튼:

+ New Journey

하단에는 사용자가 만든 Journey Card를 표시한다.

예:

2026

KYOTO
Japan

5 Days

[Cover Image]

Journey Card 클릭:

/journeys/{journeyId}

---

# 18. Empty Dashboard

Journey가 하나도 없으면 다음 상태를 보여준다.

No journeys yet.

Your stories will appear here.

[ Create your first journey ]

---

# 19. Create Journey

경로:

/journeys/new

입력 필드:

Title

Destination

Country

Start Date

End Date

Companion

Companion 값:

solo
couple
friends
family

예:

Title:
Spring in Kyoto

Destination:
Kyoto

Country:
Japan

Start Date:
2026-04-01

End Date:
2026-04-05

Companion:
couple

Validation:

- destination required
- start_date required
- end_date required
- start_date <= end_date
- title은 없으면 destination 기반으로 자동 생성 가능

---

# 20. Journey Creation Flow

Step 1

여행 기본 정보 입력

↓

Step 2

Unsplash Cover 검색

↓

Step 3

Cover 선택

↓

Step 4

Journey 생성

↓

Step 5

여행 기간 기준 Day 자동 생성

예:

2026-04-01 ~ 2026-04-05

Day 1
2026-04-01

Day 2
2026-04-02

Day 3
2026-04-03

Day 4
2026-04-04

Day 5
2026-04-05

↓

Step 6

/journeys/{journeyId} 이동

---

# 21. Unsplash API Integration

공식 Unsplash API를 사용한다.

검색 Endpoint:

GET
https://api.unsplash.com/search/photos

Server-side 요청 시 Header:

Authorization: Client-ID {UNSPLASH_ACCESS_KEY}

기본 검색값:

query={destination}
orientation=landscape
per_page=12
content_filter=high

프런트에서는:

GET /api/unsplash/search?q=Kyoto

형태로 호출한다.

---

# 22. Unsplash Search Route

경로:

GET /api/unsplash/search

Query:

q

page optional

예:

/api/unsplash/search?q=Kyoto&page=1

검색어가 없으면 400을 반환한다.

Server에서 Unsplash 요청 후 필요한 정보만 normalize해서 반환한다.

응답 예:

{
  "results": [
    {
      "id": "PHOTO_ID",
      "width": 6000,
      "height": 4000,
      "color": "#cccccc",
      "blurHash": "...",
      "urls": {
        "small": "...",
        "regular": "...",
        "full": "..."
      },
      "photographer": {
        "name": "John Doe",
        "username": "johndoe",
        "profileUrl": "..."
      },
      "photoUrl": "...",
      "downloadLocation": "..."
    }
  ]
}

---

# 23. Unsplash Important Rules

Unsplash 이미지는 다운로드 후 Supabase Storage에 복사하지 않는다.

Unsplash API가 제공한 photo.urls 값을 직접 사용한다.

즉 hotlinking 방식으로 표시한다.

Journey Cover로 선택하는 순간에는 해당 사진의 download_location endpoint를 서버에서 호출하여 download event를 기록한다.

프런트에서 download_location을 직접 호출하지 않는다.

API Route:

POST /api/unsplash/download

Request:

{
  "downloadLocation": "..."
}

서버에서 UNSPLASH_ACCESS_KEY를 이용해 요청한다.

---

# 24. Unsplash Attribution

Unsplash 사진이 화면에 표시될 때 Photographer Attribution을 보여준다.

예:

Photo by John Doe on Unsplash

John Doe는 Photographer profile로 연결한다.

Unsplash 역시 Unsplash 사이트로 연결한다.

가능하면 링크에 다음 UTM을 추가한다.

utm_source=waylog
utm_medium=referral

Attribution은 작지만 읽을 수 있어야 한다.

---

# 25. Travel Passport

경로:

/passport

목적:

사용자가 지금까지 어떤 국가와 도시를 여행했는지 한눈에 확인할 수 있는 개인 여행 여권 화면을 제공한다.

Passport는 별도의 수동 입력을 요구하지 않는다.

Journey 생성 또는 수정 시 저장된:

- country
- destination
- start_date
- end_date

정보를 기준으로 자동 집계한다.

예:

Japan

Kyoto
Tokyo
Osaka

First visited:
2026-04-01

Trips:
3

---

# 26. Passport Summary

Passport 화면 상단에는 다음 통계를 표시한다.

예:

My Travel Passport

5 Countries

17 Cities

23 Journeys

126 Moments

통계 정의:

Countries:
서로 다른 country 값 개수

Cities:
서로 다른 destination 값 개수

Journeys:
전체 Journey 개수

Moments:
전체 Entry 개수

---

# 27. Stamp System

각 방문 국가는 하나의 Stamp로 표시한다.

예:

JAPAN

🇯🇵

APR 2026

KYOTO · TOKYO · OSAKA

Stamp는 다음 정보를 표시할 수 있다.

- 국가명
- 국가 코드 또는 국기
- 최초 방문일
- 최근 방문일
- 방문 도시 수
- 여행 횟수

MVP에서는 SVG / CSS 기반의 여권 도장 스타일을 사용한다.

실제 국가별 이미지 리소스를 필수로 요구하지 않는다.

Stamp는 장식 요소가 아니라 방문 이력을 확인하는 UI이므로 모바일에서도 국가명과 핵심 정보가 읽혀야 한다.

---

# 28. Passport Data Strategy

MVP에서는 별도의 stamps 테이블을 만들지 않는다.

기존 Journey 데이터를 Source of Truth로 사용한다.

즉:

journeys
↓
country / destination 집계
↓
Passport View Model
↓
Country Stamp UI

이 방식은 데이터 중복을 피하고 MVP 복잡도를 낮춘다.

Passport 집계 로직은 UI Component 내부에 직접 작성하지 않고 별도의 helper로 분리한다.

예:

lib/passport/aggregate.ts

입력:

Journey[]

출력 예:

{
  "countries": [
    {
      "country": "Japan",
      "firstVisitedAt": "2026-04-01",
      "lastVisitedAt": "2026-08-10",
      "journeyCount": 3,
      "cities": ["Kyoto", "Tokyo", "Osaka"]
    }
  ],
  "summary": {
    "countryCount": 5,
    "cityCount": 17,
    "journeyCount": 23,
    "momentCount": 126
  }
}

---

# 29. Passport Navigation

Desktop Header 또는 주요 Navigation에 다음 메뉴를 추가한다.

Journeys
Passport

모바일에서는 하단 Navigation을 사용할 수 있다.

예:

Home
Journeys
Passport

MVP에서는 Profile 메뉴는 필수가 아니다.

---

# 30. Passport Empty State

Journey가 하나도 없으면 다음 상태를 표시한다.

Your passport is empty.

Create a journey and your first stamp will appear here.

[ Create your first journey ]

Journey는 존재하지만 country가 비어 있으면:

Add a country to your journey to unlock this stamp.

처럼 안내한다.

---

# 31. Passport Behavior

Journey 생성:

Japan / Kyoto

↓

Japan Stamp 생성

↓

추가 Journey 생성:

Japan / Tokyo

↓

새 Japan Stamp를 만들지 않는다.

기존 Japan Stamp에 Tokyo를 추가하고 Journey Count를 증가시킨다.

↓

Thailand / Bangkok Journey 생성

↓

Thailand Stamp를 새로 추가한다.

국가 및 도시 비교 시 앞뒤 공백을 제거하고 대소문자 차이로 중복 생성되지 않도록 normalize한다.

예:

Japan
japan
 JAPAN

은 동일 국가로 처리해야 한다.

---


## Passport City Count Rule

Passport의 City Count는 `country`가 존재하는 Journey의 `destination`만 집계한다.

예:
- Country: Japan / Destination: Kyoto → City Count 포함
- Country: 비어 있음 / Destination: Local Walk → Passport City Count 제외

국가명과 도시명은 trim + lowercase 기준으로 normalize하여 중복 집계를 방지한다.

---

# 32. Passport MVP Restrictions

이번 MVP에서는 다음 기능은 제외한다.

- GPS 기반 실제 방문 인증
- 실시간 위치 추적
- 자동 체크인
- 지도 기반 국가 색칠
- Achievement Badge
- Passport 공유 이미지 생성
- 국가별 방문률
- 도시 좌표 자동 변환
- Google Maps / Mapbox 연동

이 기능들은 이후 버전에서 확장한다.

---


# Implemented Extensions Beyond Original MVP

기존 명세서에서는 Future 범위였지만 현재 코드에 이미 구현된 기능은 유지한다.

## Google Maps / Places
- Journey에 저장된 장소 좌표를 지도에 표시하는 현재 기능을 유지한다.
- Places 기반 장소 선택 / 좌표 저장 기능을 유지한다.
- 실시간 위치 추적이나 방문 인증 기능으로 자동 확장하지 않는다.

## Moment Photo Upload
- Moment의 사용자 사진 업로드 기능을 유지한다.
- 업로드 실패가 Journey/Moment 작성 전체 실패로 이어지지 않도록 한다.
- 향후 Bulk Photo Import와 기존 단일 사진 업로드는 분리 설계한다.

이번 단계에서 임의로 추가하지 않는 기능:
- 실시간 GPS 추적
- GPS 기반 방문 인증
- 세계지도 국가 색칠
- Achievement 시스템
- AI 여행기 자동 생성
- SNS 기능

---

# 33. Database Schema

Supabase PostgreSQL 기준.

## journeys

id
uuid
primary key

user_id
uuid nullable

title
text

destination
text not null

country
text

start_date
date not null

end_date
date not null

companion
text

cover_url
text

cover_unsplash_id
text

cover_photographer_name
text

cover_photographer_username
text

cover_photographer_url
text

cover_unsplash_url
text

cover_download_location
text

created_at
timestamptz default now()

updated_at
timestamptz default now()

---

# 34. days Table

id
uuid
primary key

journey_id
uuid
foreign key journeys.id

day_number
integer not null

date
date not null

title
text nullable

summary
text nullable

created_at
timestamptz default now()

---

# 35. entries Table

id
uuid
primary key

day_id
uuid
foreign key days.id

place
text

content
text

photo_url
text nullable

photo_source
text

unsplash_photo_id
text nullable

photographer_name
text nullable

photographer_url
text nullable

latitude
numeric nullable

longitude
numeric nullable

sort_order
integer default 0

created_at
timestamptz default now()

updated_at
timestamptz default now()

---

# 36. Relationship

Database Relation:

Journey
1
↓
N
Days

Day
1
↓
N
Entries

즉:

journeys
↓
days
↓
entries

---

# 37. Journey Detail

경로:

/journeys/[journeyId]

화면 상단:

Large Cover Image

그 위 또는 아래:

KYOTO

Japan

April 1 — April 5, 2026

5 Days

그 아래 날짜순 Timeline.

---

# 38. Day Timeline

예:

DAY 01

April 1

Fushimi Inari

[Photo]

생각보다 사람이 많았지만
올라갈수록 조용해졌다.

📍 Fushimi Inari Taisha


DAY 02

April 2

Arashiyama

[Photo]

아침 일찍 가길 잘했다.

📍 Bamboo Forest

Day Section 사이에는 충분한 vertical space를 둔다.

SNS Feed보다는 Magazine Layout에 가깝게 디자인한다.

---

# 39. Add Entry

각 Day Section에 다음 버튼을 둔다.

+ Add moment

클릭하면 Modal 또는 inline form을 연다.

입력:

Place

Note

Photo URL optional

저장 버튼:

Save moment

MVP에서는 사용자 사진 업로드 대신 photo URL 방식부터 구현해도 된다.

단 Supabase Storage 설정이 간단하다면 사용자 사진 업로드도 함께 구현해도 좋다.

---

# 40. Entry Form

Place:

required

Content:

optional

Photo:

optional

Place 예:

Fushimi Inari Taisha

Content 예:

생각보다 사람이 많았지만 올라갈수록 조용해졌다.

---

# 41. Journey Editing

Journey Detail 상단에:

Edit Journey

버튼을 둔다.

경로:

/journeys/[journeyId]/edit

수정 가능:

- title
- destination
- country
- dates
- companion
- cover

단 여행 기간을 변경할 경우 Day 데이터가 이미 존재하면 기존 Entry 삭제 문제가 생길 수 있으므로 MVP에서는 경고를 표시한다.

기존 Day에 기록이 있는 상태에서 기간 축소 시 자동 삭제하지 않는다.

---

# 42. API Design

## Journey List

GET /api/journeys

Response:

{
  "data": [...]
}

---

## Create Journey

POST /api/journeys

Request:

{
  "title": "Spring in Kyoto",
  "destination": "Kyoto",
  "country": "Japan",
  "startDate": "2026-04-01",
  "endDate": "2026-04-05",
  "companion": "couple",
  "cover": {
    "url": "...",
    "unsplashId": "...",
    "photographerName": "...",
    "photographerUsername": "...",
    "photographerUrl": "...",
    "unsplashUrl": "...",
    "downloadLocation": "..."
  }
}

처리:

1. Validation
2. Journey insert
3. 날짜 차이 계산
4. Day rows 자동 생성
5. Unsplash cover 사용 시 download tracking
6. Journey + Days 반환

---

# 43. Get Journey

GET

/api/journeys/{journeyId}

Response:

{
  "journey": {},
  "days": [
    {
      "id": "...",
      "dayNumber": 1,
      "date": "...",
      "entries": []
    }
  ]
}

---

# 44. Update Journey

PATCH

/api/journeys/{journeyId}

---

# 45. Delete Journey

DELETE

/api/journeys/{journeyId}

MVP에서는 삭제 버튼을 Journey Edit 화면 하단에 둔다.

삭제 전:

Are you sure?

confirmation을 반드시 받는다.

---

# 46. Entry API

POST /api/entries

Request:

{
  "dayId": "...",
  "place": "Fushimi Inari",
  "content": "...",
  "photoUrl": "..."
}

---

# 47. Entry Update

PATCH

/api/entries/{entryId}

---

# 48. Entry Delete

DELETE

/api/entries/{entryId}

삭제 전 사용자 confirmation을 받는다.

---

# 49. Validation

Zod 또는 동등한 schema validation 도구를 사용한다.

Journey:

destination:
min 1

startDate:
valid ISO date

endDate:
valid ISO date

endDate >= startDate

companion:

solo
couple
friends
family

중 하나.

Entry:

place:
min 1

content:
max 2000 정도

---

# 50. Loading State

모든 비동기 작업에는 Loading State를 제공한다.

예:

Unsplash 검색:

Searching beautiful places...

Journey 생성:

Creating your journey...

Dashboard:

Loading journeys...

Skeleton UI를 사용할 수 있다.

---

# 51. Error State

Unsplash API 오류가 발생해도 앱 전체가 실패해서는 안 된다.

예:

We couldn't load travel photos.

[ Try again ]

또는:

Continue without a cover

옵션을 제공한다.

Journey 생성 시 Unsplash가 실패해도 사용자는 여행을 생성할 수 있어야 한다.

---

# 52. Empty State

Day에 기록이 없을 경우:

Nothing recorded yet.

Add the first moment from this day.

[ + Add moment ]

---

# 53. API Error Format

모든 자체 API 오류는 가급적 통일한다.

{
  "error": {
    "code": "UNSPLASH_ERROR",
    "message": "Unable to search photos."
  }
}

예상 Code:

VALIDATION_ERROR
NOT_FOUND
DATABASE_ERROR
UNSPLASH_ERROR
UNAUTHORIZED
UNKNOWN_ERROR

---

# 54. Security

다음 원칙을 반드시 지킨다.

1. UNSPLASH_ACCESS_KEY는 서버에서만 사용한다.
2. SUPABASE_SERVICE_ROLE_KEY는 서버에서만 사용한다.
3. .env.local을 GitHub에 commit하지 않는다.
4. 입력값을 Validation한다.
5. 외부 API 오류를 그대로 사용자에게 노출하지 않는다.
6. SQL 문자열을 직접 조합하지 않는다.
7. delete 동작은 사용자 확인 후 실행한다.
8. secret을 console.log에 출력하지 않는다.

---

# 55. Accessibility

기본적인 접근성을 보장한다.

- 모든 image에 alt 제공
- 버튼은 button tag 사용
- form input에 label 제공
- keyboard focus 상태 제공
- 충분한 text contrast 유지
- modal keyboard escape 지원
- 클릭 가능한 div 사용 최소화

---

# 56. Image Handling

이미지는 responsive하게 표시한다.

가능하면 Next.js Image 사용.

Unsplash image domain 설정을 한다.

외부 이미지가 실패할 경우 fallback UI를 제공한다.

큰 Cover:

aspect-ratio 약 16:9 또는 3:2

Journey Card:

약 4:5 또는 3:4

Entry:

사진 원본 비율을 크게 훼손하지 않는다.

---

# 57. Animation

과도한 애니메이션은 사용하지 않는다.

허용:

- opacity fade
- translateY 10~20px
- hover scale 1.01~1.02
- page transition 수준

랜딩 페이지 scroll reveal은 최소화한다.

Framer Motion을 반드시 사용할 필요는 없다.

CSS transition으로 충분하면 추가 dependency를 설치하지 않는다.

---

# 58. Coding Convention

TypeScript strict mode를 사용한다.

any 사용을 최소화한다.

Component는 가능한 한 작게 분리한다.

API response type을 명시한다.

외부 API raw response를 UI에서 직접 사용하지 않는다.

Unsplash response:

Raw Unsplash API
↓
normalize
↓
Internal UnsplashPhoto type
↓
UI

방식으로 구현한다.

---

# 59. Internal Type Example

type UnsplashPhoto = {
  id: string;
  width: number;
  height: number;
  color: string | null;
  blurHash: string | null;

  urls: {
    small: string;
    regular: string;
    full: string;
  };

  photographer: {
    name: string;
    username: string;
    profileUrl: string;
  };

  unsplashUrl: string;
  downloadLocation: string;
};

---

# 60. Performance

불필요한 API 호출을 방지한다.

Unsplash 검색 입력은 submit 방식 또는 debounce를 사용한다.

매 키 입력마다 API 호출하지 않는다.

기본:

Destination 입력 후

Find cover

버튼 클릭 시 검색.

per_page:

12

정도로 제한한다.

---

# 61. Unsplash Rate Limit 대응

Demo API 환경에서는 호출 한도가 낮을 수 있으므로 다음을 구현한다.

- 동일 검색어 반복 요청 최소화
- 불필요한 background fetch 금지
- 사용자가 실제 검색할 때만 호출
- 429 또는 제한 관련 오류 UI 처리

Unsplash API가 실패하더라도 Journey 생성 자체가 차단되지 않도록 한다.

---

# 62. Authentication Strategy

MVP 첫 구현에서는 로그인 없는 single-user prototype도 허용한다.

즉:

user_id nullable

상태로 구현할 수 있다.

인증을 넣는다면 Supabase Auth를 사용하되, 랜딩과 기본 기능 구현이 끝난 뒤 추가한다.

첫 번째 구현에서 Auth 때문에 전체 개발이 복잡해지지 않도록 한다.

우선:

Create → Save → Retrieve → Edit

가 정상 작동하는 것이 우선이다.

---

# 63. Development Priority

다음 순서로 개발한다.

## Phase 1

Initial Structure

- Next.js
- TypeScript
- Tailwind
- 환경변수 설정
- 기본 Layout

## Phase 2

Landing Page

- Header
- Hero
- Features
- Journey Preview
- CTA
- Responsive UI

## Phase 3

Database

- Supabase 연결
- journeys
- days
- entries

## Phase 4

Journey CRUD

- Dashboard
- Create Journey
- Journey Detail
- Edit Journey
- Delete Journey

## Phase 5

Unsplash

- Search API
- Search UI
- Cover 선택
- Attribution
- Download tracking

## Phase 6

Entry

- Add Moment
- Edit Moment
- Delete Moment
- Timeline

## Phase 7

Travel Passport

- /passport 페이지
- Journey 기반 국가/도시 집계
- Passport Summary
- Country Stamp Grid
- Empty State
- 모바일 UI

## Phase 8

Error Handling

- Loading
- Empty
- API Error
- Database Error

## Phase 9

Responsive / Polish

- Mobile
- Tablet
- Desktop
- Typography
- spacing
- image ratio

## Phase 10

Testing

- 주요 사용자 흐름 검증

## Phase 11

Deploy

- GitHub
- Vercel
- Environment Variables
- Production Test

---

# 64. Essential Test Cases

최소 다음 테스트를 수행한다.

### Test 01

Destination:

Kyoto

Start:

2026-04-01

End:

2026-04-05

예상:

5개의 Day 생성.

---

### Test 02

Unsplash 검색:

Kyoto

예상:

이미지 결과 표시.

---

### Test 03

Cover 선택

예상:

선택 상태 표시.

Journey 저장 후 Cover 정상 표시.

---

### Test 04

Entry 생성

Place:

Fushimi Inari

Content:

Beautiful morning.

예상:

Day 1 Timeline에 표시.

---

### Test 05

End Date가 Start Date보다 이전.

예상:

Validation Error.

---

### Test 06

Unsplash API 실패.

예상:

앱 crash 안 함.

Continue without a cover 가능.

---

### Test 07

Journey 삭제.

예상:

Confirmation 후 삭제.

Dashboard에서 사라짐.

---

### Test 08

360px 모바일 화면.

예상:

horizontal overflow 없음.

---

### Test 09

Journey:

Japan / Kyoto

예상:

Passport에 Japan Stamp 표시.

Cities에 Kyoto 포함.

---

### Test 10

추가 Journey:

Japan / Tokyo

예상:

Japan Stamp가 중복 생성되지 않음.

Cities에 Kyoto, Tokyo 표시.

Journey Count 증가.

---

### Test 11

Journey:

Thailand / Bangkok

예상:

Thailand Stamp 신규 생성.

Country Count 증가.

---

### Test 12

country 값:

Japan
japan
 JAPAN

예상:

동일 국가로 normalize되어 하나의 Stamp로 집계.

---

# 65. End-to-End Acceptance Scenario

가장 중요한 테스트다.

사용자가 랜딩 페이지에 접속한다.

↓

Start your journey 클릭.

↓

Kyoto 입력.

↓

2026-04-01 ~ 2026-04-05 입력.

↓

Unsplash에서 Kyoto 사진 표시.

↓

한 장을 Cover로 선택.

↓

Journey 생성.

↓

Day 1 ~ Day 5 자동 생성.

↓

Day 1에 Add moment 클릭.

↓

Place:

Fushimi Inari

↓

Note:

생각보다 사람이 많았지만 올라갈수록 조용해졌다.

↓

Save.

↓

Journey 상세 화면에 해당 기록 표시.

이 흐름이 처음부터 끝까지 오류 없이 동작하면 MVP의 핵심 기능이 완성된 것으로 판단한다.

---

# 66. UI Quality Requirements

완성된 결과가 기본 Tailwind 예제처럼 보여서는 안 된다.

특히 다음을 신경 쓴다.

- 넓은 여백
- 큰 Serif Heading
- 사진 중심 구성
- card border 최소화
- excessive shadow 금지
- excessive rounded card 금지
- 모든 요소를 box 안에 넣지 않기
- 여행 잡지 같은 Editorial Layout
- 모바일에서 사진이 크게 보이게 구성
- CTA를 제외하면 accent color 최소화

Dashboard 역시 일반적인 Admin Dashboard처럼 디자인하지 않는다.

Travel Portfolio / Editorial Magazine / Visual Diary 스타일을 유지한다.

---

# 67. Landing Visual Direction

랜딩 페이지에서 다음과 같은 느낌을 목표로 한다.

NOT:

일반 SaaS landing
Dashboard software
파란색 gradient
Glassmorphism
과도한 rounded card
아이콘 중심 설명

YES:

Editorial
Travel Magazine
Photography
Large Typography
Whitespace
Asymmetric Layout
Cinematic Image
Minimal UI

---

# 68. Code Quality

동일한 UI를 반복 작성하지 않는다.

재사용 가능한 Component로 분리한다.

예:

JourneyCard
DaySection
EntryCard
UnsplashPhotoCard
UnsplashAttribution

비즈니스 로직과 UI를 분리한다.

Unsplash 요청을 Component 내부에 직접 길게 작성하지 않는다.

API client/helper를 사용한다.

---

# 69. README

README.md에 다음 내용을 작성한다.

# WAYLOG

## Overview

## Problem

## Target User

## Features

## Architecture

## Tech Stack

## Unsplash API

## Database Schema

## Environment Variables

## Local Development

## Deployment

## Screenshots

## Known Limitations

## Roadmap

---


# V2 Core Feature — Bulk Photo Import & Auto Classification

WAYLOG의 V2 핵심 차별 기능으로 여행 후 수십~수백 장의 사진을 한 번에 가져와 날짜와 장소 기준으로 자동 정리하는 기능을 개발한다.

핵심 흐름:

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

## 1차 분류 — EXIF Date
- 촬영 날짜를 우선 읽는다.
- Journey 기간과 비교하여 Day별로 자동 분류한다.
- 여행 기간 밖의 사진은 Review Queue로 보낸다.

## 2차 분류 — GPS / Planned Places
- GPS 정보가 있으면 Journey에 저장된 장소 좌표와 비교한다.
- 이미 계획했거나 방문했다고 등록한 장소를 후보군으로 우선 사용한다.
- 전 세계 장소를 무조건 추정하지 않는다.

## 3차 분류 — AI Vision
AI Vision은 다음 경우에 한정해 우선 검토한다.
- EXIF 날짜 없음
- GPS 없음
- GPS만으로 장소 구분 어려움
- 사용자가 AI 보조 분류를 요청함

기본 처리 순서:
Metadata
→ GPS / Planned Places
→ Ambiguous Photos Only
→ AI Vision

모든 사진을 기본적으로 Vision API로 보내지 않는다.

## Human-in-the-Loop
자동 분류 결과는 사용자 검토 후 Timeline에 반영한다.

예:
342 photos organized

DAY 01
- Fushimi Inari 31
- Gion 22
- Other 19

[ Review classification ]
[ Apply to diary ]

사용자는 적용 전 사진을 다른 Day / Place로 이동할 수 있어야 한다.

## Processing / Error Handling
- 수백 장 처리 시 진행 상태를 표시한다.
- 일부 사진 실패를 허용하고 전체 Import를 중단하지 않는다.
- 중복 업로드를 방지한다.

## Privacy / Cost
- EXIF는 가능하면 클라이언트에서 우선 추출한다.
- AI Vision은 애매한 사진에만 사용한다.
- 사진 위치정보 사용 목적을 사용자에게 알린다.
- 외부 AI Provider에 이미지를 전송할 경우 명확히 고지한다.

## V2 첫 구현에서 제외
- Google Photos 자동 동기화
- iCloud Photos 자동 동기화
- 백그라운드 지속 업로드
- 실시간 GPS 추적
- 얼굴 인식 기반 인물 분류
- 사용자 승인 없는 자동 공개

## V2 완료 조건
- 한 Journey에 다중 사진 선택 가능
- EXIF 촬영 날짜 추출
- Day 자동 분류
- GPS 존재 시 Journey Places와 매칭
- 불확실 사진 별도 표시
- 사용자 Review 가능
- 승인 후 Timeline 반영
- 일부 사진 실패 시 전체 작업 유지
- 기존 단일 Moment 사진 업로드 유지

---

# 70. Future Roadmap

현재 MVP에서는 구현하지 않지만 구조상 확장 가능하도록 한다.

V1:

- AI 여행 요약
- AI 여행 에세이
- 여행 공유 URL
- Passport 세계지도
- 방문 국가 지도 색칠
- 사용자 사진 업로드
- Supabase Auth

V1.5:

- City Stamp
- 국가별 방문 통계
- 여행 Achievement Badge
- Passport 공유 카드
- 연도별 여행 통계

V2:

- 이미지 Vision 분석
- EXIF 기반 날짜 자동 정리
- GPS 기반 장소 추출
- 자동 여행 Timeline
- Google Photos 연동

V3:

User photos
↓
AI Vision
↓
Date / Location / Scene extraction
↓
Travel Timeline
↓
AI Story
↓
Completed Travel Diary

형태의 AI Travel Assistant로 확장한다.

---

# 71. Important Implementation Rules

코드를 작성할 때 다음을 반드시 지킨다.

1. 한 번에 모든 기능을 무리하게 구현하지 않는다.
2. 각 Phase가 실제 실행되는지 확인한 뒤 다음 단계로 진행한다.
3. 첫 번째 목표는 End-to-End 성공이다.
4. Build error를 남겨둔 상태에서 다음 기능으로 넘어가지 않는다.
5. TypeScript error를 가능한 한 제거한다.
6. Placeholder UI만 만들고 기능 구현을 생략하지 않는다.
7. Unsplash Access Key를 프런트에 노출하지 않는다.
8. Unsplash 이미지는 API에서 제공된 URL을 hotlink한다.
9. Unsplash Cover 선택 시 download tracking 요청을 수행한다.
10. Unsplash 사진에는 photographer attribution을 표시한다.
11. Unsplash가 실패해도 앱의 나머지 기능은 사용할 수 있어야 한다.
12. 삭제 및 중요한 변경에는 사용자 confirmation을 둔다.
13. 환경변수나 API Secret을 코드에 하드코딩하지 않는다.
14. 랜딩 디자인은 heynoah.io를 참고하되 그대로 복제하지 않는다.
15. 여행 앱만의 독자적인 Editorial Design으로 재해석한다.

---

# 72. Final Definition of Done

다음 조건을 만족하면 MVP 완료로 판단한다.

- 랜딩 페이지 완성
- 모바일/데스크톱 반응형
- 새 Journey 생성 가능
- Unsplash 검색 가능
- Cover 선택 가능
- Cover Attribution 표시
- Journey DB 저장 가능
- 기간에 따라 Day 자동 생성
- Day별 Entry 작성 가능
- Entry 수정 및 삭제 가능
- Journey Detail Timeline 표시
- Dashboard Journey 목록 표시
- Loading / Empty / Error State 존재
- Unsplash API 오류 대응
- API Key 비노출
- TypeScript Build 성공
- GitHub 저장 가능
- Vercel 배포 가능
- README 작성
- Passport 페이지 접근 가능
- Journey 기반 방문 국가 자동 집계
- Journey 기반 방문 도시 자동 집계
- 국가별 Stamp 표시
- Passport Summary 통계 표시
- 동일 국가 Journey가 하나의 Stamp로 정상 병합

최종적으로 아래 흐름이 완전히 동작해야 한다.

Landing
→ Create Journey
→ Search Unsplash
→ Choose Cover
→ Save Journey
→ Generate Days
→ Add Moment
→ View Timeline
→ Open Passport
→ View Country Stamp

이 End-to-End 흐름을 가장 먼저 완성하고 이후 디자인과 부가 기능을 개선한다.

---


# Product Release Direction

WAYLOG는 개발용 데모가 아니라 실제 공개 서비스로 운영하는 것을 목표로 한다.

중장기 방향:
1. 저비용 독립 도메인 연결
2. Production 웹서비스 공개
3. 모바일 반응형 / PWA 강화
4. 사용자 데이터 서버 저장 및 계정 기반 동기화
5. SEO / AEO 정비
6. AdSense 등 웹 광고 수익화 검토
7. Android 앱 패키징 및 Google Play 출시
8. 필요 시 iOS 확장

광고는 여행 기록 작성 흐름을 방해하지 않도록 제한적으로 배치하고, 개인 Journey 편집 화면보다 공개 콘텐츠 / 정보성 페이지에서의 수익화를 우선 검토한다.


---

# WAYLOG v1.3 Product Architecture Addendum

> 이 섹션은 기존 명세와 충돌할 경우 우선한다.

## Product Definition

WAYLOG는 여행 전 계획부터 여행 후 기록까지 연결하고, 사용자의 원본 사진을 기본적으로 기기 밖으로 보내지 않으면서 AI가 여행사진과 추억을 자동으로 정리해주는 **Privacy-first Travel Memory Assistant**다.

Brand:
- WAYLOG
- Remember where life took you.
- 여행은 당신이. 기록은 WAYLOG가.

## Core User Workflow

PLAN
→ 여행 생성 / 일정 / 방문 후보 장소 기록

TRAVEL
→ 사용자는 평소처럼 휴대폰 카메라로 사진 촬영
→ 필요하면 WAYLOG에서 Moment / Place 기록

IMPORT
→ 모바일 앱에서 해당 Journey 기간의 사진을 선택

ORGANIZE
→ EXIF
→ GPS
→ Journey Context / Planned & Visited Places
→ On-device Vision
→ Confidence 판단

REVIEW
→ 자동 분류 결과를 사용자에게 제시
→ 사용자가 Day / Place / 대표사진 등을 수정 가능
→ Human Approval

REMEMBER
→ Timeline
→ Travel Journal
→ Passport
→ 선택적 Web Sync

## Local-first Privacy Principle

원본 여행사진은 기본적으로 사용자의 기기에 유지한다.

WAYLOG는 원본 사진의 Cloud 업로드를 기본 요구사항으로 만들지 않는다.

가능한 처리는 기기 내부에서 우선 수행한다:
- EXIF 추출
- GPS 추출
- 썸네일 생성
- 날짜 분류
- Journey 장소 후보 매칭
- On-device Vision
- 분류 confidence 계산

WAYLOG Cloud에는 기본적으로 다음과 같은 구조화된 기록을 저장할 수 있다:
- User
- Journey
- Day
- Place
- Moment
- Passport
- Photo metadata
- classification result
- captured_at
- place assignment
- confidence
- photo count

원본사진과 Cloud metadata를 명확히 분리한다.

## Photo Storage Modes

### 1. Device Only — Default
- 원본사진은 기기에만 존재
- WAYLOG Cloud에는 여행 기록과 필요한 metadata만 저장
- Privacy-first 기본 모드

### 2. Selected Photos Sync — Optional
- Journey Cover 또는 사용자가 선택한 대표사진만 Cloud에 저장
- Web Journal / Share 화면에서 사용 가능
- 사용자가 명시적으로 선택한 사진만 업로드

### 3. Cloud Backup — Optional / Future Pro
- 사용자가 명시적으로 활성화
- 여러 기기에서 사진 접근 가능
- 저장 용량 제한 및 요금제 적용 가능
- 무제한 원본 저장을 기본 제공하지 않음

## Web / Mobile Responsibility

### WAYLOG Web
주요 역할:
- Landing
- Journey 계획
- Journey 관리
- Editorial Travel Journal
- Timeline metadata
- Passport
- 공개/공유 기능
- 검색 / SEO / AEO 콘텐츠
- 계정 / 결제 / Cloud 설정

Web은 원본사진이 Cloud에 없더라도 완성된 제품처럼 보여야 한다.

### WAYLOG Mobile
주요 역할:
- 여행 중 간단 기록
- 기기 사진 접근
- Bulk Photo Import
- EXIF / GPS 분석
- On-device AI
- 대량 사진 자동정리
- Review / Apply
- Local photo viewer
- 선택적 Cloud Sync

Photo Organizer의 핵심 경험은 Mobile을 우선한다.

## Adaptive Web Journal UI

Cloud에 사진이 존재하지 않는 경우 깨진 이미지, 빈 회색 박스, `Photo unavailable` placeholder를 반복해서 표시하지 않는다.

대신 사진 컴포넌트 자체를 제거하고 Editorial Journal 레이아웃으로 전환한다.

예:

DAY 01

FUSHIMI INARI
April 10 · 10:21 AM

38 moments captured
Kyoto, Japan

🔒 Photos on your phone

사진 metadata는 여행의 흔적으로 사용할 수 있다.

가능한 정보:
- 촬영 사진 수
- 촬영 시간 범위
- Place
- Day
- City / Country
- Moment text

Journey Cover 또는 Selected Photos가 Cloud에 있으면 해당 이미지만 Editorial layout에 사용한다.

## AI Architecture — On-device First

기본 분류 파이프라인:

Photo
→ EXIF Date
→ GPS
→ Journey Date
→ Planned / Visited Places
→ Rule-based Matching
→ On-device Vision
→ Confidence
→ User Review
→ Apply

AI는 첫 번째 처리 단계가 아니다.

정확하고 저렴한 deterministic metadata 분석을 먼저 사용한다.

### On-device Vision
On-device AI는 metadata만으로 분류하기 어려운 사진에 사용한다.

가능하면 전체 세계 장소를 추측하게 하지 않고 Journey Context를 제공한다.

예:
Candidate Places:
- Fushimi Inari
- Kiyomizu-dera
- Gion
- Arashiyama

출력은 Structured Result를 사용한다.

예:
{
  "suggestedPlace": "Fushimi Inari",
  "confidence": 0.94,
  "source": "on_device_vision"
}

## Cloud AI — Optional Fallback

Cloud AI는 필수 기능이 아니다.

On-device 처리 후에도 불확실한 사진에 대해 사용자가 선택한 경우에만 사용할 수 있다.

Cloud AI 전송 전:
- 전송 대상 사진 수 표시
- 외부 AI 서비스로 이미지가 전송됨을 고지
- 사용자 명시적 승인

사용자가 거부해도 Journey 작성과 Photo Organizer의 기본 기능은 계속 사용할 수 있어야 한다.

## Human-in-the-Loop

AI가 자동으로 최종 여행기나 사진 분류를 확정하지 않는다.

AI Generate
→ Review
→ User Edit
→ Approve
→ Apply

사용자는 적용 전:
- Day 변경
- Place 변경
- 사진 제외
- 대표사진 변경
- AI 추천 거부

가 가능해야 한다.

## On-device Model Delivery

상용 모바일 앱에서 사용자가 Hugging Face 등 외부 사이트를 방문하여 모델 파일을 직접 다운로드하고 경로를 지정하도록 요구하지 않는다.

모델 설치는 앱이 관리하는 방식으로 제공한다.

권장 UX:

AI Photo Organizer
→ 최초 사용
→ "AI 모델 설치가 필요합니다"
→ 다운로드 용량 표시
→ Wi-Fi 권장
→ Install
→ 이후 로컬 실행

Android 배포에서는 지원되는 공식 앱 배포 / 온디바이스 모델 전달 방식을 우선 검토한다.

모델은 앱 본체와 분리된 on-demand delivery를 우선 고려하며, 실제 모델 크기와 기기 요구사항은 PoC 후 결정한다.

## Device Capability / Fallback

모든 스마트폰이 동일한 AI 성능을 제공한다고 가정하지 않는다.

앱은 최소한 다음을 확인할 수 있도록 설계한다:
- OS
- available memory
- model compatibility
- storage availability
- AI runtime availability

지원이 어려운 기기에서는:
- EXIF/GPS 기반 기본 정리는 유지
- 수동 Review 제공
- 선택적 Cloud AI 제안 가능

Cloud AI 사용을 강제하지 않는다.

## Monetization Principle

과금 이유를 "API 비용"으로 정의하지 않는다.

사용자는 API를 구매하는 것이 아니라 시간 절약과 자동화된 여행 기록 경험을 구매한다.

### Free
- Journey
- Timeline
- Map
- Passport
- 기본 Moment
- Device-only photos
- 기본 EXIF 날짜 정리
- 기본 장소 매칭

### AI Pack
후보 기능:
- 대량 사진 자동정리
- On-device Vision 보조
- 고급 장소 분류
- 대표사진 추천
- Timeline 초안
- 여행 기록 자동 구성

사진 수 기반 상품은 사용성 테스트 후 결정한다.

예:
- Small Trip
- Standard Trip
- Big Trip

가격과 한도는 PoC에서 실제 처리시간 / 기기성능 / 사용자 가치 검증 후 확정한다.

### WAYLOG Pro
후보 기능:
- Cloud Backup
- Selected Photos Sync 확대
- Multi-device
- AI Pack allowance
- 고급 Passport
- 광고 제거
- 향후 고급 공유 기능

## Cost Architecture

WAYLOG의 비용 최적화 우선순위:

1. 원본사진 Device-first
2. Metadata 기반 분류 우선
3. On-device AI
4. 선택 사진만 Cloud Sync
5. Cloud AI는 optional fallback
6. Cloud Backup은 명시적 opt-in

이를 통해:
- Storage 비용
- Image egress
- AI API 비용
- 개인정보 노출 범위

를 동시에 줄인다.

## V2 Photo Organizer PoC

전체 AI 기능을 한 번에 구현하지 않는다.

### Phase A
100~300장 사진 선택
→ EXIF 날짜 읽기
→ Journey Day 자동분류

측정:
- metadata 추출 성공률
- Day 분류 성공률
- 처리시간
- 메모리 사용량

### Phase B
GPS
→ Journey Places 좌표와 비교

측정:
- 장소 자동매칭률
- 오분류율

### Phase C
On-device Vision
→ metadata로 해결되지 않은 사진 분류

측정:
- 모델 다운로드 크기
- 지원 기기 범위
- 사진당 처리시간
- 배터리/발열
- 정확도
- confidence calibration

### Phase D
Review UI
→ 사용자 수정
→ Apply to Timeline

최종 핵심 지표:
- 자동분류 성공률
- 사용자 수정률
- 여행기 완성 시간
- AI 기능 재사용률

## Agent Boundary

현재 V2에서는 자율 Agent를 기본 아키텍처로 사용하지 않는다.

Rule-based Processing + On-device Vision + Structured Output + Human-in-the-Loop으로 먼저 해결한다.

향후 다음과 같은 복합 요청이 실제 사용자 요구로 검증될 경우 Agent를 검토한다:

"이번 제주 여행 사진을 정리하고 대표사진을 고르고 여행기 초안까지 만들어줘."

Agent 도입 시에도 외부 전송, 공개, 결제, 데이터 삭제 등 중요한 Action은 Human Approval을 거친다.

## Product Success Metrics

단순 AI 정확도만 측정하지 않는다.

Before / After 기준으로 측정:
- 사진 정리에 걸린 시간
- 수동 사진 이동 횟수
- 자동분류 승인율
- Journey 완성률
- 여행 후 기록 완료까지 걸린 시간
- Passport 생성률
- AI Organizer 재사용률
- AI Pack 구매 전환율
- Cloud Backup 전환율
