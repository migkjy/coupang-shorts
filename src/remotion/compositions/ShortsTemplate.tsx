import React from 'react';
import {
  AbsoluteFill,
  Sequence,
  useVideoConfig,
} from 'remotion';
import { z } from 'zod';
import { HookSlide } from '../components/HookSlide';
import { FeatureSlide } from '../components/FeatureSlide';
import { ReviewSlide } from '../components/ReviewSlide';
import { CTASlide } from '../components/CTASlide';
import { DisclaimerBar } from '../components/DisclaimerBar';

// Remotion Input Props Schema (zod)
export const ShortsSchema = z.object({
  productName: z.string().default('테스트 상품'),
  productImage: z.string().url().default('https://via.placeholder.com/600x600/FF5722/FFFFFF?text=Product'),
  price: z.number().positive().default(29900),
  originalPrice: z.number().positive().optional(),
  discountPercent: z.number().min(1).max(99).optional(),
  hookText: z.string().default('이거 진짜 역대급이에요 🔥'),
  features: z.array(z.string()).min(1).max(3).default(['장점 1', '장점 2', '장점 3']),
  reviews: z
    .array(
      z.object({
        text: z.string(),
        rating: z.number().min(1).max(5),
        author: z.string(),
      })
    )
    .min(1)
    .default([
      { text: '정말 좋아요! 배송도 빠르고 품질도 훌륭합니다.', rating: 5, author: '구매자1' },
      { text: '가격 대비 최고의 선택이었어요.', rating: 5, author: '구매자2' },
    ]),
  ctaText: z.string().default('구매 링크는 설명란에!'),
});

export type ShortsProps = z.infer<typeof ShortsSchema>;

/**
 * 씬 구성 (총 40초, 30fps = 1200 frames)
 * [0-3초]    HookSlide   — 90 frames
 * [3-23초]   FeatureSlide — 600 frames (장점 3개 x 5초 + 가격 5초)
 * [23-33초]  ReviewSlide  — 300 frames (리뷰 2개 x 5초)
 * [33-38초]  CTASlide     — 150 frames
 * [전체]     DisclaimerBar — 하단 고정
 */
const HOOK_DURATION = 90;       // 3초
const FEATURE_DURATION = 600;   // 20초
const REVIEW_DURATION = 300;    // 10초
const CTA_DURATION = 150;       // 5초

export const ShortsTemplate: React.FC<ShortsProps> = ({
  productName,
  productImage,
  price,
  originalPrice,
  discountPercent,
  hookText,
  features,
  reviews,
  ctaText,
}) => {
  const { width, height } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        width,
        height,
        backgroundColor: '#1A1A2E',
        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      {/* Hook 씬: 0~3초 */}
      <Sequence from={0} durationInFrames={HOOK_DURATION}>
        <HookSlide
          hookText={hookText}
          productImage={productImage}
          productName={productName}
        />
      </Sequence>

      {/* Feature 씬: 3~23초 */}
      <Sequence from={HOOK_DURATION} durationInFrames={FEATURE_DURATION}>
        <FeatureSlide
          productImage={productImage}
          features={features}
          price={price}
          originalPrice={originalPrice}
          discountPercent={discountPercent}
        />
      </Sequence>

      {/* Review 씬: 23~33초 */}
      <Sequence from={HOOK_DURATION + FEATURE_DURATION} durationInFrames={REVIEW_DURATION}>
        <ReviewSlide reviews={reviews} />
      </Sequence>

      {/* CTA 씬: 33~38초 */}
      <Sequence from={HOOK_DURATION + FEATURE_DURATION + REVIEW_DURATION} durationInFrames={CTA_DURATION}>
        <CTASlide ctaText={ctaText} />
      </Sequence>

      {/* 항상 표시: 파트너스 고지 하단바 */}
      <DisclaimerBar />
    </AbsoluteFill>
  );
};
