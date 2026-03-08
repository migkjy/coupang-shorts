/**
 * Late API (getlate.dev) 클라우드 렌더링 연동
 * Remotion 영상을 서버리스 클라우드에서 렌더링
 * 무료: 월 20 렌더링
 * 참고: https://getlate.dev/docs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { ShortsProps } from '../src/types';

// ────────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────────

interface LateRenderRequest {
  compositionId: string;
  inputProps: ShortsProps;
  codec: 'h264' | 'h265' | 'vp8' | 'vp9';
  fps?: number;
  crf?: number;
}

interface LateRenderResponse {
  renderId: string;
  status: 'queued' | 'rendering' | 'done' | 'error';
  outputUrl?: string;
  progress?: number;
  error?: string;
}

export interface LateRenderResult {
  productId: string;
  videoPath: string;
  renderId: string;
  success: boolean;
  error?: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// HTTP 유틸 (Late API 전용)
// ────────────────────────────────────────────────────────────────────────────────

function lateApiRequest(
  method: 'GET' | 'POST',
  apiPath: string,
  apiKey: string,
  body?: string
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.getlate.dev',
      path: apiPath,
      method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error(`Late API 응답 파싱 실패: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Late API 타임아웃'));
    });

    if (body) req.write(body);
    req.end();
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// 렌더링 요청
// ────────────────────────────────────────────────────────────────────────────────

async function requestRender(
  apiKey: string,
  inputProps: ShortsProps
): Promise<LateRenderResponse> {
  const requestBody: LateRenderRequest = {
    compositionId: 'ShortsTemplate',
    inputProps,
    codec: 'h264',
    fps: 30,
    crf: 18,
  };

  const response = await lateApiRequest(
    'POST',
    '/api/render',
    apiKey,
    JSON.stringify(requestBody)
  ) as LateRenderResponse;

  return response;
}

// ────────────────────────────────────────────────────────────────────────────────
// 렌더링 상태 폴링
// ────────────────────────────────────────────────────────────────────────────────

async function pollRenderStatus(
  apiKey: string,
  renderId: string,
  timeoutMs = 300000 // 5분
): Promise<LateRenderResponse> {
  const startTime = Date.now();
  const pollInterval = 5000; // 5초마다 확인

  while (Date.now() - startTime < timeoutMs) {
    const status = await lateApiRequest(
      'GET',
      `/api/render/${renderId}`,
      apiKey
    ) as LateRenderResponse;

    console.log(
      `  [late-api] 렌더링 상태: ${status.status}` +
      (status.progress != null ? ` (${Math.round(status.progress * 100)}%)` : '')
    );

    if (status.status === 'done') return status;
    if (status.status === 'error') {
      throw new Error(`Late API 렌더링 실패: ${status.error}`);
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  throw new Error(`Late API 렌더링 타임아웃 (${timeoutMs / 1000}초 초과)`);
}

// ────────────────────────────────────────────────────────────────────────────────
// MP4 다운로드
// ────────────────────────────────────────────────────────────────────────────────

function downloadFile(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    const urlObj = new URL(url);

    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // 리다이렉트 처리
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          file.close();
          downloadFile(redirectUrl, outputPath).then(resolve).catch(reject);
          return;
        }
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    req.on('error', (err) => {
      fs.unlink(outputPath, () => {}); // 실패 시 파일 삭제
      reject(err);
    });

    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('다운로드 타임아웃'));
    });

    req.end();
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// Mock 렌더링 (API 키 없을 때)
// ────────────────────────────────────────────────────────────────────────────────

function mockRender(productId: string, outputPath: string): LateRenderResult {
  // 빈 MP4 파일 생성 (테스트용)
  const minimalMp4Header = Buffer.from([
    0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
    0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
    0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
  ]);
  fs.writeFileSync(outputPath, minimalMp4Header);
  console.warn(`[late-api] Mock 렌더링 (실제 API 없음): ${path.basename(outputPath)}`);

  return {
    productId,
    videoPath: outputPath,
    renderId: `mock_${productId}_${Date.now()}`,
    success: true,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 함수
// ────────────────────────────────────────────────────────────────────────────────

export async function renderWithLate(
  productId: string,
  inputProps: ShortsProps
): Promise<LateRenderResult> {
  const outDir = path.join(__dirname, '..', 'out', 'video');
  fs.mkdirSync(outDir, { recursive: true });
  const outputPath = path.join(outDir, `${productId}.mp4`);

  const apiKey = process.env.LATE_API_KEY;

  if (!apiKey) {
    console.warn('[late-api] LATE_API_KEY 없음 — mock 렌더링');
    return mockRender(productId, outputPath);
  }

  console.log(`[late-api] 클라우드 렌더링 요청: ${productId}`);

  try {
    // 렌더링 요청
    const renderResponse = await requestRender(apiKey, inputProps);
    console.log(`  [late-api] 렌더 ID: ${renderResponse.renderId}`);

    // 폴링
    const finalStatus = await pollRenderStatus(apiKey, renderResponse.renderId);

    if (!finalStatus.outputUrl) {
      throw new Error('Late API: outputUrl 없음');
    }

    // MP4 다운로드
    console.log(`  [late-api] MP4 다운로드 중...`);
    await downloadFile(finalStatus.outputUrl, outputPath);
    console.log(`  [late-api] 다운로드 완료: ${outputPath}`);

    return {
      productId,
      videoPath: outputPath,
      renderId: renderResponse.renderId,
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[late-api] 렌더링 실패: ${message}`);
    return {
      productId,
      videoPath: '',
      renderId: '',
      success: false,
      error: message,
    };
  }
}

// CLI 실행
if (require.main === module) {
  (async () => {
    try {
      try { require('dotenv').config(); } catch { /* 무시 */ }

      const args = process.argv.slice(2);
      const productIdArg = args.find((a) => a.startsWith('--id='));
      if (!productIdArg) {
        console.error('사용법: ts-node scripts/late-api.ts --id=<productId>');
        process.exit(1);
      }

      const productId = productIdArg.split('=')[1];
      const scriptPath = path.join(__dirname, '..', 'out', 'scripts', `${productId}.json`);

      if (!fs.existsSync(scriptPath)) {
        console.error(`스크립트 없음: ${scriptPath}`);
        process.exit(1);
      }

      const script = JSON.parse(fs.readFileSync(scriptPath, 'utf-8')) as ShortsProps;
      const result = await renderWithLate(productId, script);

      console.log('\n=== 렌더링 결과 ===');
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[late-api] 오류:', err);
      process.exit(1);
    }
  })();
}
