const steps = [
  {
    number: 1,
    icon: "🔍",
    title: "트렌딩 상품 발굴",
    description:
      "쿠팡파트너스 Open API를 통해 카테고리별 인기 상품을 자동으로 수집합니다. 가격 변동, 리뷰 수, 판매 추이를 분석하여 쇼츠에 적합한 상품을 선정합니다.",
    tech: ["쿠팡파트너스 API", "트렌드 분석 알고리즘"],
    command: "npm run fetch",
    output: "out/products-YYYY-MM-DD.json",
  },
  {
    number: 2,
    icon: "📝",
    title: "AI 스크립트 생성",
    description:
      "Claude AI가 상품 정보를 기반으로 40초 분량의 쇼츠 대본을 자동 작성합니다. Hook(3초) → Feature(20초) → Review(10초) → CTA(5초) 구조를 따릅니다.",
    tech: ["Claude API", "프롬프트 엔지니어링"],
    command: "npm run script",
    output: "out/scripts/{product-id}.json",
  },
  {
    number: 3,
    icon: "🔊",
    title: "TTS 음성 합성",
    description:
      "생성된 스크립트를 자연스러운 한국어 음성으로 변환합니다. 쇼츠에 적합한 빠른 템포와 감정 톤을 적용합니다.",
    tech: ["TTS API", "음성 후처리"],
    command: "npm run tts",
    output: "out/tts/{product-id}.mp3",
  },
  {
    number: 4,
    icon: "🎬",
    title: "Remotion 영상 렌더링",
    description:
      "React 기반 Remotion 프레임워크로 1080x1920 (9:16) 해상도의 쇼츠 영상을 렌더링합니다. 상품 이미지, 가격 태그, 자막, CTA가 자동으로 합성됩니다.",
    tech: ["Remotion 4.x", "React", "FFmpeg"],
    command: "npm run render-video",
    output: "out/videos/{product-id}.mp4",
  },
  {
    number: 5,
    icon: "📤",
    title: "자동 업로드",
    description:
      "렌더링된 영상을 YouTube Shorts와 Instagram Reels에 자동으로 업로드합니다. 제목, 설명, 태그, 쿠팡 링크가 자동 포함됩니다.",
    tech: ["YouTube Data API v3", "Instagram Graph API"],
    command: "npm run upload",
    output: "업로드 URL 반환",
  },
  {
    number: 6,
    icon: "📊",
    title: "성과 분석",
    description:
      "업로드된 영상의 조회수, 클릭률, 쿠팡 전환율을 추적합니다. 어떤 상품과 스크립트 스타일이 효과적인지 데이터 기반으로 분석합니다.",
    tech: ["YouTube Analytics API", "쿠팡파트너스 리포트"],
    command: "자동 수집",
    output: "대시보드 시각화",
  },
];

export default function PipelinePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-2 text-2xl font-bold">파이프라인 구조</h1>
        <p className="text-gray-400">
          상품 발굴부터 업로드까지 6단계 자동화 파이프라인
        </p>
      </section>

      {/* Full pipeline command */}
      <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
        <div className="mb-2 text-sm text-gray-400">전체 파이프라인 실행</div>
        <code className="text-sm text-green-400">npm run pipeline</code>
        <span className="ml-3 text-xs text-gray-500">
          (--dry-run 으로 테스트 가능)
        </span>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="rounded-xl border border-gray-800 bg-gray-900 p-6"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-800 text-xl">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  <span className="mr-2 text-blue-400">
                    {String(step.number).padStart(2, "0")}
                  </span>
                  {step.title}
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>

            <div className="ml-14 grid gap-3 sm:grid-cols-3">
              <div>
                <div className="mb-1 text-xs text-gray-500">기술 스택</div>
                <div className="flex flex-wrap gap-1">
                  {step.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">명령어</div>
                <code className="text-xs text-green-400">{step.command}</code>
              </div>
              <div>
                <div className="mb-1 text-xs text-gray-500">출력</div>
                <code className="text-xs text-gray-400">{step.output}</code>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="ml-14 mt-4 flex justify-center">
                <div className="h-4 w-px bg-gray-700" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Spec */}
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="mb-3 text-lg font-semibold">영상 스펙</h2>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            { label: "해상도", value: "1080 x 1920 (9:16)" },
            { label: "FPS", value: "30fps" },
            { label: "길이", value: "40초" },
            { label: "프레임", value: "1,200 frames" },
          ].map((spec) => (
            <div key={spec.label}>
              <div className="text-xs text-gray-500">{spec.label}</div>
              <div className="font-medium">{spec.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
