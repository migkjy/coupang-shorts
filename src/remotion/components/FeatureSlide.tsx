import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ProductImage } from './ProductImage';
import { PriceTag } from './PriceTag';

interface FeatureSlideProps {
  productImage: string;
  features: string[];
  price: number;
  originalPrice?: number;
  discountPercent?: number;
}

const FEATURE_DURATION = 150; // 5초 * 30fps

const FeatureItem: React.FC<{ text: string; index: number; currentFeatureIndex: number }> = ({
  text,
  index,
  currentFeatureIndex,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isActive = index === currentFeatureIndex;
  const isPast = index < currentFeatureIndex;

  const slideIn = spring({
    frame: isActive ? frame - index * FEATURE_DURATION : 0,
    fps,
    config: { damping: 14, stiffness: 100 },
    from: 60,
    to: 0,
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        opacity: isActive ? 1 : isPast ? 0.4 : 0.2,
        transform: isActive ? `translateX(${slideIn}px)` : 'none',
        transition: 'opacity 0.3s',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          backgroundColor: isActive ? '#FF5722' : isPast ? '#555' : '#333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontWeight: 900,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
          }}
        >
          {isPast ? '✓' : index + 1}
        </span>
      </div>
      <p
        style={{
          color: isActive ? '#FFFFFF' : '#888888',
          fontSize: 48,
          fontWeight: isActive ? 800 : 600,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {text}
      </p>
    </div>
  );
};

export const FeatureSlide: React.FC<FeatureSlideProps> = ({
  productImage,
  features,
  price,
  originalPrice,
  discountPercent,
}) => {
  const frame = useCurrentFrame();

  // 3개 장점 + 가격 씬 = 4씬 (각 5초)
  const totalFeatures = Math.min(features.length, 3);
  const currentFeatureIndex = Math.min(Math.floor(frame / FEATURE_DURATION), totalFeatures - 1);
  const showPrice = frame >= totalFeatures * FEATURE_DURATION;

  if (showPrice) {
    return (
      <AbsoluteFill
        style={{
          background: 'linear-gradient(180deg, #0F3460 0%, #1A1A2E 100%)',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 60,
          paddingLeft: 60,
          paddingRight: 60,
          paddingTop: 80,
          paddingBottom: 160,
        }}
      >
        <ProductImage src={productImage} width={500} height={500} />
        <PriceTag
          price={price}
          originalPrice={originalPrice}
          discountPercent={discountPercent}
          delay={10}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #0F3460 0%, #1A1A2E 100%)',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexDirection: 'column',
        gap: 40,
        paddingLeft: 80,
        paddingRight: 80,
        paddingTop: 120,
        paddingBottom: 200,
      }}
    >
      {/* 섹션 제목 */}
      <p
        style={{
          color: '#FF5722',
          fontSize: 40,
          fontWeight: 700,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          margin: 0,
          marginBottom: 20,
        }}
      >
        이런 점이 좋아요 👇
      </p>

      {/* 장점 리스트 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, width: '100%' }}>
        {features.slice(0, 3).map((feature, i) => (
          <FeatureItem
            key={i}
            text={feature}
            index={i}
            currentFeatureIndex={currentFeatureIndex}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
