"use client";

import { useState, useMemo } from "react";
import { sampleLogs, type PipelineLog } from "./data";

type StatusFilter = "all" | "success" | "failed" | "processing";
type SortOrder = "newest" | "oldest";

const STATUS_COLORS: Record<PipelineLog["status"], string> = {
  success: "bg-green-900/50 text-green-400 border-green-800",
  failed: "bg-red-900/50 text-red-400 border-red-800",
  processing: "bg-yellow-900/50 text-yellow-400 border-yellow-800",
};

const STATUS_LABELS: Record<PipelineLog["status"], string> = {
  success: "성공",
  failed: "실패",
  processing: "진행중",
};

const STAGE_LABELS: Record<PipelineLog["stage"], string> = {
  fetch: "상품 수집",
  script: "스크립트",
  render: "렌더링",
  upload: "업로드",
  complete: "완료",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, "0");
  const mins = d.getMinutes().toString().padStart(2, "0");
  return `${month}/${day} ${hours}:${mins}`;
}

function formatRevenue(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

// --- Chart Components (pure SVG) ---

function DailyRunsChart({ logs }: { logs: PipelineLog[] }) {
  const days = useMemo(() => {
    const result: { date: string; success: number; failed: number }[] = [];
    const now = new Date("2026-03-08T23:59:59Z");
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLogs = logs.filter((l) => l.startedAt.slice(0, 10) === dateStr);
      result.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        success: dayLogs.filter((l) => l.status === "success").length,
        failed: dayLogs.filter((l) => l.status !== "success").length,
      });
    }
    return result;
  }, [logs]);

  const maxVal = Math.max(1, ...days.map((d) => d.success + d.failed));
  const barWidth = 28;
  const gap = 8;
  const chartWidth = days.length * (barWidth + gap);
  const chartHeight = 120;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-300">
        일별 실행 건수 (최근 14일)
      </h3>
      <div className="overflow-x-auto">
        <svg
          width={chartWidth + 20}
          height={chartHeight + 30}
          className="min-w-full"
        >
          {days.map((day, i) => {
            const x = i * (barWidth + gap) + 10;
            const totalH =
              ((day.success + day.failed) / maxVal) * chartHeight;
            const successH = (day.success / maxVal) * chartHeight;
            const failedH = totalH - successH;
            return (
              <g key={day.date}>
                {/* failed bar (top) */}
                {failedH > 0 && (
                  <rect
                    x={x}
                    y={chartHeight - totalH}
                    width={barWidth}
                    height={failedH}
                    rx={3}
                    className="fill-red-500/70"
                  />
                )}
                {/* success bar (bottom) */}
                {successH > 0 && (
                  <rect
                    x={x}
                    y={chartHeight - successH}
                    width={barWidth}
                    height={successH}
                    rx={3}
                    className="fill-green-500/70"
                  />
                )}
                {/* count label */}
                {totalH > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - totalH - 4}
                    textAnchor="middle"
                    className="fill-gray-400 text-[10px]"
                  >
                    {day.success + day.failed}
                  </text>
                )}
                {/* date label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  className="fill-gray-500 text-[10px]"
                >
                  {day.date}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-green-500/70" />
          성공
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-red-500/70" />
          실패
        </span>
      </div>
    </div>
  );
}

function StageFailureChart({ logs }: { logs: PipelineLog[] }) {
  const stages: PipelineLog["stage"][] = [
    "fetch",
    "script",
    "render",
    "upload",
  ];
  const failedLogs = logs.filter((l) => l.status === "failed");
  const data = stages.map((stage) => ({
    stage,
    label: STAGE_LABELS[stage],
    count: failedLogs.filter((l) => l.stage === stage).length,
  }));
  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-300">
        스테이지별 실패 건수
      </h3>
      <div className="space-y-3">
        {data.map((d) => (
          <div key={d.stage} className="flex items-center gap-3">
            <span className="w-16 text-xs text-gray-400">{d.label}</span>
            <div className="h-5 flex-1 rounded-full bg-gray-800">
              <div
                className="flex h-full items-center rounded-full bg-red-500/60 px-2 text-[10px] text-red-200 transition-all"
                style={{
                  width: `${Math.max(
                    d.count > 0 ? 10 : 0,
                    (d.count / maxCount) * 100
                  )}%`,
                }}
              >
                {d.count > 0 ? `${d.count}건` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart({ logs }: { logs: PipelineLog[] }) {
  const days = useMemo(() => {
    const result: { date: string; revenue: number }[] = [];
    const now = new Date("2026-03-08T23:59:59Z");
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayRevenue = logs
        .filter(
          (l) =>
            l.startedAt.slice(0, 10) === dateStr && l.estimatedRevenue
        )
        .reduce((sum, l) => sum + (l.estimatedRevenue ?? 0), 0);
      result.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        revenue: dayRevenue,
      });
    }
    return result;
  }, [logs]);

  const maxRev = Math.max(1, ...days.map((d) => d.revenue));
  const chartWidth = 500;
  const chartHeight = 120;
  const padding = 10;
  const stepX = (chartWidth - padding * 2) / (days.length - 1);

  const points = days
    .map((d, i) => {
      const x = padding + i * stepX;
      const y =
        chartHeight - padding - (d.revenue / maxRev) * (chartHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${chartHeight - padding} ${points} ${
    padding + (days.length - 1) * stepX
  },${chartHeight - padding}`;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h3 className="mb-3 text-sm font-semibold text-gray-300">
        일별 예상 수익 추이
      </h3>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
          className="w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* area fill */}
          <polygon points={areaPoints} className="fill-blue-500/10" />
          {/* line */}
          <polyline
            points={points}
            fill="none"
            className="stroke-blue-400"
            strokeWidth="2"
          />
          {/* dots & labels */}
          {days.map((d, i) => {
            const x = padding + i * stepX;
            const y =
              chartHeight -
              padding -
              (d.revenue / maxRev) * (chartHeight - padding * 2);
            return (
              <g key={d.date}>
                {d.revenue > 0 && (
                  <>
                    <circle cx={x} cy={y} r={3} className="fill-blue-400" />
                    <text
                      x={x}
                      y={y - 8}
                      textAnchor="middle"
                      className="fill-blue-300 text-[9px]"
                    >
                      {(d.revenue / 1000).toFixed(1)}k
                    </text>
                  </>
                )}
                {i % 2 === 0 && (
                  <text
                    x={x}
                    y={chartHeight + 12}
                    textAnchor="middle"
                    className="fill-gray-500 text-[9px]"
                  >
                    {d.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// --- Main Page ---

export default function LogsDashboardPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [search, setSearch] = useState("");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const logs = sampleLogs;

  const filtered = useMemo(() => {
    let result = [...logs];
    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((l) => l.productName.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      const da = new Date(a.startedAt).getTime();
      const db = new Date(b.startedAt).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
    return result;
  }, [logs, statusFilter, sortOrder, search]);

  // Summary stats
  const totalRuns = logs.length;
  const successCount = logs.filter((l) => l.status === "success").length;
  const successRate =
    totalRuns > 0 ? ((successCount / totalRuns) * 100).toFixed(0) : "0";
  const totalRevenue = logs.reduce(
    (sum, l) => sum + (l.estimatedRevenue ?? 0),
    0
  );
  const lastRun = logs.reduce((latest, l) => {
    return new Date(l.startedAt) > new Date(latest.startedAt) ? l : latest;
  }, logs[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">실행 로그</h1>
        <p className="text-sm text-gray-400">
          파이프라인 실행 이력 및 성과 추적
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label="총 실행"
          value={`${totalRuns}회`}
          color="text-white"
        />
        <SummaryCard
          label="성공률"
          value={`${successRate}%`}
          color="text-green-400"
        />
        <SummaryCard
          label="총 예상 수익"
          value={formatRevenue(totalRevenue)}
          color="text-blue-400"
        />
        <SummaryCard
          label="최근 실행"
          value={formatDate(lastRun.startedAt)}
          color="text-gray-300"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <DailyRunsChart logs={logs} />
        <RevenueChart logs={logs} />
      </div>
      <StageFailureChart logs={logs} />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="상품명 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-blue-500"
        />
        <div className="flex gap-2">
          {(["all", "success", "failed", "processing"] as StatusFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {s === "all"
                  ? "전체"
                  : s === "success"
                  ? "성공"
                  : s === "failed"
                  ? "실패"
                  : "진행중"}
              </button>
            )
          )}
        </div>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-gray-300 outline-none"
        >
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {/* Log Table (desktop) / Cards (mobile) */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-12 text-center">
          <p className="text-gray-500">검색 결과가 없습니다</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-800 sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-900/50 text-left text-xs text-gray-500">
                  <th className="px-4 py-3">날짜</th>
                  <th className="px-4 py-3">상품명</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">단계</th>
                  <th className="px-4 py-3">소요시간</th>
                  <th className="px-4 py-3 text-right">수익</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="cursor-pointer border-b border-gray-800/50 transition hover:bg-gray-900/80"
                    onClick={() =>
                      setExpandedLog(
                        expandedLog === log.id ? null : log.id
                      )
                    }
                  >
                    <td className="px-4 py-3 text-gray-400">
                      {formatDate(log.startedAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {log.productName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-xs ${
                          STATUS_COLORS[log.status]
                        }`}
                      >
                        {STATUS_LABELS[log.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {STAGE_LABELS[log.stage]}
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {log.duration ? formatDuration(log.duration) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-300">
                      {log.estimatedRevenue
                        ? formatRevenue(log.estimatedRevenue)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded error detail (desktop) */}
          {expandedLog && (
            <ErrorDetail
              log={logs.find((l) => l.id === expandedLog)}
              onClose={() => setExpandedLog(null)}
            />
          )}

          {/* Mobile cards */}
          <div className="space-y-3 sm:hidden">
            {filtered.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-4"
                onClick={() =>
                  setExpandedLog(expandedLog === log.id ? null : log.id)
                }
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-sm font-medium">
                    {log.productName}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      STATUS_COLORS[log.status]
                    }`}
                  >
                    {STATUS_LABELS[log.status]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <div>
                    <span className="text-gray-600">날짜: </span>
                    {formatDate(log.startedAt)}
                  </div>
                  <div>
                    <span className="text-gray-600">단계: </span>
                    {STAGE_LABELS[log.stage]}
                  </div>
                  <div>
                    <span className="text-gray-600">소요: </span>
                    {log.duration ? formatDuration(log.duration) : "-"}
                  </div>
                  <div>
                    <span className="text-gray-600">수익: </span>
                    {log.estimatedRevenue
                      ? formatRevenue(log.estimatedRevenue)
                      : "-"}
                  </div>
                </div>
                {expandedLog === log.id && log.error && (
                  <div className="mt-3 rounded-lg bg-red-900/20 p-3 text-xs text-red-400">
                    {log.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ErrorDetail({
  log,
  onClose,
}: {
  log: PipelineLog | undefined;
  onClose: () => void;
}) {
  if (!log || !log.error) return null;
  return (
    <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-red-400">
          에러 상세 - {log.productName}
        </h4>
        <button
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          닫기
        </button>
      </div>
      <div className="space-y-1 text-xs">
        <div>
          <span className="text-gray-500">실패 단계: </span>
          <span className="text-red-300">{STAGE_LABELS[log.stage]}</span>
        </div>
        <div>
          <span className="text-gray-500">발생 시간: </span>
          <span className="text-gray-300">{formatDate(log.startedAt)}</span>
        </div>
        <div className="mt-2 rounded-lg bg-gray-900 p-3 font-mono text-red-400">
          {log.error}
        </div>
      </div>
    </div>
  );
}
