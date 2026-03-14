# coupang-shorts PL Session Config

## Project Overview
쿠팡파트너스 상품 YouTube Shorts/Instagram Reels 자동 생성 파이프라인.
6단계: 상품수집 -> AI스크립트 -> TTS -> Remotion렌더링 -> 업로드 -> 대시보드.

## Tech Stack
- **Next.js 16** + React 18 (대시보드 UI)
- **Remotion 4.0.290** (프로그래매틱 영상 생성, 1080x1920, 30fps, 40초)
- **TypeScript 5.3**, Tailwind CSS 3.4
- **Claude API** (@anthropic-ai/sdk) - 쇼츠 스크립트 생성
- **Vitest 4** + React Testing Library (테스트)
- **Zod 3** (런타임 검증)
- Node.js 20 (.nvmrc)

## Key Commands
```bash
npm run dev          # Next.js 대시보드 (localhost:3000)
npm run studio       # Remotion Studio (영상 프리뷰)
npm run pipeline     # 전체 파이프라인 실행
npm run pipeline:dry # 드라이런
npm run test         # Vitest
npm run typecheck    # tsc --noEmit
```

## Key Directories
- `src/app/` — Next.js 대시보드 페이지
- `src/remotion/` — Remotion 컴포지션/컴포넌트
- `scripts/` — CLI 파이프라인 스크립트 6개
- `out/` — 출력물 (gitignored)

## Content Ethics (필수)
- DisclaimerBar 제거/숨김 절대 금지
- 허위/과장 상품정보 금지, API 실데이터만 사용
- 가짜 리뷰 생성 금지

## Deployment
- 대시보드: Vercel (git push 배포, CLI 배포 금지)
- 영상 파이프라인: 로컬/서버 CLI 실행
- GitHub: migkjy/coupang-shorts (main branch)

## Session Protocol
- 자비스 회신: `scripts/project-reply.sh "메시지" "coupang-shorts"`
- 작업 완료 시 `.claude/knowledge/history.md` 업데이트
- TDD 강제: 테스트 먼저 -> 구현 -> 통과
- ralph-loop 사용 필수

## Environment
- `.env` 필요 (`.env.example` 참조)
- API keys: `.claude/knowledge/api-keys.md` (gitignored)
