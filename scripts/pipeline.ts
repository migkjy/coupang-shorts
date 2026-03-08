/**
 * 전체 파이프라인 오케스트레이터
 * fetch-products → generate-script → generate-tts → render → upload
 */

import * as fs from 'fs';
import * as path from 'path';
import { fetchProducts, type CoupangProduct } from './fetch-products';
import { generateScripts, type GeneratedScript } from './generate-script';
import { generateTtsAll, type TtsResult } from './generate-tts';
import { renderWithLate, type LateRenderResult } from './late-api';
import { uploadToYouTube, type YouTubeUploadResult } from './upload-youtube';

// ────────────────────────────────────────────────────────────────────────────────
// CLI 옵션 파싱
// ────────────────────────────────────────────────────────────────────────────────

interface PipelineOptions {
  count: number;
  category?: string;
  dryRun: boolean;
  skipUpload: boolean;
  skipRender: boolean;
}

function parseArgs(args: string[]): PipelineOptions {
  const count = parseInt(
    args.find((a) => a.startsWith('--count='))?.split('=')[1] ?? '5'
  );
  const category = args.find((a) => a.startsWith('--category='))?.split('=')[1];
  const dryRun = args.includes('--dry-run');
  const skipUpload = args.includes('--skip-upload') || dryRun;
  const skipRender = args.includes('--skip-render') || dryRun;

  return { count, category, dryRun, skipUpload, skipRender };
}

// ────────────────────────────────────────────────────────────────────────────────
// 파이프라인 결과 타입
// ────────────────────────────────────────────────────────────────────────────────

interface PipelineProductResult {
  product: CoupangProduct;
  script?: GeneratedScript;
  tts?: TtsResult;
  render?: LateRenderResult;
  upload?: YouTubeUploadResult;
  error?: string;
}

interface PipelineLog {
  runAt: string;
  options: PipelineOptions;
  totalProducts: number;
  successCount: number;
  errorCount: number;
  results: PipelineProductResult[];
  durationSeconds: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// 진행 상황 출력
// ────────────────────────────────────────────────────────────────────────────────

function printBanner(text: string): void {
  const line = '─'.repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${text}`);
  console.log(line);
}

function printStep(step: number, total: number, label: string): void {
  console.log(`\n[${step}/${total}] ${label}`);
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 파이프라인
// ────────────────────────────────────────────────────────────────────────────────

export async function runPipeline(options: PipelineOptions): Promise<PipelineLog> {
  const startTime = Date.now();
  const runAt = new Date().toISOString();

  printBanner(`쿠팡쇼츠 파이프라인 시작 — ${runAt}`);
  console.log(`옵션: ${JSON.stringify(options)}`);

  // ── Step 1: 상품 선정 ─────────────────────────────────────────────────────────
  printStep(1, 4, '베스트셀러 상품 선정');
  let products: CoupangProduct[];
  try {
    products = await fetchProducts({
      maxCount: options.count,
      category: options.category,
    });
  } catch (err) {
    console.error('상품 선정 실패:', err);
    throw err;
  }
  console.log(`  → 선정된 상품: ${products.length}개`);

  // ── Step 2: 스크립트 생성 ──────────────────────────────────────────────────────
  printStep(2, 4, 'AI 스크립트 생성');
  let scripts: GeneratedScript[];
  try {
    scripts = await generateScripts(products);
  } catch (err) {
    console.error('스크립트 생성 실패:', err);
    throw err;
  }
  console.log(`  → 생성된 스크립트: ${scripts.length}개`);

  if (options.dryRun) {
    printBanner('--dry-run 모드: 스크립트 생성 후 종료');
    scripts.forEach((s) => {
      console.log(`\n[${s.productId}] ${s.productName.slice(0, 40)}`);
      console.log(`  훅: ${s.hookText}`);
      console.log(`  특징: ${s.features.join(' | ')}`);
      console.log(`  CTA: ${s.ctaText}`);
    });

    return buildLog(runAt, options, products, scripts, [], [], [], startTime);
  }

  // ── Step 3: TTS 생성 ──────────────────────────────────────────────────────────
  printStep(3, 4, 'TTS 나레이션 생성');
  let ttsResults: TtsResult[];
  try {
    ttsResults = await generateTtsAll(scripts);
  } catch (err) {
    console.error('TTS 생성 실패:', err);
    throw err;
  }
  console.log(`  → 생성된 오디오: ${ttsResults.length}개`);

  // ── Step 4: 렌더링 + 업로드 ───────────────────────────────────────────────────
  printStep(4, 4, '영상 렌더링 및 업로드');

  const renderResults: LateRenderResult[] = [];
  const uploadResults: YouTubeUploadResult[] = [];

  for (const script of scripts) {
    console.log(`\n  처리 중: ${script.productName.slice(0, 40)}...`);

    // 렌더링
    let renderResult: LateRenderResult | undefined;
    if (!options.skipRender) {
      renderResult = await renderWithLate(script.productId, {
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
      renderResults.push(renderResult);
    } else {
      console.log('    렌더링 건너뜀 (--skip-render)');
    }

    // 업로드
    if (!options.skipUpload) {
      const videoPath = renderResult?.videoPath ??
        path.join(__dirname, '..', 'out', 'video', `${script.productId}.mp4`);
      const uploadResult = await uploadToYouTube(script, videoPath);
      uploadResults.push(uploadResult);
      if (uploadResult.success) {
        console.log(`    업로드 완료: ${uploadResult.videoUrl}`);
      } else {
        console.warn(`    업로드 실패: ${uploadResult.error}`);
      }
    } else {
      console.log('    업로드 건너뜀 (--skip-upload)');
    }
  }

  return buildLog(runAt, options, products, scripts, ttsResults, renderResults, uploadResults, startTime);
}

// ────────────────────────────────────────────────────────────────────────────────
// 로그 빌더
// ────────────────────────────────────────────────────────────────────────────────

function buildLog(
  runAt: string,
  options: PipelineOptions,
  products: CoupangProduct[],
  scripts: GeneratedScript[],
  ttsResults: TtsResult[],
  renderResults: LateRenderResult[],
  uploadResults: YouTubeUploadResult[],
  startTime: number
): PipelineLog {
  const results: PipelineProductResult[] = products.map((product) => ({
    product,
    script: scripts.find((s) => s.productId === product.productId),
    tts: ttsResults.find((t) => t.productId === product.productId),
    render: renderResults.find((r) => r.productId === product.productId),
    upload: uploadResults.find((u) => u.productId === product.productId),
  }));

  const successCount = results.filter(
    (r) => r.script && (!renderResults.length || r.render?.success) && (!uploadResults.length || r.upload?.success)
  ).length;

  const log: PipelineLog = {
    runAt,
    options,
    totalProducts: products.length,
    successCount,
    errorCount: products.length - successCount,
    results,
    durationSeconds: Math.round((Date.now() - startTime) / 1000),
  };

  // 로그 저장
  const outDir = path.join(__dirname, '..', 'out');
  fs.mkdirSync(outDir, { recursive: true });
  const today = new Date().toISOString().split('T')[0];
  const logPath = path.join(outDir, `pipeline-log-${today}.json`);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf-8');

  return log;
}

// ────────────────────────────────────────────────────────────────────────────────
// CLI 실행
// ────────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  (async () => {
    try {
      try { require('dotenv').config(); } catch { /* 무시 */ }

      const options = parseArgs(process.argv.slice(2));
      const log = await runPipeline(options);

      printBanner('파이프라인 완료');
      console.log(`총 상품: ${log.totalProducts}개`);
      console.log(`성공: ${log.successCount}개 | 실패: ${log.errorCount}개`);
      console.log(`소요 시간: ${log.durationSeconds}초`);

      if (log.results.length > 0) {
        console.log('\n=== 결과 요약 ===');
        log.results.forEach((r) => {
          const uploadUrl = r.upload?.videoUrl ?? '(업로드 없음)';
          const status = r.script ? '✓' : '✗';
          console.log(`${status} [${r.product.productId}] ${r.product.productName.slice(0, 30)} → ${uploadUrl}`);
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const logPath = path.join(__dirname, '..', 'out', `pipeline-log-${today}.json`);
      console.log(`\n로그 저장: ${logPath}`);

    } catch (err) {
      console.error('[pipeline] 치명적 오류:', err);
      process.exit(1);
    }
  })();
}
