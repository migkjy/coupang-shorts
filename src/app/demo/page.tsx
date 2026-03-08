import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "영상 데모 | 쿠팡쇼츠 자동화",
  description: "생성된 쿠팡파트너스 쇼츠 영상 미리보기",
};

const mockVideos = [
  {
    id: "vid-001",
    productName: "Apple 에어팟 프로 2세대",
    hookText: "이거 진짜 역대급이에요",
    features: [
      "액티브 노이즈 캔슬링 2배 향상",
      "적응형 오디오로 환경에 맞춤",
      "USB-C 충전 케이스 포함",
    ],
    price: 329000,
    originalPrice: 359000,
    discountPercent: 8,
    ctaText: "구매 링크는 설명란에!",
    thumbnail: null,
  },
  {
    id: "vid-002",
    productName: "다이슨 에어랩 멀티스타일러",
    hookText: "이 드라이기 쓰면 미용실 안 가도 됩니다",
    features: [
      "코안다 기류로 자동 컬링",
      "젖은 머리에서 바로 스타일링",
      "6가지 어태치먼트 구성",
    ],
    price: 698000,
    originalPrice: 790000,
    discountPercent: 12,
    ctaText: "오늘만 이 가격!",
    thumbnail: null,
  },
  {
    id: "vid-003",
    productName: "삼성 갤럭시 S26 Ultra",
    hookText: "카메라 성능 실화인가요?",
    features: [
      "2억 화소 메인 카메라",
      "Galaxy AI 실시간 통역",
      "티타늄 프레임 + S펜 내장",
    ],
    price: 1599000,
    originalPrice: 1699000,
    discountPercent: 6,
    ctaText: "사전예약 혜택 확인하세요!",
    thumbnail: null,
  },
];

function PhoneFrame({ video }: { video: (typeof mockVideos)[0] }) {
  return (
    <div className="mx-auto w-full max-w-[240px]">
      {/* Phone bezel */}
      <div className="rounded-3xl border-2 border-gray-700 bg-black p-2">
        {/* Screen */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-800 to-gray-900"
          style={{ aspectRatio: "9/16" }}
        >
          {/* Hook Scene */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-3 text-3xl">🛒</div>
            <h3 className="mb-2 text-sm font-bold leading-tight text-white">
              {video.hookText}
            </h3>
            <p className="mb-3 text-xs text-gray-400">{video.productName}</p>

            {/* Price Tag */}
            <div className="mb-4 rounded-lg bg-red-600/90 px-3 py-1.5">
              {video.originalPrice && (
                <div className="text-[10px] text-red-200 line-through">
                  {video.originalPrice.toLocaleString()}원
                </div>
              )}
              <div className="text-sm font-bold text-white">
                {video.price.toLocaleString()}원
                {video.discountPercent && (
                  <span className="ml-1 text-xs text-yellow-300">
                    -{video.discountPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="w-full space-y-1 text-left">
              {video.features.map((f, i) => (
                <div key={i} className="text-[10px] text-gray-300">
                  <span className="mr-1 text-blue-400">✓</span>
                  {f}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-3 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-medium text-white">
              {video.ctaText}
            </div>
          </div>

          {/* Disclaimer bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
            <p className="text-center text-[6px] text-gray-500">
              쿠팡 파트너스 활동의 일환으로 수수료를 제공받을 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-2 text-2xl font-bold">영상 데모 미리보기</h1>
        <p className="text-gray-400">
          생성된 쇼츠 영상의 미리보기입니다. 실제 영상은 Remotion으로
          렌더링됩니다.
        </p>
      </section>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {mockVideos.map((video) => (
          <div key={video.id} className="space-y-3">
            <PhoneFrame video={video} />
            <div className="text-center">
              <h3 className="text-sm font-medium">{video.productName}</h3>
              <p className="text-xs text-gray-500">
                40초 | 1080x1920 | 30fps
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Scene breakdown */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-4 text-lg font-semibold">씬 구성 (40초)</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              scene: "Hook",
              time: "0~3초",
              desc: "시선을 끄는 한 줄 카피",
              color: "border-red-800 bg-red-900/30",
            },
            {
              scene: "Feature",
              time: "3~23초",
              desc: "상품 장점 3가지 소개",
              color: "border-blue-800 bg-blue-900/30",
            },
            {
              scene: "Review",
              time: "23~33초",
              desc: "실제 구매 리뷰 하이라이트",
              color: "border-green-800 bg-green-900/30",
            },
            {
              scene: "CTA",
              time: "33~38초",
              desc: "구매 유도 + 링크 안내",
              color: "border-yellow-800 bg-yellow-900/30",
            },
          ].map((s) => (
            <div
              key={s.scene}
              className={`rounded-lg border p-4 ${s.color}`}
            >
              <div className="mb-1 text-sm font-semibold">{s.scene}</div>
              <div className="mb-1 text-xs text-gray-400">{s.time}</div>
              <div className="text-xs text-gray-300">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
