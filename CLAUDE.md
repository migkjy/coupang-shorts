# coupang-shorts — 프로젝트 규칙

## 프로젝트 개요
쿠팡파트너스 상품을 YouTube Shorts / Instagram Reels 영상으로 자동 생성하는 Remotion 기반 파이프라인.

## 기술 스택
- **Remotion 4.x** — React 기반 영상 생성
- **TypeScript** — 전체 타입 안전성
- **Claude API** — 쇼츠 스크립트 자동 생성
- **Late API** — 클라우드 렌더링 (예정)
- **쿠팡파트너스 Open API** — 상품 정보 수집

## 디렉토리 구조
```
coupang-shorts/
├── src/
│   ├── compositions/
│   │   └── ShortsTemplate.tsx  ← 메인 컴포지션 (1080x1920, 30fps, 40초)
│   ├── components/             ← 씬별 컴포넌트
│   │   ├── HookSlide.tsx       ← 0~3초 훅
│   │   ├── FeatureSlide.tsx    ← 3~23초 장점
│   │   ├── ReviewSlide.tsx     ← 23~33초 리뷰
│   │   ├── CTASlide.tsx        ← 33~38초 CTA
│   │   ├── DisclaimerBar.tsx   ← 전체 하단 파트너스 고지
│   │   ├── ProductImage.tsx    ← 상품 이미지
│   │   ├── PriceTag.tsx        ← 가격 태그
│   │   └── SubtitleOverlay.tsx ← 자막 오버레이
│   ├── Root.tsx                ← Remotion Root
│   ├── index.ts                ← 진입점
│   └── types.ts                ← 공유 타입
├── scripts/
│   ├── fetch-products.ts       ← 쿠팡파트너스 상품 선정
│   ├── generate-script.ts      ← Claude API 스크립트 생성
│   └── render-video.ts         ← Remotion 렌더링
├── out/                        ← 출력 (gitignore)
│   ├── products-YYYY-MM-DD.json
│   ├── scripts/
│   └── videos/
└── public/fonts/               ← Pretendard 폰트
```

## 자주 쓰는 명령어
```bash
# Remotion Studio (브라우저 프리뷰)
npm run studio

# 타입 체크
npm run typecheck

# 상품 선정 (오늘의 추천 상품)
npm run fetch

# 스크립트 생성 (Claude API)
npm run generate

# 영상 렌더링 (로컬)
npm run render-video -- --product=7890001
npm run render-video -- --all
```

## 컨텐츠 윤리 규칙 (필수 준수)

### 쿠팡파트너스 고지 의무
- **모든 영상**에 DisclaimerBar 표시 필수
- "이 영상은 쿠팡 파트너스 활동의 일환으로, 구매 시 수수료를 제공받을 수 있습니다."
- DisclaimerBar 제거 또는 숨기는 코드 절대 금지

### 콘텐츠 기준
- **사실 기반** — 실제 상품 정보만 사용 (허위/과장 금지)
- **자동 클릭 유도 금지** — JavaScript/딥링크 자동 실행 금지
- **리뷰 조작 금지** — 가짜 리뷰 생성 금지, 실제 리뷰 기반으로만
- **가격 정확성** — API에서 받은 실제 가격 사용 (임의 조작 금지)

## 영상 스펙
- 해상도: 1080 x 1920 (9:16)
- FPS: 30
- 총 길이: 40초 (1200 frames)
- 씬: Hook(3초) → Feature(20초) → Review(10초) → CTA(5초) → [이후 2초 여유]

## 환경변수
`.env.example` 참조. `.env` 파일 생성 후 실제 키 입력.

## 배포 규칙
- Vercel 배포 없음 (영상 생성 프로젝트)
- Late API 연동은 별도 PL이 처리 — render-video.ts의 `renderWithLateApi` 구현
- 쿠팡파트너스 API 키 발급 후 `fetch-products.ts` 실사용 가능
