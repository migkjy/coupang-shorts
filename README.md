# Coupang Shorts

쿠팡파트너스 상품을 YouTube Shorts / Instagram Reels 영상으로 자동 생성하는 AI 파이프라인.

트렌딩 상품 발굴 → AI 스크립트 생성 → TTS 음성 합성 → Remotion 영상 렌더링 → 자동 업로드까지 6단계 자동화.

## 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| [Remotion](https://www.remotion.dev/) | 4.0.290 | React 기반 프로그래매틱 영상 생성 |
| [Next.js](https://nextjs.org/) | 16.x | 대시보드 웹 UI |
| TypeScript | 5.3 | 전체 타입 안전성 |
| [Claude API](https://docs.anthropic.com/) | SDK 0.78+ | 쇼츠 스크립트 자동 생성 |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | - | 영상 자동 업로드 |
| TTS (Google / ElevenLabs) | - | 한국어 음성 합성 |
| [Late API](https://getlate.dev/) | - | 클라우드 렌더링 (예정) |
| 쿠팡파트너스 Open API | - | 상품 정보 수집 |
| Tailwind CSS | 3.4 | 대시보드 스타일링 |
| Vitest | 4.x | 단위/통합 테스트 |
| Zod | 3.x | 런타임 스키마 검증 |

## 로컬 개발

### 사전 요구사항

- Node.js 18+
- npm

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 실제 API 키 입력

# Next.js 대시보드 실행 (http://localhost:3000)
npm run dev

# Remotion Studio 실행 (영상 미리보기)
npm run studio
```

### 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Next.js 대시보드 개발 서버 |
| `npm run studio` | Remotion Studio (영상 프리뷰) |
| `npm run fetch` | 쿠팡 트렌딩 상품 수집 |
| `npm run script` | Claude AI 쇼츠 스크립트 생성 |
| `npm run tts` | TTS 음성 합성 |
| `npm run render-video` | Remotion 영상 렌더링 (로컬) |
| `npm run upload` | YouTube 자동 업로드 |
| `npm run pipeline` | 전체 파이프라인 일괄 실행 |
| `npm run pipeline:dry` | 파이프라인 드라이런 (테스트) |
| `npm run test` | Vitest 테스트 실행 |
| `npm run test:watch` | Vitest 워치 모드 |
| `npm run typecheck` | TypeScript 타입 검사 |
| `npm run build` | Next.js 프로덕션 빌드 |

## 환경변수

`.env.example` 파일을 복사하여 `.env`를 생성하고, 아래 키를 설정합니다.

### 필수

| 변수 | 용도 | 발급처 |
|------|------|--------|
| `COUPANG_ACCESS_KEY` | 쿠팡파트너스 API 인증 | [쿠팡 개발자센터](https://developers.coupangcorp.com/) |
| `COUPANG_SECRET_KEY` | 쿠팡파트너스 API 시크릿 | 위와 동일 |
| `COUPANG_PARTNER_ID` | 파트너스 ID | 위와 동일 |
| `ANTHROPIC_API_KEY` | Claude AI 스크립트 생성 | [Anthropic Console](https://console.anthropic.com/) |

### 선택

| 변수 | 용도 | 발급처 |
|------|------|--------|
| `TTS_PROVIDER` | TTS 엔진 선택 (`google` 또는 `elevenlabs`, 기본: `google`) | - |
| `GOOGLE_TTS_API_KEY` | Google Cloud TTS (무료 월 1M자) | [GCP Console](https://console.cloud.google.com/) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS (자연스러운 한국어) | [ElevenLabs](https://elevenlabs.io/) |
| `ELEVENLABS_VOICE_ID` | ElevenLabs 음성 ID | 위와 동일 |
| `YOUTUBE_CLIENT_ID` | YouTube 업로드 OAuth2 | [GCP Console](https://console.cloud.google.com/) |
| `YOUTUBE_CLIENT_SECRET` | YouTube OAuth2 시크릿 | 위와 동일 |
| `YOUTUBE_REFRESH_TOKEN` | YouTube OAuth2 리프레시 토큰 | [OAuth Playground](https://developers.google.com/oauthplayground) |
| `LATE_API_KEY` | Late API 클라우드 렌더링 (무료 월 20회) | [Late](https://getlate.dev/) |

## 배포

대시보드(Next.js)는 Vercel에 자동 배포됩니다. Git push로만 배포하며, Vercel CLI 직접 배포는 사용하지 않습니다.

영상 렌더링/업로드 파이프라인은 로컬 또는 서버에서 CLI로 실행합니다.

## 프로젝트 구조

```
coupang-shorts/
├── src/
│   ├── app/                          # Next.js 대시보드
│   │   ├── page.tsx                  # 메인 대시보드 (파이프라인 현황, 최근 영상)
│   │   ├── pipeline/
│   │   │   ├── page.tsx              # 6단계 파이프라인 구조 시각화
│   │   │   └── logs/
│   │   │       ├── page.tsx          # 실행 로그 대시보드 (차트, 필터, 검색)
│   │   │       └── data.ts           # 로그 데이터 타입 및 샘플
│   │   ├── demo/page.tsx             # 데모 미리보기
│   │   └── api/logs/route.ts         # 로그 API 엔드포인트
│   ├── remotion/
│   │   ├── Root.tsx                  # Remotion Root
│   │   ├── index.ts                  # Remotion 진입점
│   │   ├── types.ts                  # 공유 타입 정의
│   │   ├── compositions/
│   │   │   └── ShortsTemplate.tsx    # 메인 컴포지션 (1080x1920, 30fps, 40초)
│   │   └── components/               # 씬별 컴포넌트
│   │       ├── HookSlide.tsx         # [0-3초] 훅 — 시선 잡기
│   │       ├── FeatureSlide.tsx      # [3-23초] 장점 소개 + 가격
│   │       ├── ReviewSlide.tsx       # [23-33초] 실제 리뷰
│   │       ├── CTASlide.tsx          # [33-38초] CTA
│   │       ├── DisclaimerBar.tsx     # 전체 하단 파트너스 고지 (상시 표시)
│   │       ├── ProductImage.tsx      # 상품 이미지
│   │       ├── PriceTag.tsx          # 가격 태그
│   │       └── SubtitleOverlay.tsx   # 자막 오버레이
│   └── test/
│       └── setup.ts                  # 테스트 환경 설정
├── scripts/
│   ├── fetch-products.ts             # 쿠팡 트렌딩 상품 수집
│   ├── generate-script.ts            # Claude AI 스크립트 생성
│   ├── generate-tts.ts               # TTS 음성 합성
│   ├── render-video.ts               # Remotion 로컬 렌더링
│   ├── late-api.ts                   # Late API 클라우드 렌더링
│   ├── upload-youtube.ts             # YouTube 자동 업로드
│   └── pipeline.ts                   # 전체 파이프라인 오케스트레이션
├── out/                              # 출력 디렉토리 (gitignore)
│   ├── products-YYYY-MM-DD.json      # 수집된 상품 데이터
│   ├── scripts/                      # 생성된 스크립트
│   ├── tts/                          # TTS 음성 파일
│   └── videos/                       # 렌더링된 영상
├── public/fonts/                     # Pretendard 폰트
├── docs/plans/                       # 개발 계획 문서
├── package.json
├── tsconfig.json
├── tsconfig.remotion.json
├── vitest.config.ts
├── tailwind.config.ts
└── next.config.ts
```

## 영상 스펙

| 항목 | 값 |
|------|-----|
| 해상도 | 1080 x 1920 (9:16 세로) |
| FPS | 30 |
| 총 길이 | 40초 (1,200 프레임) |
| 포맷 | MP4 |
| 폰트 | Pretendard |

### 씬 구성

| 씬 | 시간 | 프레임 | 내용 |
|----|------|--------|------|
| Hook | 0-3초 | 0-90 | 시선을 잡는 한 줄 문구 + 상품 이미지 |
| Feature | 3-23초 | 90-690 | 장점 3개 순차 소개 + 가격 표시 |
| Review | 23-33초 | 690-990 | 실제 구매 리뷰 2개 |
| CTA | 33-38초 | 990-1140 | 구매 유도 문구 |
| Disclaimer | 전체 | 0-1200 | 하단 파트너스 고지 (상시 표시) |

## 파이프라인 실행 로그

대시보드의 `/pipeline/logs` 페이지에서 파이프라인 실행 이력을 확인할 수 있습니다.

- 일별 실행 건수 차트 (성공/실패 구분)
- 일별 예상 수익 추이 차트
- 스테이지별 실패 건수 분석
- 상태 필터링 (전체/성공/실패/진행중) 및 상품명 검색
- 에러 발생 시 상세 로그 확인 (행 클릭)

## 스크립트 상세

### `npm run fetch` — 상품 수집

쿠팡파트너스 Open API를 통해 카테고리별 인기 상품을 수집합니다. 가격 변동, 리뷰 수, 판매 추이를 분석하여 쇼츠에 적합한 상품을 선정합니다.

출력: `out/products-YYYY-MM-DD.json`

### `npm run script` — AI 스크립트 생성

Claude API가 수집된 상품 정보를 기반으로 40초 분량의 쇼츠 대본을 자동 작성합니다. Hook → Feature → Review → CTA 구조를 따릅니다.

출력: `out/scripts/{product-id}.json`

### `npm run tts` — TTS 음성 합성

생성된 스크립트를 한국어 음성으로 변환합니다. Google Cloud TTS(무료) 또는 ElevenLabs(고품질) 중 선택 가능합니다.

출력: `out/tts/{product-id}.mp3`

### `npm run render-video` — 영상 렌더링

Remotion으로 1080x1920 쇼츠 영상을 렌더링합니다. 상품 이미지, 가격 태그, 자막, CTA가 자동 합성됩니다.

출력: `out/videos/{product-id}.mp4`

### `npm run pipeline` — 전체 파이프라인

위 4단계를 순차 실행합니다. `--dry-run` 플래그로 실제 API 호출 없이 테스트할 수 있습니다.

```bash
npm run pipeline           # 전체 실행
npm run pipeline:dry       # 드라이런 (API 호출 없이 테스트)
```

## 테스트

```bash
# 전체 테스트 실행
npm run test

# 워치 모드
npm run test:watch

# 타입 검사
npm run typecheck
```

테스트 프레임워크: Vitest + React Testing Library + jsdom

## 쿠팡파트너스 고지 의무

이 프로젝트로 생성되는 모든 영상에는 쿠팡파트너스 고지가 포함되어야 합니다.

- 모든 영상 하단에 `DisclaimerBar` 컴포넌트가 상시 표시됩니다.
- 고지 문구: "이 영상은 쿠팡 파트너스 활동의 일환으로, 구매 시 수수료를 제공받을 수 있습니다."
- `DisclaimerBar` 제거 또는 비표시 처리는 금지됩니다.
- 상품 정보는 API에서 받은 실제 데이터만 사용하며, 허위/과장 금지.
- 가짜 리뷰 생성 금지, 실제 리뷰 기반으로만 콘텐츠를 생성합니다.

## 라이선스

Private - NEWBIZSOFT
