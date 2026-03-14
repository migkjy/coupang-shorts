# Project History — coupang-shorts

## Timeline

### 2026-03-08 — Project Init
- `be682f0` feat: Remotion project initialization (1080x1920, 30fps, 40s shorts)
- `048d7e0` feat: 6 pipeline scripts + env configuration
- `706eabf` feat: Next.js dashboard + Remotion hybrid coexistence
- `a9490fa` fix: npm peer dependency conflict resolution
- `26be6cf` fix: regenerate package-lock.json for Vercel build
- `d66a583` fix: Next.js update + turbopack config for Vercel
- `849ca2d` fix: dashboard UI quality improvements
- `5b66b66` feat: pipeline execution logs dashboard with charts
- `ada2575` feat: vitest tests + GitHub Actions CI pipeline
- `4e6ba67` docs: comprehensive README.md + .env.example update

### 2026-03-14 — Session Config
- Added `.claude/` independent session configuration

## Key Decisions
- Remotion chosen for programmatic video (React-based, deterministic)
- Next.js 16 for dashboard UI (App Router)
- Claude API for script generation (Korean language quality)
- Dual TTS support: Google (free) / ElevenLabs (quality)
- Late API planned for cloud rendering (not yet implemented)
