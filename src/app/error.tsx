"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-4 text-4xl text-yellow-500">!</div>
      <h1 className="mb-2 text-xl font-semibold">오류가 발생했습니다</h1>
      <p className="mb-6 text-gray-400">
        {error.message || "예상치 못한 오류가 발생했습니다."}
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  );
}
