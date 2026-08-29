# WAYLOG Google Maps Platform 설정 기록

> 목적: Google Maps Platform API의 무단 사용 및 예상치 못한 과금 방지\
> 마지막 설정일: 2026-08-29\
> 이 문서는 Google Cloud Console에서 직접 설정한 외부 인프라 설정을
> 기록한다. 코드 수정 시 아래 제한사항을 반드시 고려한다.

------------------------------------------------------------------------

## 1. 사용 중인 API

WAYLOG에서 사용하는 Google Maps 관련 API는 다음 2개로 제한한다.

-   Maps JavaScript API
-   Places API (New)

현재 API Key에서는 위 2개 API만 사용할 수 있도록 제한되어 있다.

### 중요

새로운 Google Maps API가 필요한 기능을 개발할 경우 임의로 기존 API를
대체하거나 코드만 추가하지 않는다.

먼저 아래 사항을 확인한다.

1.  새로운 API가 정말 필요한지 확인
2.  Google Maps Platform의 현재 과금 정책 확인
3.  예상 API 호출량 확인
4.  Google Cloud Console에서 해당 API 활성화
5.  API Key의 API 제한 목록에 해당 API 추가
6.  해당 API의 Quota 설정
7.  이 문서 업데이트

------------------------------------------------------------------------

## 2. API Key 제한

API Key 이름:

`waylog api`

### API restrictions

허용 API:

-   Maps JavaScript API
-   Places API (New)

그 외 API는 현재 API Key를 통해 사용할 수 없다.

------------------------------------------------------------------------

## 3. 웹사이트 제한 (HTTP Referrer)

Application restriction:

`Websites`

현재 허용된 개발 주소:

`http://localhost:3000/*`

### 실제 서비스 배포 시 필수 작업

WAYLOG 실제 도메인을 연결하면 Google Cloud Console의 API Key 설정에 운영
도메인을 반드시 추가해야 한다.

예:

`https://example.com/*`

www 서브도메인을 사용하는 경우:

`https://www.example.com/*`

실제 도메인을 등록하지 않으면 배포된 WAYLOG에서 Google Maps API가
정상적으로 동작하지 않을 수 있다.

개발 환경을 계속 사용할 경우 localhost 설정은 유지한다.

------------------------------------------------------------------------

## 4. Maps JavaScript API Quota

Google Cloud Console:

Google Maps Platform → Quotas & System Limits → Maps JavaScript API

현재 설정:

  항목                   제한
  ------------------- -------
  Map loads per day     1,000

목적:

-   비정상적인 지도 반복 호출 방지
-   코드 오류에 의한 무한 호출 피해 제한
-   API Key 악용 시 비용 증가 제한

WAYLOG 사용자가 증가하여 1,000회/일 제한에 도달하는 경우 실제 사용량과
비용을 확인한 후 Quota 상향을 검토한다.

------------------------------------------------------------------------

## 5. Places API Quota

Google Cloud Console:

Google Maps Platform → Quotas & System Limits → Places API

현재 설정:

  항목                    제한
  --------------------- ------
  Requests per day         500
  Requests per minute      500

목적:

-   장소 검색 API의 과도한 호출 방지
-   검색 UI 구현 오류에 의한 반복 요청 방지
-   예상치 못한 API 비용 증가 방지

### 개발 시 주의

장소 검색 입력창을 구현할 때 키 입력마다 API를 무조건 호출하지 않는다.

가능하면 debounce를 적용한다.

예: 사용자가 입력을 멈춘 후 약 300\~500ms 뒤 검색 요청 실행.

불필요한 Places API 호출을 최소화한다.

------------------------------------------------------------------------

## 6. Google Cloud Budget

Google Cloud Billing에 월 예산 알림이 설정되어 있다.

  항목                            값
  ----------- ----------------------
  예산 기간                     매월
  예산                       ₩10,000
  알림          50%, 90%, 100%, 150%

현재 Budget은 비용 알림 용도이다.

**IMPORTANT:** Budget ₩10,000은 결제 한도가 아니다.

₩10,000을 초과한다고 Google Maps API가 자동으로 중단되는 것은 아니다.

실제 API 사용량 제한은 각 API에 설정한 Quota가 담당한다.

------------------------------------------------------------------------

## 7. 현재 과금 방어 구조

WAYLOG의 Google Maps API는 다음 4단계로 보호한다.

1.  API 제한
    -   Maps JavaScript API
    -   Places API (New)
2.  HTTP Referrer 제한
    -   `http://localhost:3000/*`
    -   추후 실제 서비스 도메인 추가
3.  API Quota
    -   Maps: 1,000 loads/day
    -   Places: 500 requests/day
    -   Places: 500 requests/minute
4.  Billing Budget Alert
    -   ₩10,000/month

------------------------------------------------------------------------

## 8. Codex 개발 규칙

### API Key

API Key를 Git 저장소에 직접 하드코딩하지 않는다.

-   환경변수를 사용한다.
-   프로젝트의 기존 환경변수 구조를 우선 확인하고 유지한다.
-   `.env` 등 실제 API Key가 포함된 파일은 Git에 커밋하지 않는다.
-   `.gitignore` 상태를 확인한다.
-   `.env.example`에는 실제 Key 대신 placeholder만 기록한다.

예:

`YOUR_GOOGLE_MAPS_API_KEY`

### API 호출 최적화

Places 검색 기능은 불필요한 API 호출을 발생시키지 않도록 구현한다.

가능하면:

-   debounce 적용
-   동일 검색어 중복 호출 방지
-   불필요한 Places 요청 방지
-   필요 이상의 장소 상세정보 요청 방지

------------------------------------------------------------------------

## 9. 운영 배포 체크리스트

-   [ ] 실제 도메인을 HTTP Referrer 허용 목록에 추가
-   [ ] HTTPS 주소 등록
-   [ ] 실제 배포 환경에서 지도 정상 표시 확인
-   [ ] Places 검색 정상 작동 확인
-   [ ] Google Cloud Metrics에서 API 요청량 확인
-   [ ] Maps JavaScript API 일일 사용량 확인
-   [ ] Places API 일일 사용량 확인
-   [ ] Google Cloud Billing 비용 확인
-   [ ] ₩10,000 Budget Alert 유지 여부 확인
-   [ ] 사용자 증가 시 Quota 재검토

------------------------------------------------------------------------

## 10. Quota 변경 원칙

현재 Quota는 WAYLOG 개발/초기 서비스 단계 기준으로 보수적으로 설정되어
있다.

서비스 사용자가 증가하여 Quota 부족이 발생하더라도 무조건 크게 상향하지
않는다.

다음 순서로 처리한다.

사용량 확인 → 불필요한 API 호출 여부 확인 → 코드 최적화 → 예상 월 비용
계산 → 필요한 만큼만 Quota 증가

Quota를 변경한 경우 반드시 이 문서의 값도 업데이트한다.

------------------------------------------------------------------------

## 현재 설정 요약

### Google Maps API

**Maps JavaScript API** - 1,000 map loads/day

**Places API** - 500 requests/day - 500 requests/minute

### 현재 코드 사용 구조

-   Journey 상세의 지도 모달은 Maps JavaScript API만 로드한다.
-   Passport 스탬프 지도 모달도 Maps JavaScript API만 로드한다.
-   현재 코드는 Geocoding API를 호출하지 않는다.
-   Moment 작성/수정 모달의 장소 검색은 Places API (New)의
    Place Autocomplete Element를 사용한다.
-   Places 상세 필드는 사용자가 장소를 선택했을 때만
    `displayName`, `formattedAddress`, `location`으로 제한해 가져온다.
-   지도 핀은 Entry에 저장된 `latitude` / `longitude`를 재사용해 표시한다.
-   Passport 국가별 지도는 해당 국가 Journey의 Entry 좌표만 모아 표시한다.
-   앱 내부 사용량 표시는 브라우저 localStorage 기준의 참고용이며,
    Maps map loads와 Places place selections를 기록한다.
    실제 과금/쿼터 기준은 Google Cloud Console Metrics를 확인한다.
-   기존 Entry는 좌표가 없을 수 있으므로 "No saved coordinates yet." 상태가 표시될 수 있다.
-   지도 렌더링 시 같은 장소를 다시 검색하지 않는다.

### API Key restriction

-   Maps JavaScript API
-   Places API (New)

### HTTP Referrer

-   `http://localhost:3000/*`
-   실제 배포 도메인은 추후 추가

### Google Cloud Budget

-   ₩10,000/month
-   Alert: 50%, 90%, 100%, 150%

**상태: 개발 환경 과금 방지 기본 설정 완료**
