# WAYLOG Codex 개발 지침

## 목적
이 프로젝트는 기존 WAYLOG 구현을 유지하면서 최신 기술명세서 `WAYLOG_SPEC.md`를 기준으로 점진적으로 개선한다.

Codex는 새 기능을 추가하기 전에 반드시 현재 구현 상태와 명세서를 비교하고, 이미 정상 동작하는 기능을 불필요하게 다시 만들거나 구조를 크게 변경하지 않는다.

---

## 작업 시작 전 필수 절차

1. 프로젝트 루트의 `WAYLOG_SPEC.md`를 먼저 읽는다.
2. 현재 코드베이스를 확인한다.
3. 최신 명세서와 현재 구현 상태를 비교한다.
4. 바로 코드를 수정하지 않는다.
5. 먼저 아래 형식으로 작업 계획을 보고한다.

### 구현 상태 분류

- 현재 구현됨
- 추가 구현 필요
- 수정 필요
- 이번 작업에서 제외

각 항목에는 관련 파일 또는 경로를 함께 적는다.

---

## 현재 변경의 핵심

이번 명세서에서 새롭게 추가된 핵심 기능은 Travel Passport다.

반드시 다음을 확인한다.

- `/passport` 페이지
- Journey 데이터를 기반으로 방문 국가 자동 집계
- Journey 데이터를 기반으로 방문 도시 자동 집계
- 국가별 Stamp UI
- Passport Summary
  - 방문 국가 수
  - 방문 도시 수
  - Journey 수
  - Moment 수
- 동일 국가 Journey 중복 병합
- 국가명 normalize
- Passport Empty State
- 모바일 UI 및 Navigation 연결

---

## Passport 구현 원칙

MVP에서는 별도의 `stamps` 테이블을 새로 만들지 않는다.

기존 Journey 데이터를 Source of Truth로 사용한다.

예:

`Japan / Kyoto`
→ Japan Stamp 생성

추가 Journey:

`Japan / Tokyo`
→ 새로운 Japan Stamp를 만들지 않고 기존 Japan Stamp에 Tokyo를 추가

추가 Journey:

`Thailand / Bangkok`
→ Thailand Stamp 신규 생성

집계 로직은 UI Component 안에 직접 작성하지 않는다.

예상 위치:

`lib/passport/aggregate.ts`

---

## 기존 구현 보호 원칙

이미 정상 동작하는 다음 기능은 불필요하게 다시 작성하지 않는다.

- Landing Page
- Dashboard
- Journey 생성
- Journey 수정 및 삭제
- Unsplash 검색
- Unsplash Cover 선택
- Unsplash Attribution
- Unsplash Download Tracking
- 날짜별 Day 자동 생성
- Add / Edit / Delete Moment
- Journey Timeline
- 현재 데이터 저장 방식

기존 디자인도 Passport 기능 추가 때문에 전체적으로 재설계하지 않는다.

WAYLOG의 기존 Editorial Travel Magazine 스타일을 유지한다.

---

## 구현 범위 제한

이번 Passport 구현에서 다음 기능은 추가하지 않는다.

- GPS 기반 실제 방문 인증
- 실시간 위치 추적
- Google Maps
- Mapbox
- 세계지도
- Achievement Badge
- Passport 공유 이미지
- AI 여행기
- SNS 기능
- 결제

명세서의 Future Roadmap 기능을 임의로 선행 구현하지 않는다.

---

## 개발 순서

작업 계획 승인 후 아래 순서로 진행한다.

1. Passport 집계 타입 정의
2. Passport aggregate helper 구현
3. Passport Summary 구현
4. Country Stamp UI 구현
5. `/passport` 페이지 구현
6. Navigation 연결
7. Empty State 구현
8. 모바일 반응형 확인
9. 테스트
10. lint / build 검증

각 단계에서 기존 Journey 기능이 깨지지 않았는지 확인한다.

---

## 테스트 요구사항

최소 다음 시나리오를 검증한다.

### Test 1
Journey:
- Japan
- Kyoto

예상:
- Japan Stamp 1개
- Kyoto 표시
- Country Count 1

### Test 2
추가 Journey:
- Japan
- Tokyo

예상:
- Japan Stamp는 여전히 1개
- Kyoto, Tokyo 표시
- Journey Count 증가
- City Count 증가

### Test 3
추가 Journey:
- Thailand
- Bangkok

예상:
- Thailand Stamp 신규 생성
- Country Count 증가

### Test 4
국가명:
- Japan
- japan
- JAPAN
- ` Japan `

예상:
- 동일 국가로 처리

### Test 5
Journey 없음

예상:
- Passport Empty State 표시
- Create Journey CTA 제공

---

## 코드 품질

- TypeScript strict 기준 유지
- `any` 사용 최소화
- 집계 로직과 UI 분리
- 반복 UI는 Component로 분리
- 기존 타입과 충돌하지 않도록 구현
- 불필요한 dependency 추가 금지
- 기존 lint / formatter 규칙 유지
- 기존 build를 깨뜨리지 않는다

---

## 작업 완료 조건

다음을 모두 만족해야 완료로 판단한다.

- `/passport` 정상 접근
- Journey 기반 방문 국가 집계
- Journey 기반 방문 도시 집계
- 동일 국가 중복 제거
- Country Stamp 표시
- Passport Summary 표시
- Empty State 표시
- 모바일 화면 정상
- 기존 Journey 기능 정상
- lint 성공
- build 성공

---

## Codex에 처음 전달할 실행 지시문

프로젝트 루트의 `WAYLOG_SPEC.md`가 최신 기술명세서다.

먼저 현재 구현 상태와 `WAYLOG_SPEC.md`를 비교해줘.

이미 정상 구현된 기능은 다시 만들거나 불필요하게 수정하지 마.
기존 기능과 현재 디자인을 유지하면서 최신 명세서에서 새로 추가되거나 변경된 요구사항만 확인해줘.

특히 이번 변경의 핵심인 다음 항목을 확인해줘.

- Travel Passport
- 방문 국가 자동 집계
- 방문 도시 자동 집계
- Country Stamp
- Passport Summary
- 동일 국가 중복 병합
- `/passport` 페이지
- 모바일 Navigation

아직 코드는 수정하지 말고 먼저 아래 형식으로 정리해줘.

1. 현재 구현됨
2. 추가 구현 필요
3. 수정 필요
4. 이번 작업에서 제외
5. 구현 순서
6. 영향받는 파일 목록

분석 결과를 먼저 보여주고 내 확인을 받은 뒤 구현을 시작해줘.


---


# Current-State Override

이 문서는 기존 Passport 신규 구현 지침보다 아래 현재 상태를 우선한다.

## 현재 구현 상태
Passport 핵심 기능은 이미 대부분 구현되어 있다.
- `/passport`
- Passport 타입
- Journey 기반 국가/도시 집계
- Passport Summary
- Country Stamp
- Stamp Grid
- normalize / 중복 병합
- Header / 모바일 Passport 링크
- Empty State
- Google Maps Journey Map
- Places 좌표 저장
- Moment 사진 업로드

따라서 Passport 전체를 새로 구현하지 않는다.

## 이번 작업 우선순위
1. Passport 관련 코드/포맷 정리
2. City Count 기준 확인 및 필요한 최소 수정
3. CountryStamp 날짜 표시 및 작은 UI 문제 수정
4. Passport 모바일 화면 확인 및 최소 UX 보정
5. README를 실제 구현 상태에 맞게 업데이트
6. Passport 집계 테스트 추가
7. Google Maps / Places / Moment Photo Upload 회귀 테스트
8. lint / build 검증

## City Count 기준
`country`가 존재하는 Journey의 `destination`만 Passport City Count에 포함한다.
country가 비어 있는 Journey의 destination은 제외한다.

## 기존 구현 보호
다음 기능은 삭제하거나 대규모 재설계하지 않는다.
- Landing
- Dashboard
- Journey CRUD
- Unsplash
- Timeline
- Passport
- Google Maps
- Places 좌표 저장
- Moment 사진 업로드
- 현재 데이터 저장 방식

## V2 Bulk Photo Import 규칙
`WAYLOG_SPEC.md`의 `Bulk Photo Import & Auto Classification`은 V2 핵심 기능이다.
현재 Passport 정리 작업과 동시에 구현하지 않는다.
V2 착수 시:
- 기존 단일 사진 업로드를 유지한다.
- EXIF → GPS/Planned Places → Ambiguous Photos Only → AI Vision 순서를 우선한다.
- AI 결과는 사용자 검토 후 적용한다.
- 수백 장 전체를 무조건 Vision API로 보내지 않는다.
- 위치정보와 외부 AI 이미지 전송은 개인정보 보호 요구사항을 반영한다.

## 현재 작업 테스트
- Japan / Kyoto → Japan Stamp 1개, Kyoto 포함
- Japan / Tokyo 추가 → Japan Stamp 중복 없음, City Count 증가
- Thailand / Bangkok 추가 → Country Count 증가
- Japan / japan / JAPAN / ` Japan ` → 동일 국가 처리
- Journey 없음 → Passport Empty State
- 기존 Journey Map 정상
- 기존 Moment 사진 업로드 정상
- lint 성공
- build 성공

## Codex 실행 지시문

프로젝트 루트의 `WAYLOG_SPEC.md`와 `WAYLOG_CODEX_INSTRUCTIONS.md`를 먼저 읽어줘.

`WAYLOG_SPEC.md`가 최신 제품/기술 기준이고, `WAYLOG_CODEX_INSTRUCTIONS.md`가 작업 규칙이야.

현재 Passport 핵심 기능은 이미 대부분 구현되어 있으므로 전체 Passport를 재구현하지 마.

이번 작업은 다음 범위만 진행해줘.
1. Passport 관련 코드/포맷 정리
2. City Count는 `country가 있는 Journey의 destination만 집계` 기준 유지
3. CountryStamp 날짜 표시 및 작은 UI 문제 수정
4. Passport 모바일 화면 최소 UX 보정
5. README 최신화
6. Passport 집계 테스트 추가
7. 기존 Google Maps / Places 좌표 저장 / Moment 사진 업로드 회귀 확인
8. 전체 lint / build 검증

`Bulk Photo Import & Auto Classification`은 V2 핵심 기능으로 명세서에 추가되어 있지만 이번 작업에서는 구현하지 마.

작업 시작 전 영향받는 파일과 변경 계획을 먼저 보여줘.
작업 완료 후에는 변경 파일, 수정 내용, 테스트 결과, 회귀 테스트 결과, lint/build 결과, 남은 이슈를 요약해줘.


---

# v1.3 Architecture Rules

이 섹션은 기존 작업 지침과 충돌할 경우 우선한다.

## 핵심 제품 원칙

WAYLOG는 Privacy-first / Local-first Travel Memory Assistant다.

다음 원칙을 반드시 유지한다.

1. 원본 여행사진은 기본적으로 사용자 기기에 유지한다.
2. Cloud 사진 업로드를 기본 요구사항으로 만들지 않는다.
3. Web은 Cloud 사진이 없어도 정상적이고 완성된 Editorial Journal UI를 제공한다.
4. 사진 자동정리는 EXIF → GPS → Journey Context → On-device Vision 순서를 우선한다.
5. Cloud AI는 optional fallback이다.
6. AI 결과는 User Review 후 적용한다.
7. 사용자가 외부 사이트에서 모델 파일을 직접 다운로드하거나 경로를 지정하게 하지 않는다.
8. Cloud Backup은 opt-in이며 향후 Pro 기능으로 분리 가능하다.
9. 현재 구현된 Google Maps / Places / Moment Photo Upload / Passport 기능은 제거하지 않는다.
10. 자율 Agent는 현재 V2 기본 범위가 아니다.

## Web UI Rule

Cloud 사진이 없는 경우:
- broken image 금지
- 반복적인 빈 placeholder 금지
- `Photo unavailable` 중심 UI 금지

대신:
- 사진 영역을 제거
- Typography / Place / Date / Moment / Photo Count 중심의 Editorial layout 사용
- 필요하면 `Photos on your phone` privacy 상태 표시
- Cloud에 Cover/Selected Photo가 있을 때만 이미지 표시

## Mobile AI Rule

Photo Organizer는 Mobile-first 기능으로 설계한다.

상용 앱에서 AI 모델은 앱이 관리하는 on-demand 설치 흐름을 사용한다.

사용자가 Hugging Face에서 직접 모델을 내려받는 과정을 제품 UX에 노출하지 않는다.

## Current Development Boundary

v1.3 명세에 미래 기능이 추가되었다고 해서 현재 MVP 작업 범위를 자동 확대하지 않는다.

현재 우선순위는:
- 기존 Passport 안정화
- README 최신화
- 테스트
- lint/build
- 현재 웹 MVP 배포 가능 상태 확보

Photo Organizer 개발은 별도 승인 후 PoC Phase A부터 시작한다.

## Photo Organizer 구현 순서

사용자 승인 후에만:

Phase A:
- Bulk photo selection
- Local EXIF parsing
- Journey Day grouping

Phase B:
- GPS parsing
- Journey Places matching

Phase C:
- On-device Vision PoC

Phase D:
- Review / Apply UX

Cloud AI와 Cloud Backup은 위 PoC가 검증되기 전에 핵심 의존성으로 만들지 않는다.

## PoC Success Criteria

Photo Organizer PoC 보고서에는 최소한 다음을 포함한다:
- 테스트 사진 수
- EXIF 성공률
- GPS 포함률
- 자동 Day 분류율
- 장소 매칭률
- On-device AI 대상 사진 비율
- AI 정확도
- 평균 처리시간
- 메모리 사용량
- 모델 크기
- 지원 기기 조건
- 사용자 수정률
- 실패 사례

## Do Not

사용자 승인 없이 다음을 하지 않는다:
- Supabase 전체 마이그레이션
- Cloud에 원본사진 일괄 업로드
- Cloud AI를 필수 의존성으로 추가
- AI Agent 프레임워크 추가
- 대규모 UI 리디자인
- 기존 Passport 재구현
- Google Maps / Places 제거
- 기존 Moment 사진 업로드 제거
