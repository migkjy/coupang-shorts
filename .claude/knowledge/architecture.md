# Architecture — coupang-shorts

## Tech Stack Detail

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Video Engine | Remotion | 4.0.290 | React-based programmatic video generation |
| Web UI | Next.js | 16.x | Dashboard for pipeline monitoring |
| Language | TypeScript | 5.3 | Full type safety |
| Styling | Tailwind CSS | 3.4 | Dashboard UI styling |
| AI Script | Claude API | SDK 0.78+ | Auto-generate shorts scripts |
| TTS | Google/ElevenLabs | - | Korean voice synthesis |
| Upload | YouTube Data API v3 | - | Auto-upload to YouTube |
| Product Data | Coupang Partners API | - | Product info collection |
| Testing | Vitest | 4.x | Unit/integration tests |
| Validation | Zod | 3.x | Runtime schema validation |
| Runtime | Node.js | 20 (.nvmrc) | Server runtime |

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main dashboard (pipeline status, recent videos)
│   ├── pipeline/
│   │   ├── page.tsx        # 6-stage pipeline visualization
│   │   └── logs/
│   │       ├── page.tsx    # Execution logs (charts, filter, search)
│   │       └── data.ts     # Log data types & samples
│   ├── demo/page.tsx       # Demo preview
│   └── api/logs/route.ts   # Log API endpoint
├── remotion/
│   ├── Root.tsx            # Remotion Root component
│   ├── index.ts            # Remotion entry point
│   ├── types.ts            # Shared types
│   ├── compositions/
│   │   └── ShortsTemplate.tsx  # Main composition (1080x1920, 30fps, 40s)
│   └── components/         # Scene components
│       ├── HookSlide.tsx       # [0-3s] Hook
│       ├── FeatureSlide.tsx    # [3-23s] Features + price
│       ├── ReviewSlide.tsx     # [23-33s] Reviews
│       ├── CTASlide.tsx        # [33-38s] CTA
│       ├── DisclaimerBar.tsx   # Partner disclaimer (always visible)
│       ├── ProductImage.tsx
│       ├── PriceTag.tsx
│       └── SubtitleOverlay.tsx
└── test/
    └── setup.ts            # Test env setup

scripts/
├── fetch-products.ts       # Coupang trending product collection
├── generate-script.ts      # Claude AI script generation
├── generate-tts.ts         # TTS voice synthesis
├── render-video.ts         # Remotion local rendering
├── late-api.ts             # Late API cloud rendering (planned)
├── upload-youtube.ts       # YouTube auto-upload
└── pipeline.ts             # Full pipeline orchestration
```

## Video Specs

- Resolution: 1080 x 1920 (9:16 vertical)
- FPS: 30
- Duration: 40 seconds (1,200 frames)
- Format: MP4
- Font: Pretendard

## Pipeline Flow

```
1. fetch-products  → out/products-YYYY-MM-DD.json
2. generate-script → out/scripts/{product-id}.json
3. generate-tts    → out/tts/{product-id}.mp3
4. render-video    → out/videos/{product-id}.mp4
5. upload-youtube  → YouTube Shorts published
6. dashboard       → Pipeline logs & monitoring
```

## Deployment

- **Dashboard (Next.js)**: Vercel, git push only (no CLI deploy)
- **Video pipeline**: Local CLI or server execution
- **CI**: GitHub Actions (vitest + typecheck)
