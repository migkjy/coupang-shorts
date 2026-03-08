/**
 * Claude API로 쇼츠 나레이션 스크립트 자동 생성
 */

import * as fs from 'fs';
import * as path from 'path';
import type { CoupangProduct } from './fetch-products';
import type { ShortsProps } from '../src/types';

// ────────────────────────────────────────────────────────────────────────────────
// 타입
// ────────────────────────────────────────────────────────────────────────────────

export interface GeneratedScript extends ShortsProps {
  productId: string;
  deepLink: string;
  categoryName: string;
  commissionRate: number;
}

// ────────────────────────────────────────────────────────────────────────────────
// Mock 스크립트 (API 키 없을 때 테스트용)
// ────────────────────────────────────────────────────────────────────────────────

function getMockScript(product: CoupangProduct): GeneratedScript {
  const discount = product.discountPercent ?? 0;
  return {
    productId: product.productId,
    productName: product.productName,
    productImage: product.productImage,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: discount,
    hookText: `이거 진짜 ${product.reviewCount.toLocaleString()}명이 구매했어요 🔥`,
    features: [
      `${product.categoryName} 베스트셀러 1위 상품`,
      `평점 ★${product.rating} — 검증된 퀄리티`,
      discount > 0 ? `지금 ${discount}% 할인 중! 한정 수량` : '합리적인 가격대',
    ],
    reviews: [
      {
        text: '실제로 써보니 정말 만족해요. 배송도 빠르고 품질도 기대 이상!',
        rating: 5,
        author: '구매자 리뷰',
      },
      {
        text: `재구매 확정입니다. ${product.productName.slice(0, 15)} 강추해요!`,
        rating: 5,
        author: '재구매 후기',
      },
    ],
    ctaText: '구매 링크는 설명란에 👇 지금 바로 확인하세요!',
    deepLink: product.deepLink,
    categoryName: product.categoryName,
    commissionRate: product.commissionRate,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// Claude API 호출
// ────────────────────────────────────────────────────────────────────────────────

async function generateWithClaude(product: CoupangProduct): Promise<GeneratedScript> {
  // 동적 import (설치 여부에 따라)
  let Anthropic: typeof import('@anthropic-ai/sdk').default;
  try {
    const module = await import('@anthropic-ai/sdk');
    Anthropic = module.default;
  } catch {
    throw new Error('@anthropic-ai/sdk 패키지가 설치되지 않았습니다. npm install @anthropic-ai/sdk');
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `당신은 한국 유튜브 쇼츠 스크립트 전문 작가입니다.
상품 정보를 받아 30~40초 분량의 솔직하고 자연스러운 쇼츠 스크립트를 작성합니다.

반드시 아래 JSON 구조로만 응답하세요 (다른 텍스트 없이):
{
  "hookText": "시청자의 관심을 즉시 끄는 한 문장 (3초 분량, 이모지 포함)",
  "features": ["장점1 (5초)", "장점2 (5초)", "장점3 (5초)"],
  "reviews": [
    {"text": "실제 리뷰 느낌의 문장", "rating": 5, "author": "구매자"},
    {"text": "재구매 후기 느낌의 문장", "rating": 5, "author": "재구매자"}
  ],
  "ctaText": "CTA 문구 (설명란 클릭 유도)"
}

규칙:
- 자연스럽고 솔직한 톤 (광고 느낌 최소화)
- 과장 광고 금지 (사실 기반)
- '쿠팡 파트너스' 직접 언급 금지
- 이모지 적절히 활용
- 한국어 구어체 사용`;

  const discount = product.discountPercent ?? 0;
  const userMessage = `다음 상품의 쇼츠 스크립트를 작성해주세요:

상품명: ${product.productName}
카테고리: ${product.categoryName}
가격: ${product.price.toLocaleString()}원${product.originalPrice ? ` (원래 ${product.originalPrice.toLocaleString()}원, ${discount}% 할인)` : ''}
평점: ★${product.rating} (리뷰 ${product.reviewCount.toLocaleString()}개)
주요 특징: ${product.categoryName} 분야 베스트셀러`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Claude 응답이 텍스트가 아닙니다');
  }

  // JSON 추출 (마크다운 코드블록 제거)
  const jsonText = content.text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();

  const parsed = JSON.parse(jsonText) as {
    hookText: string;
    features: string[];
    reviews: Array<{ text: string; rating: number; author: string }>;
    ctaText: string;
  };

  return {
    productId: product.productId,
    productName: product.productName,
    productImage: product.productImage,
    price: product.price,
    originalPrice: product.originalPrice,
    discountPercent: discount,
    hookText: parsed.hookText,
    features: parsed.features,
    reviews: parsed.reviews,
    ctaText: parsed.ctaText,
    deepLink: product.deepLink,
    categoryName: product.categoryName,
    commissionRate: product.commissionRate,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 함수
// ────────────────────────────────────────────────────────────────────────────────

export async function generateScript(product: CoupangProduct): Promise<GeneratedScript> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(`[generate-script] API 키 없음 — mock 스크립트 사용 (${product.productName.slice(0, 20)})`);
    return getMockScript(product);
  }

  console.log(`[generate-script] Claude로 스크립트 생성 중: ${product.productName.slice(0, 30)}...`);
  try {
    const script = await generateWithClaude(product);
    console.log(`[generate-script] 완료: ${product.productId}`);
    return script;
  } catch (err) {
    console.error(`[generate-script] Claude API 오류, mock으로 fallback:`, err);
    return getMockScript(product);
  }
}

export async function generateScripts(products: CoupangProduct[]): Promise<GeneratedScript[]> {
  const scripts: GeneratedScript[] = [];

  for (const product of products) {
    const script = await generateScript(product);
    scripts.push(script);

    // 저장
    const outDir = path.join(__dirname, '..', 'out', 'scripts');
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `${product.productId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(script, null, 2), 'utf-8');

    // API 레이트 리밋 방지
    if (process.env.ANTHROPIC_API_KEY) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return scripts;
}

// CLI 실행
if (require.main === module) {
  (async () => {
    try {
      try { require('dotenv').config(); } catch { /* 무시 */ }

      const today = new Date().toISOString().split('T')[0];
      const productsPath = path.join(__dirname, '..', 'out', `products-${today}.json`);

      if (!fs.existsSync(productsPath)) {
        console.error(`상품 파일 없음: ${productsPath}`);
        console.error('먼저 npm run fetch를 실행하세요');
        process.exit(1);
      }

      const products: CoupangProduct[] = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
      const scripts = await generateScripts(products);

      console.log(`\n=== 생성 완료: ${scripts.length}개 스크립트 ===`);
      scripts.forEach((s) => {
        console.log(`[${s.productId}] ${s.productName.slice(0, 30)}...`);
        console.log(`  훅: ${s.hookText}`);
        console.log(`  CTA: ${s.ctaText}`);
      });
    } catch (err) {
      console.error('[generate-script] 오류:', err);
      process.exit(1);
    }
  })();
}
