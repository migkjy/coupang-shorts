export interface ReviewItem {
  text: string;
  rating: number;
  author: string;
}

export interface ShortsProps {
  productName: string;
  productImage: string;       // URL
  price: number;
  originalPrice?: number;     // 할인 전 가격
  discountPercent?: number;
  hookText: string;           // "이거 진짜 역대급이에요"
  features: string[];         // 장점 3개
  reviews: ReviewItem[];
  ctaText: string;            // "구매 링크는 설명란에!"
}
