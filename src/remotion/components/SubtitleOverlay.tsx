import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface SubtitleOverlayProps {
  text: string;
  startFrame: number;
  endFrame: number;
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({
  text,
  startFrame,
  endFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isVisible = frame >= startFrame && frame <= endFrame;

  const opacity = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 20 },
  });

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 200,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        paddingLeft: 40,
        paddingRight: 40,
        opacity,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.8)',
          color: '#FFFFFF',
          fontSize: 42,
          fontWeight: 700,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 32,
          paddingRight: 32,
          borderRadius: 16,
          textAlign: 'center',
          lineHeight: 1.5,
          maxWidth: 900,
        }}
      >
        {text}
      </div>
    </div>
  );
};
