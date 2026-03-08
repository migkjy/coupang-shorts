import React from 'react';
import { AbsoluteFill } from 'remotion';

export const DisclaimerBar: React.FC = () => {
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          width: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 24,
          paddingRight: 24,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            color: '#CCCCCC',
            fontSize: 22,
            margin: 0,
            fontFamily: 'Pretendard, -apple-system, sans-serif',
            lineHeight: 1.4,
          }}
        >
          이 영상은 쿠팡 파트너스 활동의 일환으로, 구매 시 수수료를 제공받을 수 있습니다.
        </p>
      </div>
    </AbsoluteFill>
  );
};
