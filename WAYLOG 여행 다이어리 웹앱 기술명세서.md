# WAYLOG 여행 다이어리 웹앱 기술명세서

## 1. Project Overview

### 프로젝트명
WAYLOG

### 프로젝트 목표
사용자가 여행지와 여행 기간을 입력하고, Unsplash API를 통해 여행 대표 이미지를 선택한 뒤, 날짜별 장소·사진·메모를 기록하여 하나의 감성적인 여행 다이어리를 만들 수 있는 웹앱을 개발한다.

앱의 핵심 경험은 다음과 같다.

User → Create Journey → Unsplash Cover 선택 → 날짜별 기록 → 여행 타임라인 완성

단순 여행 사진 검색 서비스가 아니라 사용자의 여행 기록을 중심으로 하는 Digital Travel Diary 서비스로 만든다.

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

서비스의 핵심 요소는 아래 5개다.

Journey
Day
Place
Moment
Story

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

types/
  journey.ts
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

# 25. Database Schema

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

# 26. days Table

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

# 27. entries Table

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

# 28. Relationship

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

# 29. Journey Detail

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

# 30. Day Timeline

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

# 31. Add Entry

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

# 32. Entry Form

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

# 33. Journey Editing

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

# 34. API Design

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

# 35. Get Journey

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

# 36. Update Journey

PATCH

/api/journeys/{journeyId}

---

# 37. Delete Journey

DELETE

/api/journeys/{journeyId}

MVP에서는 삭제 버튼을 Journey Edit 화면 하단에 둔다.

삭제 전:

Are you sure?

confirmation을 반드시 받는다.

---

# 38. Entry API

POST /api/entries

Request:

{
  "dayId": "...",
  "place": "Fushimi Inari",
  "content": "...",
  "photoUrl": "..."
}

---

# 39. Entry Update

PATCH

/api/entries/{entryId}

---

# 40. Entry Delete

DELETE

/api/entries/{entryId}

삭제 전 사용자 confirmation을 받는다.

---

# 41. Validation

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

# 42. Loading State

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

# 43. Error State

Unsplash API 오류가 발생해도 앱 전체가 실패해서는 안 된다.

예:

We couldn't load travel photos.

[ Try again ]

또는:

Continue without a cover

옵션을 제공한다.

Journey 생성 시 Unsplash가 실패해도 사용자는 여행을 생성할 수 있어야 한다.

---

# 44. Empty State

Day에 기록이 없을 경우:

Nothing recorded yet.

Add the first moment from this day.

[ + Add moment ]

---

# 45. API Error Format

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

# 46. Security

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

# 47. Accessibility

기본적인 접근성을 보장한다.

- 모든 image에 alt 제공
- 버튼은 button tag 사용
- form input에 label 제공
- keyboard focus 상태 제공
- 충분한 text contrast 유지
- modal keyboard escape 지원
- 클릭 가능한 div 사용 최소화

---

# 48. Image Handling

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

# 49. Animation

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

# 50. Coding Convention

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

# 51. Internal Type Example

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

# 52. Performance

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

# 53. Unsplash Rate Limit 대응

Demo API 환경에서는 호출 한도가 낮을 수 있으므로 다음을 구현한다.

- 동일 검색어 반복 요청 최소화
- 불필요한 background fetch 금지
- 사용자가 실제 검색할 때만 호출
- 429 또는 제한 관련 오류 UI 처리

Unsplash API가 실패하더라도 Journey 생성 자체가 차단되지 않도록 한다.

---

# 54. Authentication Strategy

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

# 55. Development Priority

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

Error Handling

- Loading
- Empty
- API Error
- Database Error

## Phase 8

Responsive / Polish

- Mobile
- Tablet
- Desktop
- Typography
- spacing
- image ratio

## Phase 9

Testing

- 주요 사용자 흐름 검증

## Phase 10

Deploy

- GitHub
- Vercel
- Environment Variables
- Production Test

---

# 56. Essential Test Cases

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

# 57. End-to-End Acceptance Scenario

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

# 58. UI Quality Requirements

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

# 59. Landing Visual Direction

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

# 60. Code Quality

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

# 61. README

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

# 62. Future Roadmap

현재 MVP에서는 구현하지 않지만 구조상 확장 가능하도록 한다.

V1:

- AI 여행 요약
- AI 여행 에세이
- 여행 공유 URL
- 지도
- 사용자 사진 업로드
- Supabase Auth

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

# 63. Important Implementation Rules

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

# 64. Final Definition of Done

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

최종적으로 아래 흐름이 완전히 동작해야 한다.

Landing
→ Create Journey
→ Search Unsplash
→ Choose Cover
→ Save Journey
→ Generate Days
→ Add Moment
→ View Timeline

이 End-to-End 흐름을 가장 먼저 완성하고 이후 디자인과 부가 기능을 개선한다.