/**
 * YouTube Data API v3 영상 업로드
 * googleapis 패키지 사용
 */

import * as fs from 'fs';
import * as path from 'path';
import type { GeneratedScript } from './generate-script';

// ────────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────────

export interface YouTubeUploadResult {
  productId: string;
  videoId: string;
  videoUrl: string;
  title: string;
  success: boolean;
  error?: string;
}

interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  categoryId: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// 쿠팡파트너스 필수 고지 문구
// ────────────────────────────────────────────────────────────────────────────────

const PARTNER_DISCLOSURE = `
──────────────────────────────
📢 파트너스 활동을 통해 일정액의 수수료를 제공받을 수 있습니다.
이 포스팅은 쿠팡파트너스의 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
──────────────────────────────`;

// ────────────────────────────────────────────────────────────────────────────────
// 메타데이터 빌더
// ────────────────────────────────────────────────────────────────────────────────

function buildVideoMetadata(script: GeneratedScript): VideoMetadata {
  const discountText = script.discountPercent
    ? ` (${script.discountPercent}% 할인)`
    : '';
  const priceText = script.price.toLocaleString();

  const title = `${script.hookText.replace(/[🔥👇✅💯🎉]/g, '').trim()} | ${script.productName.slice(0, 30)}${discountText} #쇼츠`;

  const description = [
    `✅ ${script.productName}`,
    `💰 현재가 ${priceText}원${discountText}`,
    ``,
    `🛒 구매 링크 👇`,
    script.deepLink,
    ``,
    `⭐ 특징`,
    ...script.features.map((f) => `  • ${f}`),
    ``,
    `💬 구매자 후기`,
    ...script.reviews.map((r) => `  "${r.text}" — ★${r.rating}`),
    ``,
    `📌 태그: #${script.categoryName} #쿠팡추천 #베스트셀러 #쇼츠추천`,
    PARTNER_DISCLOSURE,
  ].join('\n');

  const tags = [
    script.categoryName,
    script.productName.split(' ').slice(0, 3).join(''),
    '쿠팡추천',
    '베스트셀러',
    '쇼츠추천',
    '할인정보',
    '리뷰',
    'shorts',
  ].filter(Boolean);

  // YouTube 카테고리 매핑 (22 = People & Blogs, 26 = Howto & Style, 28 = Science & Technology)
  const categoryMap: Record<string, string> = {
    뷰티: '26',
    패션: '26',
    주방: '26',
    가전: '28',
    IT: '28',
    건강: '26',
  };
  const categoryId = categoryMap[script.categoryName] ?? '22';

  return { title: title.slice(0, 100), description, tags, categoryId };
}

// ────────────────────────────────────────────────────────────────────────────────
// OAuth2 클라이언트 초기화
// ────────────────────────────────────────────────────────────────────────────────

async function createYouTubeClient() {
  let google: typeof import('googleapis').google;
  try {
    const module = await import('googleapis');
    google = module.google;
  } catch {
    throw new Error('googleapis 패키지가 설치되지 않았습니다. npm install googleapis');
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN 환경변수 필요');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.youtube({ version: 'v3', auth: oauth2Client });
}

// ────────────────────────────────────────────────────────────────────────────────
// 고정 댓글 삽입
// ────────────────────────────────────────────────────────────────────────────────

async function insertPinnedComment(
  youtube: Awaited<ReturnType<typeof createYouTubeClient>>,
  videoId: string,
  script: GeneratedScript
): Promise<void> {
  const commentText = [
    `🛒 구매 링크: ${script.deepLink}`,
    ``,
    `✅ ${script.productName}`,
    `💰 ${script.price.toLocaleString()}원`,
    PARTNER_DISCLOSURE,
  ].join('\n');

  try {
    await youtube.commentThreads.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          videoId,
          topLevelComment: {
            snippet: { textOriginal: commentText },
          },
        },
      },
    });
    console.log(`  [upload-youtube] 고정 댓글 삽입 완료: ${videoId}`);
  } catch (err) {
    // 댓글 실패는 업로드 자체를 롤백하지 않음
    console.warn(`  [upload-youtube] 고정 댓글 삽입 실패 (무시):`, err);
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// Mock 업로드
// ────────────────────────────────────────────────────────────────────────────────

function mockUpload(script: GeneratedScript, videoPath: string): YouTubeUploadResult {
  const fakeVideoId = `MOCK_${script.productId}_${Date.now()}`;
  console.warn(`[upload-youtube] Mock 업로드 (실제 API 없음): ${fakeVideoId}`);
  console.warn(`  파일: ${videoPath}`);
  return {
    productId: script.productId,
    videoId: fakeVideoId,
    videoUrl: `https://youtu.be/${fakeVideoId}`,
    title: `[MOCK] ${script.productName.slice(0, 40)}`,
    success: true,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 업로드 함수
// ────────────────────────────────────────────────────────────────────────────────

export async function uploadToYouTube(
  script: GeneratedScript,
  videoPath: string
): Promise<YouTubeUploadResult> {
  if (!fs.existsSync(videoPath)) {
    return {
      productId: script.productId,
      videoId: '',
      videoUrl: '',
      title: '',
      success: false,
      error: `영상 파일 없음: ${videoPath}`,
    };
  }

  const hasCredentials =
    process.env.YOUTUBE_CLIENT_ID &&
    process.env.YOUTUBE_CLIENT_SECRET &&
    process.env.YOUTUBE_REFRESH_TOKEN;

  if (!hasCredentials) {
    console.warn('[upload-youtube] YouTube 자격증명 없음 — mock 업로드');
    return mockUpload(script, videoPath);
  }

  const metadata = buildVideoMetadata(script);
  console.log(`[upload-youtube] YouTube 업로드 시작: ${script.productName.slice(0, 30)}...`);
  console.log(`  제목: ${metadata.title}`);

  try {
    const youtube = await createYouTubeClient();

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title,
          description: metadata.description,
          tags: metadata.tags,
          categoryId: metadata.categoryId,
          defaultLanguage: 'ko',
        },
        status: {
          privacyStatus: 'public',
          madeForKids: false,
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        mimeType: 'video/mp4',
        body: fs.createReadStream(videoPath),
      },
    });

    const videoId = response.data.id ?? '';
    const videoUrl = `https://youtu.be/${videoId}`;

    console.log(`[upload-youtube] 업로드 완료: ${videoUrl}`);

    // 고정 댓글 삽입
    await insertPinnedComment(youtube, videoId, script);

    return {
      productId: script.productId,
      videoId,
      videoUrl,
      title: metadata.title,
      success: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[upload-youtube] 업로드 실패: ${message}`);
    return {
      productId: script.productId,
      videoId: '',
      videoUrl: '',
      title: metadata.title,
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
        console.error('사용법: ts-node scripts/upload-youtube.ts --id=<productId>');
        process.exit(1);
      }

      const productId = productIdArg.split('=')[1];
      const scriptPath = path.join(__dirname, '..', 'out', 'scripts', `${productId}.json`);
      const videoPath = path.join(__dirname, '..', 'out', 'video', `${productId}.mp4`);

      if (!fs.existsSync(scriptPath)) {
        console.error(`스크립트 없음: ${scriptPath}`);
        process.exit(1);
      }

      const script = JSON.parse(fs.readFileSync(scriptPath, 'utf-8')) as GeneratedScript;
      const result = await uploadToYouTube(script, videoPath);

      console.log('\n=== 업로드 결과 ===');
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('[upload-youtube] 오류:', err);
      process.exit(1);
    }
  })();
}
