# Constraints — coupang-shorts

## Content Ethics (최우선)

1. **DisclaimerBar 제거/숨김 절대 금지** — 모든 영상에 파트너스 고지 상시 표시
2. **허위/과장 상품정보 금지** — API 실데이터만 사용
3. **가짜 리뷰 생성 금지** — 실제 리뷰 기반으로만
4. **가격 임의 조작 금지** — API에서 받은 실제 가격 사용
5. **자동 클릭 유도 금지** — JavaScript/딥링크 자동 실행 금지

## Development Rules (CEO/VP 지시)

1. **TDD 강제** — 테스트 먼저 작성 -> 구현 -> 통과
2. **ralph-loop 필수** — PL 실행 시 /ralph-loop 스킬 사용
3. **Plan 없이 코딩 착수 금지** — writing-plans 스킬로 plan 먼저
4. **VP 승인 없이 실행 금지**
5. **Vercel CLI 배포 금지** — git push로만 배포
6. **vercel deploy / vercel --prod 절대 금지**
7. **샘플/더미 데이터 10개 초과 생성 금지**

## DB Rules

- 이 프로젝트는 현재 DB 미사용 (파일 기반 out/ 디렉토리)
- 향후 DB 추가 시 business-builder 공통 DB 규칙 준수

## Deployment Rules

- **staging -> production 순서 필수** (직행 PR 금지)
- **production 브랜치가 생기면 main -> staging -> production 흐름 준수**
- 배포 완료 = 실제 URL에서 확인 후에만 보고

## Reporting

- 보고서에 프로젝트명 `[coupang-shorts]` 접두사 필수
- CEO 보고 시 Notion 링크만 사용 (칸반 링크 금지)
