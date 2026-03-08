import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface CTASlideProps {
  ctaText: string;
}

export const CTASlide: React.FC<CTASlideProps> = ({ ctaText }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 120, mass: 0.8 },
    from: 0.8,
    to: 1,
  });

  const opacity = spring({
    frame,
    fps,
    config: { damping: 20 },
  });

  // 화살표 바운스 애니메이션
  const arrowBounce = interpolate(
    frame % 30,
    [0, 15, 30],
    [0, -20, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #FF5722 0%, #E64A19 50%, #BF360C 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 60,
        paddingLeft: 60,
        paddingRight: 60,
        paddingTop: 120,
        paddingBottom: 200,
      }}
    >
      {/* 메인 CTA 텍스트 */}
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#FFFFFF',
            fontSize: 80,
            fontWeight: 900,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            margin: 0,
            lineHeight: 1.3,
            textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          {ctaText}
        </p>
      </div>

      {/* 화살표 아이콘 */}
      <div
        style={{
          transform: `translateY(${arrowBounce}px)`,
          opacity,
        }}
      >
        <p style={{ fontSize: 120, margin: 0 }}>👇</p>
      </div>

      {/* 서브 텍스트 */}
      <div style={{ opacity, textAlign: 'center' }}>
        <p
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 46,
            fontWeight: 600,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            margin: 0,
          }}
        >
          지금 바로 확인해보세요!
        </p>
      </div>
    </AbsoluteFill>
  );
};
