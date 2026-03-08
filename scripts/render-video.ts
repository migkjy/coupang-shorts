/**
 * render-video.ts
 * Remotion 렌더링 스크립트 — 로컬 또는 Late API 클라우드 렌더링
 *
 * 사용법:
 *   npx ts-node scripts/render-video.ts --product=7890001      (로컬 렌더링)
 *   npx ts-node scripts/render-video.ts --all                  (오늘 상품 전체)
 *   LATE_API_KEY=xxx npx ts-node scripts/render-video.ts --all (클라우드 렌더링)
 *
 * 환경변수:
 *   LATE_API_KEY  — Late API 키 (getlate.dev) — 설정 시 클라우드 렌더링
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedScript } from './generate-script';

// ────────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────────

interface RenderResult {
  productId: string;
  productName: string;
  outputPath: string;
  duration?: number;
  method: 'local' | 'late-api';
}

// ────────────────────────────────────────────────────────────────────────────────
// Late API 클라우드 렌더링 (Placeholder)
// TODO: Late API (getlate.dev) 연동 — 별도 PL 처리
// ────────────────────────────────────────────────────────────────────────────────

async function renderWithLateApi(script: GeneratedScript): Promise<RenderResult> {
  const lateApiKey = process.env.LATE_API_KEY;
  if (!lateApiKey) {
    throw new Error('LATE_API_KEY 환경변수가 설정되지 않았습니다');
  }

  // TODO: Late API 렌더링 구현
  // 참고: https://getlate.dev/docs
  // 구현 시 별도 PL에게 위임 예정
  throw new Error('[Late API] 연동 미구현 — 별도 PL이 처리 예정');
}

// ────────────────────────────────────────────────────────────────────────────────
// 로컬 Remotion 렌더링
// ────────────────────────────────────────────────────────────────────────────────

async function renderLocally(script: GeneratedScript, outDir: string): Promise<RenderResult> {
  const { execSync } = await import('child_process');

  const outPath = path.join(outDir, `${script.productId}.mp4`);
  const propsJson = JSON.stringify({
    productName: script.productName,
    productImage: script.productImage,
    price: script.price,
    originalPrice: script.originalPrice,
    discountPercent: script.discountPercent,
    hookText: script.hookText,
    features: script.features,
    reviews: script.reviews,
    ctaText: script.ctaText,
  });

  const startTime = Date.now();

  const rootDir = path.join(__dirname, '..');
  const cmd = [
    'npx remotion render ShortsTemplate',
    `--props='${propsJson.replace(/'/g, "\\'")}'`,
    `--output="${outPath}"`,
    '--log=verbose',
  ].join(' ');

  console.log(`[render] 렌더링 시작: ${script.productName.slice(0, 30)}`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit' });

  const duration = (Date.now() - startTime) / 1000;
  console.log(`[render] 완료: ${outPath} (${duration.toFixed(1)}초 소요)`);

  return {
    productId: script.productId,
    productName: script.productName,
    outputPath: outPath,
    duration,
    method: 'local',
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 렌더링 함수
// ────────────────────────────────────────────────────────────────────────────────

export async function renderVideo(script: GeneratedScript): Promise<RenderResult> {
  const outDir = path.join(__dirname, '..', 'out', 'videos');
  fs.mkdirSync(outDir, { recursive: true });

  if (process.env.LATE_API_KEY) {
    console.log('[render] Late API 클라우드 렌더링 사용');
    return renderWithLateApi(script);
  }

  console.log('[render] 로컬 Remotion 렌더링 사용');
  return renderLocally(script, outDir);
}

// ────────────────────────────────────────────────────────────────────────────────
// CLI 실행
// ────────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  (async () => {
    try {
      try { require('dotenv').config(); } catch { /* 무시 */ }

      const args = process.argv.slice(2);
      const isAll = args.includes('--all');
      const productArg = args.find((a) => a.startsWith('--product='));
      const productId = productArg?.split('=')[1];

      const scriptsDir = path.join(__dirname, '..', 'out', 'scripts');
      const today = new Date().toISOString().split('T')[0];

      let scriptsToRender: GeneratedScript[] = [];

      if (isAll) {
        if (!fs.existsSync(scriptsDir)) {
          console.error(`스크립트 디렉토리 없음: ${scriptsDir}`);
          console.error('먼저 npm run generate를 실행하세요');
          process.exit(1);
        }
        const files = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.json'));
        scriptsToRender = files.map((f) =>
          JSON.parse(fs.readFileSync(path.join(scriptsDir, f), 'utf-8'))
        );
      } else if (productId) {
        const scriptPath = path.join(scriptsDir, `${productId}.json`);
        if (!fs.existsSync(scriptPath)) {
          console.error(`스크립트 파일 없음: ${scriptPath}`);
          console.error(`먼저 npm run generate를 실행하세요`);
          process.exit(1);
        }
        scriptsToRender = [JSON.parse(fs.readFileSync(scriptPath, 'utf-8'))];
      } else {
        console.error('사용법: --product=<ID> 또는 --all');
        process.exit(1);
      }

      console.log(`\n총 ${scriptsToRender.length}개 영상 렌더링 시작...\n`);
      const results: RenderResult[] = [];

      for (const script of scriptsToRender) {
        try {
          const result = await renderVideo(script);
          results.push(result);
        } catch (err) {
          console.error(`[render] 실패: ${script.productId}`, err);
        }
      }

      console.log(`\n=== 렌더링 완료: ${results.length}/${scriptsToRender.length}개 ===`);
      results.forEach((r) => {
        console.log(`[${r.method}] ${r.productId} → ${r.outputPath} (${r.duration?.toFixed(1)}초)`);
      });
    } catch (err) {
      console.error('[render-video] 오류:', err);
      process.exit(1);
    }
  })();
}
