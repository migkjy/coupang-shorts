const pipelineSteps = [
  {
    icon: "🔍",
    title: "트렌딩 발굴",
    desc: "쿠팡파트너스 API로 인기 상품 자동 수집",
    status: "ready" as const,
  },
  {
    icon: "📝",
    title: "스크립트 생성",
    desc: "Claude AI가 쇼츠 대본 자동 작성",
    status: "ready" as const,
  },
  {
    icon: "🔊",
    title: "TTS 생성",
    desc: "자연스러운 한국어 음성 합성",
    status: "ready" as const,
  },
  {
    icon: "🎬",
    title: "영상 렌더링",
    desc: "Remotion으로 9:16 쇼츠 영상 생성",
    status: "ready" as const,
  },
  {
    icon: "📤",
    title: "업로드",
    desc: "YouTube / Instagram 자동 업로드",
    status: "pending" as const,
  },
  {
    icon: "📊",
    title: "성과 분석",
    desc: "조회수, 클릭률, 수익 추적",
    status: "pending" as const,
  },
];

const recentVideos = [
  {
    id: 1,
    title: "에어팟 프로 2 — 이 가격 실화?",
    product: "Apple 에어팟 프로 2세대",
    createdAt: "2026-03-07",
    status: "rendered",
  },
  {
    id: 2,
    title: "다이슨 에어랩 완벽 리뷰",
    product: "다이슨 에어랩 멀티스타일러",
    createdAt: "2026-03-06",
    status: "rendered",
  },
  {
    id: 3,
    title: "삼성 갤럭시 S26 울트라 개봉기",
    product: "삼성 갤럭시 S26 Ultra",
    createdAt: "2026-03-05",
    status: "draft",
  },
];

const statusColor = {
  ready: "bg-green-900/50 text-green-400 border-green-800",
  pending: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
  error: "bg-red-900/50 text-red-400 border-red-800",
};

const statusLabel = {
  ready: "준비됨",
  pending: "준비중",
  error: "오류",
};

const videoStatusLabel: Record<string, string> = {
  rendered: "렌더 완료",
  draft: "초안",
  uploaded: "업로드됨",
};

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-8">
        <h1 className="mb-2 text-3xl font-bold">
          쿠팡파트너스 쇼츠 자동화
        </h1>
        <p className="mb-6 text-gray-400">
          트렌딩 상품 발굴부터 영상 생성, 업로드까지 — AI 기반 완전 자동
          파이프라인
        </p>
        <div className="flex gap-4">
          <a
            href="/pipeline"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            파이프라인 보기
          </a>
          <a
            href="/demo"
            className="rounded-lg border border-gray-700 px-5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            데모 미리보기
          </a>
        </div>
      </section>

      {/* Pipeline Overview */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">파이프라인 현황</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {pipelineSteps.map((step, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-800 bg-gray-900 p-4 text-center"
            >
              <div className="mb-2 text-2xl">{step.icon}</div>
              <div className="mb-1 text-sm font-medium">{step.title}</div>
              <span
                className={`inline-block rounded-full border px-2 py-0.5 text-xs ${statusColor[step.status]}`}
              >
                {statusLabel[step.status]}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Videos */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">최근 생성 영상</h2>
        <div className="overflow-hidden rounded-lg border border-gray-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-800 bg-gray-900 text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">상품</th>
                <th className="px-4 py-3 font-medium">생성일</th>
                <th className="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {recentVideos.map((v) => (
                <tr key={v.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3 font-medium">{v.title}</td>
                  <td className="px-4 py-3 text-gray-400">{v.product}</td>
                  <td className="px-4 py-3 text-gray-400">{v.createdAt}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        v.status === "rendered"
                          ? "bg-green-900/50 text-green-400"
                          : "bg-gray-800 text-gray-400"
                      }`}
                    >
                      {videoStatusLabel[v.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Settings Status */}
      <section>
        <h2 className="mb-4 text-xl font-semibold">설정 현황</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: "쿠팡파트너스 API", connected: false },
            { name: "Claude AI (스크립트)", connected: false },
            { name: "YouTube API", connected: false },
            { name: "TTS 엔진", connected: false },
          ].map((api) => (
            <div
              key={api.name}
              className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 px-4 py-3"
            >
              <span className="text-sm">{api.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  api.connected
                    ? "bg-green-900/50 text-green-400"
                    : "bg-red-900/50 text-red-400"
                }`}
              >
                {api.connected ? "연결됨" : "미연결"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
