/**
 * 쿠팡파트너스 Open API — 베스트셀러 상품 자동 선택
 * 참고: https://developers.coupangcorp.com/hc/en-us/articles/360033917473
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as url from 'url';

// ────────────────────────────────────────────────────────────────────────────────
// 타입 정의
// ────────────────────────────────────────────────────────────────────────────────

export interface CoupangProduct {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  categoryId: string;
  categoryName: string;
  deepLink: string;
  priorityScore: number;
}

interface CoupangApiProduct {
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productOriginalPrice: number;
  discountRate: number;
  rating: number;
  reviewCount: number;
  commissionRate: number;
  categoryId: string;
  categoryName: string;
}

interface FilterOptions {
  minRating?: number;
  minReviewCount?: number;
  minPrice?: number;
  minCommissionRate?: number;
  maxCount?: number;
  category?: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// HMAC 인증 유틸
// ────────────────────────────────────────────────────────────────────────────────

function generateHmacSignature(
  secretKey: string,
  datetime: string,
  method: string,
  path: string,
  query: string
): string {
  const message = `${datetime}${method}${path}${query}`;
  return crypto.createHmac('sha256', secretKey).update(message).digest('hex');
}

function buildAuthorizationHeader(
  accessKey: string,
  secretKey: string,
  method: string,
  requestPath: string,
  queryString: string
): { authorization: string; datetime: string } {
  const datetime = new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + 'Z';
  const signature = generateHmacSignature(secretKey, datetime, method, requestPath, queryString);

  const authorization =
    `CEA algorithm=HMac-SHA256, access-key=${accessKey}, ` +
    `signed-date=${datetime}, signature=${signature}`;

  return { authorization, datetime };
}

// ────────────────────────────────────────────────────────────────────────────────
// API 호출 (재시도 로직 포함)
// ────────────────────────────────────────────────────────────────────────────────

async function httpsGet(
  requestUrl: string,
  headers: Record<string, string>,
  retries = 3
): Promise<unknown> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const parsed = new url.URL(requestUrl);
        const options = {
          hostname: parsed.hostname,
          path: parsed.pathname + parsed.search,
          method: 'GET',
          headers,
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              reject(new Error(`JSON 파싱 실패: ${data.slice(0, 200)}`));
            }
          });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
          req.destroy();
          reject(new Error('요청 타임아웃'));
        });
        req.end();
      });
    } catch (err) {
      if (attempt === retries) throw err;
      const delay = attempt * 1000;
      console.warn(`  [재시도 ${attempt}/${retries}] ${delay}ms 후 재시도...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// ────────────────────────────────────────────────────────────────────────────────
// 쿠팡파트너스 API 호출
// ────────────────────────────────────────────────────────────────────────────────

async function fetchBestsellers(
  accessKey: string,
  secretKey: string,
  partnerId: string,
  categoryId?: string,
  count = 50
): Promise<CoupangApiProduct[]> {
  const apiPath = '/v2/providers/affiliate_open_api/apis/openapi/products/bestsellers';
  const queryParams: Record<string, string> = { limit: String(count) };
  if (categoryId) queryParams.categoryId = categoryId;

  const queryString = new URLSearchParams(queryParams).toString();
  const { authorization } = buildAuthorizationHeader(
    accessKey,
    secretKey,
    'GET',
    apiPath,
    queryString
  );

  const requestUrl = `https://api-gateway.coupang.com${apiPath}?${queryString}`;
  const headers = {
    Authorization: authorization,
    'Content-Type': 'application/json; charset=utf-8',
  };

  const response = await httpsGet(requestUrl, headers) as {
    rCode?: string;
    data?: CoupangApiProduct[];
  };

  if (response.rCode !== '0') {
    throw new Error(`쿠팡 API 오류: ${JSON.stringify(response)}`);
  }

  return response.data ?? [];
}

// ────────────────────────────────────────────────────────────────────────────────
// 우선순위 점수 계산
// ────────────────────────────────────────────────────────────────────────────────

function calculatePriorityScore(product: CoupangApiProduct): number {
  const discountWeight = 1 + (product.discountRate || 0) / 100;
  return product.reviewCount * product.rating * (product.commissionRate / 100) * discountWeight;
}

function buildDeepLink(partnerId: string, productId: number): string {
  return `https://link.coupang.com/a/${partnerId}?pageType=PRODUCT&pageKey=${productId}`;
}

// ────────────────────────────────────────────────────────────────────────────────
// Mock 데이터 (API 키 없을 때 테스트용)
// ────────────────────────────────────────────────────────────────────────────────

function getMockProducts(): CoupangApiProduct[] {
  return [
    {
      productId: 7890001,
      productName: '네오플람 프라이팬 28cm 인덕션 가능 코팅 다이아몬드 무독성',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890001.jpg',
      productPrice: 29900,
      productOriginalPrice: 59800,
      discountRate: 50,
      rating: 4.7,
      reviewCount: 12453,
      commissionRate: 9.0,
      categoryId: '187583',
      categoryName: '주방',
    },
    {
      productId: 7890002,
      productName: '다이슨 에어랩 멀티스타일러 컴플리트 롱 헤어드라이어',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890002.jpg',
      productPrice: 549000,
      productOriginalPrice: 699000,
      discountRate: 21,
      rating: 4.8,
      reviewCount: 28901,
      commissionRate: 7.5,
      categoryId: '303374',
      categoryName: '뷰티',
    },
    {
      productId: 7890003,
      productName: '어패럴 남성 기능성 쿨링 반소매 티셔츠 7종',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890003.jpg',
      productPrice: 22900,
      productOriginalPrice: 39900,
      discountRate: 43,
      rating: 4.5,
      reviewCount: 8712,
      commissionRate: 8.0,
      categoryId: '100002300',
      categoryName: '패션',
    },
    {
      productId: 7890004,
      productName: '쿠쿠 압력밥솥 6인용 IH 방식 CRP-LHTS0610FW',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890004.jpg',
      productPrice: 189000,
      productOriginalPrice: 289000,
      discountRate: 35,
      rating: 4.6,
      reviewCount: 31204,
      commissionRate: 8.5,
      categoryId: '10001000',
      categoryName: '가전',
    },
    {
      productId: 7890005,
      productName: '뉴트리원 종합비타민 + 미네랄 60정 3개월분',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890005.jpg',
      productPrice: 24900,
      productOriginalPrice: 48000,
      discountRate: 48,
      rating: 4.4,
      reviewCount: 6892,
      commissionRate: 10.5,
      categoryId: '100000929',
      categoryName: '건강',
    },
    {
      productId: 7890006,
      productName: '삼성전자 갤럭시탭 S9 FE 태블릿 와이파이 256GB',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890006.jpg',
      productPrice: 429000,
      productOriginalPrice: 579000,
      discountRate: 26,
      rating: 4.5,
      reviewCount: 5432,
      commissionRate: 7.0,
      categoryId: '87022',
      categoryName: 'IT',
    },
    {
      productId: 7890007,
      productName: '나이키 에어맥스 270 운동화 남성 AH8050',
      productImage: 'https://thumbnail6.coupangcdn.com/thumbnails/remote/230x230ex/image/product/item/images/product_main_7890007.jpg',
      productPrice: 89000,
      productOriginalPrice: 149000,
      discountRate: 40,
      rating: 4.6,
      reviewCount: 9801,
      commissionRate: 8.0,
      categoryId: '100000850',
      categoryName: '패션',
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────────
// 필터링 및 선정 로직
// ────────────────────────────────────────────────────────────────────────────────

function filterAndRankProducts(
  rawProducts: CoupangApiProduct[],
  partnerId: string,
  options: FilterOptions
): CoupangProduct[] {
  const {
    minRating = 4.3,
    minReviewCount = 500,
    minPrice = 20000,
    minCommissionRate = 7,
    maxCount = 10,
    category,
  } = options;

  return rawProducts
    .filter((p) => {
      if (p.rating < minRating) return false;
      if (p.reviewCount < minReviewCount) return false;
      if (p.productPrice < minPrice) return false;
      if (p.commissionRate < minCommissionRate) return false;
      if (category && !p.categoryName.includes(category)) return false;
      return true;
    })
    .map((p) => ({
      productId: String(p.productId),
      productName: p.productName,
      productImage: p.productImage,
      price: p.productPrice,
      originalPrice: p.productOriginalPrice,
      discountPercent: p.discountRate,
      rating: p.rating,
      reviewCount: p.reviewCount,
      commissionRate: p.commissionRate,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      deepLink: buildDeepLink(partnerId, p.productId),
      priorityScore: calculatePriorityScore(p),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, maxCount);
}

// ────────────────────────────────────────────────────────────────────────────────
// 메인 실행
// ────────────────────────────────────────────────────────────────────────────────

export async function fetchProducts(options: FilterOptions = {}): Promise<CoupangProduct[]> {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;
  const partnerId = process.env.COUPANG_PARTNER_ID ?? 'PARTNER_ID';

  let rawProducts: CoupangApiProduct[];

  if (!accessKey || !secretKey) {
    console.warn('[fetch-products] API 키 없음 — mock 데이터 사용');
    rawProducts = getMockProducts();
  } else {
    console.log('[fetch-products] 쿠팡파트너스 API 호출 중...');
    rawProducts = await fetchBestsellers(accessKey, secretKey, partnerId, undefined, 50);
    console.log(`[fetch-products] 원본 상품 ${rawProducts.length}개 수신`);
  }

  const selected = filterAndRankProducts(rawProducts, partnerId, options);
  console.log(`[fetch-products] 최종 선정 상품 ${selected.length}개`);

  // out/ 디렉토리 저장
  const outDir = path.join(__dirname, '..', 'out');
  fs.mkdirSync(outDir, { recursive: true });

  const today = new Date().toISOString().split('T')[0];
  const outPath = path.join(outDir, `products-${today}.json`);
  fs.writeFileSync(outPath, JSON.stringify(selected, null, 2), 'utf-8');
  console.log(`[fetch-products] 저장 완료: ${outPath}`);

  return selected;
}

// CLI 실행
if (require.main === module) {
  (async () => {
    try {
      // dotenv 로드 (설치된 경우)
      try {
        require('dotenv').config();
      } catch {
        // dotenv 없으면 무시
      }

      const args = process.argv.slice(2);
      const countArg = args.find((a) => a.startsWith('--count='));
      const categoryArg = args.find((a) => a.startsWith('--category='));

      const products = await fetchProducts({
        maxCount: countArg ? parseInt(countArg.split('=')[1]) : 5,
        category: categoryArg ? categoryArg.split('=')[1] : undefined,
      });

      console.log('\n=== 오늘의 추천 상품 ===');
      products.forEach((p, i) => {
        console.log(
          `${i + 1}. [${p.categoryName}] ${p.productName} — ` +
          `${p.price.toLocaleString()}원 (↓${p.discountPercent}%) ` +
          `★${p.rating} 리뷰${p.reviewCount.toLocaleString()}개 수수료${p.commissionRate}%`
        );
      });
    } catch (err) {
      console.error('[fetch-products] 오류:', err);
      process.exit(1);
    }
  })();
}
