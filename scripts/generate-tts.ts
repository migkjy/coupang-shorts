/**
 * TTS 나레이션 생성
 * 옵션 A: Google Cloud TTS (무료 할당량 월 1M자)
 * 옵션 B: ElevenLabs (더 자연스러운 한국어)
 * 환경변수 TTS_PROVIDER로 선택 (기본: google)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { GeneratedScript } from './generate-script';

// ────────────────────────────────────────────────────────────────────────────────
// 스크립트 → 나레이션 텍스트 조합
// ────────────────────────────────────────────────────────────────────────────────

function buildNarrationText(script: GeneratedScript): string {
  const parts: string[] = [
    script.hookText,
    ...script.features,
    script.reviews.map((r) => r.text).join(' '),
    script.ctaText,
  ];
  return parts.join(' ').replace(/[🔥👇✅💯🎉]/g, ''); // 이모지 제거 (TTS 불필요)
}

// ────────────────────────────────────────────────────────────────────────────────
// HTTP 유틸
// ────────────────────────────────────────────────────────────────────────────────

function httpsPost(
  hostname: string,
  path: string,
  headers: Record<string, string>,
  body: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (chunk: Buffer) => chunks.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${buf.toString().slice(0, 200)}`));
        } else {
          resolve(buf);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('TTS 요청 타임아웃'));
    });
    req.write(body);
    req.end();
  });
}

// ────────────────────────────────────────────────────────────────────────────────
// 옵션 A: Google Cloud TTS
// ────────────────────────────────────────────────────────────────────────────────

async function googleTts(text: string, apiKey: string, gender: 'FEMALE' | 'MALE' = 'FEMALE'): Promise<Buffer> {
  const voiceName = gender === 'FEMALE' ? 'ko-KR-Wavenet-A' : 'ko-KR-Wavenet-C';

  const body = JSON.stringify({
    input: { text },
    voice: {
      languageCode: 'ko-KR',
      name: voiceName,
      ssmlGender: gender,
    },
    audioConfig: {
      audioEncoding: 'MP3',
      speakingRate: 1.1,
      pitch: 0.5,
    },
  });

  const responseBuffer = await httpsPost(
    'texttospeech.googleapis.com',
    `/v1/text:synthesize?key=${apiKey}`,
    { 'Content-Type': 'application/json' },
    body
  );

  const parsed = JSON.parse(responseBuffer.toString()) as { audioContent?: string; error?: { message: string } };

  if (parsed.error) {
    throw new Error(`Google TTS 오류: ${parsed.error.message}`);
  }
  if (!parsed.audioContent) {
    throw new Error('Google TTS: audioContent 없음');
  }

  return Buffer.from(parsed.audioContent, 'base64');
}

// ────────────────────────────────────────────────────────────────────────────────
// 옵션 B: ElevenLabs
// ────────────────────────────────────────────────────────────────────────────────

async function elevenLabsTts(text: string, apiKey: string, voiceId: string): Promise<Buffer> {
  const body = JSON.stringify({
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.3,
      use_speaker_boost: true,
    },
  });

  return httpsPost(
    'api.elevenlabs.io',
    `/v1/text-to-speech/${voiceId}`,
    {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Mock TTS (API 키 없을 때 — 빈 MP3 헤더 생성)
// ────────────────────────────────────────────────────────────────────────────────

function mockTts(text: string, outputPath: string): void {
  // 최소 MP3 파일 (1초 무음) — ID3 헤더 + 무음 프레임
  const silentMp3 = Buffer.from([
    0xff, 0xfb, 0x90, 0x00, // MP3 프레임 헤더
    ...new Array(413).fill(0), // 무음 데이터
  ]);
  fs.writeFileSync(outputPath, silentMp3);
  console.warn(`[generate-tts] Mock 오디오 생성 (실제 TTS 없음): ${path.basename(outputPath)}`);
  console.warn(`[generate-tts] 나레이션 텍스트 (${text.length}자): ${text.slice(0, 80)}...`);
}

// ────────────────────────────────────────────────────────────────────────────────
// 재시도 로직
// ────────────────────────────────────────────────────────────────────────────────

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  label = ''
): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 2000;
      console.warn(`  [${label} 재시도 ${attempt}/${retries}] ${delay}ms 후...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error('unreachable');
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 함수
// ────────────────────────────────────────────────────────────────────────────────

export interface TtsResult {
  productId: string;
  audioPath: string;
  textLength: number;
  provider: string;
}

export async function generateTts(script: GeneratedScript): Promise<TtsResult> {
  const outDir = path.join(__dirname, '..', 'out', 'audio');
  fs.mkdirSync(outDir, { recursive: true });

  const outputPath = path.join(outDir, `${script.productId}.mp3`);
  const narrationText = buildNarrationText(script);
  const provider = process.env.TTS_PROVIDER ?? 'google';

  if (provider === 'elevenlabs') {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID ?? 'pNInz6obpgDQGcFmaJgB'; // 기본 Adam 음성

    if (!apiKey) {
      console.warn('[generate-tts] ELEVENLABS_API_KEY 없음 — mock 사용');
      mockTts(narrationText, outputPath);
    } else {
      console.log(`[generate-tts] ElevenLabs TTS 생성 중: ${script.productId}...`);
      const audioBuffer = await withRetry(
        () => elevenLabsTts(narrationText, apiKey, voiceId),
        3,
        'ElevenLabs'
      );
      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`[generate-tts] ElevenLabs 완료: ${outputPath}`);
    }
  } else {
    // 기본: Google TTS
    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) {
      console.warn('[generate-tts] GOOGLE_TTS_API_KEY 없음 — mock 사용');
      mockTts(narrationText, outputPath);
    } else {
      console.log(`[generate-tts] Google TTS 생성 중: ${script.productId}...`);
      const audioBuffer = await withRetry(
        () => googleTts(narrationText, apiKey),
        3,
        'GoogleTTS'
      );
      fs.writeFileSync(outputPath, audioBuffer);
      console.log(`[generate-tts] Google TTS 완료: ${outputPath}`);
    }
  }

  return {
    productId: script.productId,
    audioPath: outputPath,
    textLength: narrationText.length,
    provider: process.env.ELEVENLABS_API_KEY && provider === 'elevenlabs' ? 'elevenlabs' : 'google',
  };
}

export async function generateTtsAll(scripts: GeneratedScript[]): Promise<TtsResult[]> {
  const results: TtsResult[] = [];

  for (const script of scripts) {
    const result = await generateTts(script);
    results.push(result);
  }

  return results;
}

// CLI 실행
if (require.main === module) {
  (async () => {
    try {
      try { require('dotenv').config(); } catch { /* 무시 */ }

      const today = new Date().toISOString().split('T')[0];
      const scriptsDir = path.join(__dirname, '..', 'out', 'scripts');

      if (!fs.existsSync(scriptsDir)) {
        console.error(`스크립트 디렉토리 없음: ${scriptsDir}`);
        console.error('먼저 npm run script를 실행하세요');
        process.exit(1);
      }

      const scriptFiles = fs.readdirSync(scriptsDir).filter((f) => f.endsWith('.json'));
      if (scriptFiles.length === 0) {
        console.error('스크립트 파일이 없습니다');
        process.exit(1);
      }

      const scripts = scriptFiles.map((f) =>
        JSON.parse(fs.readFileSync(path.join(scriptsDir, f), 'utf-8')) as GeneratedScript
      );

      const results = await generateTtsAll(scripts);
      console.log(`\n=== TTS 생성 완료: ${results.length}개 ===`);
      results.forEach((r) => {
        console.log(`  [${r.productId}] ${path.basename(r.audioPath)} (${r.textLength}자, ${r.provider})`);
      });
    } catch (err) {
      console.error('[generate-tts] 오류:', err);
      process.exit(1);
    }
  })();
}
