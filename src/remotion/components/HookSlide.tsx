import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ProductImage } from './ProductImage';

interface HookSlideProps {
  hookText: string;
  productImage: string;
  productName: string;
}

export const HookSlide: React.FC<HookSlideProps> = ({
  hookText,
  productImage,
  productName,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSlide = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 80, mass: 1 },
    from: -80,
    to: 0,
  });

  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 60,
        paddingLeft: 60,
        paddingRight: 60,
        paddingTop: 120,
        paddingBottom: 160,
      }}
    >
      {/* Hook 텍스트 */}
      <div
        style={{
          transform: `translateY(${titleSlide}px)`,
          opacity: titleOpacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#FFFFFF',
            fontSize: 72,
            fontWeight: 900,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            lineHeight: 1.3,
            margin: 0,
            textShadow: '0 4px 20px rgba(0,0,0,0.6)',
          }}
        >
          {hookText}
        </p>
      </div>

      {/* 상품 이미지 */}
      <ProductImage src={productImage} width={700} height={700} delay={5} />

      {/* 상품명 */}
      <div
        style={{
          opacity: titleOpacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#E0E0E0',
            fontSize: 44,
            fontWeight: 600,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {productName}
        </p>
      </div>
    </AbsoluteFill>
  );
};
