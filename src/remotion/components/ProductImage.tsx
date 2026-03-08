import React from 'react';
import { Img, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface ProductImageProps {
  src: string;
  width?: number;
  height?: number;
  delay?: number;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  width = 600,
  height = 600,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 80 },
  });

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <Img
        src={src}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
};
