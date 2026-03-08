import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ReviewItem } from '../types';

interface ReviewSlideProps {
  reviews: ReviewItem[];
}

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: 40,
            color: star <= rating ? '#FFD700' : '#444444',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const REVIEW_DURATION = 300; // 10초 * 30fps = 2개 리뷰 각 5초

const ReviewCard: React.FC<{ review: ReviewItem; visible: boolean }> = ({ review, visible }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideUp = spring({
    frame: visible ? frame : 0,
    fps,
    config: { damping: 14, stiffness: 90 },
    from: 60,
    to: 0,
  });

  const opacity = spring({
    frame: visible ? frame : 0,
    fps,
    config: { damping: 20 },
    from: 0,
    to: visible ? 1 : 0,
  });

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: 48,
        transform: `translateY(${slideUp}px)`,
        opacity,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      <StarRating rating={review.rating} />
      <p
        style={{
          color: '#FFFFFF',
          fontSize: 46,
          fontWeight: 600,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          margin: '24px 0 16px',
          lineHeight: 1.5,
        }}
      >
        "{review.text}"
      </p>
      <p
        style={{
          color: '#AAAAAA',
          fontSize: 34,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          margin: 0,
        }}
      >
        — {review.author}
      </p>
    </div>
  );
};

export const ReviewSlide: React.FC<ReviewSlideProps> = ({ reviews }) => {
  const frame = useCurrentFrame();

  const reviewIndex = Math.min(Math.floor(frame / (REVIEW_DURATION / 2)), reviews.length - 1);
  const currentReview = reviews[reviewIndex] || reviews[0];

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, #1A1A2E 0%, #16213E 100%)',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 40,
        paddingLeft: 70,
        paddingRight: 70,
        paddingTop: 120,
        paddingBottom: 200,
      }}
    >
      {/* 섹션 제목 */}
      <p
        style={{
          color: '#FF5722',
          fontSize: 44,
          fontWeight: 700,
          fontFamily: 'Pretendard, -apple-system, sans-serif',
          margin: 0,
          textAlign: 'center',
        }}
      >
        실제 구매자 리뷰 💬
      </p>

      {/* 리뷰 카드 */}
      {currentReview && (
        <ReviewCard key={reviewIndex} review={currentReview} visible={true} />
      )}
    </AbsoluteFill>
  );
};
