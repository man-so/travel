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
