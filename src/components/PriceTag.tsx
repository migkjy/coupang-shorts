import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface PriceTagProps {
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  delay?: number;
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('ko-KR') + '원';
};

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  originalPrice,
  discountPercent,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 120 },
    from: 40,
    to: 0,
  });

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20 },
  });

  return (
    <div
      style={{
        transform: `translateY(${slideUp}px)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      {discountPercent && (
        <div
          style={{
            backgroundColor: '#FF5722',
            color: '#FFFFFF',
            fontSize: 32,
            fontWeight: 800,
            paddingTop: 8,
            paddingBottom: 8,
            paddingLeft: 20,
            paddingRight: 20,
            borderRadius: 12,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
          }}
        >
          {discountPercent}% 할인
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
        {originalPrice && (
          <span
            style={{
              color: '#AAAAAA',
              fontSize: 36,
              textDecoration: 'line-through',
              fontFamily: 'Pretendard, -apple-system, sans-serif',
            }}
          >
            {formatPrice(originalPrice)}
          </span>
        )}
        <span
          style={{
            color: '#FF5722',
            fontSize: 64,
            fontWeight: 900,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}
        >
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
};
