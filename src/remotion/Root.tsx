import React from 'react';
import { Composition } from 'remotion';
import { ShortsTemplate, ShortsSchema } from './compositions/ShortsTemplate';

/**
 * Remotion Root — 모든 컴포지션 등록
 *
 * 해상도: 1080x1920 (9:16 세로 — YouTube Shorts / Instagram Reels)
 * FPS: 30
 * 총 길이: 40초 = 1200 frames
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShortsTemplate"
        component={ShortsTemplate}
        durationInFrames={1200}
        fps={30}
        width={1080}
        height={1920}
        schema={ShortsSchema}
        defaultProps={{
          productName: '샘플 상품명',
          productImage: 'https://via.placeholder.com/600x600/FF5722/FFFFFF?text=Product',
          price: 29900,
          originalPrice: 49900,
          discountPercent: 40,
          hookText: '이거 진짜 역대급이에요 🔥',
          features: [
            '배송이 로켓처럼 빠릅니다',
            '가격 대비 최고의 품질',
            '한 번 쓰면 못 돌아와요',
          ],
          reviews: [
            {
              text: '정말 좋아요! 배송도 빠르고 품질도 훌륭합니다.',
              rating: 5,
              author: '행복한구매자',
            },
            {
              text: '가격 대비 진짜 최고예요. 재구매 확정!',
              rating: 5,
              author: '만족한고객',
            },
          ],
          ctaText: '구매 링크는 설명란에!',
        }}
      />
    </>
  );
};
